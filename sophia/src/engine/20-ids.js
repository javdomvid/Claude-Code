/* ============================================================================
 * SOPHIA · 20-ids
 * Stable block identities (owner decision F-id, 2026-11-26).
 * - Every content block gets data-block-id="b-xxxxxxxxxx" (10 chars, a–z0–9).
 * - Assigned on open and after every edit (debounced). When Enter or paste
 *   duplicates an ID, the FIRST block in document order keeps it.
 * - IDs are ignored by SOPHIA.canonical(), so assigning them never makes the
 *   document "dirty"; they are written to the file at the next save.
 * - Agents and proposals address blocks by these IDs (see #sophia-agent-brief).
 * ========================================================================== */
SOPHIA.ids = (() => {
  'use strict';
  const SELECTOR = 'h1,h2,h3,h4,p,li,td,th,figcaption,figure,img,table,blockquote,aside,hr,nav[data-sophia-toc]';
  const VALID = /^b(25)?-[a-z0-9]{10,32}$/;
  const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
  function newId(used) {
    let id;
    do {
      const bytes = crypto.getRandomValues(new Uint8Array(10));
      id = 'b-' + [...bytes].map((b) => ALPHABET[b % 36]).join('');
    } while (used.has(id));
    used.add(id);
    return id;
  }
  function blocks(root = area) {
    return [...root.querySelectorAll('.pagecontent, .qc-hero')].flatMap((c) => [...c.querySelectorAll(SELECTOR)])
      .filter((n) => !n.closest('.identity, [data-trace], .brand') && !n.parentElement?.closest('nav[data-sophia-toc]'));
  }
  /** Assigns missing IDs and repairs duplicates. Returns how many IDs changed. */
  function ensure(root = area) {
    const list = blocks(root), used = new Set(), seen = new Set();
    for (const n of list) { const id = n.getAttribute('data-block-id'); if (id && VALID.test(id)) used.add(id); }
    let changed = 0;
    for (const n of list) {
      const id = n.getAttribute('data-block-id');
      if (id && VALID.test(id) && !seen.has(id)) { seen.add(id); continue; }
      n.setAttribute('data-block-id', newId(used));
      seen.add(n.getAttribute('data-block-id'));
      changed++;
    }
    return changed;
  }
  function find(id) {
    return id ? area.querySelector('[data-block-id="' + CSS.escape(id) + '"]') : null;
  }
  let timer = 0;
  const schedule = () => { clearTimeout(timer); timer = setTimeout(() => { const old = muted; muted = true; try { ensure(); } finally { observer.takeRecords(); muted = old; } }, 300); };
  new MutationObserver((records) => {
    if (records.some((r) => r.type === 'childList' && r.addedNodes.length)) schedule();
  }).observe(area, { subtree: true, childList: true });
  return { ensure, find, blocks, VALID, newId };
})();
