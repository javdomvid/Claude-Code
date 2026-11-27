/* ============================================================================
 * SOPHIA · 59-xref                                     layer: DOCUMENT
 * ----------------------------------------------------------------------------
 * PURPOSE  Cross-references ("see 3.2 Create the order") that follow the document: the
 *          link points to a heading by its block ID and its text is rewritten whenever
 *          numbers or titles change. A reference whose heading was deleted is flagged.
 * OWNS     SOPHIA.xref; the markup a.xref[data-xref][data-xref-format].
 * EXPORTS  SOPHIA.xref {insert() (dialog), insertAt(targetId, format), update(), broken(),
 *          targets()}
 * USES     SOPHIA.{ids, numbering, bus, util}, EditorTransactions, EditorCommands, area, modal,
 *          muted, observer, toast
 * LISTENS  content-changed, outline-changed, transaction, view-changed, session, ready
 * DOM      inside the document: <a class="xref" data-xref="b-…" data-xref-format="full|num"
 *          href="#b-…">3.2 Create the order</a>
 * RULES    - The link text is DERIVED: never edit it by hand (the next update rewrites it);
 *            SOPHIA.canonical ignores it, so renumbering never makes the document "dirty".
 *          - Targets are headings (h2–h4) only. Formats: "full" (number + title, default),
 *            "num" (number only; the title when numbering is off).
 *          - Updates run muted (not an edit, not an undo step).
 *          - Typing with the caret inside a reference writes AFTER it (before it when the
 *            caret is at its start): the derived text is never edited by accident.
 *          - Look: paper.common.css (a.xref, .xref-broken); prints as plain text.
 * TESTS    tests/functional.cjs (cross-reference: insert, renumber, broken)
 * ========================================================================== */
