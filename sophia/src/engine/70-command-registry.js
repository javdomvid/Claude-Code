/* ============================================================================
 * SOPHIA · 70-command-registry                       layer: SHELL (data only)
 * ----------------------------------------------------------------------------
 * PURPOSE  The single list of everything a person can DO in SOPHIA. Every button,
 *          menu item, omnibox entry and shortcut runs a registered command; no
 *          interface element calls feature code directly.
 * OWNS     SOPHIA.commands (the registry). Nothing visual.
 * EXPORTS  SOPHIA.commands.{register, run, available, get, all}
 * USES     SOPHIA.bus, SOPHIA.util.isEditing, SOPHIA.strings, toast()
 * EMITS    commands-changed (after every register)
 * RULES    - A command = { id, label, group, run, editing, icon?, keys?, when?, why?,
 *            profile?, pressed?, state? }. `editing: true` → only while editing.
 *          - `when()` decides availability; `why` is the message shown otherwise.
 *          - Labels are English; the Spanish/other languages come from 08-i18n.
 *          - The core list lives in 72-command-list; a feature module may register
 *            its own commands at load time (example: 85-flow registers "symbols").
 * TESTS    tests/functional.cjs (every panel runs commands through here)
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
