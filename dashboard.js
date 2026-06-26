/* ============================================================
   UTMESchools v2 — dashboard.js
   Result History + Bookmarks tabs with localStorage persistence.
   ============================================================ */

const SUBJECT_NAMES = {
  english:'English Language', mathematics:'Mathematics',
  physics:'Physics', chemistry:'Chemistry', biology:'Biology',
  government:'Government', economics:'Economics', literature:'Literature',
  crk:'CRK', irk:'IRK', geography:'Geography', commerce:'Commerce',
  accounts:'Accounts', agriculture:'Agriculture', computer:'Computer Studies',
  fineart:'Fine Art', french:'French', hausa:'Hausa', history:'History',
  homeec:'Home Economics', igbo:'Igbo', music:'Music',
  phe:'PHE', lekki:'The Lekki Headmaster', yoruba:'Yoruba', littext:'Literature Textbooks',
};

const SUBJECT_COLORS = {
  english:'#E8F1FF', mathematics:'#FFF4DC', physics:'#FCE4E4',
  chemistry:'#E7F8EF', biology:'#F1EAFB', government:'#E8F1FF',
  economics:'#FFF4DC', literature:'#FCE4E4', crk:'#E7F8EF',
  irk:'#F1EAFB', geography:'#FFF4DC', commerce:'#FCE4E4',
  accounts:'#E7F8EF', agriculture:'#E8F1FF', computer:'#FFF4DC',
  fineart:'#FCE4E4', french:'#E7F8EF', hausa:'#F1EAFB',
  history:'#FFF4DC', homeec:'#FCE4E4', igbo:'#E7F8EF',
  music:'#F1EAFB', phe:'#E8F1FF', lekki:'#F1EAFB', yoruba:'#FFF4DC', littext:'#E7F8EF',
};

let currentTab = 'history';
let historyFilter = 'all';
let bookmarkFilter = 'all';
let historySort = 'date-desc';

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initHistory();
  initBookmarks();
  initFilters();
  initSort();
  initDeleteAll();
});

/* ================================================================
   TABS
   ================================================================ */
function initTabs(){
  document.querySelectorAll('.dash-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      currentTab = tab.dataset.tab;
    });
  });
}

/* ================================================================
   RESULT HISTORY
   ================================================================ */
