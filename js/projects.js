import { state } from './state.js';
import { t, pickLang } from './i18n.js';
import { escapeHtml, normalizeLines } from './utils.js';
import { buildProjectMedia, isLogoFile } from './media.js';
import { navigate } from './nav.js';

const PROJECTS_PER_PAGE = 6;

function renderPagination(container, page, totalPages, onPrev, onNext) {
    container.innerHTML = '';
    if (totalPages <= 1) return;

    const prev = document.createElement('button');
    prev.textContent = t('pagination_prev');
    prev.disabled = page <= 1;
    prev.onclick = onPrev;

    const info = document.createElement('span');
    info.textContent = `${page} / ${totalPages}`;

    const next = document.createElement('button');
    next.textContent = t('pagination_next');
    next.disabled = page >= totalPages;
    next.onclick = onNext;

    container.append(prev, info, next);
}

export function buildProjectCard(project, showCatBadge) {
    const div = document.createElement('div');
    div.className = 'project';

    const left = document.createElement('div');
    left.className = 'project-left';

    const projectName = pickLang(project, 'Project name');
    const cat = project['Project_Category'] || '';
    const catLabel = showCatBadge && state.projects.category === 'all' && cat
        ? `<span class="project-cat project-cat--${cat.toLowerCase().replace(/[^a-z]/g, '')}">${escapeHtml(cat)}</span>`
        : '';

    left.innerHTML = `
        <h3>${escapeHtml(projectName || '')}</h3>
        ${catLabel}
        ${project.Duration ? `<p class="duration">${escapeHtml(project.Duration)}</p>` : ''}
        ${project['Project URL'] ? `<p class="link"><a href="${escapeHtml(project['Project URL'])}" target="_blank" rel="noopener">View Project ↗</a></p>` : ''}
    `;

    const overview = pickLang(project, 'Project overview');
    const roles = pickLang(project, 'Roles and Responsibility');
    const tools = project['Skills and Tools'];

    const right = document.createElement('div');
    right.className = 'project-right';
    right.innerHTML = `
        ${overview ? `<div class="project-detail"><p class="detail-label">${t('label_overview')}</p><p class="overview">${escapeHtml(normalizeLines(overview))}</p></div>` : ''}
        ${roles    ? `<div class="project-detail"><p class="detail-label">${t('label_roles')}</p><p class="roles">${escapeHtml(normalizeLines(roles))}</p></div>` : ''}
        ${tools    ? `<div class="project-detail"><p class="detail-label">${t('label_tools')}</p><p class="tools">${escapeHtml(normalizeLines(tools))}</p></div>` : ''}
    `;

    const folder = String(project['Image_Folder'] || '').trim();
    const youtube = String(project['YouTube'] || '').trim();
    const { logoEl, galleryEl } = buildProjectMedia(folder, youtube);
    if (logoEl) left.prepend(logoEl);
    if (galleryEl) right.appendChild(galleryEl);

    div.append(left, right);
    return div;
}

export function renderRecentProjects() {
    const container = document.getElementById('recent-projects-list');
    if (!container) return;
    container.innerHTML = '';

    state.projects.all.slice(0, 3).forEach(project => {
        const folder = String(project['Image_Folder'] || '').trim();
        const logoSrc = folder
            ? (state.imageManifest[folder] || []).map(f => `images/${folder}/${f}`).find(isLogoFile)
            : null;

        const card = document.createElement('div');
        card.className = 'recent-card';
        card.innerHTML = `
            ${logoSrc ? `<img class="recent-logo" src="${escapeHtml(logoSrc)}" alt="${escapeHtml(pickLang(project, 'Project name'))} logo">` : ''}
            <div class="recent-info">
                <h4>${escapeHtml(pickLang(project, 'Project name') || '')}</h4>
                ${project.Duration ? `<p class="recent-duration">${escapeHtml(project.Duration)}</p>` : ''}
                <p class="recent-overview">${escapeHtml(normalizeLines(pickLang(project, 'Project overview') || '').replace(/\n/g, ' '))}</p>
            </div>
        `;
        card.onclick = () => navigate('projects');
        container.appendChild(card);
    });
}

