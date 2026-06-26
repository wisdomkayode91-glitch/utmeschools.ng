/* ============================================================
   UTMESchools v2 — results.js
   Reads result data from sessionStorage (set by practice.js).
   Shows: score ring, per-subject bars, topic table, full corrections.
   ============================================================ */

const SUBJECT_NAMES = {
  english:'English Language', mathematics:'Mathematics',
  physics:'Physics', chemistry:'Chemistry', biology:'Biology',
  government:'Government', economics:'Economics', literature:'Literature',
  crk:'CRK', irk:'IRK', geography:'Geography', commerce:'Commerce',
  accounts:'Accounts', agriculture:'Agriculture', computer:'Computer Studies',
  fineart:'Fine Art', french:'French', hausa:'Hausa', history:'History',
  homeec:'Home Economics', igbo:'Igbo', music:'Music',
  phe:'PHE', lekki:'The Lekki Headmaster', yoruba:'Yoruba', littext:'Lit Textbooks',
};

let result = null;
let correctionFilterSubject = 'all';

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  result = loadResult();
  if (!result) { showNoResult(); return; }

  renderScoreHero();
  renderBreakdown();
  renderTopics();
  renderCorrections();
  renderShare();
  bindTabs();
  bindEvents();

  // Animate ring after short delay
  setTimeout(animateRing, 200);
});

/* ================================================================
   LOAD DATA
   ================================================================ */
