/* ============================================================
   UTMESchools v2 — admin.js
   Admin panel. Password protected. localStorage-based.
   ============================================================ */

const ADMIN_PASSWORD = 'utmeschools2026'; // Change this!

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function getUsers() { try { return JSON.parse(localStorage.getItem('utme_users')||'[]'); } catch(e) { return []; } }
function saveUsers(users) { localStorage.setItem('utme_users', JSON.stringify(users)); }
function getHistory() { try { return JSON.parse(localStorage.getItem('utme_history')||'[]'); } catch(e) { return []; } }

function checkAdmin() {
  const user = JSON.parse(localStorage.getItem('utme_user')||'null');
  return user && user.is_admin;
}

document.addEventListener('DOMContentLoaded', () => {
  const isAdmin = checkAdmin();
  const isSessionAuthed = sessionStorage.getItem('admin_authed') === '1';

  if (isAdmin || isSessionAuthed) {
    showAdminPanel();
  } else {
    document.getElementById('adminGate').style.display = 'block';
    document.getElementById('adminLoginBtn').addEventListener('click', () => {
      const pass = document.getElementById('adminPass').value;
      if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('admin_authed', '1');
        document.getElementById('adminGate').style.display = 'none';
        showAdminPanel();
      } else {
        showToast('Wrong password.');
      }
    });
    document.getElementById('adminPass').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('adminLoginBtn').click();
    });
  }
});

function showAdminPanel() {
  document.getElementById('adminContent').style.display = 'block';
  loadStats();
  renderStudents();
  loadSeasonDate();

  document.getElementById('studentSearch').addEventListener('input', function() {
    renderStudents(this.value.toLowerCase());
  });
  document.getElementById('saveSeasonBtn').addEventListener('click', () => {
    const d = document.getElementById('seasonDate').value;
    if (!d) { showToast('Pick a date first.'); return; }
    localStorage.setItem('utme_season_end', d);
    showToast('Season end date saved: ' + d);
  });
}

function loadSeasonDate() {
  const d = localStorage.getItem('utme_season_end');
  if (d) document.getElementById('seasonDate').value = d;
}

function loadStats() {
  const users   = getUsers();
  const history = getHistory();
  document.getElementById('statTotal').textContent    = users.length;
  document.getElementById('statPaid').textContent     = users.filter(u=>u.has_paid).length;
  document.getElementById('statAttempts').textContent = history.length;
}

function initials(name) {
  return (name||'?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

function renderStudents(query) {
  const users = getUsers();
  let list = query
    ? users.filter(u => (u.name||u.full_name||'').toLowerCase().includes(query) || (u.email||'').toLowerCase().includes(query))
    : users;

  const container = document.getElementById('studentList');
  if (list.length === 0) {
    container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">👥</div><div class="empty-state-title">${query?'No results':'No users yet'}</div></div>`;
    return;
  }
  container.innerHTML = '';
  list.forEach(u => {
    const row = document.createElement('div');
    row.className = 'student-row';
    const joined = u.created_at ? new Date(u.created_at).toLocaleDateString('en-NG') : '—';
    row.innerHTML = `
      <div class="student-avatar">${initials(u.full_name||u.name)}</div>
      <div class="student-info">
        <div class="student-name">${u.full_name||u.name||'Unknown'}${u.is_admin?'<span class="badge badge-navy" style="margin-left:6px;font-size:10px;">ADMIN</span>':''}</div>
        <div class="student-email">${u.email||'—'} · ${joined}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        ${u.has_paid
          ? `<button class="btn btn-sm" style="color:var(--red);border:1px solid var(--red);border-radius:var(--radius-pill);padding:6px 12px;" data-deactivate="${u.id}">Deactivate</button>`
          : `<button class="btn btn-green btn-sm" data-activate="${u.id}">Activate</button>`}
      </div>`;

    const actBtn = row.querySelector('[data-activate]');
    const deactBtn = row.querySelector('[data-deactivate]');
    if (actBtn) actBtn.addEventListener('click', () => {
      setUserPaid(u.id, true);
      showToast(`${u.full_name||u.name} activated ✓`);
      renderStudents(query);
    });
    if (deactBtn) deactBtn.addEventListener('click', () => {
      setUserPaid(u.id, false);
      showToast(`${u.full_name||u.name} deactivated`);
      renderStudents(query);
    });
    container.appendChild(row);
  });
}

function setUserPaid(userId, paid) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) return;
  users[idx].has_paid = paid;
  users[idx].paid_until = paid ? localStorage.getItem('utme_season_end') || null : null;
  saveUsers(users);
  loadStats();
  /* Update current session if same user */
  try {
    const cur = JSON.parse(localStorage.getItem('utme_user')||'null');
    if (cur && cur.id === userId) {
      cur.has_paid = paid;
      localStorage.setItem('utme_user', JSON.stringify(cur));
    }
  } catch(e) {}
}
