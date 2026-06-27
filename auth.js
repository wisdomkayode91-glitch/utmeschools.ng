
# Build auth.js - Login / Signup logic

auth_js = '''/* ============================================================
   UTMESchools v2 — auth.js
   Login and signup. Uses localStorage as placeholder
   until Supabase is connected.
   ============================================================ */

let currentForm = 'login';

/* ---- Tab switching ---- */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentForm = tab.dataset.form;
    document.getElementById('loginForm').style.display = currentForm === 'login' ? 'block' : 'none';
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

/* ---- Sign up ---- */
document.getElementById('signupForm').addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;

  // Validation
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

  // Check if email already exists
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    showToast('An account with this email already exists');
    return;
  }

  // Create user
  const newUser = {
    id: 'u_' + Date.now(),
    name,
    email,
    password, // In production: hash this on the server
    has_paid: false,
    paid_until: null,
    is_admin: false,
    created_at: new Date().toISOString()
  };
  users.push(newUser);
  saveUsers(users);
  setCurrentUser(newUser);

  showToast('Account created! Redirecting...');
  setTimeout(() => {
    window.location.href = 'select-subjects.html';
  }, 800);
});

/* ---- Log in ---- */
document.getElementById('loginForm').addEventListener('submit', e => {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  // Validation
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

  // Find user
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showToast('Invalid email or password');
    return;
  }

  setCurrentUser(user);
  showToast('Welcome back! Redirecting...');
  setTimeout(() => {
    window.location.href = 'select-subjects.html';
  }, 800);
});

/* ---- Toast ---- */
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
'''

with open('/mnt/agents/output/auth.js', 'w') as f:
    f.write(auth_js)

print(f"auth.js written: {len(auth_js)} chars")
