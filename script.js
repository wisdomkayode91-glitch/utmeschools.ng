/* ============================================================
   UTMESchools v2 — script.js
   Homepage-specific: auto-moving carousel + subject strip.
   ============================================================ */

const SUBJECTS = [
  { name: 'English Language', icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { name: 'Mathematics',      icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { name: 'Physics',          icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { name: 'Chemistry',        icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { name: 'Biology',          icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { name: 'Government',       icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { name: 'Economics',        icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { name: 'Literature',       icon: '📖', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
];

/* ---- Subject strip (homepage preview, first 8) ---- */
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

/* ---- Auto-moving carousel (feature highlights) ----
   Renders the set twice back-to-back so the CSS animation
   (translateX 0 -> -50%) loops seamlessly with no visible jump. */
const CAROUSEL_ITEMS = [
  { tag: 'PRACTICE', bg: '#E8F1FF', fg: '#1F5FBF', title: 'Set your own timer', body: 'Practice or mock mode — you choose the clock, per subject.' },
  { tag: 'RANDOM', bg: '#FFEFE6', fg: '#E2531F', title: 'Years mix themselves', body: 'Pull from every year at once. Reshuffles fresh, every time.' },
  { tag: 'STUDY', bg: '#E7F8EF', fg: '#0C8C58', title: 'No clock, just answers', body: 'Tap Show for the full explanation, instantly.' },
  { tag: 'TOPICS', bg: '#F1EAFB', fg: '#6C3FBF', title: 'Tagged by topic', body: 'Every question sorted by topic and sub-topic.' },
  { tag: 'BOOKMARK', bg: '#FFF4DC', fg: '#A6760A', title: 'Save what trips you up', body: 'One tap saves any question to revisit later.' },
  { tag: 'HISTORY', bg: '#FCE4E4', fg: '#C0392B', title: 'Every attempt saved', body: 'Score, time, and a full breakdown, automatically.' },
];

const track = document.getElementById('carouselTrack');
if (track){
  function renderCard(item){
    return `
      <div class="carousel-card">
        <span class="cc-tag" style="background:${item.bg};color:${item.fg};">${item.tag}</span>
        <h4>${item.title}</h4>
        <p>${item.body}</p>
      </div>
    `;
  }
  // duplicate the set once for a seamless infinite loop
  const html = CAROUSEL_ITEMS.map(renderCard).join('') + CAROUSEL_ITEMS.map(renderCard).join('');
  track.innerHTML = html;
}

document.getElementById('year').textContent = new Date().getFullYear();
                                                 
