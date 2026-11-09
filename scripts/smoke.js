#!/usr/bin/env node
/*
 * Smoke test: confirms the site can be opened and boots without broken pieces.
 *
 *   node scripts/smoke.js                      # serve ./public locally and test it
 *   node scripts/smoke.js https://site/ --wait # test a live deploy; first wait until
 *                                              # it serves the same files as ./public
 *   SMOKE_BASE_URL=https://site/ node scripts/smoke.js
 */
const fs = require('fs');
const http = require('http');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const WAIT_TIMEOUT_MS = 10 * 60 * 1000;
const WAIT_INTERVAL_MS = 10 * 1000;
const FETCH_TIMEOUT_MS = 20 * 1000;
const MIME = {
    '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
    '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.png': 'image/png', '.jpg': 'image/jpeg',
    '.xlsx': 'application/octet-stream',
};
// Files whose bytes must match ./public before a live deploy is considered "new".
const FINGERPRINT_FILES = ['index.html', 'style.css', 'config.js', 'data.js', 'js/main.js'];

const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function check(name, fn) {
    try {
        await fn();
        results.push({ name, ok: true });
        console.log(`  ok   ${name}`);
    } catch (e) {
        results.push({ name, ok: false, error: e.message });
        console.log(`  FAIL ${name}\n         ${e.message}`);
    }
}
function assert(cond, msg) { if (!cond) throw new Error(msg); }

function startLocalServer() {
    const root = path.resolve(PUBLIC_DIR);
    const server = http.createServer((req, res) => {
        const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        const file = path.resolve(root, '.' + (rel.endsWith('/') ? rel + 'index.html' : rel));
        if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            res.writeHead(404);
            return res.end('not found');
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
    });
    return new Promise((resolve) => server.listen(0, '127.0.0.1', () =>
        resolve({ server, base: `http://127.0.0.1:${server.address().port}/` })));
}

async function get(base, rel) {
    const res = await fetch(new URL(rel, base), { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), redirect: 'follow' });
    const body = Buffer.from(await res.arrayBuffer());
    return { status: res.status, headers: res.headers, body };
}

async function getOk(base, rel) {
    const r = await get(base, rel);
    assert(r.status === 200, `GET ${rel || '/'} -> HTTP ${r.status}`);
    assert(r.body.length > 0, `GET ${rel || '/'} -> empty body`);
    return r;
}

// Block until the live site serves the same bytes as ./public (i.e. the new deploy is live).
async function waitForDeploy(base) {
    const deadline = Date.now() + WAIT_TIMEOUT_MS;
    let lastReason = '';
    while (Date.now() < deadline) {
        lastReason = '';
        for (const rel of FINGERPRINT_FILES) {
            try {
                const r = await get(base, rel);
                const local = fs.readFileSync(path.join(PUBLIC_DIR, rel));
                if (r.status !== 200) { lastReason = `${rel} -> HTTP ${r.status}`; break; }
                if (sha(r.body) !== sha(local)) { lastReason = `${rel} differs from this commit`; break; }
            } catch (e) {
                lastReason = `${rel}: ${e.message}`;
                break;
            }
        }
        if (!lastReason) {
            console.log('  new deploy is live');
            return;
        }
        console.log(`  waiting for deploy... (${lastReason})`);
        await sleep(WAIT_INTERVAL_MS);
    }
    throw new Error(`Timed out after ${WAIT_TIMEOUT_MS / 60000} min waiting for deploy: ${lastReason}`);
}

// Collect every module reachable from an ES module entry point via static/dynamic imports.
async function walkModules(base, entry) {
    const seen = new Set();
    const queue = [entry];
    const importRe = /(?:import|export)\s[^'"]*?from\s+['"](\.[^'"]+)['"]|import\(\s*['"](\.[^'"]+)['"]\s*\)/g;
    while (queue.length) {
        const rel = queue.shift();
        if (seen.has(rel)) continue;
        seen.add(rel);
        const { body } = await getOk(base, rel);
        for (const m of body.toString('utf8').matchAll(importRe)) {
            queue.push(path.posix.join(path.posix.dirname(rel), m[1] || m[2]));
        }
    }
    return seen;
}

