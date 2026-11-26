/* ============================================================================
 * SOPHIA · 70-shell  (owner decision C2 + edit panel Full / Mini / Hide)
 * The whole application interface, rendered at start-up. Nothing here is ever
 * saved: every node carries data-runtime and lives outside #document.
 *
 *   header.sx-appbar      brand · title · version chip · status chip ▸ popover
 *                         History · Edit | Save draft ▾ · Focus · View ▾ · Canvas
 *                         │ Commands (Ctrl+K) · Sidebar · Edit panel (Full/Mini/Hide)
 *   div.sx-ribbon         edit panel, only while editing:
 *                         Full = tabs Home/Insert/Layout/Review, labelled groups
 *                         Mini = EVERY tool, icon-only, all groups in one compact strip
 *                         Hide = nothing (the app-bar button brings it back)
 *   aside.sx-side         Outline · Comments · Versions · Images · Checks
 *   div.sx-omni-panel     omnibox panel: bento of commands, or results (commands + document)
 *
 * ONE registry drives the ribbon, the sheet and the app bar: SOPHIA.commands.
 * To add a tool: register it here (or from its module) and list its id in
 * RIBBON and/or SHEET. Never add a second toolbar.
 * Legacy contract kept: window.Workbench {register, run, list, openPalette, refresh}
 * and window.side(name).
 * ========================================================================== */
