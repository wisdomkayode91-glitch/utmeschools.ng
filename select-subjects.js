/* ============================================================
   UTMESchools v2 — select-subjects.js
   - English Language pre-selected on load
   - No subject cap (all 27 selectable)
   - Subject search filter in picker
   - Per-subject config cards: year, question count, topic/subtopic
   - Topic/subtopic picker bottom sheet (per-subject topics)
   - Mode toggle: Practice / Mock Exam / Study
   - Custom H:M:S timer (hidden in Study mode)
   - Shuffle questions + shuffle options toggles
   ============================================================ */

/* ---- All 27 subjects ---- */
const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',           icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'mathematics', name: 'Mathematics',                icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'physics',     name: 'Physics',                    icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'chemistry',   name: 'Chemistry',                  icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'biology',     name: 'Biology',                    icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'government',  name: 'Government',                 icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'economics',   name: 'Economics',                  icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'literature',  name: 'Literature in English',      icon: '📖', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'crk',         name: 'CRK',                        icon: '✝️', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'irk',         name: 'IRK',                        icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'geography',   name: 'Geography',                  icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'commerce',    name: 'Commerce',                   icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'accounts',    name: 'Accounts',                   icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'agriculture', name: 'Agricultural Science',       icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'history',     name: 'History',                    icon: '📜', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'fineart',     name: 'Fine Art',                   icon: '🎨', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'music',       name: 'Music',                      icon: '🎵', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'french',      name: 'French',                     icon: '🇫🇷', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'arabic',      name: 'Arabic',                     icon: '🌙', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'hausa',       name: 'Hausa',                      icon: '🗣️', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'igbo',        name: 'Igbo',                       icon: '🗣️', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'yoruba',      name: 'Yoruba',                     icon: '🗣️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
  { id: 'homeec',      name: 'Home Economics',             icon: '🏠', bg: '#E7F8EF', fg: '#0C8C58', max: 60  },
  { id: 'phe',         name: 'PHE',                        icon: '🏃', bg: '#E8F1FF', fg: '#1F5FBF', max: 60  },
  { id: 'computer',    name: 'Computer Studies',           icon: '💻', bg: '#FFF4DC', fg: '#A6760A', max: 60  },
  { id: 'litbooks',    name: 'Literature Textbooks',       icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60  },
  { id: 'lekki',       name: 'The Lekki Headmaster',       icon: '📘', bg: '#F1EAFB', fg: '#6C3FBF', max: 60  },
];

/* ---- Topics per subject ----
   These will be replaced with real topic data from the database.
   Placeholder topics are listed for all subjects. ---- */
