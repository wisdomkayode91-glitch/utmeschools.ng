/* ================================================================
   UTMESchools — Coach Mode
   Diagnose → Prioritize → Recovery Set → Study / Practice / Mock
================================================================ */

const API_BASE = 'https://utmeschools-ng.onrender.com';

let coachData = null;

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
  accounts: 'Accounting',
  commerce: 'Commerce',
  geography: 'Geography',
  agriculture: 'Agricultural Science',
  computer: 'Computer Studies',
  crk: 'CRK',
  irk: 'IRK',
  civic: 'Civic Education'
};

function subjectName(id) {
  return SUBJECT_NAMES[String(id).toLowerCase()] ||
    String(id)
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
}

/* ================================================================
   LOAD PERFORMANCE
================================================================ */

function loadHistory() {
  try {
    return JSON.parse(
      localStorage.getItem('utme_history') || '[]'
    );
  } catch {
    return [];
  }
}

function buildPerformance() {

  const history = loadHistory();

  const performance = {};

  history.forEach(session => {

    if (!session || !session.subjectResults) return;

    Object.entries(session.subjectResults).forEach(
      ([subject, result]) => {

        if (!performance[subject]) {
          performance[subject] = {
            total: 0,
            correct: 0,
            topics: {}
          };
        }

        performance[subject].total +=
          Number(result.total || 0);

        performance[subject].correct +=
          Number(result.correct || 0);

        (result.questions || []).forEach(q => {

          if (!q.topic && !q.subtopic) return;

          const topic =
            q.topic || 'Unclassified';

          const subtopic =
            q.subtopic || 'General';

          const key = `${topic}|||${subtopic}`;

          if (!performance[subject].topics[key]) {
            performance[subject].topics[key] = {
              topic,
              subtopic,
              total: 0,
              correct: 0
            };
          }

          const item = performance[subject].topics[key];

          item.total++;

          if (
            q.userAnswer &&
            String(q.userAnswer).toUpperCase() ===
            String(q.correct || '').toUpperCase()
          ) {
            item.correct++;
          }
        });

      }
    );

  });

  return performance;
}

/* ================================================================
   DIAGNOSE
================================================================ */

function diagnose() {

  const performance = buildPerformance();

  const subjects = [];

  Object.entries(performance).forEach(
    ([subject, data]) => {

      if (!data.total) return;

      const percentage =
        (data.correct / data.total) * 100;

      const weakTopics = Object.values(data.topics)
        .filter(x => x.total >= 1)
        .map(x => ({
          ...x,
          percentage:
            (x.correct / x.total) * 100
        }))
        .sort((a, b) =>
          a.percentage - b.percentage
        );

      subjects.push({
        subject,
        total: data.total,
        correct: data.correct,
        percentage,
        weakTopics
      });

    }
  );

  subjects.sort((a, b) =>
    a.percentage - b.percentage
  );

  return subjects;
}

/* ================================================================
   RECOVERY SIZE
================================================================ */

function recoverySize(percentage) {

  if (percentage < 40) return 20;
  if (percentage < 55) return 20;
  if (percentage < 70) return 15;
  if (percentage < 80) return 10;

  return 0;
}

/* ================================================================
   RENDER
================================================================ */

