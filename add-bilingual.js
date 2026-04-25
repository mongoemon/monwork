const XLSX = require('./node_modules/xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'data.xlsx');
const wb = XLSX.readFile(filePath);

function updateSheet(wb, name, data) {
    wb.Sheets[name] = XLSX.utils.json_to_sheet(data);
}

// ── Profile ───────────────────────────────────────────────
const profileData = XLSX.utils.sheet_to_json(wb.Sheets['Profile'], { defval: '', raw: false });

Object.assign(profileData[0], {
    Title_TH: 'QA Lead ผู้ผ่านการรับรอง ISTQB',
    Intro_TH: 'QA Lead ที่มีประสบการณ์กว่า 14 ปีในด้านการพัฒนาเกมและการทดสอบซอฟต์แวร์ ได้รับการรับรอง ISTQB CTFL มุ่งมั่นในด้านคุณภาพ การทดสอบอัตโนมัติ และการพัฒนาทีม',
    Bio_TH: 'มีประสบการณ์กว่า 10 ปีในอุตสาหกรรมการพัฒนาเกม ครอบคลุมหลายบทบาท รวมถึง Production Manager และมีประสบการณ์ด้าน Quality Assurance มากกว่า 8 ปี โดยปัจจุบันมุ่งเน้นที่การทดสอบซอฟต์แวร์ แม้ว่าจะทำงานกับโปรเจคซอฟต์แวร์ทั่วไปเป็นหลัก แต่ยังคงมีความหลงใหลในอุตสาหกรรมเกมและมีความเข้าใจอย่างลึกซึ้งในกระบวนการผลิตเกมและแนวปฏิบัติการพัฒนาซอฟต์แวร์สมัยใหม่ รวมถึงกระบวนการ CI/CD\n\nนอกจากความเชี่ยวชาญด้านเทคนิค ยังให้ความสำคัญกับการเป็น Mentor ให้แก่สมาชิกในทีม และยินดีแบ่งปันความรู้เพื่อช่วยให้ทุกคนเติบโต เชื่อในการสร้างทีมที่แข็งแกร่งและสภาพแวดล้อมที่เอื้อต่อการเรียนรู้อย่างต่อเนื่อง ได้รับการรับรอง ISTQB CTFL ตั้งแต่ปี 2019 และ Agile Tester (AT) ในปี 2024',
    Location_TH: 'กรุงเทพมหานคร, ประเทศไทย',
});

updateSheet(wb, 'Profile', profileData);
console.log('Profile  ✓  added: Title_TH, Intro_TH, Bio_TH, Location_TH');

// ── Skills ────────────────────────────────────────────────
const skillsData = XLSX.utils.sheet_to_json(wb.Sheets['Skills'], { defval: '', raw: false });

const skillNameTH = {
    'Management':        'การจัดการ',
    'Manual Testing':    'Manual Testing',
    'Automation Testing':'Automation Testing',
    'API Testing':       'API Testing',
    'Database Testing':  'Database Testing',
    'Load Testing':      'Load Testing',
    'Programming':       'การเขียนโปรแกรม',
    'Release Control':   'การควบคุม Release',
};

const categoryTH = {
    'QA / Testing': 'QA / การทดสอบ',
    'Development':  'การพัฒนา',
};

skillsData.forEach(s => {
    s.Skill_Name_TH = skillNameTH[s.Skill_Name] || s.Skill_Name;
    s.Category_TH   = categoryTH[s.Category]    || s.Category;
});

updateSheet(wb, 'Skills', skillsData);
console.log('Skills   ✓  added: Skill_Name_TH, Category_TH');

XLSX.writeFile(wb, filePath);
console.log('\ndata.xlsx updated successfully.');
