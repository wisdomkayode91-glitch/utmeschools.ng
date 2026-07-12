/* ============================================================
   UTMESchools v2 — practice.js
   Full practice/mock/study logic. No 404. No broken buttons.
   ============================================================ */

/* ================================================================
   PARSE URL PARAMS
   ================================================================ */
const urlP       = new URLSearchParams(window.location.search);
const subjectIds = (urlP.get('subjects') || 'english').split(',');
const mode       = urlP.get('mode') || 'practice';   // practice | mock | study
const timerH     = parseInt(urlP.get('h') || '2', 10);
const timerM     = parseInt(urlP.get('m') || '0', 10);
const shuffleQ   = urlP.get('shuffleQ') !== '0';
const shuffleO   = urlP.get('shuffleO') === '1';

/* ================================================================
   DEMO QUESTIONS — replace with Supabase fetch at launch
   ================================================================ */
function makeDemoQuestions(subjectId) {
  const demos = {
    english: [
      { id:'e1', subjectId:'english', year:2020, topic:'LEXIS AND STRUCTURE', subtopic:'ANTONYMS', difficulty:'Basic',
        text:'Choose the word most nearly OPPOSITE in meaning to FRUGALITY.',
        options:['Extravagance','Thriftiness','Prudence','Economy'], correct:'A',
        explanation:'Frugality means being economical or sparing. Its opposite is Extravagance — spending freely or wastefully. Thriftiness (B), Prudence (C) and Economy (D) are all synonyms of frugality.' },
      { id:'e2', subjectId:'english', year:2019, topic:'LEXIS AND STRUCTURE', subtopic:'SYNONYMS', difficulty:'Basic',
        text:'Choose the word that is CLOSEST in meaning to BENEVOLENT.',
        options:['Hostile','Generous','Greedy','Malicious'], correct:'B',
        explanation:'Benevolent means well-meaning and kindly — closest to Generous (B). Hostile (A) and Malicious (D) are opposites. Greedy (C) is unrelated.' },
      { id:'e3', subjectId:'english', year:2018, topic:'ORAL FORMS', subtopic:'Stress Pattern', difficulty:'Intermediate',
        text:'Which of the following words has its primary stress on the SECOND syllable?',
        options:['PREsent (noun)','preSENT (verb)','ANswer','PROgress (noun)'], correct:'B',
        explanation:'When "present" is used as a verb (preSENT), stress falls on the second syllable. As a noun (PREsent), stress is on the first. ANswer and PROgress (noun) are stressed on the first syllable.' },
      { id:'e4', subjectId:'english', year:2017, topic:'LEXIS AND STRUCTURE', subtopic:'Sentence Completion', difficulty:'Basic',
        text:'The police warned the crowd to __________ from throwing stones.',
        options:['prevent','refrain','restrain','restrict'], correct:'B',
        explanation:'"Refrain from" is the correct collocation meaning to stop oneself from doing something. "Prevent" and "restrain" take objects (you prevent/restrain someone). "Restrict" doesn\'t collocate with "from" here.' },
      { id:'e5', subjectId:'english', year:2016, topic:'COMPREHENSION PASSAGE', subtopic:'', difficulty:'Intermediate',
        text:'According to the passage, the writer argues that education should primarily focus on _________.',
        options:['memorising facts','developing critical thinking','passing examinations','technical skills'], correct:'B',
        explanation:'The passage emphasises thinking skills over rote learning or exam techniques. The other options represent what the author argues AGAINST.' },
    ],
    mathematics: [
      { id:'m1', subjectId:'mathematics', year:2020, topic:'ALGEBRA', subtopic:'Equations', difficulty:'Basic',
        text:'Solve for x: 2x + 5 = 13',
        options:['x = 3','x = 4','x = 5','x = 9'], correct:'B',
        explanation:'2x + 5 = 13 → 2x = 13 − 5 = 8 → x = 8 ÷ 2 = 4. Answer is B.' },
      { id:'m2', subjectId:'mathematics', year:2019, topic:'NUMBER AND NUMERATION', subtopic:'Fractions', difficulty:'Basic',
        text:'Simplify: ³⁄₄ + ¹⁄₂',
        options:['⁴⁄₆','5/4','1¼','1½'], correct:'C',
        explanation:'³⁄₄ + ¹⁄₂ = ³⁄₄ + ²⁄₄ = ⁵⁄₄ = 1¼. Answer: C.' },
    ],
    physics: [
      { id:'p1', subjectId:'physics', year:2020, topic:'MECHANICS', subtopic:'Scalars and Vectors', difficulty:'Basic',
        text:'Which of the following is a SCALAR quantity?',
        options:['Velocity','Force','Temperature','Displacement'], correct:'C',
        explanation:'Scalar quantities have magnitude only — no direction. Temperature (C) is scalar. Velocity, Force and Displacement are vector quantities (they have both magnitude and direction).' },
      { id:'p2', subjectId:'physics', year:2019, topic:'MECHANICS', subtopic:'Motion (Linear)', difficulty:'Intermediate',
        text:'A car accelerates from rest to 30 m/s in 10 seconds. What is its acceleration?',
        options:['0.33 m/s²','3 m/s²','30 m/s²','300 m/s²'], correct:'B',
        explanation:'a = (v − u) / t = (30 − 0) / 10 = 3 m/s². Answer: B. Common mistake: dividing 30 by 100 gives 0.33 (A) — wrong denominator.' },
    ],
    chemistry: [
      { id:'c1', subjectId:'chemistry', year:2020, topic:'ATOMIC STRUCTURE', subtopic:'Electronic Configuration', difficulty:'Basic',
        text:'The electronic configuration of Sodium (Na, atomic number 11) is:',
        options:['2,8,2','2,9','2,8,1','2,6,3'], correct:'C',
        explanation:'Sodium has 11 electrons arranged as 2 in the first shell, 8 in the second, and 1 in the third: 2,8,1. This is why Na readily loses 1 electron to form Na⁺.' },
    ],
    biology: [
      { id:'b1', subjectId:'biology', year:2020, topic:'NUTRITION', subtopic:'Vitamins and Deficiencies', difficulty:'Basic',
        text:'Deficiency of Vitamin C causes which disease?',
        options:['Rickets','Scurvy','Pellagra','Beri-beri'], correct:'B',
        explanation:'Vitamin C deficiency → Scurvy (B). Quick guide: Vitamin A → Night blindness | Vitamin B1 (Thiamine) → Beri-beri | Vitamin B3 (Niacin) → Pellagra | Vitamin D → Rickets.' },
    ],
  };
  // Return 5 demo questions for any subject (fallback)
  return (demos[subjectId] || []).slice(0, 5).map((q, i) => ({ ...q, qNum: i + 1 }));
}