const SUBJECT_TOPICS = {
  english: [
    'Comprehension', 'Summary', 'Lexis & Structure', 'Oral Forms',
    'Sentence Interpretation', 'Antonyms & Synonyms', 'Idioms & Phrases',
    'Register', 'Figures of Speech',
  ],
  mathematics: [
    'Number & Numeration', 'Algebraic Processes', 'Mensuration',
    'Plane Geometry', 'Trigonometry', 'Statistics', 'Vectors & Mechanics',
  ],
  physics: [
    'Scalars & Vectors', 'Motion', 'Forces', 'Work, Energy & Power',
    'Waves', 'Electricity', 'Magnetism', 'Optics', 'Modern Physics',
    'Heat & Temperature', 'Pressure', 'Machines',
  ],
  chemistry: [
    'Atomic Structure', 'Bonding', 'States of Matter', 'Acids, Bases & Salts',
    'Organic Chemistry', 'Electrochemistry', 'Equilibrium', 'Kinetics',
    'Mole Concept', 'Periodic Table', 'Environmental Chemistry',
  ],
  biology: [
    'Cell Biology', 'Genetics & Heredity', 'Evolution', 'Ecology',
    'Plant Biology', 'Animal Kingdom', 'Human Biology', 'Reproduction',
    'Nutrition', 'Transport Systems', 'Excretion',
  ],
  government: [
    'Constitutions', 'Arms of Government', 'Political Parties',
    'Electoral Systems', 'Federalism', 'International Relations',
    'Nigerian Political History', 'Public Administration',
  ],
  economics: [
    'Demand & Supply', 'Market Structures', 'National Income',
    'Money & Banking', 'International Trade', 'Agricultural Economics',
    'Public Finance', 'Population', 'Inflation',
  ],
  literature: [
    'Prose', 'Poetry', 'Drama', 'Literary Devices', 'African Literature',
    'Oral Literature',
  ],
  crk: [
    'Old Testament', 'New Testament', 'Life of Jesus', 'Epistles',
    'Prophets', 'The Early Church',
  ],
  irk: [
    'The Quran', 'Hadith', 'Pillars of Islam', 'Islamic History',
    'Fiqh', 'Tawheed',
  ],
  geography: [
    'Physical Geography', 'Human Geography', 'Map Reading',
    'Climate & Weather', 'Population', 'Agriculture', 'Industry',
    'Nigeria & West Africa',
  ],
  commerce: [
    'Trade', 'Banking', 'Insurance', 'Transportation',
    'Warehousing', 'Communication', 'Home Trade', 'Capital',
  ],
  accounts: [
    'Double Entry', 'Trial Balance', 'Final Accounts', 'Depreciation',
    'Partnerships', 'Companies', 'Bank Reconciliation',
  ],
  agriculture: [
    'Crop Production', 'Animal Husbandry', 'Soil Science',
    'Farm Machinery', 'Agricultural Economics', 'Fishery', 'Forestry',
  ],
  history: [
    'Pre-Colonial Africa', 'Colonial Africa', 'Nigerian History',
    'Independence Movements', 'Post-Colonial Africa',
  ],
  fineart:  ['Drawing', 'Painting', 'Sculpture', 'Crafts', 'History of Art'],
  music:    ['Theory', 'Harmony', 'African Music', 'Instruments', 'History of Music'],
  french:   ['Grammar', 'Comprehension', 'Composition', 'Culture', 'Oral French'],
  arabic:   ['Grammar', 'Comprehension', 'Literature', 'Islamic Texts'],
  hausa:    ['Grammar', 'Comprehension', 'Literature', 'Oral Hausa'],
  igbo:     ['Grammar', 'Comprehension', 'Literature', 'Oral Igbo'],
  yoruba:   ['Grammar', 'Comprehension', 'Literature', 'Oral Yoruba'],
  homeec:   ['Food & Nutrition', 'Clothing', 'Home Management', 'Child Development'],
  phe:      ['Physical Fitness', 'Sports', 'Health Education', 'First Aid'],
  computer: ['Hardware', 'Software', 'Programming', 'Data Processing', 'Internet & Networking'],
  litbooks: ['Set Texts', 'Themes', 'Characters', 'Language & Style'],
  lekki:    ['General Knowledge'],
};

/* ---- Year options ---- */
function yearOptions() {
  const years = ['Random'];
  for (let y = 2026; y >= 1992; y--) {
    years.push(String(y));
  }
  return years;
}

/* ---- State ---- */
let selectedIds  = ['english']; // English pre-selected
let pendingIds   = [];          // checked inside open sheet, not yet confirmed
let subjectConfig = {};         // { [id]: { year, count, topics[] } }

// Initialize English config
subjectConfig['english'] = {
  year: 'Random',
  count: 40,
  topics: [...SUBJECT_TOPICS['english']],  // all topics selected by default
};

/* ======================================================
   SUBJECT PICKER SHEET
   ====================================================== */
const subjectSheetOverlay = document.getElementById('subjectSheetOverlay');
const subjectSheetList    = document.getElementById('subjectSheetList');
const subjectSearchInput  = document.getElementById('subjectSearchInput');
const selectAllCheckbox   = document.getElementById('selectAllCheckbox');
let subjectSearchQuery    = '';

function getFilteredSubjects() {
  const q = subjectSearchQuery.toLowerCase();
  return q ? ALL_SUBJECTS.filter(s => s.name.toLowerCase().includes(q)) : ALL_SUBJECTS;
}

