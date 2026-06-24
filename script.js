/* ============================================================
   UTMESchools v2 — script.js
   Homepage: touch-draggable auto-carousel + subject strip
   ============================================================ */

const SUBJECTS = [
  { name: 'English Language',     icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Mathematics',          icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Physics',              icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Chemistry',            icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Biology',              icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'Government',           icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Economics',            icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Literature',           icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'CRK',                  icon: '✝️', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'IRK',                  icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'Geography',            icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Commerce',             icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Accounts',             icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Agriculture',          icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Computer Studies',     icon: '💻', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Fine Art',             icon: '🎨', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'French',               icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Hausa',                icon: '📜', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'History',              icon: '🏺', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Home Economics',       icon: '🏠', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'Igbo',                 icon: '📖', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Music',                icon: '🎵', bg: '#F1EAFB', fg: '#6C3FBF' },
  { name: 'PHE',                  icon: '🏃', bg: '#E8F1FF', fg: '#1F5FBF' },
  { name: 'Arabic',               icon: '🕌', bg: '#FFF4DC', fg: '#A6760A' },
  { name: 'Literature Textbooks', icon: '📗', bg: '#FCE4E4', fg: '#C0392B' },
  { name: 'The Lekki Headmaster', icon: '📕', bg: '#E7F8EF', fg: '#0C8C58' },
  { name: 'Yoruba',               icon: '🌺', bg: '#F1EAFB', fg: '#6C3FBF' },
];

