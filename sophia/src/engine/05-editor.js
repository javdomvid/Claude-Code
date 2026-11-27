/* ============================================================================
 * SOPHIA · 05-editor                                   layer: CORE
 * ----------------------------------------------------------------------------
 * PURPOSE  The editing surface: which regions are editable, the undo journal with caret
 *          restore, the clean/canonical content used to detect changes, the modal() helper,
 *          A4 / Continuous views, outline + statistics, paste routing and core shortcuts.
 * OWNS     SOPHIA.meta (identity fields by label), SOPHIA.canonical, SOPHIA.stats and the
 *          legacy editing globals listed in EXPORTS.
 * EXPORTS  SOPHIA.meta, SOPHIA.canonical, SOPHIA.stats, setEditable(), cleanContent(),
 *          mergeSheets(root), repaginate(), capture(), stepUndo(dir), modal(title, html, onOk,
 *          okLabel), setDocumentView('pages'|'continuous'), paginateDocument(), refreshOutline(),
 *          undoStates, undoPosition, muted, observer, selectedImage, pidSession,
 *          continuationTemplate · internal globals (do not use from other modules):
 *          EDITABLE_SELECTOR, textOf, undoTimer, caretOffset, restoreCaret, mergeContinuous,
 *          printWasContinuous
 * USES     SOPHIA.{util, bus, ask, print}, data, area, toast, normalizeBody, LayoutEngine,
 *          EditorCommands, EditorMedia, exportPID (at run time)
 * EMITS    content-changed, outline-changed, view-changed
 * RULES    - Undo states are page-independent: cleanContent() merges A4 sheets and drops
 *            contenteditable, so pagination never creates "phantom" undo steps.
 *          - `muted = true` while the engine itself rearranges the DOM (pagination).
 *          - Content changes made by features go through EditorTransactions.run, not here.
 * TESTS    tests/functional.cjs (undo, views, A4 overflow, paste)
 * ========================================================================== */

/* ---------- identity metadata, read by LABEL (never by row position) ---------- */
SOPHIA.meta = {
  cell(label, root = area) {
    const l = [...root.querySelectorAll('.identity .label')].find((n) => n.textContent.trim().toLowerCase() === String(label).toLowerCase());
    return l ? l.nextElementSibling : null;
  },
  get(label, root = area) {
    return (this.cell(label, root)?.textContent || '').trim();
  },
  title(root = area) {
    return this.get('Title', root) || root.querySelector('.qc-hero h1')?.textContent.trim() || data.id || 'Document';
  }
};

/* ---------- editable regions ---------- */
const EDITABLE_SELECTOR = {
  sop: '.pagecontent, .identity .value:not([data-version-cell])',
  'quick-card': '.pagecontent, .identity .value:not([data-version-cell]), .qc-hero h1, .qc-hero > p, .qc-hero > .eyebrow'
}[SOPHIA.profile];

function setEditable() {
  const on = document.body.classList.contains('editing') && !document.body.classList.contains('focusmode');
  area.querySelectorAll(EDITABLE_SELECTOR).forEach((n) => {
    n.contentEditable = on && !n.closest('[data-trace]') ? 'true' : 'false';
  });
  area.querySelectorAll('[data-trace] td, [data-version-cell], [data-sophia-toc]').forEach((n) => (n.contentEditable = 'false'));
}

/* ---------- clean content (undo states, snapshots) ---------- */
/* Undo states, recovery copies and comparisons use the MERGED document (one sheet), so
   recalculating A4 pages never counts as an edit (V78). After restoring such a state,
   call repaginate(). */
