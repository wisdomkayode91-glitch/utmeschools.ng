/* ============================================================
   UTMESchools v2 — result.js
   Reads from sessionStorage. No 404. No server needed.
   ============================================================ */

const SUBJECT_ICONS = {
  english:'🔤', mathematics:'📐', physics:'⚛️', chemistry:'⚗️', biology:'🧬',
  government:'🏛️', economics:'📈', literature:'📚', crk:'✝️', irk:'☪️',
  geography:'🌍', commerce:'🛒', accounts:'🧾', agriculture:'🌾', history:'🏺',
  homeec:'🏠', igbo:'📖', hausa:'📜', french:'🇫🇷', fineart:'🎨',
  computer:'💻', music:'🎵', phe:'🏃', lekki:'📕', littext:'📗', yoruba:'🌺',
};
const SUBJECT_NAMES = {
  english:'English Language', mathematics:'Mathematics', physics:'Physics',
  chemistry:'Chemistry', biology:'Biology', government:'Government',
  economics:'Economics', literature:'Literature', crk:'CRK', irk:'IRK',
  geography:'Geography', commerce:'Commerce', accounts:'Accounts',
  agriculture:'Agriculture', history:'History', homeec:'Home Economics',
  igbo:'Igbo', hausa:'Hausa', french:'French', fineart:'Fine Art',
  computer:'Computer Studies', music:'Music', phe:'PHE',
  lekki:'The Lekki Headmaster', littext:'Literature Textbooks', yoruba:'Yoruba',
};

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ================================================================
   LOAD RESULT
   ================================================================ */
let result = null;
try { result = JSON.parse(sessionStorage.getItem('utme_result') || 'null'); } catch(e) {}

if (!result) {
  /* Try last item in history */
  try {
    const history = JSON.parse(localStorage.getItem('utme_history') || '[]');
    if (history.length) result = history[0];
  } catch(e) {}
}

if (!result) {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('scorePct').textContent = '—';
    document.getElementById('scoreRaw').textContent = 'No result found';
    document.getElementById('scoreTitle').textContent = 'No Result';
    document.getElementById('heroMeta').textContent = 'Start a practice session to see your results here.';
  });
}

