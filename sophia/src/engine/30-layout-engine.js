/* ============================================================================
 * SOPHIA · 30-layout-engine
 * Block paginator for A4 view: moves whole blocks, verifies content signature.
 * Reused from V76 (layout-engine-v27); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V27 block paginator. Moves original child nodes, never splits or duplicates
   content blocks. Measurement uses rendered dimensions, not text estimates.
   No image-load/scroll listeners; recalculation is explicit. */
window.LayoutEngine = (() => {
  "use strict";
  let busy = false;
  const direct = (n, selector) => [...n.children].find((x) => x.matches(selector));
  function pages(root) {
    const ps = [...root.children].filter((n) => n.matches?.(".sheet"));
    if (!ps.length) throw Error("No document sheets found.");
    for (let i = 0; i < ps.length; i++)
      if (!direct(ps[i], ".pagecontent") || !direct(ps[i], ".pagefoot"))
        throw Error("Page " + (i + 1) + " is missing its body or footer. No layout was applied.");
    return ps;
  }
  function nodes(root) {
    return pages(root).flatMap((p) => [...direct(p, ".pagecontent").childNodes]);
  }
  function elements(root) {
    return nodes(root).filter((n) => n.nodeType === 1);
  }
  function meaningful(n) {
    return n.nodeType === 1 || (n.nodeType === 3 && !!n.textContent.trim());
  }
  function heading(n) {
    return n.nodeType === 1 && /^H[1-6]$/.test(n.tagName);
  }
  function signature(root) {
    return nodes(root)
      .map((n) => (n.nodeType === 1 ? n.outerHTML : n.nodeType + ":" + n.textContent))
      .join("\u0000");
  }
  function template(p, continuation) {
    const t = p.cloneNode(true);
    direct(t, ".pagecontent").replaceChildren();
    t.classList.remove("layout-overflow");
    if (continuation) {
      for (const n of [...t.children])
        if (!n.matches(".pagecontent,.pagefoot,.pagehead,.doc-classification.continuation")) n.remove();
      if (!direct(t, ".pagehead")) {
        const h = document.createElement("div");
        h.className = "pagehead";
        const label = document.createElement("span");
        label.className = "header-label";
        label.textContent = "Title";
        const title = document.createElement("span");
        title.className = "header-title";
        title.textContent =
          SOPHIA.meta.get("Title") ||
          area.querySelector(".qc-hero h1")?.textContent ||
          "Document continuation";
        h.append(label, title);
        t.prepend(h);
      }
      t.querySelectorAll("[id],[data-block-id],[data-history-id]").forEach((n) => {
        n.removeAttribute("id");
        n.removeAttribute("data-block-id");
        n.removeAttribute("data-history-id");
      });
    }
    return t;
  }
  function ready(root) {
    if (document.fonts?.status === "loading")
      throw Error("Fonts are still loading. Retry after they finish.");
    for (const im of root.querySelectorAll("img"))
      if (!im.complete) throw Error("An image is still loading. Retry before calculating layout.");
  }
  function layout(root, overrides = new Map()) {
    if (busy) throw Error("A layout calculation is already running.");
    pages(root);
    ready(root);
    const backup = [...root.childNodes],
      oldPages = pages(root),
      all = nodes(root),
      first = template(oldPages[0], false),
      next = template(
        oldPages[1] || (typeof continuationTemplate !== "undefined" && continuationTemplate) || oldPages[0],
        true,
      ),
      before = signature(root),
      oldZoom = root.style.zoom;
    const placements = [],
      warnings = [],
      built = [];
    let current, body;
    function make() {
      if (built.length >= 500) throw Error("Layout exceeds 500 pages. Use a smaller document.");
      const p = (built.length ? next : first).cloneNode(true);
      root.append(p);
      built.push(p);
      current = p;
      body = direct(p, ".pagecontent");
      return p;
    }
    function fits(p) {
      const content = direct(p, ".pagecontent"),
        footer = direct(p, ".pagefoot"),
        rect = p.getBoundingClientRect(),
        style = getComputedStyle(p),
        bottom =
          rect.bottom - parseFloat(style.paddingBottom || 0) - footer.getBoundingClientRect().height - 6;
      return content.getBoundingClientRect().bottom <= bottom + 1 && p.scrollHeight <= p.clientHeight + 2;
    }
    function nonempty() {
      return [...body.childNodes].some(meaningful);
    }
    busy = true;
    try {
      root.style.zoom = "1";
      root.replaceChildren();
      make();
      let i = 0,
        elementIndex = 0;
      while (i < all.length) {
        const group = [],
          indices = [];
        let node = all[i];
        const initialElement = elementIndex;
        let rule =
          node.nodeType === 1
            ? overrides.get(elementIndex) || {
                before: node.dataset.layoutBefore === "page",
                keep: node.dataset.layoutKeep === "next",
              }
            : {};
        if (rule.before && nonempty()) make();
        do {
          node = all[i++];
          group.push(node);
          if (node.nodeType === 1) {
            indices.push(elementIndex);
            elementIndex++;
          }
          let keep =
            node.nodeType === 1
              ? (overrides.get(elementIndex - 1)?.keep ??
                (node.dataset.layoutKeep === "next" || (node.dataset.layoutKeep !== "none" && heading(node))))
              : false;
          if (!keep || i >= all.length) break;
          let nextIndex = i;
          while (nextIndex < all.length && !meaningful(all[nextIndex])) nextIndex++;
          const nextNode = all[nextIndex];
          const nextRule =
            nextNode?.nodeType === 1
              ? overrides.get(elementIndex) || { before: nextNode.dataset.layoutBefore === "page" }
              : {};
          if (nextRule.before) break;
          while (i < nextIndex) group.push(all[i++]);
        } while (i < all.length);
        const had = nonempty();
        group.forEach((n) => body.append(n));
        if (!fits(current) && had) {
          group.forEach((n) => n.remove());
          make();
          group.forEach((n) => body.append(n));
        }
        if (!fits(current)) {
          current.classList.add("layout-overflow");
          warnings.push({
            page: built.length,
            block: initialElement + 1,
            message:
              "This indivisible block/group exceeds the available page area. It was not clipped or split.",
          });
        }
        for (const index of indices) placements[index] = built.length;
      }
      built.forEach((p, index) => {
        const f = direct(p, ".pagefoot"),
          number = f.querySelector(".page-number");
        if (number) number.textContent = String(index + 1);
        else if (/^\s*\d+\s*$/.test(f.textContent)) {
          f.textContent = "";
          const span = document.createElement("span");
          span.className = "page-number";
          span.textContent = String(index + 1);
          f.append(span);
        }
      });
      if (signature(root) !== before) throw Error("Content integrity check failed during pagination.");
      const report = {
        pages: built.map((p, i) => {
          const c = direct(p, ".pagecontent"),
            f = direct(p, ".pagefoot"),
            r = p.getBoundingClientRect(),
            style = getComputedStyle(p),
            available = Math.max(
              1,
              r.bottom -
                parseFloat(style.paddingBottom || 0) -
                f.getBoundingClientRect().height -
                6 -
                c.getBoundingClientRect().top,
            ),
            used = c.getBoundingClientRect().height;
          return {
            number: i + 1,
            blocks: [...c.children].length,
            fill: Math.round((used / available) * 100),
            overflow: p.classList.contains("layout-overflow"),
          };
        }),
        placements,
        warnings,
      };
      return report;
    } catch (error) {
      root.replaceChildren(...backup);
      oldPages.forEach((p) => {
        const content = direct(p, ".pagecontent");
        content.replaceChildren(...all.filter((n) => nodePage.get(n) === p));
      });
      throw error;
    } finally {
      root.style.zoom = oldZoom;
      busy = false;
    }
    // Populated before nodes move, for rollback without replacing original nodes.
  }
  // Capture original node parents before invoking the implementation.
  let nodePage = new Map();
  const measuredLayout = layout;
  function calculate(root, overrides) {
    nodePage = new Map();
    for (const p of pages(root)) for (const n of direct(p, ".pagecontent").childNodes) nodePage.set(n, p);
    /* While editing, sheets may grow past A4 (paper.common.css); measure at true A4 height. */
    document.body.classList.add("sx-measuring");
    try {
      return measuredLayout(root, overrides);
    } finally {
      document.body.classList.remove("sx-measuring");
    }
  }
  function reflow(notify = false) {
    if (document.body.classList.contains("continuous-view")) {
      if (notify) toast("Open Layout Studio to preview A4 without leaving Continuous view.");
      return null;
    }
    const oldMuted = muted,
      y = window.scrollY;
    muted = true;
    try {
      const result = calculate(area);
      setEditable();
      EditorCommands.clear();
      EditorMedia.clear();
      refreshOutline();
      if (notify)
        toast(result.pages.length + " pages calculated · " + result.warnings.length + " layout warning(s).");
      return result;
    } catch (error) {
      toast(error.message);
      return null;
    } finally {
      observer.takeRecords();
      muted = oldMuted;
      window.scrollTo(0, y);
    }
  }
  function merge() {
    const ps = pages(area);
    if (ps.length < 2) return;
    const old = muted;
    muted = true;
    try {
      const target = direct(ps[0], ".pagecontent");
      for (const p of ps.slice(1)) {
        target.append(...direct(p, ".pagecontent").childNodes);
        p.remove();
      }
      EditorCommands.clear();
      EditorMedia.clear();
    } finally {
      observer.takeRecords();
      muted = old;
    }
  }
  /* V77.1 · A4 view while editing: a sheet grows instead of spilling its text onto the
     canvas; when typing pauses and a sheet is longer than A4, the pages are recalculated
     and the caret is put back at the same character of the same block. */
  function caretMark() {
    const s = getSelection();
    if (!s.rangeCount || !area.contains(s.anchorNode)) return null;
    const host = (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement)?.closest("[data-block-id]");
    if (!host) return null;
    const r = document.createRange();
    r.selectNodeContents(host);
    r.setEnd(s.anchorNode, s.anchorOffset);
    return { id: host.dataset.blockId, off: r.toString().length, top: host.getBoundingClientRect().top };
  }
  function caretBack(m) {
    const host = m && area.querySelector('[data-block-id="' + CSS.escape(m.id) + '"]');
    if (!host) return;
    const w = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
    let left = m.off, node = null;
    while ((node = w.nextNode())) {
      if (left <= node.nodeValue.length) break;
      left -= node.nodeValue.length;
    }
    const r = document.createRange();
    if (node) r.setStart(node, left);
    else { r.selectNodeContents(host); r.collapse(false); }
    r.collapse(true);
    host.closest("[contenteditable=true]")?.focus({ preventScroll: true });
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    window.scrollBy(0, host.getBoundingClientRect().top - m.top);
  }
  /* Measured at true A4 height (like the paginator), not at the grown editing height. */
  function overflowing() {
    document.body.classList.add("sx-measuring");
    try {
      return pages(area).some((p) => {
        const pc = direct(p, ".pagecontent"), foot = direct(p, ".pagefoot");
        return p.scrollHeight > p.clientHeight + 2 || (!!pc && !!foot && pc.getBoundingClientRect().bottom > foot.getBoundingClientRect().top + 1);
      });
    } finally {
      document.body.classList.remove("sx-measuring");
    }
  }
  let composing = false, autoTimer = 0;
  function autoReflow() {
    if (!document.body.classList.contains("editing") || document.body.classList.contains("continuous-view")) return;
    if (composing || document.querySelector("dialog[open]") || !overflowing()) return;
    const m = caretMark(), oldMuted = muted;
    muted = true;
    try {
      calculate(area);
      setEditable();
    } catch {
      return;
    } finally {
      observer.takeRecords();
      muted = oldMuted;
    }
    caretBack(m);
    refreshOutline();
  }
  const scheduleAuto = () => { clearTimeout(autoTimer); autoTimer = setTimeout(autoReflow, 1200); };
  area.addEventListener("compositionstart", () => (composing = true));
  area.addEventListener("compositionend", () => { composing = false; scheduleAuto(); });
  area.addEventListener("input", scheduleAuto);
  SOPHIA.bus.on("transaction", scheduleAuto); /* not "session": recovery writes would keep postponing it */
  return Object.freeze({ calculate, reflow, merge, elements, signature, autoReflow, overflowing });
})();
