/* ============================================================================
 * SOPHIA · 38-print
 * Print Studio (iframe + strict CSP) and the controlled print frame: footer with ID/version/status/date and DRAFT watermark.
 * Reused from V76 (p42-print-module); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
SOPHIA.print = (() => {
  const esc = (s) => '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/[\r\n]+/g, " ") + '"';
  const isDraft = () => !/^published/i.test(String(data.status || ""));
  function footerText() {
    return [data.id, "V" + data.documentVersion, data.status, "Printed " + SOPHIA.util.dateStamp(), "Uncontrolled copy when printed"].join(" · ");
  }
  function watermarkCSS() {
    return '@media print,screen{body::after{content:"DRAFT — NOT APPROVED";position:fixed;left:0;right:0;top:42%;text-align:center;font:700 54pt/1 "DM Sans",Arial,sans-serif;color:rgba(160,47,76,.12);transform:rotate(-24deg);pointer-events:none;z-index:9}}';
  }
  function injectBrowserPrintFrame() {
    removeBrowserPrintFrame();
    const s = document.createElement("style");
    s.id = "sophia-print-runtime";
    s.dataset.runtime = "";
    s.textContent = "@page{margin:13mm 15mm 15mm;@bottom-left{content:" + esc(footerText()) + ";font:8pt 'DM Sans',Arial;color:#435369}@bottom-right{content:counter(page) \" / \" counter(pages);font:9pt 'DM Sans',Arial;color:#435369}}" +
      (isDraft() ? watermarkCSS().replace("print,screen", "print") : "");
    document.head.append(s);
  }
  function removeBrowserPrintFrame() { document.getElementById("sophia-print-runtime")?.remove(); }
  return { footerText, isDraft, watermarkCSS, cssString: esc, injectBrowserPrintFrame, removeBrowserPrintFrame };
})();
(() => {
  "use strict";
  const templateCSS = [...document.querySelectorAll('style[data-sophia="paper"]')].map((s) => s.textContent).join("\n");
  const fonts = () =>
    [...document.querySelectorAll("style")]
      .filter((s) => s.id !== "p42-print-module" && s.id !== "p42-print-ui")
      .flatMap((s) => s.textContent.match(/@font-face\s*\{[^{}]*\}/g) || [])
      .filter((s) => /url\(\s*['"]?data:/i.test(s))
      .join("\n");
  const rules = `
html{--print-ready:425}
#document{font:14px/1.45 'DM Sans',Arial,sans-serif}

:is(#document,.layout-measure-v27) .pagecontent table:not(.identity){box-sizing:border-box;inline-size:100%!important;max-inline-size:100%!important;min-inline-size:0!important;table-layout:fixed!important;margin-inline:0!important}
:is(#document,.layout-measure-v27) .pagecontent table:not(.identity) :is(td,th){box-sizing:border-box;min-width:0;overflow-wrap:anywhere!important;white-space:normal!important}
:is(#document,.layout-measure-v27) .pagecontent table:not(.identity) :is(p,span,code,pre,a){overflow-wrap:anywhere!important;white-space:pre-wrap!important}
:is(#document,.layout-measure-v27) .pagecontent table:not(.identity) :is(img,svg,figure){max-inline-size:100%!important}
:is(#document,.layout-measure-v27) .pagecontent table:has(>colgroup[data-v425-cols]) :is(td,th){width:auto!important}
#document .sheet .pagehead{box-sizing:border-box;overflow-wrap:anywhere;flex:none;break-inside:avoid;break-after:avoid}
#document .sheet table.pagehead{display:table;table-layout:fixed;width:100%;border-collapse:collapse}
#document .sheet table.pagehead td:first-child{width:18%}
body.continuous-view #document>.sheet:not(:first-child)>.pagehead{display:none}
@media print{body.continuous-view #document>.sheet:not(:first-child)>table.pagehead{display:table!important}#document .sheet>.pagehead{margin-block-end:4mm!important}}

#document .sheet>.pagehead{margin-block-end:4mm!important;break-after:avoid-page}
#document .sheet>.pagehead+ .doc-classification{break-after:avoid-page}
#document .sheet>:is(.brand,.identity,.doc-classification){max-width:100%;overflow-wrap:anywhere;break-after:avoid-page}
#document .sheet>.brand{height:auto;min-height:9mm}
#document .sheet>.brand img{max-width:65%!important;height:auto!important}
#document .sheet .cards{grid-template-columns:repeat(2,minmax(0,1fr))}

html,body{padding:0!important;margin:0!important;background:white!important;color:#122338!important;height:auto!important;overflow:visible!important;display:block!important;zoom:1!important}
#document,.workspace,.h20-canvas{display:block!important;width:auto!important;margin:0!important;padding:0!important;zoom:1!important;transform:none!important;overflow:visible!important}
#document .sheet{display:block!important;box-sizing:border-box;width:auto!important;min-width:0!important;max-width:none!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;transform:none!important;box-shadow:none!important;border:0!important;break-after:auto!important;page-break-after:auto!important;break-inside:auto!important}
#document .sheet .pagecontent{height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
#document .pagefoot,.p42-number{display:none!important}
#document :is(img,svg,table){max-width:100%!important}
#document img{object-fit:contain}
#document .qc-hero{break-inside:avoid;overflow:visible!important;margin:0 0 5mm!important;padding:5mm!important;border:1px solid #bacbd7!important;border-radius:8px!important;background:#f3f7fb!important;color:#15334c!important}
#document .qc-hero *{color:#15334c!important;text-shadow:none!important}
#document :is(.qc-hero th,.qc-hero td,thead th,thead td){color:#15334c!important;background:#edf3f8!important;border-color:#b7c6d4!important}
#document .qc-hero :is(dt,th){font-weight:700}
#document .qc-hero .brand .corporate-logo{filter:brightness(.22) grayscale(1)!important;width:38mm!important;max-width:100%!important;height:auto!important}
#document .qc-hero .brand{margin:0 0 2mm!important}
#document .qc-hero .qc-kicker{color:#325572!important} #document table{overflow-wrap:anywhere} #document td,#document th{max-width:100%;overflow-wrap:anywhere}
#document thead{display:table-header-group} #document :is(tr,figure,img){break-inside:avoid} #document :is(h1,h2,h3,h4,caption,figcaption){break-after:avoid} #document :is(p,li){orphans:2;widows:2}
.p42-old{border:2px solid #8d293d;color:#711d31;background:white;font:700 10pt/1.35 Arial;padding:2mm 3mm;margin:0 0 4mm}
@media print{#document .sheet+.sheet{break-before:page}#document{print-color-adjust:exact;-webkit-print-color-adjust:exact}html,body{width:auto!important}}
`;
  function makeCopy(source) {
    const root = source.cloneNode(true);
    root.id = "document";
    root
      .querySelectorAll(
        "script,style,iframe,object,embed,link,meta,base,.ui-icon,.image-resize-handle,.resize-handle,.page-controls,[data-media-ui],form,video,audio,source,track,svg foreignObject",
      )
      .forEach((n) => n.remove());
    for (const n of [root, ...root.querySelectorAll("*")])
      for (const a of [...n.attributes])
        if (
          /^on/i.test(a.name) ||
          /^(contenteditable|autofocus|srcset|ping|srcdoc)$/i.test(a.name) ||
          (/^(href|xlink:href|action|formaction)$/i.test(a.name) && /^\s*javascript:/i.test(a.value))
        )
          n.removeAttribute(a.name);
    root.querySelectorAll("img").forEach((i) => {
      const src = i.getAttribute("src") || "";
      i.removeAttribute("loading");
      if (!/^data:image\//i.test(src)) {
        const alt = document.createElement("span");
        alt.textContent = "[Image not embedded: " + (i.alt || "image") + "]";
        i.replaceWith(alt);
      }
    });
    root.querySelectorAll("a,area").forEach((a) => {
      const u = a.getAttribute("href") || "";
      if (!/^(https?:|mailto:|#)/i.test(u)) a.removeAttribute("href");
      a.setAttribute("rel", "noopener noreferrer");
    });
    root.querySelectorAll(".pagecontent table:not(.identity)").forEach((t) => {
      const r = t.tBodies[0]?.rows[0];
      if (!t.tHead && r?.cells.length && [...r.cells].every((c) => c.tagName === "TH" && c.rowSpan === 1))
        t.createTHead().append(r);
    });
    if (!root.querySelector(".sheet")) {
      const s = document.createElement("section");
      s.className = "sheet";
      s.append(...root.childNodes);
      root.append(s);
    }
    // Mark only boundaries crossed by a merged cell. Preserve the DOM and native table semantics.
    root.querySelectorAll(".pagecontent table:not(.identity)").forEach((table) => {
      for (const body of table.tBodies) {
        const rows = [...body.rows];
        let through = 0;
        rows.forEach((row, i) => {
          for (const cell of row.cells)
            through = Math.max(
              through,
              cell.rowSpan === 0 ? rows.length : Math.min(rows.length, i + cell.rowSpan),
            );
          if (i + 1 < through) {
            row.dataset.p62KeepNext = "";
            rows[i + 1].dataset.p62KeepPrev = "";
          }
        });
      }
    });
    return root;
  }
  function open(source = document.querySelector("#document"), options = {}) {
    if (!source || document.getElementById("p42-print")) return;
    const origin = document.activeElement,
      copy = makeCopy(source);
    const old = !!options.old;
    const d = document.createElement("dialog");
    d.id = "p42-print";
    d.setAttribute("aria-labelledby", "p42-title");
    d.innerHTML = `<header><div><small>OUTPUT · PRINT STUDIO</small><h2 id="p42-title">Print preview</h2><p data-p42-source></p><p class="p42-controlled" data-p42-controlled></p></div><div class="p42-actions"><label>Paper <select data-p42-paper><option value="A4">A4</option><option value="Letter">Letter</option></select></label><label>Page breaks <select data-p61-flow><option value="sheet">Keep sheet starts</option><option value="flow">Let content flow</option></select></label><button type="button" data-p42-copy>Download print copy</button><button type="button" data-p42-close hidden>Close preview</button><button type="button" data-p42-print disabled>Print / Save PDF</button></div></header><p class="p42-note" role="status">Preparing preview...</p><div class="p42-viewport"><iframe title="Document-only print preview" sandbox="allow-same-origin allow-modals"></iframe></div>`;
    {
      /* V78: what the controlled output will carry (owner decision H) */
      const chips = d.querySelector("[data-p42-controlled]");
      const add = (t) => { const c = document.createElement("span"); c.textContent = t; chips.append(c); };
      add("Footer: " + data.id + " · V" + data.documentVersion + " · " + data.status + " · printed date");
      add("“Uncontrolled copy when printed”");
      if (SOPHIA.print.isDraft()) add("DRAFT watermark (not published)");
    }
    const frame = d.querySelector("iframe"),
      viewport = d.querySelector(".p42-viewport"),
      paper = d.querySelector("[data-p42-paper]"),
      flow = d.querySelector("[data-p61-flow]"),
      button = d.querySelector("[data-p42-print]"),
      notice = d.querySelector(".p42-note");
    d.querySelector("[data-p42-source]").textContent =
      options.label || "Current document on screen, including any unsaved edits.";
    let generation = 0,
      timer = 0,
      html = "",
      ready = false;
    function fit() {
      if (!ready) return;
      const doc = frame.contentDocument;
      if (!doc?.body) return;
      const width = paper.value === "A4" ? 794 : 816;
      const z = Math.min(1, Math.max(0.15, (viewport.clientWidth - 26) / width));
      frame.style.width = width + "px";
      frame.style.zoom = String(z);
      frame.style.height = Math.ceil(doc.body.getBoundingClientRect().height + 16) + "px";
    }
    function fail() {
      ready = false;
      frame.style.visibility = "hidden";
      button.disabled = true;
      notice.textContent =
        "Preview unavailable in this window. Download the print copy, open it in your browser and use Ctrl+P.";
    }
    d.querySelector("[data-p42-copy]").onclick = () => {
      if (!html) return;
      const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "Document_Print_" + paper.value + (flow.value === "flow" ? "_Flow" : "") + ".html";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    };
    function render() {
      const n = ++generation,
        letter = paper.value === "Letter",
        w = letter ? "215.9mm" : "210mm",
        h = letter ? "279.4mm" : "297mm";
      button.disabled = true;
      notice.textContent = "Preparing preview...";
      clearTimeout(timer);
      ready = false;
      frame.style.visibility = "hidden";
      frame.style.height = "180px";
      frame.style.width = (letter ? "816" : "794") + "px";
      const root = copy.cloneNode(true);
      root.dataset.printCycle = String(n);
      root.dataset.p61Flow = flow.value;
      if (old)
        root.querySelectorAll(".sheet").forEach((s) => {
          const m = document.createElement("div");
          m.className = "p42-old";
          m.textContent = "HISTORICAL VERSION / NOT THE LATEST / " + (options.label || "Saved revision");
          s.prepend(m);
        });
      const pageCSS = `
  #document .pagecontent img:not(.corporate-logo){max-height:${letter ? "220mm" : "237mm"}!important;height:auto!important;object-fit:contain}
  @media print{
   #document[data-p61-flow=flow] .sheet+.sheet{break-before:auto!important;page-break-before:auto!important}
   #document .pagecontent table:not(.identity),#document .pagecontent tbody{break-inside:auto!important;page-break-inside:auto!important}
   #document .pagecontent thead{display:table-header-group!important;break-inside:avoid}
   #document .pagecontent tbody>tr{break-inside:avoid;page-break-inside:avoid}
   #document .pagecontent tr[data-p62-keep-next]{break-after:avoid;page-break-after:avoid}
   #document .pagecontent tr[data-p62-keep-prev]{break-before:avoid;page-break-before:avoid}
   #document .pagecontent figure:has(>img){break-inside:avoid}
   #document .pagecontent figure>img:has(~figcaption){break-after:avoid}
  }
  @page{size:${letter ? "letter" : "A4"};margin:13mm 15mm 15mm;@bottom-left{content:${old ? '"HISTORICAL VERSION - NOT THE LATEST"' : SOPHIA.print.cssString(SOPHIA.print.footerText())};font:${old ? "700 8pt" : "8pt"} 'DM Sans',Arial;color:${old ? "#721b31" : "#435369"}}@bottom-right{content:counter(page) " / " counter(pages);font:9pt Arial;color:#435369}}
  ${!old && SOPHIA.print.isDraft() ? SOPHIA.print.watermarkCSS() : ""}
  @media screen{html,body{background:#dbe5f0!important}#document .sheet{width:${w}!important;min-height:${h}!important;padding:13mm 15mm 15mm!important;margin:0 auto 14px!important;background:white!important;box-shadow:0 2px 8px #172f492b!important}}`;
      const accept = async () => {
        if (n !== generation || !d.open) return;
        try {
          const doc = frame.contentDocument;
          if (doc?.querySelector("#document")?.dataset.printCycle !== String(n)) return;
          await Promise.all([doc.fonts?.ready, ...[...doc.images].map((i) => i.decode().catch(() => {}))]);
          if (n !== generation || !d.open || doc !== frame.contentDocument) return;
          if (
            doc.defaultView.getComputedStyle(doc.documentElement).getPropertyValue("--print-ready").trim() !==
            "425"
          ) {
            clearTimeout(timer);
            fail();
            return;
          }
          clearTimeout(timer);
          ready = true;
          fit();
          frame.style.visibility = "visible";
          button.disabled = false;
          const usable = ((letter ? 251.4 : 269) * 96) / 25.4;
          const tables = [...doc.querySelectorAll(".pagecontent table:not(.identity)")];
          const tall = tables.some((t) =>
            [...t.tBodies].some((b) =>
              [...b.rows].some((r) => r.offsetHeight + (t.tHead?.offsetHeight || 0) > usable),
            ),
          );
          const merged = tables.some((t) => t.querySelector("[data-p62-keep-next]"));
          const scaled = [...doc.querySelectorAll(".pagecontent img:not(.corporate-logo)")].some(
            (i) => i.naturalWidth && i.width && (i.width * i.naturalHeight) / i.naturalWidth > i.height + 2,
          );
          notice.textContent =
            (flow.value === "flow"
              ? "Sheet starts are not forced in the output. "
              : "Sheet starts are kept; long sheets may span several pages. ") +
            (tall ? "A table row may be taller than the printable area. " : "") +
            (merged ? "Check merged rows at page breaks. " : "") +
            (scaled ? "Tall images are fitted on the print copy. " : "") +
            "The on-screen view is continuous within each sheet. Check final breaks in the browser print preview and turn off browser headers and footers.";
        } catch {
          if (n === generation && d.open) {
            clearTimeout(timer);
            fail();
          }
        }
      };
      frame.onload = accept;
      html =
        "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'\"><title>Document print copy</title><style>" +
        templateCSS +
        "\n" +
        fonts() +
        "\n" +
        rules +
        "\n" +
        pageCSS +
        "</style></head><body>" +
        root.outerHTML +
        "</body></html>";
      timer = setTimeout(() => {
        if (n === generation && !ready) fail();
      }, 4500);
      try {
        frame.srcdoc = html;
      } catch {
        clearTimeout(timer);
        fail();
      }
    }
    const observer = new ResizeObserver(fit);
    d.querySelector("[data-p42-close]").onclick = () => d.close();
    paper.onchange = render;
    flow.onchange = render;
    button.onclick = () => {
      try {
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch {
        notice.textContent = "Printing was blocked by the browser. Check your managed profile settings.";
      }
    };
    d.addEventListener(
      "close",
      () => {
        generation++;
        clearTimeout(timer);
        observer.disconnect();
        d.remove();
        if (origin?.isConnected) origin.focus({ preventScroll: true });
      },
      { once: true },
    );
    document.body.append(d);
    d.showModal();
    observer.observe(viewport);
    render();
  }
  window.PrintStudio42 = { open };
})();
