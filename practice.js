/* ============================================================
   UTMESchools v2 — practice.js
   No difficulty tag · Lekki Headmaster mixed into English
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';

/* URL PARAMS */
const urlP             = new URLSearchParams(window.location.search);
const subjectIds       = (urlP.get('subjects') || 'english').split(',');
const mode             = urlP.get('mode') || 'practice';
const timerH           = parseInt(urlP.get('h') || '2', 10);
const timerM           = parseInt(urlP.get('m') || '0', 10);
const shuffleQ         = urlP.get('shuffleQ') !== '0';
const shuffleO         = urlP.get('shuffleO') === '1';
const examType         = urlP.get('exam') || 'utme';
const filterLiterature = urlP.get('filter_literature') === '1';
const topicsParam      = urlP.get('topics') || '';
const subtopicsParam   = urlP.get('subtopics') || '';

/* ACCESS — Paywall disabled */
function getAccess() {
  return { isPaid: true, plan: 'jamb', freeLimit: 9999 };

  /* ORIGINAL — uncomment before launch:
  const isPaid  = localStorage.getItem('utme_is_paid') === 'true';
  const plan    = localStorage.getItem('utme_plan') || 'jamb';
  const expires = localStorage.getItem('utme_expires');
  const isExpired = expires && new Date(expires) < new Date();
  return { isPaid: isPaid && !isExpired, plan, freeLimit: 10 };
  */
}

/* FETCH QUESTIONS */
async function fetchQuestions(subjectId, year, count, topicParam) {
  try {
    const access = getAccess();
    const limit  = access.isPaid ? count : access.freeLimit;

    let url = `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.${subjectId}&exam_type=eq.${examType}&select=*&limit=${limit}`;
    if (year && year !== 'Random') url += `&year=eq.${year}`;

    const res = await fetch(url, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json'
      }
    });

    if (!res.ok) { console.error('Supabase fetch error:', res.status); return []; }

    let questions = await res.json();

    if (topicsParam) {
      const allowed = topicsParam.split('||');
      questions = questions.filter(q => allowed.includes(q.topic));
    }
    if (subtopicsParam) {
      const allowed = subtopicsParam.split('||');
      questions = questions.filter(q => allowed.includes(q.subtopic));
    }
    if (topicParam) {
      const allowed = topicParam.split('||');
      questions = questions.filter(q =>
        allowed.some(t => q.topic === t || (q.topic + ' : ' + q.subtopic) === t)
      );
    }
    if (filterLiterature && typeof LITERATURE_CONFIG !== 'undefined') {
      questions = questions.filter(q => {
        const text = ((q.topic || '') + ' ' + (q.subtopic || '') + ' ' + (q.passage || '')).toLowerCase();
        return LITERATURE_CONFIG.replaceWith.some(slug => text.includes(slug.replace(/-/g, ' ')))
            || text.includes('lekki')
            || text.includes('literature');
      });
    }

    return questions.map(q => ({
      id:                 String(q.id),
      subjectId:          q.subject_id,
      examType:           q.exam_type,
      year:               q.year,
      topic:              q.topic || '',
      subtopic:           q.subtopic || '',
      difficulty:         q.difficulty || 'Intermediate',
      text:               q.text,
      options:            [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean),
      correct:            q.correct,
      explanation:        q.explanation || '',
      svg_code:           q.svg_code || '',
      image_file:         q.image_file || '',
      passage:            q.passage || '',
      sectionInstruction: q.section_instruction || '',
    }));
  } catch(e) { console.error('Fetch error:', e); return []; }
}

