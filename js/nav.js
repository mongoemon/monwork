const config = () => window.siteConfig || {};

export function isPageEnabled(id) {
    const pages = config().pages || {};
    if (!(id in pages)) return true;
    return pages[id] !== false;
}

export function applyPageConfig() {
    const pages = config().pages || {};
    const navUl = document.querySelector('nav ul');

    if (navUl) {
        ['home', ...Object.keys(pages)].forEach(id => {
            const a = navUl.querySelector(`a[href="#${id}"]`);
            if (a) navUl.appendChild(a.closest('li'));
        });
    }

    document.querySelectorAll('nav ul a[href^="#"]').forEach(a => {
        const id = a.getAttribute('href').slice(1);
        if (pages[id] === false) {
            a.closest('li').style.display = 'none';
        }
    });

    if (pages.projects === false) {
        const recent = document.querySelector('.home-recent');
        if (recent) recent.style.display = 'none';
    }
}

export function navigate(id, replace) {
    const sectionId = document.getElementById(id)?.closest('section')?.id || id;
    if (!isPageEnabled(sectionId) && sectionId !== 'home') {
        return navigate('home', replace);
    }

    const target = document.getElementById(id);
    const isSection = target && target.tagName === 'SECTION';
    const section = isSection ? target : target?.closest('section');

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
