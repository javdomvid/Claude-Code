/* ============================================================================
 * SOPHIA · 78-side-panel                               layer: SHELL (side panel)
 * ----------------------------------------------------------------------------
 * PURPOSE  The side panel: tabs Outline · Find · Comments · Versions · Images ·
 *          Checks, each rendered on demand into #sideContent.
 * OWNS     SOPHIA.ui.sidePanel, PANELS (tab list), the outline / versions / checks
 *          renderers; prefs "side", "sidepanel".
 *          (Find is drawn by 24-find, Comments by 55-review, Images by 16-media.)
 * EXPORTS  SOPHIA.ui.sidePanel.{el, show(name), render(), toggle(force, quiet),
 *          badges(), current()}   + global side(name) (defined in 79-shell)
 * USES     SOPHIA.ui.kit, SOPHIA.{numbering, stats, versions, checklist, comments,
 *          find}, EditorMedia.render, EditorSession.panel, openHistoryStudio, data
 * DOM      aside.sx-side (data-runtime), placed before #document by 79-shell.
 * RULES    A new tab = one entry in PANELS + one branch in renderSide() that calls the
 *          owning module's render(container). Style: styles/ui/78-side-panel.css.
 * TESTS    tests/functional.cjs (side panels, find, comments) · snapshot read-side-*
 * ========================================================================== */
