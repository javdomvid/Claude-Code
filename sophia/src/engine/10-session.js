/* ============================================================================
 * SOPHIA · 10-session                                  layer: SAFETY
 * ----------------------------------------------------------------------------
 * PURPOSE  Who is editing and whether there are unsaved changes: the PID editing session,
 *          dirty state, local recovery copy (sanitized), discard; the "Start editing" dialog.
 * OWNS     EditorSession and the local PID registry read from #sophia-pid-registry.
 * EXPORTS  EditorSession {start, saved, discard, recover, changed, refresh, get, panel,
 *          subscribe, rebase}, localPIDKeys, edit() (Start editing dialog), discardPID(),
 *          recoverDraft()
 * USES     SOPHIA.{bus, ask, assets, canonical, ids, sanitize, recordDirty}, data, area, modal,
 *          toast, capture, cleanContent, setEditable, refreshOutline, repaginate, muted,
 *          pidSession, undoStates, undoPosition, EditorCommands
 * EMITS    session (snapshot {pid, dirty, recovery, panel}), content-changed
 * RULES    - PID = DECLARED local authorship, not identity (owner decision E: the key check
 *            is a convenience lock; real authentication is a later decision).
 *          - Never print, log or copy PID keys. Keys live in #sophia-pid-registry only.
 * TESTS    tests/functional.cjs (start editing, discard, recover, dirty state)
 * ========================================================================== */
const localPIDKeys = (() => {
  try { return JSON.parse(document.getElementById('sophia-pid-registry')?.textContent || '{}'); }
  catch { return {}; }
})();

