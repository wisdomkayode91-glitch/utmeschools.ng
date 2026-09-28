/* ============================================================
   UTMESchools v2 — select-subjects.js  (FULL + Topic Picker)
   English auto-selected but removable.
   27 SdashAPI subjects. Shuffle options. Topic/subtopic filter.
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';

const ALL_SUBJECTS = [
  { id:'english',            name:'English Language',   icon:'🔤', max:100 },
  { id:'mathematics',        name:'Mathematics',        icon:'📐', max:60  },
  { id:'english-literature', name:'Literature',         icon:'📚', max:60  },
  { id:'biology',            name:'Biology',            icon:'🧬', max:60  },
  { id:'chemistry',          name:'Chemistry',          icon:'⚗️', max:60  },
  { id:'physics',            name:'Physics',            icon:'⚛️', max:60  },
  { id:'agriculture',        name:'Agriculture',        icon:'🌾', max:60  },
  { id:'accounting',         name:'Accounting',         icon:'🧾', max:60  },
  { id:'commerce',           name:'Commerce',           icon:'🛒', max:60  },
  { id:'economics',          name:'Economics',          icon:'📈', max:60  },
  { id:'government',         name:'Government',         icon:'🏛️', max:60  },
  { id:'geography',          name:'Geography',          icon:'🌍', max:60  },
  { id:'geology',            name:'Geology',            icon:'🪨', max:60  },
  { id:'history',            name:'History',            icon:'🏺', max:60  },
  { id:'civic-education',    name:'Civic Education',    icon:'🏛️', max:60  },
  { id:'current-affairs',    name:'Current Affairs',    icon:'📰', max:60  },
  { id:'computer-studies',   name:'Computer Studies',   icon:'💻', max:60  },
  { id:'crk',                name:'CRK',                icon:'✝️', max:60  },
  { id:'irk',                name:'IRK',                icon:'☪️', max:60  },
  { id:'insurance',          name:'Insurance',          icon:'📋', max:60  },
  { id:'home-economics',     name:'Home Economics',     icon:'🏠', max:60  },
  { id:'fine-art',           name:'Fine Art',           icon:'🎨', max:60  },
  { id:'music',              name:'Music',              icon:'🎵', max:60  },
  { id:'arabic-studies',     name:'Arabic Studies',     icon:'🕌', max:60  },
  { id:'hausa',              name:'Hausa',              icon:'📜', max:60  },
  { id:'igbo',               name:'Igbo',               icon:'📖', max:60  },
  { id:'yoruba',             name:'Yoruba',             icon:'🌺', max:60  },
];

/* ---- State — English preselected but removable ---- */
let selectedIds   = ['english'];
let pendingIds    = ['english'];
let currentMode   = 'practice';
let currentExam   = 'utme';
let subjectConfig = {
  english: { year: 'Random', count: 40, topics: [] }
};

/* ---- Topic picker state ---- */
let currentTopicSubject = null;
let pendingTopics       = new Set();
let allTopicsCache      = null;

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  const selectedBar = document.querySelector('.selected-bar');
  if (selectedBar) selectedBar.addEventListener('click', openSheet);

  const sheetCancel = document.getElementById('sheetCancelBtn');
  const sheetDone   = document.getElementById('sheetDoneBtn');
  const sheetAll    = document.getElementById('sheetSelectAllBtn');
  if (sheetCancel) sheetCancel.addEventListener('click', closeSheet);
  if (sheetDone)   sheetDone.addEventListener('click', confirmSheet);
  if (sheetAll)    sheetAll.addEventListener('click', toggleSelectAll);

  const search = document.getElementById('sheetSearch');
  if (search) search.addEventListener('input', e => renderSheetItems(e.target.value));

  const sheetOverlay = document.getElementById('sheetOverlay');
  if (sheetOverlay) {
    sheetOverlay.addEventListener('click', e => {
      if (e.target === sheetOverlay) closeSheet();
    });
  }

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

  document.querySelectorAll('.exam-switch-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('disabled')) {
        showToast('Coming soon! Focus on JAMB for now.');
        return;
      }
      currentExam = btn.dataset.exam;
      document.querySelectorAll('.exam-switch-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const startBtn = document.getElementById('startBtn');
  if (startBtn) startBtn.addEventListener('click', startSession);

  /* Calculator */
  const calcOpen  = document.getElementById('calcOpenBtn');
  const calcClose = document.getElementById('calcCloseBtn');
  const calcOv    = document.getElementById('calcOverlay');
  if (calcOpen)  calcOpen.addEventListener('click', openCalc);
  if (calcClose) calcClose.addEventListener('click', closeCalc);
  if (calcOv) {
    calcOv.addEventListener('click', e => {
      if (e.target === calcOv) closeCalc();
    });
  }
  document.querySelectorAll('.calc-key').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });

  /* Topic picker sheet wiring */
  const topicOverlay  = document.getElementById('topicSheetOverlay');
  const topicCancel   = document.getElementById('topicCancelBtn');
  const topicDone     = document.getElementById('topicDoneBtn');
  const topicSearch   = document.getElementById('topicSearch');

  if (topicCancel) topicCancel.addEventListener('click', closeTopicPicker);
  if (topicOverlay) {
    topicOverlay.addEventListener('click', e => {
      if (e.target === topicOverlay) closeTopicPicker();
    });
  }
  if (topicSearch) {
    topicSearch.addEventListener('input', e => renderTopicList(e.target.value));
  }
  if (topicDone) {
    topicDone.addEventListener('click', () => {
      if (currentTopicSubject) {
        const cfg = subjectConfig[currentTopicSubject] || {};
        cfg.topics = Array.from(pendingTopics);
        subjectConfig[currentTopicSubject] = cfg;
      }
      closeTopicPicker();
    });
  }

  renderSelectedBar();
  renderConfigCards();
});

