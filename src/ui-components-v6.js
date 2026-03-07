// UI Components Module

// ===== Required columns =====
const REQUIRED_KEYS = [
  "Source",
  "Computer Name",
  "Remote Office",
  "Region",
  "Markets",
  "Domain",
  "Last Contact Time",
  "Days Since Last Contact",
  "Offline days",
  "Severity",
  "Vulnerabilities",
  "Category",
  "Sub-category",
  "Patch Name",
  "Patch ID",
  "Patch Availability",
  "Exploit Status",
  "CVSS 3.0 Score",
  "CVSS 2.0 Score",
  "Published Date",
  "Supported Date",
  "Updated Date",
  "Discovered Date",
  "Operating System",
  "Service Pack",
];
const HEADERS_EN = Object.fromEntries(REQUIRED_KEYS.map((k) => [k, k]));

// ===== Multi-dropdown component =====
function createMultiDropdown(el, label, values, onChange) {
  if (!el)
    return {
      getSelected() { return []; },
      setSelected() {},
      setValues() {},
      destroy() {},
    };

  // Normaliza y ordena
  values = uniqueSorted(values || []);
  el.classList.add("mdrop");
  el.innerHTML = "";

  let allMode = true;
  const selected = new Set();

  // Botón del dropdown
  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "trigger";
  const spanL = document.createElement("span");
  spanL.textContent = label;
  const spanS = document.createElement("span");
  spanS.className = "summary";
  spanS.textContent = "(All)";
  trigger.appendChild(spanL);
  trigger.appendChild(spanS);
  el.appendChild(trigger);

  // Panel flotante
  const panel = document.createElement("div");
  panel.className = "mdrop-panel";
  panel.style.position = "fixed";
  panel.style.display = "none";
  panel.style.zIndex = "9999";
  panel.style.left = "0px";
  panel.style.top = "0px";
  panel.innerHTML = `
    <div class="head">
      <input type="text" placeholder="Search..." />
      <button type="button" class="hbtn" data-action="all">All</button>
      <button type="button" class="hbtn" data-action="none">None</button>
      <button type="button" class="hbtn" data-action="close">Close</button>
    </div>
    <div class="list"></div>
  `;
  document.body.appendChild(panel);

  const list = panel.querySelector(".list");
  const search = panel.querySelector("input");
  const btnAll = panel.querySelector('[data-action="all"]');
  const btnNone = panel.querySelector('[data-action="none"]');
  const btnClose = panel.querySelector('[data-action="close"]');

  const isChecked = (v) => (allMode ? true : selected.has(v));

  function updateSummary() {
    const sumEl = trigger.querySelector(".summary");
    if (!sumEl) return;
    if (allMode) { sumEl.textContent = "(All)"; return; }
    if (selected.size === 0) { sumEl.textContent = "(None)"; return; }
    if (selected.size === values.length) {
      allMode = true; selected.clear(); sumEl.textContent = "(All)"; return;
    }
    const arr = [...selected];
    sumEl.textContent = arr.slice(0, 3).join(", ") + (arr.length > 3 ? ` +${arr.length - 3}` : "");
  }

  function renderList(filter = "") {
    list.innerHTML = "";
    const q = (filter || "").toLowerCase();
    values
      .filter((v) => !q || String(v).toLowerCase().includes(q))
      .forEach((v) => {
        const item = document.createElement("div");
        item.className = "item";
        const id = (label + "_" + String(v)).replace(/[^a-z0-9]+/gi, "_");

        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.id = id;
        cb.checked = isChecked(v);

        const lab = document.createElement("label");
        lab.setAttribute("for", id);
        lab.textContent = String(v);

        cb.addEventListener("change", (e) => {
          const checked = e.target.checked;
          if (allMode) {
            // al primer cambio, salimos de "All"
            allMode = false;
            selected.clear();
            values.forEach((x) => selected.add(x));
          }
          if (checked) selected.add(v);
          else selected.delete(v);

          // si quedó todo marcado => regresar a All
          if (selected.size === values.length) {
            allMode = true;
            selected.clear();
          }
          updateSummary();
          if (typeof onChange === "function") onChange();
        });

        item.appendChild(cb);
        item.appendChild(lab);
        list.appendChild(item);
      });
  }

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  function positionPanel() {
    const r = trigger.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const desiredWidth = Math.max(280, r.width);
    const width = Math.min(desiredWidth, vw - margin * 2);
    panel.style.width = width + "px";
    panel.style.maxHeight = Math.min(380, vh - margin * 2) + "px";
    panel.style.visibility = "hidden";
    panel.style.display = "block";

    const panelH = Math.min(panel.scrollHeight, parseInt(panel.style.maxHeight, 10) || 380);
    const belowSpace = vh - r.bottom - margin;
    const aboveSpace = r.top - margin;
    let top;
    if (belowSpace >= 220 || belowSpace >= aboveSpace) {
      top = r.bottom + 6;
      top = Math.min(top, vh - margin - panelH);
    } else {
      top = r.top - 6 - panelH;
      top = Math.max(top, margin);
    }
    const left = clamp(r.left, margin, vw - margin - width);
    panel.style.left = left + "px";
    panel.style.top = top + "px";
    panel.style.visibility = "visible";
  }

  function openPanel() {
    positionPanel();
    panel.style.display = "block";
    renderList(search ? search.value : "");
    updateSummary();
    setTimeout(() => search && search.focus(), 0);
  }
  function closePanel() { panel.style.display = "none"; }
  function isOpen() { return panel.style.display !== "none"; }

  // Eventos del panel
  trigger.addEventListener("click", () => { isOpen() ? closePanel() : openPanel(); });
  btnAll && btnAll.addEventListener("click", () => {
    allMode = true; selected.clear();
    renderList(search ? search.value : ""); updateSummary();
    if (typeof onChange === "function") onChange();
  });
  btnNone && btnNone.addEventListener("click", () => {
    allMode = false; selected.clear();
    renderList(search ? search.value : ""); updateSummary();
    if (typeof onChange === "function") onChange();
  });
  btnClose && btnClose.addEventListener("click", closePanel);
  search && search.addEventListener("input", () => renderList(search.value));
  document.addEventListener("click", (e) => { if (panel.contains(e.target) || trigger.contains(e.target)) return; closePanel(); });
  window.addEventListener("resize", () => { if (isOpen()) positionPanel(); });
  window.addEventListener("scroll", () => { if (isOpen()) positionPanel(); }, true);

  updateSummary(); renderList("");

  // API pública
  return {
    getSelected() { return allMode ? [] : [...selected]; },
    setSelected(arr) {
      const a = (arr || []).map(String);
      if (a.length === 0) {
        allMode = true; selected.clear();
      } else {
        allMode = false; selected.clear();
        const ok = new Set(values.map(String));
        a.forEach((v) => { if (ok.has(v)) selected.add(v); });
        if (selected.size === values.length) { allMode = true; selected.clear(); }
      }
      renderList(search ? search.value : ""); updateSummary();
      if (typeof onChange === "function") onChange();
    },
    // NUEVO: refresca el conjunto de opciones del dropdown (para filtros dependientes)
    setValues(newValues, keepSelected = []) {
      values = uniqueSorted(newValues || []);
      if (!Array.isArray(keepSelected) || keepSelected.length === 0) {
        if (!allMode) {
          const before = new Set(selected);
          selected.clear();
          values.forEach(v => { if (before.has(v)) selected.add(v); });
          if (selected.size === values.length) { allMode = true; selected.clear(); }
        }
      } else {
        allMode = false; selected.clear();
        const ok = new Set(values.map(String));
        keepSelected.forEach(v => { if (ok.has(String(v))) selected.add(v); });
        if (selected.size === 0) allMode = true;
        if (selected.size === values.length) { allMode = true; selected.clear(); }
      }
      renderList(search ? search.value : ""); updateSummary();
      if (typeof onChange === "function") onChange();
    }
  };
}