function mergeSheets(root) {
  const sheets = [...root.children].filter((n) => n.matches?.('.sheet'));
  if (sheets.length < 2) return root;
  const first = sheets[0].querySelector(':scope > .pagecontent');
  for (const sh of sheets.slice(1)) {
    const pc = sh.querySelector(':scope > .pagecontent');
    if (pc && first) first.append(...pc.childNodes);
    sh.remove();
  }
  const num = sheets[0].querySelector('.page-number');
  if (num) num.textContent = '1';
  return root;
}
function repaginate() {
  if (!document.body.classList.contains('continuous-view')) paginateDocument(false);
}
function cleanContent() {
  const c = mergeSheets(normalizeBody(area.cloneNode(true)));
  c.querySelectorAll('[style]').forEach((n) => {
    if (!n.getAttribute('style').trim()) n.removeAttribute('style');
  });
  /* editability is session state, not content: setEditable() re-applies it after a restore */
  c.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
  c.querySelectorAll('.selected').forEach((n) => n.classList.remove('selected'));
  c.querySelectorAll('[class=""]').forEach((n) => n.removeAttribute('class'));
  return c.innerHTML;
}
function textOf(markup) {
  const d = document.createElement('div');
  d.innerHTML = markup;
  return d.innerText || d.textContent || '';
}

/* Canonical form for "has the content changed?" — ignores block IDs, editing
   attributes, layout whitespace and the automatic trace/version cells. */
SOPHIA.canonical = function canonical(root = area) {
  const c = normalizeBody(root.cloneNode(true));
  c.querySelectorAll('[data-trace]').forEach((n) => n.remove());
  c.querySelectorAll('[data-version-cell]').forEach((n) => (n.textContent = 'VERSION'));
  c.querySelectorAll('a.xref[data-xref]').forEach((n) => { n.textContent = 'XREF'; n.classList.remove('xref-broken'); n.removeAttribute('title'); });
  c.querySelectorAll('[contenteditable],[data-block-id],[spellcheck],[data-num]').forEach((n) => {
    n.removeAttribute('contenteditable');
    n.removeAttribute('data-block-id');
    n.removeAttribute('spellcheck');
    n.removeAttribute('data-num');
  });
  c.querySelectorAll('.selected').forEach((n) => n.classList.remove('selected'));
  c.querySelectorAll('[style]').forEach((n) => {
    if (!n.getAttribute('style').trim()) n.removeAttribute('style');
  });
  c.querySelectorAll('img[data-asset]').forEach((n) => n.removeAttribute('data-asset'));
  const walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
  const blank = [];
  while (walker.nextNode()) {
    const t = walker.currentNode;
    if (!t.nodeValue.trim() && t.parentElement && /^(DIV|SECTION|MAIN|UL|OL|TABLE|TBODY|THEAD|TFOOT|TR|FIGURE)$/.test(t.parentElement.tagName)) blank.push(t);
  }
  blank.forEach((t) => t.remove());
  const body = [...c.querySelectorAll('.qc-hero, .pagecontent')]
    .map((n) => {
      const x = n.cloneNode(true);
      x.querySelectorAll('.identity').forEach((t) => t.remove());
      return x.innerHTML;
    })
    .join('');
  const meta = [...c.querySelectorAll('.identity .value')].map((n) => n.textContent.trim());
  return JSON.stringify({ body, meta });
};

/* ---------- undo journal ---------- */
const undoStates = [];
let undoPosition = -1;
let undoTimer = 0;
let muted = false;
let selectedImage = null;
let pidSession = null; /* mirror of EditorSession.get().pid for legacy modules */

