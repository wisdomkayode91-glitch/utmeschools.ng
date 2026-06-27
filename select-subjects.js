/* ============================================================
   UTMESchools v2 — select-subjects.js
   - All 27 JAMB subjects
   - English auto-selected on load
   - No subject cap
   - Calculator overlay
   - Free limit: 5 questions
   - Year range: 1992 to date
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',       icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'accounts',    name: 'Accounts',               icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'agriculture', name: 'Agriculture',            icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'biology',     name: 'Biology',                icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'chemistry',   name: 'Chemistry',              icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'commerce',    name: 'Commerce',               icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'computer',    name: 'Computer Studies',       icon: '💻', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'crk',         name: 'CRK',                    icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'economics',   name: 'Economics',              icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'fineart',     name: 'Fine Art',               icon: '🎨', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'french',      name: 'French',                 icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'geography',   name: 'Geography',              icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'government',  name: 'Government',             icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'hausa',       name: 'Hausa',                  icon: '📜', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'history',     name: 'History',                icon: '🏺', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'homeec',      name: 'Home Economics',         icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'igbo',        name: 'Igbo',                   icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'irk',         name: 'IRK',                    icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'literature',  name: 'Literature',             icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'littext',     name: 'Literature Textbooks',   icon: '📗', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'mathematics', name: 'Mathematics',            icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'music',       name: 'Music',                  icon: '🎵', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'phe',         name: 'PHE',                    icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'physics',     name: 'Physics',                icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'lekki',       name: 'The Lekki Headmaster',   icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'yoruba',      name: 'Yoruba',                 icon: '🌺', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
];

const FREE_LIMIT = 5;

function yearOptions() {
  const years = ['Random'];
  for (let y = new Date().getFullYear(); y >= 1992; y--) years.push(String(y));
  return years;
}

/* ---- State ---- */
let selectedIds   = ['english'];
let pendingIds    = ['english'];
let subjectConfig = {
  english: { year: 'Random', count: 40, topic: 'All', selectedTopics: [] }
};
let currentMode = 'practice';

/* ================================================================
   BOTTOM SHEET — Subject Picker
   ================================================================ */
const sheetList    = document.getElementById('sheetList');
const sheetOverlay = document.getElementById('sheetOverlay');

