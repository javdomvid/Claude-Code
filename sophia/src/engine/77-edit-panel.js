/* ============================================================================
 * SOPHIA · 77-edit-panel                               layer: SHELL (ribbon)
 * ----------------------------------------------------------------------------
 * PURPOSE  The edit panel (ribbon), shown only while editing:
 *          Full = tabs Home / Insert / Layout / Review (+ contextual "Table ✦" while
 *          the cursor is in a body table) with labelled groups;
 *          Mini = every tool, icon-only, in one compact strip; Hide = nothing.
 *          Home › "Styles of this document" = the established styles of the profile.
 * OWNS     SOPHIA.ui.editPanel, RIBBON (tabs → groups → command ids), SHORT labels,
 *          COMPACT (icon-only format toggles), the special controls (@gallery,
 *          @style, @size, @spacing, @color, @highlight); prefs "ribbon", "ribbontab".
 * EXPORTS  SOPHIA.ui.editPanel.{el, render(), cycle(), mode(), updateFormatState(),
 *          refresh(editing)}
 * USES     SOPHIA.ui.kit, SOPHIA.commands, SOPHIA.blocks.{STYLES, applyStyle,
 *          currentStyle}, SOPHIA.tables.here, EditorCommands, SOPHIA.ui.{refresh, layout}
 * DOM      div.sx-ribbon (data-runtime), mounted under the main panel by 79-shell.
 * RULES    - To add a tool: register the command (72-command-list or its module),
 *            then put its id in a RIBBON group; Mini shows it automatically.
 *          - The gallery offers ONLY SOPHIA.blocks.STYLES (owner decision V); do not
 *            add free styles or colours here.
 *          - Style: styles/ui/77-edit-panel.css.
 * TESTS    tests/functional.cjs (Full/Mini/Hide, gallery, Table tab, grid picker)
 * ========================================================================== */
