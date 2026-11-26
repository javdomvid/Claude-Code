/* ============================================================================
 * SOPHIA · 73-view                                     layer: SHELL (how you look at it)
 * ----------------------------------------------------------------------------
 * PURPOSE  Zoom, focus reading, light/obsidian canvas and the View panel popover
 *          (A4 pages / Continuous cards, zoom row, page tools).
 * OWNS     SOPHIA.ui.view; the focus-exit pill; prefs "zoom" and "canvas".
 * EXPORTS  SOPHIA.ui.view.{zoom(step|'fit'|1), zoomLevel(), setFocus(on), setCanvas(light),
 *          panel(anchor), focusExit (element)}
 * USES     SOPHIA.ui.kit, SOPHIA.commands, setDocumentView, setEditable, EditorSession,
 *          SOPHIA.ui.{refresh, layout} (late)
 * DOM      .sx-viewpop popover (data-runtime), button.sx-focus-exit (mounted by 79-shell)
 * RULES    The page view itself (A4 pagination / continuous) belongs to 05-editor +
 *          30-layout-engine; this module only offers the controls.
 *          Style: styles/ui/73-view.css.
 * TESTS    tests/functional.cjs (View panel, zoom) · tools/snapshot.cjs read-view-panel
 * ========================================================================== */
SOPHIA.ui.view = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const { pref, icon, runtime, button, refreshSoon, closeMenus, place, trackPopover, popoverFor } = SOPHIA.ui.kit;
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
    SOPHIA.ui.refresh();
  }
  function setFocus(on) {
    document.body.classList.toggle('focusmode', !!on);
    if (on) { closeMenus(); setEditable(); toast('Focus reading. Press Esc to return.'); }
    else setEditable();
    EditorSession.refresh();
    SOPHIA.ui.layout();
  }
  function setCanvas(light) {
    if (light) document.body.setAttribute('data-jaom-light', ''); else document.body.removeAttribute('data-jaom-light');
    pref.set('canvas', light ? 'light' : 'obsidian');
    SOPHIA.ui.refresh();
  }

  /* ---------- View panel (V76 style: visual cards for A4 pages / Continuous) ---------- */
  function viewPanel(anchor) {
    if (popoverFor(anchor)) { closeMenus(); return; }
    closeMenus();
    const p = runtime(U.el('div', 'sx-menu sx-viewpop'));
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Document layout');
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
    trackPopover(p, anchor);
    p.querySelector('.sx-viewcard[aria-pressed=true]')?.focus();
  }

  /* ---------- focus exit pill ---------- */
  const focusExit = runtime(U.el('button', 'sx-focus-exit'));
  focusExit.type = 'button';
  focusExit.append(icon('close'), U.el('span', '', 'Exit focus (Esc)'));
  focusExit.onclick = () => setFocus(false);

  return { zoom, zoomLevel: () => zoomLevel, setFocus, setCanvas, panel: viewPanel, focusExit };
})();