SOPHIA.ui.sidePanel = (() => {
  'use strict';
  const U = SOPHIA.util;
  const { pref, icon, runtime, button } = SOPHIA.ui.kit;
  const side_ = { el: runtime(U.el('aside', 'sx-side')), name: pref.get('sidepanel', 'outline') };
  side_.el.setAttribute('aria-label', 'Side panel');
  side_.el.hidden = pref.get('side', window.innerWidth >= 1100 ? 'open' : 'closed') !== 'open';
  const sideTabs = U.el('div', 'sx-side-tabs');
  sideTabs.setAttribute('role', 'tablist');
  const PANELS = [['outline', 'Outline', 'outline'], ['find', 'Find', 'find'], ['comments', 'Comments', 'comment'], ['versions', 'Versions', 'changes'], ['images', 'Images', 'image'], ['checks', 'Checks', 'checks']];
  for (const [name, label, ic] of PANELS) {
    const b = U.el('button', 'sx-side-tab');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.panel = name;
    b.title = label;
    b.append(icon(ic), U.el('span', 'sx-label', label), U.el('span', 'sx-badge'));
    b.onclick = () => side(name);
    sideTabs.append(b);
  }
  const sideClose = U.el('button', 'sx-btn sx-btn-icon sx-side-close');
  sideClose.type = 'button';
  sideClose.setAttribute('aria-label', 'Close side panel');
  sideClose.append(icon('close'));
  sideClose.onclick = () => toggleSide(false);
  const sideContent = U.el('div', 'sx-side-content');
  sideContent.id = 'sideContent';
  sideContent.setAttribute('role', 'tabpanel');
  side_.el.append(sideTabs, sideClose, sideContent);

  function renderOutline(root) {
    const list = U.el('ol', 'sx-outline');
    list.setAttribute('translate', 'no');
    const items = SOPHIA.numbering.compute();
    if (!items.length) root.append(U.el('p', 'sx-empty', 'No headings yet. Use Heading 1–3 (Ctrl+Alt+1…3) to build the outline.'));
    for (const { h, num } of items) {
      const li = U.el('li', 'sx-outline-l' + (Number(h.tagName[1]) - 1));
      const b = U.el('button', 'sx-outline-item');
      b.type = 'button';
      if (num && SOPHIA.numbering.enabled()) b.append(U.el('span', 'sx-num', num));
      b.append(document.createTextNode(h.textContent.trim() || '(empty heading)'));
      b.onclick = () => { h.scrollIntoView({ block: 'start', behavior: 'smooth' }); if (U.isEditing()) { const r = document.createRange(); r.selectNodeContents(h); r.collapse(false); getSelection().removeAllRanges(); getSelection().addRange(r); } };
      li.append(b);
      list.append(li);
    }
    root.append(list);
    const s = SOPHIA.stats();
    root.append(U.el('p', 'sx-foot', s.words + ' words · ' + (s.continuous ? 'continuous view' : s.pages + ' A4 page' + (s.pages === 1 ? '' : 's'))));
  }
  function renderVersions(root) {
    const head = U.el('div', 'sx-panel-head');
    head.append(U.el('strong', '', 'V' + data.documentVersion + ' · ' + data.status));
    const cmp = button('compare', { short: 'Compare', cls: 'sx-btn-tonal' });
    head.append(cmp);
    root.append(head);
    root.append(U.el('p', 'sx-hint', 'Save draft keeps V' + data.documentVersion + ' · Publish & save → V' + SOPHIA.versions.nextPublish(data.documentVersion) + ' · Big Validation → V' + SOPHIA.versions.nextMajor(data.documentVersion)));
    const list = U.el('ol', 'sx-revisions');
    data.revisions.map((r, i) => [r, i]).reverse().forEach(([r, i]) => {
      const li = U.el('li', 'sx-rev sx-rev-' + String(r.mode || r.status || '').toLowerCase().replace(/[^a-z]+/g, '-'));
      const b = U.el('button', 'sx-rev-open');
      b.type = 'button';
      b.title = 'Open in History Studio';
      b.append(U.el('b', '', SOPHIA.versions.label(r)), U.el('span', '', String(r.date || '').slice(0, 16).replace('T', ' ') + ' · ' + (r.editorPID || r.author || '—')));
      if (r.reason) { const why = U.el('small', '', r.reason); why.setAttribute('translate', 'no'); b.append(why); }
      b.onclick = () => openHistoryStudio(i);
      li.append(b);
      list.append(li);
    });
    if (!data.revisions.length) root.append(U.el('p', 'sx-empty', 'No saved revisions yet.'));
    root.append(list);
  }
  function renderChecks(root) {
    const items = SOPHIA.checklist.collect();
    const head = U.el('div', 'sx-panel-head');
    head.append(U.el('strong', '', items.length ? items.length + ' item(s) to review' : 'Nothing to flag'));
    head.append(button('checks', { short: 'Full checks', cls: 'sx-btn-tonal' }));
    root.append(head);
    const ul = U.el('ul', 'sx-checklist');
    for (const it of items) {
      const li = U.el('li', 'sx-check-' + it.tone);
      li.append(U.el('span', '', it.text));
      const row = U.el('div', 'sx-row');
      if (it.node) { const g = U.el('button', 'sx-btn sx-btn-text', 'Go to'); g.type = 'button'; g.onclick = () => it.node.scrollIntoView({ block: 'center', behavior: 'smooth' }); row.append(g); }
      if (it.action) { const a = U.el('button', 'sx-btn sx-btn-tonal', it.action.label); a.type = 'button'; a.onclick = it.action.run; row.append(a); }
      if (row.children.length) li.append(row);
      ul.append(li);
    }
    root.append(ul);
    if (!items.length) root.append(U.el('p', 'sx-empty', 'No To Be Confirmed marks, open comments, images without alt text or stale contents. Full checks look deeper.'));
  }
  function side(name) {
    if (name) side_.name = name;
    pref.set('sidepanel', side_.name);
    if (side_.el.hidden) toggleSide(true, true);
    renderSide();
  }
  function renderSide() {
    if (side_.el.hidden) return;
    sideTabs.querySelectorAll('.sx-side-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.panel === side_.name)));
    const keep = sideContent.scrollTop;
    sideContent.replaceChildren();
    sideContent.dataset.panel = side_.name;
    if (side_.name === 'outline') renderOutline(sideContent);
    else if (side_.name === 'comments') SOPHIA.comments.render(sideContent);
    else if (side_.name === 'versions') renderVersions(sideContent);
    else if (side_.name === 'checks') renderChecks(sideContent);
    else if (side_.name === 'find') SOPHIA.find.render(sideContent);
    else if (side_.name === 'images') {
      const tools = U.el('div');
      tools.id = 'imageTools';
      sideContent.append(tools);
      EditorMedia.render();
    }
    sideContent.scrollTop = keep;
    if (EditorSession.get().panel !== side_.name) EditorSession.panel(side_.name);
    badges();
  }
  function badges() {
    const set = (p, n) => { const b = sideTabs.querySelector('[data-panel="' + p + '"] .sx-badge'); if (b) b.textContent = n ? String(n) : ''; };
    set('comments', SOPHIA.comments.openCount());
    set('checks', SOPHIA.checklist.collect().filter((i) => i.tone === 'warn').length);
  }
  function toggleSide(force, quiet) {
    const open = force === undefined ? side_.el.hidden : !!force;
    side_.el.hidden = !open;
    pref.set('side', open ? 'open' : 'closed');
    SOPHIA.ui.layout();
    if (open && !quiet) renderSide();
    SOPHIA.ui.refresh();
  }

  return { el: side_.el, show: side, render: renderSide, toggle: toggleSide, badges, current: () => side_.name };
})();
