import { state } from './state.js';
import { addCustomPageNavItems, navigate } from './nav.js';
import { escapeHtml, normalizeLines } from './utils.js';

function getConfig() {
    return window.siteConfig || {};
}

function buildCard(row, fields) {
    const title = fields.title ? escapeHtml(row[fields.title] || '') : '';
    const desc  = fields.description
        ? escapeHtml(normalizeLines(row[fields.description] || ''))
        : '';
    const date  = fields.date   ? escapeHtml(row[fields.date]  || '') : '';
    const link  = fields.link   ? row[fields.link] || '' : '';

    return `<div class="project">
        <div class="project-left">
            ${title ? `<h3>${title}</h3>` : ''}
            ${date  ? `<p class="duration">${date}</p>` : ''}
            ${link  ? `<p class="link"><a href="${escapeHtml(link)}" target="_blank" rel="noopener">View →</a></p>` : ''}
            ${desc  ? `<p style="margin-top:8px;white-space:pre-line">${desc}</p>` : ''}
        </div>
    </div>`;
}

function injectSection(cp) {
    const host = document.getElementById('custom-pages-host');
    if (!host || document.getElementById(cp.id)) return;

    const section = document.createElement('section');
    section.id = cp.id;
    section.innerHTML = `
        <div class="container">
            <h2>${escapeHtml(cp.label?.en || cp.id)}</h2>
            <div id="cp-list-${cp.id}" class="projects-list"></div>
        </div>`;
    host.appendChild(section);
}

function renderCustomPageData(cp, rows) {
    const list = document.getElementById(`cp-list-${cp.id}`);
    if (!list) return;
    if (!rows.length) {
        list.innerHTML = '<p style="color:var(--text-muted)">No data found in sheet.</p>';
        return;
    }
    list.innerHTML = rows.map(row => buildCard(row, cp.fields || {})).join('');
}

export function initCustomPages(workbook) {
    const customs = getConfig().customPages || [];
    if (!customs.length) return;

    customs.forEach(cp => {
        if (!cp.id) return;
        injectSection(cp);
    });

    addCustomPageNavItems();

    if (!workbook) return;

    customs.forEach(cp => {
        if (!cp.id || !cp.xlsxSheet) return;
        try {
            const sheet = workbook.Sheets[cp.xlsxSheet];
            if (!sheet) return;
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
            renderCustomPageData(cp, rows);
        } catch (e) {
            console.error(`Custom page "${cp.id}":`, e);
        }
    });
}

export function applyCustomPageLang() {
    const customs = getConfig().customPages || [];
    const lang    = document.documentElement.lang || 'en';

    customs.forEach(cp => {
        if (!cp.id) return;
        const a = document.querySelector(`nav ul a[href="#${cp.id}"]`);
        if (!a) return;
        a.textContent = (lang === 'th' && cp.label?.th) ? cp.label.th : (cp.label?.en || cp.id);
    });
}