/* ================================================================
   BUILD QUESTION LIST
   ================================================================ */
let allQuestions = [];
const FREE_LIMIT = 5;

try {
  const user = JSON.parse(localStorage.getItem('utme_user') || 'null');
  const hasPaid = user && user.has_paid;

  subjectIds.forEach(sid => {
    let qs = makeDemoQuestions(sid);

    /* Filter by topic if set */
    const topicParam = urlP.get('topics_' + sid);
    if (topicParam) {
      const allowed = topicParam.split('||');
      qs = qs.filter(q => allowed.some(t =>
        q.topic === t || (q.topic + ' : ' + q.subtopic) === t
      ));
    }

    /* Filter by year */
    const year = urlP.get('year_' + sid);
    if (year && year !== 'Random') {
      qs = qs.filter(q => String(q.year) === year);
    }

    /* Limit count */
    const count = parseInt(urlP.get('count_' + sid) || '40', 10);
    qs = qs.slice(0, count);

    /* Apply free limit */
    if (!hasPaid) {
      qs = qs.slice(0, FREE_LIMIT);
    }

    if (shuffleQ) qs.sort(() => Math.random() - 0.5);

    /* Number questions */
    qs.forEach((q, i) => { q.qNum = allQuestions.length + i + 1; q.subjectId = sid; });
    allQuestions.push(...qs);
  });
} catch(e) {
  console.error('Error building questions:', e);
}