export function applyFilters() {
    const q = (document.getElementById('project-search')?.value || '').trim().toLowerCase();
    const base = state.projects.category === 'all'
        ? state.projects.all
        : state.projects.all.filter(p => p['Project_Category'] === state.projects.category);

    state.projects.filtered = q
        ? base.filter(p =>
            [p['Project name'], p['Project overview'], p['Skills and Tools'], p['Duration']]
                .some(f => String(f || '').toLowerCase().includes(q)))
        : base;
    state.projects.page = 1;
    renderProjects();
}

export function renderProjects() {
    const { filtered, page } = state.projects;
    const totalPages = Math.ceil(filtered.length / PROJECTS_PER_PAGE);
    const start = (page - 1) * PROJECTS_PER_PAGE;
    const pageItems = filtered.slice(start, start + PROJECTS_PER_PAGE);

    const countEl = document.getElementById('search-count');
    if (countEl) {
        const n = filtered.length;
        countEl.textContent = state.lang === 'th'
            ? `${n} โปรเจค`
            : `${n} project${n !== 1 ? 's' : ''}`;
    }

    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    if (filtered.length === 0) {
        list.innerHTML = `<p class="no-results">${t('no_results')}</p>`;
    }
    pageItems.forEach(project => list.appendChild(buildProjectCard(project, true)));

    renderPagination(
        document.getElementById('projects-pagination'),
        page, totalPages,
        () => { state.projects.page--; renderProjects(); window.scrollTo({ top: 0, behavior: 'smooth' }); },
        () => { state.projects.page++; renderProjects(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    );
}

export function initSearch() {
    const input = document.getElementById('project-search');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 250);
    });
}

export function updateTabCounts() {
    document.querySelectorAll('.project-tab').forEach(btn => {
        const cat = btn.dataset.category;
        const count = cat === 'all'
            ? state.projects.all.length
            : state.projects.all.filter(p => p['Project_Category'] === cat).length;
        const el = btn.querySelector('.tab-count');
        if (el) el.textContent = `(${count})`;
    });
}

export function renderCategoryTabLabels() {
    const cats = (window.siteConfig || {}).projectCategories || [];
    document.querySelectorAll('.project-tab[data-category]').forEach(btn => {
        const cat = cats.find(c => c.value === btn.dataset.category);
        if (!cat) return;
        const span = btn.querySelector('span:first-child');
        if (span) span.textContent = state.lang === 'th' ? cat.th : cat.en;
    });
}

export function initCategoryTabs() {
    const container = document.querySelector('.project-tabs');
    if (container) {
        const cats = (window.siteConfig || {}).projectCategories || [];
        cats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'project-tab';
            btn.dataset.category = cat.value;
            btn.innerHTML = `<span>${escapeHtml(state.lang === 'th' ? cat.th : cat.en)}</span><span class="tab-count"></span>`;
            container.appendChild(btn);
        });
    }

    document.querySelectorAll('.project-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            state.projects.category = btn.dataset.category;
            document.querySelectorAll('.project-tab')
                .forEach(b => b.classList.toggle('tab-active', b === btn));
            const search = document.getElementById('project-search');
            if (search) search.value = '';
            applyFilters();
        });
    });
}

export function renderProjectInfoPopup() {
    const list = document.querySelector('#project-info-popup .info-popup-list');
    if (!list) return;
    const items = t('project_info');
    if (!Array.isArray(items)) return;
    list.innerHTML = items.map(([icon, label, desc]) => `
        <li>
            <span class="info-icon">${icon}</span>
            <span class="info-label">${escapeHtml(label)}</span>
            <span class="info-desc">${escapeHtml(desc)}</span>
        </li>
    `).join('');
}

export function initProjectInfoPopup() {
    const btn = document.getElementById('project-info-btn');
    const popup = document.getElementById('project-info-popup');
    const close = popup?.querySelector('.info-popup-close');
    if (!btn || !popup) return;

    renderProjectInfoPopup();

    btn.addEventListener('click', e => {
        e.stopPropagation();
        const open = !popup.hidden;
        popup.hidden = open;
        btn.classList.toggle('info-btn--active', !open);
    });

    close?.addEventListener('click', () => {
        popup.hidden = true;
        btn.classList.remove('info-btn--active');
    });

    document.addEventListener('click', e => {
        if (!popup.hidden && !popup.contains(e.target) && e.target !== btn) {
            popup.hidden = true;
            btn.classList.remove('info-btn--active');
        }
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !popup.hidden) {
            popup.hidden = true;
            btn.classList.remove('info-btn--active');
        }
    });
}
