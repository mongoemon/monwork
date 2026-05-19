/**
 * repair-data.js
 * Fixes missing Domain column in Skills and Tools sheets,
 * and adds Software Development mockup data.
 *
 * Run once after cloning or when Skills/Tools sections are empty:
 *   node repair-data.js
 */

const ExcelJS = require('exceljs');
const path    = require('path');

const FILE = path.join(__dirname, 'data.xlsx');

// ── Skills data ───────────────────────────────────────────────────────────────

const NEW_DEV_SKILLS = [
    { Skill_Name: 'JavaScript',         Category: 'Programming', Level: '4', Skill_Name_TH: 'JavaScript',          Category_TH: 'การเขียนโปรแกรม', Domain: 'software development' },
    { Skill_Name: 'TypeScript',         Category: 'Programming', Level: '3', Skill_Name_TH: 'TypeScript',           Category_TH: 'การเขียนโปรแกรม', Domain: 'software development' },
    { Skill_Name: 'Python',             Category: 'Programming', Level: '3', Skill_Name_TH: 'Python',               Category_TH: 'การเขียนโปรแกรม', Domain: 'software development' },
    { Skill_Name: 'HTML / CSS',         Category: 'Frontend',    Level: '4', Skill_Name_TH: 'HTML / CSS',           Category_TH: 'Frontend',         Domain: 'software development' },
    { Skill_Name: 'React',              Category: 'Frontend',    Level: '3', Skill_Name_TH: 'React',                Category_TH: 'Frontend',         Domain: 'software development' },
    { Skill_Name: 'Node.js',            Category: 'Backend',     Level: '3', Skill_Name_TH: 'Node.js',              Category_TH: 'Backend',          Domain: 'software development' },
    { Skill_Name: 'SQL / Database',     Category: 'Backend',     Level: '4', Skill_Name_TH: 'SQL / ฐานข้อมูล',    Category_TH: 'Backend',          Domain: 'software development' },
    { Skill_Name: 'REST API',           Category: 'Backend',     Level: '4', Skill_Name_TH: 'REST API',             Category_TH: 'Backend',          Domain: 'software development' },
    { Skill_Name: 'Git & Version Control', Category: 'DevOps',   Level: '4', Skill_Name_TH: 'Git และ Version Control', Category_TH: 'DevOps',       Domain: 'software development' },
    { Skill_Name: 'Docker',             Category: 'DevOps',      Level: '3', Skill_Name_TH: 'Docker',               Category_TH: 'DevOps',           Domain: 'software development' },
    { Skill_Name: 'Linux / Shell',      Category: 'DevOps',      Level: '3', Skill_Name_TH: 'Linux / Shell',        Category_TH: 'DevOps',           Domain: 'software development' },
];

// ── Tools data ────────────────────────────────────────────────────────────────

const NEW_DEV_TOOLS = [
    { Tool_Name: 'VS Code',           Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'IntelliJ IDEA',     Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'PyCharm',           Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'Figma',             Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'Trello',            Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'Notion',            Category: 'Collaboration',   Domain: 'software development' },
    { Tool_Name: 'Docker',            Category: 'CI/CD',           Domain: 'software development' },
    { Tool_Name: 'Kubernetes',        Category: 'CI/CD',           Domain: 'software development' },
    { Tool_Name: 'Vercel',            Category: 'CI/CD',           Domain: 'software development' },
    { Tool_Name: 'GitHub Actions',    Category: 'CI/CD',           Domain: 'software development' },
    { Tool_Name: 'Nginx',             Category: 'CI/CD',           Domain: 'software development' },
    { Tool_Name: 'Git',               Category: 'Version Control', Domain: 'software development' },
    { Tool_Name: 'GitHub',            Category: 'Version Control', Domain: 'software development' },
    { Tool_Name: 'MySQL',             Category: 'Database',        Domain: 'software development' },
    { Tool_Name: 'PostgreSQL',        Category: 'Database',        Domain: 'software development' },
    { Tool_Name: 'MongoDB',           Category: 'Database',        Domain: 'software development' },
    { Tool_Name: 'Redis',             Category: 'Database',        Domain: 'software development' },
    { Tool_Name: 'Grafana',           Category: 'Monitoring',      Domain: 'software development' },
    { Tool_Name: 'Sentry',            Category: 'Monitoring',      Domain: 'software development' },
];

