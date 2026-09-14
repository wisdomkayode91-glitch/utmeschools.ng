/* ============================================================
   UTMESchools v2 — practice.js
   Reads questions from /questions/[subject].json
   No Supabase needed. Works on GitHub Pages.
   ============================================================ */

/* ================================================================
   MODE RULES
   practice : no answers shown during session. Submit → result saved.
   mock     : no answers shown during session. Submit → analysis only, NOT saved.
   study    : click "Show Answer" to reveal. No submit button. NOT saved.
   All modes: can freely change selected answer anytime.
   ================================================================ */

const urlP       = new URLSearchParams(window.location.search);
const subjectIds = (urlP.get('subjects') || 'english').split(',');
const mode       = urlP.get('mode') || 'practice';
const timerH     = parseInt(urlP.get('h') || '2', 10);
const timerM     = parseInt(urlP.get('m') || '0', 10);
const shuffleQ   = urlP.get('shuffleQ') !== '0';

/* ================================================================
   FETCH QUESTIONS FROM JSON FILE
   ================================================================ */
async function fetchQuestionsFromJSON(subjectId, year, count, topicsParam) {
  try {
    const res = await fetch(`questions/${subjectId}.json`);
    if (!res.ok) {
      console.warn(`No question file found for ${subjectId}`);
      return [];
    }
    let questions = await res.json();

    /* Filter by year */
    if (year && year !== 'Random') {
      questions = questions.filter(q => String(q.year) === String(year));
    }

    /* Filter by topics */
    if (topicsParam) {
      const allowed = topicsParam.split('||');
      questions = questions.filter(q =>
        allowed.some(t => q.topic === t || (q.topic + ' : ' + q.subtopic) === t)
      );
    }

    /* Sort by year desc, then by id to keep similar questions together */
    questions.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return String(a.topic).localeCompare(String(b.topic));
    });

    /* Limit count */
    questions = questions.slice(0, count);

    /* Map to app format */
    return questions.map(q => ({
      id:          String(q.id),
      subjectId:   q.subject_id,
      year:        q.year,
      topic:       q.topic || '',
      subtopic:    q.subtopic || '',
      difficulty:  q.difficulty || 'Intermediate',
      text:        q.text,
      options:     [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean),
      correct:     q.correct,
      explanation: q.explanation || '',
      svg_code:    q.svg_code || '',
      image_file:  q.image_file || '',
      passage:     q.passage || '',
    }));

  } catch(e) {
    console.error(`Error loading ${subjectId}.json:`, e);
    return [];
  }
}

/* ================================================================
   DEMO QUESTIONS — shown only when JSON file has no questions
   ================================================================ */
function getDemoQuestions(subjectId) {
  return [
    {
      id: 'demo_1', subjectId: subjectId, year: 2024,
      topic: 'DEMO', subtopic: '', difficulty: 'Basic',
      text: 'This is a demo question. Real JAMB past questions will appear here once loaded.',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct: 'A',
      explanation: 'This is a demo. Real explanations will be detailed and educational.',
      svg_code: '', image_file: '', passage: ''
    }
  ];
}

/* ================================================================
   STATE
   ================================================================ */
let allQuestions    = [];
let currentQIndex   = 0;
let answers         = {};
let bookmarks       = {};
let showExplanation = false;

const FREE_LIMIT = 5;
try { bookmarks = JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); } catch(e) {}

/* ================================================================
   TIMER
   ================================================================ */
let totalSeconds  = (timerH * 3600) + (timerM * 60);
let timerInterval = null;

function formatTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
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
    if (totalSeconds <= 300)      pill.className = 'timer-pill danger';
    else if (totalSeconds <= 600) pill.className = 'timer-pill warn';
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      showToast('Time up! Submitting...');
      setTimeout(submitExam, 1500);
    }
  }, 1000);
}

/* ================================================================
   LOAD QUESTIONS
   ================================================================ */
async function loadAllQuestions() {
  showLoadingState(true);
  try {
    const user    = JSON.parse(localStorage.getItem('utme_user') || 'null');
    const hasPaid = user && user.has_paid;

    for (const sid of subjectIds) {
      const year       = urlP.get('year_'   + sid) || 'Random';
      const count      = parseInt(urlP.get('count_' + sid) || '40', 10);
      const topicParam = urlP.get('topics_' + sid) || '';

      let qs = await fetchQuestionsFromJSON(sid, year, count, topicParam);

      if (qs.length === 0) {
        qs = getDemoQuestions(sid);
        showToast('Demo questions shown — add real questions to questions/' + sid + '.json');
      }

      if (!hasPaid) qs = qs.slice(0, FREE_LIMIT);
      if (shuffleQ)  qs.sort(() => Math.random() - 0.5);

      qs.forEach((q, i) => { q.qNum = allQuestions.length + i + 1; q.subjectId = sid; });
      allQuestions.push(...qs);
    }
  } catch(e) { console.error('loadAllQuestions error:', e); }

  if (allQuestions.length === 0) allQuestions = getDemoQuestions(subjectIds[0]);

  /* Hide submit button in study mode */
  if (mode === 'study') {
    document.getElementById('submitBtn').style.display = 'none';
  }

  showLoadingState(false);
  renderSubjectTabs();
  renderQuestion();
  startTimer();
}

