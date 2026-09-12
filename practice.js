/* ============================================================
   UTMESchools — practice.js
   Supabase-backed student practice engine
   Questions come from the UTMESchools Render backend.
   ============================================================ */

/* ================================================================
   MODE RULES

   practice : no answers shown during session.
              Submit → result saved.

   mock     : no answers shown during session.
              Submit → analysis only.

   study    : click "Show Answer" to reveal.
              No countdown. Can finish without submission.

   All modes:
   - answers can be changed freely
   - questions come from Supabase through our backend
   - SdashAPI is NOT called from the student's browser
   ================================================================ */

const API_BASE = 'https://utmeschools-ng.onrender.com';

const urlP       = new URLSearchParams(window.location.search);
const subjectIds = (urlP.get('subjects') || 'english')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const mode     = urlP.get('mode') || 'practice';
const timerH   = parseInt(urlP.get('h') || '2', 10);
const timerM   = parseInt(urlP.get('m') || '0', 10);
const shuffleQ = urlP.get('shuffleQ') !== '0';

/* ================================================================
   API HELPER
   ================================================================ */

async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    let details = '';

    try {
      const errorData = await response.json();
      details = errorData.error || errorData.details || '';
    } catch (e) {
      try {
        details = await response.text();
      } catch (ignore) {}
    }

    throw new Error(
      details || `Request failed with status ${response.status}`
    );
  }

  return response.json();
}

/* ================================================================
   FETCH QUESTIONS FROM SUPABASE BACKEND

   The browser talks only to our Render backend.

   Render → Supabase

   This means:
   - students do not receive the SdashAPI key
   - questions come from our own database
   - topic/subtopic data can be used by Coach Mode
   - custom AI explanations can be used later
   ================================================================ */

async function fetchQuestionsFromDatabase(
  subjectId,
  year,
  count,
  topicsParam
) {
  try {
    const params = new URLSearchParams();

    params.set('subject', subjectId);
    params.set(
      'limit',
      String(Math.min(Math.max(count, 1), 100))
    );
    params.set('shuffle', '1');

    if (year && year !== 'Random') {
      params.set('year', year);
    }

    const result = await apiGet(
      `/api/questions?${params.toString()}`
    );

    let questions = Array.isArray(result.data)
      ? result.data
      : [];

    /*
      Topic filtering is performed here as a second layer.

      The backend already supports topic/subtopic filters,
      but keeping this local filtering makes the frontend
      compatible with the exact topic-selection format
      currently produced by select-subjects.js.
    */
    if (topicsParam && questions.length) {
      const allowed = topicsParam
        .split('||')
        .map(item => item.trim())
        .filter(Boolean);

      const hasTopicData = questions.some(
        q => q.topic || q.subtopic
      );

      if (hasTopicData && allowed.length) {
        questions = questions.filter(q =>
          allowed.some(topic => {
            return (
              q.topic === topic ||
              `${q.topic || ''} : ${q.subtopic || ''}` === topic ||
              q.subtopic === topic
            );
          })
        );
      }
    }

    /*
      Convert the database format into the format used
      throughout this practice engine.
    */
    return questions.map(q => {
      const rawOptions = q.options || {};

      let options = [];

      if (Array.isArray(rawOptions)) {
        options = rawOptions;
      } else {
        options = [
          rawOptions.a,
          rawOptions.b,
          rawOptions.c,
          rawOptions.d,
          rawOptions.e
        ].filter(
          value =>
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ''
        );
      }

      let correct = String(q.answer || '')
        .trim()
        .toUpperCase();

      /*
        Some stored answers may arrive as text such as
        "Option A" or "(A)". Normalize them so the
        practice engine consistently uses A/B/C/D/E.
      */
      const answerMatch = correct.match(/[A-E]/);

      if (answerMatch) {
        correct = answerMatch[0];
      }

      return {
        id: String(q.id),
        subjectId,

        year:
          q.exam_year ||
          year ||
          '',

        topic:
          q.topic ||
          '',

        subtopic:
          q.subtopic ||
          '',

        difficulty:
          q.difficulty ||
          'Intermediate',

        text:
          q.question ||
          '',

        options,

        correct,

        explanation:
          q.ai_explanation ||
          q.explanation ||
          'No explanation available yet.',

        image_url:
          q.image_url ||
          '',

        passage:
          q.passage ||
          q.section ||
          '',

        syllabus_objective:
          q.syllabus_objective ||
          '',

        source:
          q.source ||
          'Supabase'
      };
    });

  } catch (error) {
    console.error(
      `Error loading ${subjectId} from UTMESchools backend:`,
      error
    );

    return [];
  }
}