function renderSubjectSheet() {
  const filtered = getFilteredSubjects();
  const allChecked = filtered.length > 0 && filtered.every(s => pendingIds.includes(s.id));
  selectAllCheckbox.className = 'sheet-checkbox' + (allChecked ? ' checked' : '');
  selectAllCheckbox.textContent = allChecked ? '✓' : '';

  subjectSheetList.innerHTML = '';
  filtered.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const item = document.createElement('div');
    item.className = 'sheet-item';
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-icon" style="background:${s.bg};color:${s.fg};">${s.icon}</div>
      <div class="sheet-item-name">${s.name}</div>
    `;
    item.addEventListener('click', () => {
      if (checked) {
        pendingIds = pendingIds.filter(id => id !== s.id);
      } else {
        pendingIds.push(s.id);
      }
      renderSubjectSheet();
    });
    subjectSheetList.appendChild(item);
  });
}

// Select All toggle
document.getElementById('subjectSelectAll').addEventListener('click', () => {
  const filtered = getFilteredSubjects();
  const allChecked = filtered.every(s => pendingIds.includes(s.id));
  if (allChecked) {
    // deselect all filtered
    const filteredIds = filtered.map(s => s.id);
    pendingIds = pendingIds.filter(id => !filteredIds.includes(id));
  } else {
    // select all filtered (add missing)
    filtered.forEach(s => {
      if (!pendingIds.includes(s.id)) pendingIds.push(s.id);
    });
  }
  renderSubjectSheet();
});

// Search
subjectSearchInput.addEventListener('input', (e) => {
  subjectSearchQuery = e.target.value;
  renderSubjectSheet();
});

// Open
document.getElementById('pickSubjectsBtn').addEventListener('click', () => {
  pendingIds = [...selectedIds];
  subjectSearchQuery = '';
  subjectSearchInput.value = '';
  renderSubjectSheet();
  subjectSheetOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});

// Close helpers
function closeSubjectSheet() {
  subjectSheetOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('subjectSheetCloseBtn').addEventListener('click', closeSubjectSheet);
document.getElementById('subjectSheetCancelBtn').addEventListener('click', closeSubjectSheet);
subjectSheetOverlay.addEventListener('click', (e) => { if (e.target === subjectSheetOverlay) closeSubjectSheet(); });

// Done / confirm
document.getElementById('subjectSheetOkBtn').addEventListener('click', () => {
  selectedIds = [...pendingIds];

  // Init config for newly added subjects
  selectedIds.forEach(id => {
    if (!subjectConfig[id]) {
      const subj = ALL_SUBJECTS.find(s => s.id === id);
      subjectConfig[id] = {
        year: 'Random',
        count: Math.min(40, subj.max),
        topics: [...(SUBJECT_TOPICS[id] || ['All Topics'])],
      };
    }
  });

  // Drop config for removed subjects
  Object.keys(subjectConfig).forEach(id => {
    if (!selectedIds.includes(id)) delete subjectConfig[id];
  });

  closeSubjectSheet();
  renderConfigList();
});

/* ======================================================
   TOPIC PICKER SHEET
   ====================================================== */
const topicSheetOverlay = document.getElementById('topicSheetOverlay');
const topicSheetList    = document.getElementById('topicSheetList');
let activeTopicSubjectId = null;
let pendingTopics        = [];

function renderTopicSheet(subjectId) {
  const topics    = SUBJECT_TOPICS[subjectId] || ['All Topics'];
  const allChecked = topics.every(t => pendingTopics.includes(t));
  const allCheckbox = document.getElementById('topicSelectAllCheckbox');
  allCheckbox.className = 'sheet-checkbox' + (allChecked ? ' checked' : '');
  allCheckbox.textContent = allChecked ? '✓' : '';

  topicSheetList.innerHTML = '';
  topics.forEach(topic => {
    const checked = pendingTopics.includes(topic);
    const item = document.createElement('div');
    item.className = 'sheet-item';
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${topic}</div>
    `;
    item.addEventListener('click', () => {
      if (checked) {
        pendingTopics = pendingTopics.filter(t => t !== topic);
      } else {
        pendingTopics.push(topic);
      }
      renderTopicSheet(subjectId);
    });
    topicSheetList.appendChild(item);
  });
}

// Select All topics toggle
document.getElementById('topicSelectAll').addEventListener('click', () => {
  const topics = SUBJECT_TOPICS[activeTopicSubjectId] || ['All Topics'];
  const allChecked = topics.every(t => pendingTopics.includes(t));
  pendingTopics = allChecked ? [] : [...topics];
  renderTopicSheet(activeTopicSubjectId);
});

