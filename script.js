const PROJECTS_PER_PAGE = 6;

// ── Page config helpers ───────────────────────────────────

function isPageEnabled(id) {
    const pages = (siteConfig || {}).pages || {};
    // 'home' is always on; sub-anchors (e.g. 'contact' div inside home) follow their key
    if (!(id in pages)) return true;
    return pages[id] !== false;
}

function applyPageConfig() {
    const pages = (siteConfig || {}).pages || {};
    const navUl = document.querySelector('nav ul');

    // Reorder nav items: home always first, then follow config key order
    if (navUl) {
        ['home', ...Object.keys(pages)].forEach(id => {
            const a = navUl.querySelector(`a[href="#${id}"]`);
            if (a) navUl.appendChild(a.closest('li'));
        });
    }

    // Hide nav links for disabled sections
    document.querySelectorAll('nav ul a[href^="#"]').forEach(a => {
        const id = a.getAttribute('href').slice(1);
        if (id in pages && pages[id] === false) {
            a.closest('li').style.display = 'none';
        }
    });

    // Hide Recent Projects block if projects is off
    if (pages.projects === false) {
        const recent = document.querySelector('.home-recent');
        if (recent) recent.style.display = 'none';
    }

    // Hide contact form block in home if contact is off
    if (pages.contact === false) {
        const contactBlock = document.querySelector('.home-contact');
        if (contactBlock) contactBlock.style.display = 'none';
    }
}

// ── Navigation (single-section view) ─────────────────────

function navigate(id, replace) {
    // Redirect to home if the target section is disabled
    const sectionId = document.getElementById(id)?.closest('section')?.id || id;
    if (!isPageEnabled(sectionId) && sectionId !== 'home') {
        return navigate('home', replace);
    }

    const target = document.getElementById(id);
    const isSection = target && target.tagName === 'SECTION';

    // Resolve which section to show
    const section = isSection ? target : target?.closest('section');
    document.querySelectorAll('section[id]').forEach(s => s.classList.remove('active'));
    if (section) section.classList.add('active');

    document.querySelectorAll('nav ul a[href^="#"]').forEach(a => {
        a.classList.toggle('nav-active', a.getAttribute('href') === `#${id}`);
    });

    history[replace ? 'replaceState' : 'pushState'](null, '', `#${id}`);

    if (!isSection && target) {
        // Sub-element: scroll to it after section is shown
        requestAnimationFrame(() =>
            target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        );
    } else {
        window.scrollTo(0, 0);
    }
}

