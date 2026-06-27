
# Build results.js - the results logic
results_js = '''/* ============================================================
   UTMESchools v2 — results.js
   Displays score, subject breakdown, topic analysis, and
   correction view. Reads result data from sessionStorage.
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',       icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'accounts',    name: 'Accounts',               icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'agriculture', name: 'Agriculture',            icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'biology',     name: 'Biology',                icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'chemistry',   name: 'Chemistry',              icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'commerce',    name: 'Commerce',               icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'computer',    name: 'Computer Studies',       icon: '💻', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'crk',         name: 'CRK',                    icon: '✝️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'economics',   name: 'Economics',              icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'fineart',     name: 'Fine Art',               icon: '🎨', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'french',      name: 'French',                 icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'geography',   name: 'Geography',              icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'government',  name: 'Government',             icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'hausa',       name: 'Hausa',                  icon: '📜', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'history',     name: 'History',                icon: '🏺', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'homeec',      name: 'Home Economics',         icon: '🏠', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'igbo',        name: 'Igbo',                   icon: '📖', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'irk',         name: 'IRK',                    icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'literature',  name: 'Literature',             icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'littext',     name: 'Literature Textbooks',   icon: '📗', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'mathematics', name: 'Mathematics',            icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'music',       name: 'Music',                  icon: '🎵', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'phe',         name: 'PHE',                    icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'physics',     name: 'Physics',                icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'lekki',       name: 'The Lekki Headmaster',   icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'yoruba',      name: 'Yoruba',                 icon: '🌺', bg: '#FFF4DC', fg: '#A6760A' },
];

function getSubject(id) { return ALL_SUBJECTS.find(s => s.id === id); }

/* ---- Read result from sessionStorage ---- */
let result = null;
try {
  const raw = sessionStorage.getItem('utme_result');
  if (raw) result = JSON.parse(raw);
} catch(e) { console.error('Failed to parse result:', e); }

/* ---- No result state ---- */
if (!result) {
  document.getElementById('resultMain').style.display = 'none';
  document.getElementById('noResult').style.display = 'block';
}

/* ---- Format helpers ---- */
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ============================================================
   RENDER RESULTS
   ============================================================ */
function renderResults() {
  if (!result) return;

  const { totalScore, totalPossible, timeTaken, mode, subjects, subjectScores, date } = result;
  const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;

  // Score ring animation
  const circumference = 2 * Math.PI * 60; // r=60
  const offset = circumference - (pct / 100) * circumference;
  setTimeout(() => {
    const ring = document.getElementById('scoreRing');
    ring.style.strokeDashoffset = offset;
    // Color based on score
    if (pct < 40) ring.style.stroke = '#C0392B';
    else if (pct < 60) ring.style.stroke = 'var(--gold)';
    else ring.style.stroke = 'var(--green)';
  }, 100);

  document.getElementById('scorePct').textContent = pct + '%';

  // Title
  const modeLabel = mode === 'mock' ? 'Mock Exam' : mode === 'study' ? 'Study Session' : 'Practice Result';
  document.getElementById('scoreTitle').textContent = `${totalScore}/${totalPossible} — ${modeLabel}`;

  // Meta
  const subjNames = subjects.map(sid => getSubject(sid)?.name || sid).join(', ');
  document.getElementById('metaSubjects').textContent = '📚 ' + (subjNames.length > 35 ? subjNames.slice(0, 35) + '…' : subjNames);
  document.getElementById('metaDate').textContent = '📅 ' + formatDate(date || new Date().toISOString());
  document.getElementById('metaTime').textContent = '⏱ ' + formatTime(timeTaken || 0);
  document.getElementById('metaMode').textContent = '📝 ' + modeLabel;

  // Subject breakdown
  const breakdown = document.getElementById('subjectBreakdown');
  breakdown.innerHTML = '';
  subjects.forEach(sid => {
    const s = getSubject(sid);
    const sc = subjectScores[sid] || { score: 0, possible: 0 };
    const subjPct = sc.possible > 0 ? Math.round((sc.score / sc.possible) * 100) : 0;

    const row = document.createElement('div');
    row.className = 'subj-score';
    let barColor = 'green';
    if (subjPct < 40) barColor = 'red';
    else if (subjPct < 60) barColor = 'amber';

    row.innerHTML = `
      <div class="subj-score-icon" style="background:${s?.bg || '#eee'};color:${s?.fg || '#333'};">${s?.icon || '📚'}</div>
      <div class="subj-score-info">
        <div class="subj-score-name">${s?.name || sid}</div>
        <div class="subj-score-bar-wrap">
          <div class="subj-score-bar ${barColor}" style="width:${subjPct}%"></div>
        </div>
      </div>
      <div class="subj-score-val">${sc.score}/${sc.possible}</div>
    `;
    breakdown.appendChild(row);
  });

  // Topic performance table
  const tbody = document.getElementById('topicTableBody');
  tbody.innerHTML = '';

  // Aggregate by topic/subtopic
  const topicMap = {};
  if (result.questions) {
    result.questions.forEach(q => {
      const key = `${q.topic || 'General'} : ${q.subtopic || 'General'}`;
      if (!topicMap[key]) topicMap[key] = { topic: q.topic || 'General', subtopic: q.subtopic || 'General', correct: 0, total: 0 };
      topicMap[key].total++;
      if (q.isCorrect) topicMap[key].correct++;
    });
  }

  const topicRows = Object.values(topicMap).sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
  topicRows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    const pctVal = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
    let scoreClass = 'good';
    if (pctVal < 40) scoreClass = 'bad';
    else if (pctVal < 60) scoreClass = 'mid';

    tr.innerHTML = `
      <td class="rank">${idx + 1}</td>
      <td><strong>${row.topic}</strong><br><span style="color:var(--ink-soft);font-size:11px;">${row.subtopic}</span></td>
      <td class="score ${scoreClass}">${pctVal}%</td>
      <td class="score">${row.correct}/${row.total}</td>
    `;
    tbody.appendChild(tr);
  });

  if (topicRows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:20px;">No topic data available</td></tr>';
  }
}

/* ============================================================
   CORRECTION VIEW
   ============================================================ */
function openCorrection() {
  const body = document.getElementById('correctionBody');
  body.innerHTML = '';

  if (!result || !result.questions) {
    body.innerHTML = '<p style="text-align:center;color:var(--ink-soft);padding:40px;">No questions to display</p>';
  } else {
    result.questions.forEach((q, idx) => {
      const cq = document.createElement('div');
      cq.className = 'correction-q';

      const s = getSubject(q.subjectId);
      const userAns = q.userAnswer;
      const correctAns = q.correct;

      let optsHtml = '';
      q.options.forEach((opt, oi) => {
        const letter = String.fromCharCode(65 + oi);
        let cls = 'neutral';
        if (letter === correctAns) cls = 'correct';
        else if (letter === userAns && letter !== correctAns) cls = 'wrong';

        let dotContent = letter;
        if (cls === 'correct') dotContent = '✓';
        if (cls === 'wrong') dotContent = '✗';

        optsHtml += `
          <div class="cq-opt ${cls}">
            <div class="dot">${dotContent}</div>
            <div>${opt.replace(/^[A-D]\\.\\s*/, '')}</div>
          </div>
        `;
      });

      cq.innerHTML = `
        <div class="cq-meta">
          <span>${s?.icon || '📚'} ${s?.name || q.subjectId}</span>
          <span>Q${idx + 1}</span>
          <span>${q.topic || 'General'}</span>
          <span style="color:${q.isCorrect ? 'var(--green)' : '#C0392B'};">${q.isCorrect ? '✓ Correct' : '✗ Wrong'}</span>
        </div>
        <div class="cq-text">${q.text}</div>
        ${optsHtml}
        <div class="cq-ex">
          <div class="cq-ex-label">Explanation</div>
          <div>${q.explanation || 'No explanation available.'}</div>
        </div>
      `;
      body.appendChild(cq);
    });
  }

  document.getElementById('correctionOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCorrection() {
  document.getElementById('correctionOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

/* ============================================================
   SHARE
   ============================================================ */
function openShare() {
  if (!result) return;
  const { totalScore, totalPossible, mode, subjects } = result;
  const pct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const subjNames = subjects.map(sid => getSubject(sid)?.name || sid).join(', ');
  const modeLabel = mode === 'mock' ? 'Mock Exam' : mode === 'study' ? 'Study Session' : 'Practice';

  const text = `🎓 My UTMESchools Result 🎓
📚 ${subjNames}
📝 ${modeLabel}
✅ Score: ${totalScore}/${totalPossible} (${pct}%)
⏱ Time: ${formatTime(result.timeTaken || 0)}

Practice JAMB past questions at UTMESchools!`;

  document.getElementById('shareText').textContent = text;
  document.getElementById('shareWaBtn').href =
    `https://wa.me/?text=${encodeURIComponent(text)}`;

  document.getElementById('shareOverlay').classList.add('open');
}

function closeShare() {
  document.getElementById('shareOverlay').classList.remove('open');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

/* ============================================================
   EVENT LISTENERS
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderResults();

  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'select-subjects.html';
  });

  document.getElementById('viewCorrectionBtn').addEventListener('click', openCorrection);
  document.getElementById('correctionBack').addEventListener('click', closeCorrection);

  document.getElementById('tryAgainBtn').addEventListener('click', () => {
    window.location.href = 'select-subjects.html';
  });

  document.getElementById('shareBtn').addEventListener('click', openShare);
  document.getElementById('shareCloseBtn').addEventListener('click', closeShare);
  document.getElementById('shareOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('shareOverlay')) closeShare();
  });
  document.getElementById('shareCopyBtn').addEventListener('click', () => {
    const text = document.getElementById('shareText').textContent;
    navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'))
      .catch(() => showToast('Copy failed'));
  });

  document.getElementById('dashboardBtn').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
});
'''

with open('/mnt/agents/output/results.js', 'w') as f:
    f.write(results_js)

print(f"results.js written: {len(results_js)} chars")
