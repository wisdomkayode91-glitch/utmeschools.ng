/* ============================================================
   UTMESchools v2 — auth.js
   Login, signup, and guest flow. Stores user in localStorage
   until Supabase is wired.
   ============================================================ */

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initLoginForm();
  initSignupForm();
  checkRedirect();
});

/* ================================================================
   TABS
   ================================================================ */
function initTabs(){
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab + 'Form').classList.add('active');
    });
  });
}

/* ================================================================
   LOGIN
   ================================================================ */
function initLoginForm(){
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateLogin()) return;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Placeholder: simulate login (replace with Supabase signIn)
    const stored = getStoredUsers();
    const user = stored.find(u => u.email === email);
    if (!user){
      showFieldError('loginEmailError', 'No account found with this email');
      return;
    }
    if (user.password !== password){
      showFieldError('loginPasswordError', 'Incorrect password');
      return;
    }

    // Success
    setCurrentUser(user);
    showToast('Welcome back, ' + user.full_name.split(' ')[0] + '!');
    redirectAfterAuth();
  });
}

function validateLogin(){
  let ok = true;
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!isValidEmail(email)){
    showFieldError('loginEmailError');
    ok = false;
  } else {
    hideFieldError('loginEmailError');
  }

  if (password.length < 8){
    showFieldError('loginPasswordError');
    ok = false;
  } else {
    hideFieldError('loginPasswordError');
  }

  return ok;
}

/* ================================================================
   SIGNUP
   ================================================================ */
function initSignupForm(){
  const form = document.getElementById('signupForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateSignup()) return;

    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    // Placeholder: simulate signup (replace with Supabase signUp)
    const stored = getStoredUsers();
    if (stored.find(u => u.email === email)){
      showFieldError('signupEmailError', 'An account with this email already exists');
      return;
    }

    const user = {
      id: 'u_' + Date.now(),
      full_name: name,
      email: email,
      password: password, // In real version, NEVER store plain text
      has_paid: false,
      paid_until: null,
      is_admin: false,
      created_at: new Date().toISOString(),
    };

    stored.push(user);
    localStorage.setItem('utme_users', JSON.stringify(stored));
    setCurrentUser(user);

    showToast('Account created! Welcome, ' + name.split(' ')[0]);
    redirectAfterAuth();
  });
}

function validateSignup(){
  let ok = true;
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (name.length < 2){
    showFieldError('signupNameError');
    ok = false;
  } else {
    hideFieldError('signupNameError');
  }

  if (!isValidEmail(email)){
    showFieldError('signupEmailError');
    ok = false;
  } else {
    hideFieldError('signupEmailError');
  }

  if (password.length < 8){
    showFieldError('signupPasswordError');
    ok = false;
  } else {
    hideFieldError('signupPasswordError');
  }

  return ok;
}

/* ================================================================
   USER STORAGE (placeholder until Supabase)
   ================================================================ */
function getStoredUsers(){
  try {
    const raw = localStorage.getItem('utme_users');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function setCurrentUser(user){
  localStorage.setItem('utme_user', JSON.stringify(user));
}

function getCurrentUser(){
  try {
    return JSON.parse(localStorage.getItem('utme_user') || 'null');
  } catch(e) { return null; }
}

function logOut(){
  localStorage.removeItem('utme_user');
  window.location.href = 'index.html';
}

function isPaid(){
  const user = getCurrentUser();
  if (!user) return false;
  if (!user.has_paid) return false;
  if (user.paid_until){
    return new Date(user.paid_until) > new Date();
  }
  return true;
}

/* ================================================================
   REDIRECT
   ================================================================ */
function checkRedirect(){
  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect');
  if (redirect){
    sessionStorage.setItem('utme_auth_redirect', redirect);
  }
}

function redirectAfterAuth(){
  const redirect = sessionStorage.getItem('utme_auth_redirect') || 'select-subjects.html';
  sessionStorage.removeItem('utme_auth_redirect');
  window.location.href = redirect;
}

/* ================================================================
   VALIDATION HELPERS
   ================================================================ */
function isValidEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(id, msg){
  const el = document.getElementById(id);
  if (msg) el.textContent = msg;
  el.classList.add('show');
}

function hideFieldError(id){
  document.getElementById(id).classList.remove('show');
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}
  
