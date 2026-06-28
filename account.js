/* ============================================================
   UTMESchools v2 — account.js
   My Account page: profile, stats, edit details, logout.
   ============================================================ */

/* ================================================================
   HELPERS
   ================================================================ */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('utme_user') || 'null'); }
  catch (e) { return null; }
}

function saveCurrentUser(user) {
  localStorage.setItem('utme_user', JSON.stringify(user));
  /* Also update in the users list */
  try {
    const users = JSON.parse(localStorage.getItem('utme_users') || '[]');
    const idx   = users.findIndex(u => u.email === user.email);
    if (idx !== -1) { users[idx] = user; localStorage.setItem('utme_users', JSON.stringify(users)); }
  } catch (e) { /* ignore */ }
}

function getResults() {
  try { return JSON.parse(localStorage.getItem('utme_results') || '[]'); }
  catch (e) { return []; }
}

function getBookmarksCount() {
  try { return JSON.parse(localStorage.getItem('utme_bookmarks') || '[]').length; }
  catch (e) { return 0; }
}

/* ---- Avatar color from name ---- */
function avatarColor(name) {
  const colors = ['#1F5FBF','#0C8C58','#C0392B','#6C3FBF','#A6760A','#E2531F'];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();

  if (!user) {
    /* Not logged in — show guest state */
    document.getElementById('accountMain').style.display = 'none';
    document.getElementById('guestMain').style.display   = 'block';
    return;
  }

  renderProfile(user);
  renderStats(user);
  renderAccessBlock(user);
  wireButtons(user);
});

/* ================================================================
   RENDER PROFILE
   ================================================================ */
function renderProfile(user) {
  const name  = user.name || user.full_name || 'Student';
  const email = user.email || '';
  const isPaid = user.has_paid && (!user.paid_until || new Date(user.paid_until) > new Date());

  /* Avatar */
  const avatar = document.getElementById('profileAvatar');
  avatar.textContent         = initials(name);
  avatar.style.background    = avatarColor(name);

  /* Name & email */
  document.getElementById('profileName').textContent  = name;
  document.getElementById('profileEmail').textContent = email;
  document.getElementById('displayName').textContent  = name;
  document.getElementById('displayEmail').textContent = email;

  /* Badge */
  const badge = document.getElementById('profileBadge');
  if (isPaid) {
    badge.textContent  = '⭐ Full Access';
    badge.className    = 'profile-badge paid';
  } else {
    badge.textContent  = '🔓 Free Plan';
    badge.className    = 'profile-badge free';
  }
}

/* ================================================================
   RENDER STATS
   ================================================================ */
function renderStats(user) {
  const results    = getResults();
  const bmCount    = getBookmarksCount();

  /* Sessions */
  document.getElementById('statAttempts').textContent  = results.length;

  /* Bookmarks */
  document.getElementById('statBookmarks').textContent = bmCount;
  document.getElementById('bookmarkCount').textContent = bmCount + ' question' + (bmCount === 1 ? '' : 's') + ' saved';

  /* Average score */
  if (results.length > 0) {
    const avg = results.reduce((sum, r) => {
      return sum + (r.totalPossible > 0 ? (r.totalScore / r.totalPossible) * 100 : 0);
    }, 0) / results.length;
    document.getElementById('statAvgScore').textContent = Math.round(avg) + '%';
  } else {
    document.getElementById('statAvgScore').textContent = '—';
  }
}

/* ================================================================
   RENDER ACCESS BLOCK
   ================================================================ */
function renderAccessBlock(user) {
  const block  = document.getElementById('accessBlock');
  const isPaid = user.has_paid && (!user.paid_until || new Date(user.paid_until) > new Date());

  if (isPaid) {
    const expiry = user.paid_until
      ? new Date(user.paid_until).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'End of 2027 season';
    block.innerHTML = `
      <div class="paid-card">
        <div class="paid-card-icon">✅</div>
        <div class="paid-card-info">
          <h4>Full Access Active</h4>
          <p>All subjects, all years, unlimited practice.<br>Access valid until: <strong>${expiry}</strong></p>
        </div>
      </div>`;
  } else {
    block.innerHTML = `
      <div class="access-card">
        <h3>🔒 Unlock Full Access</h3>
        <p>You are on the free plan — 5 questions per subject per year. Unlock everything for ₦2,500. Valid through the 2027 admission season.</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <a href="payment.html?method=paystack" class="btn btn-primary btn-block btn-sm">⚡ Pay with Paystack</a>
          <a href="https://wa.me/2347065732365?text=I+want+to+unlock+UTMESchools+full+access" target="_blank" class="btn btn-block btn-sm" style="background:rgba(255,255,255,0.12);color:#fff;border:1.5px solid rgba(255,255,255,0.25);">🏦 Bank transfer via WhatsApp</a>
        </div>
      </div>`;
  }
}

