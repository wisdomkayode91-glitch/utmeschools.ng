/* ============================================================
   UTMESchools v2 — shared.js
   Hamburger menu + user state. Linked by EVERY page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Apply paid class to body if user has paid ---- */
  try {
    const user = JSON.parse(localStorage.getItem('utme_user') || 'null');
    if (user && user.has_paid) document.body.classList.add('user-paid');
  } catch(e) {}

  /* ---- Elements ---- */
  const menuOverlay  = document.getElementById('menuOverlay');
  const menuOpenBtn  = document.getElementById('menuOpenBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const menuPanel    = menuOverlay ? menuOverlay.querySelector('.menu-panel') : null;

  if (!menuOverlay) return;

  function openMenu() {
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuOpenBtn)  menuOpenBtn.addEventListener('click', openMenu);
  if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);

  menuOverlay.addEventListener('click', (e) => {
    if (menuPanel && !menuPanel.contains(e.target)) closeMenu();
  });

  if (menuPanel) {
    let startX = 0;
    menuPanel.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    menuPanel.addEventListener('touchend', (e) => {
      if (e.changedTouches[0].clientX - startX < -50) closeMenu();
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) closeMenu();
  });

  /* ---- Active menu item ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-item').forEach(item => {
    const href = (item.getAttribute('href') || '').split('/').pop();
    if (href === currentPage) item.classList.add('active');
  });

  /* ---- User display in menu ---- */
  try {
    const user = JSON.parse(localStorage.getItem('utme_user') || 'null');
    const menuUserName  = document.getElementById('menuUserName');
    const menuUserEmail = document.getElementById('menuUserEmail');
    const menuLoginItem  = document.getElementById('menuLoginItem');
    const menuLogoutItem = document.getElementById('menuLogoutItem');
    if (user) {
      if (menuUserName)  menuUserName.textContent  = user.full_name || user.name || 'Student';
      if (menuUserEmail) menuUserEmail.textContent = user.email || '';
      if (menuLoginItem)  menuLoginItem.style.display  = 'none';
      if (menuLogoutItem) menuLogoutItem.style.display = 'flex';
    } else {
      if (menuLoginItem)  menuLoginItem.style.display  = 'flex';
      if (menuLogoutItem) menuLogoutItem.style.display = 'none';
    }
  } catch(e) {}

  /* ---- Logout ---- */
  const logoutBtn = document.getElementById('menuLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('utme_user');
      window.location.href = 'index.html';
    });
  }
});
                                                  