function renderSheet() {
  sheetList.innerHTML = '';

  /* Select All row */
  const allSelected = ALL_SUBJECTS.every(s => pendingIds.includes(s.id));
  const allRow = document.createElement('div');
  allRow.className = 'sheet-item';
  allRow.innerHTML = `
    <div class="sheet-checkbox ${allSelected ? 'checked' : ''}">${allSelected ? '✓' : ''}</div>
    <div class="sheet-item-name" style="font-weight:700;">Select All</div>
  `;
  allRow.addEventListener('click', () => {
    if (allSelected) {
      pendingIds = [];
    } else {
      pendingIds = ALL_SUBJECTS.map(s => s.id);
    }
    renderSheet();
  });
  sheetList.appendChild(allRow);

  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:var(--line);margin:6px 0;';
  sheetList.appendChild(divider);

  ALL_SUBJECTS.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const item = document.createElement('div');
    item.className = 'sheet-item';
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${s.name}</div>
    `;
    item.addEventListener('click', () => {
      if (checked) {
        pendingIds = pendingIds.filter(id => id !== s.id);
      } else {
        pendingIds.push(s.id);
      }
      renderSheet();
    });
    sheetList.appendChild(item);
  });
}

document.getElementById('pickSubjectsBtn').addEventListener('click', () => {
  pendingIds = [...selectedIds];
  renderSheet();
  sheetOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeSheet() {
  sheetOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('sheetCloseBtn').addEventListener('click', closeSheet);
document.getElementById('sheetCancelBtn').addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', e => { if (e.target === sheetOverlay) closeSheet(); });

document.getElementById('sheetOkBtn').addEventListener('click', () => {
  selectedIds = [...pendingIds];
  selectedIds.forEach(id => {
    if (!subjectConfig[id]) {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      subjectConfig[id] = { year: 'Random', count: Math.min(40, s.max), topic: 'All', selectedTopics: [] };
    }
  });
  Object.keys(subjectConfig).forEach(id => {
    if (!selectedIds.includes(id)) delete subjectConfig[id];
  });
  closeSheet();
  renderConfigList();
});

/* ================================================================
   CONFIG CARDS
   ================================================================ */
const configList  = document.getElementById('configList');
const emptyState  = document.getElementById('emptyState');
const optionsCard = document.getElementById('optionsCard');
const startBtn    = document.getElementById('startBtn');
const pickedCount = document.getElementById('pickedCount');

function questionCountOptions(max) {
  const opts = [];
  for (let n = 10; n <= max; n += 10) opts.push(n);
  if (opts[opts.length - 1] !== max) opts.push(max);
  return opts;
}

function topicLabel(id) {
  const sel = subjectConfig[id]?.selectedTopics;
  if (!sel || sel.length === 0) return 'All';
  if (sel.length === 1) return sel[0].slice(0, 28) + (sel[0].length > 28 ? '…' : '');
  return `${sel.length} topics`;
}

function renderConfigList() {
  pickedCount.textContent = selectedIds.length;
  startBtn.disabled = selectedIds.length === 0;

  if (selectedIds.length === 0) {
    emptyState.style.display = 'block';
    configList.style.display = 'none';
    optionsCard.style.display = 'none';
    return;
  }
  emptyState.style.display = 'none';
  configList.style.display = 'flex';
  optionsCard.style.display = 'block';
  configList.innerHTML = '';

  selectedIds.forEach(id => {
    const s   = ALL_SUBJECTS.find(x => x.id === id);
    const cfg = subjectConfig[id];
    const card = document.createElement('div');
    card.className = 'config-card';
    card.innerHTML = `
      <div class="config-head">
        <div class="config-icon" style="background:${s.bg};color:${s.fg};">${s.icon}</div>
        <div class="config-name">${s.name}</div>
        <button class="config-remove" data-remove="${id}" aria-label="Remove">×</button>
      </div>
      <div class="config-row">
        <span class="cr-label">📅 Year</span>
        <select class="cr-select" data-field="year" data-subject="${id}"></select>
      </div>
      <div class="config-row">
        <span class="cr-label"># Questions</span>
        <select class="cr-select" data-field="count" data-subject="${id}"></select>
      </div>
      <div class="config-row">
        <span class="cr-label">🏷️ Topic</span>
        <span class="cr-val topic-edit" data-topic-id="${id}" style="color:var(--navy);cursor:pointer;">${topicLabel(id)} ✎</span>
      </div>
    `;
    configList.appendChild(card);

    /* Year dropdown */
    const yearSel = card.querySelector('[data-field="year"]');
    yearOptions().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y === 'Random' ? '🔀 Random (all years)' : y;
      if (y === cfg.year) opt.selected = true;
      yearSel.appendChild(opt);
    });
    yearSel.addEventListener('change', e => { subjectConfig[id].year = e.target.value; });

    /* Count dropdown */
    const countSel = card.querySelector('[data-field="count"]');
    questionCountOptions(s.max).forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' questions';
      if (n === cfg.count) opt.selected = true;
      countSel.appendChild(opt);
    });
    countSel.addEventListener('change', e => { subjectConfig[id].count = parseInt(e.target.value, 10); });
  });

  /* Remove buttons */
  configList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      selectedIds = selectedIds.filter(x => x !== id);
      delete subjectConfig[id];
      renderConfigList();
    });
  });

  /* Topic edit buttons */
  configList.querySelectorAll('.topic-edit').forEach(el => {
    el.addEventListener('click', () => openTopicSheet(el.dataset.topicId));
  });
}

/* ================================================================
   TOPIC PICKER SHEET
   ================================================================ */
const SUBJECT_TOPICS = {
  english: [
    'ORAL FORMS : CONSONANTS', 'ORAL FORMS : VOWELS', 'ORAL FORMS : STRESS PATTERN',
    'ORAL FORMS : RHYMES', 'ORAL FORMS : EMPHATIC STRESS',
    'LEXIS AND STRUCTURE : ANTONYMS', 'LEXIS AND STRUCTURE : SYNONYMS',
    'LEXIS AND STRUCTURE : SENTENCE COMPLETION', 'LEXIS AND STRUCTURE : SENTENCE INTERPRETATION',
    'COMPREHENSION PASSAGE', 'CLOZE PASSAGE', 'NOVEL : THE LEKKI HEADMASTER',
  ],
  mathematics: [
    'NUMBER AND NUMERATION', 'ALGEBRA', 'GEOMETRY AND MENSURATION',
    'TRIGONOMETRY', 'CALCULUS', 'STATISTICS AND PROBABILITY',
    'SETS AND LOGIC', 'MATRICES AND DETERMINANTS',
  ],
  physics: [
    'MECHANICS : SCALARS AND VECTORS', 'MECHANICS : MOTION',
    'MECHANICS : EQUILIBRIUM', 'MECHANICS : WORK, ENERGY AND POWER',
    'MECHANICS : MOMENTUM', 'HEAT : TEMPERATURE AND THERMOMETRY',
    'CHANGE OF STATE', 'CHANGE OF STATE : LATENT HEAT',
    'CHANGE OF STATE : EVAPORATION AND BOILING',
    'CHANGE OF STATE : SPECIFIC LATENT HEATS OF FUSION',
    'CHANGE OF STATE : SPECIFIC LATENT HEATS OF VAPORIZATION',
    'WAVES', 'LIGHT : REFLECTION', 'LIGHT : REFRACTION',
    'CURRENT ELECTRICITY', 'CAPACITORS', 'CAPACITORS : CAPACITANCE',
    'CAPACITORS : CAPACITORS IN SERIES AND PARALLEL',
    'CAPACITORS : ENERGY STORED IN A CAPACITOR',
    'SOUND WAVES : FREQUENCY OF NOTES FROM AIR COLUMNS',
    'SOUND WAVES : QUALITY, PITCH, INTENSITY AND LOUDNESS',
    'CONDUCTION THROUGH GASES', 'CONDUCTION THROUGH LIQUIDS',
    'ATOMIC PHYSICS : ATOMS',
  ],
  chemistry: [
    'ATOMIC STRUCTURE', 'CHEMICAL BONDING', 'ACIDS, BASES AND SALTS',
    'ELECTROLYSIS', 'ORGANIC CHEMISTRY : HYDROCARBONS',
    'ORGANIC CHEMISTRY : FUNCTIONAL GROUPS',
    'RATES OF REACTION', 'EQUILIBRIUM', 'ELECTROCHEMISTRY',
    'PERIODIC TABLE', 'GAS LAWS', 'MOLE CONCEPT',
  ],
  biology: [
    'CELL BIOLOGY', 'GENETICS AND EVOLUTION', 'ECOLOGY',
    'PLANT AND ANIMAL NUTRITION', 'TRANSPORT SYSTEMS',
    'EXCRETION AND HOMEOSTASIS', 'REPRODUCTION',
    'COORDINATION AND CONTROL', 'CLASSIFICATION OF LIVING THINGS',
  ],
  government: [
    'BASIC CONCEPTS IN GOVERNMENT', 'CONSTITUTION', 'FEDERALISM',
    'ARMS OF GOVERNMENT', 'ELECTORAL SYSTEMS', 'POLITICAL PARTIES',
    'NIGERIAN GOVERNMENT', 'INTERNATIONAL ORGANIZATIONS',
  ],
  economics: [
    'DEMAND AND SUPPLY', 'ELASTICITY', 'MARKET STRUCTURES',
    'NATIONAL INCOME', 'MONETARY POLICY', 'FISCAL POLICY',
    'INTERNATIONAL TRADE', 'ECONOMIC DEVELOPMENT',
    'POPULATION AND LABOUR', 'AGRICULTURAL ECONOMICS',
  ],
  literature: [
    'PROSE', 'POETRY', 'DRAMA',
    'LITERARY TERMS AND DEVICES', 'WEST AFRICAN LITERATURE',
  ],
  crk: [
    'OLD TESTAMENT', 'NEW TESTAMENT', 'TEMPTATION OF JESUS',
    'CHRISTIAN ETHICS', 'CHURCH HISTORY',
  ],
  irk: [
    'PILLARS OF ISLAM', 'SUNNAH AND HADITH', 'TAWHID',
    'ISLAMIC JURISPRUDENCE', 'HISTORY OF ISLAM',
  ],
  geography: [
    'PHYSICAL GEOGRAPHY : MAPS', 'PHYSICAL GEOGRAPHY : CLIMATE',
    'PHYSICAL GEOGRAPHY : LANDFORMS', 'HUMAN GEOGRAPHY',
    'ECONOMIC GEOGRAPHY', 'REGIONAL GEOGRAPHY : NIGERIA',
    'REGIONAL GEOGRAPHY : AFRICA',
  ],
  commerce: [
    'TRADE', 'RETAIL TRADE', 'WHOLESALE TRADE',
    'BANKING', 'INSURANCE', 'TRANSPORTATION',
    'WAREHOUSING', 'COMMUNICATION IN COMMERCE',
  ],
  accounts: [
    'BOOK-KEEPING PRINCIPLES', 'TRIAL BALANCE', 'TRADING ACCOUNT',
    'PROFIT AND LOSS ACCOUNT', 'BALANCE SHEET',
    'PARTNERSHIP ACCOUNTS', 'COMPANY ACCOUNTS',
  ],
  agriculture: [
    'CROP PRODUCTION', 'ANIMAL PRODUCTION', 'SOIL SCIENCE',
    'AGRICULTURAL ECONOMICS', 'FARM MANAGEMENT', 'AGRO-ALLIED INDUSTRIES',
  ],
};

let topicSheetSubjectId = null;

function openTopicSheet(subjectId) {
  topicSheetSubjectId = subjectId;
  const s      = ALL_SUBJECTS.find(x => x.id === subjectId);
  const topics = SUBJECT_TOPICS[subjectId] || [];
  const cfg    = subjectConfig[subjectId];
  let selectedTopics = cfg.selectedTopics || [];

  const overlay = document.getElementById('topicSheetOverlay');
  const list    = document.getElementById('topicSheetList');
  document.getElementById('topicSheetTitle').textContent = s.name + ' — Topics';
  list.innerHTML = '';

  /* Select All row — tap once selects all, tap again deselects all */
  const allChecked = selectedTopics.length === 0 || selectedTopics.length === topics.length;
  const allRow = document.createElement('div');
  allRow.className = 'sheet-item';
  allRow.innerHTML = `
    <div class="sheet-checkbox ${allChecked ? 'checked' : ''}">${allChecked ? '✓' : ''}</div>
    <div class="sheet-item-name" style="font-weight:700;">Select All</div>
  `;
  allRow.addEventListener('click', () => {
    if (allChecked) {
      /* All were selected — deselect all */
      subjectConfig[subjectId].selectedTopics = topics.length > 0 ? topics.map(() => '__none__') : [];
      /* Use empty string sentinel so none are checked */
      subjectConfig[subjectId].selectedTopics = [];
      /* But we need to distinguish "all selected" vs "none selected" */
      /* Convention: [] = all, ['__none__'] = none */
      subjectConfig[subjectId].selectedTopics = ['__none__'];
    } else {
      /* Some or none were selected — select all */
      subjectConfig[subjectId].selectedTopics = [];
    }
    openTopicSheet(subjectId);
  });
  list.appendChild(allRow);

  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:var(--line);margin:6px 0;';
  list.appendChild(divider);

  topics.forEach(topic => {
    const sel = subjectConfig[subjectId].selectedTopics || [];
    /* [] means all selected; ['__none__'] means none; otherwise explicit list */
    const isNone    = sel.length === 1 && sel[0] === '__none__';
    const isAll     = sel.length === 0;
    const checked   = isAll || (!isNone && sel.includes(topic));

    const row = document.createElement('div');
    row.className = 'sheet-item';
    row.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${topic}</div>
    `;
    row.addEventListener('click', () => {
      let sel = [...(subjectConfig[subjectId].selectedTopics || [])];
      const isNone = sel.length === 1 && sel[0] === '__none__';
      const isAll  = sel.length === 0;

      if (isAll) {
        /* Was "all" — switch to explicit list with this one removed */
        sel = topics.filter(t => t !== topic);
      } else if (isNone) {
        /* Was "none" — add just this one */
        sel = [topic];
      } else if (sel.includes(topic)) {
        sel = sel.filter(t => t !== topic);
        if (sel.length === 0) sel = ['__none__']; // last one unchecked = none
      } else {
        sel.push(topic);
        if (sel.length === topics.length) sel = []; // all checked = all
      }
      subjectConfig[subjectId].selectedTopics = sel;
      openTopicSheet(subjectId);
    });
    list.appendChild(row);
  });

  if (topics.length === 0) {
    const msg = document.createElement('p');
    msg.style.cssText = 'padding:20px;text-align:center;color:var(--ink-soft);font-size:13px;';
    msg.textContent = 'Topics will appear here once questions are loaded from the database.';
    list.appendChild(msg);
  }

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTopicSheet() {
  document.getElementById('topicSheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
  renderConfigList();
}

document.getElementById('topicSheetCloseBtn').addEventListener('click', closeTopicSheet);
document.getElementById('topicSheetCancelBtn').addEventListener('click', closeTopicSheet);
document.getElementById('topicSheetOkBtn').addEventListener('click', closeTopicSheet);
document.getElementById('topicSheetOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('topicSheetOverlay')) closeTopicSheet();
});

