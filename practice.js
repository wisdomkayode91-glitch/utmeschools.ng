/* ============================================================
   UTMESchools v2 — practice.js (FIXED)
   1. Timer now counts properly
   2. Calculator buttons work
   3. Back button navigates correctly
   4. Bookmark saves full question data
   ============================================================ */

/* ---- Parse URL settings ---- */
const params      = new URLSearchParams(window.location.search);
const subjectIds  = (params.get('subjects') || 'english').split(',').filter(Boolean);
const mode        = params.get('mode') || 'practice';
const timerH      = parseInt(params.get('h') || '2', 10);
const timerM      = parseInt(params.get('m') || '0', 10);
const shuffleQ    = params.get('shuffleQ') !== 'false';
const shuffleO    = params.get('shuffleO') !== 'false';
const FREE_LIMIT  = 5;

/* ---- Subject metadata ---- */
const ALL_SUBJECTS = [
  { id:'english',     name:'English Language',     icon:'🔤', bg:'#E8F1FF', fg:'#1F5FBF' },
  { id:'accounts',    name:'Accounts',             icon:'🧾', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'agriculture', name:'Agriculture',          icon:'🌾', bg:'#E8F1FF', fg:'#1F5FBF' },
  { id:'biology',     name:'Biology',              icon:'🧬', bg:'#F1EAFB', fg:'#6C3FBF' },
  { id:'chemistry',   name:'Chemistry',            icon:'⚗️', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'commerce',    name:'Commerce',             icon:'🛒', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'computer',    name:'Computer Studies',     icon:'💻', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'crk',         name:'CRK',                  icon:'✝️', bg:'#E8F1FF', fg:'#1F5FBF' },
  { id:'economics',   name:'Economics',            icon:'📈', bg:'#FFF4DC', fg:'#A6760A' },
  { id:'fineart',     name:'Fine Art',             icon:'🎨', bg:'#FFF4DC', fg:'#A6760A' },
  { id:'french',      name:'French',               icon:'🇫🇷', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'geography',   name:'Geography',            icon:'🌍', bg:'#FFF4DC', fg:'#A6760A' },
  { id:'government',  name:'Government',           icon:'🏛️', bg:'#E8F1FF', fg:'#1F5FBF' },
  { id:'hausa',       name:'Hausa',                icon:'📜', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'history',     name:'History',              icon:'🏺', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'homeec',      name:'Home Economics',       icon:'🏠', bg:'#F1EAFB', fg:'#6C3FBF' },
  { id:'igbo',        name:'Igbo',                 icon:'📖', bg:'#E8F1FF', fg:'#1F5FBF' },
  { id:'irk',         name:'IRK',                  icon:'☪️', bg:'#F1EAFB', fg:'#6C3FBF' },
  { id:'literature',  name:'Literature',           icon:'📚', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'littext',     name:'Literature Textbooks', icon:'📗', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'mathematics', name:'Mathematics',          icon:'📐', bg:'#FFF4DC', fg:'#A6760A' },
  { id:'music',       name:'Music',                icon:'🎵', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'phe',         name:'PHE',                  icon:'🏃', bg:'#E7F8EF', fg:'#0C8C58' },
  { id:'physics',     name:'Physics',              icon:'⚛️', bg:'#FCE4E4', fg:'#C0392B' },
  { id:'lekki',       name:'The Lekki Headmaster', icon:'📕', bg:'#F1EAFB', fg:'#6C3FBF' },
  { id:'yoruba',      name:'Yoruba',               icon:'🌺', bg:'#FFF4DC', fg:'#A6760A' },
];

/* ============================================================
   SAMPLE QUESTIONS (placeholder until real data is loaded)
   ============================================================ */
