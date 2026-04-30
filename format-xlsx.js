/**
 * format-xlsx.js
 * Normalizes line breaks in all text cells of data.xlsx.
 *
 * Run after editing data.xlsx to fix broken line breaks:
 *   node format-xlsx.js
 *
 * What it fixes:
 *   - Excel \r\r\r\n artifacts (multiple CR before LF) → single \n
 *   - Bare carriage returns (\r) → \n
 *   - Literal two-char "\n" text → real newline
 *   - 3+ consecutive newlines → capped at 2 (paragraph break)
 *   - Trailing whitespace on each line
 *   - Enables wrapText in Excel so line breaks are visible in the spreadsheet
 */

const XLSX = require('xlsx');
const path = require('path');

const FILE = path.join(__dirname, 'data.xlsx');

function normalizeCell(val) {
    if (typeof val !== 'string') return val;
    return val
        .replace(/\\n/g, '\n')        // literal backslash-n text → real newline
        .replace(/\r+\n/g, '\n')      // CR(s) + LF → single LF
        .replace(/\r+/g, '\n')        // bare CRs → LF
        .replace(/\n{3,}/g, '\n\n')   // cap at two consecutive newlines
        .replace(/[^\S\n]+$/gm, '')   // trim trailing spaces on each line
        .trim();
}

const wb = XLSX.readFile(FILE, { cellStyles: true });
let changed = 0;

wb.SheetNames.forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    Object.keys(ws).forEach(addr => {
        if (addr[0] === '!') return;
        const cell = ws[addr];
        if (!cell || (cell.t !== 's' && cell.t !== 'str')) return;

        const original = cell.v;
        const normalized = normalizeCell(original);

        if (normalized !== original) {
            cell.v = normalized;
            delete cell.w; // remove cached formatted value so XLSX recomputes it
            changed++;
            console.log(`  ${sheetName}!${addr}: fixed`);
        }

        // Enable wrapText so Excel shows line breaks visually
        if (typeof cell.v === 'string' && cell.v.includes('\n')) {
            if (!cell.s) cell.s = {};
            if (!cell.s.alignment) cell.s.alignment = {};
            cell.s.alignment.wrapText = true;
        }
    });
});

XLSX.writeFile(wb, FILE, { cellStyles: true });
console.log(`\n✓ ${changed} cell(s) updated → ${FILE}`);
if (changed === 0) console.log('  (all cells already clean)');
