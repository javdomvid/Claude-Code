/* ============================================================================
 * SOPHIA · 79-shell                                    layer: SHELL (assembly)
 * ----------------------------------------------------------------------------
 * PURPOSE  Puts the interface parts together and keeps them in step:
 *          mount order · one refresh() for every part · stacked layout variables ·
 *          global keyboard shortcuts · bus wiring · × close on every studio window.
 * OWNS     SOPHIA.ui public API; STUDIOS (which dialogs get the studio × close);
 *          the legacy globals side() and Workbench.
 * EXPORTS  SOPHIA.ui.{mount, refresh, layout, side, setFocus, setCanvas, openSheet,
 *          focusOmni, menu, zoom, renderRibbon, renderMain, ribbonMode, mainMode, icon}
 *          window.side(name), window.Workbench {register, run, list, openPalette, refresh}
 * USES     SOPHIA.ui.{kit, view, appbar, omnibox, mainPanel, editPanel, sidePanel},
 *          SOPHIA.commands, SOPHIA.bus, EditorSession, area
 * LISTENS  session, record-changed, comments-changed, outline-changed, content-changed,
 *          view-changed, lang-changed, commands-changed
 * DOM      mounts: header.sx-appbar → div.sx-main → div.sx-ribbon (top of <body>),
 *          aside.sx-side (before #document), omnibox panel + focus pill (end of body).
 * RULES    - Parts never call each other's internals: they go through SOPHIA.ui.<part>.
 *          - Anything that changes what buttons should show calls SOPHIA.ui.refresh()
 *            (or kit.refreshSoon()); refresh asks every part to update itself.
 *          - A new studio window joins the family: add its selector to STUDIOS here
 *            and to styles/ui/98-studio-family.css.
 * TESTS    tests/functional.cjs · tools/snapshot.cjs
 * ========================================================================== */
(() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands, ui = SOPHIA.ui;
  const { pref, runtime, closeMenus, hasPopover, refreshSoon, menu, icon } = ui.kit;
  const { view, appbar, omnibox, mainPanel, editPanel, sidePanel } = ui;

  /* ---------- studio chrome (V78 · U): every studio window gets the same × close ----------
     The × sends the dialog's own "cancel" event, so each studio keeps its close rules
     (unsaved changes, rollback). Look: «studio family» in dialogs.css. */
  const STUDIOS = '#p42-print, .layout-studio-v27, .table-studio-v26, .table-flow-v28, .media-dialog, .image-library-v23, .review-workspace-v22, .structure-v25, .command-dialog, .sv76-dialog';
  function addClose(d) {
    if (!d.matches?.(STUDIOS) || d.querySelector(':scope .sx-x')) return;
    const head = d.querySelector(':scope > header, :scope > form > header') || d.firstElementChild;
    if (!head) return;
    const x = U.el('button', 'sx-x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    x.title = 'Close (Esc)';
    x.onclick = () => {
      const ev = new Event('cancel', { cancelable: true });
      if (d.dispatchEvent(ev) && d.open) d.close();
    };
    head.append(x);
  }
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1 && n.tagName === 'DIALOG') queueMicrotask(() => addClose(n));
  }).observe(document.body, { childList: true });

  /* ---------- one refresh for every part ---------- */
  function refresh() {
    const s = EditorSession.get(), editing = U.isEditing();
    appbar.refresh(s);
    mainPanel.refresh(s);
    editPanel.refresh(editing);
    /* Generic pass: every command button follows its command (available? pressed?).
       A button marked data-own-state decides its enabled state itself. */
    for (const b of document.querySelectorAll('.sx-appbar [data-cmd], .sx-main [data-cmd], .sx-ribbon [data-cmd], .sx-side [data-cmd]')) {
      const c = C.get(b.dataset.cmd);
      if (!c) continue;
      if (!('ownState' in b.dataset)) b.disabled = !C.available(c);
      if (c.pressed) b.setAttribute('aria-pressed', String(!!c.pressed()));
    }
    editPanel.updateFormatState();
    layout();
  }

  /* App bar → main panel → edit panel are stacked; their bottoms become CSS variables so the
     page and the side panel never hide under them. */
  function layout() {
    const focus = document.body.classList.contains('focusmode');
    const root = document.documentElement.style;
    const barBottom = focus ? 0 : Math.round(appbar.el.getBoundingClientRect().bottom);
    root.setProperty('--sx-appbar', barBottom + 'px');
    const mainBottom = focus || mainPanel.el.hidden ? barBottom : Math.round(mainPanel.el.getBoundingClientRect().bottom);
    root.setProperty('--sx-main', mainBottom + 'px');
    const top = focus ? 0 : editPanel.el.hidden ? mainBottom : Math.round(editPanel.el.getBoundingClientRect().bottom);
    root.setProperty('--sx-top', top + 'px');
    document.body.dataset.side = sidePanel.el.hidden ? 'closed' : 'open';
    if (omnibox.isOpen()) omnibox.place();
  }
  addEventListener('resize', () => { closeMenus(); layout(); });

  /* ---------- global keyboard shortcuts of the interface ---------- */
  document.addEventListener('keydown', (e) => {
    const k = (e.key || '').toLowerCase(), mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && !e.altKey && k === 'k') { e.preventDefault(); if (!omnibox.isOpen() || document.activeElement !== omnibox.input) omnibox.focus(); else omnibox.close(true); return; }
    if (U.dialogOpen()) return;
    if (e.key === 'Escape' && document.body.classList.contains('focusmode')) { view.setFocus(false); return; }
    if (e.key === 'Escape' && hasPopover()) { closeMenus(); return; }
    if (mod && e.altKey && !e.shiftKey && k === 'm') { e.preventDefault(); C.run('addComment'); return; }
    if (mod && e.shiftKey && !e.altKey && k === 't') { e.preventDefault(); C.run('markTbc'); return; }
    if (mod && !e.shiftKey && !e.altKey && (k === '=' || k === '+')) { e.preventDefault(); view.zoom(0.1); return; }
    if (mod && !e.shiftKey && !e.altKey && k === '-') { e.preventDefault(); view.zoom(-0.1); return; }
    if (mod && !e.shiftKey && !e.altKey && k === '0') { e.preventDefault(); view.zoom(1); }
  });

  /* ---------- bus wiring: document events → interface updates ---------- */
  let sTimer = 0;
  const sideSoon = () => { clearTimeout(sTimer); sTimer = setTimeout(() => { if (!sidePanel.el.hidden && !['images', 'find'].includes(sidePanel.current())) sidePanel.render(); else sidePanel.badges(); }, 250); };
  SOPHIA.bus.on('session', refreshSoon);
  SOPHIA.bus.on('session', (s) => { if (s.pid !== sideSoon.pid) { sideSoon.pid = s.pid; mainPanel.forSession(!!s.pid); editPanel.render(); sideSoon(); } });
  SOPHIA.bus.on('record-changed', () => { refreshSoon(); sideSoon(); });
  SOPHIA.bus.on('comments-changed', sideSoon);
  SOPHIA.bus.on('outline-changed', sideSoon);
  SOPHIA.bus.on('content-changed', sideSoon);
  SOPHIA.bus.on('view-changed', refreshSoon);
  SOPHIA.bus.on('lang-changed', () => { mainPanel.render(); editPanel.render(); if (!sidePanel.el.hidden) sidePanel.render(); refresh(); });
  SOPHIA.bus.on('commands-changed', () => { if (mounted) { editPanel.render(); mainPanel.render(); refreshSoon(); } });

  /* ---------- mount (called once by 99-boot) ---------- */
  let mounted = false;
  function mount() {
    if (pref.get('canvas', 'obsidian') === 'light') document.body.setAttribute('data-jaom-light', '');
    appbar.el.append(appbar.ident, omnibox.el, appbar.actions);
    document.body.prepend(appbar.el);
    appbar.el.after(mainPanel.el);
    mainPanel.el.after(editPanel.el);
    document.body.append(omnibox.panel);
    mainPanel.render();
    area.before(sidePanel.el);
    document.body.append(view.focusExit);
    editPanel.render();
    mounted = true;
    if (view.zoomLevel() !== 1) area.style.zoom = String(view.zoomLevel());
    else if (window.innerWidth < 820) requestAnimationFrame(() => { view.zoom('fit'); pref.set('zoom', '1'); });
    if (!sidePanel.el.hidden) sidePanel.render();
    refresh();
    new ResizeObserver(layout).observe(appbar.el);
    new ResizeObserver(layout).observe(editPanel.el);
    new ResizeObserver(layout).observe(mainPanel.el);
  }

  Object.assign(ui, {
    mount, refresh, layout,
    side: sidePanel.show,
    setFocus: view.setFocus,
    setCanvas: view.setCanvas,
    openSheet: omnibox.focus,
    focusOmni: omnibox.focus,
    menu,
    zoom: view.zoom,
    renderRibbon: editPanel.render,
    renderMain: mainPanel.render,
    ribbonMode: editPanel.mode,
    mainMode: mainPanel.mode,
    icon
  });
})();

/* ---------- legacy contract (older modules call these globals) ---------- */
function side(name) { return SOPHIA.ui.side(name); }
window.side = side;
window.Workbench = {
  register: (id, label, group, run, editing) => SOPHIA.commands.register(id, label, group, run, editing, id === 'symbols' ? { icon: 'symbol' } : id === 'changes' ? { icon: 'changes' } : {}),
  run: (id) => SOPHIA.commands.run(id),
  list: () => SOPHIA.commands.all().map(({ id, label, group }) => ({ id, label, group })),
  openPalette: () => SOPHIA.ui.openSheet(),
  refresh: () => SOPHIA.ui.refresh()
};
