/* ============================================================================
 * SOPHIA · 24-find                                     layer: FEATURE
 * ----------------------------------------------------------------------------
 * PURPOSE  Find & replace in the side panel "Find" tab: search box, Match case, Whole word,
 *          Include document information; every match highlighted, ‹ › / Enter to move;
 *          while editing Replace / Replace all, each ONE undo step.
 * OWNS     SOPHIA.find; highlights sophia-find / sophia-find-current
 *          (style: styles/ui/24-find.css).
 * EXPORTS  SOPHIA.find {open(query, replace), render(container), clear(), search(), state},
 *          openDocumentFind(), replaceDialog() (legacy entry points → open the panel)
 * USES     SOPHIA.{ask, numbering, bus}, EditorTransactions, area, toast
 * LISTENS  content-changed, transaction
 * RULES    Highlights use the CSS Highlight API (no DOM change). Replacements touch text
 *          nodes only and never cross blocks, line breaks or images.
 * TESTS    tests/functional.cjs (find, replace, replace all) · snapshot read-side-find
 * ========================================================================== */
SOPHIA.find = (() => {
  'use strict';
  const U = SOPHIA.util;
  const HL_ALL = 'sophia-find', HL_CUR = 'sophia-find-current';
  const BLOCK = 'p,li,h1,h2,h3,h4,blockquote,td,th,figcaption,aside';
  const state = { q: '', replace: '', matchCase: false, whole: false, meta: false, results: [], index: -1, focusReplace: false };
  let root = null;

  function blocks() {
    const body = [...area.querySelectorAll('.pagecontent :is(' + BLOCK + '), .qc-hero :is(h1, p)')]
      .filter((n) => !n.querySelector(BLOCK) && !n.closest('.identity,[data-trace],nav[data-sophia-toc]'));
    if (!state.meta) return body;
    const meta = [...area.querySelectorAll('.identity td.value')].filter((n) => !n.closest('[data-trace]') && !n.hasAttribute('data-version-cell'));
    return [...meta, ...body];
  }
  function segments(block) {
    const parts = [];
    let cur = { text: '', nodes: [] };
    const flush = () => { if (cur.text) parts.push(cur); cur = { text: '', nodes: [] }; };
    (function walk(n) {
      if (n.nodeType === 3) { cur.nodes.push({ node: n, start: cur.text.length, end: cur.text.length + n.length }); cur.text += n.data; return; }
      if (n.nodeType !== 1) return;
      if (n.matches('br,img,script,style')) { flush(); return; }
      for (const c of n.childNodes) walk(c);
    })(block);
    flush();
    return parts;
  }
  const wordChar = (c) => !!c && /[\p{L}\p{N}\p{M}_]/u.test(c);
  function search() {
    const out = [];
    if (state.q.length < 1) return out;
    const rx = new RegExp(state.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), state.matchCase ? 'gu' : 'giu');
    let heading = '';
    for (const b of blocks()) {
      if (/^H[1-4]$/.test(b.tagName)) heading = SOPHIA.numbering.label(b);
      for (const seg of segments(b)) {
        rx.lastIndex = 0;
        let m;
        while ((m = rx.exec(seg.text)) !== null) {
          if (!m[0].length) { rx.lastIndex++; continue; }
          const start = m.index, end = start + m[0].length;
          if (state.whole && (wordChar(Array.from(seg.text.slice(0, start)).at(-1)) || wordChar(Array.from(seg.text.slice(end))[0]))) continue;
          out.push({ block: b, seg, start, end, section: b.closest('.identity') ? 'Document information' : heading || 'Document' });
          if (out.length >= 2000) return out;
        }
      }
    }
    return out;
  }
  function rangeOf(m) {
    const r = document.createRange();
    const a = m.seg.nodes.find((x) => m.start >= x.start && m.start <= x.end);
    const z = m.seg.nodes.find((x) => m.end >= x.start && m.end <= x.end);
    if (!a || !z || !a.node.isConnected || !z.node.isConnected) return null;
    r.setStart(a.node, m.start - a.start);
    r.setEnd(z.node, m.end - z.start);
    return r;
  }
  function paint() {
    if (!window.CSS?.highlights || !window.Highlight) return;
    CSS.highlights.delete(HL_ALL);
    CSS.highlights.delete(HL_CUR);
    if (!state.results.length) return;
    const all = state.results.map(rangeOf).filter(Boolean);
    if (all.length) CSS.highlights.set(HL_ALL, new Highlight(...all));
    const cur = state.results[state.index] && rangeOf(state.results[state.index]);
    if (cur) CSS.highlights.set(HL_CUR, new Highlight(cur));
  }
  function clear() {
    if (window.CSS?.highlights) { CSS.highlights.delete(HL_ALL); CSS.highlights.delete(HL_CUR); }
  }
  function run(keepIndex) {
    const was = state.index;
    state.results = search();
    state.index = state.results.length ? Math.min(keepIndex && was >= 0 ? was : 0, state.results.length - 1) : -1;
    paint();
    renderResults();
  }
  function go(i, focusDoc) {
    if (!state.results.length) return;
    state.index = (i + state.results.length) % state.results.length;
    paint();
    const m = state.results[state.index], r = rangeOf(m);
    m.block.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (focusDoc && r && U.isEditing() && m.block.closest('[contenteditable=true]')) {
      m.block.closest('[contenteditable=true]').focus({ preventScroll: true });
      getSelection().removeAllRanges();
      getSelection().addRange(r);
    }
    renderResults();
  }
  function patch(m, text) {
    const entries = m.seg.nodes.filter((x) => x.end > m.start && x.start < m.end);
    if (!entries.length) throw Error('This match is no longer available. Search again.');
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i], from = Math.max(0, m.start - e.start), to = Math.min(e.node.length, m.end - e.start);
      e.node.data = e.node.data.slice(0, from) + (i === 0 ? text : '') + e.node.data.slice(to);
    }
  }
  function replaceOne() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const m = state.results[state.index];
    if (!m) return;
    const keep = state.index;
    if (EditorTransactions.run('Replace “' + state.q + '”', () => patch(m, state.replace))) {
      run(false);
      state.index = Math.min(keep, state.results.length - 1);
      paint();
      renderResults();
      if (state.results.length) go(state.index, false);
    }
  }
  function replaceAll() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const list = state.results.slice();
    if (!list.length) return;
    /* last match first: earlier offsets in the same text stay valid */
    const ok = EditorTransactions.run('Replace all “' + state.q + '” (' + list.length + ')', () => {
      list.slice().reverse().forEach((m) => patch(m, state.replace));
    });
    if (ok) {
      toast(list.length + ' replaced. Ctrl+Z undoes them all.');
      run(false);
    }
  }

  /* ---------- side panel UI ---------- */
  const el = U.el;
  function render(container) {
    root = container;
    root.replaceChildren();
    const box = el('div', 'sx-find');
    const row = el('div', 'sx-find-row');
    const input = document.createElement('input');
    input.type = 'search';
    input.className = 'sx-find-input';
    input.placeholder = 'Find in document';
    input.setAttribute('aria-label', 'Find in document');
    input.value = state.q;
    const prev = el('button', 'sx-btn sx-btn-icon', '‹');
    const next = el('button', 'sx-btn sx-btn-icon', '›');
    prev.type = next.type = 'button';
    prev.title = 'Previous match (Shift+Enter)';
    next.title = 'Next match (Enter)';
    prev.setAttribute('aria-label', prev.title);
    next.setAttribute('aria-label', next.title);
    prev.onclick = () => go(state.index - 1, true);
    next.onclick = () => go(state.index + 1, true);
    row.append(input, prev, next);
    const opts = el('div', 'sx-find-opts');
    const check = (key, label) => {
      const l = el('label', 'sx-find-opt');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = state[key];
      c.onchange = () => { state[key] = c.checked; run(false); };
      l.append(c, document.createTextNode(' ' + label));
      return l;
    };
    opts.append(check('matchCase', 'Match case'), check('whole', 'Whole word'), check('meta', 'Include document information'));
    const status = el('p', 'sx-find-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    box.append(row, opts, status);
    if (U.isEditing()) {
      const rep = el('div', 'sx-find-row sx-find-replace');
      const rin = document.createElement('input');
      rin.type = 'text';
      rin.className = 'sx-find-input';
      rin.placeholder = 'Replace with';
      rin.setAttribute('aria-label', 'Replace with');
      rin.value = state.replace;
      rin.oninput = () => (state.replace = rin.value);
      rin.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); replaceOne(); } };
      const one = el('button', 'sx-btn sx-btn-tonal', 'Replace');
      const all = el('button', 'sx-btn sx-btn-filled', 'Replace all');
      one.type = all.type = 'button';
      one.dataset.findReplace = '';
      all.dataset.findReplaceAll = '';
      one.onclick = replaceOne;
      all.onclick = replaceAll;
      rep.append(rin, one, all);
      box.append(rep, el('p', 'sx-hint', 'Each replacement is one undo step (Ctrl+Z). Formatting of the first matched character is kept.'));
      if (state.focusReplace) setTimeout(() => rin.focus(), 0);
    } else box.append(el('p', 'sx-hint', 'Start editing to replace text.'));
    const list = el('div', 'sx-find-results');
    list.setAttribute('translate', 'no');
    box.append(list);
    root.append(box);
    let t = 0;
    input.oninput = () => { state.q = input.value; clearTimeout(t); t = setTimeout(() => run(false), 120); };
    input.onkeydown = (e) => {
      if (e.key === 'Enter') { e.preventDefault(); go(state.index + (e.shiftKey ? -1 : 1), false); }
      else if (e.key === 'Escape') { input.value = ''; state.q = ''; run(false); }
    };
    if (!state.focusReplace) setTimeout(() => input.focus(), 0);
    state.focusReplace = false;
    run(true);
  }
  function renderResults() {
    if (!root?.isConnected) return;
    const status = root.querySelector('.sx-find-status'), list = root.querySelector('.sx-find-results');
    const n = state.results.length;
    status.textContent = !state.q ? 'Type to search the document.' : n ? (state.index + 1) + ' of ' + (n >= 2000 ? '2000+' : n) + ' match' + (n === 1 ? '' : 'es') : 'No matches.';
    root.querySelectorAll('[data-find-replace],[data-find-replace-all]').forEach((b) => (b.disabled = !n));
    const all = root.querySelector('[data-find-replace-all]');
    if (all) all.textContent = n ? 'Replace all (' + n + ')' : 'Replace all';
    list.replaceChildren();
    let section = null;
    state.results.slice(0, 300).forEach((m, i) => {
      if (m.section !== section) { section = m.section; list.append(el('h4', 'sx-find-section', section)); }
      const b = el('button', 'sx-hit' + (i === state.index ? ' is-current' : ''));
      b.type = 'button';
      const s = Math.max(0, m.start - 40), txt = m.seg.text;
      const line = el('span');
      line.append((s ? '…' : '') + txt.slice(s, m.start), el('mark', '', txt.slice(m.start, m.end)), txt.slice(m.end, m.end + 70) + (m.end + 70 < txt.length ? '…' : ''));
      b.append(line);
      b.onclick = () => go(i, true);
      list.append(b);
    });
    if (n > 300) list.append(el('p', 'sx-hint', 'Showing the first 300 matches.'));
  }
  function open(query, replace) {
    if (typeof query === 'string') state.q = query;
    state.focusReplace = !!replace;
    SOPHIA.ask.panel('find');
  }
  let refresh = 0;
  SOPHIA.bus.on('content-changed', () => { if (root?.isConnected && state.q) { clearTimeout(refresh); refresh = setTimeout(() => run(true), 300); } });
  SOPHIA.bus.on('transaction', () => { if (root?.isConnected && state.q) { clearTimeout(refresh); refresh = setTimeout(() => run(true), 300); } });
  area.addEventListener('input', () => { if (root?.isConnected && state.q) { clearTimeout(refresh); refresh = setTimeout(() => run(true), 400); } });
  return { open, render, clear, search: (q) => { state.q = q; run(false); return state.results.length; }, state };
})();
/* legacy entry points (85-flow Ctrl+F / Ctrl+H, other modules) */
window.openDocumentFind = (q) => SOPHIA.find.open(q);
window.replaceDialog = () => SOPHIA.find.open(undefined, true);
