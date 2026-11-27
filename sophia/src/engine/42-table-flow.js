/* ============================================================================
 * SOPHIA · 42-table-flow                               layer: FEATURE
 * ----------------------------------------------------------------------------
 * PURPOSE  Table Flow (Quick Card): split a body table between two rows, repeating the
 *          header row, to control where a long table breaks.
 * OWNS     TableFlow; dialog.table-flow-v28 (style: styles/ui/42-table-flow.css).
 * EXPORTS  TableFlow {open}
 * USES     EditorCommands, EditorSession, EditorTransactions, area, cleanContent, toast
 * RULES    Quick Card only (the command is registered with profile: 'quick-card').
 * TESTS    tools/snapshot.cjs studio-table-flow (Quick Card)
 * ========================================================================== */
window.TableFlow = (() => {
  "use strict";
  let active = null;
  const bodyTables = () => [...area.querySelectorAll(".pagecontent > table:not(.identity)")];
  function prepare(source, after, repeat = true) {
    if (!source || source.tagName !== "TABLE" || !source.parentElement?.matches(".pagecontent"))
      throw Error("Choose a top-level body table. Nested tables are not supported.");
    if (source.querySelector("table")) throw Error("Nested tables must remain whole in this version.");
    if (source.tBodies.length !== 1)
      throw Error("Tables with multiple body sections must remain whole in this version.");
    const rows = [...source.tBodies[0].rows];
    if (!Number.isInteger(after) || after < 1 || after >= rows.length)
      throw Error("Choose a cut between two body rows.");
    for (let i = 0; i < after; i++)
      for (const c of rows[i].cells)
        if (c.rowSpan === 0 || i + c.rowSpan > after)
          throw Error("This cut crosses a vertically merged cell. Choose another row.");
    const first = source.cloneNode(true),
      second = source.cloneNode(true);
    [...first.tBodies[0].rows].slice(after).forEach((n) => n.remove());
    [...second.tBodies[0].rows].slice(0, after).forEach((n) => n.remove());
    first.tFoot?.remove();
    second.caption?.remove();
    if (!repeat) second.tHead?.remove();
    // Only repeated structures lose identity. Original body-row identities stay unique.
    const strip = (n) => {
      for (const e of [n, ...n.querySelectorAll("*")])
        for (const a of ["id", "data-block-id", "data-history-id"]) e.removeAttribute(a);
    };
    for (const a of ["id", "data-block-id", "data-history-id"]) second.removeAttribute(a);
    for (const n of [...second.children]) if (n.tagName === "THEAD" || n.tagName === "COLGROUP") strip(n);
    second.dataset.layoutBefore = "page";
    second.dataset.layoutKeep = source.dataset.layoutKeep || "none";
    first.dataset.layoutKeep = "none";
    if (second.tHead) {
      second.tHead.dataset.flowRepeated = "true";
      second.tHead.setAttribute("title", "Repeated header copy. Edit each part independently.");
    }
    // Verify every original body row survives exactly once and in the same order.
    const result = [...first.tBodies[0].rows, ...second.tBodies[0].rows].map((n) => n.outerHTML);
    if (result.length !== rows.length || result.some((v, i) => v !== rows[i].outerHTML))
      throw Error("Row integrity verification failed. Nothing was changed.");
    return { first, second, rows: rows.length, after, repeated: !!second.tHead };
  }
  function apply(source, after, repeat = true) {
    if (!area.contains(source)) throw Error("The selected table is no longer in the document.");
    const plan = prepare(source, after, repeat);
    return EditorTransactions.run("Table Flow: split after body row " + after, () => {
      source.replaceWith(plan.first, plan.second);
      EditorCommands.clear();
    });
  }
  function open() {
    if (active?.isConnected) {
      active.focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil,#archiveView")) {
      toast("Finish the current dialog first.");
      return;
    }
    const tables = bodyTables();
    if (!tables.length) {
      toast("No top-level body tables found.");
      return;
    }
    const origin = document.activeElement,
      pid = EditorSession.get().pid,
      baseline = cleanContent();
    const d = document.createElement("dialog");
    active = d;
    d.className = "table-flow-v28";
    d.setAttribute("aria-label", "Table Flow");
    d.innerHTML =
      '<header><small>ASSETS · TABLE FLOW</small><h2>Table Flow</h2><p>Choose an exact row boundary. Preview both parts before changing the document.</p>' +
        '</header><section><aside><label>Body table<select data-table></select></label><p data-info></p><label>Split after body row<input data-row type="number" min="1" step="1" value="1">' +
        '</label><label class="tf-check"><input data-repeat type="checkbox" checked> Repeat existing THEAD header</label>' +
        '<p>The continuation starts on a new A4 page when you use A4 / Reflow. Each part remains editable in Table Studio.</p>' +
        '<p>Header copies are independent. Oversized rows are never cut automatically. Nested tables and multiple body sections are protected.</p>' +
        '<p data-error role="alert"></p></aside><main><div data-preview></div></main></section><footer><button type="button" data-cancel>Cancel</button>' +
        '<button type="button" data-apply>Apply split</button></footer>';
    const q = (k) => d.querySelector("[data-" + k + "]");
    tables.forEach((t, i) => {
      const o = document.createElement("option");
      o.value = i;
      o.textContent =
        i + 1 + ". " + (t.caption?.textContent || t.rows[0]?.textContent || "Table").trim().slice(0, 90);
      q("table").append(o);
    });
    let plan = null;
    const source = () => tables[Number(q("table").value)];
    const valid = () =>
      pid && EditorSession.get().pid === pid && source()?.isConnected && cleanContent() === baseline;
    function render() {
      plan = null;
      q("preview").replaceChildren();
      q("error").textContent = "";
      q("apply").disabled = true;
      const t = source(),
        count = t.tBodies[0]?.rows.length || 0;
      q("row").max = Math.max(1, count - 1);
      q("info").textContent = count + " body rows. No changes until Apply.";
      q("repeat").disabled = !t.tHead;
      try {
        if (!pid) throw Error("Start an editing session to split tables.");
        if (!valid()) throw Error("Document or editing session changed. Cancel and reopen.");
        plan = prepare(t, Number(q("row").value), q("repeat").checked);
        for (const [i, n] of [plan.first, plan.second].entries()) {
          const card = document.createElement("article"),
            h = document.createElement("h3");
          h.textContent = i ? "Part 2 · starts on a new A4 page" : "Part 1";
          const c = n.cloneNode(true);
          for (const e of [c, ...c.querySelectorAll("*")]) {
            e.removeAttribute("id");
            e.removeAttribute("contenteditable");
          }
          card.append(h, c);
          q("preview").append(card);
        }
        q("apply").disabled = false;
      } catch (e) {
        q("error").textContent = e.message;
      }
    }
    function close() {
      if (!d.isConnected) return;
      d.close();
      d.remove();
      active = null;
      if (origin?.isConnected) origin.focus();
    }
    q("table").onchange = () => {
      q("row").value = 1;
      render();
    };
    q("row").oninput = render;
    q("repeat").onchange = render;
    q("cancel").onclick = close;
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    q("apply").onclick = () => {
      try {
        if (!valid()) throw Error("Document or editing session changed. Cancel and reopen.");
        if (!plan) return;
        if (apply(source(), Number(q("row").value), q("repeat").checked)) {
          close();
          toast(
            "Table split. Undo is available. Use A4 / Reflow to paginate; export HTML to retain changes.",
          );
        }
      } catch (e) {
        q("error").textContent = e.message;
        q("apply").disabled = true;
      }
    };
    document.body.append(d);
    d.showModal();
    render();
    q("table").focus();
  }
  return Object.freeze({ open, prepare, apply });
})();
