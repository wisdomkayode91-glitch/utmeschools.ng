/* ============================================================
   UTMESchools v2 — select-subjects.js (FIXED)
   All event listeners now inside DOMContentLoaded.
   Select All / Deselect All topics toggles properly.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',              icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'accounts',    name: 'Accounts',                      icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'agriculture', name: 'Agriculture',                   icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'biology',     name: 'Biology',                       icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'chemistry',   name: 'Chemistry',                     icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'commerce',    name: 'Commerce',                      icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'computer',    name: 'Computer Studies',              icon: '💻', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'crk',         name: 'CRK',                           icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'economics',   name: 'Economics',                     icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'fineart',     name: 'Fine Art',                      icon: '🎨', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'french',      name: 'French',                        icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'geography',   name: 'Geography',                     icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'government',  name: 'Government',                    icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'hausa',       name: 'Hausa',                         icon: '📜', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'history',     name: 'History',                       icon: '🏺', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'homeec',      name: 'Home Economics',                icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'igbo',        name: 'Igbo',                          icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'irk',         name: 'IRK',                           icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'literature',  name: 'Literature',                    icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'littext',     name: 'Literature Textbooks',          icon: '📗', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'mathematics', name: 'Mathematics',                   icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'music',       name: 'Music',                         icon: '🎵', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'phe',         name: 'PHE',                           icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'physics',     name: 'Physics',                       icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'lekki',       name: 'The Lekki Headmaster',          icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'yoruba',      name: 'Yoruba',                        icon: '🌺', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
];

const FREE_LIMIT = 5;

function yearOptions(){
  const years = ['Random'];
  for (let y = new Date().getFullYear(); y >= 1992; y--) years.push(String(y));
  return years;
}

// English is auto-selected on load
let selectedIds = ['english'];
let pendingIds  = ['english'];
let subjectConfig = {
  english: { year: 'Random', count: 40, topic: 'All' }
};

/* ---- DOM refs (set after DOM ready) ---- */
let sheetList, sheetOverlay, configList, emptyState, optionsCard, startBtn, pickedCount;

