/* ============================================================
   UTMESchools v2 — select-subjects.js
   Fixed: sheet opens, English pre-selected, all bugs fixed
   ============================================================ */

const ALL_SUBJECTS = [
  { id:'english',     name:'English Language',     icon:'🔤', max:100 },
  { id:'mathematics', name:'Mathematics',           icon:'📐', max:60  },
  { id:'physics',     name:'Physics',               icon:'⚛️', max:60  },
  { id:'chemistry',   name:'Chemistry',             icon:'⚗️', max:60  },
  { id:'biology',     name:'Biology',               icon:'🧬', max:60  },
  { id:'government',  name:'Government',            icon:'🏛️', max:60  },
  { id:'economics',   name:'Economics',             icon:'📈', max:60  },
  { id:'literature',  name:'Literature',            icon:'📚', max:60  },
  { id:'geography',   name:'Geography',             icon:'🌍', max:60  },
  { id:'commerce',    name:'Commerce',              icon:'🛒', max:60  },
  { id:'accounts',    name:'Accounts',              icon:'🧾', max:60  },
  { id:'agriculture', name:'Agriculture',           icon:'🌾', max:60  },
  { id:'crk',         name:'CRK',                  icon:'✝️', max:60  },
  { id:'irk',         name:'IRK',                  icon:'☪️', max:60  },
  { id:'history',     name:'History',              icon:'🏺', max:60  },
  { id:'computer',    name:'Computer Studies',      icon:'💻', max:60  },
  { id:'french',      name:'French',               icon:'🇫🇷', max:60  },
  { id:'hausa',       name:'Hausa',                icon:'📜', max:60  },
  { id:'igbo',        name:'Igbo',                 icon:'📖', max:60  },
  { id:'yoruba',      name:'Yoruba',               icon:'🌺', max:60  },
];

/* ---- State ---- */
/* English pre-selected by default */
let selectedIds   = ['english'];
let pendingIds    = ['english'];
let currentMode   = 'practice';
let currentExam   = 'jamb';
let subjectConfig = {
  english: { year: 'Random', count: 40 }
};

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  renderSelectedBar();

  /* Selected subjects bar — open sheet on tap */
  const selectedBar = document.getElementById('selectedBar') ||
                      document.querySelector('.selected-bar');
  if (selectedBar) {
    selectedBar.addEventListener('click', openSheet);
  }

  /* Sheet buttons */
  document.getElementById('sheetCancelBtn')?.addEventListener('click', closeSheet);
  document.getElementById('sheetDoneBtn')?.addEventListener('click', confirmSheet);
  document.getElementById('sheetSelectAllBtn')?.addEventListener('click', toggleSelectAll);

  /* Search */
  document.getElementById('sheetSearch')?.addEventListener('input', e => {
    renderSheetItems(e.target.value);
  });

  /* Close sheet on overlay tap */
  document.getElementById('sheetOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('sheetOverlay')) closeSheet();
  });

  /* Mode buttons */
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      const timerRow = document.getElementById('timerRow');
      if (timerRow) {
        timerRow.style.display = currentMode === 'study' ? 'none' : 'flex';
      }
    });
  });

  /* Exam switcher */
  document.querySelectorAll('.exam-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const exam = btn.dataset.exam;
      if (btn.classList.contains('disabled')) {
        showToast('Coming soon! Focus on JAMB for now.');
        return;
      }
      currentExam = exam;
      document.querySelectorAll('.exam-switch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* Start button */
  document.getElementById('startBtn')?.addEventListener('click', startSession);

  /* Calculator */
  document.getElementById('calcOpenBtn')?.addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn')?.addEventListener('click', closeCalc);
  document.getElementById('calcOverlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });
  document.querySelectorAll('.calc-key').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });

  /* Pre-open subject sheet so student sees subjects immediately */
  /* Actually just show the selected bar with English already there */
  renderSelectedBar();
  renderConfigCards();
});

/* ================================================================
   SELECTED BAR
   ================================================================ */
function renderSelectedBar() {
  const pillsEl = document.getElementById('selectedPills');
  const infoTop = document.getElementById('startInfoTop');
  const infoSub = document.getElementById('startInfoSub');
  const startBtn = document.getElementById('startBtn');

  if (!pillsEl) return;

  if (selectedIds.length === 0) {
    pillsEl.innerHTML = '<span class="selected-pill empty">Tap to choose subjects</span>';
    if (infoTop) infoTop.textContent = 'No subjects selected';
    if (infoSub) infoSub.textContent = 'Select subjects above to begin';
    if (startBtn) startBtn.disabled = true;
  } else {
    pillsEl.innerHTML = selectedIds.map(id => {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      return `<span class="selected-pill">${s?.icon || '📚'} ${s?.name || id}</span>`;
    }).join('');
    if (infoTop) infoTop.textContent = `${selectedIds.length} subject${selectedIds.length > 1 ? 's' : ''} selected`;
    if (infoSub) infoSub.textContent = `${currentMode} mode · tap Start when ready`;
    if (startBtn) startBtn.disabled = false;
  }
}

