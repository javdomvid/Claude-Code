/* ============================================================================
 * SOPHIA · 60-compare-proposals                        layer: FEATURE
 * ----------------------------------------------------------------------------
 * PURPOSE  Compare any two saved revisions (or one with the current text), and agent
 *          proposals (owner decision M): block-level JSON operations previewed and
 *          accepted/rejected one by one, applied in ONE transaction, recorded as an event.
 *          Also "Export document map" (block IDs + text for the agent).
 * OWNS     SOPHIA.compare, SOPHIA.proposals (style: styles/ui/60-compare-proposals.css).
 * EXPORTS  SOPHIA.compare {open}, SOPHIA.proposals {open, validate(proposal), check, documentMap,
 *          exportMap}
 * USES     SOPHIA.{ids, meta, sanitize, versions, persist, recordDirty, lastProposal}, historyCompare,
 *          EditorSession, EditorTransactions, cleanContent, data, modal, toast
 * RULES    - Proposal schema: sophia.proposal/1 (see the agent brief §6). expectedText /
 *            expectedValue must match; html passes SOPHIA.sanitize.blocks.
 *          - An agent never sets the document version except through the setBaseVersion
 *            operation, which only works on documents that were never published.
 * TESTS    tests/functional.cjs (proposals)
 * ========================================================================== */
SOPHIA.compare = (() => {
  'use strict';
  const U = SOPHIA.util;
  function open() {
    if (U.dialogOpen()) { toast(SOPHIA.strings.finishDialogFirst); return; }
    if (!data.revisions.length) { toast('There are no saved revisions to compare.'); return; }
    const opts = data.revisions.map((r, i) => '<option value="' + i + '">' + U.escapeHTML(SOPHIA.versions.label(r) + ' · ' + String(r.date).slice(0, 10) + ' · ' + (r.editorPID || r.author || '')) + '</option>').join('');
    const v = modal('Compare revisions',
      '<div class="sx-compare-pick"><label>From<select id="cmpA">' + opts + '</select></label><label>To<select id="cmpB">' +
        opts + '<option value="current">Current document (unsaved included)</option></select></label></div>' +
      '<p data-summary class="muted"></p><ol class="sx-compare-list" data-list translate="no"></ol>',
      () => { const b = v.querySelector('#cmpB').value; v.remove(); if (b !== 'current') window.openHistoryStudio?.(Number(b)); },
      'Open “To” in History');
    const a = v.querySelector('#cmpA'), b = v.querySelector('#cmpB');
    a.value = String(Math.max(0, data.revisions.length - 2));
    b.value = String(data.revisions.length - 1);
    function render() {
      const from = data.revisions[Number(a.value)]?.snapshot || '';
      const to = b.value === 'current' ? cleanContent() : data.revisions[Number(b.value)]?.snapshot || '';
      let changes = [];
      try { changes = historyCompare(from, to).changes; } catch (e) { v.querySelector('[data-summary]').textContent = 'Comparison failed: ' + e.message; return; }
      const counts = changes.reduce((m, c) => ((m[c.type] = (m[c.type] || 0) + 1), m), {});
      v.querySelector('[data-summary]').textContent = changes.length ? Object.entries(counts).map(([k, n]) => n + ' ' + k.toLowerCase()).join(' · ') : 'No content differences between these two versions.';
      const list = v.querySelector('[data-list]');
      list.replaceChildren();
      for (const c of changes.slice(0, 300)) {
        const li = U.el('li', 'sx-cmp-' + c.type.toLowerCase().replace(/\s+/g, '-'));
        li.append(U.el('b', '', c.type + (c.section ? ' · ' + c.section : '')));
        if (c.before) li.append(U.el('del', '', c.before));
        if (c.after) li.append(U.el('ins', '', c.after));
        list.append(li);
      }
    }
    a.onchange = b.onchange = render;
    render();
  }
  return { open };
})();

