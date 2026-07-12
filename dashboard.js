/* ============================================================
   UTMESchools v2 — dashboard.js
   Result history + bookmarks from localStorage.
   ============================================================ */

const SUBJ_NAMES = {
  english:'English Language', mathematics:'Mathematics', physics:'Physics',
  chemistry:'Chemistry', biology:'Biology', government:'Government',
  economics:'Economics', literature:'Literature', crk:'CRK', irk:'IRK',
  geography:'Geography', commerce:'Commerce', accounts:'Accounts',
  agriculture:'Agriculture', history:'History', homeec:'Home Economics',
  igbo:'Igbo', hausa:'Hausa', french:'French', fineart:'Fine Art',
  computer:'Computer Studies', music:'Music', phe:'PHE',
  lekki:'The Lekki Headmaster', littext:'Literature Textbooks', yoruba:'Yoruba',
};
const SUBJ_ICONS = {
  english:'🔤', mathematics:'📐', physics:'⚛️', chemistry:'⚗️', biology:'🧬',
  government:'🏛️', economics:'📈', literature:'📚', crk:'✝️', irk:'☪️',
  geography:'🌍', commerce:'🛒', accounts:'🧾', agriculture:'🌾', history:'🏺',
  homeec:'🏠', igbo:'📖', hausa:'📜', french:'🇫🇷', fineart:'🎨',
  computer:'💻', music:'🎵', phe:'🏃', lekki:'📕', littext:'📗', yoruba:'🌺',
};

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ================================================================
   TABS
   ================================================================ */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.dash-tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
  });
});

/* Handle #bookmarks anchor */
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.hash === '#bookmarks') {
    document.querySelector('[data-tab="bookmarks"]')?.click();
  }
  renderHistory();
  renderBookmarks();
  setupDeleteDialogs();
});

/* ================================================================
   RESULT HISTORY
   ================================================================ */
function getHistory() {
  try { return JSON.parse(localStorage.getItem('utme_history') || '[]'); } catch(e) { return []; }
}