/* ================================================================
   CONFIG CARDS (Year / Count per subject)
   ================================================================ */
function renderConfigCards() {
  const wrap = document.getElementById('configWrap');
  const cards = document.getElementById('configCards');
  const optSect = document.getElementById('optionsSection');

  if (!wrap || !cards) return;

  if (selectedIds.length === 0) {
    wrap.classList.remove('show');
    if (optSect) optSect.style.display = 'none';
    return;
  }

  wrap.classList.add('show');
  if (optSect) optSect.style.display = 'block';
  cards.innerHTML = '';

  selectedIds.forEach(id => {
    const s   = ALL_SUBJECTS.find(x => x.id === id);
    if (!s) return;
    const cfg = subjectConfig[id] || { year: 'Random', count: 40 };
    subjectConfig[id] = cfg;

    /* Year options */
    const yearOpts = ['Random', ...Array.from({length: 2026 - 1988 + 1}, (_,i) => String(2026 - i))];
    const yearSel  = yearOpts.map(y =>
      `<option value="${y}" ${cfg.year === y ? 'selected' : ''}>${y === 'Random' ? '🔀 Random (all years)' : y}</option>`
    ).join('');

    /* Count options */
    const counts = [];
    for (let n = 10; n <= s.max; n += 10) counts.push(n);
    if (counts[counts.length-1] !== s.max) counts.push(s.max);
    const countSel = counts.map(n =>
      `<option value="${n}" ${cfg.count === n ? 'selected' : ''}>${n} questions</option>`
    ).join('');

    const card = document.createElement('div');
    card.className = 'config-card';
    card.innerHTML = `
      <div class="config-card-head">
        <div class="config-card-icon" style="background:#EEF4FF;">${s.icon}</div>
        <div class="config-card-name">${s.name}</div>
        <button class="config-remove" data-remove="${id}" aria-label="Remove">×</button>
      </div>
      <div class="config-row">
        <span class="config-row-label">📅 Year</span>
        <select class="config-select" data-field="year" data-subject="${id}">${yearSel}</select>
      </div>
      <div class="config-row">
        <span class="config-row-label">🔢 Questions</span>
        <select class="config-select" data-field="count" data-subject="${id}">${countSel}</select>
      </div>`;
    cards.appendChild(card);

    /* Wire config changes */
    card.querySelector('[data-field="year"]').addEventListener('change', e => {
      subjectConfig[id].year = e.target.value;
    });
    card.querySelector('[data-field="count"]').addEventListener('change', e => {
      subjectConfig[id].count = parseInt(e.target.value);
    });
    card.querySelector('[data-remove]').addEventListener('click', () => {
      /* Cannot remove English if it's the only one */
      if (id === 'english' && selectedIds.length === 1) {
        showToast('English Language cannot be removed');
        return;
      }
      selectedIds = selectedIds.filter(x => x !== id);
      delete subjectConfig[id];
      renderSelectedBar();
      renderConfigCards();
    });
  });
}

/* ================================================================
   SUBJECT SHEET
   ================================================================ */
function openSheet() {
  pendingIds = [...selectedIds];
  document.getElementById('sheetSearch').value = '';
  renderSheetItems('');
  document.getElementById('sheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function confirmSheet() {
  if (pendingIds.length === 0) {
    showToast('Select at least one subject');
    return;
  }
  /* Ensure English is always first */
  if (!pendingIds.includes('english')) pendingIds.unshift('english');

  selectedIds = [...pendingIds];

  /* Init config for new subjects */
  selectedIds.forEach(id => {
    if (!subjectConfig[id]) {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      subjectConfig[id] = { year: 'Random', count: Math.min(40, s?.max || 40) };
    }
  });

  closeSheet();
  renderSelectedBar();
  renderConfigCards();
}

function toggleSelectAll() {
  const q      = document.getElementById('sheetSearch').value.toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q)).map(s => s.id);
  const allSelected = visible.every(id => pendingIds.includes(id));

  if (allSelected) {
    /* Deselect all except English */
    pendingIds = pendingIds.filter(id => !visible.includes(id) || id === 'english');
    document.getElementById('sheetSelectAllBtn').textContent = 'Select All';
  } else {
    visible.forEach(id => { if (!pendingIds.includes(id)) pendingIds.push(id); });
    document.getElementById('sheetSelectAllBtn').textContent = 'Deselect All';
  }
  renderSheetItems(q);
}

