/* ============================================================================
 * SOPHIA · 32-layout-studio
 * Layout Studio: off-screen A4 plan and block pagination rules.
 * V78 (owner decision T): redesigned — pages as cards listing their blocks, click a block to
 * set "start on a new page" / "keep with next", the plan recalculates automatically, apply.
 * Reused from V76 (layout-studio-v27); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* Preview plans are measured off-screen. No document nodes are moved until
   explicit apply or the user requests A4 view. Rules are document edits;
   switching views is not a content revision. */
window.LayoutStudio = (() => {
  "use strict";
  let active = null;
  const make = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const KIND = (n) =>
    /^H[1-6]$/.test(n.tagName) ? n.tagName : n.tagName === "TABLE" ? "Table" : n.matches("ol,ul") ? "List" : n.matches("aside") ? "Callout" : n.matches("figure,img") || n.querySelector?.("img") ? "Image" : n.matches(".cards") ? "Cards" : n.matches("nav") ? "Contents" : "Text";
  async function measure(blocks, rules) {
    if (area.querySelector("script,iframe,object,embed")) throw Error("Remove active embedded content before measuring layout.");
    await document.fonts.ready;
    const m = area.cloneNode(true);
    m.removeAttribute("id");
    m.classList.add("layout-measure-v27");
    m.setAttribute("aria-hidden", "true");
    m.inert = true;
    m.querySelectorAll("[contenteditable]").forEach((n) => n.removeAttribute("contenteditable"));
    document.body.append(m);
    try {
      await Promise.all([...m.querySelectorAll("img")].map((im) => im.decode().catch(() => {})));
      await new Promise((r) => requestAnimationFrame(r));
      const overrides = new Map(rules.map((r, i) => [i, { before: r.before, keep: r.keep === "next" || (r.keep === "auto" && /^H[1-6]$/.test(blocks[i].tagName)) }]));
      return LayoutEngine.calculate(m, overrides);
    } finally {
      m.remove();
    }
  }
  function open() {
    if (active?.isConnected) { active.querySelector(".sx-ls-block")?.focus(); return; }
    if (document.querySelector("dialog[open],.modalveil,#archiveView")) { toast("Finish the current dialog first."); return; }
    let blocks;
    try { blocks = LayoutEngine.elements(area); } catch (e) { toast(e.message); return; }
    const origin = document.activeElement, pid = EditorSession.get().pid, baseline = cleanContent();
    const rules = blocks.map((n) => ({ before: n.dataset.layoutBefore === "page", keep: n.dataset.layoutKeep || "auto" }));
    const original = JSON.stringify(rules);
    const d = make("dialog", "layout-studio-v27 sx-ls");
    active = d;
    d.setAttribute("aria-label", "Layout Studio");
    d.innerHTML =
      '<header><small>LAYOUT STUDIO · A4 PAGES</small><h2>Plan the pages</h2><p>Click a block to decide where a page starts. Blocks are never split; the document changes only when you apply.</p></header>' +
      '<section class="sx-ls-body"><div class="sx-ls-pages" data-pages aria-label="Calculated pages"></div>' +
      '<aside class="sx-ls-inspector"><h3>Selected block</h3><p class="sx-ls-desc" data-desc>Choose a block on the left.</p>' +
      '<div class="sx-ls-rules" data-rules><label class="sx-ls-check"><input type="checkbox" data-before> Start on a new page</label>' +
      '<span class="sx-ls-cap">Keep with the next block</span><div class="sx-ls-seg" role="radiogroup" aria-label="Keep with next"><button type="button" data-keep="auto" role="radio">Auto</button><button type="button" data-keep="next" role="radio">Always</button><button type="button" data-keep="none" role="radio">Allow break</button></div>' +
      '<p class="sx-ls-hint">Auto keeps headings with what follows.</p><div class="sx-ls-quick"><button type="button" data-prevkeep>Keep with previous</button><button type="button" data-reset>Reset all rules</button></div></div>' +
      '<p class="sx-ls-ro" data-ro hidden>Start editing to change page breaks. You can still preview the plan.</p>' +
      '<h3>Warnings</h3><div data-warnings class="sx-ls-warn"></div>' +
      '<p class="sx-ls-legend"><span class="sx-ls-badge">⤒ new page</span><span class="sx-ls-badge">⛓ keep with next</span></p></aside></section>' +
      '<footer><p data-status role="status" aria-live="polite">Calculating…</p><div><button type="button" data-close>Cancel</button><button type="button" data-discard hidden>Discard rules and close</button><button type="button" data-apply disabled>Apply plan & show A4</button></div></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    let selected = 0, report = null, previewRules = "", closed = false, working = false, again = false, timer = 0;
    const changed = () => JSON.stringify(rules) !== original;
    const valid = () => EditorSession.get().pid === pid && cleanContent() === baseline && blocks.every((n) => n.isConnected && area.contains(n));
    function close(force = false) {
      if (closed) return;
      if (changed() && !force) {
        q("status").textContent = "Page-break rules have unapplied changes. Apply or discard them.";
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
    function inspector() {
      const n = blocks[selected], r = rules[selected];
      q("desc").textContent = n ? (selected + 1) + " · " + KIND(n) + " — " + (n.textContent.trim().slice(0, 220) || "Image or empty block") : "No body blocks.";
      q("before").checked = !!r?.before;
      d.querySelectorAll("[data-keep]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.keep === (r?.keep || "auto"))));
      q("prevkeep").disabled = !pid || selected === 0;
      d.querySelectorAll(".sx-ls-block").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.i === selected)));
    }
    function render() {
      const pages = q("pages");
      pages.replaceChildren();
      if (!report) return;
      for (const p of report.pages) {
        const card = make("article", "sx-ls-page");
        const head = make("div", "sx-ls-head");
        head.append(make("b", "", "Page " + p.number), make("span", "", p.blocks + " block" + (p.blocks === 1 ? "" : "s") + " · " + Math.round(p.fill) + "% full"));
        const meter = make("div", "sx-ls-meter");
        const bar = make("span");
        bar.style.width = Math.min(100, p.fill) + "%";
        if (p.fill > 100) meter.classList.add("is-over");
        meter.append(bar);
        card.append(head, meter);
        report.placements.forEach((page, i) => {
          if (page !== p.number) return;
          const n = blocks[i], r = rules[i];
          const b = make("button", "sx-ls-block");
          b.type = "button";
          b.dataset.i = i;
          b.append(make("span", "sx-ls-kind", KIND(n)), make("span", "sx-ls-text", n.textContent.trim().slice(0, 80) || "Image / empty block"));
          if (r.before) b.append(make("span", "sx-ls-badge", "⤒"));
          if (r.keep === "next" || (r.keep === "auto" && /^H[1-6]$/.test(n.tagName))) b.append(make("span", "sx-ls-badge" + (r.keep === "auto" ? " is-auto" : ""), "⛓"));
          if (report.warnings.some((w) => w.block === i + 1)) b.classList.add("is-warn");
          b.onclick = () => { selected = i; inspector(); };
          card.append(b);
        });
        pages.append(card);
      }
      q("warnings").replaceChildren();
      for (const w of report.warnings) q("warnings").append(make("p", "", "Page " + w.page + " · block " + w.block + ": " + w.message));
      if (!report.warnings.length) q("warnings").append(make("p", "sx-ls-ok", "No oversized blocks. Check the A4 view before printing."));
      inspector();
    }
    async function recalc() {
      if (working) { again = true; return; }
      if (!valid()) { q("status").textContent = "The document changed. Close and reopen Layout Studio."; q("apply").disabled = true; return; }
      working = true;
      q("apply").disabled = true;
      q("status").textContent = "Calculating…";
      try {
        report = await measure(blocks, rules);
        if (closed) return;
        previewRules = JSON.stringify(rules);
        render();
        q("status").textContent = report.pages.length + " page(s) · " + report.warnings.length + " warning(s)" + (changed() ? " · rules changed, not applied yet" : "");
        q("apply").disabled = false;
      } catch (e) {
        report = null;
        q("status").textContent = e.message;
      } finally {
        working = false;
        if (again && !closed) { again = false; recalc(); }
      }
    }
    const soon = () => { clearTimeout(timer); timer = setTimeout(recalc, 120); };
    function setRule(patch) {
      if (!pid) return;
      Object.assign(rules[selected], patch);
      inspector();
      soon();
    }
    q("before").onchange = () => setRule({ before: q("before").checked });
    d.querySelectorAll("[data-keep]").forEach((b) => (b.onclick = () => setRule({ keep: b.dataset.keep })));
    q("prevkeep").onclick = () => { if (selected > 0 && pid) { rules[selected - 1].keep = "next"; inspector(); soon(); } };
    q("reset").onclick = () => { if (!pid) return; rules.forEach((r) => { r.before = false; r.keep = "auto"; }); inspector(); soon(); };
    q("rules").toggleAttribute("inert", !pid);
    q("rules").classList.toggle("is-ro", !pid);
    q("ro").hidden = !!pid;
    if (!pid) q("apply").textContent = "Show A4 pages";
    q("apply").onclick = () => {
      if (!report || previewRules !== JSON.stringify(rules) || !valid()) { q("status").textContent = "Plan is outdated. Wait for the recalculation."; soon(); return; }
      const rulesChanged = changed();
      if (rulesChanged) {
        if (!pid) { q("status").textContent = "Start editing before changing page-break rules."; return; }
        const ok = EditorTransactions.run("Page-break rules", () => {
          blocks.forEach((n, i) => {
            const r = rules[i];
            if (r.before) n.dataset.layoutBefore = "page"; else n.removeAttribute("data-layout-before");
            if (r.keep === "auto") n.removeAttribute("data-layout-keep"); else n.dataset.layoutKeep = r.keep;
          });
        });
        if (!ok) { q("status").textContent = "Rules could not be applied. Close and reopen."; return; }
      }
      close(true);
      setDocumentView("pages");
      toast(rulesChanged ? "Page-break rules applied. A4 pages recalculated." : "A4 pages shown.");
    };
    q("close").onclick = () => close();
    q("discard").onclick = () => close(true);
    d.addEventListener("cancel", (e) => { e.preventDefault(); close(); });
    d.addEventListener("close", () => close(true), { once: true });
    d.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) { e.preventDefault(); e.stopPropagation(); }
      if (e.target.matches?.(".sx-ls-block") && ["ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        const all = [...d.querySelectorAll(".sx-ls-block")], i = all.indexOf(e.target);
        all[Math.max(0, Math.min(all.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))]?.click();
        d.querySelector('.sx-ls-block[aria-pressed="true"]')?.focus();
      }
    });
    const unsubscribe = EditorSession.subscribe((st) => {
      if (st.pid !== pid) { q("apply").disabled = true; q("status").textContent = "Editing session changed. Close and reopen."; }
    });
    document.body.append(d);
    d.showModal();
    recalc().then(() => d.querySelector(".sx-ls-block")?.focus());
  }
  return Object.freeze({ open });
})();
