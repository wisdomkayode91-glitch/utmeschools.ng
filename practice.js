/* ============================================================
   UTMESchools v2 — practice.js
   Changes in this version:
   • Explanations are drawn by ExplanationRenderer (explanation-renderer.js)
     in the clean layout: Correct Answer, Topic/Subtopic, Explanation,
     Related Knowledge (tap to expand), JAMB Tip.
   • Topic / subtopic practice filters by stable IDs on the server
     (URL params  tid_<subject>  and  sid_<subject>).
   • Question selection is now truly random: the app first asks for the
     list of matching IDs, picks the random ones, then loads only those.
     (Before, it loaded the first N rows and shuffled them, so the same
     questions kept coming back.)
   ============================================================ */

const SUPABASE_URL = 'https://hxrfakdqnuzdigbbvszp.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4cmZha2RxbnV6ZGlnYmJ2c3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0MjY0MzgsImV4cCI6MjEwNTAwMjQzOH0.-xz5Y08e_RQ-C6OHKnSfeoVPSV7kAqzeZcL62MO0tOY';
const SB_HEADERS = {
  'apikey':        SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json'
};

/* build stamp: the health check page compares this with the version it expects */
const APP_BUILD = '2026-10-22.1';

const urlP             = new URLSearchParams(window.location.search);
const subjectIds       = (urlP.get('subjects') || 'english').split(',');
const mode             = urlP.get('mode') || 'practice';
const timerH           = parseInt(urlP.get('h') || '2', 10);
const timerM           = parseInt(urlP.get('m') || '0', 10);
const shuffleQ         = urlP.get('shuffleQ') !== '0';
const shuffleO         = urlP.get('shuffleO') === '1';
const examType         = urlP.get('exam') || 'utme';
const filterLiterature = urlP.get('filter_literature') === '1';
const topicsParam      = urlP.get('topics') || '';
const subtopicsParam   = urlP.get('subtopics') || '';

function getAccess() { return { isPaid: true, plan: 'jamb', freeLimit: 9999 }; }

/* SdashAPI questions (numeric sdash_id) are only allowed in these subjects.
   Every other subject shows myquest questions only. */
const SDASH_ALLOWED_SUBJECTS = ['english', 'lekki-headmaster'];
function isSdashId(v) { return /^\d+$/.test(String(v == null ? '' : v).trim()); }
function sourceAllowed(subjectId, sdashId) {
  return !isSdashId(sdashId) || SDASH_ALLOWED_SUBJECTS.indexOf(subjectId) !== -1;
}

