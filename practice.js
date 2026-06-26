
# Build practice.js - the question answering logic
practice_js = '''/* ============================================================
   UTMESchools v2 — practice.js
   Question-answering screen. Receives settings from URL params.
   Works with placeholder questions (hardcoded) for testing.
   ============================================================ */

/* ---- Parse URL params ---- */
const params = new URLSearchParams(window.location.search);
const subjectIds = (params.get('subjects') || 'english').split(',');
const mode = params.get('mode') || 'practice'; // practice | mock | study
const timerH = parseInt(params.get('h') || '2', 10);
const timerM = parseInt(params.get('m') || '0', 10);

const subjectConfig = {};
subjectIds.forEach(id => {
  subjectConfig[id] = {
    year: params.get(`year_${id}`) || 'Random',
    count: parseInt(params.get(`count_${id}`) || '40', 10)
  };
});

/* ---- Subject metadata (same as select-subjects.js) ---- */
const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',       icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'accounts',    name: 'Accounts',               icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'agriculture', name: 'Agriculture',            icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'biology',     name: 'Biology',                icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'chemistry',   name: 'Chemistry',              icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'commerce',    name: 'Commerce',               icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'computer',    name: 'Computer Studies',       icon: '💻', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'crk',         name: 'CRK',                    icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'economics',   name: 'Economics',              icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'fineart',     name: 'Fine Art',               icon: '🎨', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'french',      name: 'French',                 icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'geography',   name: 'Geography',              icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'government',  name: 'Government',             icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'hausa',       name: 'Hausa',                  icon: '📜', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'history',     name: 'History',                icon: '🏺', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'homeec',      name: 'Home Economics',         icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'igbo',        name: 'Igbo',                   icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'irk',         name: 'IRK',                    icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'literature',  name: 'Literature',             icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'littext',     name: 'Literature Textbooks',   icon: '📗', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'mathematics', name: 'Mathematics',            icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'music',       name: 'Music',                  icon: '🎵', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'phe',         name: 'PHE',                    icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'physics',     name: 'Physics',                icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'lekki',       name: 'The Lekki Headmaster',   icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'yoruba',      name: 'Yoruba',                 icon: '🌺', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
];

function getSubject(id) { return ALL_SUBJECTS.find(s => s.id === id); }

/* ============================================================
   PLACEHOLDER QUESTIONS — 5 sample questions for testing
   Replace with real DB fetch once Supabase is connected
   ============================================================ */
const PLACEHOLDER_QUESTIONS = [
  {
    id: 'q1', subjectId: 'english',
    text: 'Choose the word that is most nearly opposite in meaning to the underlined word: "The politician was known for his **frugality** in spending public funds."',
    options: ['A. Extravagance', 'B. Thriftiness', 'C. Prudence', 'D. Economy'],
    correct: 'A',
    topic: 'LEXIS AND STRUCTURE', subtopic: 'ANTONYMS',
    difficulty: 'Basic',
    explanation: 'Frugality means being economical or sparing with money. Its opposite is extravagance, which means spending money freely or wastefully. Thriftiness, prudence, and economy are all synonyms of frugality, not opposites.'
  },
  {
    id: 'q2', subjectId: 'english',
    text: 'In the sentence "The boy **who** stole the book has been caught," the underlined word is a:',
    options: ['A. Relative pronoun', 'B. Demonstrative pronoun', 'C. Interrogative pronoun', 'D. Reflexive pronoun'],
    correct: 'A',
    topic: 'LEXIS AND STRUCTURE', subtopic: 'GRAMMAR',
    difficulty: 'Basic',
    explanation: '"Who" is a relative pronoun because it introduces a relative clause ("who stole the book") that gives more information about the noun "boy." Relative pronouns (who, whom, whose, which, that) connect clauses to nouns.'
  },
  {
    id: 'q3', subjectId: 'biology',
    text: 'Which of the following is NOT a function of the human skeleton?',
    options: ['A. Protection of internal organs', 'B. Production of red blood cells', 'C. Regulation of body temperature', 'D. Support of the body'],
    correct: 'C',
    topic: 'COORDINATION AND CONTROL', subtopic: 'SKELETAL SYSTEM',
    difficulty: 'Intermediate',
    explanation: 'The skeleton provides support, protects internal organs (e.g., skull protects the brain), and produces blood cells in the bone marrow. Regulation of body temperature is a function of the skin (sweating, vasodilation), not the skeleton.'
  },
  {
    id: 'q4', subjectId: 'mathematics',
    text: 'If log₂(x) = 5, what is the value of x?',
    options: ['A. 10', 'B. 25', 'C. 32', 'D. 64'],
    correct: 'C',
    topic: 'NUMBER AND NUMERATION', subtopic: 'LOGARITHMS',
    difficulty: 'Basic',
    explanation: 'If log₂(x) = 5, then by definition of logarithms: x = 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. Remember: logₐ(b) = c means aᶜ = b.'
  },
  {
    id: 'q5', subjectId: 'mathematics',
    text: 'A man walks 3 km due North and then 4 km due East. How far is he from his starting point?',
    options: ['A. 5 km', 'B. 7 km', 'C. 12 km', 'D. 25 km'],
    correct: 'A',
    topic: 'GEOMETRY AND MENSURATION', subtopic: 'PYTHAGORAS THEOREM',
    difficulty: 'Basic',
    explanation: 'This forms a right-angled triangle with sides 3 km and 4 km. Using Pythagoras theorem: distance² = 3² + 4² = 9 + 16 = 25. Therefore distance = √25 = 5 km. This is a classic 3-4-5 right triangle.'
  }
];

/* ---- Build question list from params ---- */
// For now, use placeholder questions filtered by selected subjects
// In production, this fetches from Supabase based on subjectConfig
let allQuestions = [];
subjectIds.forEach(sid => {
  const cfg = subjectConfig[sid];
  const count = Math.min(cfg.count, 5); // placeholder: max 5 per subject for demo
  const subjQs = PLACEHOLDER_QUESTIONS.filter(q => q.subjectId === sid);
  // If no placeholder for this subject, create generic ones
  if (subjQs.length === 0) {
    for (let i = 0; i < count; i++) {
      allQuestions.push({
        id: `${sid}_q${i+1}`, subjectId: sid,
        text: `[Sample] This is a placeholder question for ${getSubject(sid)?.name || sid}. Real questions will appear here once loaded from the database.`,
        options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
        correct: 'A',
        topic: 'GENERAL', subtopic: 'PLACEHOLDER',
        difficulty: 'Basic',
        explanation: 'This is a placeholder explanation. Real explanations will appear once questions are loaded from the database.'
      });
    }
  } else {
    allQuestions.push(...subjQs.slice(0, count));
  }
});

// Shuffle questions if shuffle is enabled (placeholder: always shuffle for demo)
// In production, check param from select-subjects
allQuestions.sort(() => Math.random() - 0.5);

/* ---- State ---- */
let currentQIndex = 0;
const answers = {}; // { questionIndex: 'A'|'B'|'C'|'D' }
const bookmarks = new Set(); // { questionIndex }
let showExplanation = false; // for study mode / after submit
let timerInterval = null;
let timeRemaining = timerH * 3600 + timerM * 60;
let examSubmitted = false;
let startTime = Date.now();

/* ============================================================
   RENDER FUNCTIONS
   ============================================================ */

function renderSubjectTabs() {
  const tabs = document.getElementById('subjectTabs');
  if (subjectIds.length <= 1) {
    tabs.style.display = 'none';
    return;
  }
  tabs.style.display = 'flex';
  tabs.innerHTML = '';

  subjectIds.forEach((sid, idx) => {
    const s = getSubject(sid);
    const qCount = allQuestions.filter(q => q.subjectId === sid).length;
    const answered = allQuestions.filter((q, i) => q.subjectId === sid && answers[i] !== undefined).length;
    const tab = document.createElement('button');
    tab.className = 'subject-tab' + (idx === 0 ? ' active' : '');
    tab.innerHTML = `${s?.name || sid}<span class="tab-progress">${answered}/${qCount}</span>`;
    tab.addEventListener('click', () => {
      // Jump to first question of this subject
      const firstIdx = allQuestions.findIndex(q => q.subjectId === sid);
      if (firstIdx !== -1) goToQuestion(firstIdx);
    });
    tabs.appendChild(tab);
  });
}

function renderQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q) return;

  // Update nav
  document.getElementById('qNum').textContent = currentQIndex + 1;
  document.getElementById('qTotal').textContent = allQuestions.length;
  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;

  // Update meta
  document.getElementById('qTopicTag').textContent = q.topic || 'General';
  document.getElementById('qYearTag').textContent = subjectConfig[q.subjectId]?.year || 'Random';
  document.getElementById('qDiffTag').textContent = q.difficulty || 'Basic';

  // Question text
  document.getElementById('qText').textContent = q.text;

  // SVG (placeholder)
  const svgEl = document.getElementById('qSvg');
  if (q.svg) {
    svgEl.innerHTML = q.svg;
    svgEl.style.display = 'block';
  } else {
    svgEl.style.display = 'none';
  }

  // Options
  const optsList = document.getElementById('optionsList');
  optsList.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const letter = String.fromCharCode(65 + idx); // A, B, C, D
    const row = document.createElement('div');
    row.className = 'option-row';
    row.dataset.letter = letter;

    // Apply state based on mode and whether answered
    const isAnswered = answers[currentQIndex] !== undefined;
    const isSelected = answers[currentQIndex] === letter;
    const isCorrect = q.correct === letter;

    if (mode === 'study' && showExplanation) {
      // Study mode with answer shown
      if (isCorrect) row.classList.add('correct');
      else if (isSelected && !isCorrect) row.classList.add('wrong');
      else row.classList.add('disabled');
    } else if (examSubmitted) {
      // After submission
      if (isCorrect) row.classList.add('correct');
      else if (isSelected && !isCorrect) row.classList.add('wrong');
      else row.classList.add('disabled');
    } else if (isSelected) {
      row.classList.add('selected');
    }

    row.innerHTML = `
      <div class="option-circle">${letter}</div>
      <div class="option-text">${opt.replace(/^[A-D]\.\s*/, '')}</div>
    `;

    if (!examSubmitted && !(mode === 'study' && showExplanation)) {
      row.addEventListener('click', () => selectOption(letter));
    }

    optsList.appendChild(row);
  });

  // Explanation box
  const exBox = document.getElementById('explanationBox');
  if ((mode === 'study' && showExplanation) || examSubmitted) {
    exBox.style.display = 'block';
    document.getElementById('exTopic').textContent = q.topic || 'General';
    document.getElementById('exSubtopic').textContent = q.subtopic || 'General';
    document.getElementById('exDiff').textContent = q.difficulty || 'Basic';
    document.getElementById('exText').textContent = q.explanation || 'No explanation available.';
  } else {
    exBox.style.display = 'none';
  }

  // Study mode actions
  const studyActions = document.getElementById('studyActions');
  if (mode === 'study' && !examSubmitted) {
    studyActions.style.display = 'flex';
    const btn = document.getElementById('showAnswerBtn');
    btn.textContent = showExplanation ? 'Hide Answer' : 'Show Answer';
  } else {
    studyActions.style.display = 'none';
  }

  // Bookmark button state
  const bmBtn = document.getElementById('bookmarkBtn');
  if (bookmarks.has(currentQIndex)) {
    bmBtn.classList.add('bookmarked');
    bmBtn.textContent = '🔖';
  } else {
    bmBtn.classList.remove('bookmarked');
    bmBtn.textContent = '🔖';
  }

  // Update subject tab highlight
  document.querySelectorAll('.subject-tab').forEach((tab, idx) => {
    tab.classList.toggle('active', subjectIds[idx] === q.subjectId);
  });

  // Update bottom bar
  document.getElementById('answeredCount').textContent = Object.keys(answers).length;
  document.getElementById('totalCount').textContent = allQuestions.length;
}

function selectOption(letter) {
  if (examSubmitted) return;
  answers[currentQIndex] = letter;
  renderQuestion();
  updateGrid();
}

function goToQuestion(idx) {
  if (idx < 0 || idx >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex = idx;
  renderQuestion();
}

/* ============================================================
   TIMER
   ============================================================ */
function startTimer() {
  if (mode === 'study') return; // No timer in study mode
  const timerPill = document.getElementById('timerPill');
  timerPill.style.display = 'flex';
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeRemaining--;
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      clearInterval(timerInterval);
      submitExam(true); // auto-submit
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  const h = Math.floor(timeRemaining / 3600);
  const m = Math.floor((timeRemaining % 3600) / 60);
  const s = timeRemaining % 60;
  const text = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  document.getElementById('timerText').textContent = text;

  const pill = document.getElementById('timerPill');
  pill.classList.remove('warning', 'danger');
  if (timeRemaining < 300) pill.classList.add('danger'); // < 5 min
  else if (timeRemaining < 600) pill.classList.add('warning'); // < 10 min
}

/* ============================================================
   QUESTION GRID PANEL
   ============================================================ */
function renderGrid() {
  const body = document.getElementById('gridBody');
  body.innerHTML = '';

  subjectIds.forEach(sid => {
    const s = getSubject(sid);
    const label = document.createElement('div');
    label.className = 'grid-subject-label';
    label.textContent = s?.name || sid;
    body.appendChild(label);

    const tiles = document.createElement('div');
    tiles.className = 'grid-tiles';

    allQuestions.forEach((q, idx) => {
      if (q.subjectId !== sid) return;
      const tile = document.createElement('button');
      tile.className = 'grid-tile';
      if (answers[idx] !== undefined) tile.classList.add('answered');
      if (idx === currentQIndex) tile.classList.add('current');
      tile.textContent = idx + 1;
      tile.addEventListener('click', () => {
        goToQuestion(idx);
        closeGrid();
      });
      tiles.appendChild(tile);
    });

    body.appendChild(tiles);
  });
}

function updateGrid() {
  // Re-render grid tiles for current subject only (optimization)
  renderGrid();
}

function openGrid() {
  renderGrid();
  document.getElementById('gridOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeGrid() {
  document.getElementById('gridOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   SUBMIT
   ============================================================ */
function openSubmitDialog() {
  const answered = Object.keys(answers).length;
  const total = allQuestions.length;
  document.getElementById('dialogText').textContent =
    `You have answered ${answered} of ${total} questions. Are you sure you want to submit and end this exam?`;
  document.getElementById('dialogOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSubmitDialog() {
  document.getElementById('dialogOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function submitExam(auto = false) {
  if (examSubmitted) return;
  examSubmitted = true;
  if (timerInterval) clearInterval(timerInterval);

  // Calculate results
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);
  let totalScore = 0;
  let totalPossible = 0;
  const subjectScores = {};

  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    let correct = 0;
    subjQs.forEach(q => {
      const qIdx = allQuestions.indexOf(q);
      if (answers[qIdx] === q.correct) correct++;
    });
    const score = correct;
    const possible = subjQs.length;
    subjectScores[sid] = { score, possible, correct };
    totalScore += score;
    totalPossible += possible;
  });

  // Store results in sessionStorage for results.html
  const resultData = {
    mode,
    subjects: subjectIds,
    subjectScores,
    totalScore,
    totalPossible,
    timeTaken,
    questions: allQuestions.map((q, i) => ({
      ...q,
      userAnswer: answers[i] || null,
      isCorrect: answers[i] === q.correct
    })),
    answers,
    date: new Date().toISOString()
  };
  sessionStorage.setItem('utme_result', JSON.stringify(resultData));

  // Redirect to results
  window.location.href = 'results.html';
}

/* ============================================================
   CALCULATOR (same logic as select-subjects.js)
   ============================================================ */
let calcDisplay = '0';
let calcExpr = '';
let calcJustEvaled = false;

function openCalc() {
  document.getElementById('calcOverlay').classList.add('open');
  updateCalcDisplay();
}
function closeCalc() {
  document.getElementById('calcOverlay').classList.remove('open');
}
function updateCalcDisplay() {
  document.getElementById('calcDisplay').textContent = calcDisplay;
}
function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    calcDisplay = calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0';
    calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : '';
  } else if (val === '=') {
    try {
      const safe = calcExpr.replace(/[^0-9+\-*/.()%√]/g, '').replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay;
      calcJustEvaled = true;
    } catch(e) {
      calcDisplay = 'Error'; calcExpr = '';
    }
  } else if (val === '√') {
    calcExpr += '√';
    calcDisplay = calcExpr;
    calcJustEvaled = false;
  } else if (['+','-','×','÷','%'].includes(val)) {
    const opMap = {'×':'*','÷':'/'};
    const op = opMap[val] || val;
    ca
