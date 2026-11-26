/* ============================================================================
 * SOPHIA · 55-review
 * J (owner, 2026-11-26): comments per block, "To Be Confirmed" marks and the
 * pre-publish checklist.
 * - Comments live in data.comments (the record), anchored by data-block-id.
 *   They are never part of the document text, never printed, and are saved
 *   with the next Save draft / Publish. Highlight uses the CSS Highlight API.
 * - TBC marks are content: <span class="tbc">…</span> (amber on screen,
 *   dotted underline when printed). Checks and the checklist count them.
 * ========================================================================== */
SOPHIA.comments = (() => {
  'use strict';
  const U = SOPHIA.util;
  const HL = 'sophia-comment';
  function currentBlock() {
    const s = getSelection();
    const n = s.rangeCount ? U.nodeOf(s.anchorNode) : null;
    const b = n?.closest?.('[data-block-id]');
    return b && area.contains(b) && !b.closest('.identity') ? b : null;
  }
  function markDirty() {
    SOPHIA.recordDirty = true;
    EditorSession.changed();
    paint();
    SOPHIA.bus.emit('comments-changed');
  }
  function add(blockId) {
    if (!U.isEditing()) { toast('Start editing to add comments (comments are signed with your PID).'); return; }
    SOPHIA.ids.ensure();
    const block = blockId ? SOPHIA.ids.find(blockId) : currentBlock();
    if (!block) { toast('Place the cursor in the paragraph, step or cell you want to comment on.'); return; }
    const v = modal('Add comment',
      '<p class="muted" data-excerpt></p><label>Comment<textarea id="cmtText" rows="4" maxlength="4000"></textarea></label><p id="cmtErr" role="alert"></p>',
      (dlg) => {
        const text = dlg.querySelector('#cmtText').value.trim();
        if (!text) { dlg.querySelector('#cmtErr').textContent = 'Write the comment first.'; return; }
        data.comments.push({ id: 'c-' + SOPHIA.ids.newId(new Set()).slice(2), blockId: block.dataset.blockId, excerpt: block.textContent.trim().slice(0, 140), pid: EditorSession.get().pid, date: new Date().toISOString(), text, resolved: false, replies: [], unsaved: true });
        dlg.remove();
        markDirty();
        window.side?.('comments');
        toast('Comment added. It is saved with your next Save draft or Publish.');
      }, 'Add comment');
    v.querySelector('[data-excerpt]').textContent = '“' + block.textContent.trim().slice(0, 160) + '”';
  }
  function reply(id) {
    const c = data.comments.find((x) => x.id === id);
    if (!c || !U.isEditing()) { toast('Start editing to reply.'); return; }
    modal('Reply', '<label>Reply<textarea id="cmtReply" rows="3" maxlength="4000"></textarea></label>', (dlg) => {
      const text = dlg.querySelector('#cmtReply').value.trim();
      if (!text) return;
      c.replies.push({ pid: EditorSession.get().pid, date: new Date().toISOString(), text });
      dlg.remove();
      markDirty();
    }, 'Reply');
  }
  function setResolved(id, value) {
    const c = data.comments.find((x) => x.id === id);
    if (!c || !U.isEditing()) { toast('Start editing to resolve comments.'); return; }
    c.resolved = value;
    c.resolvedBy = value ? EditorSession.get().pid : undefined;
    c.resolvedAt = value ? new Date().toISOString() : undefined;
    markDirty();
  }
  function removeUnsaved(id) {
    const i = data.comments.findIndex((x) => x.id === id && x.unsaved);
    if (i >= 0) { data.comments.splice(i, 1); markDirty(); }
  }
  function paint() {
    if (!window.CSS?.highlights || !window.Highlight) return;
    CSS.highlights.delete(HL);
    const ranges = [];
    for (const c of data.comments) {
      if (c.resolved) continue;
      const b = SOPHIA.ids.find(c.blockId);
      if (!b) continue;
      const r = document.createRange();
      r.selectNodeContents(b);
      ranges.push(r);
    }
    if (ranges.length) CSS.highlights.set(HL, new Highlight(...ranges));
  }
  function goTo(id) {
    const c = data.comments.find((x) => x.id === id);
    const b = c && SOPHIA.ids.find(c.blockId);
    if (!b) { toast('The commented block is no longer in the document.'); return; }
    b.scrollIntoView({ block: 'center', behavior: 'smooth' });
    b.animate?.([{ outlineColor: '#8a6fc4' }, { outlineColor: 'transparent' }], { duration: 1200 });
  }
  /** Renders the Comments side panel into `root`. */
  function render(root) {
    const open = data.comments.filter((c) => !c.resolved), done = data.comments.filter((c) => c.resolved);
    const head = U.el('div', 'sx-panel-head');
    head.append(U.el('strong', '', open.length + ' open · ' + done.length + ' resolved'));
    const addBtn = U.el('button', 'sx-btn sx-btn-tonal', 'Add comment');
    addBtn.type = 'button';
    addBtn.onclick = () => add();
    addBtn.disabled = !U.isEditing();
    head.append(addBtn);
    root.append(head);
    if (!data.comments.length) root.append(U.el('p', 'sx-empty', 'No comments yet. In edit mode, place the cursor in a block and use Add comment (Ctrl+Alt+M).'));
    for (const c of [...open, ...done]) {
      const card = U.el('article', 'sx-comment' + (c.resolved ? ' is-resolved' : ''));
      const meta = U.el('div', 'sx-comment-meta');
      meta.append(U.el('b', '', c.pid || 'Unknown'), U.el('span', '', String(c.date).slice(0, 16).replace('T', ' ') + (c.unsaved ? ' · unsaved' : '')));
      card.append(meta);
      const ex = U.el('q', 'sx-comment-excerpt', c.excerpt || ''), tx = U.el('p', '', c.text);
      ex.setAttribute('translate', 'no');
      tx.setAttribute('translate', 'no');
      card.append(ex, tx);
      for (const r of c.replies || []) {
        const rp = U.el('p', 'sx-comment-reply');
        rp.append(U.el('b', '', r.pid + ': '), document.createTextNode(r.text));
        card.append(rp);
      }
      const actions = U.el('div', 'sx-row');
      const mk = (label, fn, dis) => { const b = U.el('button', 'sx-btn sx-btn-text', label); b.type = 'button'; b.onclick = fn; b.disabled = !!dis; actions.append(b); };
      mk('Go to', () => goTo(c.id));
      mk('Reply', () => reply(c.id), !U.isEditing());
      mk(c.resolved ? 'Reopen' : 'Resolve', () => setResolved(c.id, !c.resolved), !U.isEditing());
      if (c.unsaved) mk('Delete', () => removeUnsaved(c.id), !U.isEditing());
      card.append(actions);
      root.append(card);
    }
  }
  SOPHIA.bus.on('content-changed', () => setTimeout(paint, 50));
  SOPHIA.bus.on('record-changed', () => { data.comments.forEach((c) => delete c.unsaved); paint(); });
  return { add, reply, setResolved, paint, render, goTo, openCount: () => data.comments.filter((c) => !c.resolved).length };
})();

