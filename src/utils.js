// Utility Functions Module

// Basic utility functions
const norm = (v) => (v == null ? "" : String(v).replace(/\s+/g, " ").trim());
const keyify = (v) => {
    const s = norm(v).toLowerCase();
    return s.length ? s : null;
};
const getColCI = (obj, name) =>
    obj ? Object.keys(obj).find((k) => k.trim().toLowerCase() === name.trim().toLowerCase()) : null;
const getVal = (obj, name) => {
    const k = getColCI(obj, name);
    return k ? obj[k] : undefined;
};
const uniqueSorted = (arr) => [...new Set((arr || []).filter((v) => v != null && v !== ""))].sort((a, b) => String(a).localeCompare(String(b)));

// Progress functions
function showProgress(show = true) {
    const w = document.getElementById("progressWrap");
    if (w) w.style.display = show ? "block" : "none";
}

function setProgress(pct, label) {
    const p = Math.max(0, Math.min(100, Math.round(pct)));
    const fill = document.getElementById("pFill");
    const txt = document.getElementById("pPct");
    const lab = document.getElementById("pLabel");
    if (fill) fill.style.width = p + "%";
    if (txt) txt.textContent = p + "%";
    if (lab && label) lab.textContent = label;
}

function resetProgress() {
    showProgress(false);
    setProgress(0, "Loading…");
}

// Date formatting helper
function formatLocalDateTime(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    const y = d.getFullYear();
    const m = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`;
}