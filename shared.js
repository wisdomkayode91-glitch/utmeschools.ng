/* ============================================================
   UTMESchools v2 — shared.js
   Hamburger menu logic. Linked by EVERY page.
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

  var menuOverlay  = document.getElementById('menuOverlay');
  var menuOpenBtn  = document.getElementById('menuOpenBtn');
  var menuCloseBtn = document.getElementById('menuCloseBtn');
  var menuPanel    = menuOverlay ? menuOverlay.querySelector('.menu-panel') : null;

  if (!menuOverlay) return;

  function openMenu() {
    menuOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (menuOpenBtn) {
    menuOpenBtn.addEventListener('click', openMenu);
  }

  if (menuCloseBtn) {
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  if (menuOverlay) {
    menuOverlay.addEventListener('click', function(e) {
      if (menuPanel && !menuPanel.contains(e.target)) {
        closeMenu();
      }
    });
  }

  if (menuPanel) {
    var touchStartX = 0;
    menuPanel.addEventListener('touchstart', function(e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    menuPanel.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (dx < -50) closeMenu();
    }, { passive: true });
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuOverlay.classList.contains('open')) {
      closeMenu();
    }
  });

});
