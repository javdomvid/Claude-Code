/* ============================================================================
 * SOPHIA · 85-flow
 * Fluid editing tools: selection bar, context menu, "/" menu, structured paste, changes since last save, shortcuts help.
 * Reused from V76 (sophia-v76-flow); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* SOPHIA V76 · Lote 2 · Edición fluida (W-01, W-02, W-03, W-04, W-06, W-10, W-12).
   Reglas: solo llama a comandos existentes (EditorCommands, EditorMedia, TableStudio, TableFlow,
   openDocumentFind, replaceDialog); toda mutación propia pasa por EditorTransactions.run; los nodos
   de interfaz llevan data-runtime (no se serializan) y viven fuera de #document; nada de esto
   cambia #record, el PID ni el folio impreso. El resaltado de cambios usa CSS Highlight API: no
   añade clases ni atributos al documento, así que no entra en instantáneas ni en canonical(). */
window.SophiaFlow = (() => {
  "use strict";
  const area = document.getElementById("document");
  if (!area) return null;
  /* Intro crea <p> (no <div>): coherente con el contenido y con normalizeBody(). */
  try {
    document.execCommand("defaultParagraphSeparator", false, "p");
  } catch {}

  /* ---------- utilidades ---------- */
  const editing = () => !!window.EditorSession?.get().pid && !document.body.classList.contains("focusmode");
  const dialogOpen = () => !!document.querySelector("dialog[open],.modalveil,#historyStudio,#p42-print");
  const nodeOf = (n) => (n?.nodeType === 1 ? n : n?.parentElement);
  const notify = (text) => (typeof toast === "function" ? toast(text) : console.info(text));
  function make(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function editableHost(node) {
    const el = nodeOf(node);
    if (!el || !area.contains(el)) return null;
    const host = el.closest("[contenteditable=true]");
    if (!host || el.closest(".identity,[data-trace]")) return null;
    return host;
  }
  function inBody(node) {
    const el = nodeOf(node);
    return !!el?.closest(".pagecontent") && !el.closest(".identity,[data-trace]");
  }
  function currentRange() {
    const s = getSelection();
    return s.rangeCount ? s.getRangeAt(0).cloneRange() : null;
  }
  function restore(range) {
    return range ? window.EditorCommands?.restore(range, true) : false;
  }
  function topBlock(node) {
    let el = nodeOf(node);
    while (el && el.parentElement && !el.parentElement.matches(".pagecontent")) el = el.parentElement;
    return el?.parentElement?.matches(".pagecontent") ? el : null;
  }
  function caretTo(node, atEnd = true) {
    const r = document.createRange();
    r.selectNodeContents(node);
    r.collapse(!atEnd);
    const s = getSelection();
    s.removeAllRanges();
    s.addRange(r);
  }
  const SVG = "http://www.w3.org/2000/svg";
  function icon(d) {
    const svg = document.createElementNS(SVG, "svg"),
      p = document.createElementNS(SVG, "path");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "sv76-icon");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "1.75");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    svg.append(p);
    return svg;
  }
  const ICONS = {
    highlight: "M4 20h7M14.5 4.5l5 5L11 18H6v-5z",
    link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
    clear: "M6 4h12M12 4l-4 16M4 20l16-16",
  };

  /* ---------- menú genérico (contextual, «/», símbolos) ---------- */
  let activeMenu = null;
  function closeMenu(restoreFocus = true) {
    if (!activeMenu) return;
    const m = activeMenu;
    activeMenu = null;
    document.removeEventListener("pointerdown", m.outside, true);
    m.el.remove();
    if (restoreFocus && m.range) restore(m.range);
  }
  function openMenu(items, x, y, { label = "Menu", range = currentRange(), filter = false } = {}) {
    closeMenu(false);
    const el = make("div", "sv76-menu");
    el.dataset.runtime = "";
    el.setAttribute("role", "menu");
    el.setAttribute("aria-label", label);
    let input = null;
    if (filter) {
      input = make("input");
      input.type = "search";
      input.placeholder = "Type to filter…";
      input.setAttribute("aria-label", "Filter " + label);
      el.append(input);
    }
    const list = make("div", "sv76-menu-list");
    el.append(list);
    function render() {
      list.replaceChildren();
      const term = (input?.value || "").trim().toLowerCase();
      const shown = items.filter((it) =>
        it.separator ? !term : !term || (it.label + " " + (it.keywords || "")).toLowerCase().includes(term),
      );
      for (const it of shown) {
        if (it.separator) {
          list.append(make("hr"));
          continue;
        }
        const b = make("button");
        b.type = "button";
        b.setAttribute("role", "menuitem");
        if (it.danger) b.classList.add("sv76-danger");
        b.append(make("span", "", it.label));
        if (it.hint) b.append(make("small", "", it.hint));
        if (it.disabled) {
          b.setAttribute("aria-disabled", "true");
          b.title = it.disabled === true ? "" : it.disabled;
        }
        b.addEventListener("mousedown", (e) => e.preventDefault());
        b.addEventListener("click", () => {
          if (it.disabled) return;
          closeMenu(false);
          if (it.keepSelection !== false) restore(range);
          try {
            it.run();
          } catch (e) {
            notify("Could not complete: " + e.message);
          }
        });
        list.append(b);
      }
      if (!list.children.length) list.append(make("p", "sv76-empty", "No matching action."));
    }
    render();
    document.body.append(el);
    const w = el.offsetWidth,
      h = el.offsetHeight;
    el.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + "px";
    el.style.top = Math.max(8, Math.min(y, innerHeight - h - 8)) + "px";
    const buttons = () => [...list.querySelectorAll("[role=menuitem]:not([aria-disabled=true])")];
    el.addEventListener("keydown", (e) => {
      const bs = buttons(),
        i = bs.indexOf(document.activeElement);
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeMenu(true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        bs[(i + 1) % bs.length]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        bs[(i - 1 + bs.length) % bs.length]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        bs[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        bs.at(-1)?.focus();
      } else if (e.key === "Enter" && e.target === input) {
        e.preventDefault();
        bs[0]?.click();
      } else if (e.key === "Tab") {
        closeMenu(true);
      }
    });
    if (input) input.addEventListener("input", render);
    const outside = (e) => {
      if (!el.contains(e.target)) closeMenu(false);
    };
    document.addEventListener("pointerdown", outside, true);
    activeMenu = { el, range, outside };
    (input || buttons()[0])?.focus({ preventScroll: true });
    return el;
  }
  function caretPoint(range) {
    const real = (r) => (r && (r.left || r.top || r.width || r.height) ? r : null);
    const r =
      real(range?.getClientRects()[0]) ||
      real(range?.getBoundingClientRect()) ||
      real(nodeOf(range?.startContainer)?.getBoundingClientRect());
    return r ? { x: r.left, y: r.bottom + 6 } : { x: innerWidth / 2 - 120, y: 160 };
  }

  /* ---------- W-01 · mini-barra de selección ---------- */
  const bar = make("div", "sv76-selbar");
  bar.dataset.runtime = "";
  bar.hidden = true;
  bar.setAttribute("role", "toolbar");
  bar.setAttribute("aria-label", "Quick formatting (Alt+F10)");
  function barButton(content, label, run, cls) {
    const b = make("button", cls || "");
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.title = label;
    if (typeof content === "string") b.textContent = content;
    else b.append(content);
    b.addEventListener("mousedown", (e) => e.preventDefault());
    b.addEventListener("click", () => {
      run();
      queueMicrotask(placeBar);
    });
    bar.append(b);
    return b;
  }
  barButton("B", "Bold (Ctrl+B)", () => EditorCommands.command("bold"), "sv76-b");
  barButton("I", "Italic (Ctrl+I)", () => EditorCommands.command("italic"), "sv76-i");
  barButton("U", "Underline (Ctrl+U)", () => EditorCommands.command("underline"), "sv76-u");
  barButton("S", "Strikethrough", () => EditorCommands.command("strikeThrough"), "sv76-s");
  barButton(icon(ICONS.highlight), "Highlight", () => EditorCommands.command("hiliteColor", "#fff099"));
  barButton(icon(ICONS.link), "Insert link…", () => EditorCommands.insertLink());
  barButton(icon(ICONS.clear), "Clear formatting", () => EditorCommands.command("removeFormat"));
  bar.addEventListener("keydown", (e) => {
    const bs = [...bar.querySelectorAll("button")],
      i = bs.indexOf(document.activeElement);
    if (e.key === "Escape") {
      e.preventDefault();
      bar.hidden = true;
      restore(barRange);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      bs[(i + 1) % bs.length].focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      bs[(i - 1 + bs.length) % bs.length].focus();
    }
  });
  document.body.append(bar);
  let barRange = null,
    pointerDown = false,
    barTimer = 0;
  function selectionForBar() {
    if (!editing() || dialogOpen() || activeMenu) return null;
    const s = getSelection();
    if (!s.rangeCount || s.isCollapsed) return null;
    if (!editableHost(s.anchorNode) || !editableHost(s.focusNode)) return null;
    return s.getRangeAt(0);
  }
  function placeBar() {
    if (bar.contains(document.activeElement)) return;
    const r = selectionForBar();
    if (!r || pointerDown) {
      bar.hidden = true;
      return;
    }
    barRange = r.cloneRange();
    const rect = r.getBoundingClientRect();
    if (!rect.width && !rect.height) {
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    const w = bar.offsetWidth,
      h = bar.offsetHeight;
    const above = rect.top - h - 8;
    bar.style.left = Math.max(8, Math.min(innerWidth - w - 8, rect.left + rect.width / 2 - w / 2)) + "px";
    bar.style.top = (above > 64 ? above : rect.bottom + 8) + "px";
  }
  const scheduleBar = () => {
    clearTimeout(barTimer);
    barTimer = setTimeout(placeBar, 120);
  };
  document.addEventListener("selectionchange", scheduleBar);
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (!bar.contains(e.target)) {
        pointerDown = true;
        bar.hidden = true;
      }
    },
    true,
  );
  document.addEventListener(
    "pointerup",
    () => {
      pointerDown = false;
      scheduleBar();
    },
    true,
  );
  addEventListener("scroll", scheduleBar, true);
  addEventListener("resize", scheduleBar);

  /* ---------- W-03 · menú «/» e inserción de bloques ---------- */
  function insertCallout(block, label) {
    return EditorTransactions.run("Insert callout", () => {
      const aside = make("aside", "warning"),
        b = make("b", "", label),
        text = document.createTextNode(" ");
      aside.append(b, text);
      if (block.matches("p,h1,h2,h3,h4,blockquote") && !block.textContent.trim()) block.replaceWith(aside);
      else block.after(aside);
      const r = document.createRange();
      r.setStart(text, 1);
      r.collapse(true);
      getSelection().removeAllRanges();
      getSelection().addRange(r);
    });
  }
  const SYMBOLS = [
    "→",
    "←",
    "↑",
    "↓",
    "✓",
    "✗",
    "⚠",
    "•",
    "–",
    "—",
    "…",
    "©",
    "®",
    "™",
    "°",
    "±",
    "×",
    "÷",
    "≤",
    "≥",
    "≠",
    "≈",
    "€",
    "£",
    "§",
    "¶",
    " ",
  ];
  function openSymbols(range) {
    const p = caretPoint(range);
    openMenu(
      SYMBOLS.map((s) => ({
        label: s === " " ? "Non-breaking space" : s,
        keywords: s,
        run: () => EditorCommands.command("insertText", s),
      })),
      p.x,
      p.y,
      { label: "Symbols", range, filter: true },
    );
  }
  function blockItems(block, range) {
    const fmt = (tag) => () => EditorCommands.command("formatBlock", tag);
    return [
      { label: "Normal text", hint: "Ctrl+Alt+0", keywords: "paragraph p", run: fmt("p") },
      { label: "Heading 1", hint: "Ctrl+Alt+1", keywords: "title h1 section", run: fmt("h2") },
      { label: "Heading 2", hint: "Ctrl+Alt+2", keywords: "subtitle h2 subsection", run: fmt("h3") },
      { label: "Heading 3", hint: "Ctrl+Alt+3", keywords: "h3", run: fmt("h4") },
      {
        label: "Bulleted list",
        hint: "Ctrl+Shift+8",
        keywords: "bullets ul",
        run: () => EditorCommands.command("insertUnorderedList"),
      },
      {
        label: "Numbered list",
        hint: "Ctrl+Shift+7",
        keywords: "numbering ol steps",
        run: () => EditorCommands.command("insertOrderedList"),
      },
      { label: "Quote", keywords: "blockquote", run: fmt("blockquote") },
      { separator: true },
      { label: "Table…", keywords: "grid rows columns", run: () => EditorCommands.insertTable() },
      { label: "Image or screenshot…", keywords: "picture png capture", run: () => EditorMedia.open() },
      {
        label: "Warning callout",
        keywords: "aside note caution",
        run: () => insertCallout(block, "Warning:"),
      },
      {
        label: "Confirmation required",
        keywords: "tbc pending to be confirmed",
        run: () => insertCallout(block, "Confirmation required:"),
      },
      {
        label: "Horizontal line",
        keywords: "divider hr rule",
        run: () => EditorCommands.command("insertHorizontalRule"),
      },
      {
        label: "Start on a new page",
        keywords: "page break a4 layout",
        run: () => {
          if (
            EditorTransactions.run("Start block on a new page", () => {
              block.dataset.layoutBefore = "page";
            })
          )
            notify("This block starts on a new A4 page. Check it in A4 pages or Layout Studio.");
        },
      },
      { separator: true },
      {
        label: "Insert today's date",
        keywords: "date today",
        run: () =>
          EditorCommands.command(
            "insertText",
            new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          ),
      },
      {
        label: "Symbol…",
        keywords: "character arrow check special",
        keepSelection: false,
        run: () => openSymbols(range),
      },
    ];
  }
  function openSlash(block, range = currentRange()) {
    const p = caretPoint(range);
    openMenu(blockItems(block, range), p.x, p.y, { label: "Insert block", range, filter: true });
  }
  function insertBelow(range) {
    const top = topBlock(range?.startContainer);
    if (!top) {
      notify("Place the cursor in the document body first.");
      return;
    }
    let p = null;
    const ok = EditorTransactions.run("Insert block below", () => {
      p = make("p");
      p.append(make("br"));
      top.after(p);
      caretTo(p, false);
    });
    if (ok && p) {
      EditorCommands.remember();
      openSlash(p, currentRange());
    }
  }
  area.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey || !editing() || dialogOpen()) return;
    const s = getSelection();
    if (!s.rangeCount || !s.isCollapsed || !inBody(s.anchorNode) || !editableHost(s.anchorNode)) return;
    const block = nodeOf(s.anchorNode).closest("p,h1,h2,h3,h4,blockquote,div:not(.pagecontent)");
    if (
      !block ||
      !block.closest(".pagecontent") ||
      block.matches(".pagecontent") ||
      block.closest("td,th,li") ||
      block.textContent.trim()
    )
      return;
    e.preventDefault();
    openSlash(block, s.getRangeAt(0).cloneRange());
  });

  /* ---------- W-02 · menú contextual ---------- */
  function setSelectedImage(img) {
    area.querySelectorAll("img.selected").forEach((n) => n.classList.remove("selected"));
    try {
      selectedImage = img;
    } catch {
      /* el núcleo cambió: degradar sin romper */
    }
    img.classList.add("selected");
  }
  function contextItems(target, range) {
    const img = target.closest?.(".pagecontent img");
    if (img) {
      setSelectedImage(img);
      return [
        { label: "Size & spacing…", run: () => EditorMedia.precise(), keepSelection: false },
        { label: "Image Layout Studio…", run: () => EditorMedia.studio(), keepSelection: false },
        { label: "Alternative text & caption…", run: () => side("images"), keepSelection: false },
        { label: "Replace image…", run: () => EditorMedia.replace(), keepSelection: false },
        { separator: true },
        { label: "Move up", hint: "Alt+↑", run: () => EditorMedia.stepMove(-1), keepSelection: false },
        { label: "Move down", hint: "Alt+↓", run: () => EditorMedia.stepMove(1), keepSelection: false },
        { separator: true },
        { label: "Delete image", danger: true, run: () => EditorMedia.remove(), keepSelection: false },
      ];
    }
    const hasText = range && !range.collapsed;
    const items = [
      {
        label: "Cut",
        hint: "Ctrl+X",
        disabled: !hasText,
        run: () => {
          document.execCommand("copy");
          EditorCommands.command("delete");
        },
      },
      { label: "Copy", hint: "Ctrl+C", disabled: !hasText, run: () => document.execCommand("copy") },
      {
        label: "Paste as plain text",
        hint: "Ctrl+Shift+V",
        run: async () => {
          try {
            const text = await navigator.clipboard.readText();
            restore(range);
            if (text) EditorCommands.command("insertText", text);
          } catch {
            notify("The browser blocked clipboard access here. Use Ctrl+Shift+V.");
          }
        },
      },
      { separator: true },
      { label: "Link…", hint: "", run: () => EditorCommands.insertLink() },
      { label: "Paragraph settings…", run: () => EditorCommands.paragraphDialog() },
      { label: "Normal text", hint: "Ctrl+Alt+0", run: () => EditorCommands.command("formatBlock", "p") },
      { label: "Heading 1", hint: "Ctrl+Alt+1", run: () => EditorCommands.command("formatBlock", "h2") },
      { label: "Heading 2", hint: "Ctrl+Alt+2", run: () => EditorCommands.command("formatBlock", "h3") },
      { separator: true },
      { label: "Insert block below…", hint: "/", keepSelection: false, run: () => insertBelow(range) },
      { separator: true },
      { label: "Add comment…", hint: "Ctrl+Alt+M", run: () => SOPHIA.comments?.add() },
      { label: "Mark as To Be Confirmed", hint: "Ctrl+Shift+T", run: () => SOPHIA.tbc?.toggle() },
      { label: "Move block up", hint: "Alt+↑", run: () => SOPHIA.blocks?.move(-1) },
      { label: "Move block down", hint: "Alt+↓", run: () => SOPHIA.blocks?.move(1) },
    ];
    if (target.closest?.(".pagecontent td,.pagecontent th") && !target.closest(".identity")) {
      const ta = (a) => () => EditorCommands.tableAction(a);
      items.push(
        { separator: true },
        { label: "Insert row above", run: ta("rowBefore") },
        { label: "Insert row below", run: ta("row") },
        { label: "Insert column left", run: ta("columnBefore") },
        { label: "Insert column right", run: ta("column") },
        { label: "Toggle header row", run: ta("header") },
        { label: "Delete row", danger: true, run: ta("deleteRow") },
        { label: "Delete column", danger: true, run: ta("deleteColumn") },
        { label: "Table Studio…", run: () => TableStudio.open() },
      );
      if (window.TableFlow) items.push({ label: "Table Flow…", run: () => TableFlow.open() });
    }
    return items;
  }
  area.addEventListener("contextmenu", (e) => {
    if (!editing() || dialogOpen()) return;
    const t = e.target;
    if (!t.closest?.(".pagecontent img") && !(inBody(t) && editableHost(t))) return;
    e.preventDefault();
    const range = currentRange();
    openMenu(contextItems(t, range), e.clientX, e.clientY, { label: "Document actions", range });
  });
  function openContextAtCaret() {
    const s = getSelection();
    if (!s.rangeCount || !inBody(s.anchorNode) || !editableHost(s.anchorNode)) return false;
    const range = s.getRangeAt(0).cloneRange(),
      p = caretPoint(range);
    openMenu(contextItems(nodeOf(s.anchorNode), range), p.x, p.y, { label: "Document actions", range });
    return true;
  }

  /* ---------- W-06 · pegar con estructura (desde Word, Google Docs o web) ---------- */
  let plainNext = false,
    plainTimer = 0;
  const BLOCK = /^(P|H2|H3|H4|UL|OL|TABLE|BLOCKQUOTE|HR)$/;
  function cleanHref(v) {
    v = (v || "").trim();
    return /^(https:\/\/|mailto:)[^\s<>"']+$/i.test(v) ? v : null;
  }
  function convertWordLists(root) {
    const isItem = (p) =>
      p.tagName === "P" &&
      (/MsoList/i.test(p.className) || /mso-list\s*:\s*l\d/i.test(p.getAttribute("style") || ""));
    const paras = [...root.querySelectorAll("p")].filter(isItem);
    const seen = new Set();
    for (const first of paras) {
      if (seen.has(first)) continue;
      const run = [];
      let n = first;
      while (n && n.nodeType === 1 && isItem(n)) {
        run.push(n);
        seen.add(n);
        n = n.nextElementSibling;
      }
      const rootList = { level: 0, el: null, children: [] };
      let stack = [];
      for (const p of run) {
        const level = +(((p.getAttribute("style") || "").match(/level(\d+)/) || [])[1] || 1);
        const marker = [...p.querySelectorAll("span")].find((s) =>
          /mso-list\s*:\s*ignore/i.test(s.getAttribute("style") || ""),
        );
        const markText = (marker?.textContent || "").trim();
        marker?.remove();
        const ordered = /^(\d+|[a-zA-Z]|[ivxlcIVXLC]+)[.)]$/.test(markText);
        const li = document.createElement("li");
        li.append(...p.childNodes);
        while (stack.length && stack.at(-1).level > level) stack.pop();
        let top = stack.at(-1);
        if (!top || top.level < level) {
          const list = document.createElement(ordered ? "ol" : "ul");
          if (top) (top.el.lastElementChild || top.el).append(list);
          else rootList.children.push(list);
          top = { level, el: list };
          stack.push(top);
        }
        top.el.append(li);
      }
      run[0].before(...rootList.children);
      run.forEach((p) => p.remove());
    }
  }
  function sanitizeHTML(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const body = doc.body;
    if (!body) return null;
    convertWordLists(body);
    const levels = [...body.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => +h.tagName[1]);
    const min = levels.length ? Math.min(...levels) : 1;
    const out = document.createDocumentFragment();
    let dropped = 0;
    function copy(node, parent) {
      if (node.nodeType === 3) {
        parent.append(document.createTextNode(node.nodeValue.replace(/\r?\n/g, " ")));
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName.toUpperCase();
      if (
        tag.includes(":") ||
        /^(SCRIPT|STYLE|META|LINK|TITLE|HEAD|OBJECT|EMBED|IFRAME|SVG|MATH|FORM|INPUT|BUTTON|SELECT|TEXTAREA|TEMPLATE|NOSCRIPT|VIDEO|AUDIO|CANVAS)$/.test(
          tag,
        )
      )
        return;
      if (tag === "IMG") {
        dropped++;
        return;
      }
      const style = (node.getAttribute("style") || "").toLowerCase();
      let el = null;
      if (/^H[1-6]$/.test(tag)) el = document.createElement("h" + Math.min(4, 2 + (+tag[1] - min)));
      else if (/^(P|UL|OL|LI|TABLE|THEAD|TBODY|TFOOT|TR|BLOCKQUOTE|HR|BR|SUB|SUP|U|S)$/.test(tag))
        el = document.createElement(tag.toLowerCase());
      else if (tag === "TD" || tag === "TH") {
        el = document.createElement(tag.toLowerCase());
        for (const a of ["colspan", "rowspan"]) {
          const v = +node.getAttribute(a);
          if (v > 1 && v <= 50) el.setAttribute(a, String(v));
        }
      } else if (tag === "B" || tag === "STRONG") {
        if (/font-weight\s*:\s*(normal|[1-4]00)/.test(style)) {
          for (const c of node.childNodes) copy(c, parent);
          return;
        }
        el = document.createElement("b");
      } else if (tag === "I" || tag === "EM") el = document.createElement("i");
      else if (tag === "STRIKE" || tag === "DEL") el = document.createElement("s");
      else if (tag === "A") {
        const href = cleanHref(node.getAttribute("href"));
        if (!href) {
          for (const c of node.childNodes) copy(c, parent);
          return;
        }
        el = document.createElement("a");
        el.href = href;
        el.rel = "noopener noreferrer";
      } else if (tag === "SPAN" || tag === "FONT") {
        let target = parent;
        const wrap = (t) => {
          const w = document.createElement(t);
          target.append(w);
          target = w;
        };
        if (/font-weight\s*:\s*(bold|[6-9]00)/.test(style)) wrap("b");
        if (/font-style\s*:\s*italic/.test(style)) wrap("i");
        if (/text-decoration[^;]*underline/.test(style)) wrap("u");
        for (const c of node.childNodes) copy(c, target);
        return;
      } else {
        for (const c of node.childNodes) copy(c, parent);
        return;
      } // DIV, SECTION, ARTICLE, etc.: desenvolver
      if (el.tagName === "TABLE" && parent.closest?.("table")) {
        el = document.createElement("span");
      }
      for (const c of node.childNodes) copy(c, el);
      parent.append(el);
    }
    for (const c of body.childNodes) copy(c, out);
    // Quitar párrafos vacíos (Word separa con <p>&nbsp;</p>) y normalizar tablas.
    out.querySelectorAll("p,h2,h3,h4,li,blockquote").forEach((n) => {
      if (!n.textContent.replace(/ /g, " ").trim() && !n.querySelector("br,img,table")) n.remove();
    });
    out.querySelectorAll("table").forEach((t) => {
      if (![...t.children].some((c) => c.tagName === "TBODY")) {
        const tb = document.createElement("tbody");
        [...t.children].filter((c) => c.tagName === "TR").forEach((tr) => tb.append(tr));
        t.append(tb);
      }
      t.querySelectorAll("thead th").forEach((th) => th.setAttribute("scope", "col"));
    });
    return { fragment: out, dropped };
  }
  function hasStructure(frag) {
    return (
      !!frag.querySelector("b,i,u,s,sub,sup,a,h2,h3,h4,ul,ol,table,blockquote,hr") ||
      frag.querySelectorAll("p").length > 1
    );
  }
  function insertFragment(frag) {
    const s = getSelection();
    if (!s.rangeCount) return false;
    const range = s.getRangeAt(0);
    const hasBlocks = [...frag.childNodes].some((n) => n.nodeType === 1 && BLOCK.test(n.tagName));
    const blockEl = nodeOf(range.startContainer)?.closest("p,h1,h2,h3,h4,blockquote,li,td,th");
    if (hasBlocks && blockEl && /^(LI|TD|TH)$/.test(blockEl.tagName)) return false; // en celdas y viñetas: texto plano
    return EditorTransactions.run("Paste with formatting", () => {
      const r = getSelection().getRangeAt(0);
      r.deleteContents();
      const nodes = [...frag.childNodes];
      if (!nodes.length) return false;
      const last = nodes.at(-1);
      if (!hasBlocks) {
        r.insertNode(frag);
        const c = document.createRange();
        c.setStartAfter(last);
        c.collapse(true);
        getSelection().removeAllRanges();
        getSelection().addRange(c);
        return true;
      }
      const block = nodeOf(r.startContainer).closest("p,h1,h2,h3,h4,blockquote");
      if (block && area.contains(block)) {
        const tail = document.createRange();
        tail.selectNodeContents(block);
        tail.setStart(r.startContainer, r.startOffset);
        const tailEl = block.cloneNode(false);
        for (const a of ["id", "data-block-id", "data-history-id"]) tailEl.removeAttribute(a);
        tailEl.append(tail.extractContents());
        block.after(...nodes);
        last.after(tailEl);
        if (!block.textContent.trim() && !block.querySelector("img,br")) block.remove();
        if (!tailEl.textContent.trim() && !tailEl.querySelector("img")) tailEl.remove();
      } else {
        r.insertNode(frag);
      }
      caretTo(last.nodeType === 1 ? last : last.parentElement, true);
      return true;
    });
  }
  window.SophiaPaste = Object.freeze({
    handle(e) {
      if (plainNext) {
        plainNext = false;
        return false;
      }
      const html = e.clipboardData?.getData("text/html");
      if (
        !html ||
        !editing() ||
        !editableHost(e.target) ||
        nodeOf(e.target).closest(".identity,[data-trace]")
      )
        return false;
      const result = sanitizeHTML(html);
      if (!result || !hasStructure(result.fragment)) return false;
      const ok = insertFragment(result.fragment);
      if (ok)
        notify(
          "Pasted with headings, lists, tables and basic formatting." +
            (result.dropped
              ? " " + result.dropped + " image(s) skipped: insert screenshots with / or Insert › Screenshot."
              : "") +
            " Ctrl+Shift+V pastes plain text.",
        );
      return ok;
    },
    sanitize: (html) => sanitizeHTML(html),
  });

  /* ---------- W-12 · cambios desde el último guardado ---------- */
  const HL = { added: "sophia-added", modified: "sophia-modified", moved: "sophia-moved" };
  const prefKey = "sophia:pref:highlight-changes";
  let highlightOn = (() => {
    try {
      return localStorage.getItem(prefKey) !== "off";
    } catch {
      return true;
    }
  })();
  let lastChanges = [],
    changeTimer = 0;
  function clearHighlights() {
    if (window.CSS?.highlights) Object.values(HL).forEach((k) => CSS.highlights.delete(k));
  }
  function liveBlocks() {
    return [...area.querySelectorAll(".qc-hero,.pagecontent")]
      .flatMap((c) => [...c.querySelectorAll("h1,h2,h3,h4,p,li,td,th,figcaption")])
      .filter(
        (n) =>
          !n.closest(".identity,[data-trace],.brand,.doc-classification,.pagehead,.pagefoot") &&
          !n.querySelector("h1,h2,h3,h4,p,li,td,th,figcaption"),
      );
  }
  function computeChanges() {
    if (
      !window.EditorSession?.get().pid ||
      typeof historyCompare !== "function" ||
      !data?.revisions?.length
    ) {
      lastChanges = [];
      clearHighlights();
      renderChanges();
      return;
    }
    let result;
    try {
      result = historyCompare(data.revisions.at(-1).snapshot, cleanContent());
    } catch {
      lastChanges = [];
      clearHighlights();
      renderChanges();
      return;
    }
    const pool = liveBlocks(),
      used = new Set();
    lastChanges = result.changes.map((c) => {
      let node = null;
      if (c.after !== undefined && !/deleted/i.test(c.type)) {
        node = pool.find((n) => !used.has(n) && n.textContent === c.after) || null;
        if (node) used.add(node);
      }
      const kind = /added/i.test(c.type)
        ? "added"
        : /deleted/i.test(c.type)
          ? "deleted"
          : /reordered|formatting/i.test(c.type)
            ? "moved"
            : "modified";
      return { ...c, kind, node };
    });
    paintHighlights();
    renderChanges();
  }
  function paintHighlights() {
    clearHighlights();
    if (!highlightOn || !window.CSS?.highlights || !window.Highlight || !editing()) return;
    const sets = { added: [], modified: [], moved: [] };
    for (const c of lastChanges) {
      if (!c.node || !sets[c.kind]) continue;
      const r = document.createRange();
      r.selectNodeContents(c.node);
      sets[c.kind].push(r);
    }
    for (const [k, ranges] of Object.entries(sets))
      if (ranges.length) CSS.highlights.set(HL[k], new Highlight(...ranges));
  }
  const scheduleChanges = () => {
    clearTimeout(changeTimer);
    changeTimer = setTimeout(computeChanges, 900);
  };
  new MutationObserver(scheduleChanges).observe(area, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["style", "class", "src", "alt"],
  });
  addEventListener("beforeprint", clearHighlights);
  addEventListener("afterprint", paintHighlights);
  function oldBlockFor(change, live) {
    const doc = new DOMParser().parseFromString(data.revisions.at(-1).snapshot, "text/html");
    const cands = [...doc.querySelectorAll(".qc-hero,.pagecontent")]
      .flatMap((c) => [...c.querySelectorAll("h1,h2,h3,h4,p,li,td,th,figcaption")])
      .filter(
        (n) =>
          !n.closest(".identity,[data-trace],.brand,.doc-classification,.pagehead,.pagefoot") &&
          !n.querySelector("h1,h2,h3,h4,p,li,td,th,figcaption"),
      );
    return cands.find((n) => n.textContent === change.before && n.tagName === live.tagName) || null;
  }
  function revert(change) {
    const live = change.node;
    if (!live?.isConnected) {
      notify("That block changed again. Review the list.");
      return;
    }
    if (change.kind === "added") {
      if (/^(TD|TH)$/.test(live.tagName)) {
        notify("Table cells are reverted from Table Studio or with Undo.");
        return;
      }
      EditorTransactions.run("Remove added block", () => {
        const list = live.parentElement;
        live.remove();
        if (/^(UL|OL)$/.test(list?.tagName) && !list.children.length) list.remove();
      });
    } else {
      const old = oldBlockFor(change, live);
      if (!old) {
        notify("The previous version of this block could not be matched. Use Undo or History.");
        return;
      }
      if (old.querySelector("img") || live.querySelector("img")) {
        notify("Blocks with images are reverted with Undo or History.");
        return;
      }
      const clean = sanitizeHTML("<div>" + old.innerHTML + "</div>").fragment;
      EditorTransactions.run("Revert block to last saved version", () => {
        live.replaceChildren(...clean.childNodes);
      });
    }
    computeChanges();
  }
  function renderChanges() {
    const root = document.getElementById("sideContent");
    if (!root || window.EditorSession?.get().panel !== "versions") return;
    root.querySelector(".sv76-changes")?.remove();
    const card = make("section", "sv76-changes");
    card.dataset.runtime = "";
    card.setAttribute("aria-label", "Changes since last save");
    const version = data?.documentVersion || data?.revisions?.at(-1)?.version || "?";
    card.append(make("strong", "", "CHANGES SINCE V" + version));
    if (!window.EditorSession?.get().pid) {
      card.append(make("p", "", "Start editing to see unsaved changes here."));
      root.prepend(card);
      return;
    }
    const label = make("label", "sv76-toggle"),
      box = make("input");
    box.type = "checkbox";
    box.checked = highlightOn;
    box.addEventListener("change", () => {
      highlightOn = box.checked;
      try {
        localStorage.setItem(prefKey, highlightOn ? "on" : "off");
      } catch {}
      paintHighlights();
    });
    label.append(box, document.createTextNode(" Highlight in document"));
    card.append(label);
    if (!lastChanges.length) card.append(make("p", "", "No content changes since the last saved revision."));
    const list = make("ul");
    for (const c of lastChanges.slice(0, 60)) {
      const li = make("li", "sv76-chg sv76-" + c.kind);
      li.append(
        make("b", "", c.type),
        make(
          "span",
          "",
          ((c.kind === "deleted" ? c.before : c.after) || "").trim().slice(0, 140) || "(empty)",
        ),
      );
      const actions = make("div");
      if (c.node) {
        const go = make("button", "", "Go to");
        go.type = "button";
        go.onclick = () => {
          c.node.scrollIntoView({ block: "center" });
          caretTo(c.node, true);
        };
        actions.append(go);
      }
      if (
        c.node &&
        (c.kind === "added" || c.kind === "modified" || (c.kind === "moved" && /formatting/i.test(c.type)))
      ) {
        const rv = make("button", "", "Revert");
        rv.type = "button";
        rv.title = "Restore this block from the last saved revision (Undo available)";
        rv.onclick = () => revert(c);
        actions.append(rv);
      }
      if (actions.children.length) li.append(actions);
      list.append(li);
    }
    if (lastChanges.length) card.append(list);
    if (lastChanges.length > 60)
      card.append(
        make("p", "", "Showing 60 of " + lastChanges.length + ". Open History for the full comparison."),
      );
    root.prepend(card);
  }
  let lastPid = null;
  window.EditorSession?.subscribe((s) => {
    if (s.pid !== lastPid) {
      lastPid = s.pid;
      if (s.pid) scheduleChanges();
      else {
        lastChanges = [];
        clearHighlights();
      }
    }
    queueMicrotask(renderChanges);
    syncSpell();
  });

  /* ---------- W-10 · ortografía del navegador solo al editar ---------- */
  function syncSpell() {
    area.spellcheck = editing();
  }
  new MutationObserver(syncSpell).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  syncSpell();

  /* ---------- W-04 · atajos y ayuda ---------- */
  const SHORTCUTS = [
    ["Ctrl+S", "Save draft (download + verify)"],
    ["Ctrl+P", "Print Studio"],
    ["Ctrl+K", "Commands"],
    ["Ctrl+F", "Find in document"],
    ["Ctrl+H", "Find & replace (editing)"],
    ["Ctrl+Z / Ctrl+Y", "Undo / Redo"],
    ["Ctrl+B / I / U", "Bold / Italic / Underline"],
    ["Ctrl+Alt+1 / 2 / 3", "Heading 1 / 2 / 3"],
    ["Ctrl+Alt+0", "Normal text"],
    ["Ctrl+Shift+8", "Bulleted list"],
    ["Ctrl+Shift+7", "Numbered list"],
    ["Ctrl+Shift+V", "Paste as plain text"],
    ["/", "Insert block (in an empty paragraph)"],
    ["Shift+F10", "Document actions menu"],
    ["Alt+F10", "Quick formatting bar (with a selection)"],
    ["Alt+↑ / Alt+↓", "Move the current block (or the selected image)"],
    ["Ctrl+Alt+M", "Add comment to the current block"],
    ["Ctrl+Shift+T", "Mark / unmark To Be Confirmed"],
    ["Ctrl+= / Ctrl+− / Ctrl+0", "Zoom in / out / 100 %"],
    ["Esc", "Leave focus reading"],
    ["F1 or Ctrl+/", "This help"],
  ];
  let help = null;
  function openHelp() {
    if (help?.isConnected) {
      help.querySelector("button").focus();
      return;
    }
    if (dialogOpen()) return;
    const origin = document.activeElement,
      range = currentRange();
    help = make("dialog", "sv76-dialog");
    help.dataset.runtime = "";
    help.setAttribute("aria-labelledby", "sv76-help-title");
    const head = make("header");
    head.append(
      make("small", "", "KEYBOARD"),
      Object.assign(make("h2", "", "Shortcuts"), { id: "sv76-help-title" }),
    );
    const table = make("table"),
      tb = make("tbody");
    for (const [k, v] of SHORTCUTS) {
      const tr = make("tr");
      tr.append(make("th", "", k), make("td", "", v));
      tb.append(tr);
    }
    table.append(tb);
    const foot = make("footer"),
      close = make("button", "", "Close");
    close.type = "button";
    foot.append(close);
    help.append(head, table, foot);
    document.body.append(help);
    const done = () => {
      if (!help) return;
      const d = help;
      help = null;
      if (d.open) d.close();
      d.remove();
      if (range && editing()) restore(range);
      else origin?.focus?.({ preventScroll: true });
    };
    close.onclick = done;
    help.addEventListener("cancel", (e) => {
      e.preventDefault();
      done();
    });
    help.showModal();
    close.focus();
  }
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.defaultPrevented) return;
      const k = e.key,
        ctrl = e.ctrlKey || e.metaKey,
        altGr = e.getModifierState?.("AltGraph");
      if (activeMenu && !activeMenu.el.contains(e.target) && k === "Escape") {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (dialogOpen()) return;
      if (k === "F1" || (ctrl && !e.altKey && !e.shiftKey && k === "/")) {
        e.preventDefault();
        openHelp();
        return;
      }
      if (ctrl && !e.shiftKey && !e.altKey && k.toLowerCase() === "f") {
        e.preventDefault();
        window.openDocumentFind?.();
        return;
      }
      if (!editing()) return;
      if (ctrl && !e.shiftKey && !e.altKey && k.toLowerCase() === "h") {
        e.preventDefault();
        window.replaceDialog?.();
        return;
      }
      if (ctrl && e.shiftKey && !e.altKey && k.toLowerCase() === "v") {
        plainNext = true;
        clearTimeout(plainTimer);
        plainTimer = setTimeout(() => {
          plainNext = false;
        }, 1500);
        return;
      }
      const inDoc = editableHost(getSelection().anchorNode);
      if (!inDoc) return;
      if (ctrl && e.altKey && !e.shiftKey && !altGr && ["0", "1", "2", "3"].includes(k)) {
        e.preventDefault();
        EditorCommands.command("formatBlock", { 0: "p", 1: "h2", 2: "h3", 3: "h4" }[k]);
        return;
      }
      if (ctrl && e.shiftKey && !e.altKey && (e.code === "Digit7" || e.code === "Digit8")) {
        e.preventDefault();
        EditorCommands.command(e.code === "Digit7" ? "insertOrderedList" : "insertUnorderedList");
        return;
      }
      if ((e.shiftKey && k === "F10") || k === "ContextMenu") {
        if (openContextAtCaret()) e.preventDefault();
        return;
      }
      if (e.altKey && !ctrl && k === "F10" && !bar.hidden) {
        e.preventDefault();
        bar.querySelector("button").focus();
      }
    },
    true,
  );

  /* ---------- Deshacer conserva el cursor (el núcleo sustituye innerHTML) ---------- */
  /* ---------- registro en Commands (Ctrl+K) ---------- */
  if (typeof Workbench?.register === "function") {
    Workbench.register("shortcuts", "Keyboard shortcuts", "Review", openHelp);
    Workbench.register("changes", "Changes since last save", "Review", () => side("versions"));
    Workbench.register(
      "symbols",
      "Insert symbol",
      "Document",
      () => {
        const r = currentRange();
        if (!r || !editableHost(r.startContainer)) {
          notify("Place the cursor in the document first.");
          return;
        }
        openSymbols(r);
      },
      true,
    );
  }

  return Object.freeze({
    openHelp,
    openSlash: () => {
      const r = currentRange();
      const b = nodeOf(r?.startContainer)?.closest("p,h2,h3,h4");
      if (b) openSlash(b, r);
    },
    openContext: openContextAtCaret,
    computeChanges,
    changes: () => lastChanges.map(({ node, ...c }) => ({ ...c, located: !!node })),
  });
})();