function showLoadingState(loading) {
  const qCard = document.getElementById('qCard');
  if (loading) {
    qCard.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:32px;margin-bottom:12px;">⏳</div>
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:6px;">Loading questions...</div>
        <div style="font-size:13px;color:var(--ink-soft);">Please wait</div>
      </div>`;
    document.getElementById('optionsList').innerHTML = '';
  }
}

/* ================================================================
   SUBJECT TABS
   ================================================================ */
function renderSubjectTabs() {
  const container = document.getElementById('subjTabs');
  if (subjectIds.length <= 1) { container.style.display = 'none'; return; }
  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    const tab    = document.createElement('div');
    tab.className = 'subj-tab';
    tab.dataset.subject = sid;
    tab.innerHTML = `${sid.charAt(0).toUpperCase()+sid.slice(1)} <span class="subj-tab-count">0/${subjQs.length}</span>`;
    tab.addEventListener('click', () => {
      const first = allQuestions.findIndex(q => q.subjectId === sid);
      if (first >= 0) goToQuestion(first);
    });
    container.appendChild(tab);
  });
  updateSubjectTabs();
}

function updateSubjectTabs() {
  const current = allQuestions[currentQIndex]?.subjectId;
  document.querySelectorAll('.subj-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subject === current);
    const sid    = tab.dataset.subject;
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    const ans    = subjQs.filter(q => answers[q.id]).length;
    const el     = tab.querySelector('.subj-tab-count');
    if (el) el.textContent = `${ans}/${subjQs.length}`;
  });
}

/* ================================================================
   RENDER QUESTION
   ================================================================ */
function renderQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q) return;

  const qCard = document.getElementById('qCard');
  if (!qCard.querySelector('#qMeta')) {
    qCard.innerHTML = `
      <div class="q-meta" id="qMeta"></div>
      <div class="q-text" id="qText"></div>
      <div class="q-svg"  id="qSvg"></div>`;
  }

  document.getElementById('qLabel').textContent = `Q ${currentQIndex + 1} / ${allQuestions.length}`;

  const metaEl = document.getElementById('qMeta');
  metaEl.innerHTML = '';
  if (q.topic)      metaEl.innerHTML += `<span class="q-meta-tag">${q.topic}</span>`;
  if (q.year)       metaEl.innerHTML += `<span class="q-meta-tag">📅 ${q.year}</span>`;
  if (q.difficulty) metaEl.innerHTML += `<span class="q-meta-tag">${q.difficulty}</span>`;

  document.getElementById('qText').textContent = q.text;

  const svgEl = document.getElementById('qSvg');
  if (q.svg_code)      svgEl.innerHTML = q.svg_code;
  else if (q.image_file) svgEl.innerHTML = `<img src="images/${q.image_file}" alt="Diagram" style="max-width:100%;border-radius:8px;margin-top:8px;">`;
  else svgEl.innerHTML = '';

  /* Passage */
  const passCard = document.getElementById('passageCard');
  if (q.passage) {
    document.getElementById('passageText').textContent = q.passage;
    passCard.classList.add('visible');
  } else {
    passCard.classList.remove('visible');
  }

  renderOptions(q);

  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;
  document.getElementById('bookmarkBtn').style.color = bookmarks[q.id] ? 'var(--gold)' : '';

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
    /* Practice and Mock: NEVER show answer during session */
    studyActions.classList.remove('visible');
    explanBox.classList.remove('visible');
  }

  document.getElementById('answeredCount').textContent = Object.keys(answers).length;
  document.getElementById('totalCount').textContent    = allQuestions.length;

  updateSubjectTabs();
}

/* ================================================================
   RENDER OPTIONS
   Practice/Mock: highlight selection only. No correct/wrong colours.
   Study + showExplanation: green = correct, red = wrong.
   ALL modes: clicking always updates answer (freely changeable).
   ================================================================ */
function renderOptions(q) {
  const list    = document.getElementById('optionsList');
  const letters = ['A','B','C','D','E'];
  const userAns = answers[q.id];

  list.innerHTML = '';
  (q.options || []).forEach((opt, i) => {
    const letter = letters[i];
    const row    = document.createElement('div');
    row.className = 'option-row';

    if (mode === 'study' && showExplanation) {
      if (letter === q.correct)    row.classList.add('correct');
      else if (letter === userAns) row.classList.add('wrong');
      else                         row.classList.add('dimmed');
    } else {
      if (userAns === letter) row.classList.add('selected');
    }

    row.innerHTML = `
      <div class="option-letter">${letter}</div>
      <div class="option-text">${opt}</div>`;

    row.addEventListener('click', () => selectAnswer(q, letter));
    list.appendChild(row);
  });
}

/* ================================================================
   SELECT ANSWER — always changeable
   ================================================================ */
function selectAnswer(q, letter) {
  answers[q.id]   = letter;
  showExplanation = false;
  renderQuestion();
}

/* ================================================================
   NAVIGATION
   ================================================================ */
function goToQuestion(index) {
  if (index < 0 || index >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex   = index;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
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
      text: q.text, options: q.options, correct: q.correct,
      explanation: q.explanation, topic: q.topic,
      savedAt: new Date().toISOString()
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
    el.addEventListener('click', () => { closeGrid(); goToQuestion(i); });
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
  const label    = mode === 'practice' ? 'submit and save your result' : 'submit and see your analysis';
  document.getElementById('dialogBody').textContent =
    `You have answered ${answered} of ${total} questions. Ready to ${label}?`;
  document.getElementById('dialogOverlay').classList.add('open');
}
function closeSubmitDialog() { document.getElementById('dialogOverlay').classList.remove('open'); }

function buildResult(saveToHistory) {
  if (timerInterval) clearInterval(timerInterval);
  const subjectResults = {};
  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    let correct = 0, attempted = 0;
    const questionDetails = subjQs.map(q => {
      const userAns   = answers[q.id] || null;
      const isCorrect = userAns === q.correct;
      if (userAns) { attempted++; if (isCorrect) correct++; }
      return {
        id: q.id, num: q.qNum, text: q.text,
        options: q.options, correct: q.correct,
        userAnswer: userAns, topic: q.topic,
        subtopic: q.subtopic, year: q.year,
        explanation: q.explanation, difficulty: q.difficulty,
      };
    });
    subjectResults[sid] = { total: subjQs.length, attempted, correct, questions: questionDetails };
  });

  const result = {
    id: 'r_' + Date.now(), mode, subjectIds, subjectResults,
    totalAnswered: Object.keys(answers).length,
    totalQuestions: allQuestions.length,
    timeTaken: (timerH * 3600 + timerM * 60) - totalSeconds,
    date: new Date().toISOString(),
  };

  try { sessionStorage.setItem('utme_result', JSON.stringify(result)); } catch(e) {}

  if (saveToHistory) {
    try {
      const history = JSON.parse(localStorage.getItem('utme_history') || '[]');
      history.unshift(result);
      localStorage.setItem('utme_history', JSON.stringify(history.slice(0, 100)));
    } catch(e) {}
  }
  window.location.href = 'result.html';
}

function submitExam()  { buildResult(mode === 'practice'); }
function finishStudy() { buildResult(false); }

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
    const map = {'×':'*','÷':'/'};
    calcExpr += (map[val]||val); calcDisplay = calcExpr; calcJustEvaled = false;
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
  t.textContent = msg; t.classList.add('show');
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
  const q = allQuestions[currentQIndex];
  if (!q) return;
  if (e.key === '1') selectAnswer(q, 'A');
  if (e.key === '2') selectAnswer(q, 'B');
  if (e.key === '3') selectAnswer(q, 'C');
  if (e.key === '4') selectAnswer(q, 'D');
});

/* ================================================================
   DOMContentLoaded
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backBtn').addEventListener('click', () => {
    if (confirm('Leave? Your progress will be lost.')) {
      if (timerInterval) clearInterval(timerInterval);
      window.location.href = 'select-subjects.html';
    }
  });
  document.getElementById('prevBtn').addEventListener('click', () => goToQuestion(currentQIndex - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goToQuestion(currentQIndex + 1));
  document.getElementById('bookmarkBtn').addEventListener('click', toggleBookmark);
  document.getElementById('flagBtn').addEventListener('click', () => showToast('Question reported. Thank you!'));
  document.getElementById('calcBtn').addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.getElementById('calcOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });
  document.getElementById('speakerBtn').addEventListener('click', speakQuestion);
  document.getElementById('showAnswerBtn').addEventListener('click', () => {
    showExplanation = !showExplanation;
    renderQuestion();
  });
  document.getElementById('submitBtn').addEventListener('click', () => {
    if (mode === 'study') finishStudy();
    else openSubmitDialog();
  });
  document.getElementById('dialogCancel').addEventListener('click', closeSubmitDialog);
  document.getElementById('dialogOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('dialogOverlay')) closeSubmitDialog();
  });
  document.getElementById('dialogSubmit').addEventListener('click', () => {
    closeSubmitDialog();
    submitExam();
  });
  document.getElementById('answeredPill').addEventListener('click', openGrid);
  document.getElementById('gridCloseBtn').addEventListener('click', closeGrid);
  document.getElementById('gridOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('gridOverlay')) closeGrid();
  });

  loadAllQuestions();
});