function initNav() {
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
let allProjects = [];
let filteredProjects = [];
let currentPage = 1;
let imageManifest = {};
let currentLang = 'en';
let currentCategory = 'all';
let _profileData = null;
let _skillsData = null;
let _toolsData = null;

// ── i18n ──────────────────────────────────────────────────

const i18n = {
    en: {
        nav_home: 'Home',
        nav_about: 'About',
        nav_projects: 'Projects',
        read_more: 'Read More',
        recent_projects: 'Recent Projects',
        view_all: 'View all →',
        section_about: 'About Me',
        section_experience: 'Experience',
        section_education: 'Education',
        section_certifications: 'Certifications',
        section_awards: 'Awards',
        section_skills: 'Skills',
        section_projects: 'Projects',
        contact_heading: 'Get in Touch',
        contact_intro: 'Feel free to reach out — whether for inquiries, a chat, or job opportunities.',
        contact_name: 'Name',
        contact_email: 'Email',
        contact_subject: 'Subject',
        contact_message: 'Message',
        contact_name_ph: 'Your name',
        contact_email_ph: 'your@email.com',
        contact_subject_ph: "What's this about?",
        contact_message_ph: 'Your message…',
        contact_submit: 'Send Message',
        contact_success: "Message sent — I'll get back to you soon!",
        search_ph: 'Search by name, tools, or description…',
        no_results: 'No projects found.',
        pagination_prev: '← Prev',
        pagination_next: 'Next →',
        gallery_prev: 'Previous',
        gallery_next: 'Next',
        level_expert: 'Expert',
        level_advanced: 'Advanced',
        level_intermediate: 'Intermediate',
        level_beginner: 'Beginner',
        label_overview: 'Project Overview',
        label_roles: 'Roles & Responsibilities',
        label_tools: 'Tools',
        tab_all: 'All',
        tab_software: 'Software',
        tab_game: 'Game',
        tab_etc: 'etc.',
        nav_contact: 'Contact',
        nav_join: 'Join',
        join_title: 'Join QA Team',
        join_intro_1: 'Looking to grow in QA? Join as a tester — whether to build your skills or take on real projects.',
        join_intro_2: 'We work across software and games, with hands-on experience in test planning, execution, and quality processes.',
        join_privacy: 'Your personal information is kept strictly confidential and will be used solely for contact purposes.',
        join_name: 'First Name',
        join_name_ph: 'Your first name',
        join_nickname: 'Nickname',
        join_nickname_ph: 'e.g. Tom, Sam',
        join_dob: 'Date of Birth',
        join_phone: 'Phone Number',
        join_phone_ph: '+66 8x-xxxx-xxxx',
        join_links: 'Related Links',
        join_links_ph: 'LinkedIn, GitHub, portfolio, or any relevant URL (one per line)',
        join_interest: 'I am interested in',
        join_interest_learn: 'Learning only',
        join_interest_work: 'Open to paid projects too',
        join_submit: 'Submit Application',
        join_success: 'Application received — we will be in touch soon!',
        section_tools: 'Tools & Software',
        tool_cat_test_management: 'Test Management',
        tool_cat_automation: 'Automation',
        tool_cat_api: 'API Testing',
        tool_cat_performance: 'Performance',
        tool_cat_cicd: 'CI/CD',
        tool_cat_vcs: 'Version Control',
        tool_cat_database: 'Database',
        tool_cat_monitoring: 'Monitoring',
        tool_cat_collaboration: 'Collaboration',
        tool_cat_device: 'Device / Platform',
    },
    th: {
        nav_home: 'หน้าแรก',
        nav_about: 'เกี่ยวกับ',
        nav_projects: 'โปรเจค',
        read_more: 'อ่านเพิ่มเติม',
        recent_projects: 'โปรเจคล่าสุด',
        view_all: 'ดูทั้งหมด →',
        section_about: 'เกี่ยวกับฉัน',
        section_experience: 'ประสบการณ์',
        section_education: 'การศึกษา',
        section_certifications: 'ใบรับรอง',
        section_awards: 'รางวัล',
        section_skills: 'ทักษะ',
        section_projects: 'โปรเจค',
        contact_heading: 'ติดต่อ',
        contact_intro: 'ไม่ว่าจะสอบถาม พูดคุย หรือติดต่องาน ยินดีรับทุกข้อความเลยครับ',
        contact_name: 'ชื่อ',
        contact_email: 'อีเมล',
        contact_subject: 'หัวข้อ',
        contact_message: 'ข้อความ',
        contact_name_ph: 'ชื่อของคุณ',
        contact_email_ph: 'อีเมลของคุณ',
        contact_subject_ph: 'เรื่องที่ต้องการติดต่อ',
        contact_message_ph: 'ข้อความของคุณ…',
        contact_submit: 'ส่งข้อความ',
        contact_success: 'ส่งข้อความเรียบร้อยแล้ว — จะรีบตอบกลับโดยเร็วนะครับ!',
        search_ph: 'ค้นหาด้วยชื่อ, เครื่องมือ หรือคำอธิบาย…',
        no_results: 'ไม่พบโปรเจคที่ค้นหา',
        pagination_prev: '← ก่อนหน้า',
        pagination_next: 'ถัดไป →',
        gallery_prev: 'ก่อนหน้า',
        gallery_next: 'ถัดไป',
        level_expert: 'เชี่ยวชาญ',
        level_advanced: 'ชำนาญ',
        level_intermediate: 'ปานกลาง',
        level_beginner: 'เริ่มต้น',
        label_overview: 'ภาพรวมโปรเจค',
        label_roles: 'บทบาทและหน้าที่',
        label_tools: 'เครื่องมือที่ใช้',
        tab_all: 'ทั้งหมด',
        tab_software: 'ซอฟต์แวร์',
        tab_game: 'เกม',
        tab_etc: 'อื่นๆ',
        nav_contact: 'ติดต่อ',
        nav_join: 'ร่วมทีม',
        join_title: 'ร่วมทีม QA',
        join_intro_1: 'กำลังมองหาคนที่สนใจเติบโตในสาย QA มาร่วมทดสอบด้วยกัน ไม่ว่าจะเพื่อเรียนรู้ หรือรับงานจริง ยินดีต้อนรับครับ',
        join_intro_2: 'เราทำงานครอบคลุมทั้ง software และ game มีโอกาสได้ลงมือวางแผนทดสอบ ทำ test case และดูแลคุณภาพงานจริง',
        join_privacy: 'ข้อมูลส่วนตัวของคุณจะถูกเก็บเป็นความลับอย่างเคร่งครัด และใช้เพื่อวัตถุประสงค์ในการติดต่อเท่านั้น',
        join_name: 'ชื่อ',
        join_name_ph: 'ชื่อของคุณ',
        join_nickname: 'ชื่อเล่น',
        join_nickname_ph: 'เช่น เตย, แบงค์',
        join_dob: 'วันเดือนปีเกิด',
        join_phone: 'เบอร์โทรศัพท์',
        join_phone_ph: '0x-xxxx-xxxx',
        join_links: 'ลิงค์ที่เกี่ยวข้อง',
        join_links_ph: 'LinkedIn, GitHub, portfolio หรือลิงค์ใดก็ได้ (แยกบรรทัด)',
        join_interest: 'สนใจ',
        join_interest_learn: 'เรียนรู้เท่านั้น',
        join_interest_work: 'รับงานด้วย',
        join_submit: 'ส่งใบสมัคร',
        join_success: 'ได้รับข้อมูลแล้ว — จะติดต่อกลับโดยเร็วครับ!',
        section_tools: 'เครื่องมือที่ใช้',
        tool_cat_test_management: 'การจัดการทดสอบ',
        tool_cat_automation: 'การทดสอบอัตโนมัติ',
        tool_cat_api: 'การทดสอบ API',
        tool_cat_performance: 'ประสิทธิภาพ',
        tool_cat_cicd: 'CI/CD',
        tool_cat_vcs: 'การควบคุมเวอร์ชัน',
        tool_cat_database: 'ฐานข้อมูล',
        tool_cat_monitoring: 'การตรวจสอบระบบ',
        tool_cat_collaboration: 'การทำงานร่วมกัน',
        tool_cat_device: 'อุปกรณ์ / แพลตฟอร์ม',
    }
};

function t(key) {
    return (i18n[currentLang] || i18n.en)[key] ?? i18n.en[key] ?? key;
}

function pickLang(obj, key) {
    if (currentLang === 'th') {
        const val = String(obj[`${key}_TH`] || '').trim();
        if (val) return val;
    }
    return String(obj[key] || '');
}

function detectLang() {
    const saved = localStorage.getItem('portfolio_lang');
    if (saved === 'en' || saved === 'th') return saved;
    return (navigator.language || '').toLowerCase().startsWith('th') ? 'th' : 'en';
}

function applyLang(lang) {
    currentLang = lang;
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

    if (_profileData) renderProfile(_profileData);
    if (_skillsData) renderSkills(_skillsData);
    if (_toolsData) renderTools(_toolsData);
    if (allProjects.length > 0) { renderRecentProjects(); renderProjects(); }
}

function initLang() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => applyLang(btn.dataset.lang));
    });
    applyLang(detectLang());
}

