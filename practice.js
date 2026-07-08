/* ============================================================
   UTMESchools v2 — practice.js (PART 1)
   ============================================================ */

var params = new URLSearchParams(window.location.search);
var subjectIds = (params.get('subjects') || 'english').split(',');
var mode = params.get('mode') || 'practice';
var timerH = parseInt(params.get('h') || '2', 10);
var timerM = parseInt(params.get('m') || '0', 10);

var subjectConfig = {};
subjectIds.forEach(function(id) {
  subjectConfig[id] = {
    year: params.get('year_' + id) || 'Random',
    count: parseInt(params.get('count_' + id) || '40', 10)
  };
});

var ALL_SUBJECTS = [
  { id: 'english', name: 'English Language', icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF', max: 100 },
  { id: 'accounts', name: 'Accounts', icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'agriculture', name: 'Agriculture', icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'biology', name: 'Biology', icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'chemistry', name: 'Chemistry', icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'commerce', name: 'Commerce', icon: '🛒', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'computer', name: 'Computer Studies', icon: '💻', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'crk', name: 'CRK', icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'economics', name: 'Economics', icon: '📈', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'fineart', name: 'Fine Art', icon: '🎨', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'french', name: 'French', icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'geography', name: 'Geography', icon: '🌍', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'government', name: 'Government', icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'hausa', name: 'Hausa', icon: '📜', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'history', name: 'History', icon: '🏺', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'homeec', name: 'Home Economics', icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'igbo', name: 'Igbo', icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF', max: 60 },
  { id: 'irk', name: 'IRK', icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'literature', name: 'Literature', icon: '📚', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'littext', name: 'Literature Textbooks', icon: '📗', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'mathematics', name: 'Mathematics', icon: '📐', bg: '#FFF4DC', fg: '#A6760A', max: 60 },
  { id: 'music', name: 'Music', icon: '🎵', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'phe', name: 'PHE', icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58', max: 60 },
  { id: 'physics', name: 'Physics', icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B', max: 60 },
  { id: 'lekki', name: 'The Lekki Headmaster', icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF', max: 60 },
  { id: 'yoruba', name: 'Yoruba', icon: '🌺', bg: '#FFF4DC', fg: '#A6760A', max: 60 }
];

function getSubject(id) { return ALL_SUBJECTS.find(function(s) { return s.id === id; }); }

var PLACEHOLDER_QUESTIONS = [
  {
    id: 'q1', subjectId: 'english',
    text: 'Choose the word most nearly opposite in meaning to the underlined word: "The politician was known for his FRUGALITY in spending public funds."',
    options: ['A. Extravagance', 'B. Thriftiness', 'C. Prudence', 'D. Economy'],
    correct: 'A', topic: 'LEXIS AND STRUCTURE', subtopic: 'ANTONYMS', difficulty: 'Basic',
    explanation: 'Frugality means being economical or sparing with money. Its opposite is extravagance — spending money freely or wastefully. Thriftiness, prudence, and economy are synonyms of frugality, not opposites.'
  },
  {
    id: 'q2', subjectId: 'english',
    text: 'In the sentence "The boy WHO stole the book has been caught", the underlined word is a:',
    options: ['A. Relative pronoun', 'B. Demonstrative pronoun', 'C. Interrogative pronoun', 'D. Reflexive pronoun'],
    correct: 'A', topic: 'LEXIS AND STRUCTURE', subtopic: 'GRAMMAR', difficulty: 'Basic',
    explanation: '"Who" is a relative pronoun because it introduces a relative clause ("who stole the book") giving more information about "boy". Relative pronouns (who, whom, whose, which, that) connect clauses to nouns.'
  },
  {
    id: 'q3', subjectId: 'biology',
    text: 'Which of the following is NOT a function of the human skeleton?',
    options: ['A. Protection of internal organs', 'B. Production of red blood cells', 'C. Regulation of body temperature', 'D. Support of the body'],
    correct: 'C', topic: 'COORDINATION AND CONTROL', subtopic: 'SKELETAL SYSTEM', difficulty: 'Intermediate',
    explanation: 'The skeleton provides support, protects internal organs, and produces blood cells in bone marrow. Body temperature regulation is a function of the skin (sweating, vasodilation), not the skeleton.'
  },
  {
    id: 'q4', subjectId: 'mathematics',
    text: 'If log₂(x) = 5, what is the value of x?',
    options: ['A. 10', 'B. 25', 'C. 32', 'D. 64'],
    correct: 'C', topic: 'NUMBER AND NUMERATION', subtopic: 'LOGARITHMS', difficulty: 'Basic',
    explanation: 'If log₂(x) = 5, then x = 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. Remember: logₐ(b) = c means aᶜ = b.'
  },
  {
    id: 'q5', subjectId: 'mathematics',
    text: 'A man walks 3 km due North and then 4 km due East. How far is he from his starting point?',
    options: ['A. 5 km', 'B. 7 km', 'C. 12 km', 'D. 25 km'],
    correct: 'A', topic: 'GEOMETRY AND MENSURATION', subtopic: 'PYTHAGORAS THEOREM', difficulty: 'Basic',
    explanation: 'This forms a right-angled triangle with sides 3 km and 4 km. Using Pythagoras: distance² = 3² + 4² = 9 + 16 = 25. Distance = √25 = 5 km. Classic 3-4-5 triangle.'
  }
];

var allQuestions = [];
subjectIds.forEach(function(sid) {
  var cfg = subjectConfig[sid];
  var count = Math.min(cfg.count, 5);
  var subjQs = PLACEHOLDER_QUESTIONS.filter(function(q) { return q.subjectId === sid; });
  if (subjQs.length === 0) {
    for (var i = 0; i < Math.min(count, 3); i++) {
      var s = getSubject(sid);
      allQuestions.push({
        id: sid + '_q' + (i + 1), subjectId: sid,
        text: '[Sample] Placeholder question for ' + (s ? s.name : sid) + '. Real questions load from the database.',
        options: ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D'],
        correct: 'A', topic: 'GENERAL', subtopic: 'PLACEHOLDER', difficulty: 'Basic',
        explanation: 'This is a placeholder. Real explanations appear once questions are loaded from the database.'
      });
    }
  } else {
    allQuestions = allQuestions.concat(subjQs.slice(0, count));
  }
});

allQuestions.sort(function() { return Math.random() - 0.5; });

var currentQIndex = 0;
var answers = {};
var bookmarkedQs = new Set();
var showExplanation = false;
var timerInterval = null;
var timeRemaining = timerH * 3600 + timerM * 60;
var examSubmitted = false;
var startTime = Date.now();

function renderSubjectTabs() {
  var tabs = document.getElementById('subjectTabs');
  if (subjectIds.length <= 1) { tabs.style.display = 'none'; return; }
  tabs.style.display = 'flex';
  tabs.innerHTML = '';
  subjectIds.forEach(function(sid) {
    var s = getSubject(sid);
    var qCount = allQuestions.filter(function(q) { return q.subjectId === sid; }).length;
    var answered = allQuestions.filter(function(q, i) { return q.subjectId === sid && answers[i] !== undefined; }).length;
    var currentSubj = allQuestions[currentQIndex] ? allQuestions[currentQIndex].subjectId : null;
    var tab = document.createElement('button');
    tab.className = 'subject-tab' + (sid === currentSubj ? ' active' : '');
    tab.innerHTML = (s ? s.name : sid) + '<span class="tab-progress">' + answered + '/' + qCount + '</span>';
    tab.addEventListener('click', function() {
      var firstIdx = allQuestions.findIndex(function(q) { return q.subjectId === sid; });
      if (firstIdx !== -1) goToQuestion(firstIdx);
    });
    tabs.appendChild(tab);
  });
}

function renderQuestion() {
  var q = allQuestions[currentQIndex];
  if (!q) return;

  document.getElementById('qNum').textContent = currentQIndex + 1;
  document.getElementById('qTotal').textContent = allQuestions.length;
  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;

  document.getElementById('qTopicTag').textContent = q.topic || 'General';
  document.getElementById('qYearTag').textContent = subjectConfig[q.subjectId] ? subjectConfig[q.subjectId].year : 'Random';
  document.getElementById('qDiffTag').textContent = q.difficulty || 'Basic';
  document.getElementById('qText').textContent = q.text;

  var svgEl = document.getElementById('qSvg');
  if (q.svg) { svgEl.innerHTML = q.svg; svgEl.style.display = 'block'; }
  else { svgEl.style.display = 'none'; }

  var optsList = document.getElementById('optionsList');
  optsList.innerHTML = '';
  q.options.forEach(function(opt, idx) {
    var letter = String.fromCharCode(65 + idx);
    var isSelected = answers[currentQIndex] === letter;
    var isCorrect = q.correct === letter;
    var showResult = examSubmitted || (mode === 'study' && showExplanation);

    var row = document.createElement('div');
    row.className = 'option-row';

    if (showResult) {
      if (isCorrect) row.classList.add('correct');
      else if (isSelected && !isCorrect) row.classList.add('wrong');
      else row.classList.add('disabled');
    } else if (isSelected) {
      row.classList.add('selected');
    }

    row.innerHTML = '<div class="option-circle">' + letter + '</div><div class="option-text">' + opt.replace(/^[A-D]\.\s*/, '') + '</div>';

    if (!showResult) {
      row.addEventListener('click', function() { selectOption(letter); });
    }
    optsList.appendChild(row);
  });

  var exBox = document.getElementById('explanationBox');
  if (examSubmitted || (mode === 'study' && showExplanation)) {
    exBox.style.display = 'block';
    document.getElementById('exTopic').textContent = q.topic || 'General';
    document.getElementById('exSubtopic').textContent = q.subtopic || 'General';
    document.getElementById('exDiff').textContent = q.difficulty || 'Basic';
    document.getElementById('exText').textContent = q.explanation || 'No explanation available.';
  } else {
    exBox.style.display = 'none';
  }

  var studyActions = document.getElementById('studyActions');
  if (mode === 'study' && !examSubmitted) {
    studyActions.style.display = 'flex';
    document.getElementById('showAnswerBtn').textContent = showExplanation ? 'Hide Answer' : 'Show Answer';
  } else {
    studyActions.style.display = 'none';
  }

  var bmBtn = document.getElementById('bookmarkBtn');
  if (bookmarkedQs.has(currentQIndex)) {
    bmBtn.style.color = 'var(--gold)';
    bmBtn.style.borderColor = 'var(--gold)';
  } else {
    bmBtn.style.color = '';
    bmBtn.style.borderColor = '';
  }

  var s = getSubject(q.subjectId);
  document.getElementById('pageTitle').textContent = s ? s.name : 'Practice';

  renderSubjectTabs();
  document.getElementById('answeredCount').textContent = Object.keys(answers).length;
  document.getElementById('totalCount').textContent = allQuestions.length;
}

function selectOption(letter) {
  if (examSubmitted) return;
  answers[currentQIndex] = letter;
  renderQuestion();
}

function goToQuestion(idx) {
  if (idx < 0 || idx >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex = idx;
  renderQuestion();
}

function startTimer() {
  if (mode === 'study') return;
  var timerPill = document.getElementById('timerPill');
  timerPill.style.display = 'flex';
  updateTimerDisplay();

  timerInterval = setInterval(function() {
    timeRemaining--;
    if (timeRemaining <= 0) {
      timeRemaining = 0;
      clearInterval(timerInterval);
      submitExam(true);
    }
    updateTimerDisplay();
  }, 1000);
}

function updateTimerDisplay() {
  var h = Math.floor(timeRemaining / 3600);
  var m = Math.floor((timeRemaining % 3600) / 60);
  var s = timeRemaining % 60;
  document.getElementById('timerText').textContent =
    String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');

  var pill = document.getElementById('timerPill');
  pill.classList.remove('warning', 'danger');
  if (timeRemaining < 300) pill.classList.add('danger');
  else if (timeRemaining < 600) pill.classList.add('warning');
}

function renderGrid() {
  var body = document.getElementById('gridBody');
  body.innerHTML = '';

  subjectIds.forEach(function(sid) {
    var s = getSubject(sid);
    var label = document.createElement('div');
    label.className = 'grid-subject-label';
    label.textContent = s ? s.name : sid;
    body.appendChild(label);

    var tiles = document.createElement('div');
    tiles.className = 'grid-tiles';

    allQuestions.forEach(function(q, idx) {
      if (q.subjectId !== sid) return;
      var tile = document.createElement('button');
      tile.className = 'grid-tile';
      tile.textContent = idx + 1;
      if (answers[idx] !== undefined) tile.classList.add('answered');
      if (idx === currentQIndex) tile.classList.add('current');
      tile.addEventListener('click', function() { goToQuestion(idx); closeGrid(); });
      tiles.appendChild(tile);
    });
    body.appendChild(tiles);
  });
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

function openSubmitDialog() {
  var answered = Object.keys(answers).length;
  var total = allQuestions.length;
  document.getElementById('dialogText').textContent =
    'You have answered ' + answered + ' of ' + total + ' questions. Are you sure you want to submit?';
  document.getElementById('dialogOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeSubmitDialog() {
  document.getElementById('dialogOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function submitExam() {
  if (examSubmitted) return;
  examSubmitted = true;
  if (timerInterval) clearInterval(timerInterval);

  var timeTaken = Math.floor((Date.now() - startTime) / 1000);
  var totalScore = 0;
  var totalPossible = 0;
  var subjectScores = {};

  subjectIds.forEach(function(sid) {
    var subjQs = allQuestions.filter(function(q) { return q.subjectId === sid; });
    var correct = 0;
    subjQs.forEach(function(q) {
      var qIdx = allQuestions.indexOf(q);
      if (answers[qIdx] === q.correct) correct++;
    });
    subjectScores[sid] = { score: correct, possible: subjQs.length };
    totalScore += correct;
    totalPossible += subjQs.length;
  });

  var resultData = {
    mode: mode, subjects: subjectIds, subjectScores: subjectScores,
    totalScore: totalScore, totalPossible: totalPossible, timeTaken: timeTaken,
    questions: allQuestions.map(function(q, i) {
      return { id: q.id, subjectId: q.subjectId, text: q.text, options: q.options, correct: q.correct,
        topic: q.topic, subtopic: q.subtopic, difficulty: q.difficulty, explanation: q.explanation,
        userAnswer: answers[i] || null, isCorrect: answers[i] === q.correct };
    }),
    date: new Date().toISOString()
  };

  try {
    var history = JSON.parse(localStorage.getItem('utme_results') || '[]');
    history.unshift(resultData);
    localStorage.setItem('utme_results', JSON.stringify(history));
  } catch (e) {}

  sessionStorage.setItem('utme_result', JSON.stringify(resultData));
  window.location.href = 'results.html';
}

function toggleBookmark() {
  var q = allQuestions[currentQIndex];
  if (!q) return;

  try {
    var bookmarks = JSON.parse(localStorage.getItem('utme_bookmarks') || '[]');
    var existIdx = bookmarks.findIndex(function(b) { return b.id === q.id; });

    if (existIdx !== -1) {
      bookmarks.splice(existIdx, 1);
      bookmarkedQs.delete(currentQIndex);
      showToast('Bookmark removed');
    } else {
      var s = getSubject(q.subjectId);
      bookmarks.push({
        id: q.id,
        subject: q.subjectId,
        year: subjectConfig[q.subjectId] ? subjectConfig[q.subjectId].year : 'Random',
        yearLabel: subjectConfig[q.subjectId] ? subjectConfig[q.subjectId].year : 'Random',
        questionNum: currentQIndex + 1,
        questionText: q.text,
        options: {
          option_a: q.options[0] ? q.options[0].replace(/^A\.\s*/, '') : '',
          option_b: q.options[1] ? q.options[1].replace(/^B\.\s*/, '') : '',
          option_c: q.options[2] ? q.options[2].replace(/^C\.\s*/, '') : '',
          option_d: q.options[3] ? q.options[3].replace(/^D\.\s*/, '') : ''
        },
        correctOption: q.correct,
        date: new Date().toISOString()
      });
      bookmarkedQs.add(currentQIndex);
      showToast('Question bookmarked');
    }
    localStorage.setItem('utme_bookmarks', JSON.stringify(bookmarks));
    renderQuestion();
  } catch (e) { showToast('Could not save bookmark'); }
}

var calcDisplay = '0';
var calcExpr = '';
var calcJustEvaled = false;

function openCalc() { document.getElementById('calcOverlay').classList.add('open'); updateCalcDisplay(); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }
function updateCalcDisplay() { document.getElementById('calcDisplay').textContent = calcDisplay; }/* ============================================================
   UTMESchools v2 — practice.js (PART 2)
   ============================================================ */

function calcPress(val) {
  if (val === 'C') {
    calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false;
  } else if (val === 'DEL') {
    calcDisplay = calcDisplay.length > 1 ? calcDisplay.slice(0, -1) : '0';
    calcExpr = calcExpr.length > 1 ? calcExpr.slice(0, -1) : '';
  } else if (val === '=') {
    try {
      var safe = calcExpr.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.()%]/g, '');
      var result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay;
      calcJustEvaled = true;
    } catch (e) {
      calcDisplay = 'Error'; calcExpr = '';
    }
  } else if (['+', '-', '×', '÷', '%'].includes(val)) {
    var opMap = { '×': '*', '÷': '/' };
    var op = opMap[val] || val;
    calcExpr += op;
    calcDisplay = calcExpr;
    calcJustEvaled = false;
  } else {
    if (calcJustEvaled) { calcExpr = val; calcJustEvaled = false; }
    else { calcExpr = (calcExpr === '0' || calcExpr === '') ? val : calcExpr + val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

var toastTimer = null;
function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2200);
}

function speakQuestion() {
  var q = allQuestions[currentQIndex];
  if (!q || !window.speechSynthesis) { showToast('Text-to-speech not supported'); return; }
  speechSynthesis.cancel();
  var utt = new SpeechSynthesisUtterance(q.text);
  utt.lang = 'en-NG';
  speechSynthesis.speak(utt);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('prevBtn').addEventListener('click', function() { goToQuestion(currentQIndex - 1); });
  document.getElementById('nextBtn').addEventListener('click', function() { goToQuestion(currentQIndex + 1); });

  document.getElementById('backBtn').addEventListener('click', function() {
    if (confirm('Leave practice? Your progress will be lost.')) {
      if (timerInterval) clearInterval(timerInterval);
      window.location.href = 'select-subjects.html';
    }
  });

  document.getElementById('bookmarkBtn').addEventListener('click', toggleBookmark);
  document.getElementById('flagBtn').addEventListener('click', function() { showToast('Question reported. Thank you!'); });

  document.getElementById('calcBtn').addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.querySelectorAll('.calc-btn').forEach(function(btn) {
    btn.addEventListener('click', function() { calcPress(btn.dataset.val); });
  });

  var speakerBtn = document.getElementById('speakerBtn');
  if (speakerBtn) speakerBtn.addEventListener('click', speakQuestion);

  document.getElementById('showAnswerBtn').addEventListener('click', function() {
    showExplanation = !showExplanation;
    renderQuestion();
  });

  document.getElementById('answeredPill').addEventListener('click', openGrid);
  document.getElementById('gridCloseBtn').addEventListener('click', closeGrid);
  document.getElementById('gridOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('gridOverlay')) closeGrid();
  });

  document.getElementById('submitBtn').addEventListener('click', openSubmitDialog);
  document.getElementById('dialogCancel').addEventListener('click', closeSubmitDialog);
  document.getElementById('dialogSubmit').addEventListener('click', function() {
    closeSubmitDialog();
    submitExam();
  });
  document.getElementById('dialogOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('dialogOverlay')) closeSubmitDialog();
  });

  document.getElementById('calcOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });

  renderQuestion();
  startTimer();
});