function openTopicSheet(subjectId) {
  activeTopicSubjectId = subjectId;
  const subj = ALL_SUBJECTS.find(s => s.id === subjectId);
  document.getElementById('topicSheetTitle').textContent = subj.name + ' — Topics';
  pendingTopics = [...(subjectConfig[subjectId].topics || [])];
  renderTopicSheet(subjectId);
  topicSheetOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeTopicSheet() {
  topicSheetOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('topicSheetCloseBtn').addEventListener('click', closeTopicSheet);
document.getElementById('topicSheetCancelBtn').addEventListener('click', closeTopicSheet);
topicSheetOverlay.addEventListener('click', (e) => { if (e.target === topicSheetOverlay) closeTopicSheet(); });

document.getElementById('topicSheetOkBtn').addEventListener('click', () => {
  // If nothing selected, default back to all topics
  const topics = SUBJECT_TOPICS[activeTopicSubjectId] || ['All Topics'];
  subjectConfig[activeTopicSubjectId].topics = pendingTopics.length > 0
    ? [...pendingTopics]
    : [...topics];
  closeTopicSheet();
  renderConfigList(); // refresh topic label
});

/* ======================================================
   CONFIG CARDS
   ====================================================== */
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

function topicLabel(subjectId) {
  const allTopics  = SUBJECT_TOPICS[subjectId] || ['All Topics'];
  const chosen     = subjectConfig[subjectId].topics || [];
  if (chosen.length === 0 || chosen.length === allTopics.length) return 'All topics';
  if (chosen.length === 1) return chosen[0];
  return chosen.length + ' topics';
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
        <button class="config-remove" data-remove="${id}" aria-label="Remove ${s.name}">×</button>
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
        <span class="cr-label">🏷️ Topics</span>
        <button class="topic-btn" data-topic-open="${id}">
          ${topicLabel(id)} ✎
        </button>
      </div>
    `;
    configList.appendChild(card);

    // Year dropdown
    const yearSelect = card.querySelector('[data-field="year"]');
    yearOptions().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y === 'Random' ? '🔀 Random (all years)' : y;
      if (y === cfg.year) opt.selected = true;
      yearSelect.appendChild(opt);
    });
    yearSelect.addEventListener('change', (e) => { subjectConfig[id].year = e.target.value; });

    // Question count dropdown
    const countSelect = card.querySelector('[data-field="count"]');
    questionCountOptions(s.max).forEach(n => {
      const opt = document.createElement('option');
      opt.value = n;
      opt.textContent = n + ' questions';
      if (n === cfg.count) opt.selected = true;
      countSelect.appendChild(opt);
    });
    countSelect.addEventListener('change', (e) => {
      subjectConfig[id].count = parseInt(e.target.value, 10);
    });
  });

  // Remove buttons
  configList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      selectedIds = selectedIds.filter(x => x !== id);
      delete subjectConfig[id];
      renderConfigList();
    });
  });

  // Topic open buttons
  configList.querySelectorAll('[data-topic-open]').forEach(btn => {
    btn.addEventListener('click', () => openTopicSheet(btn.dataset.topicOpen));
  });
}

/* ======================================================
   MODE TOGGLE
   ====================================================== */
let currentMode = 'practice';
document.querySelectorAll('.mode-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    document.getElementById('timerSection').style.display =
      currentMode === 'study' ? 'none' : 'block';
  });
});

/* ======================================================
   TOGGLE SWITCHES
   ====================================================== */
document.querySelectorAll('.switch').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('on'));
});

/* ======================================================
   START BUTTON
   ====================================================== */
startBtn.addEventListener('click', () => {
  if (selectedIds.length === 0) return;

  const h = parseInt(document.getElementById('timerH').value, 10) || 0;
  const m = parseInt(document.getElementById('timerM').value, 10) || 0;
  const sec = parseInt(document.getElementById('timerS').value, 10) || 0;

  const session = {
    mode: currentMode,
    timer: currentMode === 'study' ? null : { h, m, s: sec },
    shuffleQ: document.querySelector('[data-toggle="shuffleQ"]').classList.contains('on'),
    shuffleO: document.querySelector('[data-toggle="shuffleO"]').classList.contains('on'),
    subjects: selectedIds.map(id => ({
      id,
      ...subjectConfig[i})),
  };

  // Store in sessionStorage for practice.html to pick up
  sessionStorage.setItem('utmeSession', JSON.stringify(session));
  window.location.href = 'practice.html';
});

/* ======================================================
   INIT — render English pre-selected on load
   ====================================================== */
renderConfigList();