/* If no questions at all, show placeholder */
if (allQuestions.length === 0) {
  allQuestions = [{
    id: 'placeholder', subjectId: subjectIds[0],
    qNum: 1, year: 2024,
    topic: 'DEMO', subtopic: '',
    difficulty: 'Basic',
    text: 'This is a placeholder question. Real JAMB past questions will appear here once the question bank is loaded.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 'A',
    explanation: 'This is a placeholder explanation. Real explanations will be detailed and educational.',
  }];
}

/* ================================================================
   STATE
   ================================================================ */
let currentQIndex = 0;
let answers       = {};     // { qId: 'A' | 'B' | 'C' | 'D' }
let bookmarks     = {};     // { qId: true }
let showExplanation = false;

// Load bookmarks from localStorage
try { bookmarks = JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); } catch(e) {}

/* ================================================================
   TIMER
   ================================================================ */
let totalSeconds  = (timerH * 3600) + (timerM * 60);
let timerInterval = null;

function formatTime(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startTimer() {
  if (mode === 'study') {
    document.getElementById('timerPill').style.display = 'none';
    return;
  }
  const pill = document.getElementById('timerPill');
  pill.textContent = formatTime(totalSeconds);

  timerInterval = setInterval(() => {
    totalSeconds--;
    pill.textContent = formatTime(totalSeconds);
    if (totalSeconds <= 300) pill.className = 'timer-pill danger';
    else if (totalSeconds <= 600) pill.className = 'timer-pill warn';
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      showToast('Time up! Submitting...');
      setTimeout(submitExam, 1500);
    }
  }, 1000);
}

/* ================================================================
   SUBJECT TABS
   ================================================================ */
function renderSubjectTabs() {
  const container = document.getElementById('subjTabs');
  if (subjectIds.length <= 1) { container.style.display = 'none'; return; }

  subjectIds.forEach(sid => {
    const subjQs    = allQuestions.filter(q => q.subjectId === sid);
    const answered  = subjQs.filter(q => answers[q.id]).length;
    const tab = document.createElement('div');
    tab.className = 'subj-tab';
    tab.dataset.subject = sid;
    tab.innerHTML = `${sid.charAt(0).toUpperCase()+sid.slice(1)} <span class="subj-tab-count">${answered}/${subjQs.length}</span>`;
    tab.addEventListener('click', () => {
      const first = allQuestions.findIndex(q => q.subjectId === sid);
      if (first >= 0) goToQuestion(first);
    });
    container.appendChild(tab);
  });
  updateSubjectTabs();
}

function updateSubjectTabs() {
  const currentSubject = allQuestions[currentQIndex]?.subjectId;
  document.querySelectorAll('.subj-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subject === currentSubject);
    const sid    = tab.dataset.subject;
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    const ans    = subjQs.filter(q => answers[q.id]).length;
    const countEl = tab.querySelector('.subj-tab-count');
    if (countEl) countEl.textContent = `${ans}/${subjQs.length}`;
  });
}

/* ================================================================
   RENDER QUESTION
   ================================================================ */
function renderQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q) return;

  /* Q label */
  document.getElementById('qLabel').textContent = `Q ${currentQIndex + 1} / ${allQuestions.length}`;

  /* Meta tags */
  const metaEl = document.getElementById('qMeta');
  metaEl.innerHTML = '';
  if (q.topic)      metaEl.innerHTML += `<span class="q-meta-tag">${q.topic}</span>`;
  if (q.year)       metaEl.innerHTML += `<span class="q-meta-tag">📅 ${q.year}</span>`;
  if (q.difficulty) metaEl.innerHTML += `<span class="q-meta-tag">${q.difficulty}</span>`;

  /* Question text */
  document.getElementById('qText').textContent = q.text;

  /* SVG if any */
  const svgEl = document.getElementById('qSvg');
  svgEl.innerHTML = q.svg_code || '';

  /* Passage */
  const passCard = document.getElementById('passageCard');
  const passText = document.getElementById('passageText');
  if (q.passage) {
    passText.textContent = q.passage;
    passCard.classList.add('visible');
  } else {
    passCard.classList.remove('visible');
  }

  /* Options */
  renderOptions(q);

  /* Nav buttons */
  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;

  /* Bookmark button */
  const bBtn = document.getElementById('bookmarkBtn');
  bBtn.style.color = bookmarks[q.id] ? 'var(--gold)' : '';

  /* Study mode */
  const studyActions = document.getElementById('studyActions');
  const explanBox    = document.getElementById('explanationBox');
  if (mode === 'study') {
    studyActions.classList.add('visible');
    document.getElementById('showAnswerBtn').textContent = showExplanation ? '🙈 Hide Answer' : '👁 Show Answer';
    if (showExplanation) {
      explanBox.classList.add('visible');
      document.getElementById('explanationText').textContent = q.explanation || 'No explanation available yet.';
    } else {
      explanBox.classList.remove('visible');
    }
  } else {
    studyActions.classList.remove('visible');
    // Show explanation after answered in practice mode
    if (mode === 'practice' && answers[q.id]) {
      explanBox.classList.add('visible');
      document.getElementById('explanationText').textContent = q.explanation || 'No explanation available yet.';
    } else {
      explanBox.classList.remove('visible');
    }
  }

  /* Bottom bar */
  const answered = Object.keys(answers).length;
  document.getElementById('answeredCount').textContent = answered;
  document.getElementById('totalCount').textContent    = allQuestions.length;

  updateSubjectTabs();
}

function renderOptions(q) {
  const list = document.getElementById('optionsList');
  const letters = ['A','B','C','D'];
  const userAns = answers[q.id];
  const isAnswered = !!userAns;
  const isStudy    = mode === 'study' && showExplanation;
  const showResult = isAnswered && (mode === 'practice' || isStudy);

  list.innerHTML = '';
  (q.options || []).forEach((opt, i) => {
    const letter = letters[i];
    const row = document.createElement('div');
    row.className = 'option-row';

    if (showResult) {
      if (letter === q.correct)                          row.classList.add('correct');
      else if (letter === userAns && letter !== q.correct) row.classList.add('wrong');
      else if (letter !== q.correct)                     row.classList.add('dimmed');
    } else if (mode === 'study' && showExplanation) {
      if (letter === q.correct) row.classList.add('correct');
      else row.classList.add('dimmed');
    } else if (userAns === letter) {
      row.classList.add('selected');
    }

    row.innerHTML = `
      <div class="option-letter">${letter}</div>
      <div class="option-text">${opt}</div>
    `;

    if (!isAnswered || mode === 'study') {
      row.addEventListener('click', () => selectAnswer(q, letter));
    }
    list.appendChild(row);
  });
}

function selectAnswer(q, letter) {
  if (mode === 'mock' && answers[q.id]) return; // mock: can't change once answered
  answers[q.id] = letter;
  showExplanation = true;
  renderQuestion();
  // Auto-advance in study mode after short delay
  if (mode === 'study' && currentQIndex < allQuestions.length - 1) {
    setTimeout(() => { goToQuestion(currentQIndex + 1); }, 1200);
  }
}

/* ================================================================
   NAVIGATION
   ================================================================ */
