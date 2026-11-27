/* ============================================================================
 * SOPHIA · 08-i18n                                     layer: CORE
 * ----------------------------------------------------------------------------
 * PURPOSE  Interface language (owner decision X): English by default; Spanish, French,
 *          Italian, German and Portuguese from the 09-lang-xx modules. English is the
 *          source language of code, firmware and document: this module translates only the
 *          INTERFACE after it is drawn (text nodes and title / aria-label / placeholder /
 *          data-short attributes), and puts the English back when you switch to English.
 * OWNS     SOPHIA.i18n, the language registry, the preference sophia:pref:lang and
 *          html[data-ui-lang].
 * EXPORTS  SOPHIA.i18n {LANGS, add(code, name, dict), set(code), start(), tr(text), codes(),
 *          lang}
 * USES     SOPHIA.bus, MutationObserver on <body>
 * EMITS    lang-changed
 * RULES    - Never translated: #document, anything inside [translate="no"], form values,
 *            the record, the firmware, History snapshots.
 *          - Modules keep writing English. A new interface text needs one entry in EVERY
 *            09-lang-xx dictionary (tools/lint.py E8 checks they all have the same keys).
 *          - Dictionary keys with {n}, {n2}, {n3} (numbers) or {x}, {y}, {z} (any text) are
 *            templates, e.g. "Page {n}" → "Página {n}".
 *          - A text that is in no dictionary stays in English: always safe.
 *          - New language = copy 09-lang-es.js to 09-lang-xx.js, translate the values.
 * TESTS    tests/functional.cjs (language switch) · tools/snapshot.cjs edit-es@1280
 * ========================================================================== */
SOPHIA.i18n = (() => {
  'use strict';
  const ATTRS = ['title', 'aria-label', 'placeholder', 'data-short'];
  /* code → { name, dict, templates } ; English needs no dictionary */
  const LANGS = { en: { name: 'English', dict: {}, templates: [] } };
  const HOLE = { n: '(\\d+\\+?)', x: '(.+?)' };
  /** Turn "Page {n}" keys into [regex, holes, key] so numbers and names can vary. */
  function compile(dict) {
    const out = [];
    for (const key of Object.keys(dict)) {
      const holes = key.match(/\{(?:n\d?|[xyz])\}/g);
      if (!holes) continue;
      const src = key.split(/(\{(?:n\d?|[xyz])\})/).map((part) => (/^\{(?:n\d?|[xyz])\}$/.test(part) ? (HOLE[part[1]] || HOLE.x) : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('');
      out.push([new RegExp('^' + src + '$'), holes, key]);
    }
    return out;
  }
  /** Called by every 09-lang-xx module at load time. */
  function add(code, name, dict) {
    LANGS[code] = { name, dict, templates: compile(dict) };
  }
  let lang = 'en';
  try { lang = localStorage.getItem('sophia:pref:lang') || 'en'; } catch {}
  const origText = new Map(), origAttr = new Map();
  /** English interface text → the current language (unchanged when there is no translation). */
  function tr(en) {
    const L = LANGS[lang];
    if (lang === 'en' || !L || !en) return en;
    const lead = en.match(/^\s*/)[0], trail = en.match(/\s*$/)[0], core = en.trim();
    if (!core) return en;
    if (Object.hasOwn(L.dict, core)) return lead + L.dict[core] + trail;
    for (const [rx, holes, key] of L.templates) {
      const m = rx.exec(core);
      if (!m) continue;
      let out = L.dict[key];
      holes.forEach((h, i) => (out = out.replace(h, m[i + 1])));
      return lead + out + trail;
    }
    /* "Find (Ctrl+F)": translate the label, keep the shortcut */
    const k = /^(.+) \(([^()]+)\)$/.exec(core);
    if (k && Object.hasOwn(L.dict, k[1])) return lead + L.dict[k[1]] + ' (' + k[2] + ')' + trail;
    return en;
  }
  const skip = (el) => !el || el.closest?.('#document, [translate="no"], script, style, textarea, [contenteditable="true"]');
  let busy = false;
  function translate(root) {
    if (!root || root.nodeType !== 1 && root.nodeType !== 3) return;
    busy = true;
    try {
      const doText = (t) => {
        if (skip(t.parentElement)) return;
        const en = origText.has(t) ? origText.get(t) : t.nodeValue;
        const out = tr(en);
        if (out !== t.nodeValue) { if (!origText.has(t)) origText.set(t, en); t.nodeValue = out; }
      };
      const doEl = (el) => {
        if (skip(el)) return;
        for (const a of ATTRS) {
          if (!el.hasAttribute(a)) continue;
          const key = el, store = origAttr.get(key) || {};
          const en = a in store ? store[a] : el.getAttribute(a);
          const out = tr(en);
          if (out !== el.getAttribute(a)) { store[a] = en; origAttr.set(key, store); el.setAttribute(a, out); }
        }
      };
      if (root.nodeType === 3) { doText(root); return; }
      if (skip(root)) return;
      doEl(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, { acceptNode: (n) => (n.nodeType === 1 && skip(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      let n;
      while ((n = w.nextNode())) n.nodeType === 3 ? doText(n) : doEl(n);
    } finally {
      busy = false;
      mo.takeRecords();
    }
  }
  const mo = new MutationObserver((records) => {
    if (busy || lang === 'en') return;
    for (const r of records) {
      if (r.type === 'childList') r.addedNodes.forEach((n) => translate(n));
      else if (r.type === 'characterData') { if (!origText.has(r.target) || tr(origText.get(r.target)) !== r.target.nodeValue) { origText.delete(r.target); translate(r.target); } }
      else if (r.type === 'attributes') { const st = origAttr.get(r.target); if (st) delete st[r.attributeName]; translate(r.target); }
    }
  });
  function restoreEnglish() {
    busy = true;
    try {
      for (const [t, en] of origText) if (t.isConnected) t.nodeValue = en;
      for (const [el, st] of origAttr) if (el.isConnected) for (const a in st) el.setAttribute(a, st[a]);
    } finally { origText.clear(); origAttr.clear(); busy = false; mo.takeRecords(); }
  }
  /** Switch the interface language ('en' or any code a 09-lang-xx module registered). */
  function set(next) {
    lang = LANGS[next] ? next : 'en';
    try { localStorage.setItem('sophia:pref:lang', lang); } catch {}
    document.documentElement.dataset.uiLang = lang;
    if (lang === 'en') restoreEnglish(); else translate(document.body);
    SOPHIA.bus.emit('lang-changed', lang);
  }
  function start() {
    if (!LANGS[lang]) lang = 'en';
    document.documentElement.dataset.uiLang = lang;
    mo.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    if (lang !== 'en') translate(document.body);
  }
  /* periodic cleanup of disconnected nodes (dialogs come and go) */
  setInterval(() => { for (const t of origText.keys()) if (!t.isConnected) origText.delete(t); for (const e of origAttr.keys()) if (!e.isConnected) origAttr.delete(e); }, 30000);
  /** Language codes in menu order (owner's order first, then any other added language). */
  const ORDER = ['en', 'es', 'fr', 'it', 'de', 'pt'];
  const codes = () => Object.keys(LANGS).sort((a, b) => ((ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99)) || a.localeCompare(b));
  return { LANGS, add, set, start, tr, codes, get lang() { return lang; } };
})();
