/* ============================================================================
 * SOPHIA · 32-layout-studio
 * Layout Studio: off-screen A4 plan and block pagination rules.
 * Reused from V76 (layout-studio-v27); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* Preview plans are measured off-screen. No document nodes are moved until
   explicit apply or the user requests A4 view. Rules are document edits;
   switching views is not a content revision. */
window.LayoutStudio = (() => {
  "use strict";
  let active = null;
  const make = (tag, text) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  };
  function open() {
    if (active?.isConnected) {
      active.querySelector("[data-block]").focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil,#archiveView")) {
      toast("Finish the current dialog first.");
      return;
    }
    let blocks;
    try {
      blocks = LayoutEngine.elements(area);
    } catch (e) {
      toast(e.message);
      return;
    }
    const origin = document.activeElement,
      pid = EditorSession.get().pid,
      baseline = cleanContent();
    const rules = blocks.map((n) => ({
        before: n.dataset.layoutBefore === "page",
        keep: n.dataset.layoutKeep || "auto",
      })),
      original = JSON.stringify(rules);
    const d = make("dialog");
    active = d;
    d.className = "layout-studio-v27";
    d.setAttribute("aria-label", "Layout Studio");
    d.innerHTML =
      '<header><small>LAYOUT ENGINE · V27</small><h2>Plan the page, preserve the content</h2><p>Measure A4 breaks before applying. Text, tables, figures and graphic cards remain whole.</p></header><section><div class="ls27-controls"><label>Top-level body block<select data-block></select></label><p data-description></p><fieldset data-rules><legend>Pagination rules</legend><label><input type="checkbox" data-before>Start on a new page</label><label>Keep with next block<select data-keep><option value="auto">Automatic · headings stay with next</option><option value="next">Always keep with next</option><option value="none">Allow break after this block</option></select></label><button type="button" data-stage>Stage block rules</button></fieldset><p class="ls27-note">Rules apply to top-level body blocks. A Quick Card grid is kept as one graphic composition. Figure captions stay inside their figure. Large tables and paragraphs are not split in this release.</p><button type="button" data-preview>Calculate A4 page plan</button><p data-status role="status" aria-live="polite">No calculation yet. Current document is unchanged.</p><p data-error role="alert"></p></div><div><h3>Calculated page plan</h3><div data-plan></div><h3>Layout warnings</h3><div data-warnings></div></div></section><footer><div><button type="button" data-close>Cancel</button><button type="button" data-discard hidden>Discard rules and close</button></div><button type="button" data-apply disabled>Apply plan & show A4</button></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    let selected = 0,
      report = null,
      previewRules = "",
      closed = false,
      working = false,
      measurement = null;
    blocks.forEach((n, i) => {
      const o = make(
        "option",
        i +
          1 +
          " · " +
          n.tagName.toLowerCase() +
          " · " +
          (n.textContent.trim().slice(0, 90) || n.querySelector("img")?.alt || "Image / empty block"),
      );
      o.value = i;
      q("block").append(o);
    });
    q("rules").disabled = !pid || !blocks.length;
    function changed() {
      return JSON.stringify(rules) !== original;
    }
    function valid() {
      return (
        EditorSession.get().pid === pid &&
        cleanContent() === baseline &&
        blocks.every((n) => n.isConnected && area.contains(n))
      );
    }
    function close(force = false) {
      if (closed) return;
      if (changed() && !force) {
        q("error").textContent = "Pagination rules have unapplied changes. Apply or explicitly discard them.";
        q("discard").hidden = false;
        return;
      }
      closed = true;
      unsubscribe();
      measurement?.remove();
      if (d.open) d.close();
      d.remove();
      active = null;
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    function controls() {
      const n = blocks[selected],
        r = rules[selected];
      q("before").checked = r?.before || false;
      q("keep").value = r?.keep || "auto";
      q("description").textContent = n
        ? n.textContent.trim().slice(0, 300) || "Image or empty block"
        : "No body blocks.";
    }
    function invalidate() {
      report = null;
      q("apply").disabled = true;
      q("status").textContent = "Rules changed. Calculate again before applying.";
    }
    q("block").onchange = () => {
      selected = Number(q("block").value);
      controls();
    };
    q("stage").onclick = () => {
      if (!valid()) {
        q("error").textContent = "Document or session changed. Close and reopen.";
        return;
      }
      rules[selected] = { before: q("before").checked, keep: q("keep").value };
      invalidate();
      q("error").textContent = "";
    };
    q("preview").onclick = async () => {
      if (working) return;
      if (!valid()) {
        q("error").textContent = "Document or session changed. Close and reopen.";
        return;
      }
      working = true;
      report = null;
      q("apply").disabled = true;
      q("preview").disabled = true;
      q("error").textContent = "";
      q("status").textContent = "Waiting for fonts and measuring rendered blocks…";
      try {
        if (area.querySelector("script,iframe,object,embed"))
          throw Error("Remove active embedded content before measuring layout.");
        if ([...area.querySelectorAll("img")].some((im) => !im.src.startsWith("data:")))
          throw Error("Embed external or temporary images before calculating a portable page plan.");
        await document.fonts.ready;
        if (closed) return;
        measurement = area.cloneNode(true);
        measurement.removeAttribute("id");
        measurement.classList.add("layout-measure-v27");
        measurement.setAttribute("aria-hidden", "true");
        measurement.inert = true;
        measurement
          .querySelectorAll("[contenteditable]")
          .forEach((n) => n.removeAttribute("contenteditable"));
        measurement.querySelectorAll("img").forEach((im) => (im.loading = "eager"));
        document.body.append(measurement);
        await Promise.all([...measurement.querySelectorAll("img")].map((im) => im.decode().catch(() => {})));
        await new Promise((resolve) => requestAnimationFrame(resolve));
        if (closed) return;
        if (!valid()) throw Error("Document changed while calculating. Reopen Layout Studio.");
        const overrides = new Map(
          rules.map((r, i) => [
            i,
            {
              before: r.before,
              keep: r.keep === "next" || (r.keep === "auto" && /^H[1-6]$/.test(blocks[i].tagName)),
            },
          ]),
        );
        report = LayoutEngine.calculate(measurement, overrides);
        previewRules = JSON.stringify(rules);
        q("plan").replaceChildren();
        for (const p of report.pages) {
          const card = make("article");
          card.append(
            make(
              "h4",
              "Page " + p.number + " · " + p.blocks + " blocks · " + p.fill + "% of available body height",
            ),
          );
          const meter = make("meter");
          meter.min = 0;
          meter.max = 100;
          meter.value = Math.min(100, p.fill);
          meter.setAttribute("aria-label", "Page " + p.number + " body fill");
          card.append(meter);
          const list = make("ul");
          report.placements.forEach((page, i) => {
            if (page === p.number)
              list.append(
                make(
                  "li",
                  i +
                    1 +
                    " · " +
                    blocks[i].tagName.toLowerCase() +
                    " · " +
                    (blocks[i].textContent.trim().slice(0, 95) || "Image / empty block"),
                ),
              );
          });
          card.append(list);
          q("plan").append(card);
        }
        q("warnings").replaceChildren();
        for (const warning of report.warnings)
          q("warnings").append(
            make("p", "Page " + warning.page + " · block " + warning.block + ": " + warning.message),
          );
        if (!report.warnings.length)
          q("warnings").append(
            make(
              "p",
              "No oversized groups detected in this calculation. Check the actual A4 view before printing.",
            ),
          );
        q("status").textContent =
          report.pages.length +
          " page(s) · " +
          report.warnings.length +
          " warning(s). This is a screen-layout plan, not a certified print/PDF result.";
        q("apply").disabled = false;
      } catch (error) {
        report = null;
        q("error").textContent = error.message;
      } finally {
        measurement?.remove();
        measurement = null;
        working = false;
        if (!closed) q("preview").disabled = false;
      }
    };
    q("apply").onclick = () => {
      if (!report || previewRules !== JSON.stringify(rules) || !valid()) {
        q("error").textContent = "Plan is outdated. Recalculate before applying.";
        q("apply").disabled = true;
        return;
      }
      if (changed()) {
        if (!pid) {
          q("error").textContent = "Start editing before changing pagination rules.";
          return;
        }
        const ok = EditorTransactions.run("Pagination rules", () => {
          blocks.forEach((n, i) => {
            const r = rules[i];
            if (r.before) n.dataset.layoutBefore = "page";
            else n.removeAttribute("data-layout-before");
            if (r.keep === "auto") n.removeAttribute("data-layout-keep");
            else n.dataset.layoutKeep = r.keep;
          });
          setDocumentView("paged");
        });
        if (!ok) {
          q("error").textContent = "Rules could not be applied. Close and reopen.";
          return;
        }
      }
      const rulesChanged = changed();
      close(true);
      if (!rulesChanged) setDocumentView("paged");
      toast("A4 layout calculated. Review overflow warnings before printing.");
    };
    q("close").onclick = () => close();
    q("discard").onclick = () => close(true);
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
        q("rules").disabled = true;
        q("apply").disabled = true;
        q("error").textContent = "Editing session changed. Close and reopen.";
      }
    });
    document.body.append(d);
    d.showModal();
    controls();
    q("preview").focus();
  }
  return Object.freeze({ open });
})();
(() => {
  const toolbar = document.querySelector(".toolbar");
  toolbar.querySelectorAll("[data-layout-studio-v27]").forEach((n) => n.remove());
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.layoutStudioV27 = "true";
  b.dataset.commandV24 = "layout";
  b.textContent = "Layout Studio";
  b.setAttribute("onclick", "LayoutStudio.open()");
  toolbar.append(b);
})();
