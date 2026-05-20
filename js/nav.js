const config = () => window.siteConfig || {};

export function isPageEnabled(id) {
    const pages = config().pages || {};
    if (!(id in pages)) return true;
    const v = pages[id];
    if (typeof v === 'boolean') return v;
    if (v && typeof v === 'object') return v.enabled !== false;
    return true;
}

export function isSubSectionEnabled(pageId, sectionId) {
    const sub = (config().subSections || {})[pageId];
    if (!sub || !(sectionId in sub)) return true;
    return sub[sectionId] !== false;
}

export function applySubSectionConfig() {
    document.querySelectorAll('[data-subsection]').forEach(el => {
        const [pageId, sectionId] = el.getAttribute('data-subsection').split(':');
        // home:false only removes the nav link — home content is always shown
        const pageVisible = pageId === 'home' ? true : isPageEnabled(pageId);
        const visible = pageVisible && isSubSectionEnabled(pageId, sectionId);
        el.style.display = visible ? '' : 'none';
    });

    // Hide .about-bottom-row when both its subsection columns are hidden
    const bottomRow = document.querySelector('.about-bottom-row');
    if (bottomRow) {
        const cols = bottomRow.querySelectorAll('[data-subsection]');
        const allHidden = Array.from(cols).every(c => c.style.display === 'none');
        bottomRow.style.display = allHidden ? 'none' : '';
    }
}

export function applyPageConfig() {
    const pages   = config().pages   || {};
    const order   = config().pageOrder;
    const customs = config().customPages || [];
    const navUl   = document.querySelector('nav ul');

    if (navUl) {
        // Determine display order: explicit pageOrder > config key order > DOM order
        const orderedIds = order
            ? order
            : ['home', ...Object.keys(pages), ...customs.map(c => c.id).filter(Boolean)];

        orderedIds.forEach(id => {
            const a = navUl.querySelector(`a[href="#${id}"]`);
            if (a) navUl.appendChild(a.closest('li'));
        });
    }

    // Hide nav links for disabled built-in pages
    document.querySelectorAll('nav ul a[href^="#"]').forEach(a => {
        const id = a.getAttribute('href').slice(1);
        if (!isPageEnabled(id)) a.closest('li').style.display = 'none';
    });

    // Hide home-recent if projects page is off (it reads project data)
    if (!isPageEnabled('projects')) {
        const recent = document.querySelector('.home-recent');
        if (recent) recent.style.display = 'none';
    }
}

export function addCustomPageNavItems() {
    const customs = config().customPages || [];
    if (!customs.length) return;

    const navUl = document.querySelector('nav ul');
    if (!navUl) return;

    const lang = document.documentElement.lang || 'en';

    customs.forEach(cp => {
        if (!cp.id) return;
        if (navUl.querySelector(`a[href="#${cp.id}"]`)) return; // already there
        const li = document.createElement('li');
        const a  = document.createElement('a');
        a.href = `#${cp.id}`;
        a.textContent = (lang === 'th' && cp.label?.th) ? cp.label.th : (cp.label?.en || cp.id);
        li.appendChild(a);
        navUl.appendChild(li);
    });
}

export function navigate(id, replace) {
    const sectionId = document.getElementById(id)?.closest('section')?.id || id;
    if (!isPageEnabled(sectionId) && sectionId !== 'home') {
        return navigate('home', replace);
    }

    const target    = document.getElementById(id);
    const isSection = target && target.tagName === 'SECTION';
    const section   = isSection ? target : target?.closest('section');

    document.querySelectorAll('section[id]').forEach(s => s.classList.remove('active'));
    if (section) section.classList.add('active');

    document.querySelectorAll('nav ul a[href^="#"]').forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
    });

    history[replace ? 'replaceState' : 'pushState'](null, '', `#${id}`);

    if (!isSection && target) {
        requestAnimationFrame(() =>
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        );
    } else {
        window.scrollTo(0, 0);
    }
}

export function initNav() {
    applyPageConfig();
    applySubSectionConfig();

    document.addEventListener('click', e => {
        const a = e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href').slice(1);
        if (document.getElementById(id)) {
            e.preventDefault();
            navigate(id);
        }
    });
    window.addEventListener('popstate', () => {
        navigate(location.hash.slice(1) || 'home', true);
    });
    navigate(location.hash.slice(1) || 'home', true);
}
