/* ============================================================================
 * SOPHIA · 28-tables
 * Table Studio: detached draft, preview, explicit transaction commit.
 * Reused from V76 (table-studio-v26); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V26: detached table draft, safe text/layout preview, explicit transaction commit.
   No snapshot rewrite. New cells have no copied block IDs. Existing cells retain
   attributes/children. Complex grids are styled but never structurally guessed. */
window.TableStudio = (() => {
  "use strict";
  let active = null;
  const make = (tag, text) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  };
  function eligible(t) {
    return (
      !!t &&
      t.tagName === "TABLE" &&
      area.contains(t) &&
      !!t.closest(".pagecontent") &&
      !t.closest(".identity,[data-trace],.pagehead,.pagefoot") &&
      !t.parentElement.closest("table")
    );
  }
  function tables() {
    return [...area.querySelectorAll(".pagecontent table")].filter(eligible);
  }
  function rows(t) {
    return [...t.rows].filter((r) => r.closest("table") === t);
  }
  function cells(t) {
    return rows(t).flatMap((r) => [...r.cells]);
  }
  function simple(t) {
    const rs = rows(t),
      n = rs[0]?.cells.length;
    return (
      !!n &&
      !t.querySelector("table") &&
      rs.every((r) => r.cells.length === n && [...r.cells].every((c) => c.colSpan === 1 && c.rowSpan === 1))
    );
  }
  function open(initialAction = "") {
    if (active?.isConnected) {
      active.querySelector("[data-table]").focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil,#archiveView")) {
      toast("Finish the current dialog first.");
      return;
    }
    const available = tables();
    if (!available.length) {
      toast("No body tables available. Insert a table from the Insert tab first.");
      return;
    }
    let current = null;
    const sel = getSelection();
    if (sel?.rangeCount) {
      const node = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
      current = node?.closest("td,th");
    }
    if (!eligible(current?.closest("table"))) current = null;
    const origin = document.activeElement,
      pid = EditorSession.get().pid,
      editable = !!pid,
      baseline = cleanContent();
    let source = current?.closest("table") || available[0],
      sourceHTML = "",
      draft = null,
      r = 0,
      c = 0,
      ops = [],
      destructive = false,
      closed = false,
      invalid = false;
    const d = make("dialog");
    active = d;
    d.className = "table-studio-v26";
    d.setAttribute("aria-label", "Table Studio");
    d.innerHTML =
      '<header><small>STRUCTURED DOCUMENT EDITING · V26</small><h2>Table Studio</h2><p>Prepare layout and structure changes on a separate draft. The document changes only when you apply.</p></header><nav><label>Body table<select data-table></select></label><span data-mode></span></nav><section><div class="ts26-controls"><fieldset data-edit><legend>Table layout</legend><div class="ts26-fields"><label>Width (%) · blank keeps current<input data-width type="number" min="10" max="100" step="1" placeholder="Keep current"></label><label>Table alignment<select data-align><option value="">Keep current</option><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label><label>Plain-text table caption<input data-caption maxlength="1000"></label></div><button type="button" data-stage-layout>Stage table layout</button><h3>Cell formatting</h3><div class="ts26-fields"><label>Apply to<select data-scope><option value="cell">Selected cell</option><option value="row">Selected row</option><option value="column">Selected column</option><option value="all">All cells</option></select></label><label>Text alignment<select data-text><option value="">Keep current</option><option>left</option><option>center</option><option>right</option><option>justify</option></select></label><label>Vertical alignment<select data-vertical><option value="">Keep current</option><option>top</option><option>middle</option><option>bottom</option></select></label><label>Padding (px) · blank keeps current<input data-padding type="number" min="0" max="32" step="1"></label><label>Border<select data-border><option value="">Keep current</option><option value="0">None</option><option value="1">1 px</option><option value="2">2 px</option></select></label><label>Cell fill<select data-fill><option value="">Keep current</option><option value="#ffffff">White</option><option value="#CBE7F5">Brand light blue</option><option value="#EDF2AE">Brand highlight</option><option value="#eef3fc">Soft grey-blue</option></select></label></div><button type="button" data-stage-cells>Stage cell formatting</button><h3>Rows & columns</h3><div class="ts26-fields"><label>Row<select data-row></select></label><label>Cell / column<select data-column></select></label></div><div class="ts26-actions"><button type="button" data-op="rowBefore">Row above</button><button type="button" data-op="row">Row below</button><button type="button" data-op="columnBefore">Column before</button><button type="button" data-op="column">Column after</button><button type="button" data-op="deleteRow">Delete row</button><button type="button" data-op="deleteColumn">Delete column</button><button type="button" data-op="header">Toggle selected row headers</button><button type="button" data-op="equal">Equal column widths</button></div><p data-complex class="ts26-note"></p></fieldset></div><div class="ts26-preview-column"><h3>Draft layout preview</h3><p class="ts26-note">Text-only layout preview. Original rich content, links and images are preserved on apply; they are not executed or loaded here. Click a preview cell to select it.</p><div data-preview class="ts26-preview"></div><h3>Staged operations</h3><ol data-operations></ol><p data-status role="status" aria-live="polite"></p><p data-error role="alert"></p><label data-delete-confirm hidden><input type="checkbox" data-confirm> I reviewed the removed content and confirm these deletions.</label></div></section><footer><div><button type="button" data-close>Cancel</button><button type="button" data-discard hidden>Discard draft and close</button></div><div><button type="button" data-reset>Reset table draft</button><button type="button" data-apply>Apply table changes</button></div></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    available.forEach((t, i) => {
      const o = make("option", "Table " + (i + 1) + " · " + t.textContent.trim().slice(0, 75));
      o.value = String(i);
      q("table").append(o);
    });
    q("table").value = String(available.indexOf(source));
    q("mode").textContent = editable
      ? "Editing session · " + pid
      : "Read only · start editing to make changes";
    q("edit").disabled = !editable;
    function changed() {
      return draft?.outerHTML !== sourceHTML;
    }
    function valid() {
      return (
        !invalid &&
        EditorSession.get().pid === pid &&
        eligible(source) &&
        cleanContent() === baseline &&
        source.outerHTML === sourceHTML
      );
    }
    function close(force = false) {
      if (closed) return;
      if (changed() && !force) {
        q("error").textContent =
          "There are unapplied changes. Apply, reset, or explicitly discard the draft.";
        q("discard").hidden = false;
        return;
      }
      closed = true;
      unsubscribe();
      if (d.open) d.close();
      d.remove();
      active = null;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    function load(table, cell = null) {
      source = table;
      sourceHTML = source.outerHTML;
      draft = source.cloneNode(true);
      r = cell ? rows(source).indexOf(cell.parentElement) : 0;
      c = cell?.cellIndex || 0;
      ops = [];
      destructive = false;
      q("confirm").checked = false;
      q("discard").hidden = true;
      q("error").textContent = "";
      q("width").value = "";
      q("align").value = "";
      q("caption").value = draft.caption?.textContent || "";
      q("caption").disabled = !editable || !!draft.caption?.children.length;
      render();
    }
    function stage(label, fn, remove = false) {
      if (!editable || invalid) return;
      if (!valid()) {
        q("error").textContent =
          "Document or session changed. Discard this draft and reopen. Nothing was applied.";
        q("apply").disabled = true;
        return;
      }
      const before = draft.cloneNode(true);
      try {
        const result = fn();
        if (result === false) return;
        if (draft.outerHTML !== before.outerHTML) {
          ops.push(label);
          destructive = destructive || remove;
          q("confirm").checked = false;
        }
        q("error").textContent = "";
        render();
      } catch (error) {
        draft = before;
        q("error").textContent = error.message;
        render();
      }
    }
    function selection() {
      const rs = rows(draft);
      r = Math.max(0, Math.min(r, rs.length - 1));
      c = Math.max(0, Math.min(c, (rs[r]?.cells.length || 1) - 1));
      return { rs, row: rs[r], cell: rs[r]?.cells[c] };
    }
    function blank(tag = "td") {
      const cell = make(tag);
      cell.append(make("br"));
      if (tag === "th") cell.scope = "col";
      return cell;
    }
    function structure(action) {
      if (!simple(draft)) {
        q("error").textContent =
          "Structural changes are blocked for merged, irregular or nested tables. Cell formatting remains available where safe.";
        return;
      }
      const { rs, row, cell } = selection(),
        n = row.cells.length;
      if ((action === "row" || action === "rowBefore") && (rs.length >= 100 || (rs.length + 1) * n > 2000)) {
        q("error").textContent = "This studio supports up to 100 rows and 2,000 cells.";
        return;
      }
      if ((action === "column" || action === "columnBefore") && (n >= 30 || rs.length * (n + 1) > 2000)) {
        q("error").textContent = "This studio supports up to 30 columns and 2,000 cells.";
        return;
      }
      if ((action === "deleteRow" && rs.length <= 1) || (action === "deleteColumn" && n <= 1)) {
        q("error").textContent = "Keep at least one row and one column.";
        return;
      }
      const removed =
        action === "deleteRow"
          ? row.textContent
          : action === "deleteColumn"
            ? rs.map((x) => x.cells[c].textContent).join(" | ")
            : "";
      stage(
        {
          rowBefore: "Insert row above",
          row: "Insert row below",
          columnBefore: "Insert column before",
          column: "Insert column after",
          deleteRow: "Delete row",
          deleteColumn: "Delete column",
          header: "Toggle selected row header cells",
          equal: "Equalise column widths",
        }[action] + (removed ? " · removed: " + removed : ""),
        () => {
          if (["column", "columnBefore", "deleteColumn", "equal"].includes(action))
            draft.querySelector(":scope > colgroup[data-v425-cols]")?.remove();
          if (action === "row" || action === "rowBefore") {
            const tr = make("tr");
            for (let i = 0; i < n; i++) tr.append(blank(row.cells[i].tagName.toLowerCase()));
            if (action === "row") row.after(tr);
            else row.before(tr);
            r = rows(draft).indexOf(tr);
          } else if (action === "column" || action === "columnBefore") {
            for (const tr of rs) {
              const existing = tr.cells[c],
                td = blank(existing.tagName.toLowerCase());
              if (action === "column") existing.after(td);
              else existing.before(td);
            }
            if (action === "column") c++;
          } else if (action === "deleteRow") row.remove();
          else if (action === "deleteColumn") rs.forEach((tr) => tr.cells[c].remove());
          else if (action === "header") {
            const toHeader = [...row.cells].some((n) => n.tagName !== "TH");
            for (const old of [...row.cells]) {
              const next = make(toHeader ? "th" : "td");
              for (const a of old.attributes) next.setAttribute(a.name, a.value);
              if (toHeader) next.scope = "col";
              else next.removeAttribute("scope");
              next.append(...old.childNodes);
              old.replaceWith(next);
            }
          } else if (action === "equal") {
            draft.style.tableLayout = "fixed";
            cells(draft).forEach((n) => {
              n.removeAttribute("width");
              n.style.width = 100 / rows(draft)[0].cells.length + "%";
            });
          } else throw Error("Unsupported table operation");
          if (["column", "columnBefore", "deleteColumn", "equal"].includes(action)) {
            [...draft.children]
              .filter((n) => n.tagName === "COLGROUP" || n.tagName === "COL")
              .forEach((n) => n.remove());
            if (action !== "equal")
              cells(draft).forEach((n) => {
                n.removeAttribute("width");
                n.style.removeProperty("width");
              });
          }
        },
        action === "deleteRow" || action === "deleteColumn",
      );
    }
    function preview() {
      const host = q("preview");
      host.replaceChildren();
      const t = make("table");
      const safeProps = [
        "width",
        "max-width",
        "table-layout",
        "border-collapse",
        "margin-left",
        "margin-right",
        "text-align",
        "vertical-align",
        "padding",
        "border",
        "border-top",
        "border-right",
        "border-bottom",
        "border-left",
        "background-color",
        "color",
      ];
      function copyStyles(from, to) {
        for (const p of safeProps) {
          const v = from.style.getPropertyValue(p);
          if (v && !/url\s*\(|var\s*\(|expression/i.test(v)) to.style.setProperty(p, v);
        }
      }
      copyStyles(draft, t);
      if (draft.caption) t.append(make("caption", draft.caption.textContent));
      const body = make("tbody");
      rows(draft).forEach((row, ri) => {
        const tr = make("tr");
        [...row.cells].forEach((cell, ci) => {
          const td = make(cell.tagName.toLowerCase(), cell.textContent || "—");
          td.colSpan = cell.colSpan;
          td.rowSpan = cell.rowSpan;
          copyStyles(cell, td);
          td.dataset.selected = String(ri === r && ci === c);
          td.tabIndex = 0;
          td.setAttribute(
            "aria-label",
            "Row " + (ri + 1) + ", cell " + (ci + 1) + ": " + cell.textContent.slice(0, 100),
          );
          td.onclick = () => {
            r = ri;
            c = ci;
            render();
            q("preview").querySelector("[data-selected=true]")?.focus({ preventScroll: true });
          };
          td.onkeydown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              r = ri;
              c = ci;
              render();
              q("preview").querySelector("[data-selected=true]")?.focus({ preventScroll: true });
            }
          };
          tr.append(td);
        });
        body.append(tr);
      });
      t.append(body);
      host.append(t);
    }
    function render() {
      const { rs, row } = selection();
      q("row").replaceChildren();
      rs.forEach((_, i) => {
        const o = make("option", "Row " + (i + 1));
        o.value = i;
        q("row").append(o);
      });
      q("row").value = String(r);
      q("column").replaceChildren();
      [...(row?.cells || [])].forEach((_, i) => {
        const o = make("option", "Cell " + (i + 1));
        o.value = i;
        q("column").append(o);
      });
      q("column").value = String(c);
      const nested = !!draft.querySelector("table");
      q("stage-cells").disabled = !editable || nested || !row;
      q("scope").querySelector("[value=column]").disabled = !simple(draft);
      if (!simple(draft) && q("scope").value === "column") q("scope").value = "cell";
      q("stage-layout").disabled = !editable || nested;
      d.querySelectorAll("[data-op]").forEach((b) => (b.disabled = !editable || !simple(draft)));
      q("complex").textContent = nested
        ? "Nested tables: editing is protected in this studio."
        : simple(draft)
          ? "New rows and columns are blank. Column insertion/deletion clears old column-width overrides. New cells require ID inspection in Document structure."
          : "Merged or irregular cells: row/column changes are protected; layout and direct cell formatting remain available.";
      q("operations").replaceChildren();
      for (const op of ops) q("operations").append(make("li", op));
      if (!ops.length) q("operations").append(make("li", "No changes staged."));
      q("status").textContent =
        rs.length +
        " rows · " +
        cells(draft).length +
        " cells · " +
        ops.length +
        " staged operation(s). " +
        (changed() ? "Not applied to the document." : "Document unchanged.");
      q("delete-confirm").hidden = !destructive;
      q("apply").disabled = !editable || invalid || !changed();
      q("reset").disabled = !changed();
      preview();
    }
    q("table").onchange = () => {
      const index = Number(q("table").value);
      if (changed()) {
        q("table").value = String(available.indexOf(source));
        q("error").textContent = "Apply or reset the current table draft before selecting another table.";
        return;
      }
      load(available[index]);
    };
    q("row").onchange = () => {
      r = Number(q("row").value);
      c = 0;
      render();
    };
    q("column").onchange = () => {
      c = Number(q("column").value);
      render();
    };
    q("stage-layout").onclick = () => {
      const raw = q("width").value,
        width = Number(raw);
      if (raw && (!Number.isInteger(width) || width < 10 || width > 100)) {
        q("error").textContent = "Use a whole-number width from 10 to 100%, or leave it blank.";
        return;
      }
      const caption = q("caption").value,
        canCaption = !draft.caption?.children.length;
      stage(
        "Update table width, alignment or caption",
        () => {
          if (raw) draft.style.width = width + "%";
          const align = q("align").value;
          if (align) {
            draft.style.marginLeft = align === "left" ? "0" : "auto";
            draft.style.marginRight = align === "right" ? "0" : "auto";
          }
          if (canCaption && caption !== (draft.caption?.textContent || "")) {
            if (!caption) draft.caption?.remove();
            else {
              const cap = draft.caption || draft.createCaption();
              cap.textContent = caption;
            }
          }
        },
        canCaption && !!draft.caption && !caption,
      );
    };
    q("stage-cells").onclick = () => {
      const pad = q("padding").value,
        padding = Number(pad);
      if (pad && (!Number.isInteger(padding) || padding < 0 || padding > 32)) {
        q("error").textContent = "Use whole-number padding from 0 to 32 px.";
        return;
      }
      const { rs, row, cell } = selection(),
        scope = q("scope").value;
      const targets =
        scope === "all"
          ? cells(draft)
          : scope === "row"
            ? [...row.cells]
            : scope === "column"
              ? rs.map((tr) => tr.cells[c]).filter(Boolean)
              : [cell];
      stage("Format " + scope + " · " + targets.length + " cell(s)", () => {
        for (const n of targets) {
          if (q("text").value) n.style.textAlign = q("text").value;
          if (q("vertical").value) n.style.verticalAlign = q("vertical").value;
          if (pad) n.style.padding = padding + "px";
          if (q("border").value !== "")
            n.style.border =
              q("border").value === "0" ? "0px solid transparent" : q("border").value + "px solid #8da7bd";
          if (q("fill").value) n.style.backgroundColor = q("fill").value;
        }
      });
    };
    d.querySelectorAll("[data-op]").forEach((b) => (b.onclick = () => structure(b.dataset.op)));
    q("reset").onclick = () => load(source);
    q("close").onclick = () => close();
    q("discard").onclick = () => close(true);
    q("apply").onclick = () => {
      if (!valid()) {
        q("error").textContent =
          "Document or session changed. No table changes were applied. Discard and reopen.";
        q("apply").disabled = true;
        return;
      }
      if (destructive && !q("confirm").checked) {
        q("error").textContent = "Review and confirm the deletions before applying.";
        return;
      }
      if (!changed()) return;
      const replacement = draft.cloneNode(true),
        count = ops.length;
      const ok = EditorTransactions.run("Table Studio · " + count + " staged operations", () => {
        source.replaceWith(replacement);
        EditorCommands.clear();
      });
      if (ok) {
        close(true);
        toast("Table updated. Undo is available. Export HTML to keep this revision.");
      } else {
        invalid = true;
        q("error").textContent = "Table update failed. Close and reopen before retrying.";
        q("apply").disabled = true;
      }
    };
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("close", () => close(true), { once: true });
    d.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const unsubscribe = EditorSession.subscribe((s) => {
      if (s.pid !== pid) {
        invalid = true;
        q("edit").disabled = true;
        q("apply").disabled = true;
        q("error").textContent = "Editing session changed. Close and reopen Table Studio.";
      }
    });
    document.body.append(d);
    d.showModal();
    load(source, current);
    q("table").focus();
    if (initialAction) {
      if (current && editable) structure(initialAction);
      else q("error").textContent = "Select the intended row and cell before staging a structural operation.";
    }
  }
  return Object.freeze({ open });
})();
(() => {
  const toolbar = document.querySelector(".toolbar");
  toolbar.querySelectorAll("[data-table-studio-v26]").forEach((n) => n.remove());
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.tableStudioV26 = "true";
  b.dataset.commandV24 = "tables";
  b.textContent = "Table Studio";
  b.setAttribute("onclick", "TableStudio.open()");
  toolbar.append(b);
})();
