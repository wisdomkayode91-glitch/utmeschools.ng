/* ============================================================
   UTMESchools v2 — practice.js
   Handles Practice mode, Mock Exam mode, and Study mode.

   Question JSON format (questions/english.json etc.):
   {
     "id": "eng_1992_001",
     "subject": "english",
     "year": 1992,
     "year_label": "1992",       // display label (e.g. "2017 Model I")
     "question_text": "...",
     "option_a": "...",
     "option_b": "...",
     "option_c": "...",
     "option_d": "...",
     "correct_option": "A",      // A, B, C, or D
     "explanation": "...",
     "topic": "ORAL FORMS",
     "subtopic": "ORAL FORMS : CONSONANTS",
     "difficulty": "Basic",      // Basic | Intermediate | Advanced
     "has_svg": false,
     "svg_code": null,
     "image_file": null,         // e.g. "eng_1992_q3.jpg" — null if none
     "passage_id": null,         // links to a shared passage group
     "passage_text": null        // the passage text (repeated on all linked questions)
   }

   Passage handling:
   - If a question has a passage_id, show the passage above the question.
   - The same passage_text appears for every question that shares that passage_id.
   - When questions are reordered/shuffled, passage questions are kept together
     in their original relative order (shuffling happens at passage-group level).

   Image file naming convention (for questions with diagrams):
   - Place images in: images/questions/
   - Name format: {subject}_{year}_{question_number}.jpg
     e.g.  physics_2005_q12.jpg
           chemistry_2018_q07.jpg
   - For model years: physics_2017_m1_q05.jpg (m1 = Model I)
   - Claude will tell you the exact filename to use for each question.
   ============================================================ */

/* ---- Parse URL settings ---- */
const params      = new URLSearchParams(window.location.search);
const subjectIds  = (params.get('subjects') || 'english').split(',').filter(Boolean);
const mode        = params.get('mode') || 'practice'; // practice | mock | study
const timerH      = parseInt(params.get('h') || '2', 10);
const timerM      = parseInt(params.get('m') || '0', 10);
const FREE_LIMIT  = 5;

/* ---- Subject metadata (same list as select-subjects.js) ---- */
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
   Replace this section with actual JSON fetched from
   questions/{subject}.json once you have real questions.
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
      correct_option:'B', explanation:'"Committee" is a collective noun treated as singular in formal British English. The correct auxiliary is "has". "The committee has not been able to reach a decision."',
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
      correct_option:'C', explanation:'"Forget" is stressed on the second syllable: for-GET. The others are stressed on the first syllable: COM-fort, CAR-pet, O-pen.',
      topic:'ORAL FORMS', subtopic:'ORAL FORMS : STRESS PATTERN', difficulty:'Intermediate',
      has_svg:false, svg_code:null, image_file:null
    },
    {
      id:'eng_s_006', subject:'english', year:2019, year_label:'2019',
      passage_id:null, passage_text:null,
      question_text:'Choose the word nearest in meaning to BENEVOLENT.',
      option_a:'Generous', option_b:'Fierce', option_c:'Stubborn', option_d:'Cunning',
      correct_option:'A', explanation:'"Benevolent" means well-meaning and kind. "Generous" is the closest synonym. The other options are antonyms or unrelated.',
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
      correct_option:'A', explanation:'This is a right-angled triangle (3-4-5). Area = ½ × base × height = ½ × 3 × 4 = 6 cm².',
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
      correct_option:'C', explanation:'The mitochondrion produces ATP (adenosine triphosphate) through cellular respiration, supplying energy for cell activities. It is called the powerhouse of the cell.',
      topic:'CELL BIOLOGY', subtopic:'CELL BIOLOGY', difficulty:'Basic',
      has_svg:false, svg_code:null, image_file:null
    },
  ],
};

/* ============================================================
   LOAD QUESTIONS
   Currently uses sample data above. Replace with:

     const res  = await fetch(`questions/${subjectId}.json`);
     const data = await res.json();

   once you have real question files in the questions/ folder.
   ============================================================ */
function getQuestionsForSubject(subjectId){
  const bank = SAMPLE_QUESTIONS[subjectId] || [];
  // Apply year/count filters from URL params
  const year  = params.get(`year_${subjectId}`) || 'Random';
  const count = parseInt(params.get(`count_${subjectId}`) || '40', 10);

  let filtered = year === 'Random'
    ? [...bank]
    : bank.filter(q => String(q.year_label) === year || String(q.year) === year);

  // Group by passage so passage questions stay together
  filtered = groupPassageQuestions(filtered);

  // Shuffle if not study mode (for practice/mock)
  if (mode !== 'study' && params.get('shuffleQ') !== 'false'){
    filtered = shuffleKeepingPassages(filtered);
  }

  return filtered.slice(0, count);
}