/* ---- Subject strip (homepage preview, all subjects) ---- */
const subjectStrip = document.getElementById('subjectStrip');
if (subjectStrip){
  SUBJECTS.forEach(s => {
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

/* ---- Touch-draggable auto-carousel ----
   Auto-scrolls via CSS animation. Touch/mouse drag overrides
   the animation position temporarily; releasing resumes auto-scroll
   from where you left off. */
const CAROUSEL_ITEMS = [
  { tag: 'PRACTICE', bg: '#E8F1FF', fg: '#1F5FBF', title: 'Your timer, your pace',      body: 'Set your own H:M countdown per subject. Or skip the clock entirely.' },
  { tag: 'RANDOM',   bg: '#FFEFE6', fg: '#E2531F', title: 'Years mix themselves',        body: 'Pull questions from every year at once. Reshuffles fresh each time.' },
  { tag: 'STUDY',    bg: '#E7F8EF', fg: '#0C8C58', title: 'No clock, just answers',      body: 'Tap Show for the full explanation immediately. Learn, not race.' },
  { tag: 'TOPICS',   bg: '#F1EAFB', fg: '#6C3FBF', title: 'Topic-by-topic analysis',    body: 'Every question tagged by topic and sub-topic. Know exactly what to revise.' },
  { tag: 'BOOKMARK', bg: '#FFF4DC', fg: '#A6760A', title: 'Bookmark anything',           body: 'One tap saves a question to revisit, organised by subject.' },
  { tag: 'HISTORY',  bg: '#FCE4E4', fg: '#C0392B', title: 'Every attempt saved',         body: 'Score, time, and a full breakdown recorded automatically.' },
  { tag: '1992+',    bg: '#E7F8EF', fg: '#0C8C58', title: '1992 to present',             body: '27 JAMB subjects. Decades of real past questions, all in one place.' },
];

const track = document.getElementById('carouselTrack');
if (track){
  function makeCard(item){
    return `<div class="carousel-card">
      <span class="cc-tag" style="background:${item.bg};color:${item.fg};">${item.tag}</span>
      <h4>${item.title}</h4>
      <p>${item.body}</p>
    </div>`;
  }
  // triple the set so there's always content ahead and behind when dragging
  track.innerHTML = CAROUSEL_ITEMS.map(makeCard).join('') +
                    CAROUSEL_ITEMS.map(makeCard).join('') +
                    CAROUSEL_ITEMS.map(makeCard).join('');

  /* Touch + mouse drag with resume-on-release */
  const CARD_W   = 210; // card width + gap
  const SET_W    = CAROUSEL_ITEMS.length * CARD_W;
  let autoOffset = 0;      // continuously growing offset from auto-scroll
  let dragOffset  = 0;     // user-applied delta while dragging
  let isDragging  = false;
  let startX      = 0;
  let lastX       = 0;
  let rafId       = null;
  let lastTime    = null;
  const SPEED     = 40;    // pixels per second auto-scroll

  function applyTransform(x){
    // keep within the middle set to loop seamlessly
    let pos = ((x % SET_W) + SET_W) % SET_W;
    track.style.transform = `translateX(-${pos + SET_W}px)`;
  }

  function autoTick(ts){
    if (!lastTime) lastTime = ts;
    const dt = (ts - lastTime) / 1000;
    lastTime = ts;
    if (!isDragging){
      autoOffset += SPEED * dt;
    }
    applyTransform(autoOffset + dragOffset);
    rafId = requestAnimationFrame(autoTick);
  }

  // remove CSS animation so JS takes over
  track.style.animation = 'none';
  rafId = requestAnimationFrame(autoTick);

  function onStart(clientX){
    isDragging = true;
    startX = clientX;
    lastX  = clientX;
    track.style.cursor = 'grabbing';
  }
  function onMove(clientX){
    if (!isDragging) return;
    dragOffset -= (clientX - lastX);
    lastX = clientX;
  }
  function onEnd(){
    if (!isDragging) return;
    isDragging = false;
    // merge drag offset into auto offset so resume is seamless
    autoOffset += dragOffset;
    dragOffset = 0;
    track.style.cursor = 'grab';
  }

  // Touch events
  track.addEventListener('touchstart', e => onStart(e.touches[0].clientX), {passive:true});
  track.addEventListener('touchmove',  e => onMove(e.touches[0].clientX),  {passive:true});
  track.addEventListener('touchend',   onEnd);

  // Mouse events
  track.addEventListener('mousedown',  e => { e.preventDefault(); onStart(e.clientX); });
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup',   onEnd);

  track.style.cursor = 'grab';
}

/* ---- Carousel drag + pause + resume ----
   Auto-scrolls on its own. Touch/mouse drag pauses it,
   moves it in the drag direction, then resumes 1.5s after
   the user lets go. This matches the "flexible, handleable"
   behavior described. */
function initCarousel(){
  const carousel = document.querySelector('.carousel');
  const track    = document.getElementById('carouselTrack');
  if (!carousel || !track) return;

  let isDragging    = false;
  let startX        = 0;
  let dragOffset    = 0;
  let resumeTimer   = null;
  let currentOffset = 0;

  function pause(){
    carousel.classList.add('paused');
    // capture current visual translateX so drag starts from there
    const style = window.getComputedStyle(track);
    const matrix = new DOMMatrix(style.transform);
    currentOffset = matrix.m41;
  }

  function resume(){
    // set animation to pick up from current position
    const trackWidth = track.scrollWidth / 2; // half because we duplicated content
    const pct = (Math.abs(currentOffset) % trackWidth) / trackWidth * 100;
    track.style.animationDelay = `-${(pct / 100) * 28}s`;
    track.style.transform = '';
    carousel.classList.remove('paused');
  }

  function onDragStart(x){
    isDragging = true;
    startX = x;
    dragOffset = 0;
    clearTimeout(resumeTimer);
    pause();
  }

  function onDragMove(x){
    if (!isDragging) return;
    dragOffset = x - startX;
    track.style.transform = `translateX(${currentOffset + dragOffset}px)`;
  }

  function onDragEnd(){
    if (!isDragging) return;
    isDragging = false;
    currentOffset = currentOffset + dragOffset;
    resumeTimer = setTimeout(resume, 1500);
  }

  // Mouse events
  carousel.addEventListener('mousedown',  e => onDragStart(e.clientX));
  window.addEventListener('mousemove',    e => onDragMove(e.clientX));
  window.addEventListener('mouseup',      ()  => onDragEnd());

  // Touch events
  carousel.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), {passive:true});
  carousel.addEventListener('touchmove',  e => onDragMove(e.touches[0].clientX),  {passive:true});
  carousel.addEventListener('touchend',   ()  => onDragEnd());
}

document.addEventListener('DOMContentLoaded', initCarousel);



document.getElementById('year').textContent = new Date().getFullYear();
                         
