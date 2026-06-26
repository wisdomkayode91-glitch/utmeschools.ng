/* ============================================================
   UTMESchools v2 — bookmarks.js
   Standalone bookmarks page with filter, preview, and remove.
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

const SUBJECT_FG = {
  english:'#1F5FBF', mathematics:'#A6760A', physics:'#C0392B',
  chemistry:'#0C8C58', biology:'#6C3FBF', government:'#1F5FBF',
  economics:'#A6760A', literature:'#C0392B', crk:'#0C8C58',
  irk:'#6C3FBF', geography:'#A6760A', commerce:'#C0392B',
  accounts:'#0C8C58', agriculture:'#1F5FBF', computer:'#A6760A',
  fineart:'#C0392B', french:'#0C8C58', hausa:'#6C3FBF',
  history:'#A6760A', homeec:'#C0392B', igbo:'#0C8C58',
  music:'#6C3FBF', phe:'#1F5FBF', lekki:'#6C3FBF', yoruba:'#A6760A', littext:'#0C8C58',
};

let bookmarkFilter = 'all';

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderBookmarks();
  initDeleteAll();
});

/* ================================================================
   BOOKMARKS STORAGE
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

/* ================================================================
   RENDER
   ================================================================ */
function renderBookmarks(){
  const container = document.getElementById('bookmarkList');
  let bookmarks = getBookmarks();

  // Apply subject filter
  if (bookmarkFilter !== 'all'){
    bookmarks = bookmarks.filter(b => b.subject === bookmarkFilter);
  }

  // Build filter chips
  buildFilterChips(bookmarks);

  // Update count badge
  document.getElementById('bookmarkCountBadge').textContent = bookmarks.length;

  // Show/hide delete all
  document.getElementById('deleteAllRow').style.display = bookmarks.length > 0 ? 'block' : 'none';

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
    const fg = SUBJECT_FG[b.subject] || '#1F5FBF';
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
        ${buildPreviewHtml(b)}
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
    head.addEventListener('click', () => toggleExpand(head.dataset.expand));
  });
}

function buildPreviewHtml(b){
  if (!b.questionText) return '';
  let html = `<div class="bookmark-preview">`;
  html += `<div class="q-text">${escHtml(b.questionText)}</div>`;
  if (b.options){
    html += `<div class="q-opts">`;
    ['A','B','C','D'].forEach(letter => {
      if (b.options['option_' + letter.toLowerCase()]){
        html += `<div class="q-opt"><span class="q-opt-letter">${letter}.</span> ${escHtml(b.options['option_' + letter.toLowerCase()])}</div>`;
      }
    });
    html += `</div>`;
  }
  if (b.correctOption){
    html += `<div class="q-ans">Correct: ${b.correctOption}</div>`;
  }
  html += `</div>`;
  return html;
}

function toggleExpand(id){
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

function buildFilterChips(bookmarks){
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
  showToast('View bookmark — coming with real questions');
}

/* ================================================================
   DELETE ALL
   ================================================================ */
function initDeleteAll(){
  document.getElementById('deleteAllBtn').addEventListener('click', deleteAllBookmarks);
}

/* ================================================================
   UTILITIES
   ================================================================ */
function escHtml(str){
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }
                    
