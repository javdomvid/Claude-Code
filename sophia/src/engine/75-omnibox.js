/* ============================================================================
 * SOPHIA · 75-omnibox                                  layer: SHELL (Ctrl+K)
 * ----------------------------------------------------------------------------
 * PURPOSE  One field for every command and for searching the document text.
 *          Empty field → bento of commands by area (SHEET). Typing → matching
 *          commands (any interface language) + matching blocks of the document
 *          (click = jump + highlight; "Open Find" = side-panel Find).
 * OWNS     SOPHIA.ui.omnibox, SHEET (which commands appear, by area), the panel.
 * EXPORTS  SOPHIA.ui.omnibox.{el, panel, open(), close(restoreSelection), focus(),
 *          place(), isOpen()}
 * USES     SOPHIA.ui.kit, SOPHIA.commands, SOPHIA.i18n.tr, SOPHIA.numbering.label,
 *          SOPHIA.find.open, area, CSS Highlight API ("sophia-omni")
 * DOM      div.sx-omni (placed in the app bar by 79-shell), div.sx-omni-panel (body)
 * RULES    Reads the document, never changes it. Style: styles/ui/75-omnibox.css.
 * TESTS    tests/functional.cjs (omnibox) · tools/snapshot.cjs read-omnibox*
 * ========================================================================== */
