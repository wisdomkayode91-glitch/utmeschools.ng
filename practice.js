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
         /* ================================================================
   SELECT ANSWER
   ================================================================ */

function selectAnswer(q, letter) {
  if (!q) return;

  /*
    In study mode, the student can still select an answer,
    but selecting an answer does not automatically reveal
    the correct answer.
  */
  answers[q.id] = letter;

  showExplanation = false;

  renderQuestion();
}

/* ================================================================
   QUESTION NAVIGATION
   ================================================================ */

function goToQuestion(index) {
  if (
    index < 0 ||
    index >= allQuestions.length
  ) {
    return;
  }

  currentQIndex = index;
  showExplanation = false;

  renderQuestion();

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

function nextQuestion() {
  if (
    currentQIndex <
    allQuestions.length - 1
  ) {
    goToQuestion(
      currentQIndex + 1
    );
  }
}

function previousQuestion() {
  if (currentQIndex > 0) {
    goToQuestion(
      currentQIndex - 1
    );
  }
}

/* ================================================================
   SHOW / HIDE STUDY ANSWER
   ================================================================ */

function toggleAnswer() {
  if (mode !== 'study') {
    return;
  }

  showExplanation =
    !showExplanation;

  renderQuestion();
}

/* ================================================================
   BOOKMARK
   ================================================================ */

function toggleBookmark() {
  const q =
    allQuestions[currentQIndex];

  if (!q) return;

  if (bookmarks[q.id]) {
    delete bookmarks[q.id];

    showToast(
      'Bookmark removed'
    );
  } else {
    bookmarks[q.id] = {
      id: q.id,
      subjectId: q.subjectId,
      year: q.year,
      topic: q.topic,
      subtopic: q.subtopic,
      text: q.text
    };

    showToast(
      'Question bookmarked'
    );
  }

  localStorage.setItem(
    'utme_bookmarks',
    JSON.stringify(bookmarks)
  );

  renderQuestion();
}

/* ================================================================
   QUESTION GRID
   ================================================================ */

function renderQuestionGrid() {
  const grid =
    document.getElementById(
      'questionGrid'
    );

  if (!grid) return;

  grid.innerHTML = '';

  allQuestions.forEach(
    (q, index) => {
      const btn =
        document.createElement('button');

      btn.type = 'button';

      btn.className =
        'q-grid-btn';

      if (index === currentQIndex) {
        btn.classList.add('current');
      }

      if (answers[q.id]) {
        btn.classList.add('answered');
      }

      btn.textContent =
        index + 1;

      btn.addEventListener(
        'click',
        () => {
          goToQuestion(index);

          const dialog =
            document.getElementById(
              'gridDialog'
            );

          if (dialog) {
            dialog.classList.remove(
              'visible'
            );
          }
        }
      );

      grid.appendChild(btn);
    }
  );
}

/* ================================================================
   SUBMISSION
   ================================================================ */

function submitExam() {
  if (!allQuestions.length) {
    showToast(
      'There are no questions to submit.'
    );

    return;
  }

  /*
    Study mode does not require submission.
  */
  if (mode === 'study') {
    showToast(
      'Study mode does not require submission.'
    );

    return;
  }

  const unanswered =
    allQuestions.filter(
      q => !answers[q.id]
    ).length;

  if (unanswered > 0) {
    openSubmitDialog(
      unanswered
    );

    return;
  }

  finishExam();
}

function openSubmitDialog(
  unanswered
) {
  const dialog =
    document.getElementById(
      'submitDialog'
    );

  if (!dialog) {
    finishExam();
    return;
  }

  const countEl =
    document.getElementById(
      'unansweredCount'
    );

  if (countEl) {
    countEl.textContent =
      unanswered;
  }

  dialog.classList.add(
    'visible'
  );
}

function closeSubmitDialog() {
  const dialog =
    document.getElementById(
      'submitDialog'
    );

  if (dialog) {
    dialog.classList.remove(
      'visible'
    );
  }
}

function finishExam() {
  closeSubmitDialog();

  if (timerInterval) {
    clearInterval(
      timerInterval
    );
  }

  buildResult(true);
}

/* ================================================================
   BUILD RESULT
   ================================================================ */

function buildResult(saveToHistory = true) {
  const subjectResults = {};

  let correctCount = 0;
  let answeredCount = 0;

  allQuestions.forEach(q => {
    const selected =
      answers[q.id] || '';

    const isCorrect =
      selected &&
      selected === q.correct;

    if (selected) {
      answeredCount++;
    }

    if (isCorrect) {
      correctCount++;
    }

    if (!subjectResults[q.subjectId]) {
      subjectResults[q.subjectId] = {
        subjectId: q.subjectId,
        total: 0,
        answered: 0,
        correct: 0,
        questions: [],
        topics: {}
      };
    }

    const subject =
      subjectResults[q.subjectId];

    subject.total++;

    if (selected) {
      subject.answered++;
    }

    if (isCorrect) {
      subject.correct++;
    }

    /*
      Topic/subtopic performance is stored now so Coach Mode
      can use the same result structure later.
    */
    const topicName =
      q.topic || 'Uncategorized';

    const subtopicName =
      q.subtopic || '';

    const topicKey =
      subtopicName
        ? `${topicName} : ${subtopicName}`
        : topicName;

    if (!subject.topics[topicKey]) {
      subject.topics[topicKey] = {
        topic: topicName,
        subtopic: subtopicName,
        total: 0,
        answered: 0,
        correct: 0
      };
    }

    subject.topics[topicKey].total++;

    if (selected) {
      subject.topics[topicKey].answered++;
    }

    if (isCorrect) {
      subject.topics[topicKey].correct++;
    }

    subject.questions.push({
      id: q.id,
      subjectId: q.subjectId,
      year: q.year,
      topic: q.topic,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      text: q.text,
      options: q.options,
      correct: q.correct,
      selected,
      isCorrect: Boolean(isCorrect),
      explanation: q.explanation,
      image_url: q.image_url,
      passage: q.passage,
      syllabus_objective:
        q.syllabus_objective
    });
  });

  const total =
    allQuestions.length;

  const percentage =
    total > 0
      ? Math.round(
          (correctCount / total) * 100
        )
      : 0;

  const result = {
    id:
      `result_${Date.now()}`,

    createdAt:
      new Date().toISOString(),

    mode,

    totalQuestions:
      total,

    answeredQuestions:
      answeredCount,

    correctAnswers:
      correctCount,

    percentage,

    subjects:
      Object.values(subjectResults),

    questions:
      allQuestions.map(q => ({
        id: q.id,
        subjectId: q.subjectId,
        year: q.year,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        text: q.text,
        options: q.options,
        correct: q.correct,
        selected:
          answers[q.id] || '',
        isCorrect:
          Boolean(
            answers[q.id] &&
            answers[q.id] === q.correct
          ),
        explanation:
          q.explanation,
        image_url:
          q.image_url,
        passage:
          q.passage,
        syllabus_objective:
          q.syllabus_objective
      }))
  };

  /*
    sessionStorage keeps the complete result available to
    result.html immediately after redirect.
  */
  sessionStorage.setItem(
    'utme_result',
    JSON.stringify(result)
  );

  /*
    Keep the existing local history behavior for now.
    This will later be replaced/augmented by Supabase
    practice_sessions + question_attempts.
  */
  if (saveToHistory) {
    try {
      const history =
        JSON.parse(
          localStorage.getItem(
            'utme_history'
          ) || '[]'
        );

      history.unshift(result);

      /*
        Prevent unlimited localStorage growth.
      */
      const trimmed =
        history.slice(0, 50);

      localStorage.setItem(
        'utme_history',
        JSON.stringify(trimmed)
      );
    } catch (e) {
      console.warn(
        'Could not save local result history:',
        e
      );
    }
  }

  window.location.href =
    'result.html';
}

/* ================================================================
   CALCULATOR
   ================================================================ */

let calculatorExpression = '';

function openCalculator() {
  const calculator =
    document.getElementById(
      'calculator'
    );

  if (calculator) {
    calculator.classList.add(
      'visible'
    );
  }
}

function closeCalculator() {
  const calculator =
    document.getElementById(
      'calculator'
    );

  if (calculator) {
    calculator.classList.remove(
      'visible'
    );
  }
}

function calculatorInput(value) {
  calculatorExpression +=
    String(value);

  const display =
    document.getElementById(
      'calculatorDisplay'
    );

  if (display) {
    display.value =
      calculatorExpression;
  }
}

function calculatorClear() {
  calculatorExpression = '';

  const display =
    document.getElementById(
      'calculatorDisplay'
    );

  if (display) {
    display.value = '';
  }
}

function calculatorBackspace() {
  calculatorExpression =
    calculatorExpression.slice(
      0,
      -1
    );

  const display =
    document.getElementById(
      'calculatorDisplay'
    );

  if (display) {
    display.value =
      calculatorExpression;
  }
}

function calculatorCalculate() {
  const display =
    document.getElementById(
      'calculatorDisplay'
    );

  try {
    /*
      The calculator is intentionally restricted to
      mathematical characters before evaluation.
    */
    const safe =
      calculatorExpression.replace(
        /[^0-9+\-*/().% ]/g,
        ''
      );

    if (!safe.trim()) {
      return;
    }

    const result =
      Function(
        `"use strict"; return (${safe})`
      )();

    calculatorExpression =
      String(result);

    if (display) {
      display.value =
        calculatorExpression;
    }

  } catch (error) {
    if (display) {
      display.value =
        'Error';
    }

    calculatorExpression = '';
  }
}

/* ================================================================
   TOAST
   ================================================================ */

let toastTimer = null;

function showToast(message) {
  let toast =
    document.getElementById(
      'toast'
    );

  if (!toast) {
    toast =
      document.createElement(
        'div'
      );

    toast.id =
      'toast';

    toast.className =
      'toast';

    document.body.appendChild(
      toast
    );
  }

  toast.textContent =
    message;

  toast.classList.add(
    'visible'
  );

  clearTimeout(
    toastTimer
  );

  toastTimer =
    setTimeout(() => {
      toast.classList.remove(
        'visible'
      );
    }, 2500);
}

/* ================================================================
   TEXT TO SPEECH
   ================================================================ */

let speechActive = false;

function speakCurrentQuestion() {
  const q =
    allQuestions[currentQIndex];

  if (!q) return;

  if (
    !('speechSynthesis' in window)
  ) {
    showToast(
      'Text-to-speech is not supported on this device.'
    );

    return;
  }

  window.speechSynthesis.cancel();

  const parts = [
    q.text,
    ...(q.options || []).map(
      (option, index) =>
        `${String.fromCharCode(65 + index)}. ${option}`
    )
  ];

  if (q.passage) {
    parts.unshift(
      `Passage. ${q.passage}`
    );
  }

  const utterance =
    new SpeechSynthesisUtterance(
      parts.join('. ')
    );

  utterance.rate = 0.95;
  utterance.pitch = 1;

  utterance.onstart = () => {
    speechActive = true;

    const btn =
      document.getElementById(
        'speakBtn'
      );

    if (btn) {
      btn.textContent =
        '⏹ Stop';
    }
  };

  utterance.onend = () => {
    speechActive = false;

    const btn =
      document.getElementById(
        'speakBtn'
      );

    if (btn) {
      btn.textContent =
        '🔊 Read';
    }
  };

  utterance.onerror = () => {
    speechActive = false;

    const btn =
      document.getElementById(
        'speakBtn'
      );

    if (btn) {
      btn.textContent =
        '🔊 Read';
    }
  };

  window.speechSynthesis.speak(
    utterance
  );
}

function toggleSpeech() {
  if (
    !('speechSynthesis' in window)
  ) {
    showToast(
      'Text-to-speech is not supported on this device.'
    );

    return;
  }

  if (speechActive) {
    window.speechSynthesis.cancel();

    speechActive = false;

    const btn =
      document.getElementById(
        'speakBtn'
      );

    if (btn) {
      btn.textContent =
        '🔊 Read';
    }

    return;
  }

  speakCurrentQuestion();
}

/* ================================================================
   KEYBOARD SHORTCUTS
   ================================================================ */

document.addEventListener(
  'keydown',
  event => {
    /*
      Do not trigger shortcuts while typing.
    */
    const tag =
      document.activeElement?.tagName;

    if (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT'
    ) {
      return;
    }

    const key =
      event.key.toLowerCase();

    if (key === 'arrowright') {
      event.preventDefault();
      nextQuestion();
      return;
    }

    if (key === 'arrowleft') {
      event.preventDefault();
      previousQuestion();
      return;
    }

    if (
      ['a', 'b', 'c', 'd', 'e']
        .includes(key)
    ) {
      const q =
        allQuestions[currentQIndex];

      if (q) {
        const index =
          key.charCodeAt(0) -
          97;

        if (
          q.options &&
          index < q.options.length
        ) {
          selectAnswer(
            q,
            key.toUpperCase()
          );
        }
      }

      return;
    }

    if (key === 'b') {
      toggleBookmark();
      return;
    }

    if (key === 's') {
      toggleSpeech();
      return;
    }

    if (key === 'escape') {
      closeSubmitDialog();
      closeCalculator();
    }
  }
);

/* ================================================================
   DOM READY
   ================================================================ */

document.addEventListener(
  'DOMContentLoaded',
  () => {
    const prevBtn =
      document.getElementById(
        'prevBtn'
      );

    const nextBtn =
      document.getElementById(
        'nextBtn'
      );

    const submitBtn =
      document.getElementById(
        'submitBtn'
      );

    const bookmarkBtn =
      document.getElementById(
        'bookmarkBtn'
      );

    const gridBtn =
      document.getElementById(
        'gridBtn'
      );

    const showAnswerBtn =
      document.getElementById(
        'showAnswerBtn'
      );

    const closeSubmitBtn =
      document.getElementById(
        'closeSubmitBtn'
      );

    const confirmSubmitBtn =
      document.getElementById(
        'confirmSubmitBtn'
      );

    const calculatorBtn =
      document.getElementById(
        'calculatorBtn'
      );

    const closeCalculatorBtn =
      document.getElementById(
        'closeCalculatorBtn'
      );

    const speakBtn =
      document.getElementById(
        'speakBtn'
      );

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

    if (bookmarkBtn) {
      bookmarkBtn.addEventListener(
        'click',
        toggleBookmark
      );
    }

    if (gridBtn) {
      gridBtn.addEventListener(
        'click',
        () => {
          renderQuestionGrid();

          const dialog =
            document.getElementById(
              'gridDialog'
            );

          if (dialog) {
            dialog.classList.add(
              'visible'
            );
          }
        }
      );
    }

    if (showAnswerBtn) {
      showAnswerBtn.addEventListener(
        'click',
        toggleAnswer
      );
    }

    if (closeSubmitBtn) {
      closeSubmitBtn.addEventListener(
        'click',
        closeSubmitDialog
      );
    }

    if (confirmSubmitBtn) {
      confirmSubmitBtn.addEventListener(
        'click',
        finishExam
      );
    }

    if (calculatorBtn) {
      calculatorBtn.addEventListener(
        'click',
        openCalculator
      );
    }

    if (closeCalculatorBtn) {
      closeCalculatorBtn.addEventListener(
        'click',
        closeCalculator
      );
    }

    if (speakBtn) {
      speakBtn.addEventListener(
        'click',
        toggleSpeech
      );
    }

    /*
      Grid dialog close buttons.
    */
    document
      .querySelectorAll(
        '[data-close-grid]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const dialog =
              document.getElementById(
                'gridDialog'
              );

            if (dialog) {
              dialog.classList.remove(
                'visible'
              );
            }
          }
        );
      });

    /*
      Calculator buttons.

      Buttons can use:
      data-calc="7"
      data-calc="+"
      data-calc="clear"
      data-calc="backspace"
      data-calc="="
    */
    document
      .querySelectorAll(
        '[data-calc]'
      )
      .forEach(button => {
        button.addEventListener(
          'click',
          () => {
            const value =
              button.dataset.calc;

            if (value === 'clear') {
              calculatorClear();
            } else if (
              value === 'backspace'
            ) {
              calculatorBackspace();
            } else if (
              value === '='
            ) {
              calculatorCalculate();
            } else {
              calculatorInput(value);
            }
          }
        );
      });

    /*
      Close modal when clicking its backdrop.
    */
    document
      .querySelectorAll(
        '.modal-backdrop'
      )
      .forEach(backdrop => {
        backdrop.addEventListener(
          'click',
          event => {
            if (
              event.target !== backdrop
            ) {
              return;
            }

            backdrop.classList.remove(
              'visible'
            );
          }
        );
      });

    /*
      Start loading questions only after
      the DOM is ready.
    */
    loadAllQuestions();
  }
);

/* ================================================================
   SAFETY CLEANUP
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
```0
