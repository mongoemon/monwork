export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function normalizeLines(str) {
    return String(str)
        .replace(/\r+\n/g, '\n')    // Excel \r\r\r\n artifacts → single LF
        .replace(/\r+/g, '\n')      // bare CRs → LF
        .replace(/\n{3,}/g, '\n\n') // cap at two consecutive newlines
        .trim();
}

export function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}