SOPHIA.commands = (() => {
  'use strict';
  const map = new Map();
  /** register(id, label, group, run, editing?, extra?) — extra: { icon, keys, when, why, profile, toggle } */
  function register(id, label, group, run, editing = false, extra = {}) {
    map.set(id, Object.assign({ id, label, group, run, editing: !!editing }, map.get(id) && !extra.icon ? { icon: map.get(id).icon } : {}, extra));
    SOPHIA.bus.emit('commands-changed');
  }
  function available(c) {
    if (!c) return false;
    if (c.profile && c.profile !== SOPHIA.profile) return false;
    if (c.editing && !SOPHIA.util.isEditing()) return false;
    return !c.when || !!c.when();
  }
  function run(id) {
    const c = map.get(id);
    if (!c) return;
    if (c.editing && !SOPHIA.util.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    if (c.when && !c.when()) { toast(c.why || c.label + ' is not available right now.'); return; }
    try { c.run(); } catch (e) { console.error(e); toast('Could not run “' + c.label + '”: ' + e.message, { tone: 'error', ms: 6000 }); }
  }
  return { register, run, available, get: (id) => map.get(id), all: () => [...map.values()].filter((c) => !c.profile || c.profile === SOPHIA.profile) };
})();

SOPHIA.ui = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands, QC = SOPHIA.profile === 'quick-card';
  const pref = {
    get(k, d) { try { return localStorage.getItem('sophia:pref:' + k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('sophia:pref:' + k, v); } catch {} }
  };

  /* ---------- icons (24×24 strokes; one family, currentColor) ---------- */
  const ICONS = {
    undo: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11', redo: 'm15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
    paste: 'M9 4h6v3H9zM8 5H6v16h12V5h-2M9 12h6M9 16h4', clear: 'M6 5h12M12 5v14M4 4l16 16',
    bullets: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01', numbers: 'M10 6h10M10 12h10M10 18h10M4 5h1v4M4 9h2M6 19H4c0-1 2-2 2-3s-1-1.5-2-1',
    outdent: 'M21 6H11M21 12H11M21 18H11M7 8l-4 4 4 4', indent: 'M21 6H11M21 12H11M21 18H11M3 8l4 4-4 4',
    alignLeft: 'M3 6h18M3 12h12M3 18h16', alignCenter: 'M3 6h18M6 12h12M4 18h16', alignRight: 'M3 6h18M9 12h12M5 18h16', justify: 'M3 6h18M3 12h18M3 18h18',
    spacing: 'M11 6h10M11 12h10M11 18h10M5 4v16M3 6l2-2 2 2M3 18l2 2 2-2', para: 'M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13',
    table: 'M3 5h18v14H3zM3 10h18M3 15h18M9 5v14M15 5v14', image: 'M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M15.5 9.5h.01',
    link: 'M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1',
    warning: 'M12 3 2 20h20zM12 10v4M12 17h.01', confirm: 'M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5V14M12 17h.01',
    hr: 'M3 12h18M7 7h10M7 17h10', pagebreak: 'M6 3v5h12V3M6 21v-5h12v5M3 12h2M8 12h2M14 12h2M19 12h2', slash: 'M4 4h16v16H4zM15 7 9 17',
    toc: 'M4 6h2M4 12h2M4 18h2M9 6h11M11 12h9M11 18h9', symbol: 'M5 20h4v-2a7 7 0 1 1 6 0v2h4', date: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    docxIn: 'M14 3H6v18h12V7zM14 3v4h4M12 10v7M9 14l3 3 3-3', docxOut: 'M14 3H6v18h12V7zM14 3v4h4M12 17v-7M9 13l3-3 3 3',
    agent: 'M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8zM19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
    map: 'M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1',
    a4: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h4', continuous: 'M6 2v20M18 2v20M9 6h6M9 10h6M9 14h6M9 18h6', fit: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5',
    zoomIn: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4M8 11h6M11 8v6', zoomOut: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4M8 11h6',
    reflow: 'M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4', layout: 'M3 3h18v18H3zM3 9h18M9 9v12',
    up: 'M12 19V5M6 11l6-6 6 6', down: 'M12 5v14M6 13l6 6 6-6', tableStudio: 'M3 5h18v14H3zM3 10h18M10 10v9M14 14h4',
    tableFlow: 'M3 4h8v7H3zM13 13h8v7h-8zM11 7.5h4a2 2 0 0 1 2 2V13', imageStudio: 'M3 5h12v10H3zM3 12l3-3 3 3 2-2 4 4M18 8h3M18 12h3M3 19h18',
    library: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z', autonum: 'M4 6h1v4M4 10h2M9 8h11M4 15h2v4H4M9 17h11',
    comment: 'M4 5h16v11H9l-5 4z', tbc: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 8v4M12 16h.01', changes: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
    compare: 'M4 4h7v16H4zM13 4h7v16h-7zM6 8h3M15 12h3M6 12h3', checks: 'M9 11l3 3 8-8M20 12v7H4V5h12', structure: 'M4 4h7v5H4zM13 4h7v5h-7zM4 15h7v5H4zM13 15h7v5h-7zM7.5 9v6M16.5 9v6',
    find: 'M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14zM20 20l-4-4', replace: 'M4 7h12l-3-3M20 17H8l3 3', words: 'M4 6h16M4 10h16M4 14h10M4 18h7',
    keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10', history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2',
    edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z', save: 'M5 3h11l3 3v15H5zM8 3v5h7V3M8 21v-7h8v7', publish: 'M12 16V4M7 9l5-5 5 5M5 20h14',
    big: 'M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6l-4.9 2.6.9-5.5-4-3.9 5.5-.8z', download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
    recover: 'M20 7H9a5 5 0 0 0 0 10h6M20 7l-4-4M20 7l-4 4', discard: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3', upgrade: 'M4 14v6h16v-6M12 15V3M8 7l4-4 4 4',
    focus: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', view: 'M3 4h8v16H3zM13 4h8v16h-8z',
    canvas: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z', commands: 'M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z',
    sidebar: 'M3 4h18v16H3zM9 4v16', ribbon: 'M3 5h18v6H3zM6 8h2M10 8h2M14 8h2M3 15h18M3 19h12', print: 'M6 9V3h12v6M6 18H4v-7h16v7h-2M6 14h12v7H6z',
    outline: 'M4 6h16M8 12h12M12 18h8', chevron: 'M6 9l6 6 6-6', close: 'M6 6l12 12M18 6 6 18', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
    brief: 'M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-5a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h6z', card: 'M3 6h18v12H3zM7 10h6M7 14h10', pending: 'M3 6h18v12H3zM12 9v3M12 15h.01',
    marks: 'M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13', more: 'M5 12h.01M12 12h.01M19 12h.01', move: 'M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4'
  };
  function icon(name) {
    const span = U.el('span', 'sx-ico');
    span.setAttribute('aria-hidden', 'true');
    const d = ICONS[name];
    if (d) span.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
    return span;
  }
  const GLYPH = { bold: ['B', 'font-weight:800'], italic: ['I', 'font-style:italic;font-family:Georgia,serif'], underline: ['U', 'text-decoration:underline'], strike: ['S', 'text-decoration:line-through'], superscript: ['x²', ''], subscript: ['x₂', ''] };

  /* ---------- the command list (labels in English: owner decision N) ---------- */
  const ed = (cmd, value) => () => EditorCommands.command(cmd, value);
  const R = (id, label, group, icon, run, editing, extra = {}) => C.register(id, label, group, run, editing, Object.assign({ icon }, extra));
  // Document & saving
  R('edit', 'Start editing', 'Document', 'edit', () => edit(), false, { when: () => !EditorSession.get().pid, why: 'You are already editing.' });
  R('saveDraft', 'Save draft', 'Document', 'save', () => exportPID('Draft'), true, { keys: 'Ctrl+S' });
  R('publish', 'Publish & save (+0.01)', 'Document', 'publish', () => exportPID('Published'), true);
  R('bigValidation', 'Big Validation (next major)', 'Document', 'big', () => exportPID('Big Validation'), true);
  R('downloadCopy', 'Download a copy', 'Document', 'download', () => downloadCurrentCopy());
  R('recover', 'Recover local draft', 'Document', 'recover', () => EditorSession.recover(), true);
  R('discard', 'Discard session changes', 'Document', 'discard', () => EditorSession.discard(), true);
  R('upgrade', 'Upgrade an older SOPHIA file…', 'Document', 'upgrade', () => SOPHIA.persist.upgradeFromFile(), false, { when: () => !EditorSession.get().pid, why: 'Finish or discard the editing session first.' });
  R('print', 'Print Studio / PDF', 'Output', 'print', () => PrintStudio42.open(), false, { keys: 'Ctrl+P' });
  R('exportDocx', 'Export Word review copy (.docx)', 'Output', 'docxOut', () => SOPHIA.docx.exportFile());
  R('exportMap', 'Export document map for agents (.json)', 'Agent', 'map', () => SOPHIA.proposals.exportMap());
  R('applyProposal', 'Apply agent proposal…', 'Agent', 'agent', () => SOPHIA.proposals.open(), true);
  R('brief', 'Agent brief (firmware)', 'Agent', 'brief', () => showDoc('sophia-agent-brief', 'Agent brief — firmware for Copilot'));
  R('history', 'History Studio', 'Review', 'history', () => openHistoryStudio(), false);
  // Home
  R('undo', 'Undo', 'Home', 'undo', ed('undo'), true, { keys: 'Ctrl+Z' });
  R('redo', 'Redo', 'Home', 'redo', ed('redo'), true, { keys: 'Ctrl+Y' });
  R('pastePlain', 'Paste as plain text', 'Home', 'paste', pastePlain, true, { keys: 'Ctrl+Shift+V' });
  R('clearFormat', 'Clear formatting', 'Home', 'clear', ed('removeFormat'), true);
  R('bold', 'Bold', 'Home', null, ed('bold'), true, { keys: 'Ctrl+B', state: 'bold' });
  R('italic', 'Italic', 'Home', null, ed('italic'), true, { keys: 'Ctrl+I', state: 'italic' });
  R('underline', 'Underline', 'Home', null, ed('underline'), true, { keys: 'Ctrl+U', state: 'underline' });
  R('strike', 'Strikethrough', 'Home', null, ed('strikeThrough'), true, { state: 'strikeThrough' });
  R('superscript', 'Superscript', 'Home', null, ed('superscript'), true, { state: 'superscript' });
  R('subscript', 'Subscript', 'Home', null, ed('subscript'), true, { state: 'subscript' });
  R('bullets', 'Bulleted list', 'Home', 'bullets', ed('insertUnorderedList'), true, { keys: 'Ctrl+Shift+8', state: 'insertUnorderedList' });
  R('numbers', 'Numbered list', 'Home', 'numbers', ed('insertOrderedList'), true, { keys: 'Ctrl+Shift+7', state: 'insertOrderedList' });
  R('outdent', 'Decrease indent', 'Home', 'outdent', ed('outdent'), true);
  R('indent', 'Increase indent', 'Home', 'indent', ed('indent'), true);
  R('alignLeft', 'Align left', 'Home', 'alignLeft', () => EditorCommands.paragraph('textAlign', 'left'), true);
  R('alignCenter', 'Center', 'Home', 'alignCenter', () => EditorCommands.paragraph('textAlign', 'center'), true);
  R('alignRight', 'Align right', 'Home', 'alignRight', () => EditorCommands.paragraph('textAlign', 'right'), true);
  R('justify', 'Justify', 'Home', 'justify', () => EditorCommands.paragraph('textAlign', 'justify'), true);
  R('paragraphSettings', 'Paragraph settings…', 'Home', 'para', () => EditorCommands.paragraphDialog(), true);
  // Insert
  R('insertTable', 'Table…', 'Insert', 'table', () => EditorCommands.insertTable(), true);
  R('insertImage', 'Image or screenshot…', 'Insert', 'image', () => EditorMedia.open(), true);
  R('insertLink', 'Link…', 'Insert', 'link', () => EditorCommands.insertLink(), true);
  R('calloutWarning', 'Warning callout', 'Insert', 'warning', () => SOPHIA.blocks.applyStyle('warning'), true);
  R('calloutConfirm', 'Confirmation required', 'Insert', 'confirm', () => SOPHIA.blocks.applyStyle('confirmation'), true);
  R('insertHr', 'Horizontal line', 'Insert', 'hr', ed('insertHorizontalRule'), true);
  R('pageBreak', 'Start on a new page', 'Insert', 'pagebreak', pageBreak, true);
  R('slashMenu', 'Insert block menu (/)', 'Insert', 'slash', () => SophiaFlow.openSlash(), true, { keys: '/' });
  R('insertToc', 'Table of contents', 'Insert', 'toc', () => SOPHIA.blocks.insertToc(), true);
  R('insertDate', "Today's date", 'Insert', 'date', () => EditorCommands.command('insertText', new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })), true);
  R('insertCard', 'Information card', 'Insert', 'card', () => SOPHIA.qc.insertCard(), true, { profile: 'quick-card' });
  R('cardPending', 'Card pending / confirmed', 'Insert', 'pending', () => SOPHIA.qc.togglePending(), true, { profile: 'quick-card' });
  R('importDocx', 'Import from Word (.docx)…', 'Insert', 'docxIn', () => SOPHIA.docx.importFile(), true);
  // Layout & view
  R('viewA4', 'A4 pages', 'View', 'a4', () => setDocumentView('pages'), false, { pressed: () => !document.body.classList.contains('continuous-view') });
  R('viewContinuous', 'Continuous', 'View', 'continuous', () => setDocumentView('continuous'), false, { pressed: () => document.body.classList.contains('continuous-view') });
  R('zoomFit', 'Fit width', 'View', 'fit', () => zoom('fit'));
  R('zoomOut', 'Zoom out', 'View', 'zoomOut', () => zoom(-0.1), false, { keys: 'Ctrl+−' });
  R('zoomIn', 'Zoom in', 'View', 'zoomIn', () => zoom(0.1), false, { keys: 'Ctrl+=' });
  R('zoomReset', 'Zoom 100 %', 'View', 'a4', () => zoom(1));
  R('focus', 'Focus reading', 'View', 'focus', () => setFocus(true));
  R('canvas', 'Light / obsidian canvas', 'View', 'canvas', () => setCanvas(!document.body.hasAttribute('data-jaom-light')), false, { pressed: () => document.body.hasAttribute('data-jaom-light') });
  R('sidebar', 'Show / hide side panel', 'View', 'sidebar', () => toggleSide(), false, { pressed: () => !side_.el.hidden });
  R('ribbonMode', 'Edit panel: Full / Mini / Hide', 'View', 'edit', () => cycleRibbon(), true);
  R('mainMode', 'Main panel: Full / Mini / Hide', 'View', 'ribbon', () => cycleMain());
  R('reflow', 'Reflow A4 pages', 'Layout', 'reflow', () => { setDocumentView('pages'); toast('Pages recalculated.'); });
  R('layoutStudio', 'Layout Studio…', 'Layout', 'layout', () => LayoutStudio.open());
  R('autoNumber', 'Automatic heading numbers', 'Layout', 'autonum', () => SOPHIA.numbering.toggle(), true, { pressed: () => SOPHIA.numbering.enabled() });
  R('moveUp', 'Move block up', 'Layout', 'up', () => SOPHIA.blocks.move(-1), true, { keys: 'Alt+↑' });
  R('moveDown', 'Move block down', 'Layout', 'down', () => SOPHIA.blocks.move(1), true, { keys: 'Alt+↓' });
  R('tableStudio', 'Table Studio…', 'Layout', 'tableStudio', () => EditorCommands.tableAction(''), true);
  R('tableFlow', 'Table Flow…', 'Layout', 'tableFlow', () => TableFlow.open(), true, { profile: 'quick-card' });
  R('imageStudio', 'Image Layout Studio…', 'Layout', 'imageStudio', () => EditorMedia.studio(), true);
  R('imageLibrary', 'Image library…', 'Layout', 'library', () => ImageLibrary.open());
  // Review
  R('addComment', 'Add comment', 'Review', 'comment', () => SOPHIA.comments.add(), true, { keys: 'Ctrl+Alt+M' });
  R('markTbc', 'Mark To Be Confirmed', 'Review', 'tbc', () => SOPHIA.tbc.toggle(), true, { keys: 'Ctrl+Shift+T' });
  R('comments', 'Comments panel', 'Review', 'comment', () => side('comments'));
  R('versions', 'Versions & changes', 'Review', 'changes', () => side('versions'));
  R('compare', 'Compare revisions…', 'Review', 'compare', () => SOPHIA.compare.open());
  R('checks', 'Document checks…', 'Review', 'checks', () => DocumentReview.open());
  R('structure', 'Block structure…', 'Review', 'structure', () => BlockIdentity.open());
  R('find', 'Find', 'Review', 'find', () => openDocumentFind(), false, { keys: 'Ctrl+F' });
  R('replace', 'Find & replace', 'Review', 'replace', () => replaceDialog(), true, { keys: 'Ctrl+H' });
  R('wordCount', 'Word count', 'Review', 'words', wordCount);
  R('outline', 'Outline panel', 'Review', 'outline', () => side('outline'));
  R('showMarks', 'Show paragraph marks', 'Review', 'marks', () => { document.body.classList.toggle('showmarks'); refresh(); }, false, { pressed: () => document.body.classList.contains('showmarks') });
  R('shortcuts', 'Keyboard shortcuts', 'Help', 'keyboard', () => SophiaFlow.openHelp(), false, { keys: 'F1' });
  R('about', 'About this file', 'Help', 'info', about);

  /* ---------- small actions ---------- */
  async function pastePlain() {
    try {
      const text = await navigator.clipboard.readText();
      EditorCommands.command('insertText', text);
    } catch {
      toast('The browser blocked clipboard access here. Use Ctrl+Shift+V to paste as plain text.');
    }
  }
  function pageBreak() {
    const b = SOPHIA.blocks.currentTop();
    if (!b) { toast('Place the cursor in the block that should start the new page.'); return; }
    if (EditorTransactions.run('Start block on a new page', () => { if (b.dataset.layoutBefore === 'page') delete b.dataset.layoutBefore; else b.dataset.layoutBefore = 'page'; }))
      toast(b.dataset.layoutBefore ? 'This block now starts on a new A4 page.' : 'Page break removed.');
  }
  function wordCount() {
    const s = SOPHIA.stats();
    modal('Word count', '<dl class="sx-dl"><dt>Words</dt><dd>' + s.words + '</dd><dt>A4 pages</dt><dd>' + (s.continuous ? '— (continuous view)' : s.pages) + '</dd><dt>Headings</dt><dd>' + SOPHIA.numbering.compute().length + '</dd><dt>Tables</dt><dd>' + area.querySelectorAll('.pagecontent table').length + '</dd><dt>Images</dt><dd>' + area.querySelectorAll('.pagecontent img').length + '</dd></dl>', (v) => v.remove(), 'Close');
  }
  function about() {
    const last = data.revisions.at(-1);
    modal('About this file', '<dl class="sx-dl"><dt>Application</dt><dd>SOPHIA ' + SOPHIA.engine + ' · ' + SOPHIA.strings.profileLabel[SOPHIA.profile] + ' editor</dd><dt>Document</dt><dd data-f="id"></dd><dt>Document version</dt><dd>V' + U.escapeHTML(data.documentVersion) + ' · ' + U.escapeHTML(data.status) + '</dd><dt>Last revision</dt><dd data-f="last"></dd><dt>Revisions in file</dt><dd>' + data.revisions.length + '</dd><dt>File format</dt><dd>' + U.escapeHTML(data.format || 'not yet saved as sophia/77') + '</dd></dl><p class="muted">The application version (V77) and the document version (V' + U.escapeHTML(data.documentVersion) + ') are independent. Save draft keeps the number; Publish & save adds 0.01; Big Validation moves to the next major.</p>', (v) => v.remove(), 'Close')
      .querySelector('[data-f="id"]').textContent = data.id;
    document.querySelector('dialog.legacy-modal [data-f="last"]').textContent = last ? SOPHIA.versions.label(last) + ' · ' + String(last.date).slice(0, 10) + ' · ' + (last.editorPID || last.author || '') : '—';
  }
  function showDoc(id, title) {
    const text = document.getElementById(id)?.textContent || '(missing)';
    const v = modal(title, '<pre class="sx-doc"></pre>', () => { navigator.clipboard?.writeText(text).then(() => toast('Copied.'), () => toast('Select the text and copy it.')); }, 'Copy');
    v.querySelector('.sx-doc').textContent = text.trim();
  }

  /* ---------- view: zoom, focus, canvas ---------- */
  let zoomLevel = Number(pref.get('zoom', '1')) || 1;
  function zoom(step) {
    if (step === 'fit') {
      const sheet = area.querySelector('.sheet');
      const avail = area.clientWidth - 32;
      zoomLevel = sheet ? Math.max(0.5, Math.min(2, avail / (sheet.offsetWidth || 794))) : 1;
    } else if (step === 1) zoomLevel = 1;
    else zoomLevel = Math.max(0.5, Math.min(2, Math.round((zoomLevel + step) * 10) / 10));
    area.style.zoom = zoomLevel === 1 ? '' : String(zoomLevel);
    pref.set('zoom', String(zoomLevel));
    refresh();
  }
  function setFocus(on) {
    document.body.classList.toggle('focusmode', !!on);
    if (on) { closeMenus(); setEditable(); toast('Focus reading. Press Esc to return.'); }
    else setEditable();
    EditorSession.refresh();
    layout();
  }
  function setCanvas(light) {
    if (light) document.body.setAttribute('data-jaom-light', ''); else document.body.removeAttribute('data-jaom-light');
    pref.set('canvas', light ? 'light' : 'obsidian');
    refresh();
  }

  /* ---------- DOM scaffold ---------- */
  const runtime = (n) => (n.dataset.runtime = '', n);
  function button(id, opts = {}) {
    const c = C.get(id);
    const b = U.el('button', 'sx-btn ' + (opts.cls || ''));
    b.type = 'button';
    b.dataset.cmd = id;
    if (c?.icon) b.append(icon(c.icon));
    else if (GLYPH[id]) { const g = U.el('span', 'sx-glyph', GLYPH[id][0]); g.style.cssText = GLYPH[id][1]; g.setAttribute('aria-hidden', 'true'); b.append(g); }
    const label = opts.label || c?.label || id;
    if (opts.text !== false) b.append(U.el('span', 'sx-label', opts.short || label));
    b.title = label + (c?.keys ? ' (' + c.keys + ')' : '');
    b.setAttribute('aria-label', label);
    if (c?.state || c?.pressed) b.setAttribute('aria-pressed', 'false');
    b.addEventListener('mousedown', (e) => { if (area.contains(document.activeElement) || document.activeElement === document.body) e.preventDefault(); });
    b.onclick = () => { C.run(id); refreshSoon(); };
    return b;
  }

  const bar = runtime(U.el('header', 'sx-appbar'));
  bar.setAttribute('role', 'banner');
  const brand = U.el('div', 'sx-brand');
  const mark = U.el('span', 'sx-mark', '◆');
  mark.setAttribute('aria-hidden', 'true');
  brand.append(mark, U.el('span', 'sx-app', 'SOPHIA'), U.el('span', 'sx-profile', SOPHIA.strings.profileLabel[SOPHIA.profile]));
  const titleEl = U.el('h1', 'sx-title');
  const versionChip = U.el('button', 'sx-chip sx-chip-version');
  versionChip.type = 'button';
  versionChip.onclick = () => side('versions');
  const statusChip = U.el('button', 'sx-chip sx-chip-status');
  statusChip.type = 'button';
  statusChip.setAttribute('aria-haspopup', 'dialog');
  statusChip.onclick = () => statusPopover();
  const ident = U.el('div', 'sx-ident');
  ident.append(brand, titleEl, versionChip, statusChip);

  /* Commands omnibox (owner, V77.1): one field for every command, grouped by area, and for
     searching the document. Click or Ctrl+K puts the caret in it and opens the panel. */
  const omni = U.el('div', 'sx-omni');
  omni.setAttribute('role', 'search');
  const omniInput = document.createElement('input');
  omniInput.type = 'search';
  omniInput.className = 'sx-omni-input';
  omniInput.placeholder = 'Commands & search';
  omniInput.autocomplete = 'off';
  omniInput.spellcheck = false;
  omniInput.setAttribute('aria-label', 'Commands and search in the document');
  omniInput.setAttribute('role', 'combobox');
  omniInput.setAttribute('aria-expanded', 'false');
  omniInput.setAttribute('aria-controls', 'sx-omni-panel');
  omni.append(icon('commands'), omniInput, U.el('kbd', 'sx-kbd', 'Ctrl K'));

  const actions = U.el('nav', 'sx-actions');
  actions.setAttribute('aria-label', 'Document actions');
  const historyBtn = button('history', { short: 'History', cls: 'sx-btn-text' });
  const editBtn = button('edit', { short: 'Edit mode', cls: 'sx-btn-filled' });
  const saveSplit = U.el('div', 'sx-split');
  const saveMain = button('saveDraft', { short: 'Save draft', cls: 'sx-btn-filled' });
  const saveMore = U.el('button', 'sx-btn sx-btn-filled sx-split-more');
  saveMore.type = 'button';
  saveMore.setAttribute('aria-label', 'More save options');
  saveMore.setAttribute('aria-haspopup', 'menu');
  saveMore.append(icon('chevron'));
  saveMore.onclick = () => menu(saveMore, ['publish', 'bigValidation', '-', 'downloadCopy', 'recover', 'discard']);
  saveSplit.append(saveMain, saveMore);
  const focusBtn = button('focus', { short: 'Focus', cls: 'sx-btn-text' });
  const viewBtn = U.el('button', 'sx-btn sx-btn-text');
  viewBtn.type = 'button';
  viewBtn.dataset.cmd = 'viewPanel';
  viewBtn.setAttribute('aria-haspopup', 'dialog');
  viewBtn.onclick = () => viewPanel(viewBtn);
  const canvasBtn = button('canvas', { short: 'Canvas', cls: 'sx-btn-text' });
  const sep = U.el('span', 'sx-sep');
  sep.setAttribute('aria-hidden', 'true');
  const mainBtn = U.el('button', 'sx-btn sx-btn-tonal sx-panel-toggle');
  mainBtn.type = 'button';
  mainBtn.dataset.cmd = 'mainMode';
  mainBtn.onclick = () => cycleMain();
  const sideBtn = button('sidebar', { short: 'Sidebar', cls: 'sx-btn-tonal sx-btn-blue' });
  const ribbonBtn = U.el('button', 'sx-btn sx-btn-tonal sx-panel-toggle sx-ribbon-toggle');
  ribbonBtn.type = 'button';
  ribbonBtn.dataset.cmd = 'ribbonMode';
  ribbonBtn.onclick = () => cycleRibbon();
  actions.append(historyBtn, editBtn, saveSplit, focusBtn, viewBtn, canvasBtn, sep, mainBtn, sideBtn, ribbonBtn);
  bar.append(ident, omni, actions);

  /* ---------- main panel (owner, V77.1: always available, Full / Mini / Hide) ----------
     Bento tiles by purpose, tonal like V76: Navigate · Review · Assets · Save & publish ·
     Output · Agent. Mini = the same buttons, icon-only, in compact tonal chips. */
  const MAIN = [
    { name: 'Navigate', tone: 'navigate', items: ['outline', 'find', 'structure', 'layoutStudio'] },
    { name: 'Review', tone: 'review', items: ['versions', 'compare', 'comments', 'checks'] },
    { name: 'Assets', tone: 'assets', items: ['imageLibrary', 'tableStudio', 'importDocx'] },
    { name: 'Save & publish', tone: 'save', items: ['edit', 'saveDraft', 'publish', 'bigValidation', 'discard'] },
    { name: 'Output', tone: 'output', items: ['print', 'downloadCopy', 'exportDocx'] },
    { name: 'Agent', tone: 'agent', items: ['brief', 'exportMap', 'applyProposal'] }
  ];
  const MAIN_SHORT = { outline: 'Outline', find: 'Find', structure: 'Structure', layoutStudio: 'Layout', versions: 'Changes', compare: 'Compare', comments: 'Comments', checks: 'Checks', imageLibrary: 'Images', tableStudio: 'Tables', importDocx: 'Import .docx', edit: 'Edit mode', saveDraft: 'Save draft', publish: 'Publish & save', bigValidation: 'Big Validation', discard: 'Discard', print: 'Print', downloadCopy: 'Download', exportDocx: 'Word copy', brief: 'Brief', exportMap: 'Map', applyProposal: 'Proposal' };
  const mainEl = runtime(U.el('div', 'sx-main'));
  mainEl.setAttribute('role', 'toolbar');
  mainEl.setAttribute('aria-label', 'Main panel');
  let mainMode = ['full', 'mini', 'hide'].includes(pref.get('mainpanel', 'full')) ? pref.get('mainpanel', 'full') : 'full';
  function renderMain() {
    mainEl.replaceChildren();
    mainEl.dataset.mode = mainMode;
    mainEl.hidden = mainMode === 'hide';
    if (mainMode === 'hide') return;
    for (const t of MAIN) {
      const tile = U.el('section', 'sx-tile-main');
      tile.dataset.tone = t.tone;
      tile.setAttribute('aria-label', t.name);
      if (mainMode === 'full') tile.append(U.el('span', 'sx-tile-cap', t.name));
      const row = U.el('div', 'sx-tile-row');
      for (const id of t.items) {
        const c = C.get(id);
        if (!c || (c.profile && c.profile !== SOPHIA.profile)) continue;
        row.append(button(id, { text: mainMode === 'full', short: MAIN_SHORT[id], cls: mainMode === 'mini' ? 'sx-btn-icon sx-chip-btn' : 'sx-chip-btn' }));
      }
      tile.append(row);
      mainEl.append(tile);
    }
  }
  function cycleMain() {
    mainMode = { full: 'mini', mini: 'hide', hide: 'full' }[mainMode];
    pref.set('mainpanel', mainMode);
    renderMain();
    refresh();
    toast('Main panel: ' + { full: 'Full', mini: 'Mini', hide: 'Hidden' }[mainMode]);
  }

  /* ---------- edit panel (ribbon) ---------- */
  const RIBBON = [
    { tab: 'Home', groups: [
      { name: 'History', items: ['undo', 'redo'] },
      { name: 'Clipboard', items: ['pastePlain', 'clearFormat'] },
      { name: 'Style', items: ['@style'] },
      { name: 'Font', items: ['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', '@color', '@highlight', '@size'] },
      { name: 'Paragraph', items: ['bullets', 'numbers', 'outdent', 'indent', 'alignLeft', 'alignCenter', 'alignRight', 'justify', '@spacing', 'paragraphSettings'] }
    ] },
    { tab: 'Insert', groups: [
      { name: 'Objects', items: ['insertTable', 'insertImage', 'insertLink', 'slashMenu'] },
      { name: 'Blocks', items: ['calloutWarning', 'calloutConfirm', 'insertHr', 'pageBreak', 'insertCard', 'cardPending'] },
      { name: 'Generated', items: ['insertToc', 'insertDate', 'symbols'] },
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
    ] }
  ];
  /* Short labels for Full mode (tooltips keep the full name). */
  const SHORT = { pastePlain: 'Plain paste', clearFormat: 'Clear', paragraphSettings: 'Paragraph', insertTable: 'Table', insertImage: 'Image', insertLink: 'Link', slashMenu: 'Blocks /', calloutWarning: 'Warning', calloutConfirm: 'Confirm', insertHr: 'Line', pageBreak: 'Page break', insertCard: 'Card', cardPending: 'Pending', insertToc: 'Contents', insertDate: 'Date', symbols: 'Symbol', importDocx: 'Word .docx', applyProposal: 'Proposal', viewA4: 'A4', viewContinuous: 'Continuous', zoomFit: 'Fit', zoomOut: 'Zoom −', zoomIn: 'Zoom +', reflow: 'Reflow', layoutStudio: 'Layout', autoNumber: 'Auto 1.2', moveUp: 'Up', moveDown: 'Down', tableStudio: 'Table Studio', tableFlow: 'Table Flow', imageStudio: 'Image layout', imageLibrary: 'Library', addComment: 'Comment', markTbc: 'TBC', comments: 'All comments', versions: 'Changes', compare: 'Compare', history: 'History', checks: 'Checks', structure: 'Structure', wordCount: 'Count', find: 'Find', replace: 'Replace', showMarks: 'Marks ¶', shortcuts: 'Shortcuts', undo: 'Undo', redo: 'Redo' };
  /* Compact tools (format toggles): icon-only even in Full, arranged in a 2-row grid. */
  const COMPACT = new Set(['bold', 'italic', 'underline', 'strike', 'superscript', 'subscript', 'bullets', 'numbers', 'outdent', 'indent', 'alignLeft', 'alignCenter', 'alignRight', 'justify', '@color', '@highlight']);
  const ribbon = runtime(U.el('div', 'sx-ribbon'));
  ribbon.setAttribute('role', 'toolbar');
  ribbon.setAttribute('aria-label', 'Edit panel');
  let ribbonMode = ['full', 'mini', 'hide'].includes(pref.get('ribbon', 'full')) ? pref.get('ribbon', 'full') : 'full';
  let ribbonTab = pref.get('ribbontab', 'Home');
  function control(kind) {
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
      for (const t of RIBBON) {
        const b = U.el('button', 'sx-tab', t.tab);
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.setAttribute('aria-selected', String(t.tab === ribbonTab));
        b.onclick = () => { ribbonTab = t.tab; pref.set('ribbontab', t.tab); renderRibbon(); refresh(); };
        tabs.append(b);
      }
      tabs.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        const i = RIBBON.findIndex((t) => t.tab === ribbonTab), n = (i + (e.key === 'ArrowRight' ? 1 : RIBBON.length - 1)) % RIBBON.length;
        ribbonTab = RIBBON[n].tab; pref.set('ribbontab', ribbonTab); renderRibbon(); refresh();
        ribbon.querySelector('.sx-tab[aria-selected=true]')?.focus();
      });
      ribbon.append(tabs);
    }
    const strip = U.el('div', 'sx-strip');
    const tabsToShow = ribbonMode === 'full' ? RIBBON.filter((t) => t.tab === ribbonTab) : RIBBON;
    for (const t of tabsToShow) {
      for (const g of t.groups) {
        const items = g.items.filter(visible);
        if (!items.length) continue;
        const group = U.el('div', 'sx-group');
        group.dataset.tone = { Home: 'navigate', Insert: 'assets', Layout: 'output', Review: 'review' }[t.tab];
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
    refresh();
    layout();
    toast('Edit panel: ' + { full: 'Full', mini: 'Mini (every tool, compact)', hide: 'Hidden' }[ribbonMode]);
  }

  /* ---------- side panel ---------- */
  const side_ = { el: runtime(U.el('aside', 'sx-side')), name: pref.get('sidepanel', 'outline') };
  side_.el.setAttribute('aria-label', 'Side panel');
  side_.el.hidden = pref.get('side', window.innerWidth >= 1100 ? 'open' : 'closed') !== 'open';
  const sideTabs = U.el('div', 'sx-side-tabs');
  sideTabs.setAttribute('role', 'tablist');
  const PANELS = [['outline', 'Outline', 'outline'], ['comments', 'Comments', 'comment'], ['versions', 'Versions', 'changes'], ['images', 'Images', 'image'], ['checks', 'Checks', 'checks']];
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
      if (r.reason) b.append(U.el('small', '', r.reason));
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
      const li = U.el('li', 'sx-check-' + it.tone, it.text);
      if (it.node) { li.tabIndex = 0; li.onclick = li.onkeydown = (e) => { if (e.type === 'keydown' && e.key !== 'Enter') return; it.node.scrollIntoView({ block: 'center', behavior: 'smooth' }); }; }
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
    layout();
    if (open && !quiet) renderSide();
    refresh();
  }

  /* ---------- menus & popovers ---------- */
  let openMenuEl = null;
  function closeMenus() {
    if (!openMenuEl) return;
    const m = openMenuEl;
    openMenuEl = null;
    m.remove();
    m._anchor?.setAttribute('aria-expanded', 'false');
  }
  function place(pop, anchor) {
    document.body.append(pop);
    const r = anchor.getBoundingClientRect(), w = pop.offsetWidth;
    pop.style.top = Math.round(r.bottom + 6) + 'px';
    pop.style.left = Math.round(Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w))) + 'px';
  }
  function menu(anchor, ids) {
    if (openMenuEl?._anchor === anchor) { closeMenus(); return; }
    closeMenus();
    const m = runtime(U.el('div', 'sx-menu'));
    m.setAttribute('role', 'menu');
    m._anchor = anchor;
    for (const id of ids) {
      if (id === '-') { m.append(U.el('hr')); continue; }
      const c = C.get(id);
      if (!c || (c.profile && c.profile !== SOPHIA.profile)) continue;
      const b = U.el('button', 'sx-menu-item');
      b.type = 'button';
      b.setAttribute('role', c.pressed ? 'menuitemcheckbox' : 'menuitem');
      if (c.pressed) b.setAttribute('aria-checked', String(!!c.pressed()));
      b.append(icon(c.icon), U.el('span', '', c.label));
      if (c.keys) b.append(U.el('kbd', '', c.keys));
      b.disabled = !C.available(c);
      b.onclick = () => { closeMenus(); C.run(id); refreshSoon(); };
      m.append(b);
    }
    m.addEventListener('keydown', (e) => {
      const items = [...m.querySelectorAll('button:not(:disabled)')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus(); }
      else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeMenus(); anchor.focus(); }
    });
    place(m, anchor);
    openMenuEl = m;
    anchor.setAttribute('aria-expanded', 'true');
    m.querySelector('button:not(:disabled)')?.focus();
  }
  function statusPopover() {
    if (openMenuEl?._anchor === statusChip) { closeMenus(); return; }
    closeMenus();
    const s = EditorSession.get(), last = data.revisions.at(-1), st = SOPHIA.stats();
    const p = runtime(U.el('div', 'sx-menu sx-popover'));
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Document status');
    p._anchor = statusChip;
    const dl = U.el('dl', 'sx-dl');
    const row = (k, v) => dl.append(U.el('dt', '', k), U.el('dd', '', v));
    row('Document', data.id);
    row('Version', 'V' + data.documentVersion + ' · ' + data.status);
    row('Last revision', last ? SOPHIA.versions.label(last) + ' · ' + String(last.date).slice(0, 10) : '—');
    row('Session', s.pid ? 'Editing as ' + s.pid : 'Read only');
    row('Changes', s.dirty ? 'Unsaved changes' + (s.recovery === 'saved' ? ' · local recovery copy kept' : s.recovery === 'unavailable' ? ' · recovery unavailable in this browser' : '') : 'None since last save');
    row('Review', SOPHIA.comments.openCount() + ' open comment(s) · ' + SOPHIA.tbc.count() + ' TBC mark(s)');
    row('Size', st.words + ' words' + (st.continuous ? '' : ' · ' + st.pages + ' A4 page(s)'));
    row('Application', 'SOPHIA ' + SOPHIA.engine + ' (independent from the document version)');
    p.append(dl);
    const foot = U.el('div', 'sx-row');
    for (const id of s.pid ? ['saveDraft', 'publish', 'discard'] : ['edit', 'history', 'downloadCopy']) {
      const b = button(id, { cls: id === 'saveDraft' || id === 'edit' ? 'sx-btn-filled' : 'sx-btn-text' });
      b.onclick = () => { closeMenus(); C.run(id); };
      foot.append(b);
    }
    p.append(foot);
    p.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenus(); statusChip.focus(); } });
    place(p, statusChip);
    p.style.left = Math.round(Math.max(8, statusChip.getBoundingClientRect().left)) + 'px';
    openMenuEl = p;
    statusChip.setAttribute('aria-expanded', 'true');
    p.querySelector('button')?.focus();
  }
  document.addEventListener('pointerdown', (e) => { if (openMenuEl && !openMenuEl.contains(e.target) && !openMenuEl._anchor.contains(e.target)) closeMenus(); }, true);
  addEventListener('resize', () => { closeMenus(); layout(); });

  /* ---------- commands omnibox panel (commands by area + matches in the document) ---------- */
  const SHEET = [
    { name: 'Save & publish', tone: 'save', items: ['edit', 'saveDraft', 'publish', 'bigValidation', 'recover', 'discard'] },
    { name: 'Review', tone: 'review', items: ['history', 'versions', 'compare', 'comments', 'addComment', 'markTbc', 'checks', 'structure'] },
    { name: 'Navigate', tone: 'navigate', items: ['outline', 'find', 'replace', 'wordCount'] },
    { name: 'Insert', tone: 'assets', items: ['insertTable', 'insertImage', 'insertLink', 'insertToc', 'insertCard', 'importDocx', 'imageLibrary', 'tableStudio', 'tableFlow', 'imageStudio'] },
    { name: 'Output', tone: 'output', items: ['print', 'downloadCopy', 'exportDocx', 'upgrade'] },
    { name: 'Agent (SOPHIA)', tone: 'agent', items: ['brief', 'exportMap', 'applyProposal'] },
    { name: 'View', tone: 'navigate', items: ['viewA4', 'viewContinuous', 'zoomFit', 'focus', 'canvas', 'sidebar', 'mainMode', 'ribbonMode', 'layoutStudio', 'autoNumber', 'showMarks'] },
    { name: 'Help', tone: 'output', items: ['shortcuts', 'about'] }
  ];
  const omniPanel = runtime(U.el('div', 'sx-omni-panel'));
  omniPanel.id = 'sx-omni-panel';
  omniPanel.hidden = true;
  let omniRange = null;
  const HL_OMNI = 'sophia-omni';
  function cmdItem(id, tone) {
    const c = C.get(id);
    if (!c || (c.profile && c.profile !== SOPHIA.profile)) return null;
    const b = U.el('button', 'sx-cmd');
    b.type = 'button';
    b.dataset.cmd = id;
    if (tone) b.dataset.tone = tone;
    b.dataset.search = (c.label + ' ' + c.group + ' ' + id).toLowerCase();
    b.append(icon(c.icon || 'more'), U.el('span', '', c.label));
    if (c.keys) b.append(U.el('kbd', '', c.keys));
    if (!C.available(c)) { b.setAttribute('aria-disabled', 'true'); b.title = c.editing && !U.isEditing() ? 'Start editing first' : c.why || ''; }
    b.onclick = () => {
      if (b.getAttribute('aria-disabled') === 'true') { toast(b.title || 'Not available right now.'); return; }
      closeOmni(true);
      C.run(id);
      refreshSoon();
    };
    return b;
  }
  function docMatches(q) {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length || q.trim().length < 2) return [];
    const out = [];
    const blocks = [...area.querySelectorAll('.pagecontent :is(h2,h3,h4,p,li,td,th,figcaption,aside,blockquote), .qc-hero :is(h1,p), .identity .value')]
      .filter((n) => !n.querySelector('p,li,h2,h3,h4,table') && n.textContent.trim());
    let heading = '';
    for (const n of blocks) {
      if (/^H[2-4]$/.test(n.tagName)) heading = SOPHIA.numbering.label(n);
      const text = n.textContent, low = text.toLowerCase(), flat = low.replace(/\s+/g, ' ');
      if (!words.every((w) => flat.includes(w)) || low.indexOf(words[0]) < 0) continue;
      const at = low.indexOf(words[0]);
      out.push({ node: n, heading: n.closest('.identity') ? 'Document information' : /^H[2-4]$/.test(n.tagName) ? 'Heading' + (n.dataset.num ? ' ' + n.dataset.num : '') : heading || 'Document', text, at, len: words[0].length });
      if (out.length >= 40) break;
    }
    return out;
  }
  function jumpTo(m) {
    closeOmni(false);
    const n = m.node;
    n.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT);
    let left = m.at, node, range = null;
    while ((node = w.nextNode())) {
      if (left <= node.nodeValue.length) { range = document.createRange(); range.setStart(node, Math.min(left, node.nodeValue.length)); range.setEnd(node, Math.min(left + m.len, node.nodeValue.length)); break; }
      left -= node.nodeValue.length;
    }
    if (range && window.CSS?.highlights) {
      CSS.highlights.set(HL_OMNI, new Highlight(range));
      setTimeout(() => CSS.highlights.delete(HL_OMNI), 2600);
    }
    if (range && U.isEditing() && n.closest('[contenteditable=true]')) {
      n.closest('[contenteditable=true]').focus({ preventScroll: true });
      getSelection().removeAllRanges();
      getSelection().addRange(range);
    }
  }
  function renderOmni() {
    const q = omniInput.value.trim();
    omniPanel.replaceChildren();
    if (!q) {
      const grid = U.el('div', 'sx-bento');
      for (const t of SHEET) {
        const tile = U.el('section', 'sx-tile');
        tile.dataset.tone = t.tone;
        tile.append(U.el('h3', '', t.name));
        const list = U.el('div', 'sx-tile-list');
        for (const id of t.items) { const b = cmdItem(id, t.tone); if (b) list.append(b); }
        tile.append(list);
        grid.append(tile);
      }
      omniPanel.append(grid);
      omniPanel.append(U.el('p', 'sx-omni-foot', 'Type to filter commands and search the text of this document · ↑↓ to move · Enter to run · Esc to close'));
      return;
    }
    const words = q.toLowerCase().split(/\s+/);
    const cmds = C.all().filter((c) => c.label && words.every((w) => (c.label + ' ' + c.group + ' ' + c.id).toLowerCase().includes(w))).slice(0, 12);
    const wrap = U.el('div', 'sx-omni-results');
    const colA = U.el('section', 'sx-omni-col');
    colA.append(U.el('h3', '', 'Commands'));
    if (!cmds.length) colA.append(U.el('p', 'sx-empty', 'No command matches.'));
    for (const c of cmds) { const b = cmdItem(c.id); if (b) colA.append(b); }
    const colB = U.el('section', 'sx-omni-col sx-omni-doc');
    const hits = docMatches(q);
    colB.append(U.el('h3', '', 'In this document · ' + (hits.length >= 40 ? '40+' : hits.length)));
    if (!hits.length) colB.append(U.el('p', 'sx-empty', q.length < 2 ? 'Type at least 2 characters.' : 'No text in the document matches “' + q + '”.'));
    for (const m of hits) {
      const b = U.el('button', 'sx-hit');
      b.type = 'button';
      b.append(U.el('small', '', m.heading));
      const line = U.el('span');
      const start = Math.max(0, m.at - 48);
      line.append((start ? '…' : '') + m.text.slice(start, m.at), U.el('mark', '', m.text.slice(m.at, m.at + m.len)), m.text.slice(m.at + m.len, m.at + m.len + 90) + (m.at + m.len + 90 < m.text.length ? '…' : ''));
      b.append(line);
      b.onclick = () => jumpTo(m);
      colB.append(b);
    }
    if (hits.length) {
      const all = U.el('button', 'sx-cmd');
      all.type = 'button';
      all.append(icon('find'), U.el('span', '', 'Open Find for all matches'), U.el('kbd', '', 'Ctrl+F'));
      all.onclick = () => { closeOmni(false); openDocumentFind(); setTimeout(() => { const f = document.querySelector('.document-navigator-v19 input'); if (f) { f.value = q; f.dispatchEvent(new Event('input', { bubbles: true })); } }, 60); };
      colB.append(all);
    }
    wrap.append(colA, colB);
    omniPanel.append(wrap);
  }
  function openOmni() {
    if (U.dialogOpen()) return;
    closeMenus();
    const s = getSelection();
    if (s.rangeCount && area.contains(s.anchorNode)) omniRange = s.getRangeAt(0).cloneRange();
    if (omniPanel.hidden) { omniPanel.hidden = false; omniInput.setAttribute('aria-expanded', 'true'); renderOmni(); placeOmni(); }
  }
  function closeOmni(restoreSel) {
    if (omniPanel.hidden) return;
    omniPanel.hidden = true;
    omniInput.setAttribute('aria-expanded', 'false');
    omniInput.value = '';
    omniInput.blur();
    if (restoreSel && omniRange) { try { getSelection().removeAllRanges(); getSelection().addRange(omniRange); } catch {} }
    omniRange = null;
  }
  function placeOmni() {
    const r = omni.getBoundingClientRect();
    const w = Math.min(980, window.innerWidth - 16);
    omniPanel.style.width = w + 'px';
    omniPanel.style.top = Math.round(r.bottom + 8) + 'px';
    omniPanel.style.left = Math.round(Math.max(8, Math.min(window.innerWidth - w - 8, r.left + r.width / 2 - w / 2))) + 'px';
  }
  function focusOmni() { omniInput.focus(); openOmni(); }
  omniInput.addEventListener('focus', openOmni);
  omniInput.addEventListener('click', openOmni);
  omniInput.addEventListener('input', () => { openOmni(); renderOmni(); });
  omniInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeOmni(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); omniPanel.querySelector('button:not([aria-disabled=true])')?.focus(); return; }
    if (e.key === 'Enter') { e.preventDefault(); omniPanel.querySelector('.sx-cmd:not([aria-disabled=true]), .sx-hit')?.click(); }
  });
  omniPanel.addEventListener('keydown', (e) => {
    const all = [...omniPanel.querySelectorAll('button:not([aria-disabled=true])')], i = all.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); closeOmni(true); return; }
    if (!['ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && i <= 0) omniInput.focus();
    else all[Math.min(all.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))]?.focus();
  });
  document.addEventListener('pointerdown', (e) => { if (!omniPanel.hidden && !omniPanel.contains(e.target) && !omni.contains(e.target)) closeOmni(false); }, true);
  const openSheet = focusOmni;

  /* ---------- View panel (V76 style: visual cards for A4 pages / Continuous) ---------- */
  function viewPanel(anchor) {
    if (openMenuEl?._anchor === anchor) { closeMenus(); return; }
    closeMenus();
    const p = runtime(U.el('div', 'sx-menu sx-viewpop'));
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Document layout');
    p._anchor = anchor;
    const head = U.el('div', 'sx-viewpop-head');
    const close = U.el('button', 'sx-btn sx-btn-text');
    close.type = 'button';
    close.append(icon('sidebar'), U.el('span', 'sx-label', 'Close'));
    close.onclick = () => { closeMenus(); anchor.focus(); };
    head.append(U.el('h3', '', 'Document layout'), close);
    p.append(head, U.el('span', 'sx-cap', 'Document views'));
    const cards = U.el('div', 'sx-viewcards');
    const card = (mode, ic, title, sub) => {
      const b = U.el('button', 'sx-viewcard');
      b.type = 'button';
      const on = (mode === 'continuous') === document.body.classList.contains('continuous-view');
      b.setAttribute('aria-pressed', String(on));
      const art = U.el('span', 'sx-viewcard-art');
      art.append(icon(ic));
      b.append(art, U.el('b', '', title), U.el('small', '', sub), U.el('span', 'sx-check', '✓'));
      b.onclick = () => { setDocumentView(mode); cards.querySelectorAll('.sx-viewcard').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); refreshSoon(); };
      return b;
    };
    cards.append(card('pages', 'a4', 'A4 pages', 'Separate pages'), card('continuous', 'continuous', 'Continuous', 'One scrolling surface'));
    p.append(cards);
    const zoomRow = U.el('div', 'sx-viewrow');
    const zbtn = (label, ic, fn, title) => { const b = U.el('button', 'sx-btn sx-btn-text'); b.type = 'button'; if (ic) b.append(icon(ic)); b.append(U.el('span', 'sx-label', label)); b.title = title || label; b.onclick = () => { fn(); zval.textContent = Math.round(zoomLevel * 100) + ' %'; }; return b; };
    const zval = U.el('span', 'sx-zoomval', Math.round(zoomLevel * 100) + ' %');
    zoomRow.append(zbtn('Fit width', 'fit', () => zoom('fit')), U.el('span', 'sx-flex'), zbtn('', 'zoomOut', () => zoom(-0.1), 'Zoom out (Ctrl+−)'), zval, zbtn('', 'zoomIn', () => zoom(0.1), 'Zoom in (Ctrl+=)'), zbtn('Reset', null, () => zoom(1), 'Zoom 100 % (Ctrl+0)'));
    p.append(zoomRow);
    p.append(U.el('span', 'sx-cap', 'Pages & layout'));
    const tools = U.el('div', 'sx-viewrow sx-viewtools');
    for (const id of ['layoutStudio', 'reflow', 'autoNumber', 'showMarks']) {
      const c = C.get(id);
      if (!c) continue;
      const b = button(id, { short: { layoutStudio: 'Layout Studio', reflow: 'Reflow pages', autoNumber: 'Auto numbers', showMarks: 'Marks ¶' }[id], cls: 'sx-chip-btn' });
      b.onclick = () => { closeMenus(); C.run(id); refreshSoon(); };
      b.disabled = !C.available(c);
      tools.append(b);
    }
    p.append(tools, U.el('p', 'sx-viewpop-foot', 'Esc to close'));
    p.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeMenus(); anchor.focus(); } });
    place(p, anchor);
    openMenuEl = p;
    anchor.setAttribute('aria-expanded', 'true');
    p.querySelector('.sx-viewcard[aria-pressed=true]')?.focus();
  }

  /* ---------- focus exit pill ---------- */
  const focusExit = runtime(U.el('button', 'sx-focus-exit'));
  focusExit.type = 'button';
  focusExit.append(icon('close'), U.el('span', '', 'Exit focus (Esc)'));
  focusExit.onclick = () => setFocus(false);

  /* ---------- status + state refresh ---------- */
  function refresh() {
    const s = EditorSession.get(), editing = U.isEditing();
    const title = SOPHIA.meta.title();
    titleEl.textContent = title;
    titleEl.title = title + ' · ' + data.id;
    const shortStatus = /^publish/i.test(data.status) ? 'Published' : /^draft/i.test(data.status) ? 'Draft' : String(data.status).split(/[\s·-]/)[0];
    versionChip.replaceChildren(U.el('b', '', 'V' + data.documentVersion), U.el('span', 'sx-chip-sub', shortStatus));
    versionChip.dataset.status = shortStatus.toLowerCase();
    versionChip.title = 'Document V' + data.documentVersion + ' · ' + data.status + ' (application SOPHIA ' + SOPHIA.engine + '). Open versions.';
    statusChip.replaceChildren();
    const dot = U.el('span', 'sx-dot');
    dot.setAttribute('aria-hidden', 'true');
    const state = s.pid ? (s.dirty ? 'dirty' : 'editing') : 'read';
    statusChip.dataset.state = state;
    statusChip.dataset.status = String(data.status).toLowerCase();
    const text = s.pid ? (s.dirty ? 'Unsaved · ' + s.pid : 'Editing · ' + s.pid) : SOPHIA.strings.readOnly;
    statusChip.append(dot, U.el('span', '', text), icon('chevron'));
    statusChip.setAttribute('aria-label', 'Status: ' + data.status + ', ' + text + '. Show details');
    editBtn.hidden = !!s.pid;
    saveSplit.hidden = !s.pid;
    saveMain.disabled = !(s.dirty || SOPHIA.migration?.pending);
    saveMain.title = saveMain.disabled ? 'No changes to save as a draft' : 'Save draft (Ctrl+S) — keeps V' + data.documentVersion;
    const modeName = (m) => ({ full: 'Full', mini: 'Mini', hide: 'Hide' })[m];
    const lbl = (text, short) => { const l = U.el('span', 'sx-label', text); l.dataset.short = short; return l; };
    ribbonBtn.replaceChildren(icon('edit'), lbl('Edit panel: ' + modeName(ribbonMode), modeName(ribbonMode)));
    ribbonBtn.title = 'Edit panel · next: ' + modeName({ full: 'mini', mini: 'hide', hide: 'full' }[ribbonMode]);
    ribbonBtn.hidden = !s.pid;
    mainBtn.replaceChildren(icon('ribbon'), lbl('Main panel: ' + modeName(mainMode), modeName(mainMode)));
    mainBtn.title = 'Main panel · next: ' + modeName({ full: 'mini', mini: 'hide', hide: 'full' }[mainMode]);
    const cont = document.body.classList.contains('continuous-view');
    viewBtn.replaceChildren(icon(cont ? 'continuous' : 'a4'), U.el('span', 'sx-label', 'View: ' + (cont ? 'Continuous' : 'A4 pages')));
    viewBtn.title = 'Document layout: A4 pages, Continuous, zoom, Layout Studio';
    canvasBtn.querySelector('.sx-label').textContent = 'Canvas: ' + (document.body.hasAttribute('data-jaom-light') ? 'Light' : 'Dark');
    /* Main panel shows what can be done now: edit-only tools appear while editing. */
    mainEl.querySelectorAll('[data-cmd]').forEach((b) => { const c = C.get(b.dataset.cmd); b.hidden = c?.id === 'edit' ? !!s.pid : !!(c?.editing && !s.pid); });
    mainEl.querySelectorAll('.sx-tile-main').forEach((t) => (t.hidden = !t.querySelector('[data-cmd]:not([hidden])')));
    document.body.classList.toggle('sx-has-ribbon', editing && ribbonMode !== 'hide');
    ribbon.hidden = !editing || ribbonMode === 'hide';
    for (const b of document.querySelectorAll('.sx-appbar [data-cmd], .sx-main [data-cmd], .sx-ribbon [data-cmd], .sx-side [data-cmd]')) {
      const c = C.get(b.dataset.cmd);
      if (!c) continue;
      if (b !== saveMain) b.disabled = !C.available(c);
      if (c.pressed) b.setAttribute('aria-pressed', String(!!c.pressed()));
    }
    for (const sel of ribbon.querySelectorAll('select')) sel.disabled = !editing;
    for (const inp of ribbon.querySelectorAll('input')) inp.disabled = !editing;
    updateFormatState();
    layout();
  }
  let rTimer = 0;
  const refreshSoon = () => { clearTimeout(rTimer); rTimer = setTimeout(refresh, 60); };
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
    const styleSel = ribbon.querySelector('select[data-ctl=style]');
    if (styleSel && inDoc && document.activeElement !== styleSel) {
      const blk = U.nodeOf(sel.anchorNode)?.closest('p,h2,h3,h4,blockquote,aside.warning,li,td,th');
      let v = 'p';
      if (blk?.matches('aside.warning')) v = /confirm/i.test(blk.querySelector(':scope > b')?.textContent || '') ? 'confirmation' : 'warning';
      else if (blk && /^(H2|H3|H4|BLOCKQUOTE)$/.test(blk.tagName)) v = blk.tagName.toLowerCase();
      styleSel.value = v;
    }
  }
  /* App bar → main panel → edit panel are stacked; their bottoms become CSS variables so the
     page and the side panel never hide under them. */
  function layout() {
    const focus = document.body.classList.contains('focusmode');
    const root = document.documentElement.style;
    const barBottom = focus ? 0 : Math.round(bar.getBoundingClientRect().bottom);
    root.setProperty('--sx-appbar', barBottom + 'px');
    const mainBottom = focus || mainEl.hidden ? barBottom : Math.round(mainEl.getBoundingClientRect().bottom);
    root.setProperty('--sx-main', mainBottom + 'px');
    const top = focus ? 0 : ribbon.hidden ? mainBottom : Math.round(ribbon.getBoundingClientRect().bottom);
    root.setProperty('--sx-top', top + 'px');
    document.body.dataset.side = side_.el.hidden ? 'closed' : 'open';
    if (!omniPanel.hidden) placeOmni();
  }

  /* ---------- keyboard ---------- */
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && !e.altKey && k === 'k') { e.preventDefault(); if (omniPanel.hidden || document.activeElement !== omniInput) focusOmni(); else closeOmni(true); return; }
    if (U.dialogOpen()) return;
    if (e.key === 'Escape' && document.body.classList.contains('focusmode')) { setFocus(false); return; }
    if (e.key === 'Escape' && openMenuEl) { closeMenus(); return; }
    if (mod && e.altKey && !e.shiftKey && k === 'm') { e.preventDefault(); C.run('addComment'); return; }
    if (mod && e.shiftKey && !e.altKey && k === 't') { e.preventDefault(); C.run('markTbc'); return; }
    if (mod && !e.shiftKey && !e.altKey && (k === '=' || k === '+')) { e.preventDefault(); zoom(0.1); return; }
    if (mod && !e.shiftKey && !e.altKey && k === '-') { e.preventDefault(); zoom(-0.1); return; }
    if (mod && !e.shiftKey && !e.altKey && k === '0') { e.preventDefault(); zoom(1); }
  });
  document.addEventListener('selectionchange', () => { clearTimeout(updateFormatState.t); updateFormatState.t = setTimeout(updateFormatState, 80); });

  /* ---------- wiring ---------- */
  let sTimer = 0;
  const sideSoon = () => { clearTimeout(sTimer); sTimer = setTimeout(() => { if (!side_.el.hidden && side_.name !== 'images') renderSide(); else badges(); }, 250); };
  SOPHIA.bus.on('session', refreshSoon);
  SOPHIA.bus.on('session', (s) => { if (s.pid !== sideSoon.pid) { sideSoon.pid = s.pid; renderRibbon(); sideSoon(); } });
  SOPHIA.bus.on('record-changed', () => { refreshSoon(); sideSoon(); });
  SOPHIA.bus.on('comments-changed', sideSoon);
  SOPHIA.bus.on('outline-changed', sideSoon);
  SOPHIA.bus.on('content-changed', sideSoon);
  SOPHIA.bus.on('view-changed', refreshSoon);
  SOPHIA.bus.on('commands-changed', () => { if (mounted) { renderRibbon(); renderMain(); refreshSoon(); } });

  let mounted = false;
  function mount() {
    if (pref.get('canvas', 'obsidian') === 'light') document.body.setAttribute('data-jaom-light', '');
    document.body.prepend(bar);
    bar.after(mainEl);
    mainEl.after(ribbon);
    document.body.append(omniPanel);
    renderMain();
    area.before(side_.el);
    document.body.append(focusExit);
    renderRibbon();
    mounted = true;
    if (zoomLevel !== 1) area.style.zoom = String(zoomLevel);
    else if (window.innerWidth < 820) requestAnimationFrame(() => { zoom('fit'); pref.set('zoom', '1'); });
    if (!side_.el.hidden) renderSide();
    refresh();
    new ResizeObserver(layout).observe(bar);
    new ResizeObserver(layout).observe(ribbon);
    new ResizeObserver(layout).observe(mainEl);
  }
  return { mount, refresh, side, setFocus, setCanvas, openSheet, focusOmni, menu, zoom, renderRibbon, renderMain, ribbonMode: () => ribbonMode, mainMode: () => mainMode, icon };
})();

/* ---------- legacy contract ---------- */
function side(name) { return SOPHIA.ui.side(name); }
window.side = side;
window.Workbench = {
  register: (id, label, group, run, editing) => SOPHIA.commands.register(id, label, group, run, editing, id === 'symbols' ? { icon: 'symbol' } : id === 'changes' ? { icon: 'changes' } : {}),
  run: (id) => SOPHIA.commands.run(id),
  list: () => SOPHIA.commands.all().map(({ id, label, group }) => ({ id, label, group })),
  openPalette: () => SOPHIA.ui.openSheet(),
  refresh: () => SOPHIA.ui.refresh()
};
