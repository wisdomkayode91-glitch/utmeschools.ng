/* ============================================================
   UTMESchools v2 — select-subjects.js
   All 26 JAMB subjects. English pre-selected. No cap.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',     icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'accounts',    name: 'Accounts',             icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'agriculture', name: 'Agriculture',          icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'biology',     name: 'Biology',              icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'chemistry',   name: 'Chemistry',            icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'commerce',    name: 'Commerce',             icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'computer',    name: 'Computer Studies',     icon: '💻', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'crk',         name: 'CRK',                  icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'economics',   name: 'Economics',            icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'fineart',     name: 'Fine Art',             icon: '🎨', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'french',      name: 'French',               icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'geography',   name: 'Geography',            icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'government',  name: 'Government',           icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'hausa',       name: 'Hausa',                icon: '📜', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'history',     name: 'History',              icon: '🏺', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'homeec',      name: 'Home Economics',       icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'igbo',        name: 'Igbo',                 icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'irk',         name: 'IRK',                  icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'literature',  name: 'Literature',           icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'littext',     name: 'Literature Textbooks', icon: '📗', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'mathematics', name: 'Mathematics',          icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'music',       name: 'Music',                icon: '🎵', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'phe',         name: 'PHE',                  icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'physics',     name: 'Physics',              icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'lekki',       name: 'The Lekki Headmaster', icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'yoruba',      name: 'Yoruba',               icon: '🌺', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
];

const SUBJECT_TOPICS = {
  english: [
    { topic: 'ORAL FORMS', subtopics: ['Consonants','Vowels','Stress Pattern','Rhymes','Emphatic Stress'] },
    { topic: 'LEXIS AND STRUCTURE', subtopics: ['Antonyms','Synonyms','Sentence Completion','Sentence Interpretation','Vocabulary'] },
    { topic: 'COMPREHENSION PASSAGE', subtopics: [] },
    { topic: 'CLOZE PASSAGE', subtopics: [] },
    { topic: 'NOVEL : THE LEKKI HEADMASTER', subtopics: [] },
  ],
  mathematics: [
    { topic: 'NUMBER AND NUMERATION', subtopics: ['Fractions','Indices','Logarithms','Surds','Number Bases'] },
    { topic: 'ALGEBRA', subtopics: ['Equations','Inequalities','Sequences and Series','Polynomials','Matrices'] },
    { topic: 'GEOMETRY AND MENSURATION', subtopics: ['Triangles','Circles','Quadrilaterals','Solid Shapes','Coordinate Geometry'] },
    { topic: 'TRIGONOMETRY', subtopics: ['Sine Rule','Cosine Rule','Trigonometric Ratios','Graphs'] },
    { topic: 'CALCULUS', subtopics: ['Differentiation','Integration','Applications'] },
    { topic: 'STATISTICS AND PROBABILITY', subtopics: ['Mean, Median, Mode','Frequency Distribution','Probability'] },
  ],
  physics: [
    { topic: 'MECHANICS', subtopics: ['Scalars and Vectors','Motion (Linear)','Projectile Motion','Equilibrium','Work, Energy and Power','Momentum and Collision'] },
    { topic: 'HEAT', subtopics: ['Temperature and Thermometry','Thermal Expansion','Gas Laws','Heat Capacity'] },
    { topic: 'CHANGE OF STATE', subtopics: ['Latent Heat','Evaporation and Boiling','Specific Latent Heat of Fusion','Specific Latent Heat of Vaporisation'] },
    { topic: 'WAVES', subtopics: ['Properties of Waves','Sound Waves','Light Waves','Electromagnetic Spectrum'] },
    { topic: 'LIGHT', subtopics: ['Reflection','Refraction','Lenses','Optical Instruments'] },
    { topic: 'CURRENT ELECTRICITY', subtopics: ['Ohm\'s Law','Resistors in Series and Parallel','Electric Power','Cells and EMF'] },
    { topic: 'CAPACITORS', subtopics: ['Capacitance','Capacitors in Series and Parallel','Energy Stored'] },
    { topic: 'ELECTROMAGNETISM', subtopics: ['Magnetic Fields','Electromagnetic Induction','Transformers'] },
    { topic: 'ATOMIC PHYSICS', subtopics: ['Atomic Structure','Radioactivity','Nuclear Reactions'] },
    { topic: 'CONDUCTION THROUGH LIQUIDS', subtopics: ['Electrolysis','Faraday\'s Laws'] },
    { topic: 'CONDUCTION THROUGH GASES', subtopics: ['Discharge Tubes','X-rays'] },
  ],
  chemistry: [
    { topic: 'ATOMIC STRUCTURE', subtopics: ['Electronic Configuration','Isotopes','Atomic Number and Mass Number'] },
    { topic: 'CHEMICAL BONDING', subtopics: ['Ionic Bond','Covalent Bond','Metallic Bond','Van der Waals Forces'] },
    { topic: 'ACIDS, BASES AND SALTS', subtopics: ['pH Scale','Neutralisation','Preparation of Salts'] },
    { topic: 'ELECTROLYSIS', subtopics: ['Electrolytes','Faraday\'s Laws','Products of Electrolysis'] },
    { topic: 'ORGANIC CHEMISTRY', subtopics: ['Hydrocarbons (Alkanes, Alkenes, Alkynes)','Alcohols','Carboxylic Acids','Esters','Polymers'] },
    { topic: 'RATES OF REACTION', subtopics: ['Factors Affecting Rate','Catalysis','Activation Energy'] },
    { topic: 'EQUILIBRIUM', subtopics: ['Le Chatelier\'s Principle','Kc and Kp','Industrial Applications'] },
    { topic: 'PERIODIC TABLE', subtopics: ['Periods and Groups','Trends','Transition Metals'] },
    { topic: 'GAS LAWS', subtopics: ['Boyle\'s Law','Charles\'s Law','Ideal Gas Equation'] },
    { topic: 'MOLE CONCEPT', subtopics: ['Molar Mass','Stoichiometry','Concentration Calculations'] },
  ],
  biology: [
    { topic: 'CELL BIOLOGY', subtopics: ['Cell Structure','Cell Division (Mitosis and Meiosis)','Osmosis and Diffusion'] },
    { topic: 'GENETICS AND EVOLUTION', subtopics: ['Mendel\'s Laws','DNA and RNA','Genetic Variation','Natural Selection'] },
    { topic: 'ECOLOGY', subtopics: ['Food Chains and Webs','Ecosystems','Population Ecology','Conservation'] },
    { topic: 'NUTRITION', subtopics: ['Vitamins and Deficiencies','Minerals','Digestion','Balanced Diet'] },
    { topic: 'TRANSPORT SYSTEMS', subtopics: ['Circulatory System','Blood Groups','Lymphatic System','Transport in Plants'] },
    { topic: 'EXCRETION AND HOMEOSTASIS', subtopics: ['Kidney Function','Liver Functions','Osmoregulation'] },
    { topic: 'REPRODUCTION', subtopics: ['Sexual Reproduction','Asexual Reproduction','Human Reproductive System','Plant Reproduction'] },
    { topic: 'COORDINATION AND CONTROL', subtopics: ['Nervous System','Hormones','Sense Organs'] },
    { topic: 'CLASSIFICATION', subtopics: ['Kingdom Classification','Bacteria and Viruses','Plants','Invertebrates','Vertebrates'] },
  ],
  government: [
    { topic: 'BASIC CONCEPTS', subtopics: ['State, Nation, Government','Political Power','Sovereignty'] },
    { topic: 'CONSTITUTION', subtopics: ['Types of Constitution','Features','Constitutional Development in Nigeria'] },
    { topic: 'FEDERALISM', subtopics: ['Features','Merits and Demerits','Nigerian Federalism'] },
    { topic: 'ARMS OF GOVERNMENT', subtopics: ['Legislature','Executive','Judiciary'] },
    { topic: 'ELECTORAL SYSTEMS', subtopics: ['Types of Electoral Systems','INEC','Voting Methods'] },
    { topic: 'NIGERIAN GOVERNMENT', subtopics: ['Pre-Colonial','Colonial','Post-Independence','Military Regimes'] },
    { topic: 'INTERNATIONAL ORGANISATIONS', subtopics: ['UN','AU','ECOWAS','Commonwealth'] },
  ],
  economics: [
    { topic: 'DEMAND AND SUPPLY', subtopics: ['Law of Demand','Law of Supply','Market Equilibrium','Price Mechanism'] },
    { topic: 'ELASTICITY', subtopics: ['PED','PES','Cross Elasticity','Income Elasticity'] },
    { topic: 'MARKET STRUCTURES', subtopics: ['Perfect Competition','Monopoly','Oligopoly','Monopolistic Competition'] },
    { topic: 'NATIONAL INCOME', subtopics: ['GDP','GNP','Methods of Calculation','Standard of Living'] },
    { topic: 'MONETARY POLICY', subtopics: ['Money Supply','CBN','Interest Rates','Banking'] },
    { topic: 'FISCAL POLICY', subtopics: ['Government Budget','Taxation','Public Expenditure'] },
    { topic: 'INTERNATIONAL TRADE', subtopics: ['Balance of Payments','Foreign Exchange','Trade Policies'] },
    { topic: 'AGRICULTURAL ECONOMICS', subtopics: ['Land Tenure','Farming Systems','Agricultural Finance'] },
  ],
};

const FREE_LIMIT = 5;

function yearOptions() {
  const years = ['Random'];
  for (let y = new Date().getFullYear(); y >= 1992; y--) years.push(String(y));
  return years;
}

function questionCountOptions(max) {
  const opts = [];
  for (let n = 10; n <= max; n += 10) opts.push(n);
  if (opts[opts.length - 1] !== max) opts.push(max);
  return opts;
}

/* ---- State ---- */
let selectedIds   = ['english'];
let pendingIds    = ['english'];
let subjectConfig = {
  english: { year: 'Random', count: 40, selectedTopics: [] }
};
let currentMode = 'practice';
let shuffleQ = true;
let shuffleO = false;

