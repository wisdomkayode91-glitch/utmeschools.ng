/* ============================================================
   UTMESchools v2 — script.js
   Homepage-specific: auto-moving carousel + subject strip.
   Carousel: auto-scrolls, pauses on touch/drag, resumes on release.
   ============================================================ */

const SUBJECTS = [
  { name: 'English Language',          icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Mathematics',               icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Physics',                   icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Chemistry',                 icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Biology',                   icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'Government',                icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Economics',                 icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Literature in English',     icon: '📖', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'CRK',                       icon: '✝️', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'IRK',                       icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'Geography',                 icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Commerce',                  icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Accounts',                  icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Agricultural Science',      icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'History',                   icon: '📜', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Fine Art',                  icon: '🎨', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Music',                     icon: '🎵', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'French',                    icon: '🇫🇷', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Arabic',                    icon: '🌙', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Hausa',                     icon: '🗣️', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Igbo',                      icon: '🗣️', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Yoruba',                    icon: '🗣️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'Home Economics',            icon: '🏠', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'PHE',                       icon: '🏃', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Computer Studies',          icon: '💻', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Literature Textbooks',      icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'The Lekki Headmaster',      icon: '📘', bg: '#F1EAFB', fg: '#6C3FBF' },
];

/* ---- Subject strip (homepage preview, first 8) ---- */
const subjectStrip = document.getElementById('subjectStrip');
if (subjectStrip) {
  SUBJECTS.slice(0, 8).forEach(s => {
    const el = document.createElement('a');
    el.href = 'select-subjects.html';
    el.className = 'subject-pill';
    el.innerHTML = `
      <div class="sp-icon" style="background:${s.bg};color:${s.fg};">${s.icon}</div>
      <div class="sp-name">${s.name}</div>
    `;
    subjectStrip.appendChild(el);
  });
}

/* ---- Auto-moving carousel (feature highlights) ----
   Renders the set twice back-to-back so the CSS animation
   (translateX 0 → -50%) loops seamlessly with no visible jump.
   Touch/mouse drag: pauses animation while dragging, resumes on release.
   -------------------------------------------------------- */
const CAROUSEL_ITEMS = [
  { tag: 'PRACTICE', bg: '#E8F1FF', fg: '#1F5FBF', title: 'Set your own timer',      body: 'Practice or mock mode — you choose the clock, per subject.' },
  { tag: 'RANDOM',   bg: '#FFEFE6', fg: '#E2531F', title: 'Years mix themselves',     body: 'Pull from every year at once. Reshuffles fresh, every time.' },
  { tag: 'STUDY',    bg: '#E7F8EF', fg: '#0C8C58', title: 'No clock, just answers',   body: 'Tap Show for the full explanation, instantly.' },
  { tag: 'TOPICS',   bg: '#F1EAFB', fg: '#6C3FBF', title: 'Tagged by topic',          body: 'Every question sorted by topic and sub-topic.' },
  { tag: 'BOOKMARK', bg: '#FFF4DC', fg: '#A6760A', title: 'Save what trips you up',   body: 'One tap saves any question to revisit later.' },
  { tag: 'HISTORY',  bg: '#FCE4E4', fg: '#C0392B', title: 'Every attempt saved',      body: 'Score, time, and a full breakdown, automatically.' },
];

const track = document.getElementById('carouselTrack');
if (track) {
  function renderCard(item) {
    return `
      <div class="carousel-card">
        <span class="cc-tag" style="background:${item.bg};color:${item.fg};">${item.tag}</span>
        <h4>${item.title}</h4>
        <p>${item.body}</p>
      </div>
    `;
  }
  // Duplicate the set for seamless infinite loop
  track.innerHTML = CAROUSEL_ITEMS.map(renderCard).join('') +
                    CAROUSEL_ITEMS.map(renderCard).join('');

  /* ---- Drag / touch pause + resume ---- */
  const carousel = track.parentElement;
  let isDragging = false;
  let startX = 0;
  let scrollLeftAtStart = 0;

  function pauseCarousel() {
    track.style.animationPlayState = 'paused';
  }
  function resumeCarousel() {
    track.style.animationPlayState = 'running';
  }

  // Touch events (mobile)
  carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    pauseCarousel();
  }, { passive: true });

  carousel.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    // Allow natural scroll; animation stays paused while finger is down
  }, { passive: true });

  carousel.addEventListener('touchend', () => {
    isDragging = false;
    resumeCarousel();
  });

  carousel.addEventListener('touchcancel', () => {
    isDragging = false;
    resumeCarousel();
  });

  // Mouse events (desktop drag)
  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    pauseCarousel();
    carousel.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    resumeCarousel();
    carousel.style.cursor = '';
  });

  // Remove the old CSS hover-pause since we now control it via JS
  // (The CSS rule `.carousel:hover .carousel-track { animation-play-state: paused }` 
  //  in index.html should be removed — handled in the updated index.html)
}

/* ---- Footer year ---- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
   
