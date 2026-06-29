/* ============================================================
   UTMESchools v2 — results.js
   ============================================================ */

const ALL_SUBJECTS = [
  { id: 'english',     name: 'English Language',  icon: '🔤', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'mathematics', name: 'Mathematics',        icon: '📐', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'physics',     name: 'Physics',            icon: '⚛️', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'chemistry',   name: 'Chemistry',          icon: '⚗️', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'biology',     name: 'Biology',            icon: '🧬', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'government',  name: 'Government',         icon: '🏛️', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'economics',   name: 'Economics',          icon: '📈', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'literature',  name: 'Literature',         icon: '📚', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'crk',         name: 'CRK',                icon: '✝️', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'irk',         name: 'IRK',                icon: '☪️', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'geography',   name: 'Geography',          icon: '🌍', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'commerce',    name: 'Commerce',           icon: '🛒', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'accounts',    name: 'Accounts',           icon: '🧾', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'agriculture', name: 'Agriculture',        icon: '🌾', bg: '#E8F1FF', fg: '#1F5FBF' },
  { id: 'computer',    name: 'Computer Studies',   icon: '💻', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'fineart',     name: 'Fine Art',           icon: '🎨', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'french',      name: 'French',             icon: '🇫🇷', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'hausa',       name: 'Hausa',              icon: '📜', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'history',     name: 'History',            icon: '🏺', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'homeec',      name: 'Home Economics',     icon: '🏠', bg: '#FCE4E4', fg: '#C0392B' },
  { id: 'igbo',        name: 'Igbo',               icon: '📖', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'music',       name: 'Music',              icon: '🎵', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'phe',         name: 'PHE',                icon: '🏃', bg: '#E7F8EF', fg: '#0C8C58' },
  { id: 'lekki',       name: 'The Lekki Headmaster',icon: '📕', bg: '#F1EAFB', fg: '#6C3FBF' },
  { id: 'yoruba',      name: 'Yoruba',             icon: '🌺', bg: '#FFF4DC', fg: '#A6760A' },
  { id: 'littext',     name: 'Literature Textbooks',icon: '📗', bg: '#E7F8EF', fg: '#0C8C58' },
];

function getSubject(id) { return ALL_SUBJECTS.find(s => s.id === id); }

/* ---- Read result ---- */
let result = null;
try {
  const raw = sessionStorage.getItem('utme_result');
  if (raw) result = JSON.parse(raw);
} catch(e) {}

if (!result) {
  document.getElementById('resultMain').style.display = 'none';
  document.getElementById('noResult').style.display   = 'block';
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return h + 'h ' + m + 'm ' + s + 's';
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
}

/* ============================================================
   RENDER
   ============================================================ */
function renderResults() {
  if (!result) return;

  var pct = result.totalPossible > 0
    ? Math.round((result.totalScore / result.totalPossible) * 100) : 0;

  /* Ring animation */
  var circumference = 2 * Math.PI * 60;
  var offset = circumference - (pct / 100) * circumference;
  setTimeout(function() {
    var ring = document.getElementById('scoreRing');
    if (!ring) return;
    ring.style.strokeDashoffset = offset;
    if (pct < 40)      ring.style.stroke = '#C0392B';
    else if (pct < 60) ring.style.stroke = '#FFD23F';
    else               ring.style.stroke = '#0FA968';
  }, 100);

  document.getElementById('scorePct').textContent   = pct + '%';
  var modeLabel = result.mode === 'mock' ? 'Mock Exam'
                : result.mode === 'study' ? 'Study Session' : 'Practice Result';
  document.getElementById('scoreTitle').textContent =
    result.totalScore + '/' + result.totalPossible + ' — ' + modeLabel;

  var subjNames = (result.subjects || []).map(function(sid) {
    return (getSubject(sid) || {name: sid}).name;
  }).join(', ');

  document.getElementById('metaSubjects').textContent = '📚 ' + (subjNames.length > 35 ? subjNames.slice(0,35)+'…' : subjNames);
  document.getElementById('metaDate').textContent     = '📅 ' + formatDate(result.date || new Date().toISOString());
  document.getElementById('metaTime').textContent     = '⏱ ' + formatTime(result.timeTaken || 0);
  document.getElementById('metaMode').textContent     = '📝 ' + modeLabel;

  /* Subject bars */
  var breakdown = document.getElementById('subjectBreakdown');
  breakdown.innerHTML = '';
  (result.subjects || []).forEach(function(sid) {
    var s  = getSubject(sid) || { name: sid, icon: '📚', bg: '#eee', fg: '#333' };
    var sc = (result.subjectScores || {})[sid] || { score:0, possible:0 };
    var sp = sc.possible > 0 ? Math.round((sc.score / sc.possible) * 100) : 0;
    var barClass = sp >= 60 ? 'green' : sp >= 40 ? 'amber' : 'red';
    var row = document.createElement('div');
    row.className = 'subj-score';
    row.innerHTML =
      '<div class="subj-score-icon" style="background:' + s.bg + ';color:' + s.fg + ';">' + s.icon + '</div>' +
      '<div class="subj-score-info">' +
        '<div class="subj-score-name">' + s.name + '</div>' +
        '<div class="subj-score-bar-wrap"><div class="subj-score-bar ' + barClass + '" style="width:' + sp + '%"></div></div>' +
      '</div>' +
      '<div class="subj-score-val">' + sc.score + '/' + sc.possible + '</div>';
    breakdown.appendChild(row);
  });

  /* Topic table */
  var tbody = document.getElementById('topicTableBody');
  tbody.innerHTML = '';
  var topicMap = {};
  (result.questions || []).forEach(function(q) {
    var key = (q.topic || 'General') + ' : ' + (q.subtopic || 'General');
    if (!topicMap[key]) topicMap[key] = { topic: q.topic||'General', subtopic: q.subtopic||'General', correct:0, total:0 };
    topicMap[key].total++;
    if (q.isCorrect) topicMap[key].correct++;
  });

  var rows = Object.values(topicMap).sort(function(a,b){ return (a.correct/a.total)-(b.correct/b.total); });
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:20px;">No topic data available</td></tr>';
  }
  rows.forEach(function(r, idx) {
    var p = r.total > 0 ? Math.round((r.correct/r.total)*100) : 0;
    var cls = p >= 60 ? 'good' : p >= 40 ? 'mid' : 'bad';
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="rank">' + (idx+1) + '</td>' +
      '<td><strong>' + r.topic + '</strong><br><span style="color:var(--ink-soft);font-size:11px;">' + r.subtopic + '</span></td>' +
      '<td class="score ' + cls + '">' + p + '%</td>' +
      '<td class="score">' + r.correct + '/' + r.total + '</td>';
    tbody.appendChild(tr);
  });
}

