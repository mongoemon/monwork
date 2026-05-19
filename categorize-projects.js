/**
 * categorize-projects.js
 * กำหนด Project_Category ให้โปรเจคทั้งหมด โดยเขียนเซลล์ตรงๆ
 * (ป้องกัน line break ใน cell เดิมหาย)
 *
 * วิธีใช้: node categorize-projects.js
 */
const XLSX = require('./node_modules/xlsx');
const path = require('path');

const categories = {
    Software: [
        'Lotus', 'Manao Meals', 'Seller Center (Office Mate)',
        'PTT Digital', 'True Online Store', '7-11',
        'Curaprox', 'Curaprox Pro', 'Pick', 'Panya',
    ],
    Game: [
        'Linage W', 'Hotel Life: A Resort Simulator', 'Lumen.',
        'City of Games', 'Tint.', 'ImaginMe', 'ImaginMe Beauty and the Beast',
        'ImaginMe Dragons', 'ImaginMe Jungle Book', 'ImaginMe Little Bean',
        'Tesco Lotus Shopping Spree', 'Totem Defender',
        'Mes Comptines for 3DS', 'My First Songs 2 for 3DS',
        'My First Songs for 3DS', 'Lolirock',
        'Meine ersten Mitsing-Lieder for WiiU', 'Mon Premier Karaoké for WiiU',
        'Hummingbird and Ladybug', 'AeternoBlade for 3DS',
        'Deadly Premonition: The Director\'s Cut for Steam',
        'Deadly Premonition: Director\'s Cut for PS3',
        'Wicked Monster BLAST! for PS3', 'Crazy Strike Bowling for PS3',
        'Wicked Monsters Type!', 'B-Units Build It for 3DS & Wii',
        'Wicked Monsters BLAST! for Wii', 'Yuth',
    ],
    'etc.': ['Aliveunited'],
};

const lookup = {};
Object.entries(categories).forEach(([cat, names]) =>
    names.forEach(n => (lookup[n] = cat))
);

// ── Safe cell-level writer ────────────────────────────────

function writeCells(ws, rowIndex, fields) {
    const range = XLSX.utils.decode_range(ws['!ref']);

    const headers = {};
    for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) headers[cell.v] = C;
    }

    Object.entries(fields).forEach(([col, value]) => {
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

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);
const ws = wb.Sheets['Project'];
const range = XLSX.utils.decode_range(ws['!ref']);

let nameCol = -1;
for (let C = range.s.c; C <= range.e.c; C++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
    if (cell && cell.v === 'Project name') { nameCol = C; break; }
}
if (nameCol === -1) { console.error('Column "Project name" not found'); process.exit(1); }

const counts = { Software: 0, Game: 0, 'etc.': 0, unmatched: 0 };

for (let R = range.s.r + 1; R <= range.e.r; R++) {
    const nameCell = ws[XLSX.utils.encode_cell({ r: R, c: nameCol })];
    if (!nameCell) continue;
    const name = String(nameCell.v).trim();
    const cat = lookup[name] || 'etc.';

    writeCells(ws, R, { Project_Category: cat });

    if (lookup[name]) counts[cat]++;
    else { counts.unmatched++; console.log('  unmatched:', name); }
}

XLSX.writeFile(wb, filePath);
console.log('Done — existing cells untouched.', counts);