// ── Workbook ──────────────────────────────────────────────

async function loadWorkbook() {
    const response = await fetch('data.xlsx');
    if (!response.ok) throw new Error(`HTTP ${response.status} loading data.xlsx`);
    const buffer = await response.arrayBuffer();
    return XLSX.read(buffer, { type: 'array' });
}

function getSheetData(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) return [];
    return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
}

async function loadManifest() {
    try {
        const res = await fetch('images/manifest.json');
        if (res.ok) imageManifest = await res.json();
    } catch (e) {
        console.warn('No manifest found');
    }
}

async function loadAll() {
    await loadManifest();

    let workbook;
    try {
        workbook = await loadWorkbook();
    } catch (e) {
        console.warn('data.xlsx failed, using mock data:', e.message);
        renderProfile(mockData.profile[0]);
        allProjects = mockData.projects.map(p => ({
            'Project name': p.Project_Name, 'Project overview': p.Description,
            'Skills and Tools': p.Technologies, 'Project URL': p.Demo_Link,
            'Image_Folder': '', Duration: p.Date
        }));
        renderRecentProjects();
        initCategoryTabs();
        initSearch();
        applyFilters();
        renderSkills(mockData.skills);
        return;
    }

    try { renderProfile(getSheetData(workbook, 'Profile')[0] || {}); } catch(e) { console.error('Profile:', e); }

    try {
        const projectRows = getSheetData(workbook, 'Project');
        allProjects = projectRows.filter(row => String(row['Project name']).trim());
        renderRecentProjects();
        updateTabCounts();
        initCategoryTabs();
        initSearch();
        applyFilters();
    } catch(e) { console.error('Projects:', e); }

    try { renderExperience(getSheetData(workbook, 'Experience')); } catch(e) { console.error('Experience:', e); }
    try { renderEducation(getSheetData(workbook, 'Education')); } catch(e) { console.error('Education:', e); }
    try { renderCertifications(getSheetData(workbook, 'Certifications')); } catch(e) { console.error('Certifications:', e); }
    try { renderAwards(getSheetData(workbook, 'Awards')); } catch(e) { console.error('Awards:', e); }
    try { renderSkills(getSheetData(workbook, 'Skills')); } catch(e) { console.error('Skills:', e); }
    try { renderTools(getSheetData(workbook, 'Tools')); } catch(e) { console.error('Tools:', e); }
}

