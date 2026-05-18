/**
 * update-playground.js
 * Appends new projects to the Playground sheet in data.xlsx.
 *
 *   node update-playground.js
 */

const ExcelJS = require('exceljs');
const path    = require('path');

const FILE = path.join(__dirname, 'data.xlsx');

const NEW_PROJECTS = [
    {
        'Project name':     'Local API Test Server',
        'Project name_TH':  'เซิร์ฟเวอร์ทดสอบ API',
        'Duration':         '2024',
        'Project URL':      'https://github.com/mongoemon/local-api',
        'Project overview':
            'A local mock API server for testing API systems end-to-end. ' +
            'Includes pre-built test suites for both functional verification and performance benchmarking under load.',
        'Project overview_TH':
            'เซิร์ฟเวอร์ API จำลองในเครื่องสำหรับทดสอบระบบ API แบบ end-to-end ' +
            'มีชุดทดสอบสำเร็จรูปสำหรับ functional test และ performance test',
        'Roles and Responsibility':
            '• Built a mock REST API server for local testing\n' +
            '• Wrote test cases covering functional and performance scenarios\n' +
            '• Used as a sandbox for validating API behavior and load testing tools',
        'Skills and Tools': 'Node.js, Express, Postman, k6, REST API',
        'Image_Folder':     '',
        'YouTube':          '',
    },
    {
        'Project name':     'ymdl — Music Downloader',
        'Project name_TH':  'ymdl — สคริปต์ดาวน์โหลดเพลง',
        'Duration':         '2024',
        'Project URL':      'https://github.com/mongoemon/ymdl',
        'Project overview':
            'A command-line utility for downloading music from YouTube. ' +
            'Built for personal use as a fast, no-frills tool that saves tracks locally in the desired audio format.',
        'Project overview_TH':
            'เครื่องมือ command-line สำหรับดาวน์โหลดเพลงจาก YouTube ' +
            'พัฒนาขึ้นเพื่อใช้งานส่วนตัว บันทึกเพลงไว้ในเครื่องในรูปแบบเสียงที่ต้องการ',
        'Roles and Responsibility':
            '• Wrote the downloader script with CLI argument support\n' +
            '• Integrated yt-dlp for audio extraction and format conversion\n' +
            '• Added error handling and progress output',
        'Skills and Tools': 'Python, yt-dlp, CLI',
        'Image_Folder':     '',
        'YouTube':          '',
    },
    {
        'Project name':     'Maestro Mobile Automation',
        'Project name_TH':  'Maestro Mobile Automation',
        'Duration':         '2024',
        'Project URL':      'https://github.com/mongoemon/maestro_automation',
        'Project overview':
            'A mobile UI automation test suite built with Maestro. ' +
            'Covers core user flows on both iOS and Android using a YAML-based test format that is easy to read and maintain.',
        'Project overview_TH':
            'ชุด automation test สำหรับ mobile UI ด้วย Maestro ' +
            'ครอบคลุม user flow หลักบนทั้ง iOS และ Android โดยใช้ YAML-based test ที่อ่านและดูแลรักษาได้ง่าย',
        'Roles and Responsibility':
            '• Wrote test flows for iOS and Android targets using Maestro YAML\n' +
            '• Set up the test runner environment for both platforms\n' +
            '• Documented setup steps and test execution guide',
        'Skills and Tools': 'Maestro, iOS, Android, YAML',
        'Image_Folder':     '',
        'YouTube':          '',
    },
    {
        'Project name':     'WebdriverIO Mobile Automation',
        'Project name_TH':  'WebdriverIO Mobile Automation',
        'Duration':         '2024',
        'Project URL':      'https://github.com/mongoemon/webdriverio_automation',
        'Project overview':
            'A cross-platform mobile automation framework built on WebdriverIO and Appium. ' +
            'Supports both iOS and Android from a shared JavaScript codebase, with separate config files per platform.',
        'Project overview_TH':
            'Framework automation mobile แบบ cross-platform ด้วย WebdriverIO และ Appium ' +
            'รองรับทั้ง iOS และ Android จาก JavaScript codebase เดียว พร้อมไฟล์ config แยกตามแพลตฟอร์ม',
        'Roles and Responsibility':
            '• Configured WebdriverIO project with Appium integration\n' +
            '• Wrote reusable page object models for iOS and Android\n' +
            '• Set up separate wdio.conf files for each platform target',
        'Skills and Tools': 'WebdriverIO, JavaScript, Appium, Node.js, iOS, Android',
        'Image_Folder':     '',
        'YouTube':          '',
    },
];

async function run() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE);

    const ws = wb.getWorksheet('Playground');
    if (!ws) { console.error('Playground sheet not found'); process.exit(1); }

    // Build column index from header row
    const hMap = {};
    ws.getRow(1).eachCell((cell, col) => {
        if (cell.value) hMap[String(cell.value)] = col;
    });

    NEW_PROJECTS.forEach(proj => {
        const row = ws.addRow([]);
        Object.entries(proj).forEach(([col, val]) => {
            if (!hMap[col]) return;
            const cell = row.getCell(hMap[col]);
            cell.value = val;
            if (typeof val === 'string' && val.includes('\n')) {
                cell.alignment = { wrapText: true, vertical: 'top' };
            }
        });
        row.commit();
    });

    const TEMP = FILE.replace('.xlsx', '.tmp.xlsx');
    await wb.xlsx.writeFile(TEMP);

    const fs = require('fs');
    try {
        fs.renameSync(TEMP, FILE);
        console.log(`✓ Added ${NEW_PROJECTS.length} project(s) to Playground`);
        console.log('  Run "node style-xlsx.js" to apply header styling.');
    } catch (e) {
        if (e.code === 'EBUSY' || e.code === 'EPERM') {
            console.log('⚠  data.xlsx is open — close Excel, then rename data.tmp.xlsx → data.xlsx');
        } else {
            fs.unlinkSync(TEMP);
            throw e;
        }
    }
}

run().catch(err => { console.error(err); process.exit(1); });
