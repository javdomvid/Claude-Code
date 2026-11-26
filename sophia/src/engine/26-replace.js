/* ============================================================================
 * SOPHIA · 26-replace
 * Find & replace with preview; operates on text nodes inside one transaction.
 * Reused from V76 (editor-replace-v21); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* Preview-first replacement. Operates on text-node values, never innerHTML.
   Matches can cross inline formatting, but not blocks, line breaks or images.
   Replacement inherits formatting of the first matched character. */
(() => {
  "use strict";
  let active = null;
  const blockSelector = "p,li,h1,h2,h3,h4,blockquote,td,th,figcaption";
  function blocks() {
    return [
      ...area.querySelectorAll(".pagecontent " + blockSelector.split(",").join(",.pagecontent ")),
    ].filter((n) => !n.querySelector(blockSelector) && !n.closest(".identity,[data-trace]"));
  }
  function segments(block) {
    const parts = [];
    let current = { text: "", nodes: [] };
    function flush() {
      if (current.text) parts.push(current);
      current = { text: "", nodes: [] };
    }
    function walk(n) {
      if (n.nodeType === 3) {
        current.nodes.push({ node: n, start: current.text.length, end: current.text.length + n.length });
        current.text += n.data;
        return;
      }
      if (n.nodeType !== 1) return;
      if (n.matches("br,img,script,style,[contenteditable=false]")) {
        flush();
        return;
      }
      for (const c of n.childNodes) walk(c);
    }
    for (const n of block.childNodes) walk(n);
    flush();
    return parts;
  }
  function fingerprint() {
    const c = area.cloneNode(true);
    c.querySelectorAll("[style]").forEach((n) => {
      if (!n.getAttribute("style").trim()) n.removeAttribute("style");
    });
    return c.innerHTML;
  }
  function wordChar(c) {
    return !!c && /[\p{L}\p{N}\p{M}_]/u.test(c);
  }
  function matches(text, q, matchCase, whole) {
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      rx = new RegExp(escaped, matchCase ? "gu" : "giu");
    const out = [];
    let m;
    while ((m = rx.exec(text)) !== null) {
      const start = m.index,
        end = start + m[0].length;
      const left = Array.from(text.slice(0, start)).at(-1),
        right = Array.from(text.slice(end))[0];
      if (!whole || (!wordChar(left) && !wordChar(right))) out.push({ start, end });
    }
    return out;
  }
  function patch(match, replacement) {
    const entries = match.segment.nodes.filter((x) => x.end > match.start && x.start < match.end);
    if (!entries.length) throw Error("Replacement text range is unavailable");
    for (let i = entries.length - 1; i >= 0; i--) {
      const e = entries[i],
        from = Math.max(0, match.start - e.start),
        to = Math.min(e.node.length, match.end - e.start);
      e.node.data = e.node.data.slice(0, from) + (i === 0 ? replacement : "") + e.node.data.slice(to);
    }
  }
  window.replaceDialog = function () {
    if (!EditorSession.get().pid) {
      toast("Start editing to replace document text.");
      return;
    }
    if (active?.isConnected) {
      active.querySelector("input").focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil,#archiveView")) {
      toast("Finish the current dialog first.");
      return;
    }
    const origin = document.activeElement,
      pid = EditorSession.get().pid,
      d = document.createElement("dialog");
    active = d;
    d.className = "replace-studio-v21";
    d.setAttribute("aria-label", "Find and replace studio");
    d.innerHTML =
      '<header><small>CONTROLLED DOCUMENT EDITING</small><h2>Find & replace</h2><p>Preview every occurrence before changing the document.</p></header><section><div class="r21-fields"><label>Find<input data-find maxlength="300" autocomplete="off"></label><label>Replace with<input data-replace maxlength="5000" autocomplete="off"></label></div><div class="r21-options"><label><input type="checkbox" data-case>Match case</label><label><input type="checkbox" data-whole>Whole word</label><button type="button" data-preview>Preview matches</button></div><p class="r21-help">Body text only. Matches may cross bold or italic text, not paragraph, image or line-break boundaries. Replacement uses the first matched character’s formatting. Empty replacement deletes matched text. Original inline elements remain.</p><p data-status role="status" aria-live="polite">Enter text, then preview.</p><p data-error role="alert"></p><div data-results></div></section><footer><button type="button" data-cancel>Cancel</button><button type="button" data-apply disabled>Apply previewed replacements</button></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    let preview = null,
      closed = false;
    function close() {
      if (closed) return;
      closed = true;
      unsubscribe();
      if (d.open) d.close();
      d.remove();
      active = null;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    function invalidate() {
      preview = null;
      q("apply").disabled = true;
      q("results").replaceChildren();
      q("status").textContent = "Options changed. Preview again before applying.";
      q("error").textContent = "";
    }
    function values() {
      return {
        find: q("find").value,
        replacement: q("replace").value,
        matchCase: q("case").checked,
        whole: q("whole").checked,
      };
    }
    function signature(v) {
      return JSON.stringify(v);
    }
    q("preview").onclick = () => {
      q("error").textContent = "";
      q("results").replaceChildren();
      preview = null;
      q("apply").disabled = true;
      const v = values();
      if (!v.find) {
        q("error").textContent = "Enter text to find.";
        return;
      }
      const found = [];
      let overLimit = false;
      for (const block of blocks()) {
        for (const segment of segments(block)) {
          for (const m of matches(segment.text, v.find, v.matchCase, v.whole)) {
            found.push({ ...m, segment, block });
            if (found.length > 5000) {
              overLimit = true;
              break;
            }
          }
          if (overLimit) break;
        }
        if (overLimit) break;
      }
      if (overLimit) {
        q("error").textContent = "More than 5,000 matches. Refine the search; nothing was changed.";
        return;
      }
      const fragment = document.createDocumentFragment();
      for (const m of found.slice(0, 150)) {
        const card = document.createElement("article");
        const info = document.createElement("strong");
        const page = m.block.closest(".sheet");
        info.textContent =
          "Page " +
          ([...area.querySelectorAll(".sheet")].indexOf(page) + 1) +
          " · " +
          m.block.tagName.toLowerCase();
        const before = document.createElement("p"),
          after = document.createElement("p");
        before.className = "r21-before";
        after.className = "r21-after";
        const from = Math.max(0, m.start - 45),
          to = Math.min(m.segment.text.length, m.end + 65);
        before.textContent = m.segment.text.slice(from, to);
        after.textContent =
          m.segment.text.slice(from, m.start) + v.replacement + m.segment.text.slice(m.end, to);
        card.append(info, before, after);
        fragment.append(card);
      }
      q("results").append(fragment);
      preview = { matches: found, signature: signature(v), html: fingerprint(), pid };
      q("status").textContent =
        found.length +
        " occurrence" +
        (found.length === 1 ? "" : "s") +
        " found." +
        (found.length > 150 ? " Showing the first 150; applying will change all " + found.length + "." : "") +
        " No changes applied.";
      q("apply").disabled = !found.length;
    };
    q("apply").onclick = () => {
      const v = values();
      if (!preview || preview.signature !== signature(v)) {
        invalidate();
        return;
      }
      if (
        EditorSession.get().pid !== preview.pid ||
        fingerprint() !== preview.html ||
        preview.matches.some((m) => !m.block.isConnected || m.segment.nodes.some((n) => !n.node.isConnected))
      ) {
        q("error").textContent = "Document or session changed. Preview again. Nothing was replaced.";
        q("apply").disabled = true;
        preview = null;
        return;
      }
      const count = preview.matches.length;
      const ok = EditorTransactions.run("Replace " + count + " occurrences", () => {
        for (const m of [...preview.matches].reverse()) patch(m, v.replacement);
      });
      if (ok) {
        close();
        toast(count + " replacements applied. Undo is available.");
      } else {
        q("error").textContent = "Replacement did not complete. Preview again before retrying.";
        preview = null;
        q("apply").disabled = true;
      }
    };
    for (const field of d.querySelectorAll("input")) field.addEventListener("input", invalidate);
    q("cancel").onclick = close;
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("close", close, { once: true });
    d.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close();
      } else if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const unsubscribe = EditorSession.subscribe((s) => {
      if (s.pid !== pid) close();
    });
    document.body.append(d);
    d.showModal();
    q("find").focus();
  };
})();