// ===== Tables helpers =====
function pickRequired(row) {
  const o = {};
  REQUIRED_KEYS.forEach((k) => {
    o[k] = row && Object.prototype.hasOwnProperty.call(row, k) ? row[k] : "";
  });
  return o;
}

function ensureSections(tableEl) {
  if (!tableEl) return { thead: null, tbody: null };
  let thead = tableEl.querySelector("thead"),
    tbody = tableEl.querySelector("tbody");
  if (!thead) {
    thead = document.createElement("thead");
    tableEl.appendChild(thead);
  }
  if (!tbody) {
    tbody = document.createElement("tbody");
    tableEl.appendChild(tbody);
  }
  return { thead, tbody };
}

// Optimized table rendering with virtual scrolling
function renderTable(tableEl, rows) {
  const sec = ensureSections(tableEl);
  if (!sec.thead || !sec.tbody) return;
  
  // Clear previous content
  sec.thead.innerHTML = "<tr>" + REQUIRED_KEYS.map((k) => `<th>${HEADERS_EN[k] || k}</th>`).join("") + "</tr>";
  sec.tbody.innerHTML = "";
  
  const allRows = rows || [];
  const displayRows = allRows.slice(0, 1000); // Show first 1000 rows immediately
  
  // Add info message if there are more rows
  if (allRows.length > 1000) {
    const infoRow = document.createElement("tr");
    const infoCell = document.createElement("td");
    infoCell.colSpan = REQUIRED_KEYS.length;
    infoCell.style.textAlign = "center";
    infoCell.style.fontStyle = "italic";
    infoCell.style.color = "var(--muted)";
    infoCell.textContent = `Showing first 1000 of ${allRows.length} rows. Export includes all rows.`;
    infoRow.appendChild(infoCell);
    sec.tbody.appendChild(infoRow);
  }
  
  // Render rows in chunks to prevent blocking
  renderTableRowsChunked(sec.tbody, displayRows, REQUIRED_KEYS, (row, col) => {
    if (col.includes("Source")) {
      const rowIndex = displayRows.indexOf(row) + 1;
      const sourceValue = row.needsCurrentCheck ? "Prev+Curr" : "Prev";
      return `${rowIndex}. ${sourceValue}`;
    }
    const pr = pickRequired(row);
    return pr[col] ?? "";
  });
}

