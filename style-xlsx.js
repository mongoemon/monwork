/**
 * style-xlsx.js
 * Applies header styling and fixes line breaks in data.xlsx.
 *
 * Run after editing data.xlsx:
 *   node style-xlsx.js
 *
 * What it does:
 *   - Header row: dark blue background, white bold text, frozen, auto-filter
 *   - Column widths set per sheet
 *   - Normalizes line breaks in all text cells (\r+\n → \n, caps at \n\n)
 *   - Sets wrapText for cells that contain line breaks
 */

const ExcelJS = require('exceljs');
const path = require('path');

const FILE = path.join(__dirname, 'data.xlsx');

// ── Styles ────────────────────────────────────────────────────────────────────

const HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5597' } };
const HEADER_FONT = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11, name: 'Calibri' };
const HEADER_ALIGN = { vertical: 'middle', horizontal: 'center', wrapText: true };
const HEADER_BORDER = { bottom: { style: 'medium', color: { argb: 'FF1E3A6E' } } };

// ── Column widths (characters) per sheet ──────────────────────────────────────

const COL_WIDTHS = {
    Profile: {
        Name: 25, Title: 35, Intro: 60, Bio: 60,
        Photo_URL: 40, Location: 22,
        Title_TH: 35, Intro_TH: 60, Bio_TH: 60, Location_TH: 22, Name_TH: 25,
    },
    Skills: {
        Skill_Name: 28, Category: 22, Level: 8,
        Skill_Name_TH: 28, Category_TH: 22,
    },
    Project: {
        'Order ID': 8, 'Project name': 32, 'Project URL': 40, Duration: 22,
        'Project overview': 55, 'Roles and Responsibility': 55,
        'Skills and Tools': 40, 'Column 1': 15,
        Image_Folder: 22, YouTube: 40,
        'Project name_TH': 32, 'Project overview_TH': 55,
        'Roles and Responsibility_TH': 55, Project_Category: 15,
    },
    Contact: {
        Email: 30, Phone: 18, LinkedIn_URL: 45, GitHub_URL: 40,
    },
    Experience: {
        Company: 30, Role: 30, Period: 22,
        Description: 60, Role_TH: 30, Description_TH: 60,
    },
    Education: {
        Institution: 50, Degree: 55, Period: 18,
    },
    Certifications: {
        Name: 50, Issuer: 25, Year: 8,
    },
    Awards: {
        Title: 35, Project: 30, Year: 8, Place: 20,
    },
    Tools: {
        Tool_Name: 30, Category: 28,
    },
    Playground: {
        'Project name': 32, 'Project name_TH': 32, Duration: 22, 'Project URL': 40,
        'Project overview': 55, 'Project overview_TH': 55,
        'Roles and Responsibility': 55, 'Skills and Tools': 40,
        Image_Folder: 22, YouTube: 40,
    },
};

// ── Line break normalizer ─────────────────────────────────────────────────────

function normalizeText(val) {
    if (typeof val !== 'string') return val;
    return val
        .replace(/\\n/g, '\n')         // literal \n text → real newline
        .replace(/\r+\n/g, '\n')       // CR(s) + LF → single LF
        .replace(/\r+/g, '\n')         // bare CRs → LF
        .replace(/\n{3,}/g, '\n\n')    // cap at double newline
        .replace(/[^\S\n]+$/gm, '')    // trim trailing spaces per line
        .trim();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE);

    let totalFixed = 0;

    wb.worksheets.forEach(ws => {
        const sheetName = ws.name;
        const widths = COL_WIDTHS[sheetName] || {};

        // ── Header row (row 1) ────────────────────────────────────────────────
        const headerRow = ws.getRow(1);
        headerRow.height = 28;

        headerRow.eachCell({ includeEmpty: false }, cell => {
            cell.fill = HEADER_FILL;
            cell.font = HEADER_FONT;
            cell.alignment = HEADER_ALIGN;
            cell.border = HEADER_BORDER;
        });
        headerRow.commit();

        // ── Column widths ─────────────────────────────────────────────────────
        ws.columns.forEach((col, idx) => {
            const headerCell = ws.getRow(1).getCell(idx + 1);
            const headerName = headerCell.value;
            const w = widths[headerName];
            if (w) col.width = w;
            else col.width = 18; // default
        });

        // ── Freeze header row ────────────────────────────────────────────────
        ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'A2' }];

        // ── Auto-filter on header row ────────────────────────────────────────
        const lastCol = ws.columnCount;
        const lastRow = ws.rowCount;
        if (lastCol > 0) {
            ws.autoFilter = {
                from: { row: 1, column: 1 },
                to:   { row: 1, column: lastCol },
            };
        }

        // ── Data rows: normalize line breaks + wrapText ───────────────────────
        for (let r = 2; r <= lastRow; r++) {
            const row = ws.getRow(r);
            let rowHasWrap = false;

            row.eachCell({ includeEmpty: false }, cell => {
                if (typeof cell.value !== 'string') return;

                const original = cell.value;
                const normalized = normalizeText(original);

                if (normalized !== original) {
                    cell.value = normalized;
                    totalFixed++;
                }

                if (normalized.includes('\n')) {
                    if (!cell.alignment) cell.alignment = {};
                    cell.alignment = { ...cell.alignment, wrapText: true, vertical: 'top' };
                    rowHasWrap = true;
                }
            });

            // Give wrapped rows enough height to show ~3 lines by default
            if (rowHasWrap && (!row.height || row.height < 48)) {
                row.height = 48;
            }

            row.commit();
        }

        console.log(`  ${sheetName}: ${lastRow - 1} data row(s), styled`);
    });

    // Write to temp file first, then replace — handles the case where Excel has data.xlsx open
    const TEMP = FILE.replace('.xlsx', '.tmp.xlsx');
    await wb.xlsx.writeFile(TEMP);

    const fs = require('fs');
    try {
        fs.renameSync(TEMP, FILE);
        console.log(`\n✓ ${totalFixed} cell(s) normalized`);
        console.log(`✓ Saved → ${FILE}`);
    } catch (e) {
        if (e.code === 'EBUSY' || e.code === 'EPERM') {
            console.log(`\n✓ ${totalFixed} cell(s) normalized`);
            console.log(`⚠  data.xlsx is open in Excel — close Excel, then run:`);
            console.log(`   copy /Y data.tmp.xlsx data.xlsx  (Windows)`);
            console.log(`   # or just rename data.tmp.xlsx to data.xlsx in File Explorer`);
        } else {
            fs.unlinkSync(TEMP);
            throw e;
        }
    }
}

run().catch(err => { console.error(err); process.exit(1); });
