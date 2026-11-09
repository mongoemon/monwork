import { state } from './state.js';
import { i18n, detectLang } from './i18n.js';
import { initTheme } from './theme.js';
import { initNav, applySubSectionConfig } from './nav.js';
import { loadAll } from './data-loader.js';
import { loadLastUpdated, renderProfile, renderNavGuide, renderLastUpdated, renderExperience } from './about.js';
import { renderRecentProjects, renderProjects, renderCategoryTabLabels, renderProjectInfoPopup, initProjectInfoPopup } from './projects.js';
import { renderPlayground } from './playground.js';
import { renderSkills, renderTools } from './skills.js';
import { initCustomPages, applyCustomPageLang } from './custom-pages.js';

function applyLang(lang) {
    state.lang = lang;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = (i18n[lang] || i18n.en)[key];
        if (val !== undefined) el.textContent = val;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = (i18n[lang] || i18n.en)[key];
        if (val !== undefined) el.placeholder = val;
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
    });

    if (state.profile)    renderProfile(state.profile);
    if (state.experience) renderExperience(state.experience);
    renderNavGuide();
    renderCategoryTabLabels();
    if (state.lastPushed) renderLastUpdated(state.lastPushed);
    if (state.skills)     renderSkills(state.skills);
    if (state.tools)      renderTools(state.tools);
    if (state.projects.all.length > 0)  { renderRecentProjects(); renderProjects(); }
    if (state.playground.all.length > 0)  renderPlayground();
    renderProjectInfoPopup();
    applyCustomPageLang();
}

function initLang() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
    applyLang(detectLang());
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.classList.add('fade-out');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
    // Inject custom page sections before nav init so routing works
    initCustomPages(null);

    initTheme();
    initLang();
    initNav();
    renderNavGuide();
    initProjectInfoPopup();
    applySubSectionConfig();

    loadAll()
        .then(workbook => { if (workbook) initCustomPages(workbook); })
        .finally(hideLoadingOverlay);

    loadLastUpdated();
});
