/* ============================================================================
 * SOPHIA · 80-profile-qc                               layer: DOCUMENT
 * ----------------------------------------------------------------------------
 * PURPOSE  Quick Card only: information cards (.cards > section) and the "pending" card
 *          state. Loaded in both profiles; does nothing in SOP.
 * OWNS     SOPHIA.qc.
 * EXPORTS  SOPHIA.qc {insertCard, togglePending, active}
 * USES     SOPHIA.blocks, EditorTransactions, area, toast
 * RULES    Markup contract (also in the agent brief):
 *          <div class="cards"><section><h3>Title</h3><p>Text…</p></section>…</div>;
 *          <section class="pending"> = content to be confirmed before use.
 * TESTS    tests/functional.cjs (Quick Card profile)
 * ========================================================================== */
SOPHIA.qc = (() => {
  'use strict';
  if (SOPHIA.profile !== 'quick-card') return { insertCard() {}, togglePending() {}, active: false };
  const U = SOPHIA.util;
  function currentCard() {
    const s = getSelection();
    const n = s.rangeCount ? U.nodeOf(s.anchorNode) : null;
    const card = n?.closest?.('.cards > section');
    return card && area.contains(card) ? card : null;
  }
  function makeCard() {
    const sec = document.createElement('section');
    const h = document.createElement('h3');
    h.textContent = 'Card title';
    const p = document.createElement('p');
    p.textContent = 'Card text.';
    sec.append(h, p);
    return sec;
  }
  function selectText(node) {
    const r = document.createRange();
    r.selectNodeContents(node);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }
  function insertCard() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const card = currentCard();
    const top = SOPHIA.blocks.currentTop();
    if (!card && !top) { toast('Place the cursor in the Quick Card body first.'); return; }
    let created = null;
    EditorTransactions.run('Insert information card', () => {
      created = makeCard();
      if (card) card.after(created);
      else {
        const grid = document.createElement('div');
        grid.className = 'cards';
        grid.append(created, makeCard());
        top.after(grid);
      }
    });
    if (created) selectText(created.querySelector('h3'));
  }
  function togglePending() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const card = currentCard();
    if (!card) { toast('Place the cursor inside an information card.'); return; }
    EditorTransactions.run(card.classList.contains('pending') ? 'Mark card confirmed' : 'Mark card pending', () => card.classList.toggle('pending'));
  }
  return { insertCard, togglePending, active: true };
})();
