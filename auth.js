/* ============================================================
   UTMESchools v2 — auth.js
   Login and signup. Uses localStorage until Supabase is connected.
   ============================================================ */

let currentForm = 'login';

/* ---- Tab switching ---- */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentForm = tab.dataset.form;
    document.getElementById('loginForm').style.display  = currentForm === 'login'  ? 'block' : 'none';
    document.getElementById('signupForm').style.display = currentForm === 'signup' ? 'block' : 'none';
  });
});

/* ---- localStorage helpers ---- */
function getUsers() {
  try { return JSON.parse(localStorage.getItem('utme_users') || '[]'); }
  catch(e) { return []; }
}
function saveUsers(users) {
  localStorage.setItem('utme_users', JSON.stringify(users));
}
function setCurrentUser(user) {
  localStorage.setItem('utme_user', JSON.stringify(user));
}

/* ---- Forgot Password ---- */
document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
  showToast('📧 Contact support at wisdomkayode91@gmail.com to reset your password.');
});

/* ---- Sign up ---- */
document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();

  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  let hasError = false;
  document.querySelectorAll('#signupForm .form-group').forEach(g => g.classList.remove('has-error'));

  if (!name) {
    document.getElementById('signupName').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (!email || !email.includes('@')) {
    document.getElementById('signupEmail').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (password.length < 8) {
    document.getElementById('signupPassword').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (hasError) return;

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showToast('An account with this email already exists');
    return;
  }

  const newUser = {
    id:         'u_' + Date.now(),
    name,
    full_name:  name,
    email,
    password,          // plain text for localStorage demo; hashed on Supabase
    has_paid:   false,
    paid_until: null,
    is_admin:   false,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  showToast('Account created! Redirecting...');
  setTimeout(() => { window.location.href = 'select-subjects.html'; }, 800);
});

/* ---- Log in ---- */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();

  const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  let hasError = false;
  document.querySelectorAll('#loginForm .form-group').forEach(g => g.classList.remove('has-error'));

  if (!email || !email.includes('@')) {
    document.getElementById('loginEmail').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (!password) {
    document.getElementById('loginPassword').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (hasError) return;

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showToast('Wrong email or password. Please check and try again.');
    return;
  }

  setCurrentUser(user);
  showToast('Welcome back! Redirecting...');
  setTimeout(() => { window.location.href = 'select-subjects.html'; }, 800);
});

/* ---- Toast ---- */
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}