function getResults(){
  try {
    const raw = localStorage.getItem('utme_results');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveResults(results){
  localStorage.setItem('utme_results', JSON.stringify(results));
}

function deleteResult(id){
  let results = getResults();
  results = results.filter(r => r.id !== id);
  saveResults(results);
  renderHistory();
  showToast('Result deleted');
}

function deleteAllResults(){
  if (!confirm('Delete all result history? This cannot be undone.')) return;
  localStorage.removeItem('utme_results');
  renderHistory();
  showToast('All history cleared');
}

function initHistory(){
  renderHistory();
}

function renderHistory(){
  const container = document.getElementById('resultList');
  let results = getResults();

  // Apply subject filter
  if (historyFilter !== 'all'){
    results = results.filter(r => r.subjects && r.subjects.includes(historyFilter));
  }

  // Apply sort
  results.sort((a, b) => {
    if (historySort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (historySort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (historySort === 'score-desc') return (b.totalCorrect/b.totalPossible) - (a.totalCorrect/a.totalPossible);
    if (historySort === 'score-asc') return (a.totalCorrect/a.totalPossible) - (b.totalCorrect/b.totalPossible);
    return 0;
  });

  // Build filter chips from all subjects that appear in results
  buildHistoryFilterChips(results);

  // Show/hide delete all
  document.getElementById('deleteAllRow').style.display = results.length > 0 ? 'block' : 'none';

  if (results.length === 0){
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">📋</div>
        <h3>No results yet</h3>
        <p>Complete a practice session and your results will show up here automatically.</p>
        <a href="select-subjects.html" class="btn btn-primary btn-sm" style="margin-top:14px;">Start practicing</a>
      </div>`;
    return;
  }

  container.innerHTML = '';
  results.forEach((r, idx) => {
    const pct = Math.round((r.totalCorrect / r.totalPossible) * 100) || 0;
    const badgeClass = pct >= 60 ? 'green' : pct >= 40 ? 'amber' : 'red';
    const date = new Date(r.date);
    const dateStr = date.toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
    const timeStr = date.toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' });
    const modeLabel = r.mode === 'mock' ? 'Mock' : r.mode === 'study' ? 'Study' : 'Practice';
    const subjectNames = (r.subjects || []).map(id => SUBJECT_NAMES[id] || id).join(', ');
    const attemptNum = results.length - idx;

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-card-head" data-expand="${r.id}">
        <div class="result-num">#${attemptNum}</div>
        <div class="result-info">
          <div class="result-info-top">
            <span class="result-score">${r.totalCorrect}/${r.totalPossible}</span>
            <span class="result-pct-badge ${badgeClass}">${pct}%</span>
          </div>
          <div class="result-subjects">${subjectNames}</div>
          <div class="result-meta-row">
            <span class="result-date">${dateStr} · ${timeStr}</span>
            <span class="result-mode">${modeLabel}</span>
          </div>
        </div>
        <button class="result-expand" data-expand-btn="${r.id}">▾</button>
      </div>
      <div class="result-card-body" id="body-${r.id}">
        <div class="result-actions-mini">
          <button class="btn btn-ghost btn-sm" onclick="viewResult('${r.id}')">📋 View Detail</button>
          <button class="btn btn-ghost btn-sm" onclick="viewCorrection('${r.id}')">🔍 View Correction</button>
          <button class="btn btn-ghost btn-sm" style="color:#C0392B;" onclick="deleteResult('${r.id}')">🗑️ Delete</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Wire expand buttons
  document.querySelectorAll('[data-expand]').forEach(head => {
    head.addEventListener('click', () => toggleExpand(head.dataset.expand));
  });
}

function toggleExpand(id){
  const body = document.getElementById('body-' + id);
  const btn = document.querySelector('[data-expand-btn="' + id + '"]');
  const isOpen = body.classList.contains('open');
  if (isOpen){
    body.classList.remove('open');
    btn.classList.remove('open');
  } else {
    body.classList.add('open');
    btn.classList.add('open');
  }
}

function buildHistoryFilterChips(results){
  const bar = document.getElementById('historyFilter');
  const subjectsInResults = new Set();
  results.forEach(r => {
    if (r.subjects) r.subjects.forEach(s => subjectsInResults.add(s));
  });

  let html = `<button class="filter-chip ${historyFilter === 'all' ? 'active' : ''}" data-filter="all">All subjects</button>`;
  subjectsInResults.forEach(id => {
    html += `<button class="filter-chip ${historyFilter === id ? 'active' : ''}" data-filter="${id}">${SUBJECT_NAMES[id] || id}</button>`;
  });
  bar.innerHTML = html;

  bar.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      historyFilter = chip.dataset.filter;
      renderHistory();
    });
  });
}

function initSort(){
  document.getElementById('sortSelect').addEventListener('change', e => {
    historySort = e.target.value;
    renderHistory();
  });
}

function viewResult(id){
  const results = getResults();
  const r = results.find(x => x.id === id);
  if (!r) return;
  sessionStorage.setItem('utme_result', JSON.stringify(r));
  window.location.href = 'results.html';
}

function viewCorrection(id){
  const results = getResults();
  const r = results.find(x => x.id === id);
  if (!r) return;
  sessionStorage.setItem('utme_result', JSON.stringify(r));
  window.location.href = 'results.html?view=corrections';
}

/* ================================================================
   BOOKMARKS
   ================================================================ */
function getBookmarks(){
  try {
    const raw = localStorage.getItem('utme_bookmarks');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveBookmarks(bookmarks){
  localStorage.setItem('utme_bookmarks', JSON.stringify(bookmarks));
}

function removeBookmark(id){
  let bookmarks = getBookmarks();
  bookmarks = bookmarks.filter(b => b.id !== id);
  saveBookmarks(bookmarks);
  renderBookmarks();
  showToast('Bookmark removed');
}

function deleteAllBookmarks(){
  if (!confirm('Delete all bookmarks? This cannot be undone.')) return;
  localStorage.removeItem('utme_bookmarks');
  renderBookmarks();
  showToast('All bookmarks cleared');
}

function initBookmarks(){
  renderBookmarks();
}

function renderBookmarks(){
  const container = document.getElementById('bookmarkList');
  let bookmarks = getBookmarks();

  // Apply subject filter
  if (bookmarkFilter !== 'all'){
    bookmarks = bookmarks.filter(b => b.subject === bookmarkFilter);
  }

  // Build filter chips
  buildBookmarkFilterChips(bookmarks);

  // Update count badge
  document.getElementById('bookmarkCountBadge').textContent = bookmarks.length;

  // Show/hide delete all
  document.getElementById('deleteAllBookmarksRow').style.display = bookmarks.length > 0 ? 'block' : 'none';

  if (bookmarks.length === 0){
    container.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">🔖</div>
        <h3>No bookmarks yet</h3>
        <p>Tap the bookmark icon on any question during practice to save it here.</p>
        <a href="select-subjects.html" class="btn btn-primary btn-sm" style="margin-top:14px;">Start practicing</a>
      </div>`;
    return;
  }

  container.innerHTML = '';
  bookmarks.forEach(b => {
    const bg = SUBJECT_COLORS[b.subject] || '#E8F1FF';
    const fg = '#1F5FBF';
    const date = new Date(b.date);
    const dateStr = date.toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });

    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
      <div class="bookmark-card-head" data-expand="${b.id}">
        <div class="bookmark-subject-tag" style="background:${bg};color:${fg};">${SUBJECT_NAMES[b.subject] || b.subject}</div>
        <div class="bookmark-info">
          <div class="bookmark-qref">${b.yearLabel || b.year || ''} · Q${b.questionNum || '?'}</div>
          <div class="bookmark-date">Bookmarked ${dateStr}</div>
        </div>
        <button class="bookmark-expand" data-expand-btn="${b.id}">▾</button>
      </div>
      <div class="bookmark-card-body" id="bbody-${b.id}">
        <div class="bookmark-actions-mini">
          <button class="btn btn-ghost btn-sm" onclick="viewBookmark('${b.id}')">👁️ View Question</button>
          <button class="btn btn-ghost btn-sm" style="color:#C0392B;" onclick="removeBookmark('${b.id}')">🗑️ Remove</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  // Wire expand buttons
  document.querySelectorAll('.bookmark-card-head').forEach(head => {
    head.addEventListener('click', () => toggleBookmarkExpand(head.dataset.expand));
  });
}

function toggleBookmarkExpand(id){
  const body = document.getElementById('bbody-' + id);
  const btn = document.querySelector('[data-expand-btn="' + id + '"]');
  const isOpen = body.classList.contains('open');
  if (isOpen){
    body.classList.remove('open');
    btn.classList.remove('open');
  } else {
    body.classList.add('open');
    btn.classList.add('open');
  }
}

function buildBookmarkFilterChips(bookmarks){
  const bar = document.getElementById('bookmarkFilter');
  const subjectsInBookmarks = new Set();
  bookmarks.forEach(b => { if (b.subject) subjectsInBookmarks.add(b.subject); });

  let html = `<button class="filter-chip ${bookmarkFilter === 'all' ? 'active' : ''}" data-filter="all">All subjects</button>`;
  subjectsInBookmarks.forEach(id => {
    html += `<button class="filter-chip ${bookmarkFilter === id ? 'active' : ''}" data-filter="${id}">${SUBJECT_NAMES[id] || id}</button>`;
  });
  bar.innerHTML = html;

  bar.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      bookmarkFilter = chip.dataset.filter;
      renderBookmarks();
    });
  });
}

function viewBookmark(id){
  // For now, just show toast. In full version, this would navigate to the question.
  showToast('View bookmark — coming with real questions');
}

/* ================================================================
   DELETE ALL
   ================================================================ */
function initDeleteAll(){
  document.getElementById('deleteAllBtn').addEventListener('click', deleteAllResults);
  document.getElementById('deleteAllBookmarksBtn').addEventListener('click', deleteAllBookmarks);
}

/* ================================================================
   FILTERS INIT
   ================================================================ */
function initFilters(){
  // Already wired inside render functions
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
  
