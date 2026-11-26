/* ============================================================================
 * SOPHIA · 58-blocks
 * L (owner, 2026-11-26): move blocks, paragraph style gallery, table of contents.
 * All changes go through EditorTransactions.run (one undo step each).
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
    const sibling = direction < 0 ? b.previousElementSibling : b.nextElementSibling;
    let target = sibling, where = direction < 0 ? 'before' : 'after';
    if (!target) {
      const sheets = [...area.querySelectorAll('.sheet')], i = sheets.indexOf(b.closest('.sheet'));
      const other = sheets[i + direction]?.querySelector('.pagecontent');
      if (!other) { toast(direction < 0 ? 'Already the first block.' : 'Already the last block.'); return; }
      target = other;
      where = direction < 0 ? 'append' : 'prepend';
    }
    const caret = getSelection().rangeCount ? getSelection().getRangeAt(0).cloneRange() : null;
    const ok = EditorTransactions.run(direction < 0 ? 'Move block up' : 'Move block down', () => {
      if (where === 'before') target.before(b);
      else if (where === 'after') target.after(b);
      else target[where](b);
    });
    if (ok) {
      b.scrollIntoView({ block: 'nearest' });
      if (caret) { try { getSelection().removeAllRanges(); getSelection().addRange(caret); } catch {} }
    }
  }
  /* ---------- style gallery ---------- */
  const STYLES = [
    ['p', 'Normal text'], ['h2', 'Heading 1'], ['h3', 'Heading 2'], ['h4', 'Heading 3'], ['blockquote', 'Quote'],
    ['warning', 'Warning callout'], ['confirmation', 'Confirmation required']
  ];
  function applyStyle(name) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    if (['p', 'h2', 'h3', 'h4', 'blockquote'].includes(name)) { EditorCommands.command('formatBlock', name); return; }
    const b = currentTop();
    if (!b) { toast('Place the cursor in a paragraph first.'); return; }
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
    return SOPHIA.numbering.compute().filter(({ h }) => /^H[23]$/.test(h.tagName)).map(({ h, num }) => ({ level: h.tagName === 'H2' ? 1 : 2, text: (num ? num + ' ' : '') + h.textContent.trim(), id: h.dataset.blockId || '' }));
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
  return { move, applyStyle, STYLES, insertToc, refreshToc, tocIsCurrent, currentTop };
})();
