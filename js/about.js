import { state } from './state.js';
import { t, pickLang } from './i18n.js';
import { escapeHtml, normalizeLines } from './utils.js';

const NAV_GUIDE_PAGES = [
    { id: 'about',      icon: '👤', key: 'guide_about'     },
    { id: 'projects',   icon: '💼', key: 'guide_projects'  },
    { id: 'playground', icon: '🧪', key: 'guide_playground' },
    { id: 'join',       icon: '🤝', key: 'guide_join'      },
    { id: 'contact',    icon: '✉️', key: 'guide_contact'   },
];

export function renderProfile(profile) {
    state.profile = profile;

    const name = pickLang(profile, 'Name') || '';
    document.getElementById('home-name').textContent = name;
    const navBrand = document.getElementById('nav-name');
    if (navBrand) navBrand.textContent = name;

    const title = pickLang(profile, 'Title');
    const titleEl = document.getElementById('home-title');
    titleEl.textContent = title;
    titleEl.style.display = title ? '' : 'none';

    document.getElementById('home-intro').textContent =
        normalizeLines(pickLang(profile, 'Intro') || pickLang(profile, 'Bio') || '');

    const photo = document.getElementById('home-photo');
    if (profile.Photo_URL) photo.src = profile.Photo_URL;
    else photo.style.display = 'none';

    document.getElementById('about-bio').textContent =
        normalizeLines(pickLang(profile, 'Bio') || pickLang(profile, 'Intro') || '');

    const loc = pickLang(profile, 'Location');
    document.getElementById('about-location').textContent = loc ? `📍 ${loc}` : '';
}

export function renderNavLinks(links = {}) {
    const container = document.getElementById('nav-social-links');
    if (!container) return;
    container.innerHTML = '';

    const defs = [
        {
            key: 'linkedin',
            label: 'LinkedIn',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
        },
        {
            key: 'github',
            label: 'GitHub',
            svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>`
        }
    ];

    defs.forEach(({ key, label, svg }) => {
        const url = links[key];
        if (!url) return;
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'nav-social-icon';
        a.setAttribute('aria-label', label);
        a.title = label;
        a.innerHTML = svg;
        container.appendChild(a);
    });
}

export function renderNavGuide() {
    const el = document.getElementById('home-nav-guide');
    if (!el) return;

    const pages = (window.siteConfig || {}).pages || {};
    const visible = NAV_GUIDE_PAGES.filter(p => pages[p.id] !== false);

    if (visible.length === 0) { el.style.display = 'none'; return; }
    el.style.display = '';
    el.innerHTML = `
        <h3 class="nav-guide-title">${t('guide_title')}</h3>
        <ul class="nav-guide-list">
            ${visible.map(p => `
            <li>
                <a href="#${p.id}" class="nav-guide-item">
                    <span class="nav-guide-icon">${p.icon}</span>
                    <span class="nav-guide-label">${t(`nav_${p.id}`)}</span>
                    <span class="nav-guide-desc">${t(p.key)}</span>
                </a>
            </li>`).join('')}
        </ul>`;
}

export function renderLastUpdated(pushed) {
    state.lastPushed = pushed;
    const el = document.getElementById('home-last-updated');
    if (!el) return;

    const locale = state.lang === 'th' ? 'th-TH' : 'en-GB';
    const dateStr = pushed.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

    const staleMonths = window.siteConfig?.staleWarningMonths ?? 6;
    const isStale = staleMonths > 0 && (Date.now() - pushed.getTime()) > staleMonths * 30 * 24 * 60 * 60 * 1000;

    el.innerHTML = isStale
        ? `<p class="last-updated-date">${t('last_updated')}: ${dateStr}</p>
           <p class="last-updated-stale">${t('last_updated_stale')}</p>`
        : `<p class="last-updated-date">${t('last_updated')}: ${dateStr}</p>`;
}

export async function loadLastUpdated() {
    try {
        const ghRepo = (window.siteConfig?.githubRepo || '').trim() || 'mongoemon/monwork';
        const res = await fetch(`https://api.github.com/repos/${ghRepo}`);
        if (!res.ok) return;
        const json = await res.json();
        renderLastUpdated(new Date(json.pushed_at));
    } catch (_) { /* silently fail */ }
}

export function renderExperience(data) {
    state.experience = data;
    const list = document.getElementById('experience-list');
    if (!list) return;
    list.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'timeline-item';
        div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-body">
                <div class="timeline-header">
                    <span class="timeline-role">${escapeHtml(pickLang(item, 'Role') || '')}</span>
                    <span class="timeline-period">${escapeHtml(item.Period || '')}</span>
                </div>
                <div class="timeline-company">${escapeHtml(pickLang(item, 'Company') || '')}</div>
                <p class="timeline-desc">${escapeHtml(normalizeLines(pickLang(item, 'Description') || ''))}</p>
            </div>
        `;
        list.appendChild(div);
    });
}

export function renderEducation(data) {
    const list = document.getElementById('education-list');
    if (!list) return;
    list.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'edu-item';
        div.innerHTML = `
            <div class="edu-degree">${escapeHtml(item.Degree || '')}</div>
            <div class="edu-institution">${escapeHtml(item.Institution || '')}</div>
            ${item.Period ? `<div class="edu-period">${escapeHtml(item.Period)}</div>` : ''}
        `;
        list.appendChild(div);
    });
}

export function renderCertifications(data) {
    const list = document.getElementById('certifications-list');
    if (!list) return;
    list.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="cert-name">${escapeHtml(item.Name || '')}</span>
            <span class="cert-meta">${[item.Issuer, item.Year].filter(Boolean).join(' · ')}</span>
        `;
        list.appendChild(li);
    });
}

export function renderAwards(data) {
    const list = document.getElementById('awards-list');
    if (!list) return;
    list.innerHTML = '';
    data.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="award-title">${escapeHtml(item.Title || '')}${item.Year ? ` <em>${escapeHtml(item.Year)}</em>` : ''}</span>
            <span class="award-project">${escapeHtml(item.Project || '')} — ${escapeHtml(item.Place || '')}</span>
        `;
        list.appendChild(li);
    });
}
