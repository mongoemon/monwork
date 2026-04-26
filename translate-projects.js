/**
 * translate-projects.js
 * เพิ่ม _TH columns ใน Project sheet โดยเขียนเซลล์ตรงๆ ไม่ recreate sheet
 * (ป้องกัน line break ใน cell เดิมหาย)
 *
 * วิธีใช้: node translate-projects.js
 */
const XLSX = require('./node_modules/xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);

// key = ชื่อ project (ตรงกับ "Project name" ใน xlsx)
const translations = {
    'Lotus': {
        'Project name_TH': 'โลตัส',
        'Project overview_TH':
            'โลตัสเป็นเชนค้าปลีกรายใหญ่ในประเทศไทย เดิมรู้จักกันในชื่อเทสโก้ โลตัส มีรูปแบบร้านค้าหลากหลาย ทั้งไฮเปอร์มาร์เก็ต ซุปเปอร์มาร์เก็ต และร้านสะดวกซื้อ Lotus\'s Web (Lotus\'s Shop Online) คือแพลตฟอร์มช้อปปิ้งออนไลน์อย่างเป็นทางการ ให้ลูกค้าสั่งซื้อสินค้าอุปโภคบริโภคผ่านเว็บไซต์หรือแอปพลิเคชันมือถือได้',
        'Roles and Responsibility_TH':
            '• จัดการระบบสินค้าและสต็อกให้ตรงตามความต้องการ\n' +
            '• จัดทำ Test Plan ออกแบบและดำเนินการ Test Case\n' +
            '• ถ่ายทอดความรู้และจัดทำเอกสารสำหรับทีม\n' +
            '• ประสานงานระหว่างทีมและสืบสวนหาสาเหตุของปัญหา',
    },
};

// ── Safe cell-level writer ────────────────────────────────

function writeCells(ws, rowIndex, fields) {
    const range = XLSX.utils.decode_range(ws['!ref']);

    // Read existing headers
    const headers = {};
    for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) headers[cell.v] = C;
    }

    Object.entries(fields).forEach(([col, value]) => {
        // Add header column if not exists
        if (headers[col] === undefined) {
            range.e.c++;
            headers[col] = range.e.c;
            ws[XLSX.utils.encode_cell({ r: 0, c: range.e.c })] = { v: col, t: 's' };
        }
        ws[XLSX.utils.encode_cell({ r: rowIndex, c: headers[col] })] = { v: value, t: 's' };
    });

    ws['!ref'] = XLSX.utils.encode_range(range);
}

// ── Main ──────────────────────────────────────────────────

const ws = wb.Sheets['Project'];
const range = XLSX.utils.decode_range(ws['!ref']);

// Find "Project name" column index
let nameCol = -1;
for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell && cell.v === 'Project name') { nameCol = C; break; }
}
if (nameCol === -1) { console.error('Column "Project name" not found'); process.exit(1); }

let updated = 0;
for (let R = range.s.r + 1; R <= range.e.r; R++) {
    const nameCell = ws[XLSX.utils.encode_cell({ r: R, c: nameCol })];
    if (!nameCell) continue;
    const name = String(nameCell.v).trim();
    if (translations[name]) {
        writeCells(ws, R, translations[name]);
        updated++;
        console.log(`✓  ${name}`);
    }
}

XLSX.writeFile(wb, filePath);
console.log(`\n${updated} project(s) updated — existing cells untouched`);
