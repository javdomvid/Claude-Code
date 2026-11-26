/* ============================================================================
 * SOPHIA · 74-appbar                                   layer: SHELL (top bar)
 * ----------------------------------------------------------------------------
 * PURPOSE  The glass app bar: brand · document title · version chip · status chip
 *          (with its popover) · [omnibox slot] · History · Edit | Save draft ▾ ·
 *          Focus · View · Canvas · Language · Main panel · Sidebar · Edit panel.
 * OWNS     SOPHIA.ui.appbar and the elements above (not the omnibox: 75-omnibox).
 * EXPORTS  SOPHIA.ui.appbar.{el, ident, actions, refresh(session), statusPopover()}
 * USES     SOPHIA.ui.kit, SOPHIA.commands, SOPHIA.{meta, versions, comments, tbc, stats,
 *          strings, i18n, migration}, EditorSession, data (record), side(),
 *          SOPHIA.ui.{view, mainPanel, editPanel} (late)
 * DOM      header.sx-appbar (data-runtime), inserted by 79-shell mount().
 * RULES    - Bar buttons are kit.button(commandId) whenever a command exists.
 *          - Long labels have a short form in data-short (used when space is tight).
 *          - Style: styles/ui/74-appbar.css.
 * TESTS    tests/functional.cjs (status, save menu, panel toggles)
 * ========================================================================== */
SOPHIA.ui.appbar = (() => {
  'use strict';
  const U = SOPHIA.util, C = SOPHIA.commands;
  const { icon, runtime, button, refreshSoon, menu, closeMenus, place, trackPopover, popoverFor } = SOPHIA.ui.kit;


  const bar = runtime(U.el('header', 'sx-appbar'));
  bar.setAttribute('role', 'banner');
  const brand = U.el('div', 'sx-brand');
  const mark = U.el('span', 'sx-mark', '◆');
  mark.setAttribute('aria-hidden', 'true');
  brand.append(mark, U.el('span', 'sx-app', 'SOPHIA'), U.el('span', 'sx-profile', SOPHIA.strings.profileLabel[SOPHIA.profile]));
  const titleEl = U.el('h1', 'sx-title');
  titleEl.setAttribute('translate', 'no');
  const versionChip = U.el('button', 'sx-chip sx-chip-version');
  versionChip.type = 'button';
  versionChip.onclick = () => side('versions');
  const statusChip = U.el('button', 'sx-chip sx-chip-status');
  statusChip.type = 'button';
  statusChip.setAttribute('aria-haspopup', 'dialog');
  statusChip.onclick = () => statusPopover();
  const ident = U.el('div', 'sx-ident');
  ident.append(brand, titleEl, versionChip, statusChip);


  const actions = U.el('nav', 'sx-actions');
  actions.setAttribute('aria-label', 'Document actions');
  const historyBtn = button('history', { short: 'History', cls: 'sx-btn-text' });
  const editBtn = button('edit', { short: 'Edit mode', cls: 'sx-btn-filled' });
  const saveSplit = U.el('div', 'sx-split');
  const saveMain = button('saveDraft', { short: 'Save draft', cls: 'sx-btn-filled' });
  saveMain.dataset.ownState = ''; // its enabled state is decided in refresh() below, not by the generic pass
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
  viewBtn.onclick = () => SOPHIA.ui.view.panel(viewBtn);
  const canvasBtn = button('canvas', { short: 'Canvas', cls: 'sx-btn-text' });
  /* interface language (owner decision X): shows the language you switch TO */
  const langBtn = U.el('button', 'sx-btn sx-btn-text sx-lang');
  langBtn.type = 'button';
  langBtn.dataset.cmd = 'language';
  langBtn.setAttribute('translate', 'no');
  langBtn.onclick = () => { C.run('language'); refreshSoon(); };
  const sep = U.el('span', 'sx-sep');
  sep.setAttribute('aria-hidden', 'true');
  const mainBtn = U.el('button', 'sx-btn sx-btn-tonal sx-panel-toggle');
  mainBtn.type = 'button';
  mainBtn.dataset.cmd = 'mainMode';
  mainBtn.onclick = () => SOPHIA.ui.mainPanel.cycle();
  const sideBtn = button('sidebar', { short: 'Sidebar', cls: 'sx-btn-tonal sx-btn-blue' });
  const ribbonBtn = U.el('button', 'sx-btn sx-btn-tonal sx-panel-toggle sx-ribbon-toggle');
  ribbonBtn.type = 'button';
  ribbonBtn.dataset.cmd = 'ribbonMode';
  ribbonBtn.onclick = () => SOPHIA.ui.editPanel.cycle();
  actions.append(historyBtn, editBtn, saveSplit, focusBtn, viewBtn, canvasBtn, langBtn, sep, mainBtn, sideBtn, ribbonBtn);

  /* ---------- status popover (click on the status chip) ---------- */
  function statusPopover() {
    if (popoverFor(statusChip)) { closeMenus(); return; }
    closeMenus();
    const s = EditorSession.get(), last = data.revisions.at(-1), st = SOPHIA.stats();
    const p = runtime(U.el('div', 'sx-menu sx-popover'));
    p.setAttribute('role', 'dialog');
    p.setAttribute('aria-label', 'Document status');
    const dl = U.el('dl', 'sx-dl');
    const row = (k, v) => { const dd = U.el('dd', '', v); dd.setAttribute('translate', 'no'); dl.append(U.el('dt', '', k), dd); };
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
    trackPopover(p, statusChip);
    p.querySelector('button')?.focus();
  }

  /* ---------- state: title, chips, which buttons show, panel-mode labels ---------- */
  function refresh(s) {
    const ribbonMode = SOPHIA.ui.editPanel.mode(), mainMode = SOPHIA.ui.mainPanel.mode();
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
    const es = SOPHIA.i18n.lang === 'es';
    langBtn.replaceChildren(icon('lang'), U.el('span', 'sx-label', es ? 'EN' : 'ES'));
    langBtn.title = es ? 'Interface in English' : 'Interfaz en español';
    langBtn.setAttribute('aria-label', langBtn.title);
  }

  return { el: bar, ident, actions, refresh, statusPopover };
})();