/* ================================================================
   DEMO QUESTION

   Used only when the database currently contains no questions
   for the requested subject/year.

   This keeps the practice page functional while the database
   is still being populated.
   ================================================================ */

function getDemoQuestions(subjectId) {
  return [
    {
      id: `demo_${subjectId}_1`,
      subjectId,
      year: 2024,
      topic: 'DEMO',
      subtopic: '',
      difficulty: 'Basic',

      text:
        'This is a temporary demo question. Real JAMB past questions will appear here when they are available in the UTMESchools database.',

      options: [
        'Option A',
        'Option B',
        'Option C',
        'Option D'
      ],

      correct: 'A',

      explanation:
        'This is only a temporary demo question. Real questions will use explanations stored in the UTMESchools database.',

      image_url: '',
      passage: '',
      syllabus_objective: '',
      source: 'Demo'
    }
  ];
}

/* ================================================================
   STATE
   ================================================================ */

let allQuestions  = [];
let currentQIndex = 0;
let answers       = {};
let bookmarks     = {};
let showExplanation = false;

/*
  Free preview limit.

  This is enforced in the frontend for the current product
  experience. Paid access can later be enforced server-side
  when authentication/payment protection is completed.
*/
const FREE_LIMIT = 5;

/* ================================================================
   LOAD LOCAL BOOKMARKS

   Local bookmarks are retained for compatibility with the
   existing app. Backend bookmark syncing will be connected
   as authenticated user accounts are finalized.
   ================================================================ */

try {
  bookmarks = JSON.parse(
    localStorage.getItem('utme_bookmarks') || '{}'
  );
} catch (e) {
  bookmarks = {};
}

/* ================================================================
   TIMER
   ================================================================ */

let totalSeconds =
  (Math.max(timerH, 0) * 3600) +
  (Math.max(timerM, 0) * 60);

let timerInterval = null;

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);

  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const sec = safeSeconds % 60;

  return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function startTimer() {
  if (mode === 'study') {
    const timerPill = document.getElementById('timerPill');

    if (timerPill) {
      timerPill.style.display = 'none';
    }

    return;
  }

  const pill = document.getElementById('timerPill');

  if (!pill) return;

  pill.textContent = formatTime(totalSeconds);

  timerInterval = setInterval(() => {
    totalSeconds--;

    pill.textContent = formatTime(totalSeconds);

    if (totalSeconds <= 300) {
      pill.className = 'timer-pill danger';
    } else if (totalSeconds <= 600) {
      pill.className = 'timer-pill warn';
    }

    if (totalSeconds <= 0) {
      clearInterval(timerInterval);

      showToast('Time up! Submitting...');

      setTimeout(() => {
        submitExam();
      }, 1500);
    }
  }, 1000);
}

/* ================================================================
   LOAD ALL QUESTIONS
   ================================================================ */