SOPHIA.ui.omnibox = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const { icon, runtime, refreshSoon, closeMenus } = SOPHIA.ui.kit;

  /* Commands omnibox (owner, V77.1): one field for every command, grouped by area, and for
     searching the document. Click or Ctrl+K puts the caret in it and opens the panel. */
  const omni = U.el('div', 'sx-omni');
  omni.setAttribute('role', 'search');
  const omniInput = document.createElement('input');
  omniInput.type = 'search';
  omniInput.className = 'sx-omni-input';
  omniInput.placeholder = 'Commands & search';
  omniInput.autocomplete = 'off';
  omniInput.spellcheck = false;
  omniInput.setAttribute('aria-label', 'Commands and search in the document');
  omniInput.setAttribute('role', 'combobox');
  omniInput.setAttribute('aria-expanded', 'false');
  omniInput.setAttribute('aria-controls', 'sx-omni-panel');
  omni.append(icon('commands'), omniInput, U.el('kbd', 'sx-kbd', 'Ctrl K'));


  /* ---------- commands omnibox panel (commands by area + matches in the document) ---------- */
  const SHEET = [
    { name: 'Save & publish', tone: 'save', items: ['edit', 'saveDraft', 'publish', 'bigValidation', 'baseVersion', 'recover', 'discard'] },
    { name: 'Review', tone: 'review', items: ['history', 'versions', 'compare', 'comments', 'addComment', 'markTbc', 'checks', 'structure'] },
    { name: 'Navigate', tone: 'navigate', items: ['outline', 'find', 'replace', 'wordCount'] },
    { name: 'Insert', tone: 'assets', items: ['insertTable', 'insertImage', 'insertLink', 'insertToc', 'insertCard', 'importDocx', 'imageLibrary', 'tableStudio', 'tableFlow', 'imageStudio'] },
    { name: 'Output', tone: 'output', items: ['print', 'downloadCopy', 'exportDocx', 'upgrade'] },
    { name: 'Agent (SOPHIA)', tone: 'agent', items: ['brief', 'exportMap', 'applyProposal'] },
    { name: 'View', tone: 'navigate', items: ['viewA4', 'viewContinuous', 'zoomFit', 'focus', 'canvas', 'sidebar', 'mainMode', 'ribbonMode', 'layoutStudio', 'autoNumber', 'showMarks'] },
    { name: 'Help', tone: 'output', items: ['shortcuts', 'about'] }
  ];
  const omniPanel = runtime(U.el('div', 'sx-omni-panel'));
  omniPanel.id = 'sx-omni-panel';
  omniPanel.hidden = true;
  let omniRange = null;
  const HL_OMNI = 'sophia-omni';
  function cmdItem(id, tone) {
    const c = C.get(id);
    if (!c || (c.profile && c.profile !== SOPHIA.profile)) return null;
    const b = U.el('button', 'sx-cmd');
    b.type = 'button';
    b.dataset.cmd = id;
    if (tone) b.dataset.tone = tone;
    b.dataset.search = (c.label + ' ' + SOPHIA.i18n.tr(c.label) + ' ' + c.group + ' ' + id).toLowerCase();
    b.append(icon(c.icon || 'more'), U.el('span', '', c.label));
    if (c.keys) b.append(U.el('kbd', '', c.keys));
    if (!C.available(c)) { b.setAttribute('aria-disabled', 'true'); b.title = c.editing && !U.isEditing() ? 'Start editing first' : c.why || ''; }
    b.onclick = () => {
      if (b.getAttribute('aria-disabled') === 'true') { toast(b.title || 'Not available right now.'); return; }
      closeOmni(true);
      C.run(id);
      refreshSoon();
    };
    return b;
  }
  function docMatches(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || q.trim().length < 2) return [];
    const out = [];
    const blocks = [...area.querySelectorAll('.pagecontent :is(h2,h3,h4,p,li,td,th,figcaption,aside,blockquote), .qc-hero :is(h1,p), .identity .value')]
      .filter((n) => !n.querySelector('p,li,h2,h3,h4,table') && n.textContent.trim());
    let heading = '';
    for (const n of blocks) {
      if (/^H[2-4]$/.test(n.tagName)) heading = SOPHIA.numbering.label(n);
      const text = n.textContent, low = text.toLowerCase(), flat = low.replace(/\s+/g, ' ');
      if (!words.every((w) => flat.includes(w)) || low.indexOf(words[0]) < 0) continue;
      const at = low.indexOf(words[0]);
      out.push({ node: n, heading: n.closest('.identity') ? 'Document information' : /^H[2-4]$/.test(n.tagName) ? 'Heading' + (n.dataset.num ? ' ' + n.dataset.num : '') : heading || 'Document', text, at, len: words[0].length });
      if (out.length >= 40) break;
    }
    return out;
  }
  function jumpTo(m) {
    closeOmni(false);
    const n = m.node;
    n.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let left = m.at, node, range = null;
    while ((node = w.nextNode())) {
      if (left <= node.nodeValue.length) { range = document.createRange(); range.setStart(node, Math.min(left, node.nodeValue.length)); range.setEnd(node, Math.min(left + m.len, node.nodeValue.length)); break; }
      left -= node.nodeValue.length;
    }
    if (range && window.CSS?.highlights) {
      CSS.highlights.set(HL_OMNI, new Highlight(range));
      setTimeout(() => CSS.highlights.delete(HL_OMNI), 2600);
    }
    if (range && U.isEditing() && n.closest('[contenteditable=true]')) {
      n.closest('[contenteditable=true]').focus({ preventScroll: true });
      getSelection().removeAllRanges();
      getSelection().addRange(range);
    }
  }
  function renderOmni() {
    const q = omniInput.value.trim();
    omniPanel.replaceChildren();
    if (!q) {
      const grid = U.el('div', 'sx-bento');
      for (const t of SHEET) {
        const tile = U.el('section', 'sx-tile');
        tile.dataset.tone = t.tone;
        tile.append(U.el('h3', '', t.name));
        const list = U.el('div', 'sx-tile-list');
        for (const id of t.items) { const b = cmdItem(id, t.tone); if (b) list.append(b); }
        tile.append(list);
        grid.append(tile);
      }
      omniPanel.append(grid);
      omniPanel.append(U.el('p', 'sx-omni-foot', 'Type to filter commands and search the text of this document · ↑↓ to move · Enter to run · Esc to close'));
      return;
    }
    const words = q.toLowerCase().split(/\s+/);
    const cmds = C.all().filter((c) => c.label && words.every((w) => (c.label + ' ' + SOPHIA.i18n.tr(c.label) + ' ' + SOPHIA.i18n.tr(c.group) + ' ' + c.group + ' ' + c.id).toLowerCase().includes(w))).slice(0, 12);
    const wrap = U.el('div', 'sx-omni-results');
    const colA = U.el('section', 'sx-omni-col');
    colA.append(U.el('h3', '', 'Commands'));
    if (!cmds.length) colA.append(U.el('p', 'sx-empty', 'No command matches.'));
    for (const c of cmds) { const b = cmdItem(c.id); if (b) colA.append(b); }
    const colB = U.el('section', 'sx-omni-col sx-omni-doc');
    const hits = docMatches(q);
    colB.append(U.el('h3', '', 'In this document · ' + (hits.length >= 40 ? '40+' : hits.length)));
    if (!hits.length) colB.append(U.el('p', 'sx-empty', q.length < 2 ? 'Type at least 2 characters.' : 'No text in the document matches “' + q + '”.'));
    for (const m of hits) {
      const b = U.el('button', 'sx-hit');
      b.type = 'button';
      b.setAttribute('translate', 'no');
      b.append(U.el('small', '', m.heading));
      const line = U.el('span');
      const start = Math.max(0, m.at - 48);
      line.append((start ? '…' : '') + m.text.slice(start, m.at), U.el('mark', '', m.text.slice(m.at, m.at + m.len)), m.text.slice(m.at + m.len, m.at + m.len + 90) + (m.at + m.len + 90 < m.text.length ? '…' : ''));
      b.append(line);
      b.onclick = () => jumpTo(m);
      colB.append(b);
    }
    if (hits.length) {
      const all = U.el('button', 'sx-cmd');
      all.type = 'button';
      all.append(icon('find'), U.el('span', '', 'Open Find for all matches'), U.el('kbd', '', 'Ctrl+F'));
      all.onclick = () => { closeOmni(false); SOPHIA.find.open(q); };
      colB.append(all);
    }
    wrap.append(colA, colB);
    omniPanel.append(wrap);
  }
  function openOmni() {
    if (U.dialogOpen()) return;
    closeMenus();
    const s = getSelection();
    if (s.rangeCount && area.contains(s.anchorNode)) omniRange = s.getRangeAt(0).cloneRange();
    if (omniPanel.hidden) { omniPanel.hidden = false; omniInput.setAttribute('aria-expanded', 'true'); renderOmni(); placeOmni(); }
  }
  function closeOmni(restoreSel) {
    if (omniPanel.hidden) return;
    omniPanel.hidden = true;
    omniInput.setAttribute('aria-expanded', 'false');
    omniInput.value = '';
    omniInput.blur();
    if (restoreSel && omniRange) { try { getSelection().removeAllRanges(); getSelection().addRange(omniRange); } catch {} }
    omniRange = null;
  }
  function placeOmni() {
    const r = omni.getBoundingClientRect();
    const w = Math.min(980, window.innerWidth - 16);
    omniPanel.style.width = w + 'px';
    omniPanel.style.top = Math.round(r.bottom + 8) + 'px';
    omniPanel.style.left = Math.round(Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))) + 'px';
  }
  function focusOmni() { omniInput.focus(); openOmni(); }
  omniInput.addEventListener('focus', openOmni);
  omniInput.addEventListener('click', openOmni);
  omniInput.addEventListener('input', () => { openOmni(); renderOmni(); });
  omniInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeOmni(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); omniPanel.querySelector('button:not([aria-disabled=true])')?.focus(); return; }
    if (e.key === 'Enter') { e.preventDefault(); omniPanel.querySelector('.sx-cmd:not([aria-disabled=true]), .sx-hit')?.click(); }
  });
  omniPanel.addEventListener('keydown', (e) => {
    const all = [...omniPanel.querySelectorAll('button:not([aria-disabled=true])')], i = all.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closeOmni(true); return; }
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && i <= 0) omniInput.focus();
    else all[Math.min(all.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))]?.focus();
  });
  document.addEventListener('pointerdown', (e) => { if (!omniPanel.hidden && !omniPanel.contains(e.target) && !omni.contains(e.target)) closeOmni(false); }, true);

  return { el: omni, panel: omniPanel, open: openOmni, close: closeOmni, focus: focusOmni, place: placeOmni, isOpen: () => !omniPanel.hidden, input: omniInput };
})();
