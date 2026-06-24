/* ============================================================
   UTMESchools v2 — shared.js
   Hamburger menu logic, identical on every page.
   Include this on every page AFTER the menu HTML markup.
   ============================================================ */

function initMenu(){
  const overlay = document.getElementById('menuOverlay');
  const openBtn = document.getElementById('menuOpenBtn');
  const closeBtn = document.getElementById('menuCloseBtn');
  if (!overlay) return;

  function openMenu(){
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (openBtn) openBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
}
document.addEventListener('DOMContentLoaded', initMenu);