/* ---- Toast ---- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ================================================================
   SUBJECT PICKER SHEET
   ================================================================ */
function renderSheet(filter) {
  const list = document.getElementById('sheetList');
  list.innerHTML = '';
  const q = (filter || '').toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q));

  visible.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const item = document.createElement('div');
    item.className = 'sheet-item';
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div style="font-size:18px; width:24px; text-align:center;">${s.icon}</div>
      <div class="sheet-item-name">${s.name}</div>
    `;
    item.addEventListener('click', () => {
      if (checked) pendingIds = pendingIds.filter(id => id !== s.id);
      else pendingIds.push(s.id);
      renderSheet(document.getElementById('sheetSearch').value);
    });
    list.appendChild(item);
  });
}

document.getElementById('pickSubjectsBtn').addEventListener('click', () => {
  pendingIds = [...selectedIds];
  document.getElementById('sheetSearch').value = '';
  renderSheet('');
  document.getElementById('sheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
});

document.getElementById('sheetSearch').addEventListener('input', (e) => {
  renderSheet(e.target.value);
});

/* Select All / Deselect All in sheet */
document.getElementById('sheetSelectAllBtn').addEventListener('click', () => {
  const q = document.getElementById('sheetSearch').value.toLowerCase();
  const visible = ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q)).map(s => s.id);
  const allSelected = visible.every(id => pendingIds.includes(id));
  if (allSelected) {
    // deselect all visible
    pendingIds = pendingIds.filter(id => !visible.includes(id));
  } else {
    // select all visible
    visible.forEach(id => { if (!pendingIds.includes(id)) pendingIds.push(id); });
  }
  renderSheet(q);
});

function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('sheetCancelBtn').addEventListener('click', closeSheet);
document.getElementById('sheetOverlay').addEventListener('click', e => {
  if (e.target === document.getElementById('sheetOverlay')) closeSheet();
});

document.getElementById('sheetOkBtn').addEventListener('click', () => {
  selectedIds = [...pendingIds];
  // Init config for new subjects
  selectedIds.forEach(id => {
    if (!subjectConfig[id]) {
      const s = ALL_SUBJECTS.find(x => x.id === id);
      subjectConfig[id] = { year: 'Random', count: Math.min(40, s.max), selectedTopics: [] };
    }
  });
  // Remove config for deselected subjects
  Object.keys(subjectConfig).forEach(id => {
    if (!selectedIds.includes(id)) delete subjectConfig[id];
  });
  closeSheet();
  renderConfigList();
});

/* ================================================================
   CONFIG CARDS
   ================================================================ */
function topicLabel(id) {
  const sel = subjectConfig[id]?.selectedTopics;
  if (!sel || sel.length === 0) return 'All Topics';
  if (sel.length === 1) {
    const t = sel[0];
    return t.length > 30 ? t.slice(0,30)+'…' : t;
  }
  return `${sel.length} topics selected`;
}

function renderConfigList() {
  const configList  = document.getElementById('configList');
  const emptyState  = document.getElementById('emptyState');
  const optionsCard = document.getElementById('optionsCard');
  const startBtn    = document.getElementById('startBtn');
  const pickedCount = document.getElementById('pickedCount');

  pickedCount.textContent = selectedIds.length;
  startBtn.disabled = selectedIds.length === 0;

  if (selectedIds.length === 0) {
    emptyState.style.display  = 'block';
    configList.style.display  = 'none';
    optionsCard.style.display = 'none';
    return;
  }
  emptyState.style.display  = 'none';
  configList.style.display  = 'flex';
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
        <button class="config-remove" data-remove="${id}" aria-label="Remove ${s.name}">×</button>
      </div>
      <div class="config-row">
        <span class="cr-label">📅 Year</span>
        <select class="cr-select" data-field="year" data-subject="${id}"></select>
      </div>
      <div class="config-row">
        <span class="cr-label">🔢 Questions</span>
        <select class="cr-select" data-field="count" data-subject="${id}"></select>
      </div>
      <div class="config-row">
        <span class="cr-label">🏷️ Topics</span>
        <span class="cr-val topic-edit" data-topic-id="${id}">${topicLabel(id)} ✎</span>
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
let activeTopicSubjectId = null;

function openTopicSheet(subjectId) {
  activeTopicSubjectId = subjectId;
  const s      = ALL_SUBJECTS.find(x => x.id === subjectId);
  const topics = SUBJECT_TOPICS[subjectId] || [];
  const cfg    = subjectConfig[subjectId];
  const sel    = cfg.selectedTopics || [];  // [] = All

  document.getElementById('topicSheetTitle').textContent = s.name + ' — Topics';
  const list = document.getElementById('topicSheetList');
  list.innerHTML = '';

  /* --- ALL TOPICS row --- */
  const allChecked = sel.length === 0;
  const allRow = document.createElement('div');
  allRow.className = 'sheet-item';
  allRow.innerHTML = `
    <div class="sheet-checkbox ${allChecked ? 'checked' : ''}">${allChecked ? '✓' : ''}</div>
    <div class="sheet-item-name" style="font-weight:700;">All Topics</div>
  `;
  allRow.addEventListener('click', () => {
    // Toggle: if all selected → deselect all; if not → select all
    if (subjectConfig[subjectId].selectedTopics.length === 0) {
      // currently all, deselect all = select nothing but we must pick at least something
      // pick nothing = student must manually select. Set to marker:
      // We'll store ['__none__'] as a sentinel for "nothing selected"
      // Actually blueprint says: tap again = deselect all. Let's allow empty (will show warning on start)
      subjectConfig[subjectId].selectedTopics = ['__none__'];
    } else {
      subjectConfig[subjectId].selectedTopics = [];
    }
    openTopicSheet(subjectId);
  });
  list.appendChild(allRow);

  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px; background:var(--line); margin:4px 0;';
  list.appendChild(divider);

  if (topics.length === 0) {
    const msg = document.createElement('p');
    msg.style.cssText = 'padding:20px; text-align:center; color:var(--ink-soft); font-size:13px;';
    msg.textContent = 'Topics will appear here once questions are loaded.';
    list.appendChild(msg);
  }

  /* --- Topic rows --- */
  topics.forEach(topicObj => {
    const tName = topicObj.topic;
    const topicChecked = sel.length === 0 || (sel.includes(tName) && !sel.includes('__none__'));

    /* Topic header row */
    const tRow = document.createElement('div');
    tRow.className = 'sheet-item';
    tRow.style.background = 'var(--paper-dim)';
    tRow.innerHTML = `
      <div class="sheet-checkbox ${topicChecked ? 'checked' : ''}">${topicChecked ? '✓' : ''}</div>
      <div class="sheet-item-name" style="font-weight:700; font-size:13px;">${tName}</div>
    `;
    tRow.addEventListener('click', () => toggleTopicItem(subjectId, tName, topics));
    list.appendChild(tRow);

    /* Subtopic rows */
    (topicObj.subtopics || []).forEach(sub => {
      const subKey = tName + ' : ' + sub;
      const subChecked = sel.length === 0 || (sel.includes(subKey) && !sel.includes('__none__'));
      const sRow = document.createElement('div');
      sRow.className = 'sheet-item';
      sRow.style.paddingLeft = '40px';
      sRow.innerHTML = `
        <div class="sheet-checkbox ${subChecked ? 'checked' : ''}">${subChecked ? '✓' : ''}</div>
        <div class="sheet-item-name" style="font-size:13px; color:var(--ink-soft);">${sub}</div>
      `;
      sRow.addEventListener('click', () => toggleTopicItem(subjectId, subKey, topics));
      list.appendChild(sRow);
    });
  });

  document.getElementById('topicSheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function getAllTopicKeys(topics) {
  const keys = [];
  topics.forEach(t => {
    keys.push(t.topic);
    (t.subtopics || []).forEach(sub => keys.push(t.topic + ' : ' + sub));
  });
  return keys;
}

function toggleTopicItem(subjectId, key, topics) {
  let sel = [...(subjectConfig[subjectId].selectedTopics || [])];
  const allKeys = getAllTopicKeys(topics);

  if (sel.length === 0) {
    // Was "All", now explicitly deselect this one → select all except this
    sel = allKeys.filter(k => k !== key);
  } else if (sel.includes('__none__')) {
    sel = [key];
  } else {
    if (sel.includes(key)) {
      sel = sel.filter(k => k !== key);
      if (sel.length === 0) sel = ['__none__'];
    } else {
      sel.push(key);
      if (sel.length === allKeys.length) sel = []; // all selected = "All"
    }
  }
  subjectConfig[subjectId].selectedTopics = sel;
  openTopicSheet(subjectId);
}

function closeTopicSheet() {
  document.getElementById('topicSheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
  renderConfigList();
}

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
    document.getElementById('timerSection').style.display =
      currentMode === 'study' ? 'none' : 'flex';
  });
});

/* ================================================================
   SWITCHES
   ================================================================ */
document.getElementById('shuffleQSwitch').addEventListener('click', function() {
  shuffleQ = !shuffleQ;
  this.classList.toggle('on', shuffleQ);
});
document.getElementById('shuffleOSwitch').addEventListener('click', function() {
  shuffleO = !shuffleO;
  this.classList.toggle('on', shuffleO);
});

/* ================================================================
   CALCULATOR
   ================================================================ */
let calcDisplay = '0';
let calcExpr    = '';
let calcJustEvaled = false;

function openCalc()  { document.getElementById('calcOverlay').classList.add('open'); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }

function updateCalcDisplay() {
  document.getElementById('calcDisplay').textContent = calcDisplay;
}

function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    if (calcExpr.length <= 1) { calcDisplay = '0'; calcExpr = ''; }
    else { calcExpr = calcExpr.slice(0, -1); calcDisplay = calcExpr; }
  } else if (val === '=') {
    try {
      const safe = calcExpr
        .replace(/×/g, '*').replace(/÷/g, '/')
        .replace(/[^0-9+\-*/.()%]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay;
      calcJustEvaled = true;
    } catch(e) {
      calcDisplay = 'Error'; calcExpr = '';
    }
  } else if (val === '√') {
    if (calcJustEvaled) {
      const n = parseFloat(calcExpr);
      calcDisplay = isFinite(n) ? String(parseFloat(Math.sqrt(n).toFixed(8))) : 'Error';
      calcExpr = calcDisplay;
    } else {
      calcExpr += '√'; calcDisplay = calcExpr; calcJustEvaled = false;
    }
  } else if (['+','-','×','÷','%'].includes(val)) {
    const opMap = {'×':'*','÷':'/'};
    calcExpr += (opMap[val] || val);
    calcDisplay = calcExpr; calcJustEvaled = false;
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
document.getElementById('startBtn').addEventListener('click', () => {
  if (selectedIds.length === 0) { showToast('Please select at least one subject.'); return; }

  // Warn if no topics selected (none sentinel)
  const hasNone = selectedIds.some(id => {
    const sel = subjectConfig[id].selectedTopics;
    return sel && sel.length === 1 && sel[0] === '__none__';
  });
  if (hasNone) { showToast('Please select at least one topic per subject.'); return; }

  const h = document.getElementById('timerH')?.value || '2';
  const m = document.getElementById('timerM')?.value || '0';
  const params = new URLSearchParams({
    subjects: selectedIds.join(','),
    mode: currentMode,
    h, m,
    shuffleQ: shuffleQ ? '1' : '0',
    shuffleO: shuffleO ? '1' : '0',
  });
  selectedIds.forEach(id => {
    params.set('year_'  + id, subjectConfig[id].year);
    params.set('count_' + id, subjectConfig[id].count);
    const sel = subjectConfig[id].selectedTopics || [];
    if (sel.length > 0 && sel[0] !== '__none__') {
      params.set('topics_' + id, sel.join('||'));
    }
  });
  window.location.href = 'practice.html?' + params.toString();
});

/* ================================================================
   DOMContentLoaded — wire calc buttons, initial render
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.getElementById('calcOpenBtn').addEventListener('click', openCalc);
  document.getElementById('calcOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });

  /* Pre-select subject from URL if given */
  const urlParams = new URLSearchParams(window.location.search);
  const qs = urlParams.get('subject');
  if (qs && ALL_SUBJECTS.find(s => s.id === qs)) {
    if (!selectedIds.includes(qs)) {
      selectedIds.push(qs);
      const s = ALL_SUBJECTS.find(x => x.id === qs);
      subjectConfig[qs] = { year: 'Random', count: Math.min(40, s.max), selectedTopics: [] };
    }
  }

  renderConfigList();
});