function goToQuestion(index) {
  if (index < 0 || index >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex = index;
  renderQuestion();
  // Scroll to top of question area
  document.getElementById('qCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ================================================================
   BOOKMARK
   ================================================================ */
function toggleBookmark() {
  const q = allQuestions[currentQIndex];
  if (!q) return;
  if (bookmarks[q.id]) {
    delete bookmarks[q.id];
    showToast('Bookmark removed');
  } else {
    bookmarks[q.id] = {
      id: q.id, subjectId: q.subjectId, year: q.year,
      text: q.text, savedAt: new Date().toISOString()
    };
    showToast('Question bookmarked ⭐');
  }
  try { localStorage.setItem('utme_bookmarks', JSON.stringify(bookmarks)); } catch(e) {}
  document.getElementById('bookmarkBtn').style.color = bookmarks[q.id] ? 'var(--gold)' : '';
}

/* ================================================================
   QUESTION GRID
   ================================================================ */
function openGrid() {
  const grid = document.getElementById('gridNums');
  grid.innerHTML = '';
  allQuestions.forEach((q, i) => {
    const el = document.createElement('div');
    el.className = 'grid-num' +
      (answers[q.id]       ? ' answered' : '') +
      (i === currentQIndex ? ' current'  : '');
    el.textContent = i + 1;
    el.addEventListener('click', () => {
      closeGrid();
      goToQuestion(i);
    });
    grid.appendChild(el);
  });
  document.getElementById('gridOverlay').classList.add('open');
}
function closeGrid() { document.getElementById('gridOverlay').classList.remove('open'); }

/* ================================================================
   SUBMIT
   ================================================================ */
function openSubmitDialog() {
  const answered = Object.keys(answers).length;
  const total    = allQuestions.length;
  document.getElementById('dialogBody').textContent =
    `You have answered ${answered} of ${total} questions. Submit now and see your result?`;
  document.getElementById('dialogOverlay').classList.add('open');
}
function closeSubmitDialog() { document.getElementById('dialogOverlay').classList.remove('open'); }

function submitExam() {
  if (timerInterval) clearInterval(timerInterval);

  /* Calculate scores per subject */
  const subjectResults = {};
  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    let correct = 0, attempted = 0;
    const questionDetails = subjQs.map(q => {
      const userAns = answers[q.id] || null;
      const isCorrect = userAns === q.correct;
      if (userAns) { attempted++; if (isCorrect) correct++; }
      return {
        id: q.id, num: q.qNum, text: q.text, options: q.options,
        correct: q.correct, userAnswer: userAns,
        topic: q.topic, subtopic: q.subtopic, year: q.year,
        explanation: q.explanation, difficulty: q.difficulty,
      };
    });
    subjectResults[sid] = { total: subjQs.length, attempted, correct, questions: questionDetails };
  });

  const result = {
    id: 'r_' + Date.now(),
    mode, subjectIds,
    subjectResults,
    totalAnswered: Object.keys(answers).length,
    totalQuestions: allQuestions.length,
    timeTaken: (timerH * 3600 + timerM * 60) - totalSeconds,
    date: new Date().toISOString(),
  };

  /* Save to sessionStorage for result page */
  try { sessionStorage.setItem('utme_result', JSON.stringify(result)); } catch(e) {}

  /* Save to localStorage history */
  try {
    const history = JSON.parse(localStorage.getItem('utme_history') || '[]');
    history.unshift(result);
    localStorage.setItem('utme_history', JSON.stringify(history.slice(0, 100))); // keep last 100
  } catch(e) {}

  window.location.href = 'result.html';
}

/* ================================================================
   CALCULATOR
   ================================================================ */
let calcDisplay = '0', calcExpr = '', calcJustEvaled = false;
function openCalc()  { document.getElementById('calcOverlay').classList.add('open'); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }
function updateCalcDisplay() { document.getElementById('calcDisplay').textContent = calcDisplay; }
function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    if (calcExpr.length <= 1) { calcDisplay = '0'; calcExpr = ''; }
    else { calcExpr = calcExpr.slice(0,-1); calcDisplay = calcExpr; }
  } else if (val === '=') {
    try {
      const safe = calcExpr.replace(/×/g,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/.()%]/g,'');
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay; calcJustEvaled = true;
    } catch(e) { calcDisplay = 'Error'; calcExpr = ''; }
  } else if (val === '√') {
    const n = parseFloat(calcExpr);
    if (!isNaN(n)) { calcDisplay = String(parseFloat(Math.sqrt(n).toFixed(8))); calcExpr = calcDisplay; calcJustEvaled = true; }
  } else if (['+','-','×','÷','%'].includes(val)) {
    const m = {'×':'*','÷':'/'};
    calcExpr += (m[val]||val); calcDisplay = calcExpr; calcJustEvaled = false;
  } else {
    if (calcJustEvaled) { calcExpr = val; calcJustEvaled = false; }
    else { calcExpr = (calcExpr==='0'||calcExpr==='') ? val : calcExpr+val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

/* ================================================================
   TOAST
   ================================================================ */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ================================================================
   TEXT TO SPEECH
   ================================================================ */
function speakQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q || !window.speechSynthesis) { showToast('Text-to-speech not supported'); return; }
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(q.text);
  utt.lang = 'en-NG';
  speechSynthesis.speak(utt);
}