function loadResult() {
  try {
    const raw = sessionStorage.getItem('utme_result');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch(e) {
    return null;
  }
}

function showNoResult() {
  document.getElementById('scoreHero').innerHTML =
    '<div style="color:#9FB0CB;padding:40px 20px;text-align:center;">' +
    '<div style="font-size:32px;margin-bottom:10px;">📋</div>' +
    '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:8px;">No result found</div>' +
    '<div style="font-size:13px;">Complete a practice session first.</div>' +
    '<a href="select-subjects.html" style="display:inline-block;margin-top:16px;padding:10px 20px;background:var(--orange);color:#fff;border-radius:99px;font-weight:700;font-size:13px;">Start Practicing</a>' +
    '</div>';
}

/* ================================================================
   SCORE HERO
   ================================================================ */
function renderScoreHero() {
  const pct = Math.round((result.totalCorrect / result.totalPossible) * 100) || 0;

  document.getElementById('scorePct').textContent = pct + '%';
  document.getElementById('scoreFraction').textContent =
    result.totalCorrect + ' / ' + result.totalPossible;

  // Badge
  const badge = document.getElementById('scoreBadge');
  if (pct >= 70) {
    badge.textContent = '🏆 Excellent';
    badge.className = 'score-badge excellent';
  } else if (pct >= 50) {
    badge.textContent = '✅ Good';
    badge.className = 'score-badge good';
  } else if (pct >= 40) {
    badge.textContent = '⚠️ Average';
    badge.className = 'score-badge average';
  } else {
    badge.textContent = '📚 Keep Studying';
    badge.className = 'score-badge poor';
  }

  // Meta info
  const date = new Date(result.date);
  const dateStr = date.toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
  const timeStr = date.toLocaleTimeString('en-NG', { hour:'2-digit', minute:'2-digit' });
  const modeLabel = result.mode === 'mock' ? 'Mock Exam' : result.mode === 'study' ? 'Study' : 'Practice';
  const timeTaken = formatTime(result.timeTaken);
  const subjectList = result.subjects.map(id => SUBJECT_NAMES[id] || id).join(', ');

  document.getElementById('scoreMeta').innerHTML =
    `${modeLabel} · ${dateStr} at ${timeStr}<br>` +
    `Time used: ${timeTaken}<br>` +
    `<span style="font-size:11px;opacity:0.7;">${subjectList}</span>`;

  // Ring colour
  const ringFill = document.getElementById('ringFill');
  ringFill.setAttribute('stroke',
    pct >= 70 ? '#FFD23F' :
    pct >= 50 ? '#0FA968' :
    pct >= 40 ? '#FF6B35' : '#C0392B'
  );
  ringFill._targetPct = pct;
}

function animateRing() {
  const ring = document.getElementById('ringFill');
  if (!ring) return;
  const circumference = 364.4; // 2π × 58
  const pct = ring._targetPct || 0;
  const offset = circumference - (pct / 100) * circumference;
  ring.style.strokeDashoffset = offset;
}

/* ================================================================
   BREAKDOWN TAB
   ================================================================ */
function renderBreakdown() {
  // Motivation box
  const pct = Math.round((result.totalCorrect / result.totalPossible) * 100) || 0;
  const motBox = document.getElementById('motivationBox');
  const motText = document.getElementById('motivationText');
  let msg = '';
  if (pct >= 70) {
    msg = `<strong>Outstanding!</strong> You scored ${pct}% — that's well above the average. Keep this up and JAMB will not catch you sleeping.`;
  } else if (pct >= 50) {
    msg = `<strong>Good effort!</strong> ${pct}% is a solid start. Look at the Topics tab to find where to focus your revision next.`;
  } else if (pct >= 40) {
    msg = `<strong>You're making progress.</strong> ${pct}% — every practice session builds you stronger. Check your corrections and try again.`;
  } else {
    msg = `<strong>Don't be discouraged.</strong> ${pct}% today means you've identified exactly what needs work. Open the Corrections tab — that's your study guide.`;
  }
  motText.innerHTML = msg;
  motBox.style.display = 'block';

  // Subject bars
  const container = document.getElementById('subjectBreakdown');
  container.innerHTML = '';

  result.subjects.forEach(id => {
    const s = result.subjectScores[id];
    if (!s) return;
    const subPct = Math.round((s.correct / s.total) * 100) || 0;
    const barColor = subPct >= 60 ? 'var(--green)' : subPct >= 40 ? 'var(--orange)' : '#C0392B';
    const scoreClass = subPct >= 60 ? 'good' : subPct >= 40 ? 'mid' : 'low';
    const name = SUBJECT_NAMES[id] || id;

    const row = document.createElement('div');
    row.className = 'sb-row';
    row.innerHTML = `
      <div class="sb-head">
        <div class="sb-name">${name}</div>
        <div class="sb-score ${scoreClass}">${s.correct}/${s.total} · ${subPct}%</div>
      </div>
      <div class="sb-bar-track">
        <div class="sb-bar-fill" style="width:0%; background:${barColor};" data-width="${subPct}%"></div>
      </div>
    `;
    container.appendChild(row);
  });

  // Animate bars
  setTimeout(() => {
    document.querySelectorAll('.sb-bar-fill').forEach(bar => {
      bar.style.width = bar.dataset.width;
    });
  }, 300);
}

/* ================================================================
   TOPICS TAB
   ================================================================ */
function renderTopics() {
  const container = document.getElementById('topicAnalysis');
  container.innerHTML = '';

  result.subjects.forEach(id => {
    const s = result.subjectScores[id];
    if (!s) return;

    // Aggregate by topic
    const topicMap = {};
    (s.questions || []).forEach(q => {
      const key = q.topic || 'General';
      if (!topicMap[key]) topicMap[key] = { correct: 0, total: 0 };
      topicMap[key].total++;
      if (q.userAnswer === q.correct) topicMap[key].correct++;
    });

    const topics = Object.entries(topicMap)
      .map(([topic, data]) => ({
        topic,
        correct: data.correct,
        total: data.total,
        pct: Math.round((data.correct / data.total) * 100),
      }))
      .sort((a, b) => b.pct - a.pct);

    const section = document.createElement('div');
    section.className = 'topic-section';

    const subjectPct = Math.round((s.correct / s.total) * 100) || 0;
    const sClass = subjectPct >= 60 ? 'good' : subjectPct >= 40 ? 'mid' : 'low';

    section.innerHTML = `
      <div class="topic-section-title">
        ${SUBJECT_NAMES[id] || id}
        <span class="topic-score-pill ${sClass}" style="float:right;">${s.correct}/${s.total}</span>
      </div>
      <table class="topic-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Topic</th>
            <th>Score</th>
            <th>Qs</th>
          </tr>
        </thead>
        <tbody id="topicBody_${id}"></tbody>
      </table>
    `;
    container.appendChild(section);

    const tbody = section.querySelector('#topicBody_' + id);
    topics.forEach((t, idx) => {
      const pillClass = t.pct >= 60 ? 'good' : t.pct >= 40 ? 'mid' : 'low';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rank">${idx + 1}</td>
        <td>${t.topic}</td>
        <td><span class="topic-score-pill ${pillClass}">${t.correct}/${t.total} · ${t.pct}%</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--ink-soft);">${t.total}</td>
      `;
      tbody.appendChild(tr);
    });
  });
}

/* ================================================================
   CORRECTIONS TAB
   ================================================================ */
function renderCorrections(filterSubject) {
  correctionFilterSubject = filterSubject || 'all';

  // Build filter chips
  const filterBar = document.getElementById('correctionFilter');
  filterBar.innerHTML = '';
  const allChip = document.createElement('button');
  allChip.className = 'filter-chip' + (correctionFilterSubject === 'all' ? ' active' : '');
  allChip.textContent = 'All';
  allChip.addEventListener('click', () => renderCorrections('all'));
  filterBar.appendChild(allChip);

  result.subjects.forEach(id => {
    const chip = document.createElement('button');
    chip.className = 'filter-chip' + (correctionFilterSubject === id ? ' active' : '');
    chip.textContent = SUBJECT_NAMES[id] || id;
    chip.addEventListener('click', () => renderCorrections(id));
    filterBar.appendChild(chip);
  });

  // Build correction cards
  const list = document.getElementById('correctionList');
  list.innerHTML = '';

  let qNum = 0;

  result.subjects.forEach(id => {
    if (correctionFilterSubject !== 'all' && correctionFilterSubject !== id) return;
    const s = result.subjectScores[id];
    if (!s) return;

    (s.questions || []).forEach(q => {
      qNum++;
      const isCorrect = q.userAnswer === q.correct;
      const isSkipped = !q.userAnswer;

      const card = document.createElement('div');
      card.className = 'correction-card';

      const statusText = isSkipped ? 'Skipped' : isCorrect ? '✓ Correct' : '✗ Wrong';
      const statusClass = isSkipped ? 'skipped' : isCorrect ? 'correct' : 'wrong';

      let optionsHtml = '';
      ['A','B','C','D'].forEach(letter => {
        const optText = q['opt' + letter];
        const isCorrectOpt = letter === q.correct;
        const isUserOpt = letter === q.userAnswer;
        let cls = 'corr-opt';
        let labelHtml = '';
        if (isCorrectOpt) { cls += ' correct'; labelHtml = '<span class="corr-label ans">Answer</span>'; }
        if (isUserOpt && !isCorrectOpt) { cls += ' selected-wrong'; labelHtml = '<span class="corr-label you">Your answer</span>'; }
        optionsHtml += `<div class="${cls}">
          <span class="corr-letter">${letter}</span>
          <span style="flex:1;font-size:12.5px;">${optText}</span>
          ${labelHtml}
        </div>`;
      });

      const diagramHtml = q.hasSvg && q.svgCode
        ? `<div class="corr-diagram">${q.svgCode}</div>` : '';

      card.innerHTML = `
        <div class="correction-card-head">
          <span class="cc-qnum">Q${qNum}</span>
          <span class="cc-status ${statusClass}">${statusText}</span>
          <span class="cc-topic">${q.topic || ''}</span>
        </div>
        <div class="correction-body">
          ${diagramHtml}
          <div class="correction-qtext">${q.text}</div>
          <div class="correction-options">${optionsHtml}</div>
          <div class="correction-explanation">
            <div class="corr-ex-label">💡 EXPLANATION</div>
            ${escHtml(q.explanation || 'No explanation available.').replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  });

  if (list.children.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--ink-soft);padding:30px;font-size:13px;">No questions to show.</p>';
  }
}

/* ================================================================
   SHARE TAB
   ================================================================ */
function renderShare() {
  const pct = Math.round((result.totalCorrect / result.totalPossible) * 100) || 0;
  const date = new Date(result.date).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' });
  const modeLabel = result.mode === 'mock' ? 'Mock Exam' : result.mode === 'study' ? 'Study' : 'Practice';

  let lines = [
    `📊 My UTMESchools Result`,
    `Mode: ${modeLabel} · ${date}`,
    `Total: ${result.totalCorrect}/${result.totalPossible} (${pct}%)`,
    ``,
  ];

  result.subjects.forEach(id => {
    const s = result.subjectScores[id];
    if (!s) return;
    const subPct = Math.round((s.correct / s.total) * 100) || 0;
    lines.push(`${SUBJECT_NAMES[id] || id}: ${s.correct}/${s.total} (${subPct}%)`);
  });

  lines.push(``, `Practice at utmeschools.ng`);

  const shareText = lines.join('\n');
  document.getElementById('shareTextPreview').textContent = shareText;

  // WhatsApp
  document.getElementById('shareWhatsAppBtn').addEventListener('click', () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  });

  // Copy
  document.getElementById('copyTextBtn').addEventListener('click', () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => showToast('📋 Copied!'));
    } else {
      showToast('Copy not supported on this browser');
    }
  });
}

/* ================================================================
   TABS
   ================================================================ */
function bindTabs() {
  document.querySelectorAll('.result-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    });
  });
}

/* ================================================================
   EVENTS
   ================================================================ */
function bindEvents() {
  document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'select-subjects.html';
  });

  document.getElementById('viewCorrectionBtn').addEventListener('click', () => {
    // Switch to corrections tab
    document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelector('[data-tab="corrections"]').classList.add('active');
    document.getElementById('panel-corrections').classList.add('active');
    // Scroll to tabs
    document.querySelector('.result-tabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ================================================================
   UTILITIES
   ================================================================ */
function formatTime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function escHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
                          }
      