const SAMPLE_QUESTIONS = {
  english: [
    {
      id:'eng_s_001', subject:'english', year:2023, year_label:'2023',
      passage_id:'eng_2023_p1',
      passage_text:`In every human society, people communicate with one another using a natural language, spoken or signed, to convey meaning. The English language, in particular, has spread across the world as a result of British colonisation, trade, and the dominance of English-language media. Today, it serves as a lingua franca — a shared language that allows speakers of different native tongues to communicate.`,
      question_text:'According to the passage, which factor is NOT mentioned as responsible for the spread of English?',
      option_a:'British colonisation', option_b:'Trade', option_c:'Military conquest', option_d:'English-language media',
      correct_option:'C', explanation:'The passage lists colonisation, trade, and media dominance as reasons. Military conquest is not mentioned.',
      topic:'COMPREHENSION PASSAGE', subtopic:'COMPREHENSION PASSAGE', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_002', subject:'english', year:2023, year_label:'2023',
      passage_id:'eng_2023_p1',
      passage_text:`In every human society, people communicate with one another using a natural language, spoken or signed, to convey meaning. The English language, in particular, has spread across the world as a result of British colonisation, trade, and the dominance of English-language media. Today, it serves as a lingua franca — a shared language that allows speakers of different native tongues to communicate.`,
      question_text:'As used in the passage, the word "lingua franca" most nearly means:',
      option_a:'A dead language used in formal writing', option_b:'A shared language between different native speakers',
      option_c:'The official language of France', option_d:'A dialect spoken only in Britain',
      correct_option:'B', explanation:'"Lingua franca" means a bridge language used by speakers who do not share the same native language. The passage defines this directly.',
      topic:'COMPREHENSION PASSAGE', subtopic:'COMPREHENSION PASSAGE', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_003', subject:'english', year:2022, year_label:'2022',
      passage_id:null, passage_text:null,
      question_text:'Choose the option that best fills the gap: The committee _____ not been able to reach a decision.',
      option_a:'have', option_b:'has', option_c:'had', option_d:'was',
      correct_option:'B', explanation:'"Committee" is a collective noun treated as singular in formal British English. The correct auxiliary is "has".',
      topic:'LEXIS AND STRUCTURE', subtopic:'LEXIS AND STRUCTURE : SENTENCE COMPLETION', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_004', subject:'english', year:2021, year_label:'2021',
      passage_id:null, passage_text:null,
      question_text:'Which of the following words contains a voiced consonant at the beginning?',
      option_a:'Phone', option_b:'Thick', option_c:'Sheep', option_d:'Voice',
      correct_option:'D', explanation:'/v/ in "voice" is voiced (vocal cords vibrate). /f/ in "phone", /θ/ in "thick", and /ʃ/ in "sheep" are all voiceless.',
      topic:'ORAL FORMS', subtopic:'ORAL FORMS : CONSONANTS', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_005', subject:'english', year:2020, year_label:'2020',
      passage_id:null, passage_text:null,
      question_text:'In which of these words does the stress fall on the second syllable?',
      option_a:'Comfort', option_b:'Carpet', option_c:'Forget', option_d:'Open',
      correct_option:'C', explanation:'"Forget" is stressed on the second syllable: for-GET. The others are stressed on the first syllable.',
      topic:'ORAL FORMS', subtopic:'ORAL FORMS : STRESS PATTERN', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_006', subject:'english', year:2019, year_label:'2019',
      passage_id:null, passage_text:null,
      question_text:'Choose the word nearest in meaning to BENEVOLENT.',
      option_a:'Generous', option_b:'Fierce', option_c:'Stubborn', option_d:'Cunning',
      correct_option:'A', explanation:'"Benevolent" means well-meaning and kind. "Generous" is the closest synonym.',
      topic:'LEXIS AND STRUCTURE', subtopic:'LEXIS AND STRUCTURE : SYNONYMS', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
  mathematics: [
    {
      id:'mth_s_001', subject:'mathematics', year:2023, year_label:'2023',
      passage_id:null, passage_text:null,
      question_text:'Simplify: (x² − 9) ÷ (x − 3)',
      option_a:'x − 3', option_b:'x + 3', option_c:'x² + 3', option_d:'x² − 3',
      correct_option:'B', explanation:'x² − 9 = (x+3)(x−3). Dividing by (x−3) gives (x+3).',
      topic:'ALGEBRA', subtopic:'ALGEBRA', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'mth_s_002', subject:'mathematics', year:2022, year_label:'2022',
      passage_id:null, passage_text:null,
      question_text:'If log₁₀ 2 = 0.3010, find log₁₀ 8.',
      option_a:'0.6020', option_b:'0.9030', option_c:'2.4080', option_d:'1.2040',
      correct_option:'B', explanation:'8 = 2³, so log₁₀ 8 = 3 × log₁₀ 2 = 3 × 0.3010 = 0.9030.',
      topic:'NUMBER AND NUMERATION', subtopic:'NUMBER AND NUMERATION', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'mth_s_003', subject:'mathematics', year:2021, year_label:'2021',
      passage_id:null, passage_text:null,
      question_text:'A triangle has sides 3 cm, 4 cm and 5 cm. What is the area?',
      option_a:'6 cm²', option_b:'7.5 cm²', option_c:'10 cm²', option_d:'12 cm²',
      correct_option:'A', explanation:'This is a right-angled triangle (3-4-5). Area = ½ × 3 × 4 = 6 cm².',
      topic:'GEOMETRY AND MENSURATION', subtopic:'GEOMETRY AND MENSURATION', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
  physics: [
    {
      id:'phy_s_001', subject:'physics', year:2023, year_label:'2023',
      passage_id:null, passage_text:null,
      question_text:'A body accelerates uniformly from rest and covers 20 m in 4 s. What is its acceleration?',
      option_a:'1.25 m/s²', option_b:'2.5 m/s²', option_c:'5 m/s²', option_d:'10 m/s²',
      correct_option:'B', explanation:'s = ut + ½at². u=0, s=20, t=4. 20 = ½ × a × 16. a = 40/16 = 2.5 m/s².',
      topic:'MECHANICS : MOTION', subtopic:'MECHANICS : MOTION', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'phy_s_002', subject:'physics', year:2022, year_label:'2022',
      passage_id:null, passage_text:null,
      question_text:'Which of the following is a vector quantity?',
      option_a:'Mass', option_b:'Speed', option_c:'Temperature', option_d:'Velocity',
      correct_option:'D', explanation:'Velocity has both magnitude and direction (making it a vector). Mass, speed, and temperature are scalar quantities.',
      topic:'MECHANICS : SCALARS AND VECTORS', subtopic:'MECHANICS : SCALARS AND VECTORS', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
  chemistry: [
    {
      id:'chem_s_001', subject:'chemistry', year:2023, year_label:'2023',
      passage_id:null, passage_text:null,
      question_text:'What is the oxidation number of sulphur in H₂SO₄?',
      option_a:'+4', option_b:'+6', option_c:'-2', option_d:'+2',
      correct_option:'B', explanation:'H is +1 (×2 = +2), O is -2 (×4 = -8). For the molecule to be neutral: +2 + S + (-8) = 0, so S = +6.',
      topic:'ATOMIC STRUCTURE', subtopic:'ATOMIC STRUCTURE', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
  biology: [
    {
      id:'bio_s_001', subject:'biology', year:2023, year_label:'2023',
      passage_id:null, passage_text:null,
      question_text:'Which organelle is known as the powerhouse of the cell?',
      option_a:'Nucleus', option_b:'Ribosome', option_c:'Mitochondrion', option_d:'Vacuole',
      correct_option:'C', explanation:'The mitochondrion produces ATP through cellular respiration, supplying energy for cell activities.',
      topic:'CELL BIOLOGY', subtopic:'CELL BIOLOGY', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
};

/* ============================================================
   LOAD QUESTIONS
   ============================================================ */
function getQuestionsForSubject(subjectId){
  const bank = SAMPLE_QUESTIONS[subjectId] || [];
  const year  = params.get(`year_${subjectId}`) || 'Random';
  const count = parseInt(params.get(`count_${subjectId}`) || '40', 10);

  let filtered = year === 'Random'
    ? [...bank]
    : bank.filter(q => String(q.year_label) === year || String(q.year) === year);

  filtered = groupPassageQuestions(filtered);

  if (mode !== 'study' && shuffleQ){
    filtered = shuffleKeepingPassages(filtered);
  }

  return filtered.slice(0, count);
}

function groupPassageQuestions(questions){
  const groups  = [];
  const seen    = new Set();
  questions.forEach(q => {
    if (!q.passage_id){ groups.push([q]); return; }
    if (seen.has(q.passage_id)) return;
    seen.add(q.passage_id);
    groups.push(questions.filter(x => x.passage_id === q.passage_id));
  });
  return groups.flat();
}

function shuffleKeepingPassages(questions){
  const groups  = [];
  const seen    = new Set();
  questions.forEach(q => {
    if (!q.passage_id){ groups.push([q]); return; }
    if (seen.has(q.passage_id)) return;
    seen.add(q.passage_id);
    groups.push(questions.filter(x => x.passage_id === q.passage_id));
  });
  for (let i = groups.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [groups[i], groups[j]] = [groups[j], groups[i]];
  }
  return groups.flat();
}

/* ============================================================
   SESSION STATE
   ============================================================ */
let allQuestions  = [];
let currentIdx    = 0;
let answers       = {};
let bookmarks     = new Set(JSON.parse(localStorage.getItem('utme_bookmarks') || '[]'));
let shownAnswers  = new Set();
const sessionStart = Date.now();

subjectIds.forEach(id => {
  getQuestionsForSubject(id).forEach(q => allQuestions.push(q));
});

/* ---- Check if user is paid ---- */
function isPaid(){
  return localStorage.getItem('utme_paid') === 'true';
}

/* ---- Is this question beyond the free limit? ---- */
function isBeyondFreeLimit(q){
  if (isPaid()) return false;
  const sameGroup = allQuestions.filter(x =>
    x.subject === q.subject && (x.year_label || String(x.year)) === (q.year_label || String(q.year))
  );
  const idx = sameGroup.indexOf(q);
  return idx >= FREE_LIMIT;
}

/* ============================================================
   TIMER (FIXED)
   ============================================================ */
let totalSeconds  = (timerH * 3600) + (timerM * 60);
let timerInterval = null;

function formatTime(s){
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startTimer(){
  const timerPill = document.getElementById('timerPill');
  const timerEl = document.getElementById('timerDisplay');

  if (!timerEl || !timerPill) return;

  if (mode === 'study'){
    timerPill.innerHTML = '<span class="mode-badge">STUDY MODE</span>';
    return;
  }
  if (totalSeconds === 0){
    timerPill.innerHTML = '<span class="mode-badge">' + (mode === 'mock' ? 'MOCK' : 'PRACTICE') + '</span>';
    return;
  }

  timerEl.textContent = formatTime(totalSeconds);
  timerInterval = setInterval(() => {
    totalSeconds--;
    if (timerEl) timerEl.textContent = formatTime(totalSeconds);
    if (totalSeconds <= 300 && timerPill) timerPill.classList.add('warning');
    if (totalSeconds <= 0){
      clearInterval(timerInterval);
      submitSession('timeout');
    }
  }, 1000);
}

/* ============================================================
   RENDER QUESTION
   ============================================================ */
function renderQuestion(idx){
  const q = allQuestions[idx];
  if (!q) return;

  // Update nav
  document.getElementById('qCounter').textContent = `${idx + 1} / ${allQuestions.length}`;
  document.getElementById('prevBtn').disabled = idx === 0;
  document.getElementById('nextBtn').disabled = idx === allQuestions.length - 1;

  // Update answered pill
  updateAnsweredPill();

  // Bookmark icon state
  const bmBtn = document.getElementById('bookmarkBtn');
  if (bmBtn) bmBtn.classList.toggle('bookmarked', bookmarks.has(q.id));

  // Subject tabs highlight
  document.querySelectorAll('.subj-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subject === q.subject);
  });

  // Paywall check
  const blocked = isBeyondFreeLimit(q);
  const paywallCard = document.getElementById('paywallCard');
  const optionsList = document.getElementById('optionsList');
  const showHideWrap = document.getElementById('showHideWrap');
  const explanationBox = document.getElementById('explanationBox');
  const passageArea = document.getElementById('passageArea');
  const diagramArea = document.getElementById('diagramArea');
  const questionText = document.getElementById('questionText');

  if (paywallCard) paywallCard.style.display = blocked ? 'block' : 'none';
  if (optionsList) optionsList.style.display = blocked ? 'none' : 'flex';
  if (showHideWrap) showHideWrap.style.display = (blocked || mode !== 'study') ? 'none' : 'flex';
  if (explanationBox) explanationBox.classList.remove('show');
  if (passageArea) passageArea.style.display = 'none';
  if (diagramArea) diagramArea.style.display = 'none';

  if (blocked){
    if (questionText) questionText.textContent = '';
    return;
  }

  // Passage
  if (q.passage_id && q.passage_text && passageArea && questionText){
    document.getElementById('passageText').innerHTML = escHtml(q.passage_text).replace(/\n/g, '<br>');
    passageArea.style.display = 'block';
  }

  // Diagram
  if (q.has_svg && q.svg_code && diagramArea){
    document.getElementById('diagramContent').innerHTML = q.svg_code;
    diagramArea.style.display = 'block';
  } else if (q.image_file && diagramArea){
    document.getElementById('diagramContent').innerHTML = `<img src="images/questions/${q.image_file}" alt="Diagram">`;
    diagramArea.style.display = 'block';
  }

  // Question text
  if (questionText) questionText.textContent = q.question_text;

  // Options
  const optsList = document.getElementById('optionsList');
  if (!optsList) return;
  optsList.innerHTML = '';

  const options = [
    { letter:'A', text:q.option_a },
    { letter:'B', text:q.option_b },
    { letter:'C', text:q.option_c },
    { letter:'D', text:q.option_d },
  ];

  // Shuffle options if enabled
  if (shuffleO && mode !== 'study'){
    for (let i = options.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
  }

  // Store shuffled order for scoring
  q._shuffled = options.map(o => o.letter);

  options.forEach(opt => {
    const row = document.createElement('div');
    row.className = 'opt-row';
    if (answers[q.id] === opt.letter) row.classList.add('selected');
    row.innerHTML = `
      <div class="opt-circle">${opt.letter}</div>
      <div class="opt-text">${escHtml(opt.text)}</div>
    `;
    row.addEventListener('click', () => selectOption(q.id, opt.letter));
    optsList.appendChild(row);
  });

  // Study mode: reset show/hide button
  if (mode === 'study'){
    const showHideBtn = document.getElementById('showHideBtn');
    if (showHideBtn){
      showHideBtn.textContent = shownAnswers.has(q.id) ? 'Hide Answer' : 'Show Answer';
    }
    if (shownAnswers.has(q.id)){
      showAnswer(q);
    }
  }
}

function selectOption(qid, letter){
  if (mode === 'study' && shownAnswers.has(qid)) return;
  answers[qid] = letter;
  renderQuestion(currentIdx);
}

/* ============================================================
   SHOW/HIDE ANSWER (Study mode)
   ============================================================ */
function toggleShowHide(){
  const q = allQuestions[currentIdx];
       