function renderHistory(filterSubject) {
  const history = getHistory();
  const container = document.getElementById('historyList');

  // Populate filter
  const filterEl = document.getElementById('histFilter');
  if (filterEl.options.length === 1) {
    const allSubjects = new Set();
    history.forEach(r => (r.subjectIds||[]).forEach(s => allSubjects.add(s)));
    allSubjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = SUBJ_NAMES[s] || s;
      filterEl.appendChild(opt);
    });
  }

  let filtered = filterSubject
    ? history.filter(r => r.subjectIds?.includes(filterSubject))
    : history;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">📊</div>
      <div class="empty-state-title">No results yet</div>
      <div class="empty-state-body">Complete a practice session and your results will appear here.</div>
      <a href="select-subjects.html" class="btn btn-primary" style="margin-top:16px;">Start practising →</a>
    </div>`;
    return;
  }

  container.innerHTML = '';
  filtered.forEach((r, i) => {
    let totalC = 0, totalQ = 0;
    (r.subjectIds || []).forEach(sid => {
      const sr = r.subjectResults?.[sid];
      if (sr) { totalC += sr.correct; totalQ += sr.total; }
    });
    const pct = totalQ > 0 ? Math.round((totalC/totalQ)*100) : 0;
    const pctColor = pct >= 60 ? 'var(--green)' : pct >= 40 ? 'var(--amber)' : 'var(--red)';
    const d = new Date(r.date);
    const modeLabel = {practice:'Practice',mock:'Mock',study:'Study'}[r.mode]||r.mode||'Practice';

    const card = document.createElement('div');
    card.className = 'hist-card';
    card.innerHTML = `
      <div class="hist-head">
        <div class="hist-pct" style="color:${pctColor};">${pct}%</div>
        <div class="hist-info">
          <div style="font-size:13px;font-weight:600;">${totalC}/${totalQ} correct · ${modeLabel}</div>
          <div class="hist-subjects">${(r.subjectIds||[]).map(s=>SUBJ_NAMES[s]||s).join(', ')}</div>
          <div class="hist-date">${d.toLocaleDateString('en-NG')} ${d.toLocaleTimeString('en-NG',{hour:'2-digit',minute:'2-digit'})}</div>
        </div>
        <button class="hist-expand-btn" aria-label="Expand">▾</button>
      </div>
      <div class="hist-actions">
        <button class="btn btn-navy btn-sm" data-view="${r.id}">📊 View Result</button>
        <button class="btn btn-ghost btn-sm" data-corr="${r.id}">📖 Corrections</button>
        <button class="btn btn-sm" style="color:var(--red);border:1px solid var(--red);border-radius:var(--radius-pill);padding:7px 14px;" data-delete="${r.id}">🗑 Delete</button>
      </div>
    `;

    /* Expand toggle */
    card.querySelector('.hist-expand-btn').addEventListener('click', function() {
      const actions = card.querySelector('.hist-actions');
      const isOpen = actions.classList.toggle('open');
      this.textContent = isOpen ? '▴' : '▾';
    });

    /* View result */
    card.querySelector('[data-view]').addEventListener('click', () => {
      try { sessionStorage.setItem('utme_result', JSON.stringify(r)); } catch(e) {}
      window.location.href = 'result.html';
    });

    /* View corrections */
    card.querySelector('[data-corr]').addEventListener('click', () => {
      try { sessionStorage.setItem('utme_result', JSON.stringify(r)); } catch(e) {}
      window.location.href = 'result.html';
    });

    /* Delete */
    card.querySelector('[data-delete]').addEventListener('click', () => {
      if (!confirm('Delete this result?')) return;
      const h = getHistory().filter(x => x.id !== r.id);
      localStorage.setItem('utme_history', JSON.stringify(h));
      showToast('Result deleted');
      renderHistory(filterEl.value || undefined);
    });

    container.appendChild(card);
  });
}

document.getElementById('histFilter').addEventListener('change', function() {
  renderHistory(this.value || undefined);
});

/* ================================================================
   BOOKMARKS
   ================================================================ */
function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); } catch(e) { return {}; }
}

function renderBookmarks(filterSubject) {
  const bks = getBookmarks();
  const items = Object.values(bks);
  const container = document.getElementById('bookmarkList');

  // Populate filter
  const filterEl = document.getElementById('bkFilter');
  if (filterEl.options.length === 1) {
    const allSubjects = new Set(items.map(b => b.subjectId).filter(Boolean));
    allSubjects.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = SUBJ_NAMES[s] || s;
      filterEl.appendChild(opt);
    });
  }

  let filtered = filterSubject ? items.filter(b => b.subjectId === filterSubject) : items;
  filtered.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state">
      <div class="empty-state-icon">🔖</div>
      <div class="empty-state-title">No bookmarks yet</div>
      <div class="empty-state-body">Tap the 🔖 button while practising to save questions here.</div>
    </div>`;
    return;
  }

  container.innerHTML = '';
  filtered.forEach(bk => {
    const card = document.createElement('div');
    card.className = 'bk-card';
    const d = new Date(bk.savedAt);
    card.innerHTML = `
      <div class="bk-head">
        <div class="bk-icon">${SUBJ_ICONS[bk.subjectId] || '📚'}</div>
        <div style="flex:1;">
          <div class="bk-text">${bk.text || 'Bookmarked question'}</div>
          <div class="bk-meta">${SUBJ_NAMES[bk.subjectId]||bk.subjectId||''} · ${bk.year||''} · Saved ${d.toLocaleDateString('en-NG')}</div>
        </div>
      </div>
      <div class="bk-actions">
        <button class="btn btn-ghost btn-sm" data-remove="${bk.id}">🗑 Remove</button>
      </div>
    `;
    card.querySelector('[data-remove]').addEventListener('click', () => {
      const bks2 = getBookmarks();
      delete bks2[bk.id];
      localStorage.setItem('utme_bookmarks', JSON.stringify(bks2));
      showToast('Bookmark removed');
      renderBookmarks(filterEl.value || undefined);
    });
    container.appendChild(card);
  });
}

document.getElementById('bkFilter').addEventListener('change', function() {
  renderBookmarks(this.value || undefined);
});

/* ================================================================
   DELETE ALL DIALOGS
   ================================================================ */
let deleteTarget = null;
function setupDeleteDialogs() {
  document.getElementById('deleteAllHistBtn').addEventListener('click', () => {
    deleteTarget = 'history';
    document.getElementById('deleteDialogBody').textContent = 'Delete ALL result history? This cannot be undone.';
    document.getElementById('deleteDialog').classList.add('open');
  });
  document.getElementById('deleteAllBkBtn').addEventListener('click', () => {
    deleteTarget = 'bookmarks';
    document.getElementById('deleteDialogBody').textContent = 'Delete ALL bookmarks? This cannot be undone.';
    document.getElementById('deleteDialog').classList.add('open');
  });
  document.getElementById('deleteCancelBtn').addEventListener('click', () => {
    document.getElementById('deleteDialog').classList.remove('open');
  });
  document.getElementById('deleteConfirmBtn').addEventListener('click', () => {
    if (deleteTarget === 'history') {
      localStorage.removeItem('utme_history');
      showToast('History cleared');
      renderHistory();
    } else if (deleteTarget === 'bookmarks') {
      localStorage.removeItem('utme_bookmarks');
      showToast('Bookmarks cleared');
      renderBookmarks();
    }
    document.getElementById('deleteDialog').classList.remove('open');
  });
  }
    
