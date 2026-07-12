/* ============================================================
   UTMESchools v2 — bookmarks.js
   Full bookmarks page. Read from localStorage.
   ============================================================ */

const SUBJ_ICONS = {
  english:'🔤', mathematics:'📐', physics:'⚛️', chemistry:'⚗️', biology:'🧬',
  government:'🏛️', economics:'📈', literature:'📚', crk:'✝️', irk:'☪️',
  geography:'🌍', commerce:'🛒', accounts:'🧾', agriculture:'🌾', history:'🏺',
  homeec:'🏠', igbo:'📖', hausa:'📜', french:'🇫🇷', fineart:'🎨',
  computer:'💻', music:'🎵', phe:'🏃', lekki:'📕', littext:'📗', yoruba:'🌺',
};
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

const LETTERS = ['A','B','C','D'];

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function getBookmarks() {
  try { return JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); }
  catch(e) { return {}; }
}
function saveBookmarks(bks) {
  localStorage.setItem('utme_bookmarks', JSON.stringify(bks));
}

let currentFilter = '';

document.addEventListener('DOMContentLoaded', () => {
  populateFilter();
  renderBookmarks();

  document.getElementById('subjectFilter').addEventListener('change', function() {
    currentFilter = this.value;
    renderBookmarks();
  });

  document.getElementById('clearAllBtn').addEventListener('click', () => {
    document.getElementById('clearDialog').classList.add('open');
  });
  document.getElementById('clearCancelBtn').addEventListener('click', () => {
    document.getElementById('clearDialog').classList.remove('open');
  });
  document.getElementById('clearConfirmBtn').addEventListener('click', () => {
    saveBookmarks({});
    document.getElementById('clearDialog').classList.remove('open');
    showToast('All bookmarks cleared');
    renderBookmarks();
  });
});

function populateFilter() {
  const bks = getBookmarks();
  const subjects = [...new Set(Object.values(bks).map(b => b.subjectId).filter(Boolean))];
  const sel = document.getElementById('subjectFilter');
  // Remove existing options except "All subjects"
  while (sel.options.length > 1) sel.remove(1);
  subjects.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s;
    opt.textContent = SUBJ_NAMES[s] || s;
    sel.appendChild(opt);
  });
}

function renderBookmarks() {
  const bks = getBookmarks();
  let items = Object.values(bks);
  if (currentFilter) items = items.filter(b => b.subjectId === currentFilter);
  items.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));

  document.getElementById('bkCount').textContent = items.length;
  const container = document.getElementById('bookmarkList');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔖</div>
        <div class="empty-state-title">${currentFilter ? 'No bookmarks for this subject' : 'No bookmarks yet'}</div>
        <div class="empty-state-body">While practising, tap the 🔖 icon on any question to bookmark it for later review.</div>
        <a href="select-subjects.html" class="btn btn-primary" style="margin-top:16px;">Start practising →</a>
      </div>`;
    return;
  }

  container.innerHTML = '';
  items.forEach(bk => {
    const card = document.createElement('div');
    card.className = 'bk-card';
    const savedDate = bk.savedAt ? new Date(bk.savedAt).toLocaleDateString('en-NG') : '';

    // Build options HTML if available
    let optionsHtml = '';
    if (bk.options && Array.isArray(bk.options)) {
      optionsHtml = `<div class="options-preview">` +
        bk.options.map((opt, i) => {
          const letter = LETTERS[i];
          const isCorrect = letter === bk.correct;
          return `<div class="opt-line ${isCorrect ? 'is-correct' : ''}">
            <span class="opt-letter">${letter}.</span>
            <span>${isCorrect ? '✓ ' : ''}${opt}</span>
          </div>`;
        }).join('') + `</div>`;
    }

    // Explanation
    const hasExpl = bk.explanation && bk.explanation.trim();

    card.innerHTML = `
      <div class="bk-head">
        <div class="bk-icon">${SUBJ_ICONS[bk.subjectId] || '📚'}</div>
        <div class="bk-body">
          <div class="bk-question">${bk.text || 'Bookmarked question'}</div>
          <div class="bk-meta">
            ${SUBJ_NAMES[bk.subjectId] || bk.subjectId || ''}
            ${bk.year ? '· ' + bk.year : ''}
            ${bk.topic ? '· ' + bk.topic : ''}
            ${savedDate ? '· Saved ' + savedDate : ''}
          </div>
        </div>
      </div>

      ${optionsHtml}
      ${hasExpl ? `
        <div class="expl-box" id="expl_${bk.id}">💡 ${bk.explanation}</div>
      ` : ''}

      <div class="bk-actions">
        ${hasExpl ? `<button class="btn btn-ghost btn-sm" data-toggle-expl="${bk.id}">💡 Explanation</button>` : ''}
        <button class="btn btn-ghost btn-sm" data-remove="${bk.id}">🗑 Remove</button>
      </div>
    `;

    // Toggle explanation
    const toggleBtn = card.querySelector('[data-toggle-expl]');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const box = document.getElementById('expl_' + bk.id);
        if (box) {
          const isOpen = box.classList.toggle('open');
          toggleBtn.textContent = isOpen ? '🙈 Hide' : '💡 Explanation';
        }
      });
    }

    // Remove bookmark
    card.querySelector('[data-remove]').addEventListener('click', () => {
      const bks2 = getBookmarks();
      delete bks2[bk.id];
      saveBookmarks(bks2);
      showToast('Bookmark removed');
      populateFilter();
      renderBookmarks();
    });

    container.appendChild(card);
  });
}