async function loadAllQuestions() {
  showLoadingState(true);

  try {
    const user = JSON.parse(
      localStorage.getItem('utme_user') || 'null'
    );

    const hasPaid = Boolean(
      user &&
      (
        user.has_paid === true ||
        user.has_paid === 'true' ||
        user.is_paid === true
      )
    );

    /*
      Load each selected subject separately so that:
      - each subject keeps its own year
      - each subject keeps its own question count
      - each subject keeps its own topic selection
    */
    for (const sid of subjectIds) {
      const year =
        urlP.get(`year_${sid}`) ||
        'Random';

      const count =
        parseInt(
          urlP.get(`count_${sid}`) || '40',
          10
        );

      const topicParam =
        urlP.get(`topics_${sid}`) ||
        '';

      /*
        Free users currently receive the free preview amount.
        Paid users receive the requested amount.
      */
      const requestedCount = hasPaid
        ? Math.min(Math.max(count, 1), 100)
        : Math.min(
            Math.max(count, 1),
            FREE_LIMIT
          );

      let qs =
        await fetchQuestionsFromDatabase(
          sid,
          year,
          requestedCount,
          topicParam
        );

      /*
        If Supabase currently has no questions for this
        selection, keep the interface usable with a demo.
      */
      if (qs.length === 0) {
        qs = getDemoQuestions(sid);

        showToast(
          'No questions are available for this selection yet.'
        );
      }

      if (!hasPaid) {
        qs = qs.slice(0, FREE_LIMIT);
      }

      if (shuffleQ) {
        qs.sort(() => Math.random() - 0.5);
      }

      qs.forEach((q, i) => {
        q.qNum =
          allQuestions.length + i + 1;

        q.subjectId = sid;
      });

      allQuestions.push(...qs);
    }

  } catch (error) {
    console.error(
      'loadAllQuestions error:',
      error
    );
  }

  if (allQuestions.length === 0) {
    allQuestions =
      getDemoQuestions(subjectIds[0] || 'english');
  }

  /* Hide submit button in study mode */
  if (mode === 'study') {
    const submitBtn =
      document.getElementById('submitBtn');

    if (submitBtn) {
      submitBtn.style.display = 'none';
    }
  }

  showLoadingState(false);

  renderSubjectTabs();
  renderQuestion();
  startTimer();
}

/* ================================================================
   LOADING STATE
   ================================================================ */