SOPHIA.tbc = (() => {
  'use strict';
  const U = SOPHIA.util;
  function toggle() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const s = getSelection();
    if (!s.rangeCount) return;
    const r = s.getRangeAt(0);
    const inMark = U.nodeOf(r.commonAncestorContainer)?.closest('.tbc');
    if (inMark && area.contains(inMark)) {
      EditorTransactions.run('Remove To Be Confirmed mark', () => { inMark.replaceWith(...inMark.childNodes); });
      return;
    }
    const host = U.nodeOf(r.commonAncestorContainer)?.closest('[contenteditable=true]');
    const block = U.nodeOf(r.commonAncestorContainer)?.closest('p,li,td,th,h2,h3,h4,figcaption,blockquote,aside');
    if (!host || !block || block.closest('.identity')) { toast('Select text inside one paragraph, step or cell.'); return; }
    EditorTransactions.run('Mark To Be Confirmed', () => {
      const span = document.createElement('span');
      span.className = 'tbc';
      span.title = 'To Be Confirmed';
      if (r.collapsed) span.textContent = 'TO BE CONFIRMED';
      else span.append(r.extractContents());
      r.insertNode(span);
      const c = document.createRange();
      c.setStartAfter(span);
      c.collapse(true);
      s.removeAllRanges();
      s.addRange(c);
    });
  }
  return { toggle, count: () => area.querySelectorAll('.pagecontent .tbc').length };
})();

