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
        const res = await fetch('https://api.github.com/repos/mongoemon/monwork');
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
