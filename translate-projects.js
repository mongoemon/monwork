/**
 * translate-projects.js
 * เพิ่ม _TH columns ใน Project sheet
 * เพิ่มได้ทีละ project โดยใส่ข้อมูลใน translations object ด้านล่าง
 */
const XLSX = require('./node_modules/xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Project'], { defval: '', raw: false });

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

let updated = 0;
rows.forEach(row => {
    const name = row['Project name'];
    if (translations[name]) {
        Object.assign(row, translations[name]);
        updated++;
        console.log(`✓  ${name}`);
    }
});

wb.Sheets['Project'] = XLSX.utils.json_to_sheet(rows);
XLSX.writeFile(wb, filePath);
console.log(`\n${updated} project(s) updated in data.xlsx`);