function showLoadingState(loading) {
  const qCard =
    document.getElementById('qCard');

  if (!qCard) return;

  if (loading) {
    qCard.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:32px;margin-bottom:12px;">⏳</div>

        <div
          style="
            font-family:var(--font-display);
            font-size:16px;
            font-weight:700;
            color:var(--navy);
            margin-bottom:6px;
          "
        >
          Loading questions...
        </div>

        <div
          style="
            font-size:13px;
            color:var(--ink-soft);
          "
        >
          Please wait
        </div>
      </div>
    `;

    const optionsList =
      document.getElementById('optionsList');

    if (optionsList) {
      optionsList.innerHTML = '';
    }
  }
}

/* ================================================================
   SUBJECT TABS
   ================================================================ */

function renderSubjectTabs() {
  const container =
    document.getElementById('subjTabs');

  if (!container) return;

  container.innerHTML = '';

  if (subjectIds.length <= 1) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';

  subjectIds.forEach(sid => {
    const subjQs =
      allQuestions.filter(
        q => q.subjectId === sid
      );

    const tab =
      document.createElement('div');

    tab.className = 'subj-tab';

    tab.dataset.subject = sid;

    const displayName =
      sid.charAt(0).toUpperCase() +
      sid.slice(1);

    tab.innerHTML =
      `${displayName} <span class="subj-tab-count">0/${subjQs.length}</span>`;

    tab.addEventListener(
      'click',
      () => {
        const first =
          allQuestions.findIndex(
            q => q.subjectId === sid
          );

        if (first >= 0) {
          goToQuestion(first);
        }
      }
    );

    container.appendChild(tab);
  });

  updateSubjectTabs();
}

function updateSubjectTabs() {
  const current =
    allQuestions[currentQIndex]?.subjectId;

  document
    .querySelectorAll('.subj-tab')
    .forEach(tab => {
      tab.classList.toggle(
        'active',
        tab.dataset.subject === current
      );

      const sid =
        tab.dataset.subject;

      const subjQs =
        allQuestions.filter(
          q => q.subjectId === sid
        );

      const ans =
        subjQs.filter(
          q => answers[q.id]
        ).length;

      const el =
        tab.querySelector(
          '.subj-tab-count'
        );

      if (el) {
        el.textContent =
          `${ans}/${subjQs.length}`;
      }
    });
}

/* ================================================================
   RENDER QUESTION
   ================================================================ */

function renderQuestion() {
  const q =
    allQuestions[currentQIndex];

  if (!q) return;

  const qCard =
    document.getElementById('qCard');

  if (!qCard) return;

  if (!qCard.querySelector('#qMeta')) {
    qCard.innerHTML = `
      <div class="q-meta" id="qMeta"></div>
      <div class="q-text" id="qText"></div>
      <div class="q-svg" id="qSvg"></div>
    `;
  }

  const qLabel =
    document.getElementById('qLabel');

  if (qLabel) {
    qLabel.textContent =
      `Q ${currentQIndex + 1} / ${allQuestions.length}`;
  }

  const metaEl =
    document.getElementById('qMeta');

  if (metaEl) {
    metaEl.innerHTML = '';

    if (q.topic) {
      metaEl.innerHTML +=
        `<span class="q-meta-tag">${q.topic}</span>`;
    }

    if (q.year) {
      metaEl.innerHTML +=
        `<span class="q-meta-tag">📅 ${q.year}</span>`;
    }

    if (q.difficulty) {
      metaEl.innerHTML +=
        `<span class="q-meta-tag">${q.difficulty}</span>`;
    }
  }

  const qText =
    document.getElementById('qText');

  if (qText) {
    qText.textContent = q.text;
  }

  const svgEl =
    document.getElementById('qSvg');

  if (svgEl) {
    svgEl.innerHTML = '';

    if (q.image_url) {
      const img =
        document.createElement('img');

      img.src = q.image_url;

      img.alt =
        'Question diagram';

      img.style.maxWidth =
        '100%';

      img.style.borderRadius =
        '8px';

      img.style.marginTop =
        '8px';

      img.loading =
        'lazy';

      svgEl.appendChild(img);
    }
  }

  /* Passage */
  const passCard =
    document.getElementById('passageCard');

  const passageText =
    document.getElementById('passageText');

  if (passCard && passageText) {
    if (q.passage) {
      passageText.textContent =
        q.passage;

      passCard.classList.add('visible');
    } else {
      passCard.classList.remove('visible');
    }
  }

  renderOptions(q);

  const prevBtn =
    document.getElementById('prevBtn');

  const nextBtn =
    document.getElementById('nextBtn');

  if (prevBtn) {
    prevBtn.disabled =
      currentQIndex === 0;
  }

  if (nextBtn) {
    nextBtn.disabled =
      currentQIndex ===
      allQuestions.length - 1;
  }

  const bookmarkBtn =
    document.getElementById('bookmarkBtn');

  if (bookmarkBtn) {
    bookmarkBtn.style.color =
      bookmarks[q.id]
        ? 'var(--gold)'
        : '';
  }

  const studyActions =
    document.getElementById('studyActions');

  const explanBox =
    document.getElementById('explanationBox');

  if (mode === 'study') {
    if (studyActions) {
      studyActions.classList.add('visible');
    }

    const showAnswerBtn =
      document.getElementById(
        'showAnswerBtn'
      );

    if (showAnswerBtn) {
      showAnswerBtn.textContent =
        showExplanation
          ? '🙈 Hide Answer'
          : '👁 Show Answer';
    }

    if (showExplanation) {
      if (explanBox) {
        explanBox.classList.add('visible');
      }

      const explanationText =
        document.getElementById(
          'explanationText'
        );

      if (explanationText) {
        explanationText.textContent =
          q.explanation ||
          'No explanation available yet.';
      }
    } else {
      if (explanBox) {
        explanBox.classList.remove('visible');
      }
    }

  } else {
    /* Practice and Mock never reveal answers during session */

    if (studyActions) {
      studyActions.classList.remove('visible');
    }

    if (explanBox) {
      explanBox.classList.remove('visible');
    }
  }

  const answeredCount =
    document.getElementById(
      'answeredCount'
    );

  const totalCount =
    document.getElementById(
      'totalCount'
    );

  if (answeredCount) {
    answeredCount.textContent =
      Object.keys(answers).length;
  }

  if (totalCount) {
    totalCount.textContent =
      allQuestions.length;
  }

  updateSubjectTabs();
}

/* ================================================================
   RENDER OPTIONS
   ================================================================ */

function renderOptions(q) {
  const list =
    document.getElementById(
      'optionsList'
    );

  if (!list) return;

  const letters =
    ['A', 'B', 'C', 'D', 'E'];

  const userAns =
    answers[q.id];

  list.innerHTML = '';

  (q.options || []).forEach(
    (opt, i) => {
      const letter =
        letters[i];

      if (!letter) return;

      const row =
        document.createElement('div');

      row.className =
        'option-row';

      if (
        mode === 'study' &&
        showExplanation
      ) {
        if (
          letter === q.correct
        ) {
          row.classList.add(
            'correct'
          );
        } else if (
          letter === userAns
        ) {
          row.classList.add(
            'wrong'
          );
        } else {
          row.classList.add(
            'dimmed'
          );
        }
      } else {
        if (
          userAns === letter
        ) {
          row.classList.add(
            'selected'
          );
        }
      }

      row.innerHTML = `
        <div class="option-letter">${letter}</div>
        <div class="option-text"></div>
      `;

      const optionText =
        row.querySelector(
          '.option-text'
        );

      if (optionText) {
        optionText.textContent =
          String(opt);
         }

      row.addEventListener(
        'click',
        () => selectAnswer(
          q,
          letter
        )
      );

      list.appendChild(row);
    }
  );
}
/* ================================================================
   SELECT ANSWER
   ================================================================ */
function selectAnswer(q, letter) {
  if (currentMode === 'study' && showExplanation) {
    return;
  }

  answers[q.id] = letter;

  renderQuestion();

  updateAnsweredCount();
  renderQuestionGrid();
}


/* ================================================================
   NAVIGATION
   ================================================================ */
function goToQuestion(index) {
  if (index < 0 || index >= allQuestions.length) {
    return;
  }

  currentQIndex = index;
  showExplanation = false;

  renderQuestion();
  updateAnsweredCount();
  renderQuestionGrid();
  updateNavigationButtons();
}


function nextQuestion() {
  if (currentQIndex < allQuestions.length - 1) {
    goToQuestion(currentQIndex + 1);
  }
}


function previousQuestion() {
  if (currentQIndex > 0) {
    goToQuestion(currentQIndex - 1);
  }
}


/* ================================================================
   STUDY MODE — SHOW ANSWER
   ================================================================ */
function toggleStudyAnswer() {
  if (currentMode !== 'study') {
    return;
  }

  showExplanation = !showExplanation;

  renderQuestion();
}


/* ================================================================
   BOOKMARK
   ================================================================ */
function toggleBookmark() {
  const q = allQuestions[currentQIndex];

  if (!q) {
    return;
  }

  const questionId = String(q.id);

  bookmarks[questionId] = !bookmarks[questionId];

  try {
    localStorage.setItem(
      'utme_bookmarks',
      JSON.stringify(bookmarks)
    );
  } catch (e) {
    console.warn('Could not save bookmark:', e);
  }

  updateBookmarkButton();
  showToast(
    bookmarks[questionId]
      ? 'Question bookmarked'
      : 'Bookmark removed'
  );
}


function updateBookmarkButton() {
  const btn = document.getElementById('bookmarkBtn');

  if (!btn) {
    return;
  }

  const q = allQuestions[currentQIndex];

  if (!q) {
    btn.classList.remove('active');
    return;
  }

  const isBookmarked = !!bookmarks[String(q.id)];

  btn.classList.toggle(
    'active',
    isBookmarked
  );

  btn.title = isBookmarked
    ? 'Remove bookmark'
    : 'Bookmark';
}


/* ================================================================
   QUESTION GRID
   ================================================================ */
function openQuestionGrid() {
  const overlay = document.getElementById('gridOverlay');

  if (!overlay) {
    return;
  }

  renderQuestionGrid();

  overlay.classList.add('open');
}


function closeQuestionGrid() {
  const overlay = document.getElementById('gridOverlay');

  if (!overlay) {
    return;
  }

  overlay.classList.remove('open');
}


function renderQuestionGrid() {
  const grid = document.getElementById('gridNums');

  if (!grid) {
    return;
  }

  grid.innerHTML = '';

  allQuestions.forEach((q, index) => {
    const button = document.createElement('button');

    button.type = 'button';
    button.className = 'grid-num';

    if (answers[q.id]) {
      button.classList.add('answered');
    }

    if (index === currentQIndex) {
      button.classList.add('current');
    }

    button.textContent = String(index + 1);

    button.addEventListener(
      'click',
      () => {
        closeQuestionGrid();
        goToQuestion(index);
      }
    );

    grid.appendChild(button);
  });
}


function updateAnsweredCount() {
  const answeredCount =
    document.getElementById('answeredCount');

  const totalCount =
    document.getElementById('totalCount');

  if (answeredCount) {
    answeredCount.textContent =
      Object.keys(answers).length;
  }

  if (totalCount) {
    totalCount.textContent =
      allQuestions.length;
  }
}


/* ================================================================
   SUBMIT
   ================================================================ */
function submitExam() {
  if (!allQuestions.length) {
    showToast('No questions available.');
    return;
  }

  const unanswered =
    allQuestions.filter(
      q => !answers[q.id]
    ).length;

  if (unanswered > 0) {
    openSubmitDialog(unanswered);
    return;
  }

  openSubmitDialog(0);
}


function openSubmitDialog(unanswered = 0) {
  const overlay =
    document.getElementById('dialogOverlay');

  const body =
    document.getElementById('dialogBody');

  if (!overlay) {
    return;
  }

  if (body) {
    if (unanswered > 0) {
      body.textContent =
        `You have ${unanswered} unanswered ` +
        `${unanswered === 1 ? 'question' : 'questions'}. ` +
        `Are you sure you want to submit?`;
    } else {
      body.textContent =
        'Are you sure you want to submit and see your results?';
    }
  }

  overlay.classList.add('open');
}


function closeSubmitDialog() {
  const overlay =
    document.getElementById('dialogOverlay');

  if (!overlay) {
    return;
  }

  overlay.classList.remove('open');
}


function finishExam() {
  closeSubmitDialog();

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  buildResult(true);
}


/* ================================================================
   BUILD RESULT
   ================================================================ */
function buildResult(saveToHistory = true) {
  const subjectResults = {};

  allQuestions.forEach(q => {
    const subject =
      q.subjectId ||
      q.subject_slug ||
      'unknown';

    if (!subjectResults[subject]) {
      subjectResults[subject] = {
        subjectId: subject,
        total: 0,
        answered: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0,
        topics: {}
      };
    }

    const result =
      subjectResults[subject];

    result.total += 1;

    const selected =
      answers[q.id] || '';

    if (!selected) {
      result.unanswered += 1;
    } else {
      result.answered += 1;

      if (
        selected.toUpperCase() ===
        String(q.correct || '').toUpperCase()
      ) {
        result.correct += 1;
      } else {
        result.wrong += 1;
      }
    }

    const topic =
      q.topic ||
      'Unclassified';

    const subtopic =
      q.subtopic ||
      '';

    const topicKey =
      subtopic
        ? `${topic} : ${subtopic}`
        : topic;

    if (!result.topics[topicKey]) {
      result.topics[topicKey] = {
        topic,
        subtopic,
        total: 0,
        answered: 0,
        correct: 0,
        wrong: 0,
        unanswered: 0
      };
    }

    const topicResult =
      result.topics[topicKey];

    topicResult.total += 1;

    if (!selected) {
      topicResult.unanswered += 1;
    } else {
      topicResult.answered += 1;

      if (
        selected.toUpperCase() ===
        String(q.correct || '').toUpperCase()
      ) {
        topicResult.correct += 1;
      } else {
        topicResult.wrong += 1;
      }
    }
  });


  let totalCorrect = 0;
  let totalAnswered = 0;
  let totalQuestions = allQuestions.length;

  Object.values(subjectResults).forEach(result => {
    totalCorrect += result.correct;
    totalAnswered += result.answered;
  });


  const elapsedSeconds =
    Math.max(
      0,
      Math.floor(
        (Date.now() - sessionStartedAt) / 1000
      )
    );


  const resultData = {
    mode: currentMode,
    subjects: subjectResults,
    totalQuestions,
    totalAnswered,
    totalCorrect,
    totalWrong:
      totalAnswered - totalCorrect,
    totalUnanswered:
      totalQuestions - totalAnswered,
    scorePercent:
      totalQuestions
        ? Math.round(
            (totalCorrect / totalQuestions) * 100
          )
        : 0,
    timeTakenSeconds: elapsedSeconds,
    questions: allQuestions.map(q => ({
      id: q.id,
      subjectId: q.subjectId,
      year: q.year,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options,
      correct: q.correct,
      selected: answers[q.id] || '',
      explanation: q.explanation || '',
      passage: q.passage || '',
      image_url: q.image_url || '',
      svg_code: q.svg_code || ''
    })),
    createdAt:
      new Date().toISOString()
  };


  try {
    sessionStorage.setItem(
      'utme_result',
      JSON.stringify(resultData)
    );

    if (saveToHistory) {
      const history =
        JSON.parse(
          localStorage.getItem('utme_history') || '[]'
        );

      history.unshift(resultData);

      localStorage.setItem(
        'utme_history',
        JSON.stringify(history.slice(0, 50))
      );
    }
  } catch (e) {
    console.warn(
      'Could not save result:',
      e
    );
  }


  window.location.href =
    'result.html';
}


/* ================================================================
   CALCULATOR
   ================================================================ */
let calculatorExpression = '';


function openCalculator() {
  const overlay =
    document.getElementById('calcOverlay');

  if (!overlay) {
    return;
  }

  overlay.classList.add('open');
}


function closeCalculator() {
  const overlay =
    document.getElementById('calcOverlay');

  if (!overlay) {
    return;
  }

  overlay.classList.remove('open');
}


function updateCalculatorDisplay() {
  const display =
    document.getElementById('calcDisplay');

  if (!display) {
    return;
  }

  display.textContent =
    calculatorExpression || '0';
}


function calculateExpression() {
  if (!calculatorExpression) {
    return;
  }

  try {
    let expression =
      calculatorExpression
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/√/g, 'Math.sqrt');

    if (
      !/^[0-9+\-*/().%\sMathsqrt]+$/.test(
        expression
      )
    ) {
      throw new Error('Invalid expression');
    }

    const value =
      Function(
        `"use strict"; return (${expression})`
      )();

    if (
      typeof value !== 'number' ||
      !Number.isFinite(value)
    ) {
      throw new Error('Invalid result');
    }

    calculatorExpression =
      String(
        Math.round(value * 100000000) /
        100000000
      );

    updateCalculatorDisplay();
  } catch (e) {
    calculatorExpression = '';
    updateCalculatorDisplay();
    showToast('Invalid calculation');
  }
}


function handleCalculatorInput(value) {
  if (value === 'C') {
    calculatorExpression = '';
    updateCalculatorDisplay();
    return;
  }

  if (value === 'DEL') {
    calculatorExpression =
      calculatorExpression.slice(0, -1);

    updateCalculatorDisplay();
    return;
  }

  if (value === '=') {
    calculateExpression();
    return;
  }

  if (value === '√') {
    calculatorExpression += '√(';
    updateCalculatorDisplay();
    return;
  }

  if (value === '%') {
    calculatorExpression += '/100';
    updateCalculatorDisplay();
    return;
  }

  calculatorExpression += value;

  updateCalculatorDisplay();
}


/* ================================================================
   TOAST
   ================================================================ */
let toastTimeout = null;


function showToast(message) {
  const toast =
    document.getElementById('toast');

  if (!toast) {
    return;
  }

  toast.textContent =
    message;

  toast.classList.add('show');

  clearTimeout(toastTimeout);

  toastTimeout =
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
}


/* ================================================================
   TEXT TO SPEECH
   ================================================================ */
function speakCurrentQuestion() {
  if (!('speechSynthesis' in window)) {
    showToast(
      'Text-to-speech is not supported here.'
    );
    return;
  }

  const q =
    allQuestions[currentQIndex];

  if (!q) {
    return;
  }

  window.speechSynthesis.cancel();

  const text = [
    q.text,
    ...(q.options || []).map(
      (option, index) =>
        `${String.fromCharCode(65 + index)}. ${option}`
    )
  ].join('. ');

  const utterance =
    new SpeechSynthesisUtterance(text);

  utterance.rate = 0.9;

  window.speechSynthesis.speak(
    utterance
  );
}


/* ================================================================
   KEYBOARD SHORTCUTS
   ================================================================ */
function handleKeyboardShortcuts(event) {
  if (
    event.target &&
    (
      event.target.tagName === 'INPUT' ||
      event.target.tagName === 'TEXTAREA'
    )
  ) {
    return;
  }

  const key =
    event.key.toLowerCase();

  if (
    ['a', 'b', 'c', 'd', 'e'].includes(key)
  ) {
    const q =
      allQuestions[currentQIndex];

    if (!q) {
      return;
    }

    const optionIndex =
      key.charCodeAt(0) -
      'a'.charCodeAt(0);

    if (
      optionIndex <
      (q.options || []).length
    ) {
      selectAnswer(
        q,
        key.toUpperCase()
      );
    }

    return;
  }

  if (event.key === 'ArrowRight') {
    nextQuestion();
    return;
  }

  if (event.key === 'ArrowLeft') {
    previousQuestion();
    return;
  }

  if (event.key === 'Escape') {
    closeQuestionGrid();
    closeSubmitDialog();
    closeCalculator();
  }
}


/* ================================================================
   DOM READY
   ================================================================ */
document.addEventListener(
  'DOMContentLoaded',
  () => {
    const backBtn =
      document.getElementById('backBtn');

    const bookmarkBtn =
      document.getElementById('bookmarkBtn');

    const calcBtn =
      document.getElementById('calcBtn');

    const calcCloseBtn =
      document.getElementById('calcCloseBtn');

    const speakerBtn =
      document.getElementById('speakerBtn');

    const prevBtn =
      document.getElementById('prevBtn');

    const nextBtn =
      document.getElementById('nextBtn');

    const submitBtn =
      document.getElementById('submitBtn');

    const dialogCancel =
      document.getElementById('dialogCancel');

    const dialogSubmit =
      document.getElementById('dialogSubmit');

    const answeredPill =
      document.getElementById('answeredPill');

    const gridOverlay =
      document.getElementById('gridOverlay');

    const gridCloseBtn =
      document.getElementById('gridCloseBtn');


    if (backBtn) {
      backBtn.addEventListener(
        'click',
        () => {
          window.history.back();
        }
      );
    }


    if (bookmarkBtn) {
      bookmarkBtn.addEventListener(
        'click',
        toggleBookmark
      );
    }


    if (calcBtn) {
      calcBtn.addEventListener(
        'click',
        openCalculator
      );
    }


    if (calcCloseBtn) {
      calcCloseBtn.addEventListener(
        'click',
        closeCalculator
      );
    }


    if (speakerBtn) {
      speakerBtn.addEventListener(
        'click',
        speakCurrentQuestion
      );
    }


    if (prevBtn) {
      prevBtn.addEventListener(
        'click',
        previousQuestion
      );
    }


    if (nextBtn) {
      nextBtn.addEventListener(
        'click',
        nextQuestion
      );
    }


    if (submitBtn) {
      submitBtn.addEventListener(
        'click',
        submitExam
      );
    }


    if (dialogCancel) {
      dialogCancel.addEventListener(
        'click',
        closeSubmitDialog
      );
    }


    if (dialogSubmit) {
      dialogSubmit.addEventListener(
        'click',
        finishExam
      );
    }


    if (answeredPill) {
      answeredPill.addEventListener(
        'click',
        openQuestionGrid
      );
    }


    if (gridCloseBtn) {
      gridCloseBtn.addEventListener(
        'click',
        closeQuestionGrid
      );
    }


    if (gridOverlay) {
      gridOverlay.addEventListener(
        'click',
        event => {
          if (event.target === gridOverlay) {
            closeQuestionGrid();
          }
        }
      );
    }


    document
      .querySelectorAll('.calc-btn')
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            handleCalculatorInput(
              button.dataset.val || ''
            );
          }
        );
      });


    document.addEventListener(
      'keydown',
      handleKeyboardShortcuts
    );


    updateAnsweredCount();
    updateBookmarkButton();
    updateNavigationButtons();

    loadAllQuestions();
  }
);


/* ================================================================
   CLEANUP
   ================================================================ */
window.addEventListener(
  'beforeunload',
  () => {
    if (timerInterval) {
      clearInterval(
        timerInterval
      );
    }

    if (
      'speechSynthesis' in window
    ) {
      window.speechSynthesis.cancel();
    }
  }
);
                                        