SOPHIA.proposals = (() => {
  'use strict';
  const U = SOPHIA.util;
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  /** Document map for agents: every block with its ID, type, number and text. */
  function documentMap() {
    SOPHIA.ids.ensure();
    return {
      schema: 'sophia.document-map/1', documentId: data.id, profile: SOPHIA.profile, documentVersion: data.documentVersion,
      status: data.status, exportedAt: new Date().toISOString(),
      meta: Object.fromEntries([...area.querySelectorAll('.identity .label')].map((l) => [l.textContent.trim(), (l.nextElementSibling?.textContent || '').trim()])),
      blocks: SOPHIA.ids.blocks().filter((n) => !n.closest('table') || /^(TABLE)$/.test(n.tagName) || /^(TD|TH)$/.test(n.tagName)).map((n) => ({
        id: n.dataset.blockId, tag: n.tagName.toLowerCase(), num: n.getAttribute('data-num') || undefined,
        class: n.className || undefined, text: norm(n.textContent).slice(0, 2000)
      }))
    };
  }
  function exportMap() {
    const blob = new Blob([JSON.stringify(documentMap(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = data.id + '_V' + data.documentVersion + '_document-map.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Document map downloaded. Give it to the agent together with the brief.');
  }
  const fragment = (html) => SOPHIA.sanitize.blocks(html);
  function check(p, op) {
    const res = { op, ok: true, note: '', before: '', after: '' };
    const target = op.targetBlockId ? SOPHIA.ids.find(op.targetBlockId) : null;
    if (['replaceBlock', 'insertAfter', 'deleteBlock'].includes(op.op) && !target) return { ...res, ok: false, note: 'Block ' + op.targetBlockId + ' not found in this document.' };
    if (target && target.closest('.identity, [data-trace]')) return { ...res, ok: false, note: 'Metadata blocks change through updateMeta, not block operations.' };
    if (op.op === 'replaceBlock' || op.op === 'deleteBlock') {
      res.before = norm(target.textContent);
      if (op.expectedText !== undefined && norm(op.expectedText) !== res.before) return { ...res, ok: false, note: 'The block text changed since the proposal was made (expected text does not match).' };
    }
    if (op.op === 'replaceBlock' || op.op === 'insertAfter') {
      const f = fragment(op.html);
      if (!f || !f.childNodes.length) return { ...res, ok: false, note: 'Empty or invalid HTML.' };
      res.after = norm(f.textContent);
      res.fragment = f;
    } else if (op.op === 'updateMeta') {
      const cell = SOPHIA.meta.cell(op.field);
      if (!cell || cell.hasAttribute('data-version-cell') || cell.closest('[data-trace]')) return { ...res, ok: false, note: 'Field “' + op.field + '” not found or not editable.' };
      res.before = norm(cell.textContent);
      if (op.expectedValue !== undefined && norm(op.expectedValue) !== res.before) return { ...res, ok: false, note: 'The field value changed since the proposal was made.' };
      res.after = norm(op.value);
      res.cell = cell;
    } else if (op.op === 'setBaseVersion') {
      /* Only for a document that was never published (owner decision Q); applied after the
         content operations, recorded as a "base-version" event. */
      if (SOPHIA.versions.everPublished(data)) return { ...res, ok: false, note: 'This document was already published: an agent cannot change its version.' };
      if (!SOPHIA.versions.valid(op.value)) return { ...res, ok: false, note: 'Version “' + op.value + '” is not valid (use 3 or 3.05).' };
      if (!String(op.reason || '').trim()) return { ...res, ok: false, note: 'A setBaseVersion operation needs a reason.' };
      res.before = 'V' + data.documentVersion;
      res.after = 'V' + SOPHIA.versions.normalize(op.value);
      if (res.before === res.after) return { ...res, ok: false, note: 'The document is already ' + res.after + '.' };
    } else if (op.op !== 'deleteBlock') return { ...res, ok: false, note: 'Unknown operation “' + op.op + '”.' };
    res.target = target;
    return res;
  }
  /** Check a whole proposal without changing anything. Used by "Apply agent proposal…" and by
      tools/validate-proposal.cjs (agent kit).
      → { error: '' | why it cannot be applied at all, warnings: [], operations: [check()…] } */
  function validate(proposal) {
    const out = { error: '', warnings: [], operations: [] };
    if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) { out.error = 'This is not a proposal object.'; return out; }
    if (proposal.schema !== 'sophia.proposal/1') out.warnings.push('"schema" should be "sophia.proposal/1"');
    if (!Array.isArray(proposal.operations) || !proposal.operations.length) { out.error = 'The proposal has no "operations" list.'; return out; }
    if (proposal.documentId && proposal.documentId !== data.id) { out.error = 'Wrong document: the proposal was made for ' + proposal.documentId + ', this is ' + data.id + '.'; return out; }
    if (!proposal.documentId) out.warnings.push('no "documentId": cannot check it is the right document');
    if (proposal.baseDocumentVersion && String(proposal.baseDocumentVersion).replace(/^v/i, '') !== data.documentVersion)
      out.warnings.push('based on V' + String(proposal.baseDocumentVersion).replace(/^v/i, '') + ', current is V' + data.documentVersion);
    out.operations = proposal.operations.map((op) => check(proposal, op && typeof op === 'object' ? op : { op: String(op) }));
    return out;
  }
  function open() {
    if (!U.isEditing()) { toast('Start editing to review and apply a proposal.'); return; }
    if (U.dialogOpen()) { toast(SOPHIA.strings.finishDialogFirst); return; }
    const v = modal('Apply agent proposal',
      '<p>Paste the proposal JSON or choose the file. Nothing changes until you apply the operations you keep selected.</p>' +
      '<label>Proposal file<input type="file" id="propFile" accept=".json,application/json"></label>' +
      '<label>…or paste JSON<textarea id="propText" rows="5" spellcheck="false"></textarea></label>' +
      '<p data-head class="muted"></p><ol class="sx-proposal" data-ops translate="no"></ol><p id="propErr" role="alert"></p>',
      () => apply(v), 'Apply selected');
    let checked = [], proposal = null;
    const err = (m) => (v.querySelector('#propErr').textContent = m);
    function load(text) {
      err('');
      v.querySelector('[data-ops]').replaceChildren();
      try { proposal = JSON.parse(text); } catch { proposal = null; err('This is not valid JSON.'); return; }
      const res = validate(proposal);
      v.querySelector('[data-head]').textContent = (proposal?.proposalId || 'Proposal') + ' · ' + (proposal?.author || 'unknown author') + ' · ' +
        (proposal?.intent || '') + (res.warnings.length ? ' · ⚠ ' + res.warnings.join('; ') : '');
      if (res.error) { err(res.error); proposal = null; return; }
      checked = res.operations;
      checked.forEach((c, i) => {
        const li = U.el('li', c.ok ? '' : 'is-invalid');
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = c.ok;
        box.disabled = !c.ok;
        box.dataset.i = i;
        const head = U.el('label');
        head.append(box, U.el('b', '', ' ' + c.op.op + (c.op.targetBlockId ? ' · ' + c.op.targetBlockId : c.op.field ? ' · ' + c.op.field : '')));
        li.append(head);
        if (c.op.reason) li.append(U.el('small', '', c.op.reason));
        if (c.before) li.append(U.el('del', '', c.before));
        if (c.after) li.append(U.el('ins', '', c.after));
        if (!c.ok) li.append(U.el('p', 'sx-proposal-note', c.note));
        v.querySelector('[data-ops]').append(li);
      });
    }
    v.querySelector('#propFile').onchange = async (e) => { const f = e.target.files[0]; if (f) { v.querySelector('#propText').value = await f.text(); load(v.querySelector('#propText').value); } };
    v.querySelector('#propText').addEventListener('change', (e) => load(e.target.value));
    function apply(dlg) {
      if (!proposal) { err('Load a proposal first.'); return; }
      const chosen = [...dlg.querySelectorAll('[data-ops] input:checked')].map((b) => checked[Number(b.dataset.i)]).filter((c) => c.ok);
      if (!chosen.length) { err('Select at least one valid operation.'); return; }
      const base = chosen.find((c) => c.op.op === 'setBaseVersion');
      const ok = EditorTransactions.run('Apply proposal ' + (proposal.proposalId || ''), () => {
        for (const c of chosen) {
          if (c.op.op === 'setBaseVersion') continue; // record change, applied after the transaction
          /* Re-resolve by ID: an earlier operation may have replaced this block (the
             replacement keeps the ID), so several operations can target one block. */
          if (c.op.targetBlockId) c.target = SOPHIA.ids.find(c.op.targetBlockId) || c.target;
          if (c.op.op === 'replaceBlock') {
            const nodes = [...c.fragment.childNodes];
            const first = nodes.find((n) => n.nodeType === 1);
            if (first && c.target.dataset.blockId) first.dataset.blockId = c.target.dataset.blockId;
            c.target.replaceWith(...nodes);
          } else if (c.op.op === 'insertAfter') c.target.after(...c.fragment.childNodes);
          else if (c.op.op === 'deleteBlock') c.target.remove();
          else if (c.op.op === 'updateMeta') c.cell.textContent = c.after;
        }
      });
      if (!ok) { err('The proposal could not be applied. Nothing changed.'); return; }
      data.events.push({ type: 'proposal-applied', proposalId: proposal.proposalId || null, author: proposal.author || null, pid: EditorSession.get().pid, date: new Date().toISOString(), applied: chosen.length, rejected: proposal.operations.length - chosen.length });
      SOPHIA.lastProposal = proposal;
      SOPHIA.recordDirty = true;
      let baseNote = '';
      if (base) {
        const r = SOPHIA.persist.setBaseVersion(base.op.value, base.op.reason, 'proposal ' + (proposal.proposalId || ''));
        baseNote = r.ok ? ' Base version V' + r.from + ' → V' + r.to + ' (the undo history starts again here).' : ' Base version not set: ' + r.error;
      }
      EditorSession.changed();
      dlg.remove();
      toast(chosen.length + ' operation(s) applied. Review the result, then save.' + (base ? baseNote : ' Ctrl+Z undoes them.'), { ms: base ? 7000 : undefined });
    }
  }
  return { open, validate, documentMap, exportMap, check };
})();
