/* ============================================================
   UTMESchools — explanation-renderer.js
   Turns a question's explanation into the clean layout:

     Correct Answer: A — wall
     Topic: X · Subtopic: Y
     EXPLANATION ........ short and clear
     Why the others don't work
     ▼ Related Knowledge (tap to expand)
     JAMB Tip

   It understands three kinds of stored data:
     1. NEW   — JSON written by the v13 generator (best quality)
     2. OLD   — plain text such as "Correct option: A ... Explanation: ..."
     3. OLD   — HTML written by earlier generators
   so existing questions look good immediately, and regenerated
   ones look perfect.

   practice.html only needs two extra lines (see the bottom of this
   file). practice.js does not need to be edited.
   ============================================================ */

const ExplanationRenderer = (function () {
  'use strict';

  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }
  function str(v) { return String(v == null ? '' : v).replace(/\*+/g, '').trim(); }
  function paras(text) { return String(text || '').split(/\n+/).map(x => x.trim()).filter(Boolean); }

  function htmlToText(s) {
    return String(s)
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*li\b[^>]*>/gi, '\n- ')
      .replace(/<\/\s*(span|p|div|li|ul|ol|h[1-6]|summary|details)\s*>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  }

  /* ---------- 1. NEW format (JSON) ---------- */
  function fromStructured(o, q) {
    if (!o || typeof o !== 'object' || typeof o.explanation !== 'string') return null;
    const related = Array.isArray(o.related) ? o.related.map(g => ({
      heading: str(g && g.heading),
      points: (Array.isArray(g && g.points) ? g.points : []).map(str).filter(Boolean)
    })).filter(g => g.points.length) : [];
    return {
      topic: str(o.topic) || str(q.topic),
      subtopic: str(o.subtopic) || str(q.subtopic),
      explanation: paras(str(o.explanation).replace(/\\n/g, '\n')),
      others: str(o.others),
      related: related,
      tips: str(o.tip) ? [str(o.tip)] : []
    };
  }

  /* ---------- 2/3. OLD formats (plain text or HTML) ---------- */
  const MARK = [
    ['correct',  /^\s*correct\s+(?:option|answer)\s*:\s*/i],
    ['expl',     /^\s*explanation\s*:\s*/i],
    ['others',   /^\s*why\s+(?:the\s+)?other[^:\n]{0,30}:\s*/i],
    ['related',  /^\s*related\s+(?:knowledge|concepts?)\s*:?\s*/i],
    ['tip',      /^\s*jamb\s+tip\s*:\s*/i],
    ['mistakes', /^\s*common\s+mistakes?\s*:?\s*/i]
  ];

  function expandInline(lines) {
    /* some old data lost its line breaks: "- a - b - c" on one line */
    if (lines.length !== 1) return lines;
    const parts = lines[0].split(/\s+-\s+(?=[A-Z"“‘'])/);
    return parts.length > 2 ? parts.map(p => '- ' + p.replace(/^\s*-\s*/, '')) : lines;
  }

  function parseGroups(lines, defaultHeading) {
    const groups = [];
    const tips = [];
    let g = null;
    for (const raw of lines) {
      const indent = raw.match(/^\s*/)[0].length;
      const m = raw.trim().match(/^[-•·*–]\s+(.*)$/);
      const body = (m ? m[1] : raw.trim()).replace(/[\[\]]/g, '');
      if (/^jamb\s+tip\s*[—–:-]/i.test(body)) { tips.push(body.replace(/^jamb\s+tip\s*[—–:-]\s*/i, '')); continue; }
      const isPoint = m && (indent > 0 || /\s[—–]\s|:\s/.test(body) || body.length > 60);
      if (!isPoint) {
        g = { heading: body.replace(/:\s*$/, ''), points: [] };
        groups.push(g);
      } else {
        if (!g) { g = { heading: defaultHeading || '', points: [] }; groups.push(g); }
        g.points.push(body);
      }
    }
    /* headings that never got points become plain points */
    const orphans = groups.filter(x => !x.points.length).map(x => x.heading).filter(Boolean);
    const good = groups.filter(x => x.points.length);
    if (orphans.length) good.push({ heading: defaultHeading || '', points: orphans });
    return { groups: good, tips };
  }

  function fromLegacy(raw, q) {
    let text = /<[a-z][\s\S]*>/i.test(raw) ? htmlToText(raw) : String(raw);
    text = text.replace(/\r/g, '').replace(
      /\s*(Correct\s+(?:option|answer)\s*:|Explanation\s*:|Related\s+(?:Knowledge|concepts?)\s*:|JAMB\s+tip\s*:|Common\s+mistakes?\s*:)/gi,
      '\n$1'
    );

    const sec = { correct: [], expl: [], others: [], related: [], tip: [], mistakes: [] };
    let cur = 'expl';
    text.split('\n').forEach(line => {
      let l = line, hit = null;
      for (const [k, rx] of MARK) {
        const m = l.match(rx);
        if (m) { hit = k; l = l.slice(m[0].length); break; }
      }
      if (hit) cur = hit;
      if (l.trim()) sec[cur].push(l);
    });

    const rel = parseGroups(expandInline(sec.related), '');
    const mis = parseGroups(expandInline(sec.mistakes), 'Common mistakes');
    const tips = [];
    sec.tip.forEach(t => { const s = str(t); if (s) tips.push(s); });
    rel.tips.concat(mis.tips).forEach(t => { const s = str(t); if (s && tips.indexOf(s) === -1) tips.push(s); });

    mis.groups.forEach(g => { if (!g.heading) g.heading = 'Common mistakes'; });
    let explanation = sec.expl.map(s => str(s)).filter(Boolean);
    if (!explanation.length && !rel.groups.length && !mis.groups.length) explanation = paras(str(text));

    return {
      topic: str(q.topic),
      subtopic: str(q.subtopic),
      explanation: explanation,
      others: str(sec.others.join(' ')),
      related: rel.groups.concat(mis.groups),
      tips: tips.slice(0, 2)
    };
  }

  /* ---------- pick the right parser ---------- */
  function getData(q) {
    const raw = String(q.explanation_ai || '').trim();
    if (raw) {
      if (raw.charAt(0) === '{') {
        try { const d = fromStructured(JSON.parse(raw), q); if (d) return d; } catch (e) { /* fall through */ }
      }
      return fromLegacy(raw, q);
    }
    const old = String(q.explanation || '').trim();
    if (old) {
      const t = /<[a-z][\s\S]*>/i.test(old) ? htmlToText(old) : old;
      return { topic: str(q.topic), subtopic: str(q.subtopic), explanation: paras(str(t)), others: '', related: [], tips: [] };
    }
    return null;
  }

  /* ---------- HTML pieces ---------- */
  function point(p) {
    const s = String(p).replace(/[\[\]]/g, '').trim();
    let i = s.search(/\s[—–]\s/);
    if (i > 0 && i <= 42) return '<strong>' + esc(s.slice(0, i)) + '</strong> — ' + esc(s.slice(i).replace(/^\s[—–]\s/, ''));
    i = s.indexOf(': ');
    if (i > 0 && i <= 42) return '<strong>' + esc(s.slice(0, i)) + ':</strong> ' + esc(s.slice(i + 2));
    return esc(s);
  }

  function answerBlock(q) {
    const idx = LETTERS.indexOf(String(q.correct || '').trim().toUpperCase());
    const letter = idx >= 0 ? LETTERS[idx] : '';
    const text = idx >= 0 && q.options && q.options[idx] ? q.options[idx] : '';
    if (!letter) return '';
    return '<div class="ex-answer"><div class="ex-label">Correct Answer</div>' +
      '<div class="ex-answer-text">' + esc(letter) + (text ? ' — ' + esc(text) : '') + '</div></div>';
  }

  function metaLine(d) {
    const bits = [];
    if (d.topic) bits.push('<span>Topic: <strong>' + esc(d.topic) + '</strong></span>');
    if (d.subtopic) bits.push('<span>Subtopic: <strong>' + esc(d.subtopic) + '</strong></span>');
    return bits.length ? '<div class="ex-meta">' + bits.join('') + '</div>' : '';
  }

  function relatedBlock(groups) {
    const body = groups.map(g =>
      (g.heading ? '<div class="ex-group-title">' + esc(g.heading) + '</div>' : '') +
      '<ul>' + g.points.map(p => '<li>' + point(p) + '</li>').join('') + '</ul>'
    ).join('');
    return '<details class="ex-related"><summary>' +
      '<span class="ex-sum-title">Related Knowledge</span>' +
      '<span class="ex-sum-hint ex-hint-closed">Tap to expand</span>' +
      '<span class="ex-sum-hint ex-hint-open">Tap to close</span>' +
      '</summary><div class="ex-related-body">' + body + '</div></details>';
  }

  function render(q) {
    const d = getData(q);
    if (!d) return '<p class="ex-empty">No explanation available.</p>';
    const out = [];
    out.push(answerBlock(q));
    out.push(metaLine(d));
    if (d.explanation.length) {
      out.push('<div class="ex-title">Explanation</div><div class="ex-body">' +
        d.explanation.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>');
    }
    if (d.others) out.push('<div class="ex-others"><strong>Why the others don\'t work:</strong> ' + esc(d.others) + '</div>');
    if (d.related.length) out.push(relatedBlock(d.related));
    if (d.tips.length) {
      out.push('<div class="ex-tip"><div class="ex-tip-title">🎯 JAMB Tip</div>' +
        d.tips.map(t => '<p>' + esc(t) + '</p>').join('') + '</div>');
    }
    return '<div class="ex-wrap">' + out.join('') + '</div>';
  }

  /* ---------- practice page hook (no edit to practice.js) ---------- */
  function enhance() {
    if (typeof mode === 'undefined' || mode !== 'study' || typeof showExplanation === 'undefined' || !showExplanation) return;
    const q = (typeof allQuestions !== 'undefined') ? allQuestions[currentQIndex] : null;
    const el = document.getElementById('explanationText');
    if (!q || !el) return;
    let html = render(q);
    if (typeof applyLiteratureReplacement === 'function') html = applyLiteratureReplacement(html, examType);
    el.innerHTML = html;
  }

  function install() {
    if (typeof window.renderQuestion !== 'function' || window.__exRendererInstalled) return;
    window.__exRendererInstalled = true;
    const base = window.renderQuestion;
    window.renderQuestion = function () {
      const r = base.apply(this, arguments);
      try { enhance(); } catch (e) { console.error('Explanation renderer:', e); }
      return r;
    };
  }
  if (typeof window !== 'undefined' && typeof document !== 'undefined') install();

  return { render: render, getData: getData };
})();

if (typeof window !== 'undefined') window.ExplanationRenderer = ExplanationRenderer;

/* ------------------------------------------------------------
   HOW TO ADD IT TO practice.html (2 lines):

   1) Inside <head>, right before </head>:
        <link rel="stylesheet" href="explanation.css">

   2) Right after the line  <script src="practice.js"></script> :
        <script src="explanation-renderer.js"></script>
   ------------------------------------------------------------ */
