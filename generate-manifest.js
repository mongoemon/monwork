const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, 'images');
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;

function naturalSort(a, b) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR);
    console.log('Created images/ folder');
}

const manifest = {};

const entries = fs.readdirSync(IMAGES_DIR);
entries.forEach(entry => {
    const fullPath = path.join(IMAGES_DIR, entry);
    if (!fs.statSync(fullPath).isDirectory()) return;

    const files = fs.readdirSync(fullPath)
        .filter(f => IMAGE_EXTENSIONS.test(f))
        .sort(naturalSort);

    if (files.length > 0) {
        manifest[entry] = files;
        console.log(`  ${entry}: ${files.length} image(s) — ${files.join(', ')}`);
    }
});

const outPath = path.join(IMAGES_DIR, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
console.log(`\nmanifest.json updated (${Object.keys(manifest).length} folders)`);
