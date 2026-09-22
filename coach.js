/* ============================================================
   UTMESchools v2 — coach.js
   Adaptive Coach Mode.
   Reads from localStorage performance data.
   Identifies real weaknesses per topic/subtopic.
   Recommends targeted existing questions from Supabase.
   No AI calls. No live generation. Pure analysis.
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';

const SUBJECT_ICONS = {
  english:'🔤', mathematics:'📐', physics:'⚛️', chemistry:'⚗️',
  biology:'🧬', government:'🏛️', economics:'📈', literature:'📚',
  crk:'✝️', irk:'☪️', geography:'🌍', commerce:'🛒',
  accounts:'🧾', agriculture:'🌾', history:'🏺',
};
const SUBJECT_NAMES = {
  english:'English Language', mathematics:'Mathematics',
  physics:'Physics', chemistry:'Chemistry', biology:'Biology',
  government:'Government', economics:'Economics',
  literature:'Literature', crk:'CRK', irk:'IRK',
  geography:'Geography', commerce:'Commerce',
  accounts:'Accounts', agriculture:'Agriculture', history:'History',
};

/* ================================================================
   LOAD AND ANALYSE PERFORMANCE DATA
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const history = getHistory();

  if (history.length === 0) {
    showEmptyState();
    return;
  }

  const analysis = analysePerformance(history);
  renderCoachPage(analysis);
});

function getHistory() {
  try { return JSON.parse(localStorage.getItem('utme_history') || '[]'); }
  catch(e) { return []; }
}

/* ================================================================
   CORE ANALYSIS ENGINE
   This is the brain of Coach Mode.
   It analyses every question the student has ever answered.
   ================================================================ */
function analysePerformance(history) {

  /* Maps: topicKey → { correct, total, subject, topic, subtopic, lastSeen } */
  const topicMap   = {};
  const subjectMap = {};

  let totalCorrect  = 0;
  let totalAttempted = 0;

  history.forEach(session => {
    if (!session.subjectResults) return;

    Object.entries(session.subjectResults).forEach(([sid, sr]) => {
      if (!subjectMap[sid]) subjectMap[sid] = { correct: 0, total: 0 };

      (sr.questions || []).forEach(q => {
        if (!q.userAnswer) return; /* skipped questions don't count */

        totalAttempted++;
        subjectMap[sid].total++;

        const isCorrect = q.userAnswer === q.correct;
        if (isCorrect) {
          totalCorrect++;
          subjectMap[sid].correct++;
        }

        /* Topic-level tracking */
        const topicKey = `${sid}|||${q.topic || 'General'}|||${q.subtopic || ''}`;
        if (!topicMap[topicKey]) {
          topicMap[topicKey] = {
            subject:  sid,
            topic:    q.topic || 'General',
            subtopic: q.subtopic || '',
            correct:  0,
            total:    0,
            lastSeen: session.date,
          };
        }
        topicMap[topicKey].total++;
        if (isCorrect) topicMap[topicKey].correct++;
        /* Update last seen to most recent session */
        if (new Date(session.date) > new Date(topicMap[topicKey].lastSeen)) {
          topicMap[topicKey].lastSeen = session.date;
        }
      });
    });
  });

  /* Calculate accuracy for each topic */
  const topics = Object.values(topicMap).map(t => ({
    ...t,
    accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    missed:   t.total - t.correct,
    /* Priority score: lower accuracy + more attempts = higher priority */
    priority: (100 - (t.total > 0 ? Math.round((t.correct/t.total)*100) : 100)) +
              Math.min(t.total * 2, 40),
  }));

  /* Sort: highest priority (weakest, most attempted) first */
  topics.sort((a, b) => b.priority - a.priority);

  /* Subjects sorted weakest first */
  const subjects = Object.entries(subjectMap).map(([sid, s]) => ({
    id:       sid,
    correct:  s.correct,
    total:    s.total,
    accuracy: s.total > 0 ? Math.round((s.correct/s.total)*100) : 0,
  })).sort((a, b) => a.accuracy - b.accuracy);

  /* Calculate overall */
  const overallPct = totalAttempted > 0
    ? Math.round((totalCorrect / totalAttempted) * 100)
    : 0;

  /* Study plan: next 3 days — top 3 weakest DIFFERENT subjects */
  const usedSubjects = new Set();
  const studyPlan = [];
  for (const t of topics) {
    if (!usedSubjects.has(t.subject) && studyPlan.length < 3) {
      usedSubjects.add(t.subject);
      studyPlan.push(t);
    }
  }

  /* Strengths: topics with accuracy >= 70% and at least 3 attempts */
  const strengths = topics
    .filter(t => t.accuracy >= 70 && t.total >= 3)
    .sort((a, b) => b.accuracy - a.accuracy)
    .slice(0, 5);

  /* Sessions count and streak */
  const sessions = history.length;
  const streak   = calculateStreak(history);

  return {
    overallPct,
    totalCorrect,
    totalAttempted,
    sessions,
    streak,
    weakTopics:  topics.filter(t => t.accuracy < 60).slice(0, 10),
    allTopics:   topics,
    subjects,
    studyPlan,
    strengths,
    topPriority: topics.find(t => t.accuracy < 60) || null,
  };
}

