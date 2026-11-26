/* ============================================================================
 * SOPHIA · 36-checks
 * Document checks (advisory) — also used by the pre-publish checklist.
 * Reused from V76 (document-review-v22); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V22 read-only review workspace. Findings are advisory, not approval gates. */
window.DocumentReview = (() => {
  "use strict";
  let active = null;
  const make = (tag, text) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  };
  function scan() {
    const items = [],
      add = (kind, title, detail, node) => items.push({ kind, title, detail, node });
    const values = [...area.querySelectorAll(".identity .value")].filter(
      (n) => !n.hasAttribute("data-version-cell"),
    );
    for (const n of values)
      if (/TO BE CONFIRMED|NOT VALIDATED|^\s*$/i.test(n.textContent))
        add(
          "Review",
          "Unresolved document property",
          (n.previousElementSibling?.textContent || "Property") + ": " + (n.textContent || "Empty"),
          n,
        );
    const images = [...area.querySelectorAll(".pagecontent img")];
    images.forEach((n, i) => {
      if (!n.alt.trim()) add("Accessibility", "Image has no alternative text", "Body image " + (i + 1), n);
      if (!n.getAttribute("src")?.startsWith("data:"))
        add(
          "Portability",
          "Image is not embedded",
          "Body image " + (i + 1) + " may depend on an external or temporary address.",
          n,
        );
      if (n.complete && !n.naturalWidth)
        add(
          "Resource",
          "Image could not be decoded",
          "Body image " + (i + 1) + ". Check the original file.",
          n,
        );
    });
    area.querySelectorAll(".pagecontent a[href]").forEach((n) => {
      if (!/^(https:|mailto:|#)/i.test(n.getAttribute("href")))
        add("Link", "Review link address", n.textContent.trim() || "Unnamed link", n);
    });
    const paged = !document.body.classList.contains("continuous-view");
    if (paged)
      area.querySelectorAll(".sheet").forEach((n, i) => {
        const c = n.querySelector(".pagecontent"),
          f = n.querySelector(".pagefoot");
        if (
          n.scrollHeight > n.clientHeight + 3 ||
          (c && f && c.getBoundingClientRect().bottom > f.getBoundingClientRect().top + 1)
        )
          add(
            "Layout",
            "Page " + (i + 1) + " needs layout review",
            "Content may extend into the footer or beyond the page.",
            c || n,
          );
      });
    const blocks = [
      ...area.querySelectorAll(
        ".pagecontent h1,.pagecontent h2,.pagecontent h3,.pagecontent h4,.pagecontent p,.pagecontent li,.pagecontent td,.pagecontent th",
      ),
    ].filter((n) => !n.querySelector("p,li,td,th,h1,h2,h3,h4"));
    for (const n of blocks)
      if (
        /\bTO BE CONFIRMED\b|\bconfirmation required\b|\bconfirm before operational use\b/i.test(
          n.textContent,
        )
      )
        add("Review", "Unresolved body text", n.textContent.trim().slice(0, 240), n);
    /* V77 checks */
    area.querySelectorAll(".pagecontent .tbc").forEach((n) =>
      add("Review", "Marked To Be Confirmed", n.textContent.trim().slice(0, 200) || "(empty mark)", n),
    );
    (data.comments || []).filter((c) => !c.resolved).forEach((c) =>
      add("Review", "Open comment", (c.pid || "") + ": " + String(c.text || "").slice(0, 200), SOPHIA.ids.find(c.blockId)),
    );
    area.querySelectorAll(".pagecontent table:not(.identity) td, .pagecontent table:not(.identity) th").forEach((n) => {
      if (!n.textContent.trim() && !n.querySelector("img")) add("Content", "Empty table cell", "Row " + ((n.parentElement?.rowIndex ?? 0) + 1) + ", column " + (n.cellIndex + 1), n);
    });
    const toc = area.querySelector("nav[data-sophia-toc]");
    if (toc && SOPHIA.blocks && !SOPHIA.blocks.tocIsCurrent()) add("Content", "Table of contents is out of date", "Use Update table of contents.", toc);
    return {
      items,
      paged,
      images: images.length,
      revisions: data.revisions.length,
      dirty: EditorSession.get().dirty,
    };
  }
  function open() {
    if (active?.isConnected) {
      active.querySelector("[data-close]").focus();
      return;
    }
    if (document.querySelector("dialog[open]")) {
      toast("Finish the current dialog first.");
      return;
    }
    const origin = document.activeElement,
      d = make("dialog");
    active = d;
    d.className = "review-workspace-v22";
    d.setAttribute("aria-label", "Document review workspace");
    d.innerHTML =
      '<header><small>DOCUMENT REVIEW</small><h2>Check before sharing</h2><p>Read-only checks of the current document, including unsaved edits. No content is changed.</p></header><section><div data-summary class="review-summary"></div><p data-scope></p><label>Show findings<select data-filter><option value="">All findings</option><option>Review</option><option>Accessibility</option><option>Portability</option><option>Resource</option><option>Link</option><option>Layout</option><option>Content</option></select></label><p data-count role="status" aria-live="polite"></p><div data-findings></div></section><footer><button type="button" data-refresh>Run checks again</button><button type="button" data-close>Close review</button></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    let report = null,
      closed = false;
    function close() {
      if (closed) return;
      closed = true;
      if (d.open) d.close();
      d.remove();
      active = null;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    function render() {
      const shown = report.items.filter((x) => !q("filter").value || x.kind === q("filter").value);
      q("count").textContent =
        shown.length + " finding(s) shown. These checks do not certify correctness or approval.";
      q("findings").replaceChildren();
      for (const item of shown) {
        const card = make("article"),
          tag = make("small", item.kind),
          title = make("h3", item.title),
          detail = make("p", item.detail),
          go = make("button", "Locate in document");
        go.type = "button";
        go.onclick = () => {
          if (!item.node?.isConnected) {
            q("count").textContent = "Document changed. Run checks again.";
            return;
          }
          close();
          item.node.scrollIntoView({ block: "center", behavior: "instant" });
          toast(item.title);
        };
        card.append(tag, title, detail, go);
        q("findings").append(card);
      }
      if (!shown.length)
        q("findings").append(
          make(
            "p",
            "No findings in this category. Manual content and print-preview review are still required.",
          ),
        );
    }
    function refresh() {
      report = scan();
      q("summary").replaceChildren();
      for (const [value, label] of [
        [report.items.length, "Findings"],
        [report.images, "Body images"],
        [report.revisions, "Saved revisions"],
      ]) {
        const n = make("div");
        n.append(make("strong", String(value)), make("span", label));
        q("summary").append(n);
      }
      q("scope").textContent =
        (report.dirty ? "Unsaved content changes are included. " : "No pending content changes detected. ") +
        (report.paged
          ? "Page overflow checked in the current rendered A4 layout."
          : "Continuous view: page overflow is not assessed. Switch to A4 pages and rerun checks.");
      render();
    }
    q("filter").onchange = render;
    q("refresh").onclick = refresh;
    q("close").onclick = close;
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("close", close, { once: true });
    d.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    document.body.append(d);
    d.showModal();
    refresh();
    q("close").focus();
  }
  return Object.freeze({ open });
})();