async function runChecks(base, { remote }) {
    let html = '';

    await check('home page returns 200 HTML', async () => {
        const r = await getOk(base, '');
        assert(/text\/html/.test(r.headers.get('content-type') || ''), `content-type is ${r.headers.get('content-type')}`);
        html = r.body.toString('utf8');
        assert(/<title>[^<]+<\/title>/.test(html), 'missing <title>');
        assert(/<body/.test(html), 'missing <body>');
    });

    await check('JSON-LD structured data parses', async () => {
        const m = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
        assert(m, 'no JSON-LD block');
        JSON.parse(m[1]);
    });

    await check('every local asset referenced by index.html loads', async () => {
        const refs = [...html.matchAll(/\b(?:src|href)="([^"#]+)"/g)]
            .map((m) => m[1])
            .filter((u) => !/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(u));
        assert(refs.length > 0, 'found no local references');
        const bad = [];
        for (const ref of new Set(refs)) {
            const r = await get(base, ref);
            if (r.status !== 200 || r.body.length === 0) bad.push(`${ref} (HTTP ${r.status}, ${r.body.length}B)`);
        }
        assert(bad.length === 0, `broken: ${bad.join(', ')}`);
    });

    await check('JS module graph from js/main.js fully resolves', async () => {
        const mods = await walkModules(base, 'js/main.js');
        assert(mods.size > 1, 'main.js imports nothing');
    });

    await check('config.js and data.js evaluate and expose siteConfig / mockData', async () => {
        const ctx = vm.createContext({ window: {} });
        const cfg = (await getOk(base, 'config.js')).body.toString('utf8');
        const dat = (await getOk(base, 'data.js')).body.toString('utf8');
        vm.runInContext(`${cfg}\nthis.__siteConfig = siteConfig;`, ctx, { timeout: 2000 });
        vm.runInContext(`${dat}\nthis.__mockData = mockData;`, ctx, { timeout: 2000 });
        assert(ctx.__siteConfig && typeof ctx.__siteConfig.pages === 'object', 'siteConfig.pages missing');
        assert(ctx.__mockData && Array.isArray(ctx.__mockData.profile), 'mockData.profile missing');
    });

    await check('images/manifest.json is valid and its first images load', async () => {
        const manifest = JSON.parse((await getOk(base, 'images/manifest.json')).body.toString('utf8'));
        const folders = Object.keys(manifest);
        assert(folders.length > 0, 'manifest is empty');
        for (const folder of folders.slice(0, 3)) {
            assert(manifest[folder].length > 0, `folder "${folder}" lists no images`);
            await getOk(base, `images/${encodeURIComponent(folder)}/${encodeURIComponent(manifest[folder][0])}`);
        }
    });

    // The page fetches data.xlsx at boot; without it the site silently falls back to mock data.
    await check('data.xlsx is served and has a real Profile (not mock data)', async () => {
        const { body } = await getOk(base, 'data.xlsx');
        assert(body.subarray(0, 2).toString() === 'PK', 'data.xlsx is not a valid xlsx (zip) file');
        let XLSX;
        try { XLSX = require('xlsx'); } catch (_) { return; } // devDependency; skip deep check if not installed
        const wb = XLSX.read(body, { type: 'buffer' });
        for (const sheet of ['Profile', 'Project', 'Skills']) {
            assert(wb.SheetNames.includes(sheet), `sheet "${sheet}" missing`);
        }
        const profile = XLSX.utils.sheet_to_json(wb.Sheets.Profile, { defval: '' })[0] || {};
        assert(profile.Name, 'Profile sheet has no Name');
    });

    if (remote) {
        await check('live site sends nosniff header', async () => {
            const r = await getOk(base, '');
            assert((r.headers.get('x-content-type-options') || '').toLowerCase() === 'nosniff',
                'X-Content-Type-Options: nosniff missing (render.yaml headers not applied?)');
        });
    }
}

async function main() {
    const args = process.argv.slice(2);
    const wait = args.includes('--wait');
    const urlArg = args.find((a) => !a.startsWith('--')) || process.env.SMOKE_BASE_URL;
    let local = null;
    let base;
    if (urlArg) {
        base = urlArg.endsWith('/') ? urlArg : `${urlArg}/`;
    } else {
        local = await startLocalServer();
        base = local.base;
    }
    console.log(`Smoke testing ${base}${urlArg ? ' (live)' : ' (local ./public)'}`);

    try {
        if (urlArg && wait) await waitForDeploy(base);
        await runChecks(base, { remote: Boolean(urlArg) });
    } finally {
        if (local) local.server.close();
    }

    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    process.exit(failed.length ? 1 : 0);
}

main().catch((e) => {
    console.error(e.message);
    process.exit(1);
});
