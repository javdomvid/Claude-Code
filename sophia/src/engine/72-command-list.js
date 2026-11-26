/* ============================================================================
 * SOPHIA · 72-command-list                            layer: SHELL (what you can do)
 * ----------------------------------------------------------------------------
 * PURPOSE  The core list of commands (id, English label, group, icon, shortcut) and
 *          the few tiny actions that have no module of their own (word count, about,
 *          page break, plain paste, firmware viewer).
 * OWNS     the command ids below. WHERE a command appears is decided elsewhere:
 *          76-main-panel (MAIN), 77-edit-panel (RIBBON), 75-omnibox (SHEET),
 *          74-appbar (bar buttons, save menu).
 * EXPORTS  nothing (registers into SOPHIA.commands)
 * USES     EditorCommands, EditorSession, EditorMedia, SOPHIA.{tables, blocks, qc, docx,
 *          proposals, compare, comments, tbc, find, numbering, persist, versions, stats},
 *          PrintStudio42, LayoutStudio, TableFlow, ImageLibrary, DocumentReview,
 *          BlockIdentity, SophiaFlow, openHistoryStudio, exportPID, downloadCurrentCopy,
 *          setDocumentView, modal, side, SOPHIA.ui.{view, sidePanel, editPanel, mainPanel}
 *          (all called only when the command RUNS, so load order does not matter)
 * RULES    - Add a command with R(id, 'Label', 'Group', 'icon', run, editingOnly, extra).
 *          - Keep the run function a one-liner that calls the owning module.
 *          - Then place the id in MAIN / RIBBON / SHEET, add the Spanish (and other
 *            languages) label to 08-i18n / 09-lang-*, and a check to the tests.
 * TESTS    tests/functional.cjs
 * ========================================================================== */
(() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const V = () => SOPHIA.ui.view;
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
  R('insertTable', 'Table…', 'Insert', 'table', () => SOPHIA.tables.picker(SOPHIA.ui.kit.invoker()), true);
  R('decisionTable', 'Decision table', 'Insert', 'table', () => SOPHIA.tables.decisionTable(), true, { profile: 'quick-card' });
  // contextual Table tab (V78 · V2): shown while the caret is in a body table
  const inTable = () => !!SOPHIA.tables.here();
  const T = (id, label, icon, fn) => R(id, label, 'Table', icon, fn, true, { when: inTable, why: 'Place the cursor in a table cell first.' });
  T('rowAbove', 'Insert row above', 'rowAbove', () => SOPHIA.tables.row(false));
  T('rowBelow', 'Insert row below', 'rowBelow', () => SOPHIA.tables.row(true));
  T('colLeft', 'Insert column left', 'colLeft', () => SOPHIA.tables.column(false));
  T('colRight', 'Insert column right', 'colRight', () => SOPHIA.tables.column(true));
  T('deleteRow', 'Delete row', 'deleteRow', () => SOPHIA.tables.deleteRow());
  T('deleteCol', 'Delete column', 'deleteCol', () => SOPHIA.tables.deleteColumn());
  T('deleteTable', 'Delete table', 'discard', () => SOPHIA.tables.deleteTable());
  T('headerRow', 'Header row on / off', 'headerRow', () => SOPHIA.tables.toggleHeader());
  T('equalCols', 'Equal column widths', 'equalCols', () => SOPHIA.tables.equalColumns());
  T('shadeHeader', 'Shade: header grey', 'shade', () => SOPHIA.tables.shade('header'));
  T('shadeAttention', 'Shade: attention amber', 'shade', () => SOPHIA.tables.shade('attention'));
  T('shadeConfirmed', 'Shade: confirmed green', 'shade', () => SOPHIA.tables.shade('confirmed'));
  T('shadeNone', 'Clear shading', 'clear', () => SOPHIA.tables.shade(null));
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
  R('zoomFit', 'Fit width', 'View', 'fit', () => V().zoom('fit'));
  R('zoomOut', 'Zoom out', 'View', 'zoomOut', () => V().zoom(-0.1), false, { keys: 'Ctrl+−' });
  R('zoomIn', 'Zoom in', 'View', 'zoomIn', () => V().zoom(0.1), false, { keys: 'Ctrl+=' });
  R('zoomReset', 'Zoom 100 %', 'View', 'a4', () => V().zoom(1));
  R('focus', 'Focus reading', 'View', 'focus', () => V().setFocus(true));
  R('canvas', 'Light / obsidian canvas', 'View', 'canvas', () => V().setCanvas(!document.body.hasAttribute('data-jaom-light')), false, { pressed: () => document.body.hasAttribute('data-jaom-light') });
  R('sidebar', 'Show / hide side panel', 'View', 'sidebar', () => SOPHIA.ui.sidePanel.toggle(), false, { pressed: () => !SOPHIA.ui.sidePanel.el.hidden });
  R('ribbonMode', 'Edit panel: Full / Mini / Hide', 'View', 'edit', () => SOPHIA.ui.editPanel.cycle(), true);
  R('mainMode', 'Main panel: Full / Mini / Hide', 'View', 'ribbon', () => SOPHIA.ui.mainPanel.cycle());
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
  R('find', 'Find', 'Review', 'find', () => SOPHIA.find.open(), false, { keys: 'Ctrl+F' });
  R('replace', 'Find & replace', 'Review', 'replace', () => SOPHIA.find.open(undefined, true), true, { keys: 'Ctrl+H' });
  R('wordCount', 'Word count', 'Review', 'words', wordCount);
  R('outline', 'Outline panel', 'Review', 'outline', () => side('outline'));
  R('showMarks', 'Show paragraph marks', 'Review', 'marks', () => { document.body.classList.toggle('showmarks'); SOPHIA.ui.refresh(); }, false, { pressed: () => document.body.classList.contains('showmarks') });
  R('shortcuts', 'Keyboard shortcuts', 'Help', 'keyboard', () => SophiaFlow.openHelp(), false, { keys: 'F1' });
  R('about', 'About this file', 'Help', 'info', about);
  R('language', 'Interface language: English / Español', 'View', 'lang', () => SOPHIA.i18n.set(SOPHIA.i18n.lang === 'es' ? 'en' : 'es'));

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
    modal('About this file', '<dl class="sx-dl"><dt>Application</dt><dd>SOPHIA ' + SOPHIA.engine + ' · ' + SOPHIA.strings.profileLabel[SOPHIA.profile] + ' editor</dd><dt>Document</dt><dd data-f="id"></dd><dt>Document version</dt><dd>V' + U.escapeHTML(data.documentVersion) + ' · ' + U.escapeHTML(data.status) + '</dd><dt>Last revision</dt><dd data-f="last"></dd><dt>Revisions in file</dt><dd>' + data.revisions.length + '</dd><dt>File format</dt><dd>' + U.escapeHTML(data.format || 'not yet saved as sophia/77') + '</dd></dl><p class="muted">The application version (' + SOPHIA.engine + ') and the document version (V' + U.escapeHTML(data.documentVersion) + ') are independent. Save draft keeps the number; Publish & save adds 0.01; Big Validation moves to the next major.</p>', (v) => v.remove(), 'Close')
      .querySelector('[data-f="id"]').textContent = data.id;
    document.querySelector('dialog.legacy-modal [data-f="last"]').textContent = last ? SOPHIA.versions.label(last) + ' · ' + String(last.date).slice(0, 10) + ' · ' + (last.editorPID || last.author || '') : '—';
  }
  function showDoc(id, title) {
    const text = document.getElementById(id)?.textContent || '(missing)';
    const v = modal(title, '<pre class="sx-doc"></pre>', () => { navigator.clipboard?.writeText(text).then(() => toast('Copied.'), () => toast('Select the text and copy it.')); }, 'Copy');
    v.querySelector('.sx-doc').textContent = text.trim();
  }
})();