/* ============================================================
   CORRECTION VIEW
   ============================================================ */
function openCorrection() {
  var body = document.getElementById('correctionBody');
  body.innerHTML = '';

  if (!result || !result.questions || result.questions.length === 0) {
    body.innerHTML = '<p style="text-align:center;color:var(--ink-soft);padding:40px;">No questions to display</p>';
  } else {
    result.questions.forEach(function(q, idx) {
      var s = getSubject(q.subjectId) || { name: q.subjectId, icon: '📚' };
      var cq = document.createElement('div');
      cq.className = 'correction-q';

      var optsHtml = '';
      (q.options || []).forEach(function(opt, oi) {
        var letter = String.fromCharCode(65 + oi);
        var cls = letter === q.correct ? 'correct'
                : (letter === q.userAnswer && letter !== q.correct) ? 'wrong' : 'neutral';
        var dot = cls === 'correct' ? '✓' : cls === 'wrong' ? '✗' : letter;
        optsHtml +=
          '<div class="cq-opt ' + cls + '">' +
            '<div class="dot">' + dot + '</div>' +
            '<div>' + escHtml(opt.replace(/^[A-D]\.\s*/,'')) + '</div>' +
          '</div>';
      });

      cq.innerHTML =
        '<div class="cq-meta">' +
          '<span>' + s.icon + ' ' + s.name + '</span>' +
          '<span>Q' + (idx+1) + '</span>' +
          '<span>' + (q.topic||'General') + '</span>' +
          '<span style="color:' + (q.isCorrect ? 'var(--green)' : '#C0392B') + ';">' + (q.isCorrect ? '✓ Correct' : '✗ Wrong') + '</span>' +
        '</div>' +
        '<div class="cq-text">' + escHtml(q.text||'') + '</div>' +
        optsHtml +
        '<div class="cq-ex"><div class="cq-ex-label">Explanation</div><div>' + escHtml(q.explanation||'No explanation available.') + '</div></div>';
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
  var pct = result.totalPossible > 0 ? Math.round((result.totalScore/result.totalPossible)*100) : 0;
  var subjNames = (result.subjects||[]).map(function(s){ return (getSubject(s)||{name:s}).name; }).join(', ');
  var modeLabel = result.mode === 'mock' ? 'Mock Exam' : result.mode === 'study' ? 'Study Session' : 'Practice';
  var text =
    '🎓 My UTMESchools Result 🎓\n' +
    '📚 ' + subjNames + '\n' +
    '📝 ' + modeLabel + '\n' +
    '✅ Score: ' + result.totalScore + '/' + result.totalPossible + ' (' + pct + '%)\n' +
    '⏱ Time: ' + formatTime(result.timeTaken||0) + '\n\n' +
    'Practice JAMB past questions at UTMESchools!';

  document.getElementById('shareText').textContent = text;
  document.getElementById('shareWaBtn').href = 'https://wa.me/?text=' + encodeURIComponent(text);
  document.getElementById('shareOverlay').classList.add('open');
}

function closeShare() {
  document.getElementById('shareOverlay').classList.remove('open');
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){ t.classList.remove('show'); }, 2000);
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  renderResults();

  document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'select-subjects.html';
  });

  document.getElementById('viewCorrectionBtn').addEventListener('click', openCorrection);
  document.getElementById('correctionBack').addEventListener('click', closeCorrection);
  document.getElementById('tryAgainBtn').addEventListener('click', function() {
    window.location.href = 'select-subjects.html';
  });
  document.getElementById('shareBtn').addEventListener('click', openShare);
  document.getElementById('shareCloseBtn').addEventListener('click', closeShare);
  document.getElementById('shareOverlay').addEventListener('click', function(e) {
    if (e.target === document.getElementById('shareOverlay')) closeShare();
  });
  document.getElementById('shareCopyBtn').addEventListener('click', function() {
    var text = document.getElementById('shareText').textContent;
    navigator.clipboard.writeText(text)
      .then(function(){ showToast('Copied!'); })
      .catch(function(){ showToast('Copy failed'); });
  });
  document.getElementById('dashboardBtn').addEventListener('click', function() {
    window.location.href = 'dashboard.html';
  });
});
       
