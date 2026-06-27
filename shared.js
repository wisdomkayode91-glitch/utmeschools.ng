/* ============================================================
   UTMESchools v2 — shared.js
   Hamburger menu logic. Linked by EVERY page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Elements ---- */
  const menuOverlay  = document.getElementById('menuOverlay');
  const menuOpenBtn  = document.getElementById('menuOpenBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const menuPanel    = menuOverlay ? menuOverlay.querySelector('.menu-panel') : null;

  if (!menuOverlay) return; // page has no menu — do nothing

  /* ---- Open ---- */
  function openMenu() {
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /* ---- Close ---- */
  function closeMenu() {
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ---- Wire open button ---- */
  if (menuOpenBtn) {
    menuOpenBtn.addEventListener('click', openMenu);
  }

  /* ---- Wire close button ---- */
  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  /* ---- Tap overlay (outside panel) to close ---- */
  if (menuOverlay) {
    menuOverlay.addEventListener('click', (e) => {
      if (menuPanel && !menuPanel.contains(e.target)) {
        closeMenu();
      }
    });
  }

  /* ---- Swipe left on panel to close ---- */
  if (menuPanel) {
    let touchStartX = 0;
    menuPanel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    menuPanel.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (dx < -50) closeMenu(); // swipe left = close
    }, { passive: true });
  }

  /* ---- Keyboard: Escape to close ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
      closeMenu();
    }
  });

});
