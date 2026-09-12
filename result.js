/* ================================================================
   UTMESchools — result.js

   Responsibilities:
   - Read the submitted result
   - Show estimated UTME score /400 when appropriate
   - Show subject performance
   - Show COMPLETE View Corrections
   - Correct option = GREEN
   - Student's wrong option = RED
   - Preserve A-E numbering
   - Question navigation + question grid
================================================================ */

const resultData = (() => {
  try {
    return JSON.parse(sessionStorage.getItem('utme_result') || 'null');
  } catch (e) {
    return null;
  }
})();

const SUBJECT_NAMES = {
  english: 'English Language',
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  economics: 'Economics',
  government: 'Government',
  literature: 'Literature in English',
  accounting: 'Accounting',
  commerce: 'Commerce',
  geography: 'Geography',
  crk: 'Christian Religious Studies',
  irk: 'Islamic Religious Studies',
  civic: 'Civic Education',
  agriculture: 'Agricultural Science',
  computer: 'Computer Science',
  igbo: 'Igbo',
  yoruba: 'Yoruba',
  french: 'French',
  arabic: 'Arabic'
};

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

let activeSubject = null;
let activeQuestionIndex = 0;

function subjectName(id) {
  return SUBJECT_NAMES[String(id).toLowerCase()] ||
         String(id).replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* ================================================================
   SCORE
================================================================ */

function calculateEstimatedUTMEScore() {
  if (!resultData || !resultData.subjectIds) return null;

  /*
    A complete UTME-style four-subject combination is:
    English + three other subjects.

    Each subject is normalized to 100 before the four scores
    are added together.

    This is an estimate, not a claim that we reproduce JAMB's
    exact internal scoring algorithm.
  */

  const ids = resultData.subjectIds.map(String);

  const englishId = ids.find(id =>
    id.toLowerCase() === 'english' ||
    id.toLowerCase() === 'english-language'
  );

  const otherIds = ids.filter(id => id !== englishId);

  if (!englishId || otherIds.length !== 3) {
    return null;
  }

  const englishResult = resultData.subjectResults[englishId];

  if (!englishResult || !englishResult.total) {
    return null;
  }

  const englishScore =
    (englishResult.correct / englishResult.total) * 100;

  let total = englishScore;

  for (const sid of otherIds) {
    const r = resultData.subjectResults[sid];

    if (!r || !r.total) return null;

    total += (r.correct / r.total) * 100;
  }

  return Math.round(total);
}

function renderMainScore() {
  const scoreEl = document.getElementById('mainScore');
  const noteEl = document.getElementById('scoreNote');

  const score = calculateEstimatedUTMEScore();

  if (score !== null) {
    scoreEl.textContent = `${clamp(score, 0, 400)} / 400`;
    noteEl.textContent =
      'Estimated from your performance in the four-subject UTME combination.';
  } else {
    scoreEl.textContent = '—';
    noteEl.textContent =
      'Complete English + three other UTME subjects to see an estimated score over 400.';
  }
}

/* ================================================================
   SUBJECT RESULTS
================================================================ */

function renderSubjectResults() {
  const container = document.getElementById('subjectResults');

  if (!resultData || !resultData.subjectIds) {
    container.innerHTML = `
      <div class="empty">
        No result was found for this session.
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  resultData.subjectIds.forEach(sid => {
    const result = resultData.subjectResults[sid];

    if (!result) return;

    const percentage = result.total
      ? (result.correct / result.total) * 100
      : 0;

    const card = document.createElement('div');
    card.className = 'subject-card';

    card.innerHTML = `
      <div class="subject-row">
        <div class="subject-name">${subjectName(sid)}</div>
        <div class="subject-score">
          ${result.correct}/${result.total}
        </div>
      </div>

      <div class="subject-meta">
        ${Math.round(percentage)}% ·
        ${result.attempted || 0} answered
      </div>

      <div class="progress">
        <div
          class="progress-fill"
          style="width:${clamp(percentage, 0, 100)}%"
        ></div>
      </div>
    `;

    container.appendChild(card);
  });
}

/* ================================================================
   CORRECTIONS
================================================================ */

function openCorrections() {
  const wrap = document.getElementById('correctionWrap');

  wrap.classList.add('visible');

  renderCorrectionTabs();

  if (!activeSubject && resultData && resultData.subjectIds.length) {
    activeSubject = resultData.subjectIds[0];
    activeQuestionIndex = 0;
  }

  renderCorrectionQuestion();

  setTimeout(() => {
    wrap.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }, 50);
}

function renderCorrectionTabs() {
  const tabs = document.getElementById('correctionTabs');

  tabs.innerHTML = '';

  resultData.subjectIds.forEach(sid => {
    const btn = document.createElement('button');

    btn.className =
      'correction-tab' +
      (sid === activeSubject ? ' active' : '');

    btn.textContent = subjectName(sid);

    btn.addEventListener('click', () => {
      activeSubject = sid;
      activeQuestionIndex = 0;

      renderCorrectionTabs();
      renderCorrectionQuestion();
    });

    tabs.appendChild(btn);
  });
}

function renderCorrectionQuestion() {
  const container = document.getElementById('correctionQuestion');
  const countEl = document.getElementById('correctionCount');

  const result = resultData &&
                 resultData.subjectResults &&
                 resultData.subjectResults[activeSubject];

  if (!result || !result.questions || !result.questions.length) {
    container.innerHTML = `
      <div class="empty">
        No questions available for this subject.
      </div>
    `;

    countEl.textContent = 'Q 0 / 0';

    document.getElementById('questionGrid').innerHTML = '';

    return;
  }

  activeQuestionIndex = clamp(
    activeQuestionIndex,
    0,
    result.questions.length - 1
  );

  const q = result.questions[activeQuestionIndex];

  countEl.textContent =
    `Q ${activeQuestionIndex + 1} / ${result.questions.length}`;

  const userAnswer = q.userAnswer || null;
  const correctAnswer = String(q.correct || '').toUpperCase();

  let html = `
    <div class="correction-question">

      <div class="correction-meta">
        <span class="meta-tag">
          ${subjectName(activeSubject)}
        </span>
  `;

  if (q.topic) {
    html += `<span class="meta-tag">${q.topic}</span>`;
  }

  if (q.subtopic) {
    html += `<span class="meta-tag">${q.subtopic}</span>`;
  }

  if (q.year) {
    html += `<span class="meta-tag">📅 ${q.year}</span>`;
  }

  html += `
      </div>

      <div class="correction-text">
        ${escapeHTML(q.text || '')}
      </div>
  `;

  (q.options || []).forEach((option, index) => {
    const letter = LETTERS[index];

    let state = '';

    /*
      IMPORTANT:
      - Correct option is always GREEN.
      - If student's answer was wrong, their selected
        option is RED.
      - If they were correct, that same option is GREEN.
    */

    if (letter === correctAnswer) {
      state = 'correct';
    } else if (letter === userAnswer) {
      state = 'wrong';
    }

    html += `
      <div class="correction-option ${state}">
        <div class="correction-letter">${letter}</div>
        <div class="correction-option-text">
          ${escapeHTML(option)}
        </div>
      </div>
    `;
  });

  if (!userAnswer) {
    html += `
      <div class="answer-status">
        <strong>Not answered.</strong>
        Correct answer: ${correctAnswer || '—'}
      </div>
    `;
  } else if (userAnswer === correctAnswer) {
    html += `
      <div class="answer-status">
        ✅ You got this question correct.
      </div>
    `;
  } else {
    html += `
      <div class="answer-status">
        ❌ Your answer:
        <strong>${userAnswer}</strong>
        &nbsp; · &nbsp;
        Correct answer:
        <strong>${correctAnswer}</strong>
      </div>
    `;
  }

  if (q.explanation) {
    html += `
      <div class="explanation">
        <strong>Explanation</strong><br>
        ${escapeHTML(q.explanation)}
      </div>
    `;
  }

  html += `</div>`;

  container.innerHTML = html;

  renderQuestionGrid(result.questions);
}

function renderQuestionGrid(questions) {
  const grid = document.getElementById('questionGrid');

  grid.innerHTML = '';

  questions.forEach((q, index) => {
    const btn = document.createElement('button');

    btn.className = 'grid-btn';

    const userAnswer = q.userAnswer
      ? String(q.userAnswer).toUpperCase()
      : '';

    const correctAnswer = q.correct
      ? String(q.correct).toUpperCase()
      : '';

    if (userAnswer && userAnswer === correctAnswer) {
      btn.classList.add('correct');
    } else if (userAnswer) {
      btn.classList.add('wrong');
    }

    if (index === activeQuestionIndex) {
      btn.classList.add('current');
    }

    btn.textContent = index + 1;

    btn.addEventListener('click', () => {
      activeQuestionIndex = index;
      renderCorrectionQuestion();

      window.scrollTo({
        top: document.getElementById('correctionQuestion').offsetTop - 80,
        behavior: 'smooth'
      });
    });

    grid.appendChild(btn);
  });
}

/* ================================================================
   NAVIGATION
================================================================ */

function previousCorrection() {
  if (!activeSubject) return;

  const result = resultData.subjectResults[activeSubject];

  if (!result || !result.questions.length) return;

  if (activeQuestionIndex > 0) {
    activeQuestionIndex--;
    renderCorrectionQuestion();
  }
}

function nextCorrection() {
  if (!activeSubject) return;

  const result = resultData.subjectResults[activeSubject];

  if (!result || !result.questions.length) return;

  if (activeQuestionIndex < result.questions.length - 1) {
    activeQuestionIndex++;
    renderCorrectionQuestion();
  }
}

/* ================================================================
   HELPERS
================================================================ */

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ================================================================
   BUTTONS
================================================================ */

document.getElementById('backBtn').addEventListener('click', () => {
  history.back();
});

document.getElementById('correctionsBtn').addEventListener(
  'click',
  openCorrections
);

document.getElementById('prevCorrection').addEventListener(
  'click',
  previousCorrection
);

document.getElementById('nextCorrection').addEventListener(
  'click',
  nextCorrection
);

document.getElementById('coachBtn').addEventListener('click', () => {
  /*
    Coach Mode is the next implementation block.
    Keep the button visible now so Results already has the
    correct architecture, but don't pretend Coach is finished.
  */
  alert(
    'Coach Mode is being connected to your performance history.'
  );
});

/* ================================================================
   START
================================================================ */

renderMainScore();
renderSubjectResults();
