/* ============================================================
   UTMESchools v2 — script.js
   Homepage: carousel drag + subject pills
   ============================================================ */

const HOMEPAGE_SUBJECTS = [
  { id: 'english',     name: 'English',       icon: '🔤' },
  { id: 'mathematics', name: 'Mathematics',   icon: '📐' },
  { id: 'physics',     name: 'Physics',       icon: '⚛️' },
  { id: 'chemistry',   name: 'Chemistry',     icon: '⚗️' },
  { id: 'biology',     name: 'Biology',       icon: '🧬' },
  { id: 'government',  name: 'Government',    icon: '🏛️' },
  { id: 'economics',   name: 'Economics',     icon: '📈' },
  { id: 'literature',  name: 'Literature',    icon: '📚' },
  { id: 'accounts',    name: 'Accounts',      icon: '🧾' },
  { id: 'agriculture', name: 'Agriculture',   icon: '🌾' },
  { id: 'commerce',    name: 'Commerce',      icon: '🛒' },
  { id: 'geography',   name: 'Geography',     icon: '🌍' },
  { id: 'history',     name: 'History',       icon: '🏺' },
  { id: 'crk',         name: 'CRK',           icon: '✝️' },
  { id: 'irk',         name: 'IRK',           icon: '☪️' },
];

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Subject pills ---- */
  const pillContainer = document.getElementById('subjectPills');
  if (pillContainer) {
    HOMEPAGE_SUBJECTS.forEach(s => {
      const a = document.createElement('a');
      a.href = `select-subjects.html?subject=${s.id}`;
      a.className = 'subj-pill';
      a.innerHTML = `<span>${s.icon}</span>${s.name}`;
      pillContainer.appendChild(a);
    });
  }

  /* ---- Carousel drag ---- */
  const track = document.getElementById('carouselTrack');
  if (!track) return;

  let isDragging = false;
  let startX = 0;
  let scrollLeft = 0;
  let resumeTimer = null;
  let autoScrollInterval = null;

  function startAutoScroll() {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) {
        track.scrollLeft = 0;
      } else {
        track.scrollLeft += 1;
      }
    }, 16);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) { clearInterval(autoScrollInterval); autoScrollInterval = null; }
  }

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - track.offsetLeft;
    scrollLeft = track.scrollLeft;
    stopAutoScroll();
    track.style.cursor = 'grabbing';
  });
  track.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false;
      track.style.cursor = 'grab';
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(startAutoScroll, 1500);
    }
  });
  track.addEventListener('mouseup', () => {
    isDragging = false;
    track.style.cursor = 'grab';
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoScroll, 1500);
  });
  track.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    track.scrollLeft = scrollLeft - (x - startX);
  });

  track.addEventListener('touchstart', () => {
    stopAutoScroll();
    clearTimeout(resumeTimer);
  }, { passive: true });
  track.addEventListener('touchend', () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAutoScroll, 1500);
  }, { passive: true });

  startAutoScroll();
});