/* ================================================================
   SELECTED BAR
   ================================================================ */
function renderSelectedBar() {
  const pillsEl  = document.getElementById('selectedPills');
  const infoTop  = document.getElementById('startInfoTop');
  const infoSub  = document.getElementById('startInfoSub');
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
   CONFIG CARDS
   ================================================================ */
function renderConfigCards() {
  const wrap    = document.getElementById('configWrap');
  const cards   = document.getElementById('configCards');
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
    const s = ALL_SUBJECTS.find(x => x.id === id);
    if (!s) return;
    const cfg = subjectConfig[id] || { year: 'Random', count: 40, topics: [] };
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

    /* Topic label */
    const topicCount = (cfg.topics || []).length;
    const topicLabel = topicCount === 0 ? 'All' : `${topicCount} selected`;

    const card = document.createElement('div');
    card.className = 'config-card';
    card.innerHTML = `
      <div class="config-card-head">
        <div class="config-card-icon" style="background:#EEF4FF;">${s.icon}</div>
        <div class="config-card-name">${s.name}</div>
        <button class="config-edit" data-edit="${id}" aria-label="Select topics"
          style="width:30px;height:30px;border-radius:8px;background:#EEF4FF;color:#0B2545;font-size:14px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;margin-right:6px;">✏️</button>
        <button class="config-remove" data-remove="${id}" aria-label="Remove">×</button>
      </div>
      <div class="config-row">
        <span class="config-row-label">📅 Year</span>
        <select class="config-select" data-field="year" data-subject="${id}">${yearSel}</select>
      </div>
      <div class="config-row">
        <span class="config-row-label">🔢 Questions</span>
        <select class="config-select" data-field="count" data-subject="${id}">${countSel}</select>
      </div>
      <div class="config-row">
        <span class="config-row-label">📚 Topics</span>
        <span style="font-size:12.5px;font-weight:600;color:#0B2545;">${topicLabel}</span>
      </div>`;
    cards.appendChild(card);

    card.querySelector('[data-field="year"]').addEventListener('change', e => {
      subjectConfig[id].year = e.target.value;
    });
    card.querySelector('[data-field="count"]').addEventListener('change', e => {
      subjectConfig[id].count = parseInt(e.target.value);
    });
    card.querySelector('[data-edit]').addEventListener('click', () => {
      openTopicPicker(id);
    });
    card.querySelector('[data-remove]').addEventListener('click', () => {
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
  const search = document.getElementById('sheetSearch');
  if (search) search.value = '';
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
    showToast('Select at least one subject to continue');
    return;
  }

  selectedIds = [...pendingIds];

  selectedIds.forEach(id => {
    if (!subjectConfig[id]) {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      subjectConfig[id] = { year: 'Random', count: Math.min(40, s?.max || 40), topics: [] };
    }
  });

  closeSheet();
  renderSelectedBar();
  renderConfigCards();
}

function toggleSelectAll() {
  const q       = (document.getElementById('sheetSearch')?.value || '').toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q)).map(s => s.id);
  const allSelected = visible.every(id => pendingIds.includes(id));

  if (allSelected) {
    pendingIds = pendingIds.filter(id => !visible.includes(id));
    const btn = document.getElementById('sheetSelectAllBtn');
    if (btn) btn.textContent = 'Select All';
  } else {
    visible.forEach(id => { if (!pendingIds.includes(id)) pendingIds.push(id); });
    const btn = document.getElementById('sheetSelectAllBtn');
    if (btn) btn.textContent = 'Deselect All';
  }
  renderSheetItems(q);
}

