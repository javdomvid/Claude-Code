/* ============================================================================
 * SOPHIA · 99-boot
 * Start-up order (every step is idempotent; nothing here edits the wording):
 *   1. Older file (record.format ≠ "sophia/77")  → migration transforms
 *      (block IDs, typed heading numbers → automatic, header trace row). The
 *      result is recorded as a "Migration" revision at the next save.
 *      Current file → only make sure every block has an ID (silent).
 *   2. Heading numbers, header, view (A4 pages / continuous), editability.
 *   3. Interface (70-shell), comment highlights, undo baseline.
 *   4. When DM Sans has loaded, calculate the A4 pages (font metrics matter).
 * ========================================================================== */
(() => {
  'use strict';
  const quiet = (fn) => {
    const old = muted;
    muted = true;
    try { return fn(); } finally { observer.takeRecords(); muted = old; }
  };
  try {
    if (data.format !== 'sophia/77') {
      SOPHIA.migration.pending = quiet(() => SOPHIA.persist.runMigrationTransforms('Engine upgrade to SOPHIA ' + SOPHIA.engine));
    } else {
      quiet(() => SOPHIA.ids.ensure());
    }
    quiet(() => {
      SOPHIA.numbering.apply();
      SOPHIA.persist.applyHeader(area, data);
      SOPHIA.blocks.refreshToc(false);
    });
  } catch (e) {
    console.error('SOPHIA boot: migration step failed', e);
    toast('Start-up check failed: ' + e.message + '. The document is shown as saved; please report this.', { tone: 'error', ms: 8000 });
  }

  let view = 'pages';
  try { view = localStorage.getItem('sophia:pref:view') === 'continuous' ? 'continuous' : 'pages'; } catch {}
  /* A4 pages are calculated once the embedded font is ready (step 4); until then the
     document shows as one sheet, which is also its saved form. */
  if (view === 'continuous') quiet(() => setDocumentView('continuous'));
  setEditable();
  SOPHIA.ui.mount();
  SOPHIA.i18n.start();
  SOPHIA.comments.paint();

  undoStates.splice(0);
  undoStates.push(cleanContent());
  undoPosition = 0;
  EditorSession.rebase();
  SOPHIA.recordDirty = false;
  EditorSession.refresh();

  if (SOPHIA.migration.pending) {
    toast('This file was upgraded to SOPHIA ' + SOPHIA.engine + '. Start editing and Save draft to keep the upgrade (wording unchanged).', { ms: 7000 });
  }
  const settle = () => {
    if (document.body.classList.contains('continuous-view')) return;
    quiet(() => paginateDocument(false));
    SOPHIA.bus.emit('view-changed', 'pages');
    undoStates.splice(0, undoStates.length, cleanContent());
    undoPosition = 0;
    EditorSession.rebase();
    SOPHIA.bus.emit('outline-changed');
  };
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load('14px "DM Sans"'), document.fonts.load('bold 14px "DM Sans"'), document.fonts.load('italic 14px "DM Sans"')]).then(() => document.fonts.ready)
    : Promise.resolve();
  Promise.race([fontsReady, new Promise((r) => setTimeout(r, 3000))]).then(() => requestAnimationFrame(settle));
  document.documentElement.dataset.sophiaReady = 'true';
  SOPHIA.bus.emit('ready');
})();