/* Keep passage groups together; shuffle at group level */
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
  // Build groups
  const groups  = [];
  const seen    = new Set();
  questions.forEach(q => {
    if (!q.passage_id){ groups.push([q]); return; }
    if (seen.has(q.passage_id)) return;
    seen.add(q.passage_id);
    groups.push(questions.filter(x => x.passage_id === q.passage_id));
  });
  // Shuffle group order
  for (let i = groups.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [groups[i], groups[j]] = [groups[j], groups[i]];
  }
  return groups.flat();
}

/* ============================================================
   SESSION STATE
   ============================================================ */
// Flat list of all questions across all subjects, in order
let allQuestions  = [];
// Track current position
let currentIdx    = 0;
// Student answers: { questionId: 'A'|'B'|'C'|'D' }
let answers       = {};
// Bookmarks: Set of question IDs
let bookmarks     = new Set(JSON.parse(localStorage.getItem('utme_bookmarks') || '[]'));
// Study mode: which questions have been shown
let shownAnswers  = new Set();
// Session start time
const sessionStart = Date.now();

/* Build flat question list from all selected subjects */
subjectIds.forEach(id => {
  getQuestionsForSubject(id).forEach(q => allQuestions.push(q));
});

// If no questions found, show a helpful message
if (allQuestions.length === 0){
  document.getElementById('questionText').textContent = 'No questions found for the selected settings. Go back and try different filters.';
}

/* ---- Check if user is paid (reads localStorage flag) ---- */
function isPaid(){
  return localStorage.getItem('utme_paid') === 'true';
}

/* ---- Is this question beyond the free limit? ---- */
function isBeyondFreeLimit(q){
  if (isPaid()) return false;
  // Count how many questions from the same subject + year we've shown
  const sameGroup = allQuestions.filter(x =>
    x.subject === q.subject && (x.year_label || String(x.year)) === (q.year_label || String(q.year))
  );
  const idx = sameGroup.indexOf(q);
  return idx >= FREE_LIMIT;
}

/* ============================================================
   TIMER
   ============================================================ */
let totalSeconds  = (timerH * 3600) + (timerM * 60);
let timerInterval = null;
const timerEl     = document.getElementById('timerDisplay');
const timerPill   = document.getElementById('timerPill');

function formatTime(s){
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startTimer(){
  if (mode === 'study'){ timerPill.innerHTML = '<span class="mode-badge">STUDY MODE</span>'; return; }
  if (totalSeconds === 0){ timerPill.innerHTML = '<span class="mode-badge">' + (mode === 'mock' ? 'MOCK' : 'PRACTICE') + '</span>'; return; }

  timerEl.textContent = formatTime(totalSeconds);
  timerInterval = setInterval(() => {
    totalSeconds--;
    timerEl.textContent = formatTime(totalSeconds);
    if (totalSeconds <= 300) timerEl.classList.add('warning');
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
  document.getElementById('qCounterText').textContent = `${idx + 1} / ${allQuestions.length}`;
  document.getElementById('prevBtn').disabled = idx === 0;
  document.getElementById('nextBtn').disabled = idx === allQuestions.length - 1;

  // Update answered pill
  updateAnsweredPill();

  // Bookmark icon state
  const bmBtn = document.getElementById('bookmarkBtn');
  bmBtn.classList.toggle('bookmarked', bookmarks.has(q.id));

  // Paywall check
  const blocked = isBeyondFreeLimit(q);
  document.getElementById('paywallCard').style.display = blocked ? 'block' : 'none';
  document.getElementById('optionsList').style.display = blocked ? 'none' : 'flex';
  document.getElementById('showHideWrap').style.display = (blocked || mode !== 'study') ? 'none' : 'flex';
  document.getElementById('explanationBox').style.display = 'none';
  document.getElementById('passageArea').style.display = 'none';
  document.getElementById('diagramArea').style.display = 'none';

  if (blocked){
    document.getElementById('questionText').textContent = '🔒 Free limit reached for this subject and year.';
    return;
  }

  // Passage
  if (q.passage_id && q.passage_text){
    document.getElementById('passageText').innerHTML = q.passage_text.replace(/\n/g, '<br>');
    document.getElementById('passageArea').style.display