function renderSheetItems(filter) {
  const body = document.getElementById('sheetBody');
  if (!body) return;
  const q       = (filter || '').toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q));

  body.innerHTML = '';
  visible.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const row = document.createElement('div');
    row.className = 'sheet-item' + (checked ? ' checked' : '');
    row.innerHTML = `
      <div class="sheet-item-icon">${s.icon}</div>
      <div class="sheet-item-name">${s.name}</div>
      <div class="sheet-check">${checked ? '✓' : ''}</div>`;

    row.addEventListener('click', () => {
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
   }/* ================================================================
   TOPIC PICKER
   ================================================================ */
async function openTopicPicker(subjectId) {
  currentTopicSubject = subjectId;

  const s = ALL_SUBJECTS.find(x => x.id === subjectId);
  const sheetTitle = document.getElementById('topicSheetTitle');
  if (sheetTitle) sheetTitle.textContent = 'Select Topics — ' + (s?.name || subjectId);

  const cfg = subjectConfig[subjectId] || {};
  pendingTopics = new Set(cfg.topics || []);

  document.getElementById('topicSheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('topicBody').innerHTML =
    '<div style="padding:20px;text-align:center;color:#8A94A6;">Loading topics...</div>';

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/get_subject_topics`,
      {
        method: 'POST',
        headers: {
          'apikey':        SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type':  'application/json'
        },
        body: JSON.stringify({ p_subject: subjectId })
      }
    );
    allTopicsCache = await res.json();
    renderTopicList('');
  } catch(e) {
    document.getElementById('topicBody').innerHTML =
      '<div style="padding:20px;text-align:center;color:#E2531F;">Could not load topics. Check connection.</div>';
  }
}

function renderTopicList(filter) {
  const body = document.getElementById('topicBody');
  if (!body) return;

  const q = (filter || '').toLowerCase();

  const grouped = {};
  (allTopicsCache || []).forEach(t => {
    if (!grouped[t.topic]) grouped[t.topic] = [];
    grouped[t.topic].push(t);
  });

  const topicNames = Object.keys(grouped).filter(name =>
    name.toLowerCase().includes(q) ||
    grouped[name].some(t => (t.subtopic || '').toLowerCase().includes(q))
  );

  if (topicNames.length === 0) {
    body.innerHTML = '<div style="padding:20px;text-align:center;color:#8A94A6;">No topics found.</div>';
    return;
  }

  body.innerHTML = '';

  /* Select All row */
  const allRow = document.createElement('div');
  allRow.className = 'sheet-item';
  allRow.style.cssText = 'font-weight:700;border-bottom:2px solid #E8EBF0;';
  allRow.innerHTML = `
    <div class="sheet-item-icon">☑</div>
    <div class="sheet-item-name">Select All</div>
    <div class="sheet-check" style="border-radius:4px;">${pendingTopics.size === 0 ? '✓' : ''}</div>`;
  allRow.addEventListener('click', () => {
    if (pendingTopics.size === 0) {
      (allTopicsCache || []).forEach(t => {
        pendingTopics.add(t.topic + '|||' + t.subtopic);
      });
    } else {
      pendingTopics.clear();
    }
    renderTopicList(filter);
  });
  body.appendChild(allRow);

  topicNames.forEach(topicName => {
    const subtopics = grouped[topicName];

    const topicRow = document.createElement('div');
    topicRow.className = 'sheet-item';
    topicRow.style.cssText = 'font-weight:700;background:#F4F6FA;';
    topicRow.innerHTML = `
      <div class="sheet-item-icon">📚</div>
      <div class="sheet-item-name">${topicName.toUpperCase()}</div>`;
    body.appendChild(topicRow);

    subtopics.forEach(t => {
      const key = t.topic + '|||' + t.subtopic;
      const checked = pendingTopics.has(key);
      const label = t.subtopic || '(general)';

      const row = document.createElement('div');
      row.className = 'sheet-item' + (checked ? ' checked' : '');
      row.style.paddingLeft = '40px';
      row.innerHTML = `
        <div class="sheet-item-name">${label} <span style="color:#8A94A6;font-size:11px;">(${t.cnt})</span></div>
        <div class="sheet-check">${checked ? '✓' : ''}</div>`;

      row.addEventListener('click', () => {
        if (pendingTopics.has(key)) {
          pendingTopics.delete(key);
        } else {
          pendingTopics.add(key);
        }
        renderTopicList(filter);
      });
      body.appendChild(row);
    });
  });
}

function closeTopicPicker() {
  const overlay = document.getElementById('topicSheetOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  currentTopicSubject = null;
  allTopicsCache = null;
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

  selectedIds.forEach(id => {
    const cfg = subjectConfig[id] || {};
    params.set('year_'  + id, cfg.year  || 'Random');
    params.set('count_' + id, cfg.count || 40);

    /* Pass topics + subtopics */
    if (cfg.topics && cfg.topics.length > 0) {
      const topicsArr = cfg.topics.map(t => t.split('|||')[0]).filter(Boolean);
      const subsArr   = cfg.topics.map(t => t.split('|||')[1]).filter(Boolean);
      params.set('topics_'    + id, [...new Set(topicsArr)].join('||'));
      params.set('subtopics_' + id, [...new Set(subsArr)].join('||'));
    }
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
function updateCalcDisplay() {
  const el = document.getElementById('calcDisplay');
  if (el) el.textContent = calcDisplay;
}
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
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_tt);
  _tt = setTimeout(() => t.classList.remove('show'), 2500);
                                      }
