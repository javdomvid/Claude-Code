/* ============================================================================
 * SOPHIA · 58-blocks                                   layer: DOCUMENT
 * ----------------------------------------------------------------------------
 * PURPOSE  Block operations (owner decision L): move a block up/down, the established
 *          styles of each profile (style gallery), current style, table of contents.
 * OWNS     SOPHIA.blocks; STYLES per profile (owner decision V).
 * EXPORTS  SOPHIA.blocks {STYLES, applyStyle(name), currentStyle(), currentTop(), move(dir),
 *          insertToc(), refreshToc(user)}
 * USES     SOPHIA.{ids, numbering, qc, tables, bus}, EditorCommands, EditorTransactions, area,
 *          muted, observer, toast
 * LISTENS  content-changed
 * RULES    - STYLES is the ONLY list of styles the editor offers; SOP and Quick Card have
 *            their own. Do not add free styles or colours.
 *          - Every change is one EditorTransactions.run step.
 * TESTS    tests/functional.cjs (gallery, move, TOC)
 * ========================================================================== */
SOPHIA.blocks = (() => {
  'use strict';
  const U = SOPHIA.util;
  function topBlock(node) {
    let el = U.nodeOf(node);
    while (el && el.parentElement && !el.parentElement.matches('.pagecontent')) el = el.parentElement;
    return el?.parentElement?.matches('.pagecontent') ? el : null;
  }
  function currentTop() {
    const s = getSelection();
    return s.rangeCount ? topBlock(s.anchorNode) : null;
  }
  /* ---------- move ---------- */
  function move(direction) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const b = currentTop();
    if (!b) { toast('Place the cursor in the block you want to move.'); return; }
    /* Swap with the neighbour in DOCUMENT order, also across A4 sheets. */
    let target = direction < 0 ? b.previousElementSibling : b.nextElementSibling;
    if (!target) {
      const pcs = [...area.querySelectorAll('.pagecontent')];
      for (let k = pcs.indexOf(b.parentElement) + direction; !target && k >= 0 && k < pcs.length; k += direction)
        target = direction < 0 ? pcs[k].lastElementChild : pcs[k].firstElementChild;
      if (!target) { toast(direction < 0 ? 'Already the first block.' : 'Already the last block.'); return; }
    }
    const caret = textOffset(b);
    const ok = EditorTransactions.run(direction < 0 ? 'Move block up' : 'Move block down', () => {
      if (direction < 0) target.before(b);
      else target.after(b);
    });
    if (ok) {
      b.scrollIntoView({ block: 'nearest' });
      placeCaret(b, caret);
    }
  }
  /* The caret stays at the same character inside the moved block (DOM moves collapse ranges). */
  function textOffset(block) {
    const s = getSelection();
    if (!s.rangeCount || !block.contains(s.anchorNode)) return 0;
    const r = document.createRange();
    r.selectNodeContents(block);
    r.setEnd(s.anchorNode, s.anchorOffset);
    return r.toString().length;
  }
  function placeCaret(block, offset) {
    const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    let left = offset, node = null;
    while ((node = w.nextNode())) {
      if (left <= node.nodeValue.length) break;
      left -= node.nodeValue.length;
    }
    const r = document.createRange();
    if (node) r.setStart(node, Math.min(left, node.nodeValue.length));
    else { r.selectNodeContents(block); r.collapse(true); }
    r.collapse(true);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  /* ---------- style gallery (V78 · owner: only the ESTABLISHED styles of each profile) ----------
     Each entry: [name, label, hint]. SOP and Quick Card have their own fixed sets; free
     styles are not offered. The paper CSS of the profile gives each one its look. */
  const QC = SOPHIA.profile === 'quick-card';
  const STYLES = QC
    ? [['p', 'Body text', 'Normal paragraph'], ['h2', 'Section', '01 · numbered'], ['card', 'Information card', 'Card with title'], ['h3', 'Card title', 'Title inside a card'],
       ['bullets', 'Bullet list', 'Checks, attachments'], ['decision', 'Decision table', 'Situation → next action'], ['warning', 'Warning', 'Amber callout'],
       ['confirmation', 'Confirmation required', 'Open point'], ['pending', 'Pending card', 'Card to confirm'], ['source', 'Source note', 'Where it comes from']]
    : [['p', 'Body text', 'Normal paragraph'], ['h2', 'Section', '1. numbered'], ['h3', 'Sub-section', '1.1 numbered'], ['h4', 'Step group', '1.1.1 numbered'],
       ['steps', 'Procedure steps', 'Numbered actions'], ['bullets', 'Bullet list', 'Unordered points'], ['warning', 'Warning', 'Amber callout'],
       ['confirmation', 'Confirmation required', 'Open point'], ['source', 'Source note', 'Reference / source']];
  /** Name of the established style of the block that holds the caret (or null). */
  function currentStyle() {
    const s = getSelection();
    const n = s.rangeCount ? U.nodeOf(s.anchorNode) : null;
    if (!n || !area.contains(n)) return null;
    const blk = n.closest('li, p, h2, h3, h4, aside.warning, td, th, blockquote');
    if (!blk) return null;
    if (blk.matches('aside.warning') || blk.closest('aside.warning')) return /confirm/i.test(blk.closest('aside.warning').querySelector(':scope > b')?.textContent || '') ? 'confirmation' : 'warning';
    if (blk.tagName === 'LI') return blk.parentElement?.tagName === 'OL' ? 'steps' : 'bullets';
    if (/^H[2-4]$/.test(blk.tagName)) return blk.tagName.toLowerCase();
    if (blk.matches('p.source-note')) return 'source';
    if (blk.matches('td, th')) return null;
    return 'p';
  }
  function applyStyle(name) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    if (name === 'steps' || name === 'bullets') {
      const want = name === 'steps' ? 'OL' : 'UL', cur = currentStyle();
      if (cur === name) return;
      EditorCommands.command(want === 'OL' ? 'insertOrderedList' : 'insertUnorderedList');
      return;
    }
    if (name === 'card') { SOPHIA.qc.insertCard(); return; }
    if (name === 'pending') { SOPHIA.qc.togglePending(); return; }
    if (name === 'decision') { SOPHIA.tables.decisionTable(); return; }
    if (['p', 'h2', 'h3', 'h4', 'blockquote'].includes(name)) {
      const b = currentTop();
      if (b?.matches('p.source-note') && name === 'p') { EditorTransactions.run('Body text', () => b.classList.remove('source-note')); return; }
      EditorCommands.command('formatBlock', name);
      return;
    }
    const b = currentTop();
    if (!b) { toast('Place the cursor in a paragraph first.'); return; }
    if (name === 'source') {
      EditorTransactions.run('Source note', () => {
        if (b.matches('p')) { b.classList.add('source-note'); return; }
        const p = document.createElement('p');
        p.className = 'source-note';
        p.append(...(b.matches('aside, h2, h3, h4, blockquote') ? b.childNodes : [b.cloneNode(true)]));
        b.replaceWith(p);
      });
      return;
    }
    const label = name === 'warning' ? 'Warning:' : 'Confirmation required:';
    EditorTransactions.run('Apply ' + label.replace(':', '') + ' style', () => {
      if (b.matches('aside.warning')) { const l = b.querySelector(':scope > b'); if (l) l.textContent = label; return; }
      const aside = document.createElement('aside');
      aside.className = 'warning';
      const strong = document.createElement('b');
      strong.textContent = label;
      aside.append(strong, document.createTextNode(' '));
      if (b.matches('p')) aside.append(...b.childNodes);
      else aside.append(b.cloneNode(true));
      b.replaceWith(aside);
    });
  }
  /* ---------- table of contents (generated block, refreshed automatically) ---------- */
  function tocItems() {
    return SOPHIA.numbering.compute().filter(({ h }) => /^H[23]$/.test(h.tagName)).map(({ h, num }) => ({ level: h.tagName === 'H2' ? 1 : 2, text: (num ? num +
      ' ' : '') + h.textContent.trim(), id: h.dataset.blockId || '' }));
  }
  function buildToc(nav) {
    nav.replaceChildren();
    nav.append(U.el('p', 'toc-title', 'Contents'));
    const ol = U.el('ol', 'toc-list');
    for (const it of tocItems()) {
      const li = U.el('li', 'toc-l' + it.level, it.text);
      if (it.id) li.dataset.target = it.id;
      ol.append(li);
    }
    nav.append(ol);
  }
  function insertToc() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const existing = area.querySelector('nav[data-sophia-toc]');
    if (existing) { refreshToc(true); toast('Table of contents updated.'); return; }
    const b = currentTop() || area.querySelector('.pagecontent > *');
    EditorTransactions.run('Insert table of contents', () => {
      const nav = document.createElement('nav');
      nav.className = 'toc';
      nav.dataset.sophiaToc = '';
      nav.setAttribute('aria-label', 'Contents');
      buildToc(nav);
      if (b) b.after(nav); else area.querySelector('.pagecontent').prepend(nav);
    });
  }
  function tocIsCurrent() {
    const nav = area.querySelector('nav[data-sophia-toc]');
    if (!nav) return true;
    const want = tocItems().map((i) => i.text).join('\n');
    const have = [...nav.querySelectorAll('li')].map((li) => li.textContent).join('\n');
    return want === have;
  }
  function refreshToc(force) {
    const nav = area.querySelector('nav[data-sophia-toc]');
    if (!nav || (!force && tocIsCurrent())) return;
    const old = muted;
    muted = true;
    try { buildToc(nav); } finally { observer.takeRecords(); muted = old; }
  }
  area.addEventListener('click', (e) => {
    const li = e.target.closest?.('nav[data-sophia-toc] li[data-target]');
    if (li) SOPHIA.ids.find(li.dataset.target)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  let timer = 0;
  SOPHIA.bus.on('content-changed', () => { clearTimeout(timer); timer = setTimeout(() => refreshToc(false), 400); });
  /* Alt+↑ / Alt+↓ moves the current block (images keep their own handler in EditorMedia). */
  document.addEventListener('keydown', (e) => {
    if (!e.altKey || e.ctrlKey || e.metaKey || !['ArrowUp', 'ArrowDown'].includes(e.key) || !U.isEditing() || U.dialogOpen()) return;
    if (!area.contains(getSelection().anchorNode)) return;
    e.preventDefault();
    move(e.key === 'ArrowUp' ? -1 : 1);
  });
  return { move, applyStyle, currentStyle, STYLES, insertToc, refreshToc, tocIsCurrent, currentTop };
})();
