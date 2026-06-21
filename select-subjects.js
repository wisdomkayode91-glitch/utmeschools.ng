/* ============================================================
   UTMESchools v2 — select-subjects.js
   Handles: subject picker bottom sheet (max 4), per-subject
   config cards (year/count/topic), mode toggle, timer inputs.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english', name: 'English Language', icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'mathematics', name: 'Mathematics', icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'physics', name: 'Physics', icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'biology', name: 'Biology', icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'government', name: 'Government', icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'economics', name: 'Economics', icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'literature', name: 'Literature in English', icon: '📖', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'crk', name: 'Christian Religious Knowledge', icon: '✝️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'irk', name: 'Islamic Religious Knowledge', icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'geography', name: 'Geography', icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'commerce', name: 'Commerce', icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'accounts', name: 'Accounts', icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'agriculture', name: 'Agricultural Science', icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
];

const MAX_SUBJECTS = 4;

// Years a real question bank could plausibly cover. The actual
// per-subject/per-year list will come from the database once
// real questions are loaded — this is a placeholder range.
function yearOptions(){
  const years = ['Random'];
  for (let y = 2026; y >= 1978; y--) years.push(String(y));
  return years;
}

let selectedIds = [];          // subjects chosen in the sheet, confirmed
let pendingIds = [];           // subjects checked inside the open sheet, not yet confirmed
let subjectConfig = {};        // per-subject settings: { year, count, topic }

/* ---------------- Bottom sheet rendering ---------------- */
const sheetList = document.getElementById('sheetList');

function renderSheet(){
  sheetList.innerHTML = '';
  ALL_SUBJECTS.forEach(s => {
    const checked = pendingIds.includes(s.id);
    const disabled = !checked && pendingIds.length >= MAX_SUBJECTS;
    const item = document.createElement('div');
    item.className = 'sheet-item' + (disabled ? ' disabled' : '');
    item.innerHTML = `
      <div class="sheet-checkbox ${checked ? 'checked' : ''}">${checked ? '✓' : ''}</div>
      <div class="sheet-item-name">${s.name}</div>
    `;
    item.addEventListener('click', () => {
      if (disabled) return;
      if (checked){
        pendingIds = pendingIds.filter(id => id !== s.id);
      } else {
        if (pendingIds.length >= MAX_SUBJECTS) return;
        pendingIds.push(s.id);
      }
      renderSheet();
    });
    sheetList.appendChild(item);
  });
}

/* ---------------- Sheet open/close ---------------- */
const sheetOverlay = document.getElementById('sheetOverlay');
document.getElementById('pickSubjectsBtn').addEventListener('click', () => {
  pendingIds = [...selectedIds];
  renderSheet();
  sheetOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
});
function closeSheet(){
  sheetOverlay.classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('sheetCloseBtn').addEventListener('click', closeSheet);
document.getElementById('sheetCancelBtn').addEventListener('click', closeSheet);
sheetOverlay.addEventListener('click', (e) => { if (e.target === sheetOverlay) closeSheet(); });

document.getElementById('sheetOkBtn').addEventListener('click', () => {
  selectedIds = [...pendingIds];
  // initialize config for newly added subjects
  selectedIds.forEach(id => {
    if (!subjectConfig[id]){
      const subj = ALL_SUBJECTS.find(s => s.id === id);
      subjectConfig[id] = { year: 'Random', count: Math.min(40, subj.max), topic: 'All' };
    }
  });
  // drop config for removed subjects
  Object.keys(subjectConfig).forEach(id => {
    if (!selectedIds.includes(id)) delete subjectConfig[id];
  });
  closeSheet();
  renderConfigList();
});

/* ---------------- Config cards ---------------- */
const configList = document.getElementById('configList');
const emptyState = document.getElementById('emptyState');
const optionsCard = document.getElementById('optionsCard');
const startBtn = document.getElementById('startBtn');
const pickedCount = document.getElementById('pickedCount');

function questionCountOptions(max){
  const opts = [];
  for (let n = 10; n <= max; n += 10) opts.push(n);
  if (opts[opts.length - 1] !== max) opts.push(max);
  return opts;
}

function renderConfigList(){
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
    const s = ALL_SUBJECTS.find(x => x.id === id);
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
        <span class="cr-label">🏷️ Topic</span>
        <span class="cr-val" style="cursor:pointer;color:var(--navy);" data-topic-edit="${id}">${cfg.topic} ✎</span>
      </div>
    `;
    configList.appendChild(card);

    const yearSelect = card.querySelector('[data-field="year"]');
    yearOptions().forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y === 'Random' ? '🔀 Random (all years)' : y;
      if (y === cfg.year) opt.selected = true;
      yearSelect.appendChild(opt);
    });
    yearSelect.addEventListener('change', (e) => { subjectConfig[id].year = e.target.value; });

    const countSelect = card.querySelector('[data-field="count"]');
    questionCountOptions(s.max).forEach(n => {
      const opt = document.createElement('option');
      opt.value = n; opt.textContent = n + ' questions';
      if (n === cfg.count) opt.selected = true;
      countSelect.appendChild(opt);
    });
    countSelect.addEventListener('change', (e) => { subjectConfig[id].count = parseInt(e.target.value, 10); });
  });

  configList.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      selectedIds = selectedIds.filter(x => x !== id);
      delete subjectConfig[id];
      renderConfigList();
    });
  });
}

/* ---------------- Mode toggle ---------------- */
let currentMode = 'practice';
document.querySelectorAll('.mode-toggle button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mode-toggle button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    document.getElementById('timerSection').style.display = currentMode === 'study' ? 'none' : 'block';
  });
});

/* ---------------- Toggle switches ---------------- */
document.querySelectorAll('.switch').forEach(sw => {
  sw.addEventListener('click', () => sw.classList.toggle('on'));
});

/* ---------------- Start button ---------------- */
startBtn.addEventListener('click', () => {
  if (selectedIds.length === 0) return;
  // In the real build, this is where selectedIds + subjectConfig +
  // currentMode + timer values get handed to practice.html (e.g.
  // via sessionStorage or a query string) to actually start the session.
  const summary = selectedIds.map(id => `${ALL_SUBJECTS.find(s=>s.id===id).name} (${subjectConfig[id].count}q, ${subjectConfig[id].year})`).join('\n');
  alert(`Starting ${currentMode.toUpperCase()} mode:\n\n${summary}\n\nThis preview stops here — the actual question screen (practice.html) connects next.`);
});

renderConfigList();