/* FETCH LEKKI HEADMASTER QUESTIONS — used to mix into English */
async function fetchLekkiQuestions(count) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.lekki-headmaster&exam_type=eq.${examType}&select=*&limit=${count}`;
    const res = await fetch(url, {
      headers: {
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type':  'application/json'
      }
    });
    if (!res.ok) return [];
    const questions = await res.json();
    return questions.map(q => ({
      id:                 String(q.id),
      subjectId:          'english',
      sourceSubject:      'lekki-headmaster',
      examType:           q.exam_type,
      year:               q.year,
      topic:              'The Lekki Headmaster',
      subtopic:           'Novel',
      difficulty:         q.difficulty || 'Intermediate',
      text:               q.text,
      options:            [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean),
      correct:            q.correct,
      explanation:        q.explanation || '',
      svg_code:           q.svg_code || '',
      image_file:         q.image_file || '',
      passage:            q.passage || '',
      sectionInstruction: q.section_instruction || '',
    }));
  } catch(e) { console.error('Lekki fetch error:', e); return []; }
}

/* DEMO FALLBACK */
function getDemoQuestions(subjectId) {
  return [{
    id: 'demo_1', subjectId, year: 2025,
    topic: 'DEMO', subtopic: '', difficulty: 'Basic',
    text: 'This is a demo question. Questions are being loaded into the database.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 'A',
    explanation: 'Real questions from SdashAPI will appear here once the database is seeded.',
    svg_code: '', image_file: '', passage: '', sectionInstruction: ''
  }];
}

/* STATE */
let allQuestions    = [];
let currentQIndex   = 0;
let answers         = {};
let bookmarks       = {};
let showExplanation = false;

try { bookmarks = JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); } catch(e) {}

/* TIMER */
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
    if (totalSeconds <= 300)      pill.className = 'tb-timer danger';
    else if (totalSeconds <= 600) pill.className = 'tb-timer warn';
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      showToast('Time up! Submitting...');
      setTimeout(submitExam, 1500);
    }
  }, 1000);
}

/* SHUFFLE OPTIONS */
function shuffleQuestionOptions(q) {
  if (!q.options || q.options.length < 2) return q;
  const letters = ['A','B','C','D','E'];
  const correctIdx = letters.indexOf(q.correct);
  if (correctIdx === -1 || correctIdx >= q.options.length) return q;

  const pairs = q.options.map((text, i) => ({ text, original: i }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  const newCorrectIdx = pairs.findIndex(p => p.original === correctIdx);

  return {
    ...q,
    options: pairs.map(p => p.text),
    correct: letters[newCorrectIdx]
  };
}

/* LOAD ALL QUESTIONS — with Lekki Headmaster mixed into English */
async function loadAllQuestions() {
  showLoadingState(true);

  try {
    for (const sid of subjectIds) {
      const year       = urlP.get('year_'   + sid) || 'Random';
      const totalCount = parseInt(urlP.get('count_' + sid) || '40', 10);
      const topicParam = urlP.get('topics_' + sid) || '';

      let qs = [];
      let lekkiQs = [];

      if (sid === 'english') {
        /* English: fetch (total - 5) regular + 5 Lekki Headmaster = total */
        const regularCount = Math.max(totalCount - 5, 0);
        qs       = await fetchQuestions(sid, year, regularCount, topicParam);
        lekkiQs  = await fetchLekkiQuestions(5);
      } else {
        qs = await fetchQuestions(sid, year, totalCount, topicParam);
      }

      if (qs.length === 0 && lekkiQs.length === 0) {
        qs = getDemoQuestions(sid);
        showToast('Demo mode — no questions found for this subject');
      }

      /* Combine: regular + lekki (for English) */
      let combined = [...qs, ...lekkiQs];

      if (shuffleQ) combined.sort(() => Math.random() - 0.5);
      if (shuffleO) combined = combined.map(shuffleQuestionOptions);
      combined.forEach((q, i) => { q.qNum = allQuestions.length + i + 1; q.subjectId = sid; });
      allQuestions.push(...combined);
    }
  } catch(e) { console.error(e); }

  if (allQuestions.length === 0) allQuestions = getDemoQuestions(subjectIds[0]);

  if (mode === 'study') {
    document.getElementById('submitBtn').style.display = 'none';
  }

  const access = getAccess();
  if (!access.isPaid) showFreeNotice(access.freeLimit);

  showLoadingState(false);
  renderSubjectTabs();
  renderQuestion();
  startTimer();
}

function showFreeNotice(limit) {
  const banner = document.createElement('div');
  banner.style.cssText = 'background:#FFF4DC;border-bottom:1px solid #F0D58C;padding:10px 14px;font-size:13px;color:#A6760A;text-align:center;';
  banner.innerHTML = `You are on free mode (${limit} questions per subject). <a href="auth.html" style="color:var(--navy);font-weight:700;">Get full access →</a>`;
  document.body.insertBefore(banner, document.body.firstChild);
}

/* LOADING STATE */
function showLoadingState(loading) {
  const qCard = document.getElementById('qCard');
  if (!qCard) return;

  if (loading) {
    qCard.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:36px;margin-bottom:12px;">⏳</div>
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:6px;">Loading questions...</div>
        <div style="font-size:13px;color:var(--ink-soft);">Please wait</div>
      </div>`;
    const opts = document.getElementById('optionsList');
    if (opts) opts.innerHTML = '';
  } else {
    qCard.innerHTML = `
      <div class="q-tags"  id="qTags"></div>
      <div class="q-text"  id="qText">Loading question...</div>
      <div class="q-image" id="qImage" style="display:none;"></div>`;
  }
}

