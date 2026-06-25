/* ============================================================
   UTMESchools v2 — practice.js
   Loads questions, displays them, tracks answers,
   handles timer, calculates score, sends result.
   ============================================================ */

const params = new URLSearchParams(window.location.search);

const selectedSubjects =
  (params.get('subjects') || '')
    .split(',')
    .filter(Boolean);

const mode = params.get('mode') || 'practice';

let allQuestions = [];
let currentIndex = 0;
let answers = {};

const questionNumber = document.getElementById('questionNumber');
const questionSubject = document.getElementById('questionSubject');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const progressFill = document.getElementById('progressFill');

const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');

/* ============================================================
   LOAD QUESTIONS
   ============================================================ */

async function loadQuestions() {
  try {

    for (const subject of selectedSubjects) {

      const response = await fetch(
        `questions/${subject}.json`
      );

      if (!response.ok) continue;

      const questions = await response.json();

      const count =
        parseInt(params.get(`count_${subject}`)) || 40;

      const year =
        params.get(`year_${subject}`) || 'Random';

      let filtered = [...questions];

      if (year !== 'Random') {
        filtered = filtered.filter(
          q => String(q.year) === year
        );
      }

      shuffle(filtered);

      allQuestions.push(
        ...filtered.slice(0, count)
      );
    }

    shuffle(allQuestions);

    if (allQuestions.length === 0) {
      questionText.textContent =
        'No questions available.';
      return;
    }

    renderQuestion();

  } catch (err) {
    console.error(err);
    questionText.textContent =
      'Failed to load questions.';
  }
}

/* ============================================================
   SHOW QUESTION
   ============================================================ */

function renderQuestion() {

  const q = allQuestions[currentIndex];

  questionNumber.textContent =
    `Question ${currentIndex + 1} of ${allQuestions.length}`;

  questionSubject.textContent =
    q.subject || 'Subject';

  questionText.innerHTML =
    q.question;

  optionsContainer.innerHTML = '';

  const letters = ['A','B','C','D'];

  q.options.forEach((option, index) => {

    const div = document.createElement('div');

    div.className = 'option';

    if (
      answers[currentIndex] === index
    ) {
      div.classList.add('active');
    }

    div.innerHTML = `
      <div class="option-letter">
        ${letters[index]}
      </div>
      <div class="option-text">
        ${option}
      </div>
    `;

    div.addEventListener('click', () => {

      answers[currentIndex] = index;

      renderQuestion();

    });

    optionsContainer.appendChild(div);
  });

  const progress =
    ((currentIndex + 1) / allQuestions.length) * 100;

  progressFill.style.width =
    progress + '%';

  prevBtn.disabled =
    currentIndex === 0;

  nextBtn.disabled =
    currentIndex === allQuestions.length - 1;
}

/* ============================================================
   NAVIGATION
   ============================================================ */

prevBtn.addEventListener('click', () => {

  if (currentIndex > 0) {

    currentIndex--;

    renderQuestion();
  }
});

nextBtn.addEventListener('click', () => {

  if (currentIndex < allQuestions.length - 1) {

    currentIndex++;

    renderQuestion();
  }
});

/* ============================================================
   SUBMIT EXAM
   ============================================================ */

submitBtn.addEventListener('click', submitExam);

function submitExam() {

  let score = 0;

  allQuestions.forEach((q, index) => {

    if (answers[index] === q.answer) {
      score++;
    }
  });

  const result = {
    score,
    total: allQuestions.length,
    percentage:
      Math.round(
        (score / allQuestions.length) * 100
      ),
    answers,
    questions: allQuestions,
    mode
  };

  localStorage.setItem(
    'utme_result',
    JSON.stringify(result)
  );

  window.location.href =
    'result.html';
}

/* ============================================================
   TIMER
   ============================================================ */

const timerEl = document.getElementById('timer');

let hours =
  parseInt(params.get('h')) || 0;

let minutes =
  parseInt(params.get('m')) || 0;

let seconds =
  (hours * 3600) + (minutes * 60);

if (mode === 'study') {
  timerEl.textContent = 'Study Mode';
}
else {

  const timer = setInterval(() => {

    if (seconds <= 0) {

      clearInterval(timer);

      submitExam();

      return;
    }

    seconds--;

    const h =
      Math.floor(seconds / 3600);

    const m =
      Math.floor(
        (seconds % 3600) / 60
      );

    const s =
      seconds % 60;

    timerEl.textContent =
      `${String(h).padStart(2,'0')}:` +
      `${String(m).padStart(2,'0')}:` +
      `${String(s).padStart(2,'0')}`;

  }, 1000);
}

/* ============================================================
   UTILITIES
   ============================================================ */

function shuffle(array) {

  for (
    let i = array.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() * (i + 1)
      );

    [array[i], array[j]] =
    [array[j], array[i]];
  }

  return array;
}

/* ============================================================
   START
   ============================================================ */

loadQuestions();