/* ================================================================
   KEYBOARD SHORTCUTS
   ================================================================ */
document.addEventListener('keydown', e => {
  if (document.getElementById('calcOverlay').classList.contains('open')) return;
  if (e.key === 'ArrowRight') goToQuestion(currentQIndex + 1);
  if (e.key === 'ArrowLeft')  goToQuestion(currentQIndex - 1);
  if (e.key === '1') selectAnswer(allQuestions[currentQIndex], 'A');
  if (e.key === '2') selectAnswer(allQuestions[currentQIndex], 'B');
  if (e.key === '3') selectAnswer(allQuestions[currentQIndex], 'C');
  if (e.key === '4') selectAnswer(allQuestions[currentQIndex], 'D');
});

/* ================================================================
   DOMContentLoaded — wire all buttons
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {

  /* Back */
  document.getElementById('backBtn').addEventListener('click', () => {
    if (confirm('Leave practice? Your progress will be lost.')) {
      if (timerInterval) clearInterval(timerInterval);
      window.location.href = 'select-subjects.html';
    }
  });

  /* Prev / Next */
  document.getElementById('prevBtn').addEventListener('click', () => goToQuestion(currentQIndex - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goToQuestion(currentQIndex + 1));

  /* Bookmark */
  document.getElementById('bookmarkBtn').addEventListener('click', toggleBookmark);

  /* Flag */
  document.getElementById('flagBtn').addEventListener('click', () => showToast('Question reported. Thank you!'));

  /* Calculator */
  document.getElementById('calcBtn').addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.getElementById('calcOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });

  /* Speaker */
  document.getElementById('speakerBtn').addEventListener('click', speakQuestion);

  /* Show answer (study mode) */
  document.getElementById('showAnswerBtn').addEventListener('click', () => {
    showExplanation = !showExplanation;
    renderQuestion();
  });

  /* Answered pill → grid */
  document.getElementById('answeredPill').addEventListener('click', openGrid);

  /* Grid */
  document.getElementById('gridCloseBtn').addEventListener('click', closeGrid);
  document.getElementById('gridOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('gridOverlay')) closeGrid();
  });

  /* Submit */
  document.getElementById('submitBtn').addEventListener('click', openSubmitDialog);
  document.getElementById('dialogCancel').addEventListener('click', closeSubmitDialog);
  document.getElementById('dialogOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('dialogOverlay')) closeSubmitDialog();
  });
  document.getElementById('dialogSubmit').addEventListener('click', () => {
    closeSubmitDialog();
    submitExam();
  });

  /* Init */
  renderSubjectTabs();
  renderQuestion();
  startTimer();
});