/* ---- Topics/subtopics per subject ---- */
const SUBJECT_TOPICS = {
  english: [
    'ORAL FORMS : CONSONANTS','ORAL FORMS : VOWELS','ORAL FORMS : STRESS PATTERN',
    'ORAL FORMS : RHYMES','ORAL FORMS : EMPHATIC STRESS',
    'LEXIS AND STRUCTURE : ANTONYMS','LEXIS AND STRUCTURE : SYNONYMS',
    'LEXIS AND STRUCTURE : SENTENCE COMPLETION','LEXIS AND STRUCTURE : SENTENCE INTERPRETATION',
    'COMPREHENSION PASSAGE','CLOZE PASSAGE',
    'NOVEL : THE LEKKI HEADMASTER',
  ],
  mathematics: [
    'NUMBER AND NUMERATION','ALGEBRA','GEOMETRY AND MENSURATION',
    'TRIGONOMETRY','CALCULUS','STATISTICS AND PROBABILITY',
    'SETS AND LOGIC','MATRICES AND DETERMINANTS',
  ],
  physics: [
    'MECHANICS : SCALARS AND VECTORS','MECHANICS : MOTION',
    'MECHANICS : EQUILIBRIUM','MECHANICS : WORK, ENERGY AND POWER',
    'MECHANICS : MOMENTUM','HEAT : TEMPERATURE AND THERMOMETRY',
    'CHANGE OF STATE','CHANGE OF STATE : LATENT HEAT',
    'CHANGE OF STATE : EVAPORATION AND BOILING',
    'CHANGE OF STATE : SPECIFIC LATENT HEATS OF FUSION',
    'CHANGE OF STATE : SPECIFIC LATENT HEATS OF VAPORIZATION',
    'WAVES','LIGHT : REFLECTION','LIGHT : REFRACTION',
    'CURRENT ELECTRICITY','CAPACITORS','CAPACITORS : CAPACITANCE OF A CAPACITORS',
    'CAPACITORS : CAPACITORS IN SERIES AND PARALLEL',
    'CAPACITORS : ENERGY STORED IN A CAPACITOR',
    'CHARACTERISTICS OF SOUND WAVES : FREQUENCY OF A NOTE EMITTED BY AIR COLUMNS',
    'CHARACTERISTICS OF SOUND WAVES : QUALITY, PITCH, INTENSITY AND LOUDNESS',
    'CONDUCTION OF ELECTRICITY THROUGH : GASES',
    'CONDUCTION OF ELECTRICITY THROUGH : LIQUIDS',
    'ATOMIC PHYSICS: ATOMS',
  ],
  chemistry: [
    'ATOMIC STRUCTURE','CHEMICAL BONDING','ACIDS, BASES AND SALTS',
    'ELECTROLYSIS','ORGANIC CHEMISTRY : HYDROCARBONS',
    'ORGANIC CHEMISTRY : FUNCTIONAL GROUPS',
    'RATES OF REACTION','EQUILIBRIUM','ELECTROCHEMISTRY',
    'PERIODIC TABLE','GAS LAWS','MOLE CONCEPT',
  ],
  biology: [
    'CELL BIOLOGY','GENETICS AND EVOLUTION','ECOLOGY',
    'PLANT AND ANIMAL NUTRITION','TRANSPORT SYSTEMS',
    'EXCRETION AND HOMEOSTASIS','REPRODUCTION',
    'COORDINATION AND CONTROL','CLASSIFICATION OF LIVING THINGS',
  ],
  government: [
    'BASIC CONCEPTS IN GOVERNMENT','CONSTITUTION','FEDERALISM',
    'ARMS OF GOVERNMENT','ELECTORAL SYSTEMS','POLITICAL PARTIES',
    'NIGERIAN GOVERNMENT','INTERNATIONAL ORGANIZATIONS',
  ],
  economics: [
    'DEMAND AND SUPPLY','ELASTICITY','MARKET STRUCTURES',
    'NATIONAL INCOME','MONETARY POLICY','FISCAL POLICY',
    'INTERNATIONAL TRADE','ECONOMIC DEVELOPMENT',
    'POPULATION AND LABOUR','AGRICULTURAL ECONOMICS',
  ],
  literature: [
    'PROSE','POETRY','DRAMA',
    'LITERARY TERMS AND DEVICES','WEST AFRICAN LITERATURE',
  ],
  crk: [
    'OLD TESTAMENT','NEW TESTAMENT','TEMPTATION OF JESUS',
    'CHRISTIAN ETHICS','CHURCH HISTORY',
  ],
  irk: [
    'PILLARS OF ISLAM','SUNNAH AND HADITH','TAWHID',
    'ISLAMIC JURISPRUDENCE','HISTORY OF ISLAM',
  ],
  geography: [
    'PHYSICAL GEOGRAPHY : MAPS','PHYSICAL GEOGRAPHY : CLIMATE',
    'PHYSICAL GEOGRAPHY : LANDFORMS','HUMAN GEOGRAPHY',
    'ECONOMIC GEOGRAPHY','REGIONAL GEOGRAPHY : NIGERIA',
    'REGIONAL GEOGRAPHY : AFRICA',
  ],
  commerce: [
    'TRADE','RETAIL TRADE','WHOLESALE TRADE',
    'BANKING','INSURANCE','TRANSPORTATION',
    'WAREHOUSING','COMMUNICATION IN COMMERCE',
  ],
  accounts: [
    'BOOK-KEEPING PRINCIPLES','TRIAL BALANCE','TRADING ACCOUNT',
    'PROFIT AND LOSS ACCOUNT','BALANCE SHEET',
    'PARTNERSHIP ACCOUNTS','COMPANY ACCOUNTS',
  ],
  agriculture: [
    'CROP PRODUCTION','ANIMAL PRODUCTION','SOIL SCIENCE',
    'AGRICULTURAL ECONOMICS','FARM MANAGEMENT',
    'AGRO-ALLIED INDUSTRIES',
  ],
};

let currentMode = 'practice';
let topicSheetSubjectId = null;