function calculateStreak(history) {
  if (history.length === 0) return 0;
  const today    = new Date();
  today.setHours(0,0,0,0);
  let streak = 0;
  let checkDate = new Date(today);

  const sessionDates = new Set(
    history.map(h => {
      const d = new Date(h.date);
      d.setHours(0,0,0,0);
      return d.toDateString();
    })
  );

  while (true) {
    if (sessionDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

/* ================================================================
   RENDER
   ================================================================ */
function renderCoachPage(a) {

  /* Score ring */
  const ring = document.getElementById('scoreRing');
  if (ring) {
    const deg = (a.overallPct / 100) * 360;
    ring.style.background = `conic-gradient(var(--gold) ${deg}deg, rgba(255,255,255,0.12) ${deg}deg)`;
  }

  setEl('scorePct',   a.overallPct + '%');
  setEl('scoreTitle', gradeTitle(a.overallPct));
  setEl('scoreSub',   `Based on ${a.totalAttempted} questions answered`);

  setEl('qsAttempted', a.totalAttempted);
  setEl('qsCorrect',   a.totalCorrect);
  setEl('qsSessions',  a.sessions);
  setEl('qsStreak',    a.streak + (a.streak === 1 ? ' day' : ' days'));

  /* Priority weakness */
  if (a.topPriority) {
    const p = a.topPriority;
    document.getElementById('prioritySection').style.display = 'block';
    setEl('priorityTopic',    p.topic + (p.subtopic ? ' — ' + p.subtopic : ''));
    setEl('prioritySubject',  SUBJECT_NAMES[p.subject] || p.subject);
    setEl('priorityPct',      p.accuracy + '%');
    setEl('priorityAttempts', p.total);
    setEl('priorityMissed',   p.missed);

    const url = `practice.html?subjects=${p.subject}&mode=practice&topic_filter=${encodeURIComponent(p.topic)}`;
    document.getElementById('priorityCTA').href      = url;
    document.getElementById('coachPracticeBtn').href = url;
  }

  /* Weak topics list */
  const weakEl = document.getElementById('weakTopicsList');
  if (a.weakTopics.length === 0) {
    weakEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px;">No weak topics found. Keep practising!</div>';
  } else {
    weakEl.innerHTML = a.weakTopics.map((t, i) => {
      const color = t.accuracy < 30 ? 'var(--red)' : t.accuracy < 50 ? 'var(--amber)' : 'var(--gold)';
      const url   = `practice.html?subjects=${t.subject}&mode=practice&topic_filter=${encodeURIComponent(t.topic)}`;
      return `
        <div class="topic-bar-row">
          <div class="topic-bar-rank">#${i+1}</div>
          <div class="topic-bar-info">
            <div class="topic-bar-name">${t.topic}${t.subtopic ? ' · ' + t.subtopic : ''}</div>
            <div class="topic-bar-subject">${SUBJECT_NAMES[t.subject] || t.subject} · ${t.total} attempts</div>
          </div>
          <div class="topic-bar-track">
            <div class="topic-bar-pct" style="color:${color};">${t.accuracy}%</div>
            <div class="topic-bar-fill">
              <div class="topic-bar-fill-inner" style="width:${t.accuracy}%;background:${color};"></div>
            </div>
          </div>
          <a href="${url}" class="practice-btn-sm">Fix →</a>
        </div>`;
    }).join('');
  }

  /* Subject breakdown */
  const subEl = document.getElementById('subjectBreakdown');
  if (a.subjects.length === 0) {
    subEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px;">No subject data yet.</div>';
  } else {
    subEl.innerHTML = a.subjects.map(s => {
      const color = s.accuracy >= 70 ? 'var(--green)' : s.accuracy >= 50 ? 'var(--amber)' : 'var(--red)';
      return `
        <div class="subject-row">
          <div class="subject-icon">${SUBJECT_ICONS[s.id] || '📚'}</div>
          <div class="subject-info">
            <div class="subject-name">${SUBJECT_NAMES[s.id] || s.id}</div>
            <div class="subject-score">${s.correct}/${s.total} correct</div>
          </div>
          <div class="subject-pct" style="color:${color};">${s.accuracy}%</div>
        </div>`;
    }).join('');
  }

  /* 3-day study plan */
  const planEl = document.getElementById('studyPlan');
  if (a.studyPlan.length === 0) {
    planEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px;">Complete a session to get your plan.</div>';
  } else {
    const days = ['Today', 'Tomorrow', 'Day 3'];
    planEl.innerHTML = a.studyPlan.map((t, i) => `
      <div class="day-card ${i===0?'today':''}">
        <div class="day-label">${days[i]}</div>
        <div class="day-topic">${t.topic}${t.subtopic ? ' — ' + t.subtopic : ''}</div>
        <div class="day-subject">${SUBJECT_NAMES[t.subject] || t.subject} · Currently ${t.accuracy}% accuracy</div>
      </div>`).join('');
  }

  /* Strengths */
  const strEl = document.getElementById('strengthsList');
  if (a.strengths.length === 0) {
    strEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-soft);font-size:13px;">Keep practising to discover your strengths.</div>';
  } else {
    strEl.innerHTML = a.strengths.map(t => `
      <div class="topic-bar-row">
        <div class="topic-bar-info">
          <div class="topic-bar-name">💪 ${t.topic}${t.subtopic ? ' · ' + t.subtopic : ''}</div>
          <div class="topic-bar-subject">${SUBJECT_NAMES[t.subject] || t.subject} · ${t.total} attempts</div>
        </div>
        <div class="topic-bar-track">
          <div class="topic-bar-pct" style="color:var(--green);">${t.accuracy}%</div>
          <div class="topic-bar-fill">
            <div class="topic-bar-fill-inner" style="width:${t.accuracy}%;background:var(--green);"></div>
          </div>
        </div>
      </div>`).join('');
  }
}

function gradeTitle(pct) {
  if (pct >= 80) return '🏆 Excellent Performance!';
  if (pct >= 65) return '👍 Good Progress';
  if (pct >= 50) return '📈 Getting There';
  if (pct >= 30) return '💪 Keep Pushing';
  return '🎯 Let\'s Build From Here';
}

function showEmptyState() {
  setEl('scorePct',   '—');
  setEl('scoreTitle', 'No sessions yet');
  setEl('scoreSub',   'Complete a practice session to activate Coach Mode');
  setEl('qsAttempted','0');
  setEl('qsCorrect',  '0');
  setEl('qsSessions', '0');
  setEl('qsStreak',   '0');
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* Toast */
let tt;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 2500);
}