SOPHIA.xref = (() => {
  'use strict';
  const U = SOPHIA.util;
  const ID = /^b-[a-z0-9]{10}$/;
  /** Headings a reference can point to, with their current label. */
  function targets() {
    return SOPHIA.numbering.compute().filter(({ h }) => h.dataset.blockId).map(({ h }) => ({ id: h.dataset.blockId, label: SOPHIA.numbering.label(h), level: Number(h.tagName[1]) }));
  }
  /* "full" = the heading as it reads (SOP "3.2 Create the order", Quick Card "03 · DELIVERY");
     "num" = the number alone ("3.2", "03"), or the title when numbering is off. */
  function textFor(h, format) {
    const raw = SOPHIA.numbering.enabled() ? (h.getAttribute('data-num') || '') : '';
    const title = h.textContent.trim();
    if (format === 'num' && raw) return raw.replace(/\s*·\s*$/, '').replace(/\.$/, '');
    return (raw ? raw + ' ' : '') + title;
  }
  /** Rewrite every reference from its target (muted). Returns how many are broken. */
  function update() {
    const refs = [...area.querySelectorAll('a.xref[data-xref]')];
    if (!refs.length) return 0;
    let bad = 0;
    const old = muted;
    muted = true;
    try {
      for (const a of refs) {
        const id = a.dataset.xref;
        const h = ID.test(id) ? SOPHIA.ids.find(id) : null;
        const ok = !!h && /^H[2-4]$/.test(h.tagName);
        a.classList.toggle('xref-broken', !ok);
        if (!ok) { bad++; a.title = 'This reference points to a section that no longer exists.'; continue; }
        a.removeAttribute('title');
        const text = textFor(h, a.dataset.xrefFormat);
        if (a.textContent !== text) a.textContent = text;
        if (a.getAttribute('href') !== '#' + id) a.setAttribute('href', '#' + id);
      }
    } finally {
      observer.takeRecords();
      muted = old;
    }
    return bad;
  }
  const broken = () => [...area.querySelectorAll('a.xref.xref-broken')];
  /** Insert a reference at the remembered caret (one undo step). */
  function insertAt(targetId, format = 'full') {
    const h = SOPHIA.ids.find(targetId);
    if (!h || !/^H[2-4]$/.test(h.tagName)) { toast('Choose a heading to refer to.'); return false; }
    EditorCommands.restore?.(undefined, true); // back to the caret remembered before the dialog
    const range = getSelection().rangeCount ? getSelection().getRangeAt(0) : null;
    const node = range && U.nodeOf(range.startContainer);
    if (!node || !area.contains(node) || !node.closest('.pagecontent') || !node.closest('[contenteditable=true]') || node.closest('a, h2, h3, h4, nav')) {
      toast('Place the cursor in a paragraph, list or table first.');
      return false;
    }
    return EditorTransactions.run('Insert cross-reference', () => {
      const a = document.createElement('a');
      a.className = 'xref';
      a.dataset.xref = targetId;
      a.dataset.xrefFormat = format === 'num' ? 'num' : 'full';
      a.href = '#' + targetId;
      a.textContent = textFor(h, a.dataset.xrefFormat);
      range.deleteContents();
      /* "owner.3.2 …" reads badly: put a space before the reference when the text runs into it */
      const prev = range.startContainer.nodeType === 3 ? range.startContainer.nodeValue.slice(0, range.startOffset) : '';
      if (prev && !/[\s\u00a0(«“"]$/.test(prev)) {
        range.insertNode(document.createTextNode(' '));
        range.collapse(false);
      }
      range.insertNode(a);
      const r = document.createRange();
      r.setStartAfter(a);
      r.collapse(true);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
    });
  }
  /** Dialog: choose the heading and the format. */
  function insert() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const list = targets();
    if (!list.length) { toast('The document has no headings to refer to.'); return; }
    EditorCommands.remember?.();
    const v = modal('Insert cross-reference',
      '<label>Refer to<select id="xrefTarget"></select></label>' +
        '<fieldset class="sx-xref-format"><legend>Show</legend>' +
        '<label class="check"><input type="radio" name="xrefFormat" value="full" checked> Number and title</label>' +
        '<label class="check"><input type="radio" name="xrefFormat" value="num"> Number only</label></fieldset>' +
        '<p class="muted">The text follows the heading: it changes by itself when numbers or titles change.</p>',
      (dlg) => {
        const id = dlg.querySelector('#xrefTarget').value, fmt = dlg.querySelector('input[name=xrefFormat]:checked').value;
        dlg.remove();
        if (insertAt(id, fmt)) toast('Cross-reference inserted.');
      }, 'Insert');
    const sel = v.querySelector('#xrefTarget');
    sel.setAttribute('translate', 'no');
    for (const t of list) sel.append(new Option(' '.repeat(t.level - 2) + t.label, t.id));
  }
  /* Typing inside a reference: the characters go after it (or before it at its start). */
  area.addEventListener('beforeinput', (e) => {
    if (!/^insert(Text|ReplacementText)$/.test(e.inputType) || !e.data) return;
    const s = getSelection();
    if (!s.rangeCount || !s.isCollapsed) return;
    const a = U.nodeOf(s.anchorNode)?.closest?.('a.xref[data-xref]');
    if (!a || !area.contains(a)) return;
    e.preventDefault();
    const atStart = s.anchorOffset === 0 && (s.anchorNode === a || s.anchorNode === a.firstChild);
    let t = atStart ? a.previousSibling : a.nextSibling;
    if (!t || t.nodeType !== 3) { t = document.createTextNode(''); atStart ? a.before(t) : a.after(t); }
    const at = atStart ? t.length : 0;
    t.insertData(at, e.data);
    const r = document.createRange();
    r.setStart(t, at + e.data.length);
    r.collapse(true);
    s.removeAllRanges();
    s.addRange(r);
    area.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: e.inputType, data: e.data }));
  });
  /* Reading: a click on a reference goes to its heading (the page has no element ids). */
  area.addEventListener('click', (e) => {
    const a = e.target.closest?.('a.xref[data-xref]');
    if (!a || (U.isEditing() && !(e.ctrlKey || e.metaKey))) return;
    e.preventDefault();
    SOPHIA.ids.find(a.dataset.xref)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  let timer = 0;
  const soon = () => { clearTimeout(timer); timer = setTimeout(update, 200); };
  SOPHIA.bus.on('content-changed', soon);
  SOPHIA.bus.on('outline-changed', soon);
  SOPHIA.bus.on('transaction', soon);
  SOPHIA.bus.on('view-changed', soon);
  SOPHIA.bus.on('session', soon);
  SOPHIA.bus.on('ready', update);
  return { insert, insertAt, update, broken, targets };
})();
