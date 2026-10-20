/* ============================================================
   UTMESchools v2 — select-subjects.js

   New in this version: every JAMB subject card has a "Topics" row.
   Tap it to choose whole topics or individual subtopics. The choice is
   sent to the practice page as stable IDs:
     tid_<subject>=topicId,topicId     (whole topics)
     sid_<subject>=subtopicId,...      (individual subtopics)
   The approved topic list comes from topic-catalogue.js.
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';

const JAMB_SUBJECTS = [
  { id:'english',            name:'English Language',      icon:'🔤', max:60 },
  { id:'mathematics',        name:'Mathematics',           icon:'📐', max:40 },
  { id:'english-literature', name:'Literature in English', icon:'📚', max:40 },
  { id:'lekki-headmaster',   name:'The Lekki Headmaster',  icon:'📖', max:40 },
  { id:'biology',            name:'Biology',               icon:'🧬', max:40 },
  { id:'chemistry',          name:'Chemistry',             icon:'⚗️', max:40 },
  { id:'physics',            name:'Physics',               icon:'⚛️', max:40 },
  { id:'economics',          name:'Economics',             icon:'📈', max:40 },
  { id:'government',         name:'Government',            icon:'🏛️', max:40 },
  { id:'commerce',           name:'Commerce',              icon:'🛒', max:40 },
  { id:'accounting',         name:'Accounting',            icon:'🧾', max:40 },
  { id:'crk',                name:'CRK',                   icon:'✝️', max:40 },
  { id:'computer-studies',   name:'Computer Studies',      icon:'💻', max:40 },
  { id:'arabic-studies',     name:'Arabic Studies',        icon:'🕌', max:40 },
  { id:'fine-art',           name:'Fine Art',              icon:'🎨', max:40 },
  { id:'yoruba',             name:'Yoruba',                icon:'🌺', max:40 },
];

let selectedIds   = ['english'];
let pendingIds    = ['english'];
let currentMode   = 'practice';
let currentExam   = 'utme';
let jambConfig    = { english: { year: 'Random', count: 40, subs: [] } };
let jambYearsCache = {};

let selectedSchool    = null;
let pendingSchool     = null;
let postutmeSubjects  = [];
let pendingPostutmeSubjects = [];
let postutmeConfig    = { count: 40 };
let schoolsCache      = null;
let postutmeSubjectsCache = {};

let currentTab    = 'jamb';
let sheetMode     = 'jamb';

/* ---- topic picker state ---- */
let topicCountsCache  = {};      /* subjectId -> { ok, topic:{id:n}, sub:{id:n}, error } */
let topicSheetSubject = null;
let topicSheetToken   = 0;
let topicCounts       = null;
let pendingSubs       = new Set();
let expandedTopics    = new Set();

document.addEventListener('DOMContentLoaded', () => {
  const jambBar = document.querySelector('#panelJamb .selected-bar');
  if (jambBar) jambBar.addEventListener('click', openSheet);

  document.getElementById('sheetCancelBtn').addEventListener('click', closeSheet);
  document.getElementById('sheetDoneBtn').addEventListener('click', onSheetDone);
  document.getElementById('sheetSelectAllBtn').addEventListener('click', onSheetSelectAll);

  const sheetSearch = document.getElementById('sheetSearch');
  if (sheetSearch) sheetSearch.addEventListener('input', e => onSheetSearch(e.target.value));

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
      if (timerRow) timerRow.style.display = currentMode === 'study' ? 'none' : 'flex';
      renderStartBar();
    });
  });

  document.getElementById('startBtn').addEventListener('click', startSession);

  document.getElementById('calcOpenBtn').addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.getElementById('calcOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });
  document.querySelectorAll('.calc-key').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });

  renderSelectedBar();
  renderConfigCards();
  renderStartBar();
});

function switchTab(tab) {
  currentTab = tab;
  document.getElementById('tabJamb').classList.toggle('active', tab === 'jamb');
  document.getElementById('tabPostutme').classList.toggle('active', tab === 'postutme');
  document.getElementById('panelJamb').style.display     = tab === 'jamb'     ? 'block' : 'none';
  document.getElementById('panelPostutme').style.display = tab === 'postutme' ? 'block' : 'none';
  document.getElementById('optionsSection').style.display = 'none';
  renderStartBar();
}