/* ================================================================
   MODE TOGGLE
   ================================================================ */
document.querySelectorAll('.mode-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    const timerSection = document.getElementById('timerSection');
    if (timerSection) {
      timerSection.style.display = currentMode === 'study' ? 'none' : 'block';
    }
  });
});

/* ================================================================
   TOGGLE SWITCHES
   ================================================================ */
document.querySelectorAll('.switch').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('on'));
});

/* ================================================================
   CALCULATOR
   ================================================================ */
let calcDisplay    = '0';
let calcExpr       = '';
let calcJustEvaled = false;

function openCalc() {
  document.getElementById('calcOverlay').classList.add('open');
  updateCalcDisplay();
}

function closeCalc() {
  document.getElementById('calcOverlay').classList.remove('open');
}

function updateCalcDisplay() {
  document.getElementById('calcDisplay').textContent = calcDisplay;
}

function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    calcDisplay = calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0';
    calcExpr    = calcExpr.length > 1    ? calcExpr.slice(0, -1)    : '';
  } else if (val === '=') {
    try {
      const safe   = calcExpr
        .replace(/×/g, '*').replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.()%]/g, '');
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay  = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr     = calcDisplay;
      calcJustEvaled = true;
    } catch (e) {
      calcDisplay = 'Error'; calcExpr = '';
    }
  } else if (['+', '-', '×', '÷', '%'].includes(val)) {
    const opMap = { '×': '*', '÷': '/' };
    const op    = opMap[val] || val;
    calcExpr   += op;
    calcDisplay = calcExpr;
    calcJustEvaled = false;
  } else {
    if (calcJustEvaled) { calcExpr = val; calcJustEvaled = false; }
    else { calcExpr = (calcExpr === '0' || calcExpr === '') ? val : calcExpr + val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

/* ================================================================
   START BUTTON
   ================================================================ */
startBtn.addEventListener('click', () => {
  if (selectedIds.length === 0) return;
  const params = new URLSearchParams({
    subjects: selectedIds.join(','),
    mode: currentMode,
    h: document.getElementById('timerH')?.value || '2',
    m: document.getElementById('timerM')?.value || '0',
  });
  selectedIds.forEach(id => {
    params.set('year_' + id,  subjectConfig[id].year);
    params.set('count_' + id, subjectConfig[id].count);
  });
  window.location.href = 'practice.html?' + params.toString();
});

/* ================================================================
   DOMContentLoaded — wire everything
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Calculator buttons */
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);

  const calcOpenBtn = document.getElementById('calcOpenBtn');
  if (calcOpenBtn) calcOpenBtn.addEventListener('click', openCalc);

  /* Initial render — English already selected */
  renderConfigList();
});
