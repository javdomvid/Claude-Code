/* ============================================================================
 * SOPHIA · 57-numbering
 * K (owner, 2026-11-26): automatic heading numbers.
 * - Numbers are computed by the engine and written as data-num on headings
 *   (h2 → "3.", h3 → "3.1", h4 → "3.1.2" in SOP; "01 ·" on Quick Card h2).
 *   CSS shows them with ::before, so they print, survive A4 pagination and
 *   appear in history snapshots. Typing them by hand is no longer needed.
 * - A heading with class "nonum" is never numbered.
 * - migrate(): removes typed numbers that match the automatic ones (older files).
 * - data-num is ignored by SOPHIA.canonical() (renumbering is not an edit).
 * ========================================================================== */
SOPHIA.numbering = (() => {
  'use strict';
  const QC = SOPHIA.profile === 'quick-card';
  const enabled = () => !data.settings || data.settings.autoNumber !== false;
  function headings(root = area) {
    return [...root.querySelectorAll('.pagecontent h2, .pagecontent h3, .pagecontent h4')].filter((h) => !h.closest('nav[data-sophia-toc], .cards'));
  }
  function compute(root = area) {
    const n = [0, 0, 0];
    return headings(root).map((h) => {
      if (h.classList.contains('nonum')) return { h, num: '' };
      const level = Number(h.tagName[1]) - 2;
      if (QC && level > 0) return { h, num: '' };
      n[level]++;
      for (let i = level + 1; i < 3; i++) n[i] = 0;
      const num = QC ? String(n[0]).padStart(2, '0') + ' ·' : level === 0 ? n[0] + '.' : n.slice(0, level + 1).join('.');
      return { h, num };
    });
  }
  function apply(root = area) {
    const old = muted;
    muted = true;
    try {
      for (const { h, num } of compute(root)) {
        if (!enabled() || !num) h.removeAttribute('data-num');
        else if (h.getAttribute('data-num') !== num) h.setAttribute('data-num', num);
      }
    } finally {
      if (root === area) observer.takeRecords();
      muted = old;
    }
    if (enabled()) area.dataset.autonumber = '';
    else delete area.dataset.autonumber;
  }
  /** Older files: typed heading numbers become automatic ones, but ONLY when every
   *  typed number equals the computed one. If no heading has a typed number, or any
   *  typed number disagrees, nothing is stripped and automatic numbering stays off
   *  for this document (the look of the page never changes silently).
   *  Returns how many headings changed. */
  function migrate() {
    if (data.settings && typeof data.settings.autoNumber === 'boolean') { apply(); return 0; }
    const TYPED = QC ? /^\s*\d{1,2}\s*·\s*/ : /^\s*\d+(\.\d+)*\.?\s+/;
    const plan = [];
    let typed = 0, mismatch = 0;
    for (const { h, num } of compute()) {
      const t = document.createTreeWalker(h, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.nodeValue.trim() ? 1 : 3) }).nextNode();
      const has = !!t && TYPED.test(t.nodeValue);
      if (has) typed++;
      if (!num) { if (has && !QC) mismatch++; continue; }
      const bare = num.replace(/[.·\s]+$/, '');
      const rx = QC ? new RegExp('^\\s*0?' + Number(bare) + '\\s*·\\s*') : new RegExp('^\\s*' + bare.replace(/\./g, '\\.') + '\\.?\\s+');
      if (has && rx.test(t.nodeValue)) plan.push([t, rx]);
      else if (has || !QC || h.tagName === 'H2') mismatch++;
    }
    const ok = typed > 0 && mismatch === 0;
    data.settings = Object.assign({}, data.settings, { autoNumber: ok });
    if (ok) for (const [t, rx] of plan) t.nodeValue = t.nodeValue.replace(rx, '');
    apply();
    return ok ? plan.length : 0;
  }
  /** Turns automatic numbering on/off for this document (saved in the record, not an undo step). */
  function toggle() {
    if (!SOPHIA.util.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    data.settings = Object.assign({}, data.settings, { autoNumber: !enabled() });
    SOPHIA.recordDirty = true;
    apply();
    EditorSession.changed();
    SOPHIA.bus.emit('outline-changed');
    toast(enabled() ? 'Automatic heading numbers on.' : 'Automatic heading numbers off. Type numbers by hand if you need them.');
  }
  function label(h) {
    const num = h.getAttribute('data-num');
    return (num ? num + ' ' : '') + h.textContent.trim();
  }
  let timer = 0;
  SOPHIA.bus.on('content-changed', () => { clearTimeout(timer); timer = setTimeout(apply, 120); });
  return { apply, migrate, compute, label, enabled, toggle };
})();