// ── Project mockup data ───────────────────────────────────────────────────────

const NEW_PROJECTS = [
    {
        'Order ID':                    '45',
        'Project name':                'Internal Dashboard',
        'Project name_TH':             'แดชบอร์ดภายใน',
        'Duration':                    '2024',
        'Project URL':                 '',
        'Project overview':            'A web-based internal dashboard built for visualizing QA metrics, test coverage, and defect trends. Built with React and Node.js, connecting to a PostgreSQL database.',
        'Project overview_TH':         'แดชบอร์ดสำหรับแสดงผล QA metrics, test coverage และแนวโน้มของ defect พัฒนาด้วย React และ Node.js โดยเชื่อมต่อกับฐานข้อมูล PostgreSQL',
        'Roles and Responsibility':    '• Designed database schema and REST API endpoints\n• Built frontend dashboard with React\n• Deployed with Docker on internal server',
        'Roles and Responsibility_TH': '• ออกแบบ database schema และ REST API endpoints\n• พัฒนา frontend dashboard ด้วย React\n• Deploy ด้วย Docker บน server ภายใน',
        'Skills and Tools':            'React, Node.js, PostgreSQL, Docker, REST API',
        'Image_Folder':                '',
        'YouTube':                     '',
        'Project_Category':            'Software',
    },
    {
        'Order ID':                    '46',
        'Project name':                'Test Automation Framework',
        'Project name_TH':             'Framework สำหรับ Automation Testing',
        'Duration':                    '2023',
        'Project URL':                 '',
        'Project overview':            'A reusable Playwright-based automation testing framework with TypeScript. Includes custom reporters, CI/CD integration via GitHub Actions, and supports both web and API testing.',
        'Project overview_TH':         'Framework สำหรับ automation testing ที่สร้างบน Playwright ด้วย TypeScript รองรับทั้ง web และ API testing พร้อม CI/CD ผ่าน GitHub Actions',
        'Roles and Responsibility':    '• Architected the framework structure and conventions\n• Wrote base page object models and utility helpers\n• Integrated with GitHub Actions for CI runs\n• Wrote documentation and onboarding guide',
        'Roles and Responsibility_TH': '• ออกแบบโครงสร้าง framework และ conventions\n• เขียน base page object models และ utility helpers\n• เชื่อมต่อกับ GitHub Actions สำหรับการรัน CI\n• เขียนเอกสารและคู่มือการใช้งาน',
        'Skills and Tools':            'Playwright, TypeScript, GitHub Actions, REST API, Docker',
        'Image_Folder':                '',
        'YouTube':                     '',
        'Project_Category':            'Software',
    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getHeaderMap(ws) {
    const map = {};
    ws.getRow(1).eachCell((cell, col) => {
        if (cell.value) map[String(cell.value)] = col;
    });
    return map;
}

function ensureColumn(ws, headerMap, colName, afterName) {
    if (headerMap[colName]) return headerMap[colName];

    const afterCol = afterName ? (headerMap[afterName] || ws.columnCount) : ws.columnCount;
    const insertAt = afterCol + 1;

    // Shift existing columns right
    const lastCol = ws.columnCount;
    for (let r = 1; r <= ws.rowCount; r++) {
        const row = ws.getRow(r);
        for (let c = lastCol; c >= insertAt; c--) {
            const src = row.getCell(c);
            const dst = row.getCell(c + 1);
            dst.value     = src.value;
            dst.style     = { ...src.style };
            dst.alignment = src.alignment ? { ...src.alignment } : undefined;
            src.value     = null;
        }
        row.commit();
    }

    ws.getRow(1).getCell(insertAt).value = colName;
    ws.getRow(1).commit();

    // Rebuild header map
    const newMap = getHeaderMap(ws);
    Object.assign(headerMap, newMap);
    return insertAt;
}

// ── Fix Skills sheet ──────────────────────────────────────────────────────────

function fixSkillsSheet(wb) {
    const ws = wb.getWorksheet('Skills');
    if (!ws) { console.warn('Skills sheet not found'); return; }

    const hMap = getHeaderMap(ws);

    // Add Domain column after Level if missing
    const domainCol = ensureColumn(ws, hMap, 'Domain', 'Level');

    const categoryCol = hMap['Category'];

    // Tag existing rows
    for (let r = 2; r <= ws.rowCount; r++) {
        const row      = ws.getRow(r);
        const catCell  = row.getCell(categoryCol);
        const domCell  = row.getCell(domainCol);

        if (domCell.value) continue; // already set

        const cat = String(catCell.value || '').toLowerCase();
        domCell.value = cat === 'development' ? 'software development' : 'qa';
        row.commit();
    }

    // Append new dev skills
    NEW_DEV_SKILLS.forEach(skill => {
        const newRow = ws.addRow([]);
        newRow.getCell(hMap['Skill_Name']).value  = skill.Skill_Name;
        newRow.getCell(hMap['Category']).value    = skill.Category;
        newRow.getCell(hMap['Level']).value        = skill.Level;
        newRow.getCell(hMap['Domain']).value       = skill.Domain;
        if (hMap['Skill_Name_TH']) newRow.getCell(hMap['Skill_Name_TH']).value = skill.Skill_Name_TH;
        if (hMap['Category_TH'])   newRow.getCell(hMap['Category_TH']).value   = skill.Category_TH;
        newRow.commit();
    });

    console.log(`  Skills: tagged existing rows, added ${NEW_DEV_SKILLS.length} dev skills`);
}

// ── Fix Tools sheet ───────────────────────────────────────────────────────────

function fixToolsSheet(wb) {
    const ws = wb.getWorksheet('Tools');
    if (!ws) { console.warn('Tools sheet not found'); return; }

    const hMap = getHeaderMap(ws);

    // Add Domain column after Category if missing
    const domainCol = ensureColumn(ws, hMap, 'Domain', 'Category');

    // Tag all existing rows as 'qa'
    for (let r = 2; r <= ws.rowCount; r++) {
        const row     = ws.getRow(r);
        const domCell = row.getCell(domainCol);
        if (!domCell.value) {
            domCell.value = 'qa';
            row.commit();
        }
    }

    // Append new dev tools
    NEW_DEV_TOOLS.forEach(tool => {
        const newRow = ws.addRow([]);
        newRow.getCell(hMap['Tool_Name']).value = tool.Tool_Name;
        newRow.getCell(hMap['Category']).value  = tool.Category;
        newRow.getCell(hMap['Domain']).value    = tool.Domain;
        newRow.commit();
    });

    console.log(`  Tools: tagged existing rows as qa, added ${NEW_DEV_TOOLS.length} dev tools`);
}

// ── Add Software Development mockup projects ─────────────────────────────────

function fixProjectSheet(wb) {
    const ws = wb.getWorksheet('Project');
    if (!ws) { console.warn('Project sheet not found'); return; }

    const hMap = getHeaderMap(ws);

    NEW_PROJECTS.forEach(proj => {
        const newRow = ws.addRow([]);
        Object.entries(proj).forEach(([col, val]) => {
            if (hMap[col]) newRow.getCell(hMap[col]).value = val;
        });
        newRow.commit();
    });

    console.log(`  Project: added ${NEW_PROJECTS.length} software dev mockup projects`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(FILE);

    fixSkillsSheet(wb);
    fixToolsSheet(wb);
    fixProjectSheet(wb);

    const TEMP = FILE.replace('.xlsx', '.tmp.xlsx');
    await wb.xlsx.writeFile(TEMP);

    const fs = require('fs');
    try {
        fs.renameSync(TEMP, FILE);
        console.log('\n✓ Saved → data.xlsx');
        console.log('  Run "node style-xlsx.js" next to apply header styling.');
    } catch (e) {
        if (e.code === 'EBUSY' || e.code === 'EPERM') {
            console.log('\n⚠  data.xlsx is open — close Excel, then rename data.tmp.xlsx → data.xlsx');
        } else {
            fs.unlinkSync(TEMP);
            throw e;
        }
    }
}

run().catch(err => { console.error(err); process.exit(1); });