/* ---------- small helpers ---------- */
function shuffleArray(a) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/* Read every matching row, page by page (the API returns at most 1000 per request). */
async function pagedGet(url) {
  const PAGE = 1000;
  const out = [];
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${url}&limit=${PAGE}&offset=${offset}`, { headers: SB_HEADERS });
    if (!res.ok) { console.error('Supabase fetch error:', res.status); return null; }
    const rows = await res.json();
    out.push(...rows);
    if (rows.length < PAGE) break;
  }
  return out;
}

/* ---------- topic / subtopic selection coming from the setup page ---------- */
function idList(param) {
  return (urlP.get(param) || '').split(',').map(x => x.trim()).filter(x => /^[a-z0-9_]+$/.test(x));
}
function topicIdFilter(subjectId) {
  const t = idList('tid_' + subjectId);
  const s = idList('sid_' + subjectId);
  if (t.length && s.length) return `&or=(topic_id.in.(${t.join(',')}),subtopic_id.in.(${s.join(',')}))`;
  if (t.length) return `&topic_id=in.(${t.join(',')})`;
  if (s.length) return `&subtopic_id=in.(${s.join(',')})`;
  return '';
}
function hasTopicFilter(subjectId) { return topicIdFilter(subjectId) !== ''; }

function mapQuestion(q) {
  return {
    id:                 String(q.id),
    subjectId:          q.subject_id,
    examType:           q.exam_type,
    year:               q.year,
    topic:              q.topic || '',
    subtopic:           q.subtopic || '',
    topic_id:           q.topic_id || '',
    subtopic_id:        q.subtopic_id || '',
    difficulty:         q.difficulty || 'Intermediate',
    text:               q.text,
    options:            [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(Boolean),
    correct:            q.correct,
    explanation:        q.explanation || '',
    explanation_ai:     q.explanation_ai || '',
    svg_code:           q.svg_code || '',
    image_file:         q.image_file || '',
    passage:            q.passage || '',
    sectionInstruction: q.section_instruction || '',
  };
}

async function fetchQuestions(subjectId, year, count, topicParam, useTopicIds) {
  try {
    const access = getAccess();
    const limit  = access.isPaid ? count : access.freeLimit;

    /* 1) light request: just the IDs that match every filter */
    let base = `${SUPABASE_URL}/rest/v1/questions?subject_id=eq.${encodeURIComponent(subjectId)}&exam_type=eq.${encodeURIComponent(examType)}`;
    if (year && year !== 'Random') base += `&year=eq.${encodeURIComponent(year)}`;
    if (useTopicIds) base += topicIdFilter(subjectId);

    const needText = !!(topicsParam || subtopicsParam || topicParam || filterLiterature);
    const cols = needText ? ('id,sdash_id,topic,subtopic' + (filterLiterature ? ',passage' : '')) : 'id,sdash_id';

    let pool = await pagedGet(`${base}&select=${cols}&order=id.asc`);
    if (pool === null) return [];

    /* source rule (JAMB only) */
    if (examType === 'utme') pool = pool.filter(r => sourceAllowed(subjectId, r.sdash_id));

    /* older text-based filters (Post UTME subjects, literature) */
    if (topicsParam) {
      const allowed = topicsParam.split('||');
      pool = pool.filter(q => allowed.includes(q.topic));
    }
    if (subtopicsParam) {
      const allowed = subtopicsParam.split('||');
      pool = pool.filter(q => allowed.includes(q.subtopic));
    }
    if (topicParam) {
      const allowed = topicParam.split('||');
      pool = pool.filter(q =>
        allowed.some(t => q.topic === t || (q.topic + ' : ' + q.subtopic) === t)
      );
    }
    if (filterLiterature && typeof LITERATURE_CONFIG !== 'undefined') {
      pool = pool.filter(q => {
        const text = ((q.topic || '') + ' ' + (q.subtopic || '') + ' ' + (q.passage || '')).toLowerCase();
        return LITERATURE_CONFIG.replaceWith.some(slug => text.includes(slug.replace(/-/g, ' ')))
            || text.includes('lekki')
            || text.includes('literature');
      });
    }

    /* 2) pick the questions (random when shuffle is on) */
    const chosen = shuffleQ ? shuffleArray(pool) : pool;
    const ids = chosen.slice(0, limit).map(r => r.id);
    if (!ids.length) return [];

    /* 3) load only the chosen questions in full */
    const rows = [];
    for (let i = 0; i < ids.length; i += 100) {
      const part = ids.slice(i, i + 100);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=in.(${part.join(',')})&select=*`, { headers: SB_HEADERS });
      if (!res.ok) { console.error('Supabase fetch error:', res.status); return []; }
      rows.push(...(await res.json()));
    }
    const byId = new Map(rows.map(r => [String(r.id), r]));
    return ids.map(id => byId.get(String(id))).filter(Boolean).map(mapQuestion);
  } catch (e) { console.error('Fetch error:', e); return []; }
}

function getDemoQuestions(subjectId) {
  return [{
    id: 'demo_1', subjectId, year: 2025,
    topic: 'DEMO', subtopic: '', difficulty: 'Basic',
    text: 'This is a demo question. Questions are being loaded into the database.',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct: 'A',
    explanation: 'Real questions from the database will appear here.',
    explanation_ai: '',
    svg_code: '', image_file: '', passage: '', sectionInstruction: ''
  }];
}

let allQuestions    = [];
let currentQIndex   = 0;
let answers         = {};
let bookmarks       = {};
let showExplanation = false;

try { bookmarks = JSON.parse(localStorage.getItem('utme_bookmarks') || '{}'); } catch(e) {}

let totalSeconds  = (timerH * 3600) + (timerM * 60);
let timerInterval = null;