SOPHIA.ui.editPanel = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const { pref, runtime, button, refreshSoon } = SOPHIA.ui.kit;

  /* ---------- edit panel (ribbon) ---------- */
  const RIBBON = [
    { tab: 'Home', groups: [
      { name: 'History', items: ['undo', 'redo'] },
      { name: 'Clipboard', items: ['pastePlain', 'clearFormat'] },
      { name: 'Styles of this document', items: ['@gallery'] },
      { name: 'Font', items: ['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', '@color', '@highlight', '@size'] },
      { name: 'Paragraph', items: ['bullets', 'numbers', 'outdent', 'indent', 'alignLeft', 'alignCenter', 'alignRight', 'justify', '@spacing', 'paragraphSettings'] }
    ] },
    { tab: 'Insert', groups: [
      { name: 'Objects', items: ['insertTable', 'insertImage', 'insertLink', 'slashMenu'] },
      { name: 'Blocks', items: ['calloutWarning', 'calloutConfirm', 'insertHr', 'pageBreak', 'insertCard', 'cardPending', 'decisionTable'] },
      { name: 'Generated', items: ['insertToc', 'insertXref', 'insertDate', 'symbols'] },
      { name: 'Bring in', items: ['importDocx', 'applyProposal'] }
    ] },
    { tab: 'Layout', groups: [
      { name: 'View', items: ['viewA4', 'viewContinuous', 'zoomFit', 'zoomOut', 'zoomIn'] },
      { name: 'Pages', items: ['reflow', 'layoutStudio', 'autoNumber'] },
      { name: 'Arrange', items: ['moveUp', 'moveDown'] },
      { name: 'Tables & images', items: ['tableStudio', 'tableFlow', 'imageStudio', 'imageLibrary'] }
    ] },
    { tab: 'Review', groups: [
      { name: 'Comments', items: ['addComment', 'markTbc', 'comments'] },
      { name: 'Versions', items: ['versions', 'compare', 'history'] },
      { name: 'Quality', items: ['checks', 'structure', 'wordCount'] },
      { name: 'Find', items: ['find', 'replace'] },
      { name: 'Help', items: ['showMarks', 'shortcuts'] }
    ] },
    /* contextual: only while the caret is in a body table (V78 · V2) */
    { tab: 'Table', contextual: true, groups: [
      { name: 'Rows & columns', items: ['rowAbove', 'rowBelow', 'colLeft', 'colRight'] },
      { name: 'Delete', items: ['deleteRow', 'deleteCol', 'deleteTable'] },
      { name: 'Format', items: ['headerRow', 'equalCols', 'shadeHeader', 'shadeAttention', 'shadeConfirmed', 'shadeNone'] },
      { name: 'Studios', items: ['tableStudio', 'tableFlow'] }
    ] }
  ];
  const TAB_TONE = { Home: 'navigate', Insert: 'assets', Layout: 'output', Review: 'review', Table: 'save' };
  let tableContext = false;
  /* Short labels for Full mode (tooltips keep the full name). */
  const SHORT = {
    rowAbove: 'Row above', rowBelow: 'Row below', colLeft: 'Column left', colRight: 'Column right',
    deleteRow: 'Row', deleteCol: 'Column', deleteTable: 'Table', headerRow: 'Header row',
    equalCols: 'Equal widths', shadeHeader: 'Grey', shadeAttention: 'Amber', shadeConfirmed: 'Green',
    shadeNone: 'No shading', decisionTable: 'Decision table', pastePlain: 'Plain paste',
    clearFormat: 'Clear', paragraphSettings: 'Paragraph', insertTable: 'Table', insertImage: 'Image',
    insertLink: 'Link', slashMenu: 'Blocks /', calloutWarning: 'Warning', calloutConfirm: 'Confirm',
    insertHr: 'Line', pageBreak: 'Page break', insertCard: 'Card', cardPending: 'Pending',
    insertToc: 'Contents', insertXref: 'Cross-ref.', insertDate: 'Date', symbols: 'Symbol', importDocx: 'Word .docx',
    applyProposal: 'Proposal', viewA4: 'A4', viewContinuous: 'Continuous', zoomFit: 'Fit',
    zoomOut: 'Zoom −', zoomIn: 'Zoom +', reflow: 'Reflow', layoutStudio: 'Layout', autoNumber: 'Auto 1.2',
    moveUp: 'Up', moveDown: 'Down', tableStudio: 'Table Studio', tableFlow: 'Table Flow',
    imageStudio: 'Image layout', imageLibrary: 'Library', addComment: 'Comment', markTbc: 'TBC',
    comments: 'All comments', versions: 'Changes', compare: 'Compare', history: 'History',
    checks: 'Checks', structure: 'Structure', wordCount: 'Count', find: 'Find', replace: 'Replace',
    showMarks: 'Marks ¶', shortcuts: 'Shortcuts', undo: 'Undo', redo: 'Redo'
  };
  /* Compact tools (format toggles): icon-only even in Full, arranged in a 2-row grid. */
  const COMPACT = new Set(['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', 'bullets', 'numbers', 'outdent', 'indent', 'alignLeft', 'alignCenter', 'alignRight', 'justify', '@color', '@highlight']);
  const ribbon = runtime(U.el('div', 'sx-ribbon'));
  ribbon.setAttribute('role', 'toolbar');
  ribbon.setAttribute('aria-label', 'Edit panel');
  let ribbonMode = ['full', 'mini', 'hide'].includes(pref.get('ribbon', 'full')) ? pref.get('ribbon', 'full') : 'full';
  let ribbonTab = pref.get('ribbontab', 'Home');
  function control(kind) {
    if (kind === '@gallery' && ribbonMode === 'mini') kind = '@style';
    if (kind === '@gallery') {
      /* Style gallery: only the established styles of this profile (owner, V78). */
      const g = U.el('div', 'sx-gallery');
      g.setAttribute('role', 'listbox');
      g.setAttribute('aria-label', 'Styles of this ' + SOPHIA.strings.profileLabel[SOPHIA.profile]);
      for (const [v, l, hint] of SOPHIA.blocks.STYLES) {
        const b = U.el('button', 'sx-style');
        b.type = 'button';
        b.dataset.style = v;
        b.setAttribute('role', 'option');
        b.title = l + ' — ' + hint;
        const prev = U.el('span', 'sx-style-prev sx-style-' + v);
        prev.setAttribute('aria-hidden', 'true');
        prev.textContent = { p: 'Aa text', h2: SOPHIA.profile === 'quick-card' ? '01 · SECTION' : '1. SECTION', h3: SOPHIA.profile === 'quick-card' ? 'Card title' : '1.1 Sub-section', h4: '1.1.1 Group', steps: '1. Step', bullets: '• Item', warning: 'Warning', confirmation: 'Confirm', source: 'Source…', card: 'Card', pending: 'Pending', decision: 'If → Then' }[v] || l;
        b.append(prev, U.el('span', 'sx-style-name', l));
        b.addEventListener('mousedown', (e) => e.preventDefault());
        b.onclick = () => { SOPHIA.blocks.applyStyle(v); refreshSoon(); };
        g.append(b);
      }
      return g;
    }
    const wrap = U.el('label', 'sx-field sx-field-' + kind.slice(1));
    if (kind === '@style') {
      const s = document.createElement('select');
      s.setAttribute('aria-label', 'Paragraph style');
      s.title = 'Paragraph style (Ctrl+Alt+0…3)';
      for (const [v, l] of SOPHIA.blocks.STYLES) s.append(new Option(l, v));
      s.onchange = () => { SOPHIA.blocks.applyStyle(s.value); refreshSoon(); };
      s.dataset.ctl = 'style';
      wrap.append(s);
    } else if (kind === '@size') {
      const s = document.createElement('select');
      s.setAttribute('aria-label', 'Font size (pt)');
      s.title = 'Font size';
      s.append(new Option('Size', ''));
      for (const v of [8, 9, 10, 10.5, 11, 12, 14, 16, 18, 20, 24]) s.append(new Option(v + ' pt', v));
      s.onchange = () => { if (s.value) EditorCommands.textSize(s.value); s.value = ''; };
      wrap.append(s);
    } else if (kind === '@spacing') {
      const s = document.createElement('select');
      s.setAttribute('aria-label', 'Line spacing');
      s.title = 'Line spacing';
      s.append(new Option('Line spacing', ''));
      for (const v of ['1', '1.15', '1.5', '2']) s.append(new Option(v + ' lines', v));
      s.onchange = () => { if (s.value) EditorCommands.paragraph('lineHeight', s.value); s.value = ''; };
      wrap.append(s);
    } else {
      const hl = kind === '@highlight';
      wrap.classList.add('sx-btn', 'sx-color');
      wrap.title = hl ? 'Highlight colour' : 'Text colour';
      const g = U.el('span', 'sx-glyph', hl ? 'ab' : 'A');
      g.setAttribute('aria-hidden', 'true');
      const sw = U.el('span', 'sx-swatch');
      const inp = document.createElement('input');
      inp.type = 'color';
      inp.value = hl ? '#fff2a8' : '#a02f4c';
      inp.setAttribute('aria-label', wrap.title);
      sw.style.background = inp.value;
      inp.oninput = () => (sw.style.background = inp.value);
      inp.onchange = () => EditorCommands.command(hl ? 'hiliteColor' : 'foreColor', inp.value);
      wrap.append(g, sw, inp);
    }
    return wrap;
  }
  function renderRibbon() {
    ribbon.replaceChildren();
    ribbon.dataset.mode = ribbonMode;
    if (ribbonMode === 'hide') return;
    const visible = (id) => id.startsWith('@') || (C.get(id) && (!C.get(id).profile || C.get(id).profile === SOPHIA.profile));
    if (ribbonMode === 'full') {
      const tabs = U.el('div', 'sx-tabs');
      tabs.setAttribute('role', 'tablist');
      if (RIBBON.find((t) => t.tab === ribbonTab)?.contextual && !tableContext) ribbonTab = 'Home';
      for (const t of RIBBON) {
        if (t.contextual && !tableContext) continue;
        const b = U.el('button', 'sx-tab' + (t.contextual ? ' sx-tab-context' : ''), t.contextual ? t.tab + ' ✦' : t.tab);
        b.dataset.tone = TAB_TONE[t.tab];
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(t.tab === ribbonTab));
        b.onclick = () => { ribbonTab = t.tab; pref.set('ribbontab', t.tab); renderRibbon(); SOPHIA.ui.refresh(); };
        tabs.append(b);
      }
      tabs.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const tabsNow = RIBBON.filter((t) => !t.contextual || tableContext);
        const i = tabsNow.findIndex((t) => t.tab === ribbonTab), n = (i + (e.key === 'ArrowRight' ? 1 : tabsNow.length - 1)) % tabsNow.length;
        ribbonTab = tabsNow[n].tab; pref.set('ribbontab', ribbonTab); renderRibbon(); SOPHIA.ui.refresh();
        ribbon.querySelector('.sx-tab[aria-selected=true]')?.focus();
      });
      ribbon.append(tabs);
    }
    const strip = U.el('div', 'sx-strip');
    const tabsToShow = ribbonMode === 'full' ? RIBBON.filter((t) => t.tab === ribbonTab) : RIBBON.filter((t) => !t.contextual || tableContext);
    for (const t of tabsToShow) {
      for (const g of t.groups) {
        const items = g.items.filter(visible);
        if (!items.length) continue;
        const group = U.el('div', 'sx-group');
        group.dataset.tone = TAB_TONE[t.tab];
        group.setAttribute('role', 'group');
        group.setAttribute('aria-label', g.name);
        group.dataset.group = g.name;
        const body = U.el('div', 'sx-group-body');
        const big = U.el('div', 'sx-big'), small = U.el('div', 'sx-small');
        for (const id of items) {
          const n = id.startsWith('@') ? control(id) : button(id, { text: ribbonMode === 'full' && !COMPACT.has(id), short: SHORT[id], cls: ribbonMode === 'mini' || COMPACT.has(id) ? 'sx-btn-icon' : 'sx-btn-stack' });
          (ribbonMode === 'full' && COMPACT.has(id) ? small : big).append(n);
        }
        if (big.children.length) body.append(big);
        if (small.children.length) body.append(small);
        group.append(body);
        if (ribbonMode === 'full') group.append(U.el('span', 'sx-group-name', g.name));
        strip.append(group);
      }
    }
    ribbon.append(strip);
  }
  function cycleRibbon() {
    ribbonMode = { full: 'mini', mini: 'hide', hide: 'full' }[ribbonMode];
    pref.set('ribbon', ribbonMode);
    renderRibbon();
    SOPHIA.ui.refresh();
    SOPHIA.ui.layout();
    toast('Edit panel: ' + { full: 'Full', mini: 'Mini (every tool, compact)', hide: 'Hidden' }[ribbonMode]);
  }

  /* Pressed state of format toggles and the current style follow the caret. */
  function updateFormatState() {
    if (ribbon.hidden) return;
    const sel = getSelection();
    const inDoc = sel.rangeCount && area.contains(sel.anchorNode);
    for (const b of ribbon.querySelectorAll('[data-cmd]')) {
      const c = C.get(b.dataset.cmd);
      if (!c?.state) continue;
      let on = false;
      if (inDoc) { try { on = document.queryCommandState(c.state); } catch {} }
      b.setAttribute('aria-pressed', String(on));
    }
    const cur = inDoc ? SOPHIA.blocks.currentStyle() : null;
    const styleSel = ribbon.querySelector('select[data-ctl=style]');
    if (styleSel && document.activeElement !== styleSel) styleSel.value = cur || '';
    ribbon.querySelectorAll('.sx-style').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.style === cur)));
  }

  /* The contextual Table tab appears while the caret is in a body table. */
  document.addEventListener('selectionchange', () => {
    clearTimeout(updateFormatState.t);
    updateFormatState.t = setTimeout(() => {
      const t = U.isEditing() && !!SOPHIA.tables.here();
      if (t !== tableContext) {
        tableContext = t;
        if (!t && RIBBON.find((x) => x.tab === ribbonTab)?.contextual) ribbonTab = pref.get('ribbontab', 'Home') === 'Table' ? 'Home' : pref.get('ribbontab', 'Home');
        renderRibbon();
        SOPHIA.ui.refresh();
      } else updateFormatState();
    }, 80);
  });

  /* Shown only while editing (and not hidden by its own mode). */
  function refresh(editing) {
    document.body.classList.toggle('sx-has-ribbon', editing && ribbonMode !== 'hide');
    ribbon.hidden = !editing || ribbonMode === 'hide';
    for (const sel of ribbon.querySelectorAll('select')) sel.disabled = !editing;
    for (const inp of ribbon.querySelectorAll('input')) inp.disabled = !editing;
  }

  return { el: ribbon, render: renderRibbon, cycle: cycleRibbon, mode: () => ribbonMode, updateFormatState, refresh };
})();