/* ============================================================
   INIT — ALL EVENT LISTENERS INSIDE DOMContentLoaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM refs
  sheetList    = document.getElementById('sheetList');
  sheetOverlay = document.getElementById('sheetOverlay');
  configList   = document.getElementById('configList');
  emptyState   = document.getElementById('emptyState');
  optionsCard  = document.getElementById('optionsCard');
  startBtn     = document.getElementById('startBtn');
  pickedCount  = document.getElementById('pickedCount');

  // Wire subject picker
  const pickSubjectsBtn = document.getElementById('pickSubjectsBtn');
  if (pickSubjectsBtn){
    pickSubjectsBtn.addEventListener('click', () => {
      pendingIds = [...selectedIds];
      renderSheet();
      sheetOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  // Wire sheet close
  const sheetCloseBtn = document.getElementById('sheetCloseBtn');
  if (sheetCloseBtn) sheetCloseBtn.addEventListener('click', closeSheet);
  
  const sheetCancelBtn = document.getElementById('sheetCancelBtn');
  if (sheetCancelBtn) sheetCancelBtn.addEventListener('click', closeSheet);
  
  if (sheetOverlay){
    sheetOverlay.addEventListener('click', e => { 
      if (e.target === sheetOverlay) closeSheet(); 
    });
  }

  // Wire sheet OK
  const sheetOkBtn = document.getElementById('sheetOkBtn');
  if (sheetOkBtn){
    sheetOkBtn.addEventListener('click', () => {
      selectedIds = [...pendingIds];
      selectedIds.forEach(id => {
        if (!subjectConfig[id]){
          const s = ALL_SUBJECTS.find(x => x.id === id);
          subjectConfig[id] = { year: 'Random', count: Math.min(40, s.max), topic: 'All' };
        }
      });
      Object.keys(subjectConfig).forEach(id => {
        if (!selectedIds.includes(id)) delete subjectConfig[id];
      });
      closeSheet();
      renderConfigList();
    });
  }

  // Wire mode toggle
  document.querySelectorAll('.mode-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentMode = btn.dataset.mode;
      const timerSection = document.getElementById('timerSection');
      if (timerSection) timerSection.style.display = currentMode === 'study' ? 'none' : 'block';
    });
  });

  // Wire toggle switches
  document.querySelectorAll('.switch').forEach(sw => {
    sw.addEventListener('click', () => sw.classList.toggle('on'));
  });

  // Wire calculator
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });
  
  const calcCloseBtn = document.getElementById('calcCloseBtn');
  if (calcCloseBtn) calcCloseBtn.addEventListener('click', closeCalc);
  
  const calcOpenBtn = document.getElementById('calcOpenBtn');
  if (calcOpenBtn) calcOpenBtn.addEventListener('click', openCalc);

  // Wire topic sheet
  const topicSheetCloseBtn = document.getElementById('topicSheetCloseBtn');
  if (topicSheetCloseBtn) topicSheetCloseBtn.addEventListener('click', closeTopicSheet);
  
  const topicSheetCancelBtn = document.getElementById('topicSheetCancelBtn');
  if (topicSheetCancelBtn) topicSheetCancelBtn.addEventListener('click', closeTopicSheet);
  
  const topicSheetOkBtn = document.getElementById('topicSheetOkBtn');
  if (topicSheetOkBtn) topicSheetOkBtn.addEventListener('click', closeTopicSheet);
  
  const topicSheetOverlay = document.getElementById('topicSheetOverlay');
  if (topicSheetOverlay){
    topicSheetOverlay.addEventListener('click', e => {
      if (e.target === topicSheetOverlay) closeTopicSheet();
    });
  }

  // Wire start button
  if (startBtn){
    startBtn.addEventListener('click', () => {
      if (selectedIds.length === 0) return;
      const p = new URLSearchParams({
        subjects: selectedIds.join(','),
        mode: currentMode,
        h: document.getElementById('timerH')?.value || 2,
        m: document.getElementById('timerM')?.value || 0,
      });
      selectedIds.forEach(id => {
        p.set(`year_${id}`, subjectConfig[id].year);
        p.set(`count_${id}`, subjectConfig[id].count);
      });
      window.location.href = `practice.html?${p.toString()}`;
    });
  }

  // Initial render
  renderConfigList();
});

/* ============================================================
   SHEET
   ============================================================ */
