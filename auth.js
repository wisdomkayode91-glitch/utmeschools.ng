/* ============================================================
   UTMESchools v2 — auth.js
   Login and signup. Uses localStorage until Supabase is connected.
   ============================================================ */

var currentForm = 'login';

document.querySelectorAll('.auth-tab').forEach(function(tab) {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.auth-tab').forEach(function(t) { t.classList.remove('active'); });
    tab.classList.add('active');
    currentForm = tab.dataset.form;
    document.getElementById('loginForm').style.display  = currentForm === 'login'  ? 'block' : 'none';
    document.getElementById('signupForm').style.display = currentForm === 'signup' ? 'block' : 'none';
  });
});

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

document.getElementById('forgotPasswordBtn').addEventListener('click', function() {
  showToast('📧 Contact support at wisdomkayode91@gmail.com to reset your password.');
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var name = document.getElementById('signupName').value.trim();
  var email = document.getElementById('signupEmail').value.trim().toLowerCase();
  var password = document.getElementById('signupPassword').value;

  var hasError = false;
  document.querySelectorAll('#signupForm .form-group').forEach(function(g) { g.classList.remove('has-error'); });

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

  var users = getUsers();
  if (users.find(function(u) { return u.email === email; })) {
    showToast('An account with this email already exists');
    return;
  }

  var newUser = {
    id: 'u_' + Date.now(),
    name: name,
    full_name: name,
    email: email,
    password: password,
    has_paid: false,
    paid_until: null,
    is_admin: false,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  showToast('Account created! Redirecting...');
  setTimeout(function() { window.location.href = 'select-subjects.html'; }, 800);
});

document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var email = document.getElementById('loginEmail').value.trim().toLowerCase();
  var password = document.getElementById('loginPassword').value;

  var hasError = false;
  document.querySelectorAll('#loginForm .form-group').forEach(function(g) { g.classList.remove('has-error'); });

  if (!email || !email.includes('@')) {
    document.getElementById('loginEmail').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (!password) {
    document.getElementById('loginPassword').closest('.form-group').classList.add('has-error');
    hasError = true;
  }
  if (hasError) return;

  var users = getUsers();
  var user = users.find(function(u) { return u.email === email && u.password === password; });

  if (!user) {
    showToast('Wrong email or password. Please check and try again.');
    return;
  }

  setCurrentUser(user);
  showToast('Welcome back! Redirecting...');
  setTimeout(function() { window.location.href = 'select-subjects.html'; }, 800);
});

function showToast(msg) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3500);
  }