function renderMergedTable(tableEl, rows) {
  const sec = ensureSections(tableEl);
  if (!sec.thead || !sec.tbody) return;
  
  const header = REQUIRED_KEYS.map((k) => `${k} (prev)`).concat(REQUIRED_KEYS.map((k) => `${k} (curr)`));
  sec.thead.innerHTML =
    "<tr>" +
    header
      .map((h) => {
        const k = h.replace(" (prev)", "").replace(" (curr)", "");
        return `<th>${HEADERS_EN[k] || k} ${h.endsWith("(prev)") ? "(prev)" : "(curr)"}</th>`;
      })
      .join("") +
    "</tr>";
  sec.tbody.innerHTML = "";
  
  const allRows = rows || [];
  const displayRows = allRows.slice(0, 1000); // Show first 1000 rows immediately
  
  // Add info message if there are more rows
  if (allRows.length > 1000) {
    const infoRow = document.createElement("tr");
    const infoCell = document.createElement("td");
    infoCell.colSpan = header.length;
    infoCell.style.textAlign = "center";
    infoCell.style.fontStyle = "italic";
    infoCell.style.color = "var(--muted)";
    infoCell.textContent = `Showing first 1000 of ${allRows.length} rows. Export includes all rows.`;
    infoRow.appendChild(infoCell);
    sec.tbody.appendChild(infoRow);
  }
  
  // Render rows in chunks
  renderTableRowsChunked(sec.tbody, displayRows, header, (row, col) => row[col]);
}

// Helper function to render table rows in chunks
function renderTableRowsChunked(tbody, rows, columns, getCellValue) {
  const chunkSize = 50; // Render 50 rows at a time
  let currentIndex = 0;
  
  function renderChunk() {
    const endIndex = Math.min(currentIndex + chunkSize, rows.length);
    const fragment = document.createDocumentFragment();
    
    for (let i = currentIndex; i < endIndex; i++) {
      const r = rows[i];
      const tr = document.createElement("tr");
      
      columns.forEach((col) => {
        const td = document.createElement("td");
        const value = getCellValue(r, col);
        const displayValue = (value ?? "") + "";
        
        // Set cell content
        td.textContent = displayValue;
        
        // Add tooltip if text is too long
        if (displayValue.length > 50) {
          td.title = displayValue; // Native HTML tooltip
          td.style.maxWidth = "200px";
          td.style.overflow = "hidden";
          td.style.textOverflow = "ellipsis";
          td.style.whiteSpace = "nowrap";
        }
        
        tr.appendChild(td);
      });
      
      fragment.appendChild(tr);
    }
    
    tbody.appendChild(fragment);
    currentIndex = endIndex;
    
    if (currentIndex < rows.length) {
      // Schedule next chunk
      requestAnimationFrame(renderChunk);
    }
  }
  
  renderChunk();
}

// ===== Pivots =====
function buildPivotSevRegion(rows) {
  const sev = uniqueSorted(
    (rows || []).map((r) => (getVal(r, "Severity") ?? "").toString().trim())
  );
  const reg = uniqueSorted(
    (rows || []).map((r) => (getVal(r, "Region") ?? "").toString().trim())
  );
  const mat = {};
  sev.forEach((s) => {
    mat[s] = {};
    reg.forEach((g) => (mat[s][g] = 0));
  });
  (rows || []).forEach((r) => {
    const s = (getVal(r, "Severity") ?? "").toString().trim();
    const g = (getVal(r, "Region") ?? "").toString().trim();
    if (s in mat && g in mat[s]) mat[s][g] += 1;
  });
  return { sev, reg, mat };
}

