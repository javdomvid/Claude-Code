/* ============================================================================
 * SOPHIA · 14-commands
 * Selection memory and text/paragraph/table commands (execCommand adapter + transactions).
 * Reused from V76 (editor-commands-v12); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V12: shared selection/command service. No framework or network dependency.
   Browser text commands remain an adapter; block/table mutations are explicit transactions. */
window.EditorCommands = (() => {
  "use strict";
  let config = null,
    remembered = null;
  const blockSelector = "p,li,h1,h2,h3,h4,blockquote,td,th";
  function root() {
    return config.area;
  }
  function allowed() {
    return !!window.EditorSession?.get().pid && !document.body.classList.contains("focusmode");
  }
  function valid(range) {
    if (!range || !range.startContainer.isConnected || !range.endContainer.isConnected) return false;
    let node =
      range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
    let host = node?.closest("[contenteditable=true]");
    return (
      !!host &&
      root().contains(host) &&
      root().contains(range.startContainer) &&
      root().contains(range.endContainer) &&
      !node.closest(".identity,[data-trace]")
    );
  }
  function remember() {
    if (!config || !allowed()) return;
    let selection = getSelection();
    if (selection.rangeCount && valid(selection.getRangeAt(0)))
      remembered = selection.getRangeAt(0).cloneRange();
  }
  function restore(range = remembered, quiet = false) {
    if (!allowed()) {
      if (!quiet) config.notify("Start editing with your PID first.");
      return false;
    }
    if (!valid(range)) {
      if (!quiet)
        config.notify(
          "Place the cursor in the document again. The previous selection is no longer available.",
        );
      return false;
    }
    let node =
      range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    node.closest("[contenteditable=true]")?.focus({ preventScroll: true });
    let selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range.cloneRange());
    return true;
  }
  function transact(fn, range = remembered) {
    if (!restore(range)) return false;
    const ok = EditorTransactions.run("Text / paragraph / table command", fn);
    if (ok) remember();
    return ok;
  }
  function command(name, value = null) {
    if (name === "undo") {
      if (allowed()) config.undo(-1);
      return;
    }
    if (name === "redo") {
      if (allowed()) config.undo(1);
      return;
    }
    return transact(() => {
      let ok = document.execCommand(name, false, value);
      if (!ok) config.notify("This browser could not apply that command to the current selection.");
      return ok;
    });
  }
  function blocks() {
    if (!restore(remembered, true)) return [];
    let range = getSelection().getRangeAt(0);
    if (range.collapsed) {
      let n = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
      let b = n.closest(blockSelector);
      return b && root().contains(b) ? [b] : [];
    }
    let list = [
      ...root().querySelectorAll(
        ".pagecontent p,.pagecontent li,.pagecontent h1,.pagecontent h2,.pagecontent h3,.pagecontent h4,.pagecontent blockquote,.pagecontent td,.pagecontent th,.qc-hero h1,.qc-hero>p",
      ),
    ].filter((n) => range.intersectsNode(n));
    return list.filter((n) => !list.some((c) => c !== n && n.contains(c)));
  }
  const properties = {
    textAlign: (v) => ["left", "center", "right", "justify"].includes(v),
    lineHeight: (v) => /^(1|1\.15|1\.5|2|2\.5|3)$/.test(String(v)),
    marginTop: (v) => /^\d+(\.\d+)?pt$/.test(v),
    marginBottom: (v) => /^\d+(\.\d+)?pt$/.test(v),
    marginLeft: (v) => /^-?\d+(\.\d+)?mm$/.test(v),
    marginRight: (v) => /^-?\d+(\.\d+)?mm$/.test(v),
    textIndent: (v) => /^-?\d+(\.\d+)?mm$/.test(v),
    backgroundColor: (v) => /^#[0-9a-f]{6}$/i.test(v),
    borderBottom: (v) => v === "1px solid #8899aa",
  };
  function paragraph(key, value) {
    if (!properties[key]?.(String(value))) {
      config.notify("Unsupported paragraph value.");
      return false;
    }
    let targets = blocks();
    if (!targets.length) {
      config.notify("Select a paragraph or place the cursor inside one.");
      return false;
    }
    return transact(() => {
      targets.forEach((n) => (n.style[key] = value));
      let info = document.getElementById("selectionInfo");
      if (info) info.textContent = targets.length + " paragraph(s) updated";
      return true;
    });
  }
  function resetParagraph() {
    let targets = blocks();
    return transact(() => targets.forEach((n) => Object.keys(properties).forEach((k) => (n.style[k] = ""))));
  }
  function dialog(title, fields, apply, label = "Apply") {
    if (!allowed()) {
      config.notify("Start editing first.");
      return;
    }
    remember();
    let range = remembered?.cloneRange();
    let originStart = range?.startContainer,
      originEnd = range?.endContainer;
    const unchanged = () =>
      valid(range) &&
      originStart?.isConnected &&
      originEnd?.isConnected &&
      range.startContainer === originStart &&
      range.endContainer === originEnd;
    if (!valid(range)) {
      config.notify("Place the cursor in the document before opening this tool.");
      return;
    }
    document.querySelectorAll("dialog.command-dialog").forEach((n) => {
      n.close();
      n.remove();
    });
    let d = document.createElement("dialog");
    d.className = "command-dialog";
    d.setAttribute("aria-labelledby", "command-title");
    let card = document.createElement("form");
    card.method = "dialog";
    let header = document.createElement("header"),
      h = document.createElement("h2");
    h.id = "command-title";
    h.textContent = title;
    let help = document.createElement("p");
    help.textContent = "Applies to the document selection you made before opening this tool.";
    header.append(h, help);
    let body = document.createElement("section"),
      inputs = {};
    fields.forEach((f) => {
      let l = document.createElement("label");
      l.textContent = f.label;
      let input = document.createElement(f.options ? "select" : "input");
      input.id = "command-" + f.id;
      input.name = f.id;
      if (f.options)
        f.options.forEach(([value, text]) => {
          let o = document.createElement("option");
          o.value = value;
          o.textContent = text;
          input.append(o);
        });
      else {
        input.type = f.type || "text";
        if (f.min !== undefined) input.min = f.min;
        if (f.max !== undefined) input.max = f.max;
        if (f.type === "number") input.step = "1";
      }
      input.required = !!f.required;
      input.value = f.value ?? "";
      input.addEventListener("input", () =>
        input.setAttribute("aria-invalid", String(!input.checkValidity())),
      );
      l.append(input);
      body.append(l);
      inputs[f.id] = input;
    });
    let error = document.createElement("p");
    error.className = "command-error";
    error.setAttribute("role", "alert");
    body.append(error);
    let footer = document.createElement("footer"),
      cancel = document.createElement("button"),
      ok = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.onclick = () => {
      d.close();
      d.remove();
      restore(range, true);
    };
    ok.type = "button";
    ok.className = "primary";
    ok.textContent = label;
    ok.onclick = () => {
      for (let input of Object.values(inputs)) if (!input.reportValidity()) return;
      if (!unchanged()) {
        error.textContent =
          "The original insertion point changed. Cancel and select a new position; nothing has been inserted.";
        return;
      }
      let values = Object.fromEntries(Object.entries(inputs).map(([k, n]) => [k, n.value]));
      let check = apply(values, true);
      if (typeof check === "string") {
        error.textContent = check;
        return;
      }
      d.close();
      d.remove();
      remembered = range;
      transact(() => apply(values, false), range);
    };
    footer.append(cancel, ok);
    card.append(header, body, footer);
    d.append(card);
    document.body.append(d);
    d.addEventListener(
      "cancel",
      () => {
        queueMicrotask(() => {
          d.remove();
          restore(range, true);
        });
      },
      { once: true },
    );
    card.addEventListener("submit", (e) => {
      e.preventDefault();
      ok.click();
    });
    d.showModal();
    Object.values(inputs)[0]?.focus();
    return d;
  }
  function insertNode(node) {
    let range = getSelection().getRangeAt(0);
    range.deleteContents();
    let parent =
      range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;
    let block = parent.closest("p,h1,h2,h3,h4");
    if (block && range.collapsed) {
      let tailRange = document.createRange();
      tailRange.selectNodeContents(block);
      tailRange.setStart(range.startContainer, range.startOffset);
      let tail = tailRange.extractContents();
      block.after(node);
      let after = document.createElement("p");
      after.append(tail);
      if (!after.textContent && !after.querySelector("img")) after.append(document.createElement("br"));
      node.after(after);
      let next = document.createRange();
      next.selectNodeContents(after);
      next.collapse(true);
      getSelection().removeAllRanges();
      getSelection().addRange(next);
    } else {
      range.insertNode(node);
      range.setStartAfter(node);
      range.collapse(true);
      getSelection().removeAllRanges();
      getSelection().addRange(range);
    }
  }
  function insertTable() {
    return dialog(
      "Insert table",
      [
        { id: "rows", label: "Rows", type: "number", min: 1, max: 30, required: true, value: 3 },
        { id: "columns", label: "Columns", type: "number", min: 1, max: 12, required: true, value: 3 },
        {
          id: "header",
          label: "Header row",
          options: [
            ["yes", "First row is a header"],
            ["no", "No header row"],
          ],
          value: "yes",
        },
      ],
      (v, check) => {
        let rows = Number(v.rows),
          cols = Number(v.columns);
        if (
          !Number.isInteger(rows) ||
          rows < 1 ||
          rows > 30 ||
          !Number.isInteger(cols) ||
          cols < 1 ||
          cols > 12
        )
          return "Use 1–30 rows and 1–12 columns.";
        if (check) return;
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");
        for (let i = 0; i < rows; i++) {
          let tr = document.createElement("tr");
          for (let j = 0; j < cols; j++) {
            let cell = document.createElement(i === 0 && v.header === "yes" ? "th" : "td");
            if (cell.tagName === "TH") {
              cell.scope = "col";
              cell.textContent = "Column " + (j + 1);
            } else cell.textContent = "Text";
            tr.append(cell);
          }
          tbody.append(tr);
        }
        table.append(tbody);
        insertNode(table);
      },
      "Insert table",
    );
  }
  function insertLink() {
    let selected = remembered?.toString() || "";
    return dialog(
      "Insert link",
      [
        { id: "url", label: "HTTPS address", type: "url", required: true, value: "https://" },
        { id: "text", label: "Link text", required: true, value: selected },
      ],
      (v, check) => {
        let url;
        try {
          url = new URL(v.url);
        } catch {
          return "Enter a valid HTTPS address.";
        }
        if (url.protocol !== "https:") return "Only HTTPS addresses are accepted.";
        if (!v.text.trim()) return "Enter link text.";
        if (check) return;
        let a = document.createElement("a");
        a.href = url.href;
        a.rel = "noopener noreferrer";
        a.textContent = v.text;
        let range = getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(a);
        range.setStartAfter(a);
        range.collapse(true);
        getSelection().removeAllRanges();
        getSelection().addRange(range);
      },
      "Insert link",
    );
  }
  function paragraphDialog() {
    let targets = blocks();
    if (!targets.length) {
      config.notify("Place the cursor in a paragraph first.");
      return;
    }
    let n = targets[0];
    return dialog(
      "Paragraph settings",
      [
        {
          id: "align",
          label: "Alignment",
          options: [
            ["left", "Left"],
            ["center", "Centre"],
            ["right", "Right"],
            ["justify", "Justify"],
          ],
          value: n.style.textAlign || "left",
        },
        {
          id: "line",
          label: "Line spacing",
          options: [
            ["1", "Single"],
            ["1.15", "1.15"],
            ["1.5", "1.5"],
            ["2", "Double"],
          ],
          value: ["1", "1.15", "1.5", "2"].includes(n.style.lineHeight) ? n.style.lineHeight : "1.5",
        },
        {
          id: "before",
          label: "Space before (pt)",
          type: "number",
          min: 0,
          max: 96,
          required: true,
          value: parseInt(n.style.marginTop) || 0,
        },
        {
          id: "after",
          label: "Space after (pt)",
          type: "number",
          min: 0,
          max: 96,
          required: true,
          value: parseInt(n.style.marginBottom) || 0,
        },
      ],
      (v, check) => {
        if (check) return;
        targets.forEach((n) => {
          n.style.textAlign = v.align;
          n.style.lineHeight = v.line;
          n.style.marginTop = v.before + "pt";
          n.style.marginBottom = v.after + "pt";
        });
      },
      "Apply paragraph settings",
    );
  }
  function tableAction(action) {
    if (!allowed()) {
      config.notify("Start editing first.");
      return;
    }
    if (!restore(remembered)) return;
    window.TableStudio.open(action);
  }
  function textSize(value) {
    let size = Number(value);
    if (!Number.isFinite(size) || size < 7 || size > 72) {
      config.notify("Use a font size from 7 to 72 pt.");
      return;
    }
    return transact(() => {
      let existing = new Set(root().querySelectorAll('font[size="7"]'));
      document.execCommand("fontSize", false, "7");
      root()
        .querySelectorAll('font[size="7"]')
        .forEach((n) => {
          if (!existing.has(n)) {
            n.removeAttribute("size");
            n.style.fontSize = size + "pt";
          }
        });
    });
  }
  function attach(c) {
    if (config) return;
    config = c;
    document.addEventListener("selectionchange", remember);
    document.addEventListener(
      "keydown",
      (e) => {
        if (
          document.querySelector("dialog.command-dialog[open]") &&
          (e.ctrlKey || e.metaKey) &&
          ["s", "z", "y", "p"].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
    window.EditorSession?.refresh();
  }
  return Object.freeze({
    attach,
    remember,
    restore,
    command,
    textSize,
    blocks,
    paragraph,
    resetParagraph,
    insertTable,
    insertLink,
    paragraphDialog,
    tableAction,
    clear() {
      remembered = null;
    },
    hasSelection() {
      return valid(remembered);
    },
  });
})();

EditorCommands.attach({ area, capture, undo: stepUndo, notify: toast });
