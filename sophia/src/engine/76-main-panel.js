/* ============================================================================
 * SOPHIA · 76-main-panel                               layer: SHELL (main panel)
 * ----------------------------------------------------------------------------
 * PURPOSE  The always-available main panel under the app bar: tonal bento tiles
 *          Navigate · Review · Assets · Save & publish · Output · Agent.
 *          Modes Full (labels) / Mini (icons) / Hide; entering edit mode switches
 *          Full → Mini and leaving brings it back (owner decision S, V78).
 * OWNS     SOPHIA.ui.mainPanel, MAIN (tiles and their command ids), MAIN_SHORT,
 *          pref "mainpanel".
 * EXPORTS  SOPHIA.ui.mainPanel.{el, render(), cycle(), mode(), forSession(editing),
 *          refresh(session)}
 * USES     SOPHIA.ui.kit (button, pref), SOPHIA.commands, SOPHIA.ui.refresh (late)
 * DOM      div.sx-main (data-runtime), mounted after the app bar by 79-shell.
 * RULES    To show a command here, add its id to a MAIN tile (and a short label to
 *          MAIN_SHORT if the full label is long). Style: styles/ui/76-main-panel.css.
 * TESTS    tests/functional.cjs (Full → Mini → Hide; Mini on edit)
 * ========================================================================== */
SOPHIA.ui.mainPanel = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const { pref, runtime, button } = SOPHIA.ui.kit;

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
  const MAIN_SHORT = {
    outline: 'Outline', find: 'Find', structure: 'Structure', layoutStudio: 'Layout', versions: 'Changes',
    compare: 'Compare', comments: 'Comments', checks: 'Checks', imageLibrary: 'Images',
    tableStudio: 'Tables', importDocx: 'Import .docx', edit: 'Edit mode', saveDraft: 'Save draft',
    publish: 'Publish & save', bigValidation: 'Big Validation', discard: 'Discard', print: 'Print',
    downloadCopy: 'Download', exportDocx: 'Word copy', brief: 'Brief', exportMap: 'Map',
    applyProposal: 'Proposal'
  };
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
  /* Owner (V78): entering edit mode switches a Full main panel to Mini (the edit panel needs the
     room); leaving edit mode brings it back. Changing it during editing is respected. */
  let mainBeforeEdit = null;
  function mainForSession(editingNow) {
    if (editingNow && mainMode === 'full') { mainBeforeEdit = 'full'; mainMode = 'mini'; renderMain(); }
    else if (!editingNow && mainBeforeEdit) { mainMode = mainBeforeEdit; mainBeforeEdit = null; renderMain(); }
  }
  function cycleMain() {
    mainBeforeEdit = null;
    mainMode = { full: 'mini', mini: 'hide', hide: 'full' }[mainMode];
    pref.set('mainpanel', mainMode);
    renderMain();
    SOPHIA.ui.refresh();
    toast('Main panel: ' + { full: 'Full', mini: 'Mini', hide: 'Hidden' }[mainMode]);
  }

  /* Main panel shows what can be done now: edit-only tools appear while editing. */
  function refresh(s) {
    mainEl.querySelectorAll('[data-cmd]').forEach((b) => { const c = C.get(b.dataset.cmd); b.hidden = c?.id === 'edit' ? !!s.pid : !!(c?.editing && !s.pid); });
    mainEl.querySelectorAll('.sx-tile-main').forEach((t) => (t.hidden = !t.querySelector('[data-cmd]:not([hidden])')));
  }

  return { el: mainEl, render: renderMain, cycle: cycleMain, mode: () => mainMode, forSession: mainForSession, refresh };
})();