function renderPivotTable(tableEl, pv) {
  const sec = ensureSections(tableEl);
  if (!sec.thead || !sec.tbody) return;
  const { sev, reg, mat } = pv;
  sec.thead.innerHTML = "";
  sec.tbody.innerHTML = "";
  if (!sev.length && !reg.length) return;

  const trh = document.createElement("tr"),
    th0 = document.createElement("th");
  th0.textContent = "Severity \\ Region";
  trh.appendChild(th0);
  reg.forEach((r) => {
    const th = document.createElement("th");
    th.textContent = r;
    trh.appendChild(th);
  });
  const thT = document.createElement("th");
  thT.textContent = "Total";
  trh.appendChild(thT);
  sec.thead.appendChild(trh);

  sev.forEach((s) => {
    const tr = document.createElement("tr");
    const td0 = document.createElement("td");
    td0.textContent = s;
    tr.appendChild(td0);
    let sum = 0;
    reg.forEach((g) => {
      const v = mat[s][g] || 0;
      const td = document.createElement("td");
      td.textContent = v;
      tr.appendChild(td);
      sum += v;
    });
    const tdT = document.createElement("td");
    tdT.textContent = sum;
    tr.appendChild(tdT);
    sec.tbody.appendChild(tr);
  });

  const trTot = document.createElement("tr");
  const tdLab = document.createElement("td");
  tdLab.textContent = "Total";
  trTot.appendChild(tdLab);
  let grand = 0;
  reg.forEach((g) => {
    let col = 0;
    sev.forEach((s) => (col += mat[s][g] || 0));
    const td = document.createElement("td");
    td.textContent = col;
    trTot.appendChild(td);
    grand += col;
  });
  const tdG = document.createElement("td");
  tdG.textContent = grand;
  trTot.appendChild(tdG);
  sec.tbody.appendChild(trTot);
}

// ===== Charts =====
function renderCharts(nNew, nRem, nPers, newRows, currKeyRows, keyMode, barChart, pieChart, valueLabelPlugin) {
  // Destroy existing charts if they exist
  if (barChart) {
    barChart.destroy();
    barChart = null;
  }
  if (pieChart) {
    pieChart.destroy();
    pieChart = null;
  }

  const ctxB = document.getElementById("chartBars")?.getContext("2d");
  if (ctxB) {
    barChart = new Chart(ctxB, {
      type: "bar",
      data: {
        labels: ["New", "Remediated", "Persistent"],
        datasets: [
          {
            label: "Count",
            data: [nNew, nRem, nPers],
            backgroundColor: ["#60a5fa", "#34d399", "#fbbf24"],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
      plugins: [valueLabelPlugin],
    });
  }

  // === Pie for Curr (keys) by Severity ===
  const sevCounts = {};
  (currKeyRows || []).forEach((r) => {
    const s = (getVal(r, "Severity") ?? "").toString().trim() || "Unknown";
    sevCounts[s] = (sevCounts[s] || 0) + 1;
  });
  const labels = Object.keys(sevCounts);
  const data = Object.values(sevCounts);
  const colorBySev = (s) => {
    const k = (s || "").toLowerCase();
    if (k.includes("critical")) return "#ef4444";
    if (k.includes("important") || k.includes("high")) return "#f59e0b";
    if (k.includes("moderate") || k.includes("medium")) return "#10b981";
    if (k.includes("low")) return "#3b82f6";
    return "#8b5cf6";
  };
  const ctxP = document.getElementById("chartPie")?.getContext("2d");
  if (ctxP) {
    pieChart = new Chart(ctxP, {
      type: "pie",
      data: {
        labels,
        datasets: [{ data, backgroundColor: labels.map(colorBySev) }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom", labels: { color: "#e9eefb" } } },
      },
      plugins: [valueLabelPlugin],
    });
  }

  const hl = document.getElementById("highlights");
  if (hl) {
    const modeLabel =
      keyMode === "endpoint"
        ? "Vulnerabilities + Computer Name (endpoint)"
        : "Vulnerabilities (global)";
    hl.innerHTML = `
      <div>Key mode: <b>${modeLabel}</b></div>
      <div>New: <b>${nNew}</b> · Remediated: <b>${nRem}</b> · Persistent: <b>${nPers}</b></div>
    `;
  }

  // Return the updated chart instances
  return { barChart, pieChart };
}