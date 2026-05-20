import { state } from './state.js';
import { renderProfile, renderExperience, renderEducation, renderCertifications, renderAwards } from './about.js';
import { renderRecentProjects, initCategoryTabs, updateTabCounts, initSearch, applyFilters } from './projects.js';
import { initPlaygroundSearch, applyPlaygroundFilters } from './playground.js';
import { renderSkills, renderTools } from './skills.js';

export async function loadManifest() {
    try {
        const res = await fetch('images/manifest.json');
        if (res.ok) state.imageManifest = await res.json();
    } catch (_) { /* no manifest */ }
}

async function loadWorkbook() {
    const response = await fetch('data.xlsx');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    return XLSX.read(buffer, { type: 'array' });
}

function getSheetData(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
}

function loadMockData() {
    const mock = window.mockData || {};
    renderProfile((mock.profile || [])[0] || {});
    state.projects.all = (mock.projects || []).map(p => ({
        'Project name': p.Project_Name,
        'Project overview': p.Description,
        'Skills and Tools': p.Technologies,
        'Project URL': p.Demo_Link,
        'Image_Folder': '',
        Duration: p.Date,
    }));
    renderRecentProjects();
    initCategoryTabs();
    updateTabCounts();
    initSearch();
    applyFilters();
    renderSkills(mock.skills || []);
    renderTools(mock.tools || []);
}

export async function loadAll() {
    await loadManifest();

    let workbook;
    try {
        workbook = await loadWorkbook();
    } catch (e) {
        console.warn('data.xlsx failed, using mock data:', e.message);
        loadMockData();
        return;
    }

    try { renderProfile(getSheetData(workbook, 'Profile')[0] || {}); } catch (e) { console.error('Profile:', e); }

    try {
        state.projects.all = getSheetData(workbook, 'Project')
            .filter(row => String(row['Project name']).trim());
        renderRecentProjects();
        initCategoryTabs();
        updateTabCounts();
        initSearch();
        applyFilters();
    } catch (e) { console.error('Projects:', e); }

    try {
        state.playground.all = getSheetData(workbook, 'Playground')
            .filter(row => String(row['Project name'] || '').trim());
        initPlaygroundSearch();
        applyPlaygroundFilters();
    } catch (e) { console.error('Playground:', e); }

    try { renderExperience(getSheetData(workbook, 'Experience')); }    catch (e) { console.error('Experience:', e); }
    try { renderEducation(getSheetData(workbook, 'Education')); }      catch (e) { console.error('Education:', e); }
    try { renderCertifications(getSheetData(workbook, 'Certifications')); } catch (e) { console.error('Certifications:', e); }
    try { renderAwards(getSheetData(workbook, 'Awards')); }            catch (e) { console.error('Awards:', e); }
    try { renderSkills(getSheetData(workbook, 'Skills')); }            catch (e) { console.error('Skills:', e); }
    try { renderTools(getSheetData(workbook, 'Tools')); }              catch (e) { console.error('Tools:', e); }

    return workbook;
}