/* ---------- pre-publish checklist (advisory: never blocks without saying why) ---------- */
SOPHIA.checklist = (() => {
  'use strict';
  const U = SOPHIA.util;
  /* Each item may carry an action { label, run } shown in the side panel (V78 · U). */
  function collect() {
    const items = [];
    const add = (tone, text, node, action) => items.push({ tone, text, node, action });
    const tbcNodes = [...area.querySelectorAll('.pagecontent .tbc, .qc-hero .tbc')];
    if (tbcNodes.length) {
      let i = -1;
      add('warn', tbcNodes.length + ' text mark(s) still To Be Confirmed.', tbcNodes[0], { label: 'Next mark', run: () => { i = (i + 1) % tbcNodes.length; tbcNodes[i].scrollIntoView({ block: 'center', behavior: 'smooth' }); tbcNodes[i].animate?.([{ outline: '3px solid #e0a100' }, { outline: '3px solid transparent' }], { duration: 1400 }); } });
    }
    const tbcText = [...area.querySelectorAll('.pagecontent p, .pagecontent li, .pagecontent td, .identity .value')].filter((n) => /\bTO BE CONFIRMED\b/.test(n.textContent) && !n.querySelector('.tbc')).length;
    if (tbcText) add('warn', tbcText + ' place(s) still say “TO BE CONFIRMED”.', null, { label: 'Find them', run: () => { SOPHIA.find.state.meta = true; SOPHIA.find.open('TO BE CONFIRMED'); } });
    const open = SOPHIA.comments.openCount();
    if (open) add('warn', open + ' open comment(s).', null, { label: 'Open comments', run: () => window.side?.('comments') });
    const noAlt = [...area.querySelectorAll('.pagecontent img')].filter((i) => !i.alt.trim()).length;
    if (noAlt) add('warn', noAlt + ' image(s) without alternative text.', area.querySelector('.pagecontent img:not([alt]), .pagecontent img[alt=""]'), { label: 'Image library', run: () => ImageLibrary.open() });
    const emptyCells = [...area.querySelectorAll('.pagecontent table:not(.identity) :is(td,th)')].filter((c) => !c.textContent.trim() && !c.querySelector('img'));
    if (emptyCells.length) add('info', emptyCells.length + ' empty table cell(s).', emptyCells[0]);
    if (SOPHIA.blocks && area.querySelector('nav[data-sophia-toc]') && !SOPHIA.blocks.tocIsCurrent())
      add('info', 'The table of contents is out of date.', area.querySelector('nav[data-sophia-toc]'), { label: 'Update contents', run: () => { if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; } SOPHIA.blocks.refreshToc(true); toast('Contents updated.'); window.side?.('checks'); } });
    return items;
  }
  function gate(mode, proceed) {
    const items = collect();
    const warns = items.filter((i) => i.tone === 'warn');
    if (!warns.length) { proceed(); return; }
    const list = items.map((i) => '<li class="sx-check-' + i.tone + '">' + U.escapeHTML(i.text) + '</li>').join('');
    modal(mode === 'Big Validation' ? 'Before Big Validation' : 'Before publishing',
      '<p>These items are usually resolved before ' + (mode === 'Big Validation' ? 'a Big Validation' : 'publishing') + '. You can go back and fix them, or continue and record your reason in the next step.</p><ul class="sx-checklist">' + list + '</ul>' +
      '<label class="check"><input type="checkbox" id="chkOk"> I reviewed these items and want to continue.</label><p id="chkErr" role="alert"></p>',
      (dlg) => {
        if (!dlg.querySelector('#chkOk').checked) { dlg.querySelector('#chkErr').textContent = 'Tick the box to continue, or Cancel to go back.'; return; }
        dlg.remove();
        proceed();
      }, 'Continue');
  }
  return { collect, gate };
})();
