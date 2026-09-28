/* ============================================================
   UTMESchools — literature-config.js
   One place to control which literature text is CURRENT.
   Change this file every ~4 years when JAMB changes the text.
   ============================================================ */

const LITERATURE_CONFIG = {

  /* ---- WHICH TEXT IS CURRENT RIGHT NOW ---- */
  current: {
    utme:        { slug: 'lekki-headmaster', name: 'The Lekki Headmaster', since: 2025 },
    wassce:      { slug: 'lekki-headmaster', name: 'The Lekki Headmaster', since: 2025 },
    neco:        { slug: 'lekki-headmaster', name: 'The Lekki Headmaster', since: 2025 },
    'post-utme': { slug: 'lekki-headmaster', name: 'The Lekki Headmaster', since: 2025 },
  },

  /* ---- OLD TEXTS TO RENAME — they display as the current text ---- */
  replaceWith: [
    'the-life-changer',
    'life-changer',
    'independence',
    'sweet-sixteen',
    'the-last-good-man',
    'second-class-citizen',
    'the-lekki-headmaster',
  ],

  /* ---- DISPLAY NAMES — used to detect + replace text in questions ---- */
  displayNames: {
    'the-life-changer':      'The Life Changer',
    'life-changer':          'Life Changer',
    'independence':          'Independence',
    'sweet-sixteen':         'Sweet Sixteen',
    'the-last-good-man':     'The Last Good Man',
    'second-class-citizen':  'Second Class Citizen',
    'lekki-headmaster':      'The Lekki Headmaster',
    'the-lekki-headmaster':  'The Lekki Headmaster',
  },
};

/* ================================================================
   APPLY TEXT REPLACEMENT
   Call this on any string that might mention an old text.
   ================================================================ */
function applyLiteratureReplacement(text, examType) {
  if (!text) return text;
  const current = LITERATURE_CONFIG.current[examType] || LITERATURE_CONFIG.current.utme;

  const names = LITERATURE_CONFIG.replaceWith
    .map(slug => LITERATURE_CONFIG.displayNames[slug])
    .filter(Boolean);

  let result = String(text);
  names.forEach(name => {
    const re = new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(re, current.name);
  });
  return result;
}
