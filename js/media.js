import { state } from './state.js';
import { t } from './i18n.js';

export function isLogoFile(path) {
    const name = path.split('/').pop().replace(/\.[^.]+$/, '').toLowerCase();
    return name === 'logo' || name.endsWith('_logo') || name.startsWith('logo_');
}

export function openLightbox(src, alt) {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.textContent = '×';
    overlay.append(img, closeBtn);
    document.body.appendChild(overlay);

    function close() {
        overlay.remove();
        document.removeEventListener('keydown', onKey);
    }
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

export function buildProjectMedia(folder, youtubeField) {
    const allFiles = (state.imageManifest[folder] || []).map(f => `images/${folder}/${f}`);
    const logoSrc = allFiles.find(isLogoFile) || null;
    const imageItems = allFiles.filter(p => !isLogoFile(p)).map(src => ({ type: 'image', src }));
    const videoItems = parseYouTubeItems(youtubeField);
    const allItems = [...videoItems, ...imageItems];

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

export function createGallery(items, altPrefix) {
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
            img.src = item.src;
            img.className = 'gallery-img';
            img.alt = altPrefix;
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