window.EditorSession = (() => {
  'use strict';
  let state = { pid: null, dirty: false, recovery: 'idle', recoveryAt: null, panel: 'outline', phase: 'read' };
  let baseline = SOPHIA.canonical();
  let sessionHTML = null, sessionComments = null, sessionStatus = null, sessionVersion = null, sessionEvents = 0, timer = 0;
  const listeners = new Set();
  const key = () => 'document-recovery:v11:' + data.id;
  const snapshot = () => Object.freeze({ ...state });

  function update(patch) {
    state = { ...state, ...patch };
    pidSession = state.pid;
    SOPHIA.bus.emit('session', snapshot());
    listeners.forEach((fn) => { try { fn(snapshot()); } catch (e) { console.error(e); } });
  }
  function computeDirty() {
    try { return SOPHIA.canonical() !== baseline || !!SOPHIA.recordDirty; } catch { return true; }
  }
  function changed() {
    const dirty = computeDirty();
    update({ dirty });
    clearTimeout(timer);
    if (state.pid && dirty) timer = setTimeout(writeRecovery, 700);
  }
  function writeRecovery() {
    if (!state.pid || !computeDirty()) return;
    const rec = {
      schema: 2, documentId: data.id, baseVersion: data.documentVersion, baseCanonical: baseline,
      pid: state.pid, time: new Date().toISOString(), html: cleanContent(), comments: data.comments
    };
    try {
      localStorage.setItem(key() + ':' + encodeURIComponent(rec.baseVersion) + ':' + encodeURIComponent(rec.pid), JSON.stringify(rec));
      update({ recovery: 'saved', recoveryAt: rec.time });
    } catch {
      update({ recovery: 'unavailable' });
    }
  }
  function purgeRecovery(pid = state.pid) {
    try {
      const prefix = key();
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (!k || !(k === prefix || k.startsWith(prefix + ':'))) continue;
        const r = JSON.parse(localStorage.getItem(k) || 'null');
        if (r && r.documentId === data.id && (!pid || r.pid === pid)) localStorage.removeItem(k);
      }
    } catch {}
  }

  function start(pid) {
    if (state.pid) return false;
    EditorCommands?.clear();
    undoStates.splice(0);
    undoStates.push(cleanContent());
    undoPosition = 0;
    sessionHTML = cleanContent();
    sessionComments = JSON.stringify(data.comments);
    sessionStatus = data.status;
    document.body.classList.add('editing');
    update({ pid, phase: 'editing', dirty: computeDirty(), recovery: 'idle' });
    setEditable();
    data.events.push({ type: 'session-start', pid, date: new Date().toISOString(), version: data.documentVersion });
    sessionVersion = data.documentVersion;
    sessionEvents = data.events.length;
    return true;
  }
  function end() {
    document.body.classList.remove('editing');
    setEditable();
    area.querySelectorAll('[contenteditable]').forEach((n) => (n.contentEditable = 'false'));
  }
  /** Called after a verified save was confirmed: the saved content becomes the new baseline. */
  function saved() {
    clearTimeout(timer);
    purgeRecovery();
    baseline = SOPHIA.canonical();
    SOPHIA.recordDirty = false;
    end();
    update({ pid: null, phase: 'read', dirty: false, recovery: 'idle' });
  }
  function discard() {
    if (!state.pid) return;
    modal(
      'Discard session changes?',
      '<p>This returns the document to the start of your current session and removes its local recovery copy. Saved revisions are not touched.</p>',
      (v) => {
        purgeRecovery();
        muted = true;
        area.innerHTML = sessionHTML;
        muted = false;
        SOPHIA.assets.resolveDocumentImages(area);
        repaginate();
        data.comments = JSON.parse(sessionComments || '[]');
        data.status = sessionStatus;
        /* events of the discarded session (proposal applied, base version set) go too */
        if (sessionVersion !== null) data.documentVersion = sessionVersion;
        if (sessionEvents) data.events.length = Math.min(data.events.length, sessionEvents);
        SOPHIA.recordDirty = false;
        end();
        undoStates.splice(0);
        undoStates.push(cleanContent());
        undoPosition = 0;
        update({ pid: null, phase: 'read', dirty: computeDirty(), recovery: 'idle' });
        refreshOutline();
        v.remove();
        SOPHIA.bus.emit('content-changed');
      },
      'Discard session'
    );
  }
  function recover() {
    if (!state.pid) {
      toast('Start editing with the matching PID before recovering a draft.');
      return;
    }
    let r = null;
    try {
      r = JSON.parse(localStorage.getItem(key() + ':' + encodeURIComponent(data.documentVersion) + ':' + encodeURIComponent(state.pid)) || 'null');
    } catch {}
    if (!r || r.documentId !== data.id || r.baseVersion !== data.documentVersion || typeof r.html !== 'string') {
      toast('No compatible local recovery draft for this document, version and PID.');
      return;
    }
    const v = modal(
      'Recover local draft',
      '<p data-recovery-info></p><p>Current session edits will be replaced. Saved revisions are not touched.</p>',
      (dlg) => {
        capture();
        muted = true;
        area.innerHTML = SOPHIA.sanitize.html(r.html);
        muted = false;
        SOPHIA.ids?.ensure();
        repaginate();
        if (Array.isArray(r.comments)) data.comments = r.comments;
        setEditable();
        capture();
        changed();
        refreshOutline();
        dlg.remove();
        toast('Local draft restored. Save to keep it.');
      },
      'Restore draft'
    );
    v.querySelector('[data-recovery-info]').textContent = 'PID ' + r.pid + ' · ' + r.time + ' · based on V' + r.baseVersion;
  }
  function recoveryCount() {
    let n = 0;
    try {
      for (let i = 0; i < localStorage.length; i++) if ((localStorage.key(i) || '').startsWith('document-recovery:')) n++;
    } catch {}
    return n;
  }
  function rebase() {
    baseline = SOPHIA.canonical();
    changed();
  }

  document.addEventListener('input', (e) => { if (area.contains(e.target)) changed(); });
  return Object.freeze({
    attach() {},
    start, saved, discard, recover, changed, rebase, writeRecovery, recoveryCount,
    refresh: () => update({}),
    get: snapshot,
    panel(name) { update({ panel: name }); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  });
})();

/* ---------- Start editing (PID modal) — legacy name kept: edit() ---------- */
function edit() {
  if (document.body.classList.contains('focusmode')) {
    SOPHIA.ask.leaveFocus();
    if (EditorSession.get().pid) return;
  }
  if (EditorSession.get().pid) {
    toast('You are already editing. Save, publish or discard to end the session.');
    return;
  }
  const v = modal(
    'Start editing',
    '<p>Local PID check. Keys are visible in the HTML source: this is declared authorship, not corporate authentication.</p>' +
      '<label>PID<input id="pidInput" autocomplete="off" spellcheck="false"></label>' +
      '<label>Tool key<input id="pidKey" type="password" autocomplete="off"></label><p id="pidError" role="alert"></p>',
    (dlg) => {
      const pid = dlg.querySelector('#pidInput').value.trim().toUpperCase();
      const k = dlg.querySelector('#pidKey').value;
      if (!Object.hasOwn(localPIDKeys, pid) || localPIDKeys[pid] !== k) {
        dlg.querySelector('#pidError').textContent = 'PID or key not recognised.';
        return;
      }
      dlg.querySelector('#pidKey').value = '';
      EditorSession.start(pid);
      dlg.remove();
      toast('Editing as ' + pid);
    },
    'Start editing'
  );
  return v;
}
function discardPID() { EditorSession.discard(); }
function recoverDraft() { EditorSession.recover(); }
