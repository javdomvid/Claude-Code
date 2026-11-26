/* ============================================================================
 * SOPHIA · 24-find
 * Find in document (read-only, CSS Highlight API).
 * Reused from V76 (document-navigator-v19); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V19: read-only document navigator. Never wraps or rewrites document nodes. */
(() => {
  "use strict";
  const key = "editor-search-v19";
  let lastQuery = "",
    activeDialog = null;
  function clear() {
    if (window.CSS?.highlights) CSS.highlights.delete(key);
  }
  function candidates() {
    const root = document.getElementById("document");
    if (!root) return [];
    return [
      ...root.querySelectorAll(
        ".pagecontent h1,.pagecontent h2,.pagecontent h3,.pagecontent h4,.pagecontent p,.pagecontent li,.pagecontent td,.pagecontent th,.pagecontent figcaption",
      ),
    ].filter((n) => !n.querySelector("p,li,td,th,h1,h2,h3,h4,figcaption") && n.textContent.trim());
  }
  function locate(node, start, length) {
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let offset = 0,
      first = null,
      last = null,
      a = 0,
      b = 0;
    while (w.nextNode()) {
      const n = w.currentNode,
        end = offset + n.length;
      if (!first && start < end) {
        first = n;
        a = start - offset;
      }
      if (first && start + length <= end) {
        last = n;
        b = start + length - offset;
        break;
      }
      offset = end;
    }
    if (!first || !last) return null;
    const r = document.createRange();
    r.setStart(first, a);
    r.setEnd(last, b);
    return r;
  }
  function open() {
    if (activeDialog?.isConnected) {
      activeDialog.querySelector("input").focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil")) {
      if (typeof toast === "function") toast("Finish or cancel the current dialog before searching.");
      return;
    }
    const origin = document.activeElement,
      d = document.createElement("dialog");
    activeDialog = d;
    d.className = "document-navigator-v19";
    d.setAttribute("aria-label", "Find in document");
    d.innerHTML =
      '<header><h2>Find in document</h2><p>Search body text, headings, tables and captions. Does not change your content.</p></header><section><label>Search text<input type="search" maxlength="300" autocomplete="off" placeholder="Type at least 2 characters"></label><p data-status role="status" aria-live="polite"></p><div data-results></div></section><footer><button type="button" data-clear>Clear highlight</button><button type="button" data-close>Close</button></footer>';
    const input = d.querySelector("input"),
      status = d.querySelector("[data-status]"),
      list = d.querySelector("[data-results]");
    input.value = lastQuery;
    let timer = 0,
      closed = false;
    function close() {
      if (closed) return;
      closed = true;
      clearTimeout(timer);
      if (d.open) d.close();
      d.remove();
      activeDialog = null;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    function render() {
      clearTimeout(timer);
      lastQuery = input.value;
      list.replaceChildren();
      const q = input.value;
      if (q.length < 2) {
        status.textContent = "Enter at least 2 characters. Search is literal and case-insensitive.";
        return;
      }
      const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matcher = new RegExp(escaped, "gi");
      let total = 0,
        shown = 0;
      for (const n of candidates()) {
        const text = n.textContent;
        matcher.lastIndex = 0;
        let match;
        while ((match = matcher.exec(text)) !== null) {
          const start = match.index;
          total++;
          if (shown >= 200) continue;
          shown++;
          const button = document.createElement("button");
          button.type = "button";
          button.className = "navigator-result";
          const page = n.closest(".sheet");
          const pages = [...document.querySelectorAll("#document .sheet")];
          const meta = document.createElement("strong");
          meta.textContent =
            (page ? "Page " + (pages.indexOf(page) + 1) + " · " : "") + n.tagName.toLowerCase();
          const snippet = document.createElement("span");
          snippet.textContent =
            (start > 50 ? "…" : "") +
            text.slice(Math.max(0, start - 50), Math.min(text.length, start + q.length + 95)) +
            (start + q.length + 95 < text.length ? "…" : "");
          button.append(meta, snippet);
          button.onclick = () => {
            if (!n.isConnected || n.textContent !== text) {
              status.textContent = "Document changed. Search again to refresh results.";
              return;
            }
            const range = locate(n, start, q.length);
            close();
            clear();
            if (range && window.CSS?.highlights && window.Highlight)
              CSS.highlights.set(key, new Highlight(range));
            n.scrollIntoView({ behavior: "auto", block: "center" });
            if (typeof toast === "function")
              toast("Search result located. Use Find in document to return to the results.");
          };
          list.append(button);
        }
      }
      status.textContent = total
        ? total +
          " occurrence" +
          (total === 1 ? "" : "s") +
          (total > 200 ? " · showing first 200. Refine your search." : ". Select a result to go there.")
        : "No matches in supported body blocks.";
    }
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(render, 160);
    });
    d.querySelector("[data-close]").onclick = close;
    d.querySelector("[data-clear]").onclick = clear;
    d.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    });
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("close", close, { once: true });
    document.body.append(d);
    d.showModal();
    render();
    input.focus();
    input.select();
  }
  window.openDocumentFind = open;
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
      e.preventDefault();
      open();
    }
  });
})();