function renderSelectedBar() {
  const pillsEl = document.getElementById('selectedPills');
  if (!pillsEl) return;

  if (selectedIds.length === 0) {
    pillsEl.innerHTML = '<span class="selected-pill empty">Tap to choose subjects</span>';
  } else {
    pillsEl.innerHTML = selectedIds.map(id => {
      const s = JAMB_SUBJECTS.find(x => x.id === id);
      return `<span class="selected-pill">${s?.icon || '📚'} ${s?.name || id}</span>`;
    }).join('');
  }
}

/* ============================================================
   TOPIC LIST HELPERS
   ============================================================ */
function catalogueFor(subjectId) {
  return (window.TopicCatalogue && window.TopicCatalogue.subjects && window.TopicCatalogue.subjects[subjectId]) || null;
}

function topicSummary(subjectId) {
  const cfg  = jambConfig[subjectId];
  const subs = (cfg && cfg.subs) || [];
  const cat  = catalogueFor(subjectId);
  if (!cat || !subs.length) return 'All topics ›';
  const sel = new Set(subs);
  let fullTopics = 0, partialSubs = 0;
  cat.topics.forEach(t => {
    const n = t.subs.filter(s => sel.has(s.id)).length;
    if (n === t.subs.length) fullTopics++; else partialSubs += n;
  });
  const parts = [];
  if (fullTopics)  parts.push(fullTopics  + ' topic'    + (fullTopics  > 1 ? 's' : ''));
  if (partialSubs) parts.push(partialSubs + ' subtopic' + (partialSubs > 1 ? 's' : ''));
  return (parts.join(' · ') || 'All topics') + ' ›';
}

function hasTopicSelection(subjectId) {
  const cfg = jambConfig[subjectId];
  return !!(cfg && cfg.subs && cfg.subs.length && catalogueFor(subjectId));
}

/* chosen subtopics -> { tids:[whole topics], sids:[individual subtopics] } */
function selectionParams(subjectId) {
  const cat  = catalogueFor(subjectId);
  const subs = new Set((jambConfig[subjectId] && jambConfig[subjectId].subs) || []);
  if (!cat || !subs.size) return null;
  const tids = [], sids = [];
  cat.topics.forEach(t => {
    const n = t.subs.filter(s => subs.has(s.id)).length;
    if (n === t.subs.length) tids.push(t.id);
    else t.subs.forEach(s => { if (subs.has(s.id)) sids.push(s.id); });
  });
  return { tids, sids };
}

function refreshTopicButton(subjectId) {
  const btn = document.querySelector(`[data-topics="${subjectId}"]`);
  if (!btn) return;
  btn.textContent = topicSummary(subjectId);
  btn.classList.toggle('active', hasTopicSelection(subjectId));
}