function capture() {
  if (muted) return;
  const v = cleanContent();
  if (undoStates[undoPosition] === v) {
    window.EditorSession?.changed();
    return;
  }
  undoStates.splice(undoPosition + 1);
  undoStates.push(v);
  if (undoStates.length > 60) undoStates.shift();
  undoPosition = undoStates.length - 1;
  window.EditorSession?.changed();
  SOPHIA.bus.emit('content-changed');
}
function caretOffset() {
  const s = getSelection();
  if (!s.rangeCount || !area.contains(s.focusNode)) return null;
  const r = document.createRange();
  r.selectNodeContents(area);
  r.setEnd(s.focusNode, s.focusOffset);
  return r.toString().length;
}
function restoreCaret(off) {
  if (off == null || !SOPHIA.util.isEditing()) return;
  const w = document.createTreeWalker(area, NodeFilter.SHOW_TEXT);
  let n, pos = 0, last = null;
  while ((n = w.nextNode())) {
    const host = SOPHIA.util.nodeOf(n).closest('[contenteditable=true]');
    if (host) {
      last = n;
      if (pos + n.length >= off) break;
    }
    pos += n.length;
    n = null;
  }
  const t = n || last;
  if (!t) return;
  SOPHIA.util.nodeOf(t).closest('[contenteditable=true]')?.focus({ preventScroll: true });
  const r = document.createRange();
  r.setStart(t, Math.max(0, Math.min(t.length, n ? off - pos : t.length)));
  r.collapse(true);
  const s = getSelection();
  s.removeAllRanges();
  s.addRange(r);
}
function stepUndo(direction) {
  if (document.body.classList.contains('focusmode')) return;
  clearTimeout(undoTimer);
  if (direction < 0) capture();
  const target = undoPosition + direction;
  if (target < 0 || target >= undoStates.length) {
    toast('No further history in this session');
    return;
  }
  const caret = caretOffset();
  muted = true;
  undoPosition = target;
  area.innerHTML = undoStates[target];
  setEditable();
  muted = false;
  repaginate();
  restoreCaret(caret);
  window.EditorMedia?.clear();
  window.EditorSession?.changed();
  SOPHIA.bus.emit('content-changed');
  refreshOutline();
  toast(direction < 0 ? 'Undone' : 'Redone');
}
const observer = new MutationObserver(() => {
  if (muted) return;
  clearTimeout(undoTimer);
  undoTimer = setTimeout(capture, 650);
});
observer.observe(area, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style'] });

/* ---------- modal (legacy contract: modal(title, html, action, label)) ---------- */
function modal(title, content, action, label = 'Apply') {
  document.querySelectorAll('dialog.legacy-modal').forEach((n) => n.close('superseded'));
  const origin = document.activeElement;
  const veil = document.createElement('dialog');
  veil.className = 'modalveil legacy-modal';
  veil.dataset.runtime = '';
  veil.setAttribute('aria-label', title);
  const d = SOPHIA.util.el('div', 'dialog');
  d.append(SOPHIA.util.el('h2', '', title));
  const body = document.createElement('div');
  body.innerHTML = content;
  d.append(body);
  const actions = SOPHIA.util.el('div', 'actions');
  const cancel = SOPHIA.util.el('button', '', 'Cancel');
  cancel.type = 'button';
  const ok = SOPHIA.util.el('button', 'primary', label);
  ok.type = 'button';
  cancel.onclick = () => veil.close('cancel');
  ok.onclick = () => action(veil);
  actions.append(cancel, ok);
  d.append(actions);
  veil.append(d);
  let restored = false;
  const restoreFocus = () => {
    if (restored) return;
    restored = true;
    if (origin?.isConnected) origin.focus({ preventScroll: true });
  };
  veil.addEventListener('cancel', (e) => {
    e.preventDefault();
    veil.close('cancel');
  });
  veil.addEventListener('close', () => {
    veil.remove();
    restoreFocus();
  }, { once: true });
  const remove = veil.remove.bind(veil);
  veil.remove = () => {
    remove();
    restoreFocus();
  };
  veil.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && ['s', 'z', 'y', 'p'].includes(e.key.toLowerCase())) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  document.body.append(veil);
  veil.showModal();
  (body.querySelector('input:not([type=hidden]),select,textarea,button') || cancel).focus();
  return veil;
}