/* SUBJECT TABS */
function renderSubjectTabs() {
  const container = document.getElementById('subjTabs');
  if (!container) return;
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
                             }/* ================================================================
   RENDER QUESTION — difficulty tag removed
   ================================================================ */
function renderQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q) return;

  document.getElementById('qLabel').textContent = `Q ${currentQIndex + 1} / ${allQuestions.length}`;

  /* Tags — NO difficulty tag */
  const tagsEl = document.getElementById('qTags');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    if (q.topic) {
      const shownTopic = (typeof applyLiteratureReplacement === 'function')
        ? applyLiteratureReplacement(q.topic, examType)
        : q.topic;
      tagsEl.innerHTML += `<span class="q-tag topic">${shownTopic}</span>`;
    }
    if (q.year)     tagsEl.innerHTML += `<span class="q-tag year">📅 ${q.year}</span>`;
    if (q.examType) tagsEl.innerHTML += `<span class="q-tag">${q.examType.toUpperCase()}</span>`;
  }

  /* Section instruction (above question) */
  let instrEl = document.getElementById('qInstruction');
  if (!instrEl) {
    instrEl = document.createElement('div');
    instrEl.id = 'qInstruction';
    instrEl.style.cssText = 'font-size:12.5px;color:#5C6B82;line-height:1.5;margin-bottom:10px;padding:8px 12px;background:#F4F6FA;border-left:3px solid #8A94A6;border-radius:6px;display:none;';
    const qTextEl = document.getElementById('qText');
    if (qTextEl && qTextEl.parentNode) {
      qTextEl.parentNode.insertBefore(instrEl, qTextEl);
    }
  }
  if (q.sectionInstruction && q.sectionInstruction.trim()) {
    instrEl.textContent = q.sectionInstruction;
    instrEl.style.display = 'block';
  } else {
    instrEl.textContent = '';
    instrEl.style.display = 'none';
  }

  /* Question text */
  const qTextEl = document.getElementById('qText');
  if (qTextEl) {
    qTextEl.textContent = (typeof applyLiteratureReplacement === 'function')
      ? applyLiteratureReplacement(q.text, examType)
      : q.text;
  }

  /* Image / SVG */
  const imgEl = document.getElementById('qImage');
  if (imgEl) {
    if (q.svg_code) {
      imgEl.innerHTML = q.svg_code;
      imgEl.style.display = 'block';
    } else if (q.image_file) {
      imgEl.innerHTML = `<img src="images/${q.image_file}" alt="Diagram" style="max-width:100%;border-radius:8px;margin-top:8px;">`;
      imgEl.style.display = 'block';
    } else {
      imgEl.innerHTML = '';
      imgEl.style.display = 'none';
    }
  }

  /* Passage */
  const passCard = document.getElementById('passageBox');
  if (passCard) {
    if (q.passage && q.passage.trim()) {
      const passTextEl = document.getElementById('passageText');
      if (passTextEl) {
        passTextEl.textContent = (typeof applyLiteratureReplacement === 'function')
          ? applyLiteratureReplacement(q.passage, examType)
          : q.passage;
      }
      passCard.classList.add('show');
    } else {
      passCard.classList.remove('show');
    }
  }

  renderOptions(q);

  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;
  const bkBtn = document.getElementById('bookmarkBtn');
  if (bkBtn) bkBtn.style.color = bookmarks[q.id] ? 'var(--gold)' : '';

  /* Study mode */
  const studyWrap = document.getElementById('showAnswerWrap');
  const explanBox = document.getElementById('explanationBox');

  if (mode === 'study' && studyWrap) {
    studyWrap.classList.add('show');
    const saBtn = document.getElementById('showAnswerBtn');
    if (saBtn) saBtn.textContent = showExplanation ? '🙈 Hide Answer' : '👁️ Show Answer';
    if (showExplanation && explanBox) {
      explanBox.classList.add('show');
      const explText = document.getElementById('explanationText');
      if (explText) {
        explText.textContent = (typeof applyLiteratureReplacement === 'function')
          ? applyLiteratureReplacement(q.explanation || 'No explanation available.', examType)
          : (q.explanation || 'No explanation available.');
      }
    } else if (explanBox) {
      explanBox.classList.remove('show');
    }
  } else {
    if (studyWrap) studyWrap.classList.remove('show');
    if (explanBox) explanBox.classList.remove('show');
  }

  document.getElementById('answeredCount').textContent = Object.keys(answers).length;
  document.getElementById('totalCount').textContent    = allQuestions.length;

  updateSubjectTabs();
}

