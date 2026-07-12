/* ============================================================
   UTMESchools v2 — auth.js
   Login and signup using localStorage.
   ============================================================ */

let currentForm = 'login';

/* ---- Tab switching ---- */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentForm = tab.dataset.form;
    document.getElementById('loginForm').style.display  = currentForm === 'login'  ? 'flex' : 'none';
    document.getElementById('signupForm').style.display = currentForm === 'signup' ? 'flex' : 'none';
  });
});

/* ---- Storage helpers ---- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('utme_users') || '[]'); }
  catch(e) { return []; }
}
function saveUsers(users) { localStorage.setItem('utme_users', JSON.stringify(users)); }
function setCurrentUser(user) { localStorage.setItem('utme_user', JSON.stringify(user)); }

/* ---- Toast ---- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
}

/* ---- Sign up ---- */
document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  let ok = true;
  document.querySelectorAll('#signupForm .form-group').forEach(g => g.classList.remove('has-error'));

  if (!name) { document.getElementById('signupName').closest('.form-group').classList.add('has-error'); ok = false; }
  if (!email || !email.includes('@')) { document.getElementById('signupEmail').closest('.form-group').classList.add('has-error'); ok = false; }
  if (password.length < 6) { document.getElementById('signupPassword').closest('.form-group').classList.add('has-error'); ok = false; }
  if (!ok) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) { showToast('An account with this email already exists'); return; }

  const newUser = {
    id: 'u_' + Date.now(),
    name, full_name: name, email, password,
    has_paid: false, paid_until: null, is_admin: false,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);
  showToast('Account created! Redirecting...');
  setTimeout(() => { window.location.href = 'select-subjects.html'; }, 900);
});

/* ---- Log in ---- */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  let ok = true;
  document.querySelectorAll('#loginForm .form-group').forEach(g => g.classList.remove('has-error'));
  if (!email || !email.includes('@')) { document.getElementById('loginEmail').closest('.form-group').classList.add('has-error'); ok = false; }
  if (!password) { document.getElementById('loginPassword').closest('.form-group').classList.add('has-error'); ok = false; }
  if (!ok) return;

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) { showToast('Wrong email or password. Please check and try again.'); return; }

  setCurrentUser(user);
  showToast('Welcome back! Redirecting...');
  setTimeout(() => { window.location.href = 'select-subjects.html'; }, 900);
});
  