function renderSheet(){
  if (!sheetList) return;
  sheetList.innerHTML = '';
  ALL_SUBJECTS.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const item = document.createElement('div');
    item.className = 'sheet-item';
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${s.name}</div>
    `;
    item.addEventListener('click', () => {
      if (checked){
        pendingIds = pendingIds.filter(id => id !== s.id);
      } else {
        pendingIds.push(s.id);
      }
      renderSheet();
    });
    sheetList.appendChild(item);
  });
}

function closeSheet(){
  if (sheetOverlay) sheetOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   CONFIG CARDS
   ============================================================ */
function questionCountOptions(max){
  const opts = [];
  for (let n = 10; n <= max; n += 10) opts.push(n);
  if (opts[opts.length - 1] !== max) opts.push(max);
  return opts;
}

function renderConfigList(){
  if (!pickedCount || !startBtn || !configList || !emptyState || !optionsCard) return;

  pickedCount.textContent = selectedIds.length;
  startBtn.disabled = selectedIds.length === 0;

  if (selectedIds.length === 0){
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

    // populate year dropdown
    const yearSel = card.querySelector('[data-field="year"]');
    yearOptions().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y === 'Random' ? '🔀 Random (all years)' : y;
      if (y === cfg.year) opt.selected = true;
      yearSel.appendChild(opt);
    });
    yearSel.addEventListener('change', e => { subjectConfig[id].year = e.target.value; });

    // populate count dropdown
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

  // remove buttons
  configList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      selectedIds = selectedIds.filter(x => x !== id);
      delete subjectConfig[id];
      renderConfigList();
    });
  });

  // topic edit buttons
  configList.querySelectorAll('.topic-edit').forEach(el => {
    el.addEventListener('click', () => openTopicSheet(el.dataset.topicId));
  });
}

/* ============================================================
   TOPIC PICKER (FIXED: Select All / Deselect All toggle)
   ============================================================ */
function openTopicSheet(subjectId){
  topicSheetSubjectId = subjectId;
  const s      = ALL_SUBJECTS.find(x => x.id === subjectId);
  const topics = SUBJECT_TOPICS[subjectId] || [];
  const cfg    = subjectConfig[subjectId];
  
  let selectedTopics = cfg.selectedTopics || [];
  const isAllSelected = selectedTopics.length === 0 || selectedTopics.length === topics.length;

  const overlay = document.getElementById('topicSheetOverlay');
  const list    = document.getElementById('topicSheetList');
  const title   = document.getElementById('topicSheetTitle');
  if (title) title.textContent = s.name + ' — Select Topics';
  if (list) list.innerHTML = '';

  // Select All / Deselect All row
  const allRow = document.createElement('div');
  allRow.className = 'sheet-item';
  allRow.innerHTML = `
    <div class="sheet-checkbox ${isAllSelected ? 'checked' : ''}">${isAllSelected ? '✓' : ''}</div>
    <div class="sheet-item-name" style="font-weight:700;">${isAllSelected ? 'Deselect All' : 'Select All'}</div>
  `;
  allRow.addEventListener('click', () => {
    if (isAllSelected){
      subjectConfig[subjectId].selectedTopics = [];
    } else {
      subjectConfig[subjectId].selectedTopics = [...topics];
    }
    openTopicSheet(subjectId);
  });
  if (list) list.appendChild(allRow);

  const divider = document.createElement('div');
  divider.style.cssText = 'height:1px;background:var(--line);margin:6px 0;';
  if (list) list.appendChild(divider);

  // Individual topics
  topics.forEach(topic => {
    const checked = selectedTopics.length === 0 || selectedTopics.includes(topic);
    const row = document.createElement('div');
    row.className = 'sheet-item';
    row.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${topic}</div>
    `;
    row.addEventListener('click', () => {
      let sel = [...(subjectConfig[subjectId].selectedTopics || [])];
      if (sel.length === 0) sel = [...topics];
      if (checked) sel = sel.filter(t => t !== topic);
      else sel.push(topic);
      if (sel.length === topics.length) sel = [];
      subjectConfig[subjectId].selectedTopics = sel;
      openTopicSheet(subjectId);
    });
    if (list) list.appendChild(row);
  });

  if (topics.length === 0 && list){
    const msg = document.createElement('p');
    msg.style.cssText = 'padding:20px;text-align:center;color:var(--ink-soft);font-size:13px;';
    msg.textContent = 'Topics will appear here once questions are loaded.';
    list.appendChild(msg);
  }

  if (overlay){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeTopicSheet(){
  const overlay = document.getElementById('topicSheetOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  renderConfigList();
}

function topicLabel(id){
  const sel = subjectConfig[id]?.selectedTopics;
  if (!sel || sel.length === 0) return 'All';
  if (sel.length === 1) return sel[0].slice(0, 28) + (sel[0].length > 28 ? '…' : '');
  return `${sel.length} topics`;
}

/* ============================================================
   CALCULATOR
   ============================================================ */
let calcDisplay = '0';
let calcExpr    = '';
let calcJustEvaled = false;

function openCalc(){
  const overlay = document.getElementById('calcOverlay');
  if (overlay) overlay.classList.add('open');
  updateCalcDisplay();
}

function closeCalc(){
  const overlay = docum