/* RENDER OPTIONS */
function renderOptions(q) {
  const list    = document.getElementById('optionsList');
  const letters = ['A','B','C','D','E'];
  const userAns = answers[q.id];

  if (!list) return;
  list.innerHTML = '';

  (q.options || []).forEach((opt, i) => {
    const letter = letters[i];
    const row    = document.createElement('div');
    row.className = 'option-btn';

    if (mode === 'study' && showExplanation) {
      if (letter === q.correct)    row.classList.add('correct');
      else if (letter === userAns) row.classList.add('wrong');
      else                         row.classList.add('dimmed');
    } else {
      if (userAns === letter) row.classList.add('selected');
    }

    const optText = (typeof applyLiteratureReplacement === 'function')
      ? applyLiteratureReplacement(opt, examType)
      : opt;

    row.innerHTML = `
      <div class="option-letter-box">${letter}</div>
      <div class="option-text">${optText}</div>`;

    row.addEventListener('click', () => selectAnswer(q, letter));
    list.appendChild(row);
  });
}

function selectAnswer(q, letter) {
  answers[q.id]   = letter;
  showExplanation = false;
  renderQuestion();
}

/* NAVIGATION */
function goToQuestion(index) {
  if (index < 0 || index >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex   = index;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* BOOKMARK */
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
  const bkBtn = document.getElementById('bookmarkBtn');
  if (bkBtn) bkBtn.style.color = bookmarks[q.id] ? 'var(--gold)' : '';
}

/* GRID */
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

/* SUBMIT */
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
    examType,
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

/* CALCULATOR */
let calcDisplay = '0', calcExpr = '', calcJustEvaled = false;
function openCalc()  { document.getElementById('calcOverlay').classList.add('open'); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }
function updateCalcDisplay() { document.getElementById('calcDisplay').textContent = calcDisplay; }
function calcPress(val) {
  if (val === 'C') { calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false; }
  else if (val === 'DEL') {
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

/* TOAST */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* TEXT TO SPEECH */
function speakQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q || !window.speechSynthesis) { showToast('Text-to-speech not supported'); return; }
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(q.text);
  utt.lang = 'en-NG';
  speechSynthesis.speak(utt);
}

/* KEYBOARD */
document.addEventListener('keydown', e => {
  const calcOv = document.getElementById('calcOverlay');
  if (calcOv && calcOv.classList.contains('open')) return;
  if (e.key === 'ArrowRight') goToQuestion(currentQIndex + 1);
  if (e.key === 'ArrowLeft')  goToQuestion(currentQIndex - 1);
  const q = allQuestions[currentQIndex];
  if (!q) return;
  if (e.key === '1') selectAnswer(q, 'A');
  if (e.key === '2') selectAnswer(q, 'B');
  if (e.key === '3') selectAnswer(q, 'C');
  if (e.key === '4') selectAnswer(q, 'D');
});

/* DOMContentLoaded */
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
  document.querySelectorAll('.calc-key').forEach(btn => {
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
