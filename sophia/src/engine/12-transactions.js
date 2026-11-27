/* ============================================================================
 * SOPHIA · 12-transactions                             layer: SAFETY
 * ----------------------------------------------------------------------------
 * PURPOSE  The only safe way to change the document: run a function, and if it throws,
 *          the document DOM and the undo journal roll back together. One call = one undo step.
 * OWNS     EditorTransactions.
 * EXPORTS  EditorTransactions {run(label, fn) → true|false, active()}
 * USES     area, capture, muted, observer, undoStates, undoPosition, setEditable,
 *          refreshOutline, toast, EditorSession, EditorCommands, EditorMedia, SOPHIA.bus
 * EMITS    transaction (label, after a committed change)
 * RULES    Every document mutation made by a feature goes through run(label, fn).
 *          Keep fn synchronous; do not open dialogs inside it.
 * TESTS    tests/functional.cjs (undo after every tool)
 * ========================================================================== */
/* Shared synchronous mutation boundary. Document DOM and undo journal rollback
   together. External I/O and saved revision commits are deliberately excluded. */
window.EditorTransactions = (() => {
  "use strict";
  let a = null,
    running = false;
  const log = [];
  function attach(adapter) {
    if (a) throw Error("Transaction adapter already attached");
    a = adapter;
  }
  function run(label, fn, validate = () => true) {
    if (!a || !window.EditorSession?.get().pid || document.body.classList.contains("focusmode")) {
      a?.notify("Start editing before changing the document.");
      return false;
    }
    if (running) {
      a.notify("Another document operation is running.");
      return false;
    }
    if (typeof fn !== "function" || validate() !== true) return false;
    running = true;
    let backup, journal;
    const start = performance.now();
    try {
      a.capture();
      backup = a.area.innerHTML;
      journal = a.journal();
      const result = fn();
      if (result && typeof result.then === "function")
        throw Error("Asynchronous mutations are not supported");
      if (result === false) {
        a.rollback(backup, journal);
        return false;
      }
      a.capture();
      EditorSession.changed();
      window.SOPHIA?.bus.emit("transaction", String(label));
      log.push(
        Object.freeze({
          label: String(label),
          status: "committed",
          ms: Math.round(performance.now() - start),
        }),
      );
      if (log.length > 40) log.shift();
      return true;
    } catch (error) {
      let restored = false;
      try {
        if (backup !== undefined) {
          a.rollback(backup, journal);
          restored = true;
        }
      } catch {}
      log.push(
        Object.freeze({
          label: String(label),
          status: restored ? "rolled-back" : "failed",
          ms: Math.round(performance.now() - start),
        }),
      );
      if (log.length > 40) log.shift();
      a.notify(
        restored
          ? "Operation failed and was rolled back. " + error.message
          : "Operation failed. Check the document before continuing. " + error.message,
      );
      return false;
    } finally {
      running = false;
    }
  }
  return Object.freeze({ attach, run, diagnostics: () => log.map((x) => ({ ...x })) });
})();

EditorTransactions.attach({
  area,
  capture,
  notify: toast,
  journal() {
    return { states: undoStates.slice(), position: undoPosition };
  },
  rollback(html, journal) {
    const old = muted;
    muted = true;
    try {
      clearTimeout(undoTimer);
      area.innerHTML = html;
      setEditable();
      observer.takeRecords();
      undoStates.splice(0, undoStates.length, ...journal.states);
      undoPosition = journal.position;
      EditorCommands.clear();
      EditorMedia.clear();
      refreshOutline();
    } finally {
      muted = old;
    }
    EditorSession.changed();
  },
});