/* ---------- outline + stats ---------- */
function refreshOutline() {
  SOPHIA.bus.emit('outline-changed');
}
SOPHIA.stats = function stats() {
  const text = textOf(cleanContent()).trim();
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  const pages = area.querySelectorAll('.sheet').length;
  return { words, pages, continuous: document.body.classList.contains('continuous-view') };
};

/* ---------- views: A4 pages / Continuous (legacy contract) ---------- */
let continuationTemplate = null;
function paginateDocument(notify = false) {
  if (!window.LayoutEngine) return;
  if (notify) {
    window.LayoutStudio?.open();
    return;
  }
  return LayoutEngine.reflow(false);
}
function mergeContinuous() {
  if (window.LayoutEngine) return LayoutEngine.merge();
}
function setDocumentView(mode) {
  clearTimeout(undoTimer);
  const y = window.scrollY;
  document.body.classList.toggle('continuous-view', mode === 'continuous');
  if (mode === 'continuous') mergeContinuous();
  else paginateDocument(false);
  try { localStorage.setItem('sophia:pref:view', mode); } catch {}
  SOPHIA.bus.emit('view-changed', mode);
  refreshOutline();
  window.scrollTo(0, y);
}

/* ---------- printing from the browser menu (Ctrl+P is routed to Print Studio) ---------- */
let printWasContinuous = false;
window.addEventListener('beforeprint', () => {
  printWasContinuous = document.body.classList.contains('continuous-view');
  document.body.classList.remove('continuous-view');
  if (document.fonts?.status !== 'loading' && [...area.querySelectorAll('img')].every((i) => i.complete)) paginateDocument(false);
  SOPHIA.print?.injectBrowserPrintFrame();
});
window.addEventListener('afterprint', () => {
  SOPHIA.print?.removeBrowserPrintFrame();
  if (printWasContinuous) setDocumentView('continuous');
  printWasContinuous = false;
});

/* ---------- paste: images → EditorMedia, rich HTML → SophiaPaste, else plain text ---------- */
area.addEventListener('paste', (e) => {
  const files = [...e.clipboardData.files].filter((f) => ['image/png', 'image/jpeg', 'image/webp'].includes(f.type));
  e.preventDefault();
  if (files.length) {
    EditorMedia.importFiles(files);
    return;
  }
  if (window.SophiaPaste?.handle(e)) return;
  EditorCommands.command('insertText', e.clipboardData.getData('text/plain'));
});

/* ---------- selection memory + image selection ---------- */
area.addEventListener('click', (e) => {
  area.querySelectorAll('img.selected').forEach((x) => x.classList.remove('selected'));
  selectedImage = e.target.tagName === 'IMG' && e.target.closest('.pagecontent') ? e.target : null;
  if (selectedImage) {
    selectedImage.classList.add('selected');
    SOPHIA.ask.panel('images');
  }
});

/* ---------- core shortcuts (dialogs block S/Z/Y/P themselves) ---------- */
document.addEventListener('keydown', (e) => {
  if (SOPHIA.util.dialogOpen()) return;
  const k = (e.key || '').toLowerCase();
  const mod = e.ctrlKey || e.metaKey;
  if (mod && !e.shiftKey && !e.altKey && k === 's') {
    e.preventDefault();
    exportPID('Draft');
  } else if (mod && !e.shiftKey && !e.altKey && k === 'p') {
    e.preventDefault();
    window.PrintStudio42?.open();
  } else if (mod && k === 'z' && document.body.classList.contains('editing')) {
    e.preventDefault();
    stepUndo(e.shiftKey ? 1 : -1);
  } else if (mod && k === 'y' && document.body.classList.contains('editing')) {
    e.preventDefault();
    stepUndo(1);
  }
});

/* ---------- leaving with unsaved work ---------- */
window.addEventListener('beforeunload', (e) => {
  if (window.EditorSession?.get().dirty) {
    e.preventDefault();
    e.returnValue = '';
  }
});

/* Intro creates <p>, not <div>. */
try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch {}