/* ================================================================
   WIRE BUTTONS
   ================================================================ */
function wireButtons(user) {

  /* ---- Edit Name ---- */
  document.getElementById('editNameRow').addEventListener('click', () => {
    document.getElementById('newNameInput').value = user.name || user.full_name || '';
    openModal('editNameModal');
  });
  document.getElementById('closeNameModal').addEventListener('click', () => closeModal('editNameModal'));
  document.getElementById('saveNameBtn').addEventListener('click', () => {
    const newName = document.getElementById('newNameInput').value.trim();
    if (!newName) { showToast('Please enter your name'); return; }
    user.name      = newName;
    user.full_name = newName;
    saveCurrentUser(user);
    renderProfile(user);
    closeModal('editNameModal');
    showToast('Name updated ✓');
  });

  /* ---- Edit Email ---- */
  document.getElementById('editEmailRow').addEventListener('click', () => {
    document.getElementById('newEmailInput').value = user.email || '';
    openModal('editEmailModal');
  });
  document.getElementById('closeEmailModal').addEventListener('click', () => closeModal('editEmailModal'));
  document.getElementById('saveEmailBtn').addEventListener('click', () => {
    const newEmail = document.getElementById('newEmailInput').value.trim().toLowerCase();
    if (!newEmail || !newEmail.includes('@')) { showToast('Enter a valid email'); return; }
    user.email = newEmail;
    saveCurrentUser(user);
    renderProfile(user);
    closeModal('editEmailModal');
    showToast('Email updated ✓');
  });

  /* ---- Change Password ---- */
  document.getElementById('editPasswordRow').addEventListener('click', () => {
    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('newPasswordInput').value     = '';
    openModal('editPasswordModal');
  });
  document.getElementById('closePasswordModal').addEventListener('click', () => closeModal('editPasswordModal'));
  document.getElementById('savePasswordBtn').addEventListener('click', () => {
    const current = document.getElementById('currentPasswordInput').value;
    const newPw   = document.getElementById('newPasswordInput').value;
    if (current !== user.password) { showToast('Current password is wrong'); return; }
    if (newPw.length < 8)          { showToast('New password must be at least 8 characters'); return; }
    user.password = newPw;
    saveCurrentUser(user);
    closeModal('editPasswordModal');
    showToast('Password changed ✓');
  });

  /* ---- Logout ---- */
  function doLogout() {
    if (confirm('Log out of your account?')) {
      localStorage.removeItem('utme_user');
      window.location.href = 'index.html';
    }
  }
  document.getElementById('logoutBtn').addEventListener('click', doLogout);
  const menuLogout = document.getElementById('menuLogoutBtn');
  if (menuLogout) menuLogout.addEventListener('click', e => { e.preventDefault(); doLogout(); });

  /* ---- Delete Account ---- */
  document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('Delete your account permanently? This removes all your results, bookmarks, and data. This cannot be undone.')) {
      try {
        const users = JSON.parse(localStorage.getItem('utme_users') || '[]');
        const filtered = users.filter(u => u.email !== user.email);
        localStorage.setItem('utme_users', JSON.stringify(filtered));
        localStorage.removeItem('utme_user');
        localStorage.removeItem('utme_results');
        localStorage.removeItem('utme_bookmarks');
      } catch (e) { /* ignore */ }
      showToast('Account deleted');
      setTimeout(() => window.location.href = 'index.html', 1200);
    }
  });

  /* ---- Close modals on overlay tap ---- */
  ['editNameModal','editEmailModal','editPasswordModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', e => {
      if (e.target === document.getElementById(id)) closeModal(id);
    });
  });
}

/* ================================================================
   MODAL HELPERS
   ================================================================ */
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
