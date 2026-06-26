
# Build dashboard.js - Result History + Bookmarks logic

dashboard_js = '''/* ============================================================
   UTMESchools v2 — dashboard.js
   Result History + Bookmarks tabs.
   Uses localStorage as placeholder until Supabase is connected.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',       icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'accounts',    name: 'Accounts',               icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'agriculture', name: 'Agriculture',            icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'biology',     name: 'Biology',                icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'chemistry',   name: 'Chemistry',              icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'commerce',    name: 'Commerce',               icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'computer',    name: 'Computer Studies',       icon: '💻', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'crk',         name: 'CRK',                    icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'economics',   name: 'Economics',              icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'fineart',     name: 'Fine Art',               icon: '🎨', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'french',      name: 'French',                 icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'geography',   name: 'Geography',              icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'government',  name: 'Government',             icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'hausa',       name: 'Hausa',                  icon: '📜', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'history',     name: 'History',                icon: '🏺', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'homeec',      name: 'Home Economics',         icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'igbo',        name: 'Igbo',                   icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'irk',         name: 'IRK',                    icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'literature',  name: 'Literature',             icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'littext',     name: 'Literature Textbooks',   icon: '📗', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'mathematics', name: 'Mathematics',              icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'music',       name: 'Music',                  icon: '🎵', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'phe',         name: 'PHE',                    icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'physics',     name: 'Physics',                icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'lekki',       name: 'The Lekki Headmaster',   icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'yoruba',      name: 'Yoruba',                 icon: '🌺', bg: '#FFF4DC', fg: '#A6760A' },
];

function getSubject(id) { return ALL_SUBJECTS.find(s => s.id === id); }

/* ---- localStorage helpers ---- */
function getResults() {
  try { return JSON.parse(localStorage.getItem('utme_results') || '[]'); }
  catch(e) { return []; }
}
function saveResults(results) {
  localStorage.setItem('utme_results', JSON.stringify(results));
}
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('utme_bookmarks') || '[]'); }
  catch(e) { return []; }
}
function saveBookmarks(bmarks) {
  localStorage.setItem('utme_bookmarks', JSON.stringify(bmarks));
}

/* ---- Format helpers ---- */
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
}

/* ============================================================
   TABS
   ============================================================ */
let activeTab = 'history';

document.querySelectorAll('.dash-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById(activeTab + 'Tab').classList.add('active');
  });
});

/* ============================================================
   RESULT HISTORY
   ============================================================ */
let historySort = 'date'; // 'date' | 'score'
let historyFilter = 'all';

function populateSubjectFilters() {
  const historySel = document.getElementById('historyFilter');
  const bookmarkSel = document.getElementById('bookmarkFilter');
  ALL_SUBJECTS.forEach(s => {
    const opt1 = document.createElement('option');
    opt1.value = s.id; opt1.textContent = s.name;
    historySel.appendChild(opt1);
    const opt2 = document.createElement('option');
    opt2.value = s.id; opt2.textContent = s.name;
    bookmarkSel.appendChild(opt2);
  });
}

function renderHistory() {
  const list = document.getElementById('historyList');
  let results = getResults();

  // Filter
  if (historyFilter !== 'all') {
    results = results.filter(r => r.subjects && r.subjects.includes(historyFilter));
  }

  // Sort
  results.sort((a, b) => {
    if (historySort === 'date') return new Date(b.date) - new Date(a.date);
    const aPct = a.totalPossible > 0 ? a.totalScore / a.totalPossible : 0;
    const bPct = b.totalPossible > 0 ? b.totalScore / b.totalPossible : 0;
    return bPct - aPct;
  });

  if (results.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <h3>No results yet</h3>
        <p>Your practice results will appear here after you complete a session.</p>
        <a href="select-subjects.html" class="btn btn-primary btn-sm">Start practicing</a>
      </div>
    `;
    document.getElementById('deleteAllHistory').style.display = 'none';
    return;
  }

  document.getElementById('deleteAllHistory').style.display = 'block';
  list.innerHTML = '';

  results.forEach((r, idx) => {
    const pct = r.totalPossible > 0 ? Math.round((r.totalScore / r.totalPossible) * 100) : 0;
    let badgeClass = 'green';
    if (pct < 40) badgeClass = 'red';
    else if (pct < 60) badgeClass = 'amber';

    const subjNames = (r.subjects || []).map(sid => getSubject(sid)?.name || sid);
    const modeLabel = r.mode === 'mock' ? 'Mock' : r.mode === 'study' ? 'Study' : 'Practice';

    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `
      <div class="result-card-head">
        <div class="result-card-num">${idx + 1}</div>
        <div class="result-card-info">
          <div class="result-card-title">${subjNames.join(', ')}</div>
          <div class="result-card-meta">${formatDate(r.date)} · ${modeLabel} · ${formatTime(r.timeTaken || 0)}</div>
        </div>
        <div class="result-card-badge ${badgeClass}">${pct}%</div>
      </div>
      <div class="result-card-scores">
        ${Object.entries(r.subjectScores || {}).map(([sid, sc]) => {
          const s = getSubject(sid);
          return `<span>${s?.icon || '📚'} ${s?.name || sid}: ${sc.score}/${sc.possible}</span>`;
        }).join('')}
      </div>
      <div class="result-card-actions">
        <button class="primary" data-view="${r.id || idx}">View Result</button>
        <button data-correct="${r.id || idx}">Correction</button>
        <button data-expand="${r.id || idx}">▾ More</button>
      </div>
      <div class="card-details" id="details-${r.id || idx}">
        <button data-detail="${r.id || idx}">📋 View full details</button>
        <button data-delete="${r.id || idx}">🗑 Delete this result</button>
      </div>
    `;
    list.appendChild(card);
  });

  // Wire buttons
  list.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.view;
      const results = getResults();
      const r = results.find((x, i) => (x.id || String(i)) === id);
      if (r) {
        sessionStorage.setItem('utme_result', JSON.stringify(r));
        window.location.href = 'results.html';
      }
    });
  });

  list.querySelectorAll('[data-correct]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.correct;
      const results = getResults();
      const r = results.find((x, i) => (x.id || String(i)) === id);
      if (r) {
        sessionStorage.setItem('utme_result', JSON.stringify(r));
        window.location.href = 'results.html?view=correction';
      }
    });
  });

  list.querySelectorAll('[data-expand]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.expand;
      const details = document.getElementById('details-' + id);
      details.classList.toggle('open');
      btn.textContent = details.classList.contains('open') ? '▴ Less' : '▾ More';
    });
  });

  list.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.delete;
      openConfirm('Delete Result', 'Are you sure you want to delete this result? This cannot be undone.', () => {
        let results = getResults();
        results = results.filter((x, i) => (x.id || String(i)) !== id);
        saveResults(results);
        renderHistory();
        showToast('Result deleted');
      });
    });
  });
}

/* ============================================================
   BOOKMARKS
   ============================================================ */
let bookmarkFilter = 'all';

function renderBookmarks() {
  const list = document.getElementById('bookmarkList');
  let bmarks = getBookmarks();

  if (bookmarkFilter !== 'all') {
    bmarks = bmarks.filter(b => b.subjectId === bookmarkFilter);
  }

  if (bmarks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">🔖</div>
        <h3>No bookmarks yet</h3>
        <p>Bookmark questions during practice to revisit them here.</p>
        <a href="select-subjects.html" class="btn btn-primary btn-sm">Start practicing</a>
      </div>
    `;
    document.getElementById('deleteAllBookmarks').style.display = 'none';
    return;
  }

  document.getElementById('deleteAllBookmarks').style.display = 'block';
  list.innerHTML = '';

  bmarks.forEach((b, idx) => {
    const s = getSubject(b.subjectId);
    const card = document.createElement('div');
    card.className = 'bookmark-card';
    card.innerHTML = `
      <div class="bookmark-card-head">
        <div class="bookmark-card-icon" style="background:${s?.bg || '#eee'};color:${s?.fg || '#333'};">${s?.icon || '📚'}</div>
        <div class="bookmark-card-info">
          <div class="bookmark-card-subj">${s?.name || b.subjectId}</div>
          <div class="bookmark-card-meta">${b.year || 'Random'} · ${timeAgo(b.date)}</div>
        </div>
      </div>
      <div class="bookmark-card-text">${b.text || 'Question text unavailable'}</div>
      <div class="bookmark-card-actions">
        <button data-view="${idx}">View</button>
        <button class="danger" data-remove="${idx}">Remove</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.view);
      const bmarks = getBookmarks();
      const b = bmarks[idx];
      if (b) {
        // For now, show a simple alert with the question
        alert(`${b.text || 'Question unavailable'}\\n\\nCorrect answer: ${b.correct || 'N/A'}\\n\\n${b.explanation || ''}`);
      }
    });
  });

  list.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.remove);
      openConfirm('Remove Bookmark', 'Remove this bookmark?', () => {
        let bmarks = getBookmarks();
        bmarks.splice(idx, 1);
        saveBookmarks(bmarks);
        renderBookmarks();
        showToast('Bookmark removed');
      });
    });
  });
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
let confirmCallback = null;

function openConfirm(title, text, callback) {
  confirmCallback = callback;
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmText').textContent = text;
  document.getElementById('confirmOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('open');
  document.body.style.overflow = '';
  confirmCallback = null;
}

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  populateSubjectFilters();
  renderHistory();
  renderBookmarks();

  // History filter
  document.getElementById('historyFilter').addEventListener('change', e => {
    historyFilter = e.target.value;
    renderHistory();
  });

  // History sort
  document.getElementById('historySort').addEventListener('click', () => {
    historySort = historySort === 'date' ? 'score' : 'date';
    document.getElementById('historySort').textContent =
      historySort === 'date' ? 'Sort: Date ▾' : 'Sort: Score ▾';
    renderHistory();
  });

  // Bookmark filter
  document.getElementById('bookmarkFilter').addEventListener('change', e => {
    bookmarkFilter = e.target.value;
    renderBookmarks();
  });

  // Delete all history
  document.getElementById('deleteAllHistory').addEventListener('click', () => {
    openConfirm('Delete All History', 'Are you sure you want to delete ALL your result history? This cannot be undone.', () => {
      saveResults([]);
      renderHistory();
      showToast('All history deleted');
    });
  });

  // Delete all bookmarks
  document.getElementById('deleteAllBookmarks').addEventListener('click', () => {
    openConfirm('Delete All Bookmarks', 'Are you sure you want to remove ALL bookmarks?', () => {
      saveBookmarks([]);
      renderBookmarks();
      showToast('All bookmarks removed');
    });
  });

  // Confirm dialog
  document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
  document.getElementById('confirmOk').addEventListener('click', () => {
    if (confirmCallback) confirmCallback();
    closeConfirm();
  });
  document.getElementById('confirmOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('confirmOverlay')) closeConfirm();
  });
});
'''

with open('/mnt/agents/output/dashboard.js', 'w') as f:
    f.write(dashboard_js)

print(f"dashboard.js written: {len(dashboard_js)} chars")
