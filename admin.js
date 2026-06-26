/* ============================================================
   UTMESchools v2 — admin.js
   Admin panel for Kayode: user management, payment activation,
   season settings, comment moderation.
   ============================================================ */

const ADMIN_PASSWORD = 'utme2026'; // Change this after first login

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  checkAdminSession();
  initGate();
  initLogout();
  initSeasonSettings();
  initUserSearch();
  renderStats();
  renderUsers();
  renderComments();
});

/* ================================================================
   AUTH GATE
   ================================================================ */
function checkAdminSession(){
  if (localStorage.getItem('utme_admin_session') === 'active'){
    showPanel();
  }
}

function initGate(){
  document.getElementById('gateLoginBtn').addEventListener('click', () => {
    const input = document.getElementById('adminPassword').value;
    if (input === ADMIN_PASSWORD){
      localStorage.setItem('utme_admin_session', 'active');
      showPanel();
      showToast('Welcome, Admin');
    } else {
      showToast('Wrong password');
      document.getElementById('adminPassword').value = '';
    }
  });

  document.getElementById('adminPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('gateLoginBtn').click();
  });
}

function showPanel(){
  document.getElementById('adminGate').style.display = 'none';
  document.getElementById('adminPanel').classList.add('active');
}

function initLogout(){
  document.getElementById('adminLogoutBtn').addEventListener('click', () => {
    localStorage.removeItem('utme_admin_session');
    window.location.reload();
  });
}

/* ================================================================
   STATS
   ================================================================ */
function renderStats(){
  const users = getStoredUsers();
  const results = getResults();
  const bookmarks = getBookmarks();

  document.getElementById('statTotalUsers').textContent = users.length;
  document.getElementById('statPaidUsers').textContent = users.filter(u => u.has_paid).length;
  document.getElementById('statTotalResults').textContent = results.length;
  document.getElementById('statTotalBookmarks').textContent = bookmarks.length;
}

/* ================================================================
   SEASON SETTINGS
   ================================================================ */
function initSeasonSettings(){
  const saved = localStorage.getItem('utme_season_end');
  if (saved) document.getElementById('seasonEndDate').value = saved;

  document.getElementById('saveSeasonBtn').addEventListener('click', () => {
    const date = document.getElementById('seasonEndDate').value;
    if (!date){
      showToast('Pick a date first');
      return;
    }
    localStorage.setItem('utme_season_end', date);
    showToast('Season date saved: ' + date);
  });
}

/* ================================================================
   USERS TABLE
   ================================================================ */
function getStoredUsers(){
  try {
    const raw = localStorage.getItem('utme_users');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveUsers(users){
  localStorage.setItem('utme_users', JSON.stringify(users));
}

function renderUsers(){
  const users = getStoredUsers();
  document.getElementById('userCount').textContent = users.length;
  renderUserTable(users);
}

function renderUserTable(users){
  const tbody = document.getElementById('userTableBody');
  tbody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    const joined = new Date(u.created_at).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
    const isPaid = u.has_paid && (!u.paid_until || new Date(u.paid_until) > new Date());
    const seasonEnd = localStorage.getItem('utme_season_end');

    tr.innerHTML = `
      <td>
        <div class="user-name">${escHtml(u.full_name)}</div>
      </td>
      <td>
        <div class="user-email">${escHtml(u.email)}</div>
      </td>
      <td>
        <div class="user-date">${joined}</div>
      </td>
      <td>
        <span class="paid-badge ${isPaid ? 'paid' : 'free'}">${isPaid ? '✓ Paid' : 'Free'}</span>
      </td>
      <td>
        <button class="action-btn ${isPaid ? 'deactivate' : 'activate'}" data-email="${u.email}">
          ${isPaid ? 'Deactivate' : 'Activate'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Wire activate/deactivate buttons
  tbody.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleUserPayment(btn.dataset.email));
  });
}

function toggleUserPayment(email){
  const users = getStoredUsers();
  const user = users.find(u => u.email === email);
  if (!user) return;

  const seasonEnd = localStorage.getItem('utme_season_end');
  const isPaid = user.has_paid && (!user.paid_until || new Date(user.paid_until) > new Date());

  if (isPaid){
    // Deactivate
    user.has_paid = false;
    user.paid_until = null;
    showToast('Deactivated: ' + user.full_name.split(' ')[0]);
  } else {
    // Activate
    user.has_paid = true;
    user.paid_until = seasonEnd || new Date(new Date().getFullYear() + 1, 8, 30).toISOString().split('T')[0];
    showToast('Activated: ' + user.full_name.split(' ')[0]);
  }

  saveUsers(users);
  renderUsers();
  renderStats();
}

function initUserSearch(){
  document.getElementById('userSearch').addEventListener('input', e => {
    const term = e.target.value.toLowerCase().trim();
    const users = getStoredUsers();
    const filtered = term
      ? users.filter(u => u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
      : users;
    renderUserTable(filtered);
  });
}

/* ================================================================
   COMMENTS MODERATION
   ================================================================ */
function getComments(){
  try {
    const raw = localStorage.getItem('utme_comments');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveComments(comments){
  localStorage.setItem('utme_comments', JSON.stringify(comments));
}

function renderComments(){
  const comments = getComments();
  const container = document.getElementById('commentsModeration');
  document.getElementById('commentCount').textContent = comments.length;

  if (comments.length === 0){
    container.innerHTML = '<p style="text-align:center;color:var(--ink-soft);padding:20px;font-size:13px;">No comments yet.</p>';
    return;
  }

  container.innerHTML = '';
  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'comment-mod';
    const time = new Date(c.createdAt).toLocaleString('en-NG');
    card.innerHTML = `
      <div class="comment-mod-body">${escHtml(c.body)}</div>
      <div class="comment-mod-meta">By ${escHtml(c.userName)} · ${time} · ${c.subjectTag || 'general'}</div>
      <div class="mod-actions">
        <button class="mod-btn ${c.isHidden ? 'show' : 'hide'}" data-id="${c.id}">
          ${c.isHidden ? '👁️ Show' : '🚫 Hide'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.mod-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleCommentVisibility(btn.dataset.id));
  });
}

function toggleCommentVisibility(id){
  const comments = getComments();
  const c = comments.find(x => x.id === id);
  if (!c) return;
  c.isHidden = !c.isHidden;
  saveComments(comments);
  renderComments();
  showToast(c.isHidden ? 'Comment hidden' : 'Comment shown');
}

/* ================================================================
   DATA HELPERS (shared keys)
   ================================================================ */
function getResults(){
  try {
    const raw = localStorage.getItem('utme_results');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function getBookmarks(){
  try {
    const raw = localStorage.getItem('utme_bookmarks');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
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