/* ================================================================
   RENDER
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (!result) return;

  const { subjectIds, subjectResults, mode, date, timeTaken } = result;

  /* Totals */
  let totalCorrect = 0, totalQ = 0;
  subjectIds.forEach(sid => {
    const sr = subjectResults[sid];
    totalCorrect += sr.correct;
    totalQ       += sr.total;
  });
  const pct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  /* Hero */
  document.getElementById('scorePct').textContent  = pct + '%';
  document.getElementById('scoreRaw').textContent  = `${totalCorrect} / ${totalQ} correct`;
  document.getElementById('scoreTitle').textContent = pct >= 70 ? '🎉 Excellent!' : pct >= 50 ? '👍 Good effort' : '💪 Keep practising';

  const d = new Date(date);
  const modeLabel = { practice:'Practice', mock:'Mock Exam', study:'Study' }[mode] || mode;
  const timeStr = timeTaken ? formatSecs(timeTaken) : '—';
  document.getElementById('heroMeta').textContent = `${modeLabel} · ${d.toLocaleDateString('en-NG')} · Time: ${timeStr}`;

  /* Subject bars */
  const barsEl = document.getElementById('subjectBars');
  subjectIds.forEach(sid => {
    const sr = subjectResults[sid];
    const spct = sr.total > 0 ? Math.round((sr.correct / sr.total) * 100) : 0;
    const color = spct >= 60 ? 'var(--green)' : spct >= 40 ? 'var(--amber)' : 'var(--red)';
    barsEl.innerHTML += `
      <div class="subj-bar-row">
        <div class="subj-bar-icon">${SUBJECT_ICONS[sid] || '📚'}</div>
        <div class="subj-bar-info">
          <div class="subj-bar-name">${SUBJECT_NAMES[sid] || sid}</div>
          <div class="subj-bar-score">${sr.correct}/${sr.total} · ${spct}%</div>
        </div>
        <div class="subj-bar-track" style="min-width:80px;">
          <div class="progress-bar"><div class="progress-fill" style="width:${spct}%;background:${color};"></div></div>
        </div>
      </div>`;
  });

  /* Topic table — aggregate across all subjects */
  const topicMap = {};
  subjectIds.forEach(sid => {
    (subjectResults[sid].questions || []).forEach(q => {
      const key = q.topic || 'General';
      if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 };
      topicMap[key].total++;
      if (q.userAnswer === q.correct) topicMap[key].correct++;
    });
  });
  const topicArr = Object.entries(topicMap)
    .map(([t, v]) => ({ topic: t, ...v, pct: Math.round((v.correct/v.total)*100) }))
    .sort((a,b) => a.pct - b.pct); // weakest first

  const tbody = document.getElementById('topicTableBody');
  topicArr.forEach((t, i) => {
    const color = t.pct >= 60 ? 'var(--green)' : t.pct >= 40 ? 'var(--amber)' : 'var(--red)';
    tbody.innerHTML += `<tr>
      <td style="color:var(--ink-soft);">${i+1}</td>
      <td>${t.topic}</td>
      <td class="topic-pct" style="color:${color};">${t.pct}%</td>
      <td style="color:var(--ink-soft);">${t.total}</td>
    </tr>`;
  });
  if (topicArr.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--ink-soft);padding:14px;">No topic data available.</td></tr>';
  }

  /* Coach Mode */
  const weakTopics = topicArr.slice(0, 3).map(t => t.topic);
  const strongTopics = [...topicArr].sort((a,b) => b.pct - a.pct).slice(0,1).map(t => t.topic);
  let coachMsg = '';
  if (pct >= 70) {
    coachMsg = `Great performance! You scored ${pct}%. Your strongest area is ${strongTopics[0] || 'General'}. Focus on ${weakTopics[0] || 'your weaker areas'} to push even higher.`;
  } else if (pct >= 50) {
    coachMsg = `Good effort — ${pct}% shows you understand the basics. To improve, focus on:\n• ${weakTopics.join('\n• ')}\n\nPractise these topics specifically this week.`;
  } else {
    coachMsg = `You scored ${pct}%. Don't be discouraged — every JAMB champion started here. Your top areas to revise:\n• ${weakTopics.join('\n• ')}\n\nStudy these topics in Study Mode for guided explanations.`;
  }
  document.getElementById('coachText').textContent = coachMsg;

  /* Share text */
  const shareText = `I just scored ${pct}% (${totalCorrect}/${totalQ}) on UTMESchools! 🎯\nSubject: ${subjectIds.map(s => SUBJECT_NAMES[s]||s).join(', ')}\nMode: ${modeLabel}\n\nPractise JAMB past questions free at utmeschools.ng`;
  document.getElementById('shareTextBox').textContent = shareText;
  document.getElementById('waShareBtn').href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  /* Correction panel */
  buildCorrectionPanel();

  /* Action buttons */
  document.getElementById('viewCorrectionBtn').addEventListener('click', openCorrection);
  document.getElementById('corrCloseBtn').addEventListener('click', closeCorrection);
  document.getElementById('shareBtn').addEventListener('click', openShare);
  document.getElementById('shareCloseBtn').addEventListener('click', closeShare);
  document.getElementById('shareOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('shareOverlay')) closeShare();
  });
  document.getElementById('copyShareBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(shareText).then(() => showToast('Copied!')).catch(() => showToast('Copy failed'));
  });
});

function formatSecs(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/* ================================================================
   CORRECTION PANEL
   ================================================================ */
function buildCorrectionPanel() {
  const list = document.getElementById('correctionList');
  list.innerHTML = '';
  const letters = ['A','B','C','D'];

  result.subjectIds.forEach(sid => {
    const qs = result.subjectResults[sid].questions || [];
    qs.forEach((q, i) => {
      const item = document.createElement('div');
      item.className = 'correction-item';

      const optionsHtml = (q.options || []).map((opt, oi) => {
        const letter = letters[oi];
        let cls = 'neutral';
        if (letter === q.correct) cls = 'correct';
        else if (letter === q.userAnswer) cls = 'wrong';
        const icons = letter === q.correct ? '✓' : (letter === q.userAnswer ? '✗' : '');
        return `<div class="corr-opt ${cls}"><span class="corr-opt-letter">${letter}</span><span>${icons} ${opt}</span></div>`;
      }).join('');

      item.innerHTML = `
        <div class="corr-num">Q${i+1} · ${q.year || ''} · ${q.topic || ''}</div>
        <div class="corr-text">${q.text}</div>
        <div class="corr-options">${optionsHtml}</div>
        ${q.userAnswer ? `<div style="font-size:12px;margin-bottom:6px;color:var(--ink-soft);">Your answer: <b>${q.userAnswer}</b> · Correct: <b>${q.correct}</b></div>` : '<div style="font-size:12px;margin-bottom:6px;color:var(--ink-soft);">Not answered · Correct: <b>'+q.correct+'</b></div>'}
        ${q.explanation ? `<div class="corr-expl">💡 ${q.explanation}</div>` : ''}
      `;
      list.appendChild(item);
    });
  });
}

function openCorrection()  { document.getElementById('correctionOverlay').classList.add('open'); }
function closeCorrection() { document.getElementById('correctionOverlay').classList.remove('open'); }
function openShare()  { document.getElementById('shareOverlay').classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeShare() { document.getElementById('shareOverlay').classList.remove('open'); document.body.style.overflow = ''; }