// ── Profile ───────────────────────────────────────────────

function renderProfile(profile) {
    _profileData = profile;

    const name = pickLang(profile, 'Name') || '';
    document.getElementById('home-name').textContent = name;
    const navBrand = document.getElementById('nav-name');
    if (navBrand) navBrand.textContent = name;

    const title = pickLang(profile, 'Title');
    const titleEl = document.getElementById('home-title');
    titleEl.textContent = title;
    titleEl.style.display = title ? '' : 'none';

    document.getElementById('home-intro').textContent = pickLang(profile, 'Intro') || pickLang(profile, 'Bio');

    const photo = document.getElementById('home-photo');
    if (profile.Photo_URL) photo.src = profile.Photo_URL;
    else photo.style.display = 'none';

    document.getElementById('about-bio').textContent = pickLang(profile, 'Bio') || pickLang(profile, 'Intro');
    const loc = pickLang(profile, 'Location');
    document.getElementById('about-location').textContent = loc ? `📍 ${loc}` : '';
}

// ── Experience ────────────────────────────────────────────

function renderExperience(data) {
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
                    <span class="timeline-role">${escapeHtml(item.Role || '')}</span>
                    <span class="timeline-period">${escapeHtml(item.Period || '')}</span>
                </div>
                <div class="timeline-company">${escapeHtml(item.Company || '')}</div>
                <p class="timeline-desc">${escapeHtml(item.Description || '')}</p>
            </div>
        `;
        list.appendChild(div);
    });
}

// ── Education ─────────────────────────────────────────────

function renderEducation(data) {
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

// ── Certifications ────────────────────────────────────────

function renderCertifications(data) {
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

// ── Awards ────────────────────────────────────────────────

function renderAwards(data) {
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

// ── Recent projects (home preview) ───────────────────────

function renderRecentProjects() {
    const container = document.getElementById('recent-projects-list');
    if (!container) return;
    container.innerHTML = '';
    allProjects.slice(0, 3).forEach(project => {
        const folder = String(project['Image_Folder'] || '').trim();
        const logoSrc = folder
            ? (imageManifest[folder] || []).map(f => `images/${folder}/${f}`).find(isLogoFile)
            : null;
        const card = document.createElement('div');
        card.className = 'recent-card';
        card.innerHTML = `
            ${logoSrc ? `<img class="recent-logo" src="${escapeHtml(logoSrc)}" alt="${escapeHtml(pickLang(project, 'Project name'))} logo">` : ''}
            <div class="recent-info">
                <h4>${escapeHtml(pickLang(project, 'Project name') || '')}</h4>
                ${project.Duration ? `<p class="recent-duration">${escapeHtml(project.Duration)}</p>` : ''}
                <p class="recent-overview">${escapeHtml(pickLang(project, 'Project overview') || '')}</p>
            </div>
        `;
        card.onclick = () => navigate('projects');
        container.appendChild(card);
    });
}

// ── Projects (full list) ──────────────────────────────────

function getBaseProjects() {
    return currentCategory === 'all'
        ? allProjects
        : allProjects.filter(p => p['Project_Category'] === currentCategory);
}

function applyFilters() {
    const q = (document.getElementById('project-search')?.value || '').trim().toLowerCase();
    const base = getBaseProjects();
    filteredProjects = q
        ? base.filter(p =>
            [p['Project name'], p['Project overview'], p['Skills and Tools'], p['Duration']]
                .some(f => String(f || '').toLowerCase().includes(q)))
        : base;
    currentPage = 1;
    renderProjects();
}

function initSearch() {
    const input = document.getElementById('project-search');
    if (!input) return;
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(applyFilters, 250);
    });
}

function updateTabCounts() {
    document.querySelectorAll('.project-tab').forEach(btn => {
        const cat = btn.dataset.category;
        const count = cat === 'all'
            ? allProjects.length
            : allProjects.filter(p => p['Project_Category'] === cat).length;
        const el = btn.querySelector('.tab-count');
        if (el) el.textContent = `(${count})`;
    });
}

function initCategoryTabs() {
    document.querySelectorAll('.project-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            document.querySelectorAll('.project-tab')
                .forEach(b => b.classList.toggle('tab-active', b === btn));
            const search = document.getElementById('project-search');
            if (search) search.value = '';
            applyFilters();
        });
    });
}

function renderProjects() {
    const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
    const start = (currentPage - 1) * PROJECTS_PER_PAGE;
    const pageProjects = filteredProjects.slice(start, start + PROJECTS_PER_PAGE);

    const countEl = document.getElementById('search-count');
    if (countEl) {
        const n = filteredProjects.length;
        countEl.textContent = currentLang === 'th'
            ? `${n} โปรเจค`
            : `${n} project${n !== 1 ? 's' : ''}`;
    }

    const list = document.getElementById('projects-list');
    list.innerHTML = '';

    if (filteredProjects.length === 0) {
        list.innerHTML = `<p class="no-results">${t('no_results')}</p>`;
    }

    pageProjects.forEach(project => {
        const div = document.createElement('div');
        div.className = 'project';

        const left = document.createElement('div');
        left.className = 'project-left';
        const projectName = pickLang(project, 'Project name');
        const cat = project['Project_Category'] || '';
        const catLabel = currentCategory === 'all' && cat
            ? `<span class="project-cat project-cat--${cat.toLowerCase().replace(/[^a-z]/g, '')}">${escapeHtml(cat)}</span>`
            : '';
        left.innerHTML = `
            <h3>${escapeHtml(projectName || '')}</h3>
            ${catLabel}
            ${project.Duration ? `<p class="duration">${escapeHtml(project.Duration)}</p>` : ''}
            ${project['Project URL'] ? `<p class="link"><a href="${escapeHtml(project['Project URL'])}" target="_blank" rel="noopener">View Project ↗</a></p>` : ''}
        `;

        const overview = pickLang(project, 'Project overview');
        const roles    = pickLang(project, 'Roles and Responsibility');
        const tools    = project['Skills and Tools'];

        const right = document.createElement('div');
        right.className = 'project-right';
        right.innerHTML = `
            ${overview ? `
            <div class="project-detail">
                <p class="detail-label">${t('label_overview')}</p>
                <p class="overview">${escapeHtml(overview)}</p>
            </div>` : ''}
            ${roles ? `
            <div class="project-detail">
                <p class="detail-label">${t('label_roles')}</p>
                <p class="roles">${escapeHtml(roles)}</p>
            </div>` : ''}
            ${tools ? `
            <div class="project-detail">
                <p class="detail-label">${t('label_tools')}</p>
                <p class="tools">${escapeHtml(tools)}</p>
            </div>` : ''}
        `;

        const folder = String(project['Image_Folder'] || '').trim();
        const youtube = String(project['YouTube'] || '').trim();
        const { logoEl, galleryEl } = buildProjectMedia(folder, youtube);
        if (logoEl) left.prepend(logoEl);
        if (galleryEl) right.appendChild(galleryEl);

        div.append(left, right);
        list.appendChild(div);
    });

    const pagination = document.getElementById('projects-pagination');
    pagination.innerHTML = '';
    if (totalPages > 1) {
        const prev = document.createElement('button');
        prev.textContent = t('pagination_prev');
        prev.disabled = currentPage <= 1;
        prev.onclick = () => { currentPage--; renderProjects(); scrollToProjects(); };

        const info = document.createElement('span');
        info.textContent = `${currentPage} / ${totalPages}`;

        const next = document.createElement('button');
        next.textContent = t('pagination_next');
        next.disabled = currentPage >= totalPages;
        next.onclick = () => { currentPage++; renderProjects(); scrollToProjects(); };

        pagination.append(prev, info, next);
    }
}

function scrollToProjects() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Skills ────────────────────────────────────────────────

function renderSkills(data) {
    _skillsData = data;
    const container = document.getElementById('skills-list');
    if (!container) return;
    container.innerHTML = '';

    const levelKeys = { 5: 'level_expert', 4: 'level_advanced', 3: 'level_intermediate', 2: 'level_beginner', 1: 'level_beginner' };
    const levelCss  = { 5: 'expert', 4: 'advanced', 3: 'intermediate', 2: 'beginner', 1: 'beginner' };
    const levelOrder = [5, 4, 3, 2, 1];

    const groups = {};
    data.forEach(skill => {
        const lvl = parseInt(skill.Level) || 0;
        const key = levelKeys[lvl] || 'level_beginner';
        if (!groups[key]) groups[key] = [];
        groups[key].push(pickLang(skill, 'Skill_Name'));
    });

    const groupsEl = document.createElement('div');
    groupsEl.className = 'skills-groups';

    const seen = new Set();
    levelOrder.forEach(lvl => {
        const key = levelKeys[lvl];
        if (seen.has(key) || !groups[key]) return;
        seen.add(key);

        const row = document.createElement('div');
        row.className = 'skill-level-group';
        const badge = document.createElement('span');
        badge.className = `skill-level-label skill-level--${levelCss[lvl]}`;
        badge.textContent = t(key);
        const tagsEl = document.createElement('div');
        tagsEl.className = 'skill-tags';
        groups[key].forEach(name => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = name;
            tagsEl.appendChild(tag);
        });
        row.append(badge, tagsEl);
        groupsEl.appendChild(row);
    });

    container.appendChild(groupsEl);
}

// ── Tools ─────────────────────────────────────────────────

const TOOL_CAT_ORDER = [
    ['Test Management', 'tool_cat_test_management'],
    ['Automation',      'tool_cat_automation'],
    ['API Testing',     'tool_cat_api'],
    ['Performance',     'tool_cat_performance'],
    ['CI/CD',           'tool_cat_cicd'],
    ['Version Control', 'tool_cat_vcs'],
    ['Database',        'tool_cat_database'],
    ['Monitoring',      'tool_cat_monitoring'],
    ['Collaboration',   'tool_cat_collaboration'],
    ['Device / Platform', 'tool_cat_device'],
];

function renderTools(data) {
    _toolsData = data;
    console.log('[renderTools] called, rows:', data.length);
    const container = document.getElementById('tools-list');
    if (!container) { console.warn('[renderTools] container not found'); return; }
    container.innerHTML = '';

    const groups = {};
    data.forEach(row => {
        const cat = String(row['Category'] || '').trim();
        const name = String(row['Tool_Name'] || '').trim();
        if (!cat || !name) return;
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(name);
    });

    const groupsEl = document.createElement('div');
    groupsEl.className = 'skills-groups';

    const rendered = new Set();
    TOOL_CAT_ORDER.forEach(([cat, i18nKey]) => {
        if (!groups[cat]) return;
        rendered.add(cat);
        const row = document.createElement('div');
        row.className = 'skill-level-group';
        const badge = document.createElement('span');
        badge.className = 'skill-level-label skill-level--tool';
        badge.textContent = t(i18nKey);
        const tagsEl = document.createElement('div');
        tagsEl.className = 'skill-tags';
        groups[cat].forEach(name => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = name;
            tagsEl.appendChild(tag);
        });
        row.append(badge, tagsEl);
        groupsEl.appendChild(row);
    });

    // fallback: categories not in TOOL_CAT_ORDER
    Object.keys(groups).filter(c => !rendered.has(c)).forEach(cat => {
        const row = document.createElement('div');
        row.className = 'skill-level-group';
        const badge = document.createElement('span');
        badge.className = 'skill-level-label skill-level--tool';
        badge.textContent = cat;
        const tagsEl = document.createElement('div');
        tagsEl.className = 'skill-tags';
        groups[cat].forEach(name => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.textContent = name;
            tagsEl.appendChild(tag);
        });
        row.append(badge, tagsEl);
        groupsEl.appendChild(row);
    });

    container.appendChild(groupsEl);
}

// ── Media / Gallery ───────────────────────────────────────

function isLogoFile(path) {
    const name = path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
    return name === 'logo' || name.endsWith('_logo') || name.startsWith('logo_');
}

function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    const img = document.createElement('img');
    img.src = src; img.alt = alt || '';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    overlay.append(img, closeBtn);
    document.body.appendChild(overlay);
    function close() { overlay.remove(); document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    requestAnimationFrame(() => overlay.classList.add('visible'));
}

function extractYouTubeId(url) {
    const match = url.trim().match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
    return match ? match[1] : null;
}

function parseYouTubeItems(field) {
    if (!field) return [];
    return field.split(',').map(u => u.trim()).filter(Boolean)
        .map(u => ({ type: 'youtube', videoId: extractYouTubeId(u) }))
        .filter(item => item.videoId);
}

function buildProjectMedia(folder, youtubeField) {
    const allFiles = (imageManifest[folder] || []).map(f => `images/${folder}/${f}`);
    const logoSrc = allFiles.find(isLogoFile) || null;
    const imageItems = allFiles.filter(p => !isLogoFile(p)).map(src => ({ type: 'image', src }));
    const videoItems = parseYouTubeItems(youtubeField);
    const allItems = [...videoItems, ...imageItems];
    if (youtubeField) console.log('[media]', folder, '| youtube:', youtubeField, '| videoItems:', videoItems.length, '| allItems:', allItems.length);

    let logoEl = null;
    if (logoSrc) {
        logoEl = document.createElement('img');
        logoEl.src = logoSrc;
        logoEl.className = 'project-logo';
        logoEl.alt = `${folder} logo`;
        logoEl.title = 'Click to enlarge';
        logoEl.onclick = () => openLightbox(logoSrc, `${folder} logo`);
    }

    const galleryEl = allItems.length > 0 ? createGallery(allItems, folder) : null;
    return { logoEl, galleryEl };
}

function createGallery(items, altPrefix) {
    let current = 0;
    const wrapper = document.createElement('div');
    wrapper.className = 'gallery';
    const row = document.createElement('div');
    row.className = 'gallery-row';
    const frame = document.createElement('div');
    frame.className = 'gallery-frame';
    const prevBtn = document.createElement('button');
    prevBtn.className = 'gallery-arrow gallery-arrow--prev';
    prevBtn.setAttribute('aria-label', t('gallery_prev'));
    prevBtn.innerHTML = '&#8592;';
    const mediaSlot = document.createElement('div');
    mediaSlot.className = 'gallery-media';
    const nextBtn = document.createElement('button');
    nextBtn.className = 'gallery-arrow gallery-arrow--next';
    nextBtn.setAttribute('aria-label', t('gallery_next'));
    nextBtn.innerHTML = '&#8594;';
    frame.append(mediaSlot);
    row.append(prevBtn, frame, nextBtn);

    const dotsEl = document.createElement('div');
    dotsEl.className = 'gallery-dots';
    const dots = items.map((item, i) => {
        const d = document.createElement('button');
        d.className = 'gallery-dot' + (item.type === 'youtube' ? ' gallery-dot--video' : '');
        d.setAttribute('aria-label', item.type === 'youtube' ? `Video ${i + 1}` : `Image ${i + 1}`);
        d.innerHTML = item.type === 'youtube' ? '▶' : '';
        d.onclick = () => { current = i; update(); };
        return d;
    });
    if (dots.length > 1) dotsEl.append(...dots);
    wrapper.append(row, dotsEl);

    function renderMedia(item) {
        mediaSlot.innerHTML = '';
        if (item.type === 'image') {
            const img = document.createElement('img');
            img.src = item.src; img.className = 'gallery-img'; img.alt = altPrefix;
            img.title = 'Click to enlarge';
            img.onclick = () => openLightbox(item.src, altPrefix);
            mediaSlot.appendChild(img);
        } else if (item.type === 'youtube') {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${item.videoId}?rel=0`;
            iframe.className = 'gallery-video';
            iframe.title = 'YouTube video';
            iframe.setAttribute('allowfullscreen', '');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
            mediaSlot.appendChild(iframe);
        }
    }

    function update() {
        renderMedia(items[current]);
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === items.length - 1;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    prevBtn.onclick = () => { current--; update(); };
    nextBtn.onclick = () => { current++; update(); };
    update();
    return wrapper;
}

// ── Theme ─────────────────────────────────────────────────

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? 'Light' : 'Dark';
}

function initTheme() {
    const saved = localStorage.getItem('portfolio_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('portfolio_theme', next);
        applyTheme(next);
    });
}

// ── Utilities ─────────────────────────────────────────────

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => { initTheme(); initLang(); initNav(); loadAll(); });