/* how many classified questions exist per topic / subtopic */
async function fetchTopicCounts(subjectId) {
  if (topicCountsCache[subjectId]) return topicCountsCache[subjectId];
  const out = { ok: false, topic: {}, sub: {}, error: '' };
  try {
    const PAGE = 1000;
    for (let offset = 0; ; offset += PAGE) {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.${subjectId}&exam_type=eq.utme&topic_id=not.is.null&select=topic_id,subtopic_id&order=id.asc&limit=${PAGE}&offset=${offset}`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      if (!res.ok) { out.error = String(res.status); return out; }
      const rows = await res.json();
      rows.forEach(q => {
        out.topic[q.topic_id] = (out.topic[q.topic_id] || 0) + 1;
        if (q.subtopic_id) out.sub[q.subtopic_id] = (out.sub[q.subtopic_id] || 0) + 1;
      });
      if (rows.length < PAGE) break;
    }
    out.ok = true;
    topicCountsCache[subjectId] = out;      /* only successful results are cached */
  } catch (e) { out.error = 'network'; }
  return out;
}

/* ============================================================
   SUBJECT CONFIG CARDS
   ============================================================ */
async function renderConfigCards() {
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

  for (const id of selectedIds) {
    const s = JAMB_SUBJECTS.find(x => x.id === id);
    if (!s) continue;

    const cfg = jambConfig[id] || { year: 'Random', count: 40, subs: [] };
    if (!cfg.subs) cfg.subs = [];
    jambConfig[id] = cfg;

    const card = document.createElement('div');
    card.className = 'config-card';
    card.innerHTML = `
      <div class="config-card-head">
        <div class="config-card-icon" style="background:#EEF4FF;">${s.icon}</div>
        <div class="config-card-name">${s.name}</div>
        <button class="config-remove" data-remove="${id}">×</button>
      </div>
      <div class="config-row" style="justify-content:center;color:#8A94A6;font-size:12px;padding:12px 0;">Loading years...</div>`;
    cards.appendChild(card);

    const years = await fetchYearsForJamb(id);

    let yearOptions = '<option value="Random">🔀 Random (all years)</option>';
    if (years.length > 0) {
      yearOptions += years.map(y =>
        `<option value="${y}" ${String(cfg.year) === String(y) ? 'selected' : ''}>${y}</option>`
      ).join('');
    }

    const counts = [];
    for (let n = 10; n <= s.max; n += 10) counts.push(n);
    if (counts[counts.length-1] !== s.max) counts.push(s.max);
    const countSel = counts.map(n =>
      `<option value="${n}" ${cfg.count === n ? 'selected' : ''}>${n} questions</option>`
    ).join('');

    const yearRange = years.length > 0
      ? `${years[years.length-1]}–${years[0]}`
      : 'no data yet';

    const topicRow = catalogueFor(id) ? `
      <div class="config-row">
        <span class="config-row-label">🧩 Topics</span>
        <button class="topic-btn ${hasTopicSelection(id) ? 'active' : ''}" data-topics="${id}">${topicSummary(id)}</button>
      </div>` : '';

    card.innerHTML = `
      <div class="config-card-head">
        <div class="config-card-icon" style="background:#EEF4FF;">${s.icon}</div>
        <div class="config-card-name">${s.name}</div>
        <button class="config-remove" data-remove="${id}">×</button>
      </div>
      <div class="config-row">
        <span class="config-row-label">📅 Year <span style="color:#8A94A6;font-size:11px;">(${yearRange})</span></span>
        <select class="config-select" data-field="year" data-subject="${id}">${yearOptions}</select>
      </div>
      <div class="config-row">
        <span class="config-row-label">🔢 Questions</span>
        <select class="config-select" data-field="count" data-subject="${id}">${countSel}</select>
      </div>${topicRow}`;

    card.querySelector('[data-field="year"]').addEventListener('change', e => {
      jambConfig[id].year = e.target.value;
    });
    card.querySelector('[data-field="count"]').addEventListener('change', e => {
      jambConfig[id].count = parseInt(e.target.value);
    });
    const topicBtn = card.querySelector('[data-topics]');
    if (topicBtn) topicBtn.addEventListener('click', () => openTopicSheet(id));
    card.querySelector('[data-remove]').addEventListener('click', () => {
      selectedIds = selectedIds.filter(x => x !== id);
      delete jambConfig[id];
      renderSelectedBar();
      renderConfigCards();
      renderStartBar();
    });
  }
}

async function fetchYearsForJamb(subjectId) {
  if (jambYearsCache[subjectId]) return jambYearsCache[subjectId];
  try {
    /* limit=50000 ensures we get every single year available */
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.${subjectId}&exam_type=eq.utme&select=year&order=year.desc&limit=50000`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const data = await res.json();
    const years = [...new Set(data.map(q => q.year).filter(y => y !== null))].sort((a,b) => b - a);
    jambYearsCache[subjectId] = years;
    return years;
  } catch(e) {
    console.error('Year fetch error:', e);
    return [];
  }
}

/* ============================================================
   SHEET (subjects / topics / schools / post-utme subjects)
   ============================================================ */
function openSheet() {
  const sheetOverlay = document.getElementById('sheetOverlay');
  const titleEl = document.getElementById('sheetTitle');
  const searchEl = document.getElementById('sheetSearch');

  if (currentTab === 'jamb') {
    sheetMode = 'jamb';
    titleEl.textContent = 'Choose Subjects to Practise';
    searchEl.placeholder = '🔍 Search subjects...';
    document.getElementById('sheetSelectAllBtn').style.display = 'block';
    document.getElementById('sheetSelectAllBtn').textContent = 'Select All';
    pendingIds = [...selectedIds];
    searchEl.value = '';
    renderJambSheetItems('');
    sheetOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSheet() {
  document.getElementById('sheetOverlay').classList.remove('open');
  document.body.style.overflow = '';
  topicSheetToken++;
}

function onSheetSearch(val) {
  if (sheetMode === 'jamb')                renderJambSheetItems(val);
  else if (sheetMode === 'topics')         renderTopicSheetItems(val);
  else if (sheetMode === 'schools')        renderSchoolSheetItems(val);
  else if (sheetMode === 'postutme-subs')  renderPostutmeSubjectsSheetItems(val);
}

function onSheetDone() {
  if (sheetMode === 'jamb')                confirmJambSheet();
  else if (sheetMode === 'topics')         confirmTopicSheet();
  else if (sheetMode === 'schools')        confirmSchoolSheet();
  else if (sheetMode === 'postutme-subs')  confirmPostutmeSubjectsSheet();
}

function onSheetSelectAll() {
  if (sheetMode === 'jamb')                toggleSelectAllJamb();
  else if (sheetMode === 'topics')         toggleSelectAllTopics();
  else if (sheetMode === 'postutme-subs')  toggleSelectAllPostutmeSubjects();
}

function renderJambSheetItems(filter) {
  const body = document.getElementById('sheetBody');
  if (!body) return;
  const q       = (filter || '').toLowerCase();
  const visible = JAMB_SUBJECTS.filter(s => s.name.toLowerCase().includes(q));

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
}

function confirmJambSheet() {
  if (pendingIds.length === 0) {
    showToast('Select at least one subject to continue');
    return;
  }
  selectedIds = [...pendingIds];
  selectedIds.forEach(id => {
    if (!jambConfig[id]) {
      const s = JAMB_SUBJECTS.find(x => x.id === id);
      jambConfig[id] = { year: 'Random', count: Math.min(40, s?.max || 40), subs: [] };
    }
  });
  closeSheet();
  renderSelectedBar();
  renderConfigCards();
  renderStartBar();
}

function toggleSelectAllJamb() {
  const q       = (document.getElementById('sheetSearch')?.value || '').toLowerCase();
  const visible = JAMB_SUBJECTS.filter(s => s.name.toLowerCase().includes(q)).map(s => s.id);
  const allSelected = visible.every(id => pendingIds.includes(id));
  if (allSelected) {
    pendingIds = pendingIds.filter(id => !visible.includes(id));
    document.getElementById('sheetSelectAllBtn').textContent = 'Select All';
  } else {
    visible.forEach(id => { if (!pendingIds.includes(id)) pendingIds.push(id); });
    document.getElementById('sheetSelectAllBtn').textContent = 'Deselect All';
  }
  renderJambSheetItems(q);
}

/* ============================================================
   TOPIC / SUBTOPIC SHEET
   ============================================================ */
function mk(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

async function openTopicSheet(subjectId) {
  const cat = catalogueFor(subjectId);
  if (!cat) { showToast('Topics are not available for this subject yet'); return; }

  sheetMode = 'topics';
  topicSheetSubject = subjectId;
  const token = ++topicSheetToken;

  const s = JAMB_SUBJECTS.find(x => x.id === subjectId);
  document.getElementById('sheetTitle').textContent = 'Topics — ' + (s ? s.name : subjectId);
  const searchEl = document.getElementById('sheetSearch');
  searchEl.placeholder = '🔍 Search topics...';
  searchEl.value = '';
  const allBtn = document.getElementById('sheetSelectAllBtn');
  allBtn.style.display = 'block';
  allBtn.textContent = 'Select All';

  pendingSubs    = new Set((jambConfig[subjectId] && jambConfig[subjectId].subs) || []);
  expandedTopics = new Set();
  topicCounts    = null;

  const body = document.getElementById('sheetBody');
  body.innerHTML = '';
  body.appendChild(mk('div', 'sheet-item loading', 'Loading topics...'));
  document.getElementById('sheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  const counts = await fetchTopicCounts(subjectId);
  if (token !== topicSheetToken || sheetMode !== 'topics') return;   /* closed while loading */
  topicCounts = counts;
  renderTopicSheetItems('');
}

function renderTopicSheetItems(filter) {
  const body = document.getElementById('sheetBody');
  if (!body) return;
  const cat = catalogueFor(topicSheetSubject);
  const prevScroll = body.scrollTop;
  body.innerHTML = '';

  if (!cat) { body.appendChild(mk('div', 'sheet-item loading', 'No topics for this subject')); return; }
  if (!topicCounts || !topicCounts.ok) {
    body.appendChild(mk('div', 'sheet-item loading',
      topicCounts && topicCounts.error === '400'
        ? 'Topic practice is not ready yet.'
        : 'Could not load topics. Check your connection and try again.'));
    return;
  }

  const total = Object.keys(topicCounts.topic).reduce((a, k) => a + topicCounts.topic[k], 0);
  if (!total) {
    body.appendChild(mk('div', 'sheet-note',
      'No questions have been sorted by topic yet. Topics will unlock here as the questions are updated.'));
  }

  const q = (filter || '').toLowerCase();

  cat.topics.forEach(t => {
    const tCount     = topicCounts.topic[t.id] || 0;
    const topicMatch = !q || t.name.toLowerCase().includes(q);
    const subList    = t.subs.filter(s => topicMatch || s.name.toLowerCase().includes(q));
    if (!topicMatch && !subList.length) return;

    const nSel    = t.subs.filter(s => pendingSubs.has(s.id)).length;
    const full    = nSel === t.subs.length;
    const partial = nSel > 0 && !full;
    const open    = expandedTopics.has(t.id) || (!!q && !topicMatch);

    const row   = mk('div', 'sheet-item' + (full ? ' checked' : '') + (tCount === 0 ? ' disabled' : ''));
    const arrow = mk('div', 'sheet-arrow', open ? '▼' : '▶');
    row.appendChild(arrow);
    row.appendChild(mk('div', 'sheet-item-name', t.name));
    row.appendChild(mk('div', 'sheet-count', String(tCount)));
    row.appendChild(mk('div', 'sheet-check' + (partial ? ' partial' : ''), full ? '✓' : (partial ? '–' : '')));

    arrow.addEventListener('click', e => {
      if (e && e.stopPropagation) e.stopPropagation();
      if (expandedTopics.has(t.id)) expandedTopics.delete(t.id); else expandedTopics.add(t.id);
      renderTopicSheetItems(filter);
    });
    row.addEventListener('click', () => {
      if (tCount === 0 && !full && !partial) return;          /* nothing to practise here yet */
      if (full) t.subs.forEach(s => pendingSubs.delete(s.id));
      else      t.subs.forEach(s => pendingSubs.add(s.id));
      renderTopicSheetItems(filter);
    });
    body.appendChild(row);

    if (open) {
      subList.forEach(s => {
        const sc = topicCounts.sub[s.id] || 0;
        const on = pendingSubs.has(s.id);
        const r  = mk('div', 'sheet-item sub' + (on ? ' checked' : '') + (sc === 0 ? ' disabled' : ''));
        r.appendChild(mk('div', 'sheet-item-name', s.name));
        r.appendChild(mk('div', 'sheet-count', String(sc)));
        r.appendChild(mk('div', 'sheet-check', on ? '✓' : ''));
        r.addEventListener('click', () => {
          if (sc === 0 && !on) return;
          if (on) pendingSubs.delete(s.id); else pendingSubs.add(s.id);
          renderTopicSheetItems(filter);
        });
        body.appendChild(r);
      });
    }
  });

  body.scrollTop = prevScroll;
}

function toggleSelectAllTopics() {
  const cat = catalogueFor(topicSheetSubject);
  if (!cat || !topicCounts || !topicCounts.ok) return;
  const usable = cat.topics.filter(t => (topicCounts.topic[t.id] || 0) > 0);
  const allSel = usable.length > 0 && usable.every(t => t.subs.every(s => pendingSubs.has(s.id)));
  const btn = document.getElementById('sheetSelectAllBtn');
  if (allSel) {
    pendingSubs.clear();
    btn.textContent = 'Select All';
  } else {
    usable.forEach(t => t.subs.forEach(s => pendingSubs.add(s.id)));
    btn.textContent = 'Deselect All';
  }
  renderTopicSheetItems(document.getElementById('sheetSearch')?.value || '');
}

function confirmTopicSheet() {
  const id  = topicSheetSubject;
  const cat = catalogueFor(id);
  if (!cat || !jambConfig[id]) { closeSheet(); return; }

  /* choosing every topic that has questions is the same as "All topics" */
  const usable  = topicCounts && topicCounts.ok ? cat.topics.filter(t => (topicCounts.topic[t.id] || 0) > 0) : [];
  const allFull = usable.length > 0 && usable.every(t => t.subs.every(s => pendingSubs.has(s.id)));
  jambConfig[id].subs = (pendingSubs.size === 0 || allFull) ? [] : [...pendingSubs];

  closeSheet();
  refreshTopicButton(id);
  renderStartBar();
}

/* ============================================================
   POST UTME (unchanged)
   ============================================================ */
async function openSchoolSheet() {
  sheetMode = 'schools';
  const sheetOverlay = document.getElementById('sheetOverlay');
  document.getElementById('sheetTitle').textContent = 'Choose Your School';
  const searchEl = document.getElementById('sheetSearch');
  searchEl.placeholder = '🔍 Search schools...';
  searchEl.value = '';
  document.getElementById('sheetSelectAllBtn').style.display = 'none';

  document.getElementById('sheetBody').innerHTML =
    '<div class="sheet-item loading">Loading schools...</div>';
  sheetOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  if (!schoolsCache) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?exam_type=eq.post-utme&select=subject_id`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      schoolsCache = [...new Set(data.map(q => q.subject_id).filter(Boolean))].sort();
    } catch(e) {
      document.getElementById('sheetBody').innerHTML =
        '<div class="sheet-item loading">Error loading schools</div>';
      return;
    }
  }

  renderSchoolSheetItems('');
}

function renderSchoolSheetItems(filter) {
  const body = document.getElementById('sheetBody');
  if (!body) return;
  const q = (filter || '').toLowerCase();
  const visible = (schoolsCache || []).filter(s => s.toLowerCase().includes(q));

  if (visible.length === 0) {
    body.innerHTML = '<div class="sheet-item loading">No schools available yet</div>';
    return;
  }

  body.innerHTML = '';
  visible.forEach(school => {
    const checked = pendingSchool === school;
    const row = document.createElement('div');
    row.className = 'sheet-item' + (checked ? ' checked' : '');
    row.innerHTML = `
      <div class="sheet-item-icon">🏛️</div>
      <div class="sheet-item-name">${prettySchool(school)}</div>
      <div class="sheet-check">${checked ? '✓' : ''}</div>`;
    row.addEventListener('click', () => {
      pendingSchool = school;
      renderSchoolSheetItems(filter);
    });
    body.appendChild(row);
  });
}

function prettySchool(slug) {
  return String(slug)
    .replace(/postutme$/i, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() + ' Post UTME';
}

function confirmSchoolSheet() {
  if (!pendingSchool) {
    showToast('Pick a school first');
    return;
  }
  selectedSchool = pendingSchool;
  postutmeSubjects = [];
  postutmeConfig = { count: 40 };
  closeSheet();
  renderSchoolBar();
  document.getElementById('postutmeSubjectsBar').style.display = 'flex';
  document.getElementById('postutmeConfigWrap').classList.remove('show');
  document.getElementById('optionsSection').style.display = 'none';
  renderStartBar();
}

async function openPostutmeSubjectsSheet() {
  if (!selectedSchool) { showToast('Pick a school first'); return; }

  sheetMode = 'postutme-subs';
  document.getElementById('sheetTitle').textContent = prettySchool(selectedSchool);
  const searchEl = document.getElementById('sheetSearch');
  searchEl.placeholder = '🔍 Search subjects...';
  searchEl.value = '';
  document.getElementById('sheetSelectAllBtn').style.display = 'block';

  document.getElementById('sheetBody').innerHTML =
    '<div class="sheet-item loading">Loading subjects...</div>';
  document.getElementById('sheetOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';

  pendingPostutmeSubjects = [...postutmeSubjects];

  if (!postutmeSubjectsCache[selectedSchool]) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.${selectedSchool}&exam_type=eq.post-utme&select=topic`,
        { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
      );
      const data = await res.json();
      postutmeSubjectsCache[selectedSchool] =
        [...new Set(data.map(q => q.topic).filter(Boolean))].sort();
    } catch(e) {
      document.getElementById('sheetBody').innerHTML =
        '<div class="sheet-item loading">Error loading subjects</div>';
      return;
    }
  }

  renderPostutmeSubjectsSheetItems('');
}

function renderPostutmeSubjectsSheetItems(filter) {
  const body = document.getElementById('sheetBody');
  if (!body) return;
  const q = (filter || '').toLowerCase();
  const all = postutmeSubjectsCache[selectedSchool] || [];
  const visible = all.filter(s => s.toLowerCase().includes(q));

  if (visible.length === 0) {
    body.innerHTML = '<div class="sheet-item loading">No subjects found for this school</div>';
    return;
  }

  body.innerHTML = '';
  visible.forEach(subj => {
    const checked = pendingPostutmeSubjects.includes(subj);
    const row = document.createElement('div');
    row.className = 'sheet-item' + (checked ? ' checked' : '');
    row.innerHTML = `
      <div class="sheet-item-icon">📘</div>
      <div class="sheet-item-name">${subj}</div>
      <div class="sheet-check">${checked ? '✓' : ''}</div>`;
    row.addEventListener('click', () => {
      if (pendingPostutmeSubjects.includes(subj)) {
        pendingPostutmeSubjects = pendingPostutmeSubjects.filter(x => x !== subj);
        row.classList.remove('checked');
        row.querySelector('.sheet-check').textContent = '';
      } else {
        pendingPostutmeSubjects.push(subj);
        row.classList.add('checked');
        row.querySelector('.sheet-check').textContent = '✓';
      }
    });
    body.appendChild(row);
  });
}

function toggleSelectAllPostutmeSubjects() {
  const q       = (document.getElementById('sheetSearch')?.value || '').toLowerCase();
  const all     = postutmeSubjectsCache[selectedSchool] || [];
  const visible = all.filter(s => s.toLowerCase().includes(q));
  const allSelected = visible.every(s => pendingPostutmeSubjects.includes(s));
  if (allSelected) {
    pendingPostutmeSubjects = pendingPostutmeSubjects.filter(s => !visible.includes(s));
    document.getElementById('sheetSelectAllBtn').textContent = 'Select All';
  } else {
    visible.forEach(s => { if (!pendingPostutmeSubjects.includes(s)) pendingPostutmeSubjects.push(s); });
    document.getElementById('sheetSelectAllBtn').textContent = 'Deselect All';
  }
  renderPostutmeSubjectsSheetItems(q);
}

function confirmPostutmeSubjectsSheet() {
  if (pendingPostutmeSubjects.length === 0) {
    showToast('Select at least one subject');
    return;
  }
  postutmeSubjects = [...pendingPostutmeSubjects];
  closeSheet();
  renderPostutmeSubjectsBar();
  renderPostutmeConfig();
  renderStartBar();
}

function renderSchoolBar() {
  const pillsEl = document.getElementById('schoolPills');
  if (!pillsEl) return;
  if (!selectedSchool) {
    pillsEl.innerHTML = '<span class="selected-pill empty">Tap to choose school</span>';
  } else {
    pillsEl.innerHTML = `<span class="selected-pill">🏛️ ${prettySchool(selectedSchool)}</span>`;
  }
}

function renderPostutmeSubjectsBar() {
  const pillsEl = document.getElementById('postutmeSubjectsPills');
  if (!pillsEl) return;
  if (postutmeSubjects.length === 0) {
    pillsEl.innerHTML = '<span class="selected-pill empty">Tap to choose subjects</span>';
  } else {
    pillsEl.innerHTML = postutmeSubjects.map(s =>
      `<span class="selected-pill">📘 ${s}</span>`
    ).join('');
  }
}

function renderPostutmeConfig() {
  const wrap  = document.getElementById('postutmeConfigWrap');
  const cards = document.getElementById('postutmeConfigCards');
  const optSect = document.getElementById('optionsSection');
  if (!wrap || !cards) return;

  if (postutmeSubjects.length === 0) {
    wrap.classList.remove('show');
    optSect.style.display = 'none';
    return;
  }

  wrap.classList.add('show');
  optSect.style.display = 'block';

  const counts = [10, 20, 30, 40];
  const countSel = counts.map(n =>
    `<option value="${n}" ${postutmeConfig.count === n ? 'selected' : ''}>${n} questions</option>`
  ).join('');

  cards.innerHTML = `
    <div class="config-card">
      <div class="config-card-head">
        <div class="config-card-icon" style="background:#EEF4FF;">🏛️</div>
        <div class="config-card-name">${prettySchool(selectedSchool)}</div>
      </div>
      <div class="config-row">
        <span class="config-row-label">📘 Subjects</span>
        <span class="config-badge">${postutmeSubjects.length} selected</span>
      </div>
      <div class="config-row">
        <span class="config-row-label">🔢 Questions per subject</span>
        <select class="config-select" id="postutmeCount">${countSel}</select>
      </div>
    </div>`;

  const countEl = document.getElementById('postutmeCount');
  if (countEl) {
    countEl.addEventListener('change', e => {
      postutmeConfig.count = parseInt(e.target.value);
    });
  }
}

function renderStartBar() {
  const infoTop  = document.getElementById('startInfoTop');
  const infoSub  = document.getElementById('startInfoSub');
  const startBtn = document.getElementById('startBtn');
  if (!infoTop) return;

  if (currentTab === 'jamb') {
    if (selectedIds.length === 0) {
      infoTop.textContent = 'No subjects selected';
      infoSub.textContent = 'Select subjects to begin';
      startBtn.disabled = true;
    } else {
      const topicsOn = selectedIds.some(hasTopicSelection);
      infoTop.textContent = `${selectedIds.length} subject${selectedIds.length > 1 ? 's' : ''} selected`;
      infoSub.textContent = `${currentMode} mode${topicsOn ? ' · topics chosen' : ''} · tap Start when ready`;
      startBtn.disabled = false;
    }
  } else {
    if (!selectedSchool) {
      infoTop.textContent = 'No school selected';
      infoSub.textContent = 'Pick a school to begin';
      startBtn.disabled = true;
    } else if (postutmeSubjects.length === 0) {
      infoTop.textContent = prettySchool(selectedSchool);
      infoSub.textContent = 'Choose subjects to begin';
      startBtn.disabled = true;
    } else {
      infoTop.textContent = prettySchool(selectedSchool);
      infoSub.textContent = `${postutmeSubjects.length} subject${postutmeSubjects.length > 1 ? 's' : ''} · ${currentMode} mode`;
      startBtn.disabled = false;
    }
  }
}

function startSession() {
  const h = document.getElementById('timerH')?.value || '2';
  const m = document.getElementById('timerM')?.value || '0';
  const shuffleQ = document.getElementById('shuffleQToggle')?.classList.contains('on') ? '1' : '0';
  const shuffleO = document.getElementById('shuffleOToggle')?.classList.contains('on') ? '1' : '0';

  const params = new URLSearchParams({
    mode:     currentMode,
    h, m, shuffleQ, shuffleO
  });

  if (currentTab === 'jamb') {
    if (selectedIds.length === 0) { showToast('Pick at least one subject'); return; }
    params.set('exam', 'utme');
    params.set('subjects', selectedIds.join(','));
    selectedIds.forEach(id => {
      const cfg = jambConfig[id] || {};
      params.set('year_'  + id, cfg.year  || 'Random');
      params.set('count_' + id, cfg.count || 40);
      const sel = selectionParams(id);
      if (sel) {
        if (sel.tids.length) params.set('tid_' + id, sel.tids.join(','));
        if (sel.sids.length) params.set('sid_' + id, sel.sids.join(','));
      }
    });
  } else {
    if (!selectedSchool) { showToast('Pick a school first'); return; }
    if (postutmeSubjects.length === 0) { showToast('Pick at least one subject'); return; }
    params.set('exam', 'post-utme');
    params.set('school', selectedSchool);
    params.set('subjects', selectedSchool);
    params.set('topics', postutmeSubjects.join('||'));
    params.set('count_' + selectedSchool, postutmeConfig.count || 40);
  }

  window.location.href = 'practice.html?' + params.toString();
}

function setMode(mode, btn) {
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMode = mode;
  const timerRow = document.getElementById('timerRow');
  if (timerRow) timerRow.style.display = mode === 'study' ? 'none' : 'flex';
  renderStartBar();
}

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