function renderSheetItems(filter) {
  const body    = document.getElementById('sheetBody');
  if (!body) return;
  const q       = (filter || '').toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q));

  body.innerHTML = '';
  visible.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const isEnglish = s.id === 'english';
    const row = document.createElement('div');
    row.className = 'sheet-item' + (checked ? ' checked' : '');
    row.innerHTML = `
      <div class="sheet-item-icon">${s.icon}</div>
      <div class="sheet-item-name">${s.name}${isEnglish ? ' <span style="font-size:10px;color:#0FA968;font-weight:700;">Required</span>' : ''}</div>
      <div class="sheet-check">${checked ? '✓' : ''}</div>`;

    row.addEventListener('click', () => {
      if (isEnglish) { showToast('English Language is required'); return; }
      if (pendingIds.includes(s.id)) {
        pendingIds = pendingIds.filter(id => id !== s.id);
        row.classList.remove('checked');
        row.querySelector('.sheet-check').textContent = '';
      } else {
        pendingIds.push(s.id);
        row.classList.add('checked');
        row.querySelector('.sheet-check').textContent = '✓';
      }
    });
    body.appendChild(row);
  });
}

/* ================================================================
   START SESSION
   ================================================================ */
function startSession() {
  if (selectedIds.length === 0) {
    showToast('Please select at least one subject');
    return;
  }
  const h = document.getElementById('timerH')?.value || '2';
  const m = document.getElementById('timerM')?.value || '0';
  const shuffleQ = document.getElementById('shuffleQToggle')?.classList.contains('on') ? '1' : '0';
  const shuffleO = document.getElementById('shuffleOToggle')?.classList.contains('on') ? '1' : '0';

  const params = new URLSearchParams({
    subjects: selectedIds.join(','),
    mode:     currentMode,
    exam:     currentExam,
    h, m, shuffleQ, shuffleO
  });
  ...

  selectedIds.forEach(id => {
    const cfg = subjectConfig[id] || {};
    params.set('year_'  + id, cfg.year  || 'Random');
    params.set('count_' + id, cfg.count || 40);
  });

  window.location.href = 'practice.html?' + params.toString();
}

/* ================================================================
   EXAM SWITCHER
   ================================================================ */
function switchExam(exam, btn) {
  if (btn.classList.contains('disabled')) {
    showToast('Coming soon! JAMB is live now.');
    return;
  }
  currentExam = exam;
  document.querySelectorAll('.exam-switch-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

/* ================================================================
   CALCULATOR
   ================================================================ */
let calcDisplay = '0', calcExpr = '', calcEvaled = false;
function openCalc()  { document.getElementById('calcOverlay').classList.add('open'); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }
function updateCalcDisplay() { document.getElementById('calcDisplay').textContent = calcDisplay; }
function calcPress(val) {
  if (val === 'C') { calcDisplay = '0'; calcExpr = ''; calcEvaled = false; }
  else if (val === 'DEL') {
    if (calcExpr.length <= 1) { calcDisplay = '0'; calcExpr = ''; }
    else { calcExpr = calcExpr.slice(0,-1); calcDisplay = calcExpr; }
  } else if (val === '=') {
    try {
      const safe = calcExpr.replace(/×/g,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/.()%]/g,'');
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay; calcEvaled = true;
    } catch(e) { calcDisplay = 'Error'; calcExpr = ''; }
  } else if (val === '√') {
    const n = parseFloat(calcExpr);
    if (!isNaN(n)) { calcDisplay = String(parseFloat(Math.sqrt(n).toFixed(8))); calcExpr = calcDisplay; calcEvaled = true; }
  } else if (['+','-','×','÷','%'].includes(val)) {
    const m = {'×':'*','÷':'/'};
    calcExpr += (m[val]||val); calcDisplay = calcExpr; calcEvaled = false;
  } else {
    if (calcEvaled) { calcExpr = val; calcEvaled = false; }
    else { calcExpr = (calcExpr==='0'||calcExpr==='') ? val : calcExpr+val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

/* ================================================================
   TOAST
   ================================================================ */
let _tt;
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(_tt); _tt = setTimeout(() => t.classList.remove('show'), 2500);
}