function formatTime(s) {
  const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function startTimer() {
  if (mode === 'study') {
    document.getElementById('timerPill').style.display = 'none';
    return;
  }
  const pill = document.getElementById('timerPill');
  pill.textContent = formatTime(totalSeconds);
  timerInterval = setInterval(() => {
    totalSeconds--;
    pill.textContent = formatTime(totalSeconds);
    if (totalSeconds <= 300)      pill.className = 'tb-timer danger';
    else if (totalSeconds <= 600) pill.className = 'tb-timer warn';
    if (totalSeconds <= 0) {
      clearInterval(timerInterval);
      showToast('Time up! Submitting...');
      setTimeout(submitExam, 1500);
    }
  }, 1000);
}

function shuffleQuestionOptions(q) {
  if (!q.options || q.options.length < 2) return q;
  const letters = ['A','B','C','D','E'];
  const correctIdx = letters.indexOf(q.correct);
  if (correctIdx === -1 || correctIdx >= q.options.length) return q;

  const pairs = q.options.map((text, i) => ({ text, original: i }));
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  const newCorrectIdx = pairs.findIndex(p => p.original === correctIdx);

  return {
    ...q,
    options: pairs.map(p => p.text),
    correct: letters[newCorrectIdx]
  };
}

async function loadAllQuestions() {
  showLoadingState(true);
  ensureRenderer();
  try {
    for (const sid of subjectIds) {
      const year       = urlP.get('year_'   + sid) || 'Random';
      const totalCount = parseInt(urlP.get('count_' + sid) || '40', 10);
      const topicParam = urlP.get('topics_' + sid) || '';

      let qs = [];

      if (sid === 'english') {
        if (hasTopicFilter('english')) {
          /* a topic was chosen: only that topic, no Lekki Headmaster extras */
          qs = await fetchQuestions('english', year, totalCount, topicParam, true);
        } else {
          /* 55 Regular English + 5 Lekki Headmaster = 60 */
          const regularCount = Math.max(totalCount - 5, 0);
          let engQs = await fetchQuestions('english', year, regularCount, topicParam, true);
          let lekkiQs = await fetchQuestions('lekki-headmaster', year, 5, '', false);
          if (lekkiQs.length === 0) {
            lekkiQs = await fetchQuestions('lekki-headmaster', 'Random', 5, '', false);
          }
          qs = [...engQs, ...lekkiQs];
        }
      } else {
        qs = await fetchQuestions(sid, year, totalCount, topicParam, true);
      }

      if (qs.length === 0) {
        if (hasTopicFilter(sid)) showToast('No questions found for the chosen topics yet');
        else showToast('Demo mode — no questions found');
        qs = getDemoQuestions(sid);
      }

      if (shuffleQ) qs = shuffleArray(qs);
      if (shuffleO) qs = qs.map(shuffleQuestionOptions);
      qs.forEach((q, i) => { q.qNum = allQuestions.length + i + 1; q.subjectId = sid; });
      allQuestions.push(...qs);
    }
  } catch(e) { console.error(e); }

  if (allQuestions.length === 0) allQuestions = getDemoQuestions(subjectIds[0]);

  if (mode === 'study') {
    document.getElementById('submitBtn').style.display = 'none';
  }

  showLoadingState(false);
  renderSubjectTabs();
  renderQuestion();
  startTimer();
}

function showLoadingState(loading) {
  const qCard = document.getElementById('qCard');
  if (!qCard) return;
  if (loading) {
    qCard.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <div style="font-size:36px;margin-bottom:12px;">⏳</div>
        <div style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--navy);margin-bottom:6px;">Loading questions...</div>
        <div style="font-size:13px;color:var(--ink-soft);">Please wait</div>
      </div>`;
    const opts = document.getElementById('optionsList');
    if (opts) opts.innerHTML = '';
  } else {
    qCard.innerHTML = `
      <div class="q-tags"  id="qTags"></div>
      <div class="q-text"  id="qText">Loading question...</div>
      <div class="q-image" id="qImage" style="display:none;"></div>`;
  }
}

function renderSubjectTabs() {
  const container = document.getElementById('subjTabs');
  if (!container) return;
  if (subjectIds.length <= 1) { container.style.display = 'none'; return; }
  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    const tab    = document.createElement('div');
    tab.className = 'subj-tab';
    tab.dataset.subject = sid;
    tab.innerHTML = `${sid.charAt(0).toUpperCase()+sid.slice(1)} <span class="subj-tab-count">0/${subjQs.length}</span>`;
    tab.addEventListener('click', () => {
      const first = allQuestions.findIndex(q => q.subjectId === sid);
      if (first >= 0) goToQuestion(first);
    });
    container.appendChild(tab);
  });
  updateSubjectTabs();
}

function updateSubjectTabs() {
  const current = allQuestions[currentQIndex]?.subjectId;
  document.querySelectorAll('.subj-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.subject === current);
    const sid    = tab.dataset.subject;
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    const ans    = subjQs.filter(q => answers[q.id]).length;
    const el     = tab.querySelector('.subj-tab-count');
    if (el) el.textContent = `${ans}/${subjQs.length}`;
  });
}

/* ================================================================
   RENDER QUESTION
   ================================================================ */
/* ---------- explanation display: never silent, never hides the AI explanation ---------- */
let rendererState = (typeof ExplanationRenderer !== 'undefined') ? 'ok' : 'idle';   /* idle | loading | ok | failed */

function ensureRenderer() {
  if (rendererState !== 'idle') return;
  rendererState = 'loading';
  try {
    if (!document.querySelector('link[href*="explanation.css"]')) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = 'explanation.css?v=' + APP_BUILD;
      document.head.appendChild(l);
    }
    const sc = document.createElement('script');
    sc.src = 'explanation-renderer.js?v=' + APP_BUILD;
    sc.onload  = () => { rendererState = (typeof ExplanationRenderer !== 'undefined') ? 'ok' : 'failed'; (window.renderQuestion || renderQuestion)(); };
    sc.onerror = () => { rendererState = 'failed'; (window.renderQuestion || renderQuestion)(); };
    document.head.appendChild(sc);
  } catch (e) { rendererState = 'failed'; }
}

/* emergency renderer (only used if explanation-renderer.js cannot be loaded at all) */
function miniRender(q) {
  let o = q.explanation_ai;
  try { if (typeof o === 'string' && o.trim().charAt(0) === '{') o = JSON.parse(o); } catch (e) { o = null; }
  if (!o || typeof o !== 'object' || typeof o.explanation !== 'string') {
    const plain = (typeof q.explanation_ai === 'string' && q.explanation_ai.trim() && q.explanation_ai.trim().charAt(0) !== '{') ? q.explanation_ai : (q.explanation || '');
    return plain ? '<div>' + escHtml(plain).replace(/\n/g, '<br>') + '</div>' : 'No explanation available.';
  }
  const letters = ['A','B','C','D','E'];
  const i = letters.indexOf(String(q.correct || '').toUpperCase());
  let h = '<div style="background:#E8F8F1;border-radius:12px;padding:10px 12px;margin-bottom:10px;font-weight:800;color:#0B2545">Correct Answer: ' +
          escHtml(q.correct) + (q.options && q.options[i] ? ' — ' + escHtml(q.options[i]) : '') + '</div>';
  h += '<p style="margin:0 0 10px">' + escHtml(o.explanation).replace(/\n/g, '<br>') + '</p>';
  if (o.others) h += '<p style="margin:0 0 10px"><b>Why the others don\'t work:</b> ' + escHtml(o.others) + '</p>';
  (Array.isArray(o.related) ? o.related : []).forEach(g => {
    h += '<details style="margin:8px 0"><summary style="font-weight:800;cursor:pointer">Related Knowledge — ' + escHtml(g && g.heading) + '</summary><ul style="padding-left:20px;margin:6px 0">' +
         (Array.isArray(g && g.points) ? g.points : []).map(x => '<li>' + escHtml(x) + '</li>').join('') + '</ul></details>';
  });
  if (o.tip) h += '<p style="background:#FFF4DC;border-radius:10px;padding:10px 12px"><b>🎯 JAMB Tip:</b> ' + escHtml(o.tip) + '</p>';
  return h;
}

function explanationHtml(q) {
  let html;
  if (typeof ExplanationRenderer !== 'undefined') {
    rendererState = 'ok';
    html = ExplanationRenderer.render(q);
  } else {
    ensureRenderer();
    const warn = rendererState === 'failed'
      ? '<div style="background:#FDECEA;color:#C0392B;border-radius:10px;padding:10px 12px;margin-bottom:10px;font-size:12.5px;line-height:1.5"><b>⚠️ Setup problem:</b> explanation-renderer.js could not be loaded, so this is a simplified view. Make sure that file is in the same folder as practice.html and is named exactly <b>explanation-renderer.js</b>. Open app-check.html to see what is wrong.</div>'
      : '';
    html = warn + miniRender(q);
  }
  return (typeof applyLiteratureReplacement === 'function')
    ? applyLiteratureReplacement(html, examType)
    : html;
}

/* ---------- debug panel: open practice.html with &debug=1 added to the address ---------- */
async function utmeClearCache() {
  try { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); } catch (e) {}
  try { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } catch (e) {}
  const u = new URL(window.location.href);
  u.searchParams.set('_', String(Date.now()));
  window.location.href = u.toString();
}
function debugPanel(q) {
  if (urlP.get('debug') !== '1') return;
  try {
    let p = document.getElementById('utmeDebug');
    if (!p) {
      p = document.createElement('div');
      p.id = 'utmeDebug';
      p.style.cssText = 'position:fixed;left:8px;right:8px;bottom:84px;z-index:900;background:#0B2545;color:#fff;font:11px/1.55 monospace;padding:10px;border-radius:10px;max-height:42vh;overflow:auto;opacity:.96';
      document.body.appendChild(p);
    }
    const raw = q.explanation_ai;
    const kind = !raw ? 'EMPTY — no AI explanation is saved for this question'
      : (typeof raw === 'object' ? 'JSON object'
      : (String(raw).trim().charAt(0) === '{' ? 'JSON text (' + String(raw).length + ' chars)' : 'plain text (' + String(raw).length + ' chars)'));
    let cssLoaded = false;
    try { cssLoaded = Array.prototype.some.call(document.styleSheets || [], s => /explanation\.css/.test(s.href || '')); } catch (e) {}
    const rb = (typeof ExplanationRenderer !== 'undefined' && ExplanationRenderer.build) ? ExplanationRenderer.build : '—';
    p.innerHTML =
      '<b>DEBUG</b><br>' +
      'practice.js build: ' + APP_BUILD + '<br>' +
      'renderer: ' + (typeof ExplanationRenderer !== 'undefined' ? 'LOADED (build ' + rb + ')' : 'NOT LOADED (' + rendererState + ')') + '<br>' +
      'explanation.css: ' + (cssLoaded ? 'loaded' : 'NOT loaded') + '<br>' +
      'question id: ' + escHtml(q.id) + ' · ' + escHtml(q.subjectId) + ' · ' + escHtml(q.year) + '<br>' +
      'mode: ' + mode + (mode !== 'study' ? '  ← explanations only show in STUDY mode' : '') + '<br>' +
      'AI explanation: ' + kind + '<br>' +
      'topic_id: ' + escHtml(q.topic_id || '—') + ' · subtopic_id: ' + escHtml(q.subtopic_id || '—') + '<br>' +
      '<button onclick="utmeClearCache()" style="margin-top:6px;padding:6px 10px;border:none;border-radius:6px;background:#FFD23F;color:#0B2545;font-weight:700">Clear cache &amp; reload</button>';
  } catch (e) { /* debug must never break the page */ }
}

function renderQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q) return;

  document.getElementById('qLabel').textContent = `Q ${currentQIndex + 1} / ${allQuestions.length}`;

  const tagsEl = document.getElementById('qTags');
  if (tagsEl) {
    tagsEl.innerHTML = '';
    if (q.topic) {
      const shownTopic = (typeof applyLiteratureReplacement === 'function')
        ? applyLiteratureReplacement(q.topic, examType) : q.topic;
      tagsEl.innerHTML += `<span class="q-tag topic">${escHtml(shownTopic)}</span>`;
    }
    if (q.year)       tagsEl.innerHTML += `<span class="q-tag year">📅 ${q.year}</span>`;
    if (q.examType)   tagsEl.innerHTML += `<span class="q-tag">${q.examType.toUpperCase()}</span>`;
  }

  let instrEl = document.getElementById('qInstruction');
  if (!instrEl) {
    instrEl = document.createElement('div');
    instrEl.id = 'qInstruction';
    instrEl.style.cssText = 'font-size:12.5px;color:#5C6B82;line-height:1.5;margin-bottom:10px;padding:8px 12px;background:#F4F6FA;border-left:3px solid #8A94A6;border-radius:6px;display:none;';
    const qTextEl = document.getElementById('qText');
    if (qTextEl && qTextEl.parentNode) qTextEl.parentNode.insertBefore(instrEl, qTextEl);
  }
  if (q.sectionInstruction && q.sectionInstruction.trim()) {
    instrEl.textContent = q.sectionInstruction;
    instrEl.style.display = 'block';
  } else {
    instrEl.textContent = '';
    instrEl.style.display = 'none';
  }

  const qTextEl = document.getElementById('qText');
  if (qTextEl) {
    qTextEl.textContent = (typeof applyLiteratureReplacement === 'function')
      ? applyLiteratureReplacement(q.text, examType) : q.text;
  }

  const imgEl = document.getElementById('qImage');
  if (imgEl) {
    if (q.svg_code) {
      imgEl.innerHTML = q.svg_code;
      imgEl.style.display = 'block';
    } else if (q.image_file) {
      imgEl.innerHTML = `<img src="images/${q.image_file}" alt="Diagram" style="max-width:100%;border-radius:8px;margin-top:8px;">`;
      imgEl.style.display = 'block';
    } else {
      imgEl.innerHTML = '';
      imgEl.style.display = 'none';
    }
  }

  const passCard = document.getElementById('passageBox');
  if (passCard) {
    if (q.passage && q.passage.trim()) {
      const passTextEl = document.getElementById('passageText');
      if (passTextEl) {
        passTextEl.textContent = (typeof applyLiteratureReplacement === 'function')
          ? applyLiteratureReplacement(q.passage, examType) : q.passage;
      }
      passCard.classList.add('show');
    } else {
      passCard.classList.remove('show');
    }
  }

  renderOptions(q);

  document.getElementById('prevBtn').disabled = currentQIndex === 0;
  document.getElementById('nextBtn').disabled = currentQIndex === allQuestions.length - 1;
  const bkBtn = document.getElementById('bookmarkBtn');
  if (bkBtn) bkBtn.style.color = bookmarks[q.id] ? 'var(--gold)' : '';

  const studyWrap = document.getElementById('showAnswerWrap');
  const explanBox = document.getElementById('explanationBox');

  if (mode === 'study' && studyWrap) {
    studyWrap.classList.add('show');
    const saBtn = document.getElementById('showAnswerBtn');
    if (saBtn) saBtn.textContent = showExplanation ? '🙈 Hide Answer' : '👁️ Show Answer';

    if (showExplanation && explanBox) {
      explanBox.classList.add('show');
      const explText = document.getElementById('explanationText');
      if (explText) explText.innerHTML = explanationHtml(q);
    } else if (explanBox) {
      explanBox.classList.remove('show');
    }
  } else {
    if (studyWrap) studyWrap.classList.remove('show');
    if (explanBox) explanBox.classList.remove('show');
  }

  document.getElementById('answeredCount').textContent = Object.keys(answers).length;
  document.getElementById('totalCount').textContent    = allQuestions.length;

  debugPanel(q);
  updateSubjectTabs();
}

function renderOptions(q) {
  const list    = document.getElementById('optionsList');
  const letters = ['A','B','C','D','E'];
  const userAns = answers[q.id];

  if (!list) return;
  list.innerHTML = '';

  (q.options || []).forEach((opt, i) => {
    const letter = letters[i];
    const row    = document.createElement('div');
    row.className = 'option-btn';

    if (mode === 'study' && showExplanation) {
      if (letter === q.correct)    row.classList.add('correct');
      else if (letter === userAns) row.classList.add('wrong');
      else                         row.classList.add('dimmed');
    } else {
      if (userAns === letter) row.classList.add('selected');
    }

    const optText = (typeof applyLiteratureReplacement === 'function')
      ? applyLiteratureReplacement(opt, examType) : opt;

    row.innerHTML = `
      <div class="option-letter-box">${letter}</div>
      <div class="option-text">${optText}</div>`;

    row.addEventListener('click', () => selectAnswer(q, letter));
    list.appendChild(row);
  });
}

function selectAnswer(q, letter) {
  answers[q.id]   = letter;
  showExplanation = false;
  renderQuestion();
}

function goToQuestion(index) {
  if (index < 0 || index >= allQuestions.length) return;
  showExplanation = false;
  currentQIndex   = index;
  renderQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleBookmark() {
  const q = allQuestions[currentQIndex];
  if (!q) return;
  if (bookmarks[q.id]) {
    delete bookmarks[q.id];
    showToast('Bookmark removed');
  } else {
    bookmarks[q.id] = {
      id: q.id, subjectId: q.subjectId, year: q.year,
      text: q.text, options: q.options, correct: q.correct,
      explanation: q.explanation, explanation_ai: q.explanation_ai,
      topic: q.topic, subtopic: q.subtopic,
      savedAt: new Date().toISOString()
    };
    showToast('Question bookmarked ⭐');
  }
  try { localStorage.setItem('utme_bookmarks', JSON.stringify(bookmarks)); } catch(e) {}
  const bkBtn = document.getElementById('bookmarkBtn');
  if (bkBtn) bkBtn.style.color = bookmarks[q.id] ? 'var(--gold)' : '';
}

function openGrid() {
  const grid = document.getElementById('gridNums');
  grid.innerHTML = '';
  allQuestions.forEach((q, i) => {
    const el = document.createElement('div');
    el.className = 'grid-num' +
      (answers[q.id]       ? ' answered' : '') +
      (i === currentQIndex ? ' current'  : '');
    el.textContent = i + 1;
    el.addEventListener('click', () => { closeGrid(); goToQuestion(i); });
    grid.appendChild(el);
  });
  document.getElementById('gridOverlay').classList.add('open');
}
function closeGrid() { document.getElementById('gridOverlay').classList.remove('open'); }

function openSubmitDialog() {
  const answered = Object.keys(answers).length;
  const total    = allQuestions.length;
  const label    = mode === 'practice' ? 'submit and save your result' : 'submit and see your analysis';
  document.getElementById('dialogBody').textContent =
    `You have answered ${answered} of ${total} questions. Ready to ${label}?`;
  document.getElementById('dialogOverlay').classList.add('open');
}
function closeSubmitDialog() { document.getElementById('dialogOverlay').classList.remove('open'); }

function buildResult(saveToHistory) {
  if (timerInterval) clearInterval(timerInterval);
  const subjectResults = {};
  subjectIds.forEach(sid => {
    const subjQs = allQuestions.filter(q => q.subjectId === sid);
    let correct = 0, attempted = 0;
    const questionDetails = subjQs.map(q => {
      const userAns   = answers[q.id] || null;
      const isCorrect = userAns === q.correct;
      if (userAns) { attempted++; if (isCorrect) correct++; }
      return {
        id: q.id, num: q.qNum, text: q.text,
        options: q.options, correct: q.correct,
        userAnswer: userAns, topic: q.topic,
        subtopic: q.subtopic, year: q.year,
        explanation: q.explanation, explanation_ai: q.explanation_ai,
        difficulty: q.difficulty,
      };
    });
    subjectResults[sid] = { total: subjQs.length, attempted, correct, questions: questionDetails };
  });

  const result = {
    id: 'r_' + Date.now(), mode, subjectIds, subjectResults,
    examType,
    totalAnswered: Object.keys(answers).length,
    totalQuestions: allQuestions.length,
    timeTaken: (timerH * 3600 + timerM * 60) - totalSeconds,
    date: new Date().toISOString(),
  };

  try { sessionStorage.setItem('utme_result', JSON.stringify(result)); } catch(e) {}

  if (saveToHistory) {
    try {
      const history = JSON.parse(localStorage.getItem('utme_history') || '[]');
      history.unshift(result);
      localStorage.setItem('utme_history', JSON.stringify(history.slice(0, 100)));
    } catch(e) {}
  }
  window.location.href = 'result.html';
}

function submitExam()  { buildResult(mode === 'practice'); }
function finishStudy() { buildResult(false); }

let calcDisplay = '0', calcExpr = '', calcJustEvaled = false;
function openCalc()  { document.getElementById('calcOverlay').classList.add('open'); }
function closeCalc() { document.getElementById('calcOverlay').classList.remove('open'); }
function updateCalcDisplay() { document.getElementById('calcDisplay').textContent = calcDisplay; }
function calcPress(val) {
  if (val === 'C') { calcDisplay = '0'; calcExpr = ''; calcJustEvaled = false; }
  else if (val === 'DEL') {
    if (calcExpr.length <= 1) { calcDisplay = '0'; calcExpr = ''; }
    else { calcExpr = calcExpr.slice(0,-1); calcDisplay = calcExpr; }
  } else if (val === '=') {
    try {
      const safe = calcExpr.replace(/×/g,'*').replace(/÷/g,'/').replace(/[^0-9+\-*/.()%]/g,'');
      const result = Function('"use strict"; return (' + safe + ')')();
      calcDisplay = isFinite(result) ? String(parseFloat(result.toFixed(8))) : 'Error';
      calcExpr = calcDisplay; calcJustEvaled = true;
    } catch(e) { calcDisplay = 'Error'; calcExpr = ''; }
  } else if (val === '√') {
    const n = parseFloat(calcExpr);
    if (!isNaN(n)) { calcDisplay = String(parseFloat(Math.sqrt(n).toFixed(8))); calcExpr = calcDisplay; calcJustEvaled = true; }
  } else if (['+','-','×','÷','%'].includes(val)) {
    const map = {'×':'*','÷':'/'};
    calcExpr += (map[val]||val); calcDisplay = calcExpr; calcJustEvaled = false;
  } else {
    if (calcJustEvaled) { calcExpr = val; calcJustEvaled = false; }
    else { calcExpr = (calcExpr==='0'||calcExpr==='') ? val : calcExpr+val; }
    calcDisplay = calcExpr;
  }
  updateCalcDisplay();
}

let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

function speakQuestion() {
  const q = allQuestions[currentQIndex];
  if (!q || !window.speechSynthesis) { showToast('Text-to-speech not supported'); return; }
  speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(q.text);
  utt.lang = 'en-NG';
  speechSynthesis.speak(utt);
}

document.addEventListener('keydown', e => {
  const calcOv = document.getElementById('calcOverlay');
  if (calcOv && calcOv.classList.contains('open')) return;
  if (e.key === 'ArrowRight') goToQuestion(currentQIndex + 1);
  if (e.key === 'ArrowLeft')  goToQuestion(currentQIndex - 1);
  const q = allQuestions[currentQIndex];
  if (!q) return;
  if (e.key === '1') selectAnswer(q, 'A');
  if (e.key === '2') selectAnswer(q, 'B');
  if (e.key === '3') selectAnswer(q, 'C');
  if (e.key === '4') selectAnswer(q, 'D');
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('backBtn').addEventListener('click', () => {
    if (confirm('Leave? Your progress will be lost.')) {
      if (timerInterval) clearInterval(timerInterval);
      window.location.href = 'select-subjects.html';
    }
  });
  document.getElementById('prevBtn').addEventListener('click', () => goToQuestion(currentQIndex - 1));
  document.getElementById('nextBtn').addEventListener('click', () => goToQuestion(currentQIndex + 1));
  document.getElementById('bookmarkBtn').addEventListener('click', toggleBookmark);
  document.getElementById('flagBtn').addEventListener('click', () => showToast('Question reported. Thank you!'));
  document.getElementById('calcBtn').addEventListener('click', openCalc);
  document.getElementById('calcCloseBtn').addEventListener('click', closeCalc);
  document.getElementById('calcOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('calcOverlay')) closeCalc();
  });
  document.querySelectorAll('.calc-key').forEach(btn => {
    btn.addEventListener('click', () => calcPress(btn.dataset.val));
  });
  document.getElementById('speakerBtn').addEventListener('click', speakQuestion);
  document.getElementById('showAnswerBtn').addEventListener('click', () => {
    showExplanation = !showExplanation;
    renderQuestion();
  });
  document.getElementById('submitBtn').addEventListener('click', () => {
    if (mode === 'study') finishStudy();
    else openSubmitDialog();
  });
  document.getElementById('dialogCancel').addEventListener('click', closeSubmitDialog);
  document.getElementById('dialogOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('dialogOverlay')) closeSubmitDialog();
  });
  document.getElementById('dialogSubmit').addEventListener('click', () => {
    closeSubmitDialog();
    submitExam();
  });
  document.getElementById('answeredPill').addEventListener('click', openGrid);
  document.getElementById('gridCloseBtn').addEventListener('click', closeGrid);
  document.getElementById('gridOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('gridOverlay')) closeGrid();
  });

  loadAllQuestions();
});
