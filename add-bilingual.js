/**
 * add-bilingual.js
 * เพิ่มคอลัมน์ภาษาไทยใน Profile และ Skills sheet โดยเขียนเซลล์ตรงๆ
 * (ป้องกัน line break ใน cell เดิมหาย)
 *
 * วิธีใช้: node add-bilingual.js
 */
const XLSX = require('./node_modules/xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);

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

function getHeaders(ws) {
    const range = XLSX.utils.decode_range(ws['!ref']);
    const headers = {};
    for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) headers[cell.v] = C;
    }
    return headers;
}

// ── Profile ───────────────────────────────────────────────

writeCells(wb.Sheets['Profile'], 1, {
    Title_TH:    'QA Lead ผู้ผ่านการรับรอง ISTQB',
    Intro_TH:    'QA Lead ที่มีประสบการณ์กว่า 14 ปีในด้านการพัฒนาเกมและการทดสอบซอฟต์แวร์ ได้รับการรับรอง ISTQB CTFL มุ่งมั่นในด้านคุณภาพ การทดสอบอัตโนมัติ และการพัฒนาทีม',
    Bio_TH:      'มีประสบการณ์กว่า 10 ปีในอุตสาหกรรมการพัฒนาเกม ครอบคลุมหลายบทบาท รวมถึง Production Manager และมีประสบการณ์ด้าน Quality Assurance มากกว่า 8 ปี โดยปัจจุบันมุ่งเน้นที่การทดสอบซอฟต์แวร์ แม้ว่าจะทำงานกับโปรเจคซอฟต์แวร์ทั่วไปเป็นหลัก แต่ยังคงมีความหลงใหลในอุตสาหกรรมเกมและมีความเข้าใจอย่างลึกซึ้งในกระบวนการผลิตเกมและแนวปฏิบัติการพัฒนาซอฟต์แวร์สมัยใหม่ รวมถึงกระบวนการ CI/CD\n\nนอกจากความเชี่ยวชาญด้านเทคนิค ยังให้ความสำคัญกับการเป็น Mentor ให้แก่สมาชิกในทีม และยินดีแบ่งปันความรู้เพื่อช่วยให้ทุกคนเติบโต เชื่อในการสร้างทีมที่แข็งแกร่งและสภาพแวดล้อมที่เอื้อต่อการเรียนรู้อย่างต่อเนื่อง ได้รับการรับรอง ISTQB CTFL ตั้งแต่ปี 2019 และ Agile Tester (AT) ในปี 2024',
    Location_TH: 'กรุงเทพมหานคร, ประเทศไทย',
});
console.log('Profile  ✓  Title_TH, Intro_TH, Bio_TH, Location_TH');

// ── Skills ────────────────────────────────────────────────

const skillNameTH = {
    'Management':         'การจัดการ',
    'Manual Testing':     'Manual Testing',
    'Automation Testing': 'Automation Testing',
    'API Testing':        'API Testing',
    'Database Testing':   'Database Testing',
    'Load Testing':       'Load Testing',
    'Programming':        'การเขียนโปรแกรม',
    'Release Control':    'การควบคุม Release',
};

const categoryTH = {
    'QA / Testing': 'QA / การทดสอบ',
    'Development':  'การพัฒนา',
};

const skillsWs = wb.Sheets['Skills'];
const skillsRange = XLSX.utils.decode_range(skillsWs['!ref']);
const skillsHeaders = getHeaders(skillsWs);
const nameCol = skillsHeaders['Skill_Name'];

for (let R = skillsRange.s.r + 1; R <= skillsRange.e.r; R++) {
    const nameCell = skillsWs[XLSX.utils.encode_cell({ r: R, c: nameCol })];
    if (!nameCell) continue;
    const name = String(nameCell.v).trim();

    const catCol = skillsHeaders['Category'];
    const catCell = catCol !== undefined ? skillsWs[XLSX.utils.encode_cell({ r: R, c: catCol })] : null;
    const cat = catCell ? String(catCell.v).trim() : '';

    writeCells(skillsWs, R, {
        Skill_Name_TH: skillNameTH[name] || name,
        Category_TH:   categoryTH[cat]   || cat,
    });
}
console.log('Skills   ✓  Skill_Name_TH, Category_TH');

// ── Save ──────────────────────────────────────────────────

XLSX.writeFile(wb, filePath);
console.log('\ndata.xlsx updated — existing cells untouched');