function renderCoach() {

  const subjects = diagnose();

  if (!subjects.length) {

    document.getElementById('score').textContent = '—';

    document.getElementById('scoreStatus').textContent =
      'Take a practice test first';

    document.getElementById('recoveryList').innerHTML = `
      <div class="empty">
        <strong>Your Coach needs performance data.</strong>
        <br><br>
        Complete a Practice or Mock session and come back here.
      </div>
    `;

    return;
  }

  const totalCorrect =
    subjects.reduce((n, s) => n + s.correct, 0);

  const totalQuestions =
    subjects.reduce((n, s) => n + s.total, 0);

  const estimatedScore =
    Math.round(
      (totalCorrect / totalQuestions) * 400
    );

  document.getElementById('score').textContent =
    `${estimatedScore} / 400`;

  const weakest = subjects[0];

  document.getElementById('scoreStatus').textContent =
    weakest.percentage < 50
      ? 'Recovery needed'
      : weakest.percentage < 70
        ? 'Improvement available'
        : 'Good progress';

  document.getElementById('heroTitle').textContent =
    `Focus on ${subjectName(weakest.subject)}.`;

  document.getElementById('heroText').textContent =
    `Your weakest subject is currently ${Math.round(
      weakest.percentage
    )}%. The Coach has identified where your next practice should go.`;

  const recoverySubjects =
    subjects
      .filter(s => recoverySize(s.percentage) > 0)
      .slice(0, 3);

  const container =
    document.getElementById('recoveryList');

  if (!recoverySubjects.length) {

    container.innerHTML = `
      <div class="empty">
        <strong>No major weakness detected yet.</strong>
        <br><br>
        Take another mixed practice or mock session.
        Your Coach will reassess your weak areas.
      </div>
    `;

    return;
  }

  container.innerHTML = '';

  recoverySubjects.forEach((subject, index) => {

    const count =
      recoverySize(subject.percentage);

    const topics =
      subject.weakTopics
        .filter(t => t.percentage < 70)
        .slice(0, 3);

    const card =
      document.createElement('div');

    card.className = 'recovery-card';

    const priority =
      index === 0
        ? 'HIGHEST PRIORITY'
        : index === 1
          ? 'NEXT PRIORITY'
          : 'WATCH';

    const topicHTML =
      topics.length
        ? topics.map(t => `
            <span class="topic-chip">
              ${escapeHTML(t.topic)}
              ${t.subtopic !== 'General'
                ? ' · ' + escapeHTML(t.subtopic)
                : ''}
            </span>
          `).join('')
        : `
            <span class="topic-chip">
              General ${escapeHTML(subjectName(subject.subject))}
            </span>
          `;

    card.innerHTML = `
      <div class="recovery-top">
        <div class="recovery-subject">
          ${escapeHTML(subjectName(subject.subject))}
        </div>

        <div class="priority">
          ${priority}
        </div>
      </div>

      <div class="recovery-desc">
        ${Math.round(subject.percentage)}% accuracy.
        Recommended recovery: ${count} questions.
      </div>

      <div class="topic-row">
        ${topicHTML}
      </div>

      <div class="recovery-actions">

        <button
          class="mode-btn study"
          data-subject="${escapeHTML(subject.subject)}"
          data-count="${count}"
          data-mode="study">
          📖 Study
        </button>

        <button
          class="mode-btn practice"
          data-subject="${escapeHTML(subject.subject)}"
          data-count="${count}"
          data-mode="practice">
          ✏️ Practice
        </button>

        <button
          class="mode-btn mock"
          data-subject="${escapeHTML(subject.subject)}"
          data-count="${count}"
          data-mode="mock">
          ⏱ Mock
        </button>

      </div>
    `;

    container.appendChild(card);
  });

  container
    .querySelectorAll('.mode-btn')
    .forEach(button => {

      button.addEventListener('click', () => {

        const subject =
          button.dataset.subject;

        const count =
          Number(button.dataset.count);

        const mode =
          button.dataset.mode;

        startRecovery(
          subject,
          count,
          mode
        );

      });

    });
}

/* ================================================================
   BUILD TARGET TOPICS
================================================================ */

function getWeakTopics(subject) {

  const performance =
    buildPerformance();

  const data =
    performance[subject];

  if (!data) return [];

  return Object.values(data.topics)
    .filter(t => t.total > 0)
    .map(t => ({
      ...t,
      percentage:
        (t.correct / t.total) * 100
    }))
    .sort((a, b) =>
      a.percentage - b.percentage
    )
    .slice(0, 3);
}

/* ================================================================
   START RECOVERY
================================================================ */

async function startRecovery(
  subject,
  count,
  mode
) {

  const topics =
    getWeakTopics(subject);

  const topicNames =
    topics
      .filter(t => t.topic)
      .map(t => t.topic);

  /*
    We first ask the database for questions from the
    identified weak subject/topics.

    If topic metadata is not available yet, we still
    request questions from that subject instead of
    breaking the recovery flow.
  */

  const params =
    new URLSearchParams();

  params.set('subject', subject);
  params.set('limit', String(count));
  params.set('shuffle', 'true');

  if (topicNames.length) {
    params.set(
      'topic',
      topicNames[0]
    );
  }

  try {

    const response =
      await fetch(
        `${API_BASE}/api/questions?${params.toString()}`
      );

    if (!response.ok) {
      throw new Error(
        'Recovery question request failed'
      );
    }

    const data =
      await response.json();

    const questions =
      data.questions ||
      data.data ||
      data ||
      [];

    if (!Array.isArray(questions) ||
        questions.length === 0) {

      alert(
        'There are not enough classified questions for this recovery set yet.'
      );

      return;
    }

    /*
      Store the recovery set so Practice can open
      the SAME questions in Study, Practice or Mock.
    */

    sessionStorage.setItem(
      'coach_recovery_set',
      JSON.stringify({
        subject,
        count: questions.length,
        questions,
        createdAt: new Date().toISOString()
      })
    );

    const questionIds =
      questions
        .map(q => q.id)
        .filter(Boolean)
        .join(',');

    /*
      Reuse the existing practice engine.
      The questions are passed through sessionStorage
      so the same recovery set can be studied/practised/
      mocked without regenerating it.
    */

    const url =
      `practice.html?subjects=${encodeURIComponent(subject)}` +
      `&mode=${encodeURIComponent(mode)}` +
      `&count_${encodeURIComponent(subject)}=${questions.length}` +
      `&coach=1`;

    sessionStorage.setItem(
      'coach_recovery_mode',
      mode
    );

    sessionStorage.setItem(
      'coach_recovery_subject',
      subject
    );

    sessionStorage.setItem(
      'coach_recovery_question_ids',
      questionIds
    );

    window.location.href = url;

  } catch (error) {

    console.error(
      'Coach recovery error:',
      error
    );

    alert(
      'Coach could not load the recovery questions yet. Try again after questions are available in the database.'
    );
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
   BACK
================================================================ */

document
  .getElementById('backBtn')
  .addEventListener('click', () => {
    history.back();
  });

/* ================================================================
   START
================================================================ */

renderCoach();
