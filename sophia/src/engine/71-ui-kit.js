/* ============================================================================
 * SOPHIA · 71-ui-kit                                 layer: SHELL (building blocks)
 * ----------------------------------------------------------------------------
 * PURPOSE  The small pieces every interface part is made of, so all panels look and
 *          behave the same: preferences, icons, command buttons, menus/popovers.
 * OWNS     SOPHIA.ui (namespace, created here) and SOPHIA.ui.kit.
 * EXPORTS  SOPHIA.ui.kit.{pref, icon, ICONS, GLYPH, runtime, button, invoker,
 *          refreshSoon, menu, place, closeMenus, trackPopover, popoverFor, hasPopover}
 *          SOPHIA.ui.icon (kept for older callers)
 * USES     SOPHIA.commands, SOPHIA.util, area (global), SOPHIA.ui.refresh (late)
 * DOM      creates nothing by itself; menus are appended to <body> with data-runtime.
 * RULES    - Build a command button ONLY with kit.button(id, opts): it carries the
 *            label, tooltip, shortcut, aria and pressed state from the registry.
 *          - Only one menu/popover is open at a time (closeMenus closes it).
 *          - New icon: add a 24×24 stroke path to ICONS (one family, currentColor).
 *          - Style: styles/ui/71-ui-kit.css.
 * TESTS    tests/functional.cjs · tools/snapshot.cjs (all states)
 * ========================================================================== */
SOPHIA.ui = { kit: null };
SOPHIA.ui.kit = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  /* Per-browser interface preferences (never saved in the document). */
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
    outline: 'M4 6h16M8 12h12M12 18h8', lang: 'M3 5h12M9 3v2M5 5c1 4 4 7 8 8M13 5c-1 4-4 7-8 8M12 21l5-10 5 10M14 17h6', chevron: 'M6 9l6 6 6-6', close: 'M6 6l12 12M18 6 6 18', info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
    brief: 'M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-5a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h6z', card: 'M3 6h18v12H3zM7 10h6M7 14h10', pending: 'M3 6h18v12H3zM12 9v3M12 15h.01',
    marks: 'M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13',
    rowAbove: 'M3 12h18v8H3zM3 16h18M12 3v6M9 6h6', rowBelow: 'M3 4h18v8H3zM3 8h18M12 15v6M9 18h6', colLeft: 'M12 3h8v18h-8zM16 3v18M3 12h6M6 9v6', colRight: 'M4 3h8v18H4zM8 3v18M15 12h6M18 9v6',
    deleteRow: 'M3 8h18v8H3zM9 12h6', deleteCol: 'M8 3h8v18H8zM12 9v6', headerRow: 'M3 5h18v14H3zM3 10h18M7 7.5h10', equalCols: 'M3 5h18v14H3zM9 5v14M15 5v14M5 12h2M17 12h2',
    shade: 'M3 5h18v14H3zM3 5l18 14M9 5l12 9M3 11l9 8', more: 'M5 12h.01M12 12h.01M19 12h.01', move: 'M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4'
  };
  function icon(name) {
    const span = U.el('span', 'sx-ico');
    span.setAttribute('aria-hidden', 'true');
    const d = ICONS[name];
    if (d) span.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';
    return span;
  }
  const GLYPH = { bold: ['B', 'font-weight:800'], italic: ['I', 'font-style:italic;font-family:Georgia,serif'], underline: ['U', 'text-decoration:underline'], strike: ['S', 'text-decoration:line-through'], superscript: ['x²', ''], subscript: ['x₂', ''] };

  /* ---------- command button ---------- */
  const runtime = (n) => (n.dataset.runtime = '', n);
  let lastInvoker = null;
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
    b.onclick = () => { lastInvoker = b; C.run(id); refreshSoon(); };
    return b;
  }
  /* The button that ran the last command (pickers open next to it). */
  const invoker = () => (lastInvoker?.isConnected && lastInvoker.getClientRects().length ? lastInvoker : document.querySelector('.sx-ribbon [data-cmd=insertTable]') || document.querySelector('.sx-omni'));

  /* Re-draw the interface state soon (several quick changes → one refresh). */
  let rTimer = 0;
  const refreshSoon = () => { clearTimeout(rTimer); rTimer = setTimeout(() => SOPHIA.ui.refresh?.(), 60); };

  /* ---------- menus & popovers (one open at a time) ---------- */
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
  /** Register a popover built by a panel (status, View…) as the open one. */
  function trackPopover(p, anchor) {
    p._anchor = anchor;
    openMenuEl = p;
    anchor.setAttribute('aria-expanded', 'true');
  }
  const popoverFor = (anchor) => openMenuEl?._anchor === anchor;
  const hasPopover = () => !!openMenuEl;
  document.addEventListener('pointerdown', (e) => { if (openMenuEl && !openMenuEl.contains(e.target) && !openMenuEl._anchor.contains(e.target)) closeMenus(); }, true);

  return { pref, icon, ICONS, GLYPH, runtime, button, invoker, refreshSoon, menu, place, closeMenus, trackPopover, popoverFor, hasPopover };
})();
SOPHIA.ui.icon = SOPHIA.ui.kit.icon;
