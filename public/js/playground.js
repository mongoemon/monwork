import { state } from './state.js';
import { t } from './i18n.js';
import { buildProjectCard } from './projects.js';

const PROJECTS_PER_PAGE = 6;

export function applyPlaygroundFilters() {
    const q = (document.getElementById('playground-search')?.value || '').trim().toLowerCase();
    state.playground.filtered = q
        ? state.playground.all.filter(p =>
            [p['Project name'], p['Project overview'], p['Skills and Tools']]
                .some(f => String(f || '').toLowerCase().includes(q)))
        : state.playground.all.slice();
    state.playground.page = 1;
    renderPlayground();
}

export function initPlaygroundSearch() {
    const input = document.getElementById('playground-search');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(applyPlaygroundFilters, 250);
    });
}

export function renderPlayground() {
    const { filtered, page } = state.playground;
    const totalPages = Math.ceil(filtered.length / PROJECTS_PER_PAGE);
    const start = (page - 1) * PROJECTS_PER_PAGE;
    const pageItems = filtered.slice(start, start + PROJECTS_PER_PAGE);

    const countEl = document.getElementById('playground-search-count');
    if (countEl) {
        const n = filtered.length;
        countEl.textContent = state.lang === 'th'
            ? `${n} โปรเจค`
            : `${n} project${n !== 1 ? 's' : ''}`;
    }

    const list = document.getElementById('playground-list');
    if (!list) return;
    list.innerHTML = '';
    if (filtered.length === 0) {
        list.innerHTML = `<p class="no-results">${t('no_results')}</p>`;
    }
    pageItems.forEach(project => list.appendChild(buildProjectCard(project, false)));

    const pagination = document.getElementById('playground-pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    if (totalPages > 1) {
        const prev = document.createElement('button');
        prev.textContent = t('pagination_prev');
        prev.disabled = page <= 1;
        prev.onclick = () => { state.playground.page--; renderPlayground(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

        const info = document.createElement('span');
        info.textContent = `${page} / ${totalPages}`;

        const next = document.createElement('button');
        next.textContent = t('pagination_next');
        next.disabled = page >= totalPages;
        next.onclick = () => { state.playground.page++; renderPlayground(); window.scrollTo({ top: 0, behavior: 'smooth' }); };

        pagination.append(prev, info, next);
    }
}
