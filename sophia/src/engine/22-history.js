/* ============================================================================
 * SOPHIA · 22-history
 * History Studio: replay of saved revisions, word-level attribution, clean/changes views, historical red + watermark.
 * Reused from V76 (history-engine-v20 + history-repair-v29 (Quick Card branch, now shared)); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
(() => {
  "use strict";
  if (window.historyStudioInstalled) return;
  window.historyStudioInstalled = true;
  const palette = [
    "#ffff00",
    "#00ffff",
    "#ffad5b",
    "#00ff00",
    "#ff00ff",
    "#a6bfff",
    "#ffc4dc",
    "#d4ff66",
    "#c6a5ff",
  ];
  const validPID = (x) => typeof localPIDKeys !== "undefined" && Object.hasOwn(localPIDKeys, x);
  function meta(r, i) {
    let p = r.editorPID || r.author;
    return {
      pid: validPID(p) ? p : "Attribution unavailable",
      date: r.date || "",
      version: String(r.version || "?"),
      index: i,
    };
  }
  function color(m) {
    if (!m || !validPID(m.pid)) return "#edf0f3";
    return palette[Object.keys(localPIDKeys).indexOf(m.pid) % palette.length];
  }
  function label(m) {
    m = m || { pid: "Attribution unavailable", version: "?", date: "" };
    return m.pid + " · V" + m.version + " · " + m.date;
  }
  function tokens(s) {
    return s.match(/\s+|[^\s]+/gu) || [];
  }
  const h75Meta = (n) =>
    !!n.closest?.(".identity,[data-trace],.brand,.doc-classification,.pagehead,.pagefoot");
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0).toString(16);
  }
  function safeRoot(html) {
    const parsed = new DOMParser().parseFromString(typeof html === "string" ? html : "", "text/html");
    const out = document.createElement("div");
    const allowed = new Set(
      "ARTICLE SECTION DIV P H1 H2 H3 H4 H5 H6 UL OL LI TABLE THEAD TBODY TFOOT TR TD TH CAPTION COLGROUP COL FIGURE FIGCAPTION IMG SPAN STRONG B EM I U S DEL INS MARK SMALL SUP SUB BR HR BLOCKQUOTE ASIDE A".split(
        " ",
      ),
    );
    const drop = new Set(
      "SCRIPT STYLE IFRAME OBJECT EMBED LINK META BASE FORM INPUT BUTTON TEXTAREA SELECT SVG MATH VIDEO AUDIO SOURCE TEMPLATE NOSCRIPT".split(
        " ",
      ),
    );
    const props = new Set(
      "color background-color font-family font-size font-weight font-style text-decoration text-align line-height letter-spacing white-space overflow-wrap width max-width min-width height max-height min-height margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left border border-top border-right border-bottom border-left border-color border-width border-style border-collapse border-radius display float clear vertical-align list-style-type table-layout break-inside page-break-inside grid-template-columns gap".split(
        " ",
      ),
    );
    function copy(node, parent) {
      if (node.nodeType === 3) {
        parent.append(document.createTextNode(node.nodeValue));
        return;
      }
      if (node.nodeType !== 1 || drop.has(node.tagName)) return;
      if (!allowed.has(node.tagName)) {
        for (const child of node.childNodes) copy(child, parent);
        return;
      }
      const n = document.createElement(node.tagName.toLowerCase());
      for (const name of [
        "class",
        "id",
        "title",
        "alt",
        "width",
        "height",
        "colspan",
        "rowspan",
        "scope",
        "start",
        "data-history-id",
        "data-block-id",
      ]) {
        if (node.hasAttribute(name)) n.setAttribute(name, node.getAttribute(name));
      }
      // No event handlers, srcset, links, forms, CSS URLs or active embedded content.
      for (const prop of node.style) {
        const value = node.style.getPropertyValue(prop);
        if (props.has(prop) && !/(url\s*\(|expression\s*\(|@import|javascript:|var\s*\()/i.test(value))
          n.style.setProperty(prop, value);
      }
      if (node.tagName === "IMG") {
        const src = node.getAttribute("src") || "";
        if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(src)) n.src = src;
        else {
          n.alt = (node.getAttribute("alt") || "Image") + " [external or unsupported source not loaded]";
          n.style.border = "1px dashed #a77640";
        }
      }
      for (const child of node.childNodes) copy(child, n);
      parent.append(n);
    }
    for (const n of parsed.body.childNodes) copy(n, out);
    if (!out.querySelector(".pagecontent")) {
      const c = document.createElement("div");
      c.className = "pagecontent";
      const source = out.querySelector("article#document") || out;
      c.append(...source.childNodes);
      out.replaceChildren(c);
    }
    return normalizeBody(out);
  }

  function blocks(html) {
    let root = safeRoot(html),
      nodes = [];
    root.querySelectorAll(".qc-hero,.pagecontent").forEach((c) =>
      c.querySelectorAll("h1,h2,h3,h4,p,li,td,th,figcaption,img").forEach((n) => {
        if (h75Meta(n)) return;
        if (n.tagName !== "IMG" && n.querySelector("h1,h2,h3,h4,p,li,td,th,figcaption")) return;
        nodes.push(n);
      }),
    );
    let section = "Document";
    return nodes.map((n, i) => {
      if (/^H[1-4]$/.test(n.tagName)) section = n.textContent.trim();
      let image = n.tagName === "IMG",
        text = image ? "[Image: " + (n.alt || "no description") + "]" : n.textContent;
      return {
        node: n,
        tag: n.tagName,
        text,
        section,
        image,
        asset: image ? hash(n.getAttribute("src") || "") : "",
        style: hash(
          n.outerHTML.replace(/ contenteditable="[^"]*"/g, "").replace(/ data-block-id="[^"]*"/g, ""),
        ),
        key: SOPHIA.ids.VALID.test(n.getAttribute("data-block-id") || "")
          ? n.getAttribute("data-block-id")
          : null,
        id: n.dataset.historyId || null,
        pos: i,
      };
    });
  }
  // Word-level LCS. Large paragraphs fall back to a coarse replacement rather than freezing the UI.
  function alignWords(a, b) {
    let n = a.length,
      m = b.length;
    if (n * m > 600000) return b.map(() => -1);
    let rows = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--)
      for (let j = m - 1; j >= 0; j--)
        rows[i][j] = a[i] === b[j] ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1]);
    let map = Array(m).fill(-1),
      i = 0,
      j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        map[j] = i;
        i++;
        j++;
      } else if (rows[i + 1][j] >= rows[i][j + 1]) i++;
      else j++;
    }
    return map;
  }
  function similarity(a, b) {
    let x = new Set(a.toLowerCase().match(/\w+/g) || []),
      y = new Set(b.toLowerCase().match(/\w+/g) || []);
    let both = [...x].filter((t) => y.has(t)).length;
    return both / Math.max(x.size, y.size, 1);
  }
  function transition(previous, current, m) {
    let used = new Set(),
      pairs = Array(current.length).fill(-1),
      changes = [];
    // Prefer only unique stable keys. Legacy snapshots retain heuristic matching.
    const count = (list) => {
        const m = new Map();
        for (const b of list) if (b.key) m.set(b.key, (m.get(b.key) || 0) + 1);
        return m;
      },
      pc = count(previous),
      cc = count(current);
    const unique = (b, counts) => !!b.key && counts.get(b.key) === 1;
    current.forEach((b, j) => {
      if (!unique(b, cc) || pc.get(b.key) !== 1) return;
      const i = previous.findIndex((a) => a.key === b.key);
      pairs[j] = i;
      used.add(i);
    });
    const compatible = (a, b) => !(unique(a, pc) && unique(b, cc) && a.key !== b.key);
    // Exact matches first preserve attribution through insertions and simple moves.
    current.forEach((b, j) => {
      if (pairs[j] >= 0) return;
      let i = previous.findIndex(
        (a, i) =>
          !used.has(i) && compatible(a, b) && a.tag === b.tag && a.text === b.text && a.asset === b.asset,
      );
      if (i >= 0) {
        pairs[j] = i;
        used.add(i);
      }
    });
    current.forEach((b, j) => {
      if (pairs[j] >= 0) return;
      let best = -1,
        score = 0.32;
      previous.forEach((a, i) => {
        if (used.has(i) || !compatible(a, b) || a.tag !== b.tag) return;
        let s = b.image ? (a.pos === b.pos ? 0.7 : 0) : similarity(a.text, b.text);
        if (s > score) {
          score = s;
          best = i;
        }
      });
      if (best >= 0) {
        pairs[j] = best;
        used.add(best);
      }
    });
    // Relative inversions among stable matched blocks, not index shifts from insertion.
    const stable = current
      .map((b, j) => ({ b, j, i: pairs[j] }))
      .filter(
        (x) => x.i >= 0 && unique(x.b, cc) && unique(previous[x.i], pc) && x.b.key === previous[x.i].key,
      );
    let mx = -1;
    const prefix = stable.map((x) => {
      const p = mx;
      mx = Math.max(mx, x.i);
      return p;
    });
    let mn = Infinity;
    const suffix = stable.map(() => 0);
    for (let k = stable.length - 1; k >= 0; k--) {
      suffix[k] = mn;
      mn = Math.min(mn, stable[k].i);
    }
    const reordered = new Set(stable.filter((x, k) => x.i < prefix[k] || x.i > suffix[k]).map((x) => x.j));
    current.forEach((b, j) => {
      let i = pairs[j],
        a = i >= 0 ? previous[i] : null;
      b.id = a?.id || "hb-" + m.index + "-" + j;
      let bt = tokens(b.text);
      if (!a) {
        b.attribution = bt.map((t) => ({ text: t, by: m }));
        changes.push({
          type: b.image ? "Image added" : "Added",
          section: b.section,
          after: b.text,
          block: b.id,
          by: m,
        });
        return;
      }
      let at = a.attribution || tokens(a.text).map((t) => ({ text: t, by: null })),
        map = alignWords(
          at.map((t) => t.text),
          bt,
        );
      b.attribution = bt.map((t, k) => ({
        text: t,
        by: b.image && a.asset !== b.asset ? m : map[k] >= 0 ? at[map[k]].by : m,
      }));
      if (reordered.has(j))
        changes.push({
          type: "Reordered",
          section: b.section,
          before: a.text,
          after: b.text,
          block: b.id,
          by: m,
        });
      if (a.tag !== b.tag || a.text !== b.text || a.asset !== b.asset)
        changes.push({
          type: b.image ? "Image replaced" : "Modified",
          section: b.section,
          before: a.text,
          after: b.text,
          block: b.id,
          by: m,
        });
      else if (a.style !== b.style)
        changes.push({
          type: "Formatting changed",
          section: b.section,
          before: a.text,
          after: b.text,
          block: b.id,
          by: m,
        });
    });
    previous.forEach((a, i) => {
      if (!used.has(i))
        changes.push({
          type: a.image ? "Image deleted" : "Deleted",
          section: a.section,
          before: a.text,
          block: a.id,
          by: m,
        });
    });
    return { blocks: current, changes };
  }
  function replay(record = data) {
    let states = [],
      prev = [];
    record.revisions.forEach((r, i) => {
      let m = meta(r, i),
        result = transition(prev, blocks(r.snapshot), m);
      states.push({ ...result, meta: m, revision: r });
      prev = result.blocks;
    });
    return states;
  }
  window.enrichHistory = function (record) {
    let states = replay(record),
      last = record.revisions.at(-1);
    last.detectedChanges = states.at(-1).changes;
    record.historyEngine = {
      version: 2,
      scope: "body blocks, words and embedded images",
      matching: "unique stable block IDs first; exact and heuristic fallback for legacy blocks",
      limitations:
        "Legacy authorship unavailable unless valid PID. Ambiguous restructuring and large paragraphs may use coarse replacement.",
    };
    return record;
  };
  function decorate(b, mode, prev, show) {
    let n = b.node.cloneNode(true);
    if (!show) return n;
    if (b.image) {
      let m = b.attribution.find((t) => t.by)?.by;
      if (m) {
        n.style.outline = "3px solid " + color(m);
        n.title = label(m);
      }
      return n;
    }
    let list = b.attribution;
    if (mode === "diff") {
      let old = prev?.attribution || [],
        mapping = alignWords(
          old.map((t) => t.text),
          list.map((t) => t.text),
        );
      list = list.map((t, k) => ({ ...t, highlight: mapping[k] < 0 }));
    } else list = list.map((t) => ({ ...t, highlight: !!t.by && validPID(t.by.pid) }));
    let walker = document.createTreeWalker(n, NodeFilter.SHOW_TEXT),
      texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    let offset = 0;
    let spans = list.map((t) => {
      let start = offset;
      offset += t.text.length;
      return { ...t, start, end: offset };
    });
    let pos = 0;
    texts.forEach((text) => {
      let start = pos,
        end = start + text.nodeValue.length;
      pos = end;
      let frag = document.createDocumentFragment();
      spans
        .filter((t) => t.end > start && t.start < end)
        .forEach((t) => {
          let value = t.text.slice(Math.max(0, start - t.start), Math.min(t.text.length, end - t.start));
          if (t.highlight && t.by && validPID(t.by.pid)) {
            let mark = document.createElement("mark");
            mark.style.background = color(t.by);
            mark.style.color = "inherit";
            mark.style.padding = "0";
            mark.style.borderRadius = "0";
            mark.title = label(t.by);
            mark.textContent = value;
            frag.append(mark);
          } else frag.append(document.createTextNode(value));
        });
      text.replaceWith(frag);
    });
    let authors = [
      ...new Map(
        list.filter((t) => t.highlight && t.by && validPID(t.by.pid)).map((t) => [label(t.by), t.by]),
      ).values(),
    ];
    if (authors.length) {
      let badges = document.createElement("span");
      badges.dataset.historyAttribution = "true";
      badges.style.cssText =
        "display:block;text-align:left;font:9px Arial;line-height:1.2;margin:1px 0 0;color:black";
      authors.forEach((m) => {
        let badge = document.createElement("span");
        let dt = new Date(m.date);
        badge.textContent =
          m.pid + " " + (isNaN(dt) ? m.date : dt.toLocaleDateString("en-GB")) + " · V" + m.version;
        badge.style.cssText =
          "display:inline-block;vertical-align:top;padding:0 6px;margin:0 3px 0 0;border:1px solid #777;background:" +
          color(m);
        badges.append(badge);
      });
      n.append(badges);
    }
    return n;
  }
  /* V20 view/controller: isolated DOM renderer; replay computed once per opening.
   Shadow DOM is style isolation, NOT a security boundary. All snapshot nodes
   are reconstructed by safeRoot before attachment. No iframe/srcdoc dependency. */
  let selected = -1,
    show = true,
    showDeleted = false,
    pidFilter = "",
    historyStates = [],
    shell = null;
  let rootView = null,
    origin = null,
    query = "",
    view = "document",
    zoom = 85,
    controller = null;
  const el = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  function notice(text) {
    shell.querySelector("[data-status]").textContent = text;
  }
  function changesFor(state) {
    return (
      selected < 0
        ? historyStates.flatMap((s) => s.changes.map((c) => ({ ...c, revision: s.meta })))
        : state.changes.map((c) => ({ ...c, revision: state.meta }))
    ).filter(
      (c) =>
        (!pidFilter || c.by?.pid === pidFilter) &&
        (!query ||
          [c.type, c.section, c.before, c.after, c.by?.pid]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())),
    );
  }
  function fit37() {
    if (!shell?.isConnected || zoom || view !== "document") return;
    const canvas = rootView?.querySelector(".h20-canvas");
    if (canvas) {
      const frame = shell.querySelector(".h20-view");
      canvas.style.zoom = Math.max(25, Math.min(100, Math.floor((frame.clientWidth - 12) / 8.25))) + "%";
    }
  }
  const compactHistory = matchMedia("(max-width: 820px)");
  function syncSidebar37() {
    const compact = compactHistory.matches,
      on = shell.dataset.sidebar === "true";
    const changes = compact ? shell.dataset.h59Surface === "changes" : on;
    shell.classList.toggle("h37-panel-open", changes);
    shell.querySelector("#h37-aside").hidden = !changes;
    shell.querySelector(".h20-view").hidden = compact && changes;
    const b = shell.querySelector("[data-sidebar]");
    b.hidden = compact;
    b.disabled = false;
    b.setAttribute("aria-expanded", String(changes));
    b.textContent = changes ? "Hide changes" : "Show changes";
    shell
      .querySelectorAll("[data-h59-go]")
      .forEach((x) =>
        x.setAttribute("aria-pressed", String(x.dataset.h59Go === (changes ? "changes" : "document"))),
      );
    if (!compact || !changes) fit37();
  }
  function jump59(block) {
    const target = rootView.querySelector('[data-h59-block="' + CSS.escape(block) + '"]');
    if (!target) return;
    shell.dataset.h59Surface = "document";
    syncSidebar37();
    rootView.querySelector("[data-h59-target]")?.removeAttribute("data-h59-target");
    target.setAttribute("data-h59-target", "");
    target.setAttribute("tabindex", "-1");
    requestAnimationFrame(() => {
      if (!target.isConnected || !shell) return;
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "center", inline: "nearest" });
    });
  }

  function draw() {
    if (!shell?.isConnected) return;
    try {
      const idx = selected < 0 ? data.revisions.length - 1 : selected,
        state = historyStates[idx];
      const revision = state?.revision || data.revisions[idx];
      if (!revision) throw Error("Selected revision is missing.");
      if (typeof revision.snapshot !== "string" || !revision.snapshot.trim())
        throw Error("This revision has no readable snapshot.");
      const old = selected >= 0 && selected < data.revisions.length - 1;
      shell.dataset.historical = String(old);
      shell.querySelector("[data-h72-latest]").hidden = !old;
      shell.querySelector("[data-watermark]").hidden = !old;
      const historyHost = shell.querySelector("[data-document-host]");
      historyHost.dataset.historical = String(old);
      historyHost.dataset.labels = String(shell.querySelector("[data-labels]").checked);
      shell.querySelector("[data-heading]").textContent =
        selected < 0
          ? "Latest saved content · cumulative attribution"
          : "Document V" + String(revision.version || "?");
      shell.querySelector("[data-warning]").textContent = old
        ? "HISTORICAL VERSION · NOT THE LATEST. For reference only."
        : "Read-only saved history. Unsaved editor changes are not included.";
      shell.querySelector("[data-reason]").textContent =
        selected < 0
          ? "Saved change history across all revisions."
          : "Reason for change: " + (revision.reason || "Not recorded");
      shell.querySelector("[data-prev]").disabled = idx <= 0;
      shell.querySelector("[data-next]").disabled = selected < 0 || idx >= data.revisions.length - 1;
      const list = shell.querySelector("[data-changes]");
      list.replaceChildren();
      const changes = state ? changesFor(state) : [];
      shell.querySelector("[data-count]").textContent = changes.length + " detected changes";
      for (const c of changes) {
        const card = el("li", undefined, "h20-card");
        card.style.borderLeftColor = color(c.by);
        card.append(el("strong", c.type + " · " + (c.section || "Document")), el("small", label(c.by)));
        if (c.before) card.append(el("div", "− " + c.before, "h20-before"));
        if (c.after) card.append(el("div", "+ " + c.after, "h20-after"));
        list.append(card);
      }
      if (!changes.length)
        list.append(
          el(
            "li",
            "No detected changes match these filters. The saved document remains visible.",
            "h20-empty",
          ),
        );
      const root = safeRoot(revision.snapshot);
      /* The logo is template chrome, not content: show the current logo in every revision. */
      const currentLogo = area.querySelector(".corporate-logo")?.getAttribute("src");
      if (currentLogo) root.querySelectorAll(".corporate-logo").forEach((i) => i.setAttribute("src", currentLogo));
      const previous = idx > 0 ? historyStates[idx - 1] : null;
      if (state && view === "document") {
        const previousBy = new Map((previous?.blocks || []).map((b) => [b.id, b]));
        const nodes = [];
        root.querySelectorAll(".pagecontent").forEach((c) =>
          c.querySelectorAll("h1,h2,h3,h4,p,li,td,th,figcaption,img").forEach((n) => {
            if (h75Meta(n)) return;
            if (n.tagName !== "IMG" && n.querySelector("h1,h2,h3,h4,p,li,td,th,figcaption")) return;
            nodes.push(n);
          }),
        );
        const used = new Set();
        nodes.forEach((n) => {
          const key = n.getAttribute("data-block-id"),
            uniqueKey =
              key &&
              nodes.filter((x) => x.getAttribute("data-block-id") === key).length === 1 &&
              state.blocks.filter((b) => b.key === key).length === 1;
          const index = uniqueKey
            ? state.blocks.findIndex((b, i) => !used.has(i) && b.key === key)
            : state.blocks.findIndex(
                (b, i) =>
                  !used.has(i) &&
                  b.tag === n.tagName &&
                  (b.image ? b.asset === hash(n.getAttribute("src") || "") : b.text === n.textContent),
              );
          if (index < 0) return;
          used.add(index);
          const b = state.blocks[index];
          if (!b.image && b.attribution.map((t) => t.text).join("") !== n.textContent) return;
          const filtered = {
            ...b,
            node: n,
            attribution: b.attribution.map((t) => ({
              ...t,
              by: pidFilter && t.by?.pid !== pidFilter ? null : t.by,
            })),
          };
          const marked = decorate(filtered, selected < 0 ? "all" : "diff", previousBy.get(b.id), true);
          marked.dataset.h59Block = b.id;
          n.replaceWith(marked);
        });
      }
      if (view === "document" && showDeleted) {
        const deleted = changes.filter(
          (c) => c.before && ["Deleted", "Image deleted", "Modified"].includes(c.type),
        );
        if (deleted.length) {
          const aside = el("aside", undefined, "h20-deleted");
          aside.append(el("h2", "Previous / deleted content · NOT current instructions"));
          for (const c of deleted) {
            const p = el("p");
            p.append(el("del", c.before), el("small", " · " + label(c.by)));
            aside.append(p);
          }
          root.append(aside);
        }
      }
      const plain = shell.querySelector("[data-plain]");
      const textRoot = safeRoot(revision.snapshot);
      textRoot.querySelectorAll("br").forEach((n) => n.replaceWith("\n"));
      textRoot
        .querySelectorAll("p,li,h1,h2,h3,h4,tr,figcaption,.pagehead,.pagefoot")
        .forEach((n) => n.append("\n"));
      textRoot.querySelectorAll("td,th").forEach((n) => n.append("  "));
      plain.textContent =
        textRoot.textContent.trim() || "This saved snapshot has no text. It may contain images only.";
      rootView.replaceChildren();
      const style = el("style");
      style.textContent = trustedStyles + "\n" + canvasCSS;
      const canvas = el("div", undefined, "h20-canvas");
      canvas.style.zoom =
        (zoom || Math.min(100, Math.floor((shell.querySelector(".h20-view").clientWidth - 12) / 8.25))) + "%";
      canvas.append(...root.childNodes);
      if (!canvas.querySelector(".sheet")) {
        const sheet = el("article", undefined, "sheet");
        sheet.append(...canvas.childNodes);
        canvas.append(sheet);
      }
      for (const sheet of canvas.querySelectorAll(".sheet")) {
        const watermark = el("div", "HISTORICAL VERSION · NOT THE LATEST", "h29-watermark");
        watermark.setAttribute("aria-hidden", "true");
        sheet.before(watermark);
      }
      style.textContent +=
        "\n:host { background: transparent !important; } .h20-canvas { background: transparent !important; }";
      style.textContent +=
        "\n[data-h59-target]{outline:3px solid #7452aa!important;outline-offset:3px;scroll-margin:20px;}";
      rootView.append(style, canvas);
      if (view === "document")
        for (const [i, c] of changes.entries()) {
          if (
            !c.block ||
            !c.after ||
            !rootView.querySelector('[data-h59-block="' + CSS.escape(c.block) + '"]')
          )
            continue;
          const button = el("button", "Go to block", "h59-jump");
          button.type = "button";
          button.addEventListener("click", () => jump59(c.block));
          list.children[i]?.append(button);
        }

      const count = canvas.querySelectorAll(".sheet").length;
      shell.querySelector("[data-document-host]").hidden = view !== "document";
      plain.hidden = view !== "text";
      shell
        .querySelectorAll("[data-view]")
        .forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
      shell.querySelector("[data-zoom]").disabled = view === "text";
      syncSidebar37();
      notice(
        (state ? "Ready" : "Attribution unavailable; raw snapshot displayed") +
          " · " +
          count +
          " page" +
          (count === 1 ? "" : "s") +
          " · " +
          data.revisions.length +
          " saved revisions",
      );
    } catch (error) {
      notice("History rendering failed: " + error.message + ". Use Text view or close and reopen.");
      const revision = data.revisions[selected < 0 ? data.revisions.length - 1 : selected];
      try {
        shell.querySelector("[data-plain]").textContent =
          safeRoot(revision?.snapshot || "").textContent || "No readable snapshot text.";
      } catch {
        shell.querySelector("[data-plain]").textContent = "Snapshot could not be read.";
      }
      shell.querySelector("[data-plain]").hidden = false;
      shell.querySelector("[data-document-host]").hidden = true;
    }
  }
  const canvasCSS = `
:host([data-historical="true"]){background:#762d3d!important}
:host([data-historical="true"]) .h20-canvas{background:#762d3d!important}
.h29-watermark{display:none!important}
:host([data-historical="true"]) .h29-watermark{display:block!important;text-align:center;color:#f4c2cc;opacity:.72;font:bold clamp(20px,4vw,48px)/1.2 Arial;letter-spacing:4px;padding:24px 8px 32px;pointer-events:none;user-select:none;overflow-wrap:anywhere}
:host([data-labels="false"]) [data-history-attribution]{display:none!important}
:host{display:block;color:#193047;font:13px/1.6 Arial;background:transparent}.h20-canvas{padding:24px;min-height:200px;box-sizing:border-box}.sheet{height:auto!important;min-height:0!important;max-width:100%!important;width:210mm;margin:0 auto 24px!important;background:white!important;box-shadow:0 6px 24px #172b4020!important}.pagefoot{display:none!important}.pagecontent{min-height:0!important}.sheet img{max-width:100%;height:auto}.h20-deleted{border:2px dashed #aa435b;background:#fff0f3;padding:20px;margin:20px}mark{padding:0;box-decoration-break:clone}a{pointer-events:none}@media(max-width:700px){.h20-canvas{padding:12px}.sheet{padding:18px!important;width:100%!important}.qc-hero{margin:0!important;padding:18px!important;display:block!important}.qc-hero h1{font-size:28px!important}}@media screen{.sheet{box-shadow:var(--sophia-history-light-paper,0 6px 24px #172b4020)!important}}`;
  let trustedStyles = "";
  function closeHistory() {
    if (!shell) return;
    controller?.abort();
    const d = shell;
    shell = null;
    if (d.open) d.close();
    d.remove();
    historyStates = [];
    rootView = null;
    if (origin?.isConnected && origin.getClientRects().length) origin.focus({ preventScroll: true });
    else document.querySelector('[data-cmd="history"]')?.focus({ preventScroll: true });
  }
  window.openHistoryStudio = function (initial = -1) {
    if (shell?.isConnected) return;
    if (document.querySelector("dialog[open],#archiveView")) {
      toast("Finish or cancel the current dialog before opening history.");
      return;
    }
    if (!Array.isArray(data.revisions) || !data.revisions.length) {
      toast("No saved revisions are available.");
      return;
    }
    origin = document.activeElement;
    controller = new AbortController();
    selected = Number.isInteger(initial) && initial >= 0 && initial < data.revisions.length ? initial : -1;
    show = true;
    showDeleted = false;
    pidFilter = "";
    query = "";
    view = "document";
    zoom = 0;
    shell = el("dialog");
    shell.id = "historyStudio";
    shell.className = "history-v20 history-v37 history-v38 history-v41 history-v59 history-v71";
    shell.dataset.sidebar = "true";
    shell.setAttribute("aria-label", "History Studio");
    shell.innerHTML =
      '<header aria-label="History controls"><div class="h41-rev"><div class="h37-island h37-ident"><span class="h37-kicker">HISTORY VIEW</span><h2 data-heading>Loading saved history...</h2></div><div class="h37-island h38-revision" role="group" aria-label="Saved revision"><button type="button" data-prev aria-label="Previous revision" title="Previous revision">‹</button><select data-version aria-label="Saved revision"><option value="-1">Latest · all history</option></select><button type="button" data-next aria-label="Next revision" title="Next revision">›</button></div></div><div class="h37-island h38-modes h41-modes" role="group" aria-label="Display mode"><button type="button" data-view="document" aria-pressed="true">Changes view</button><button type="button" data-view="text" aria-pressed="false">Clean text</button></div><div class="h37-island h38-tools h41-tools" role="group" aria-label="View tools"><button type="button" data-sidebar aria-controls="h37-aside" aria-expanded="false">Sidebar</button><select data-zoom aria-label="Document zoom" title="Document zoom"><option value="0" selected>Fit</option><option value="65">65%</option><option value="85">85%</option><option value="100">100%</option><option value="125">125%</option></select><button type="button" data-print42>Print revision</button><button type="button" data-close>Close history</button></div></header><div class="h20-notice" data-warning role="status"></div><div class="h20-body"><aside id="h37-aside" aria-label="Change details" hidden><div class="h20-aside-head"><div class="h41-aside-title"><h3 data-count>Changes</h3><button type="button" data-close-sidebar41 aria-label="Close changes sidebar" title="Close changes sidebar">×</button></div><div class="h37-options"><label>Find a change<input type="search" data-query placeholder="Text, section or PID"></label><label>Recorded author<select data-pid><option value="">All authors</option></select></label><label class="h20-check"><input type="checkbox" data-deleted>Include previous / deleted text</label></div><label class="h20-check"><input type="checkbox" data-labels checked>Show PID labels</label><p data-reason></p></div><ul data-changes></ul></aside><section class="h20-view" aria-label="Saved snapshot"><div class="h20-document-scroll" tabindex="0" aria-label="Scroll saved snapshot"><div data-document-host></div><div data-plain hidden></div></div><div class="h37-watermark" data-watermark aria-hidden="true" hidden><span>HISTORICAL VERSION</span></div></section></div><div data-status role="status"></div>';
    data.revisions.forEach((r, i) => {
      const o = el(
        "option",
        "V" +
          (r?.version || "?") +
          " · " +
          (r?.editorPID || r?.author || "Unknown") +
          " · " +
          (r?.date || ""),
      );
      o.value = i;
      shell.querySelector("[data-version]").append(o);
    });
    const authors = [...new Set(data.revisions.map((r, i) => meta(r || {}, i).pid))];
    for (const pid of authors) {
      const o = el("option", pid);
      o.value = pid;
      shell.querySelector("[data-pid]").append(o);
    }
    trustedStyles = [
      ...document.querySelectorAll(
        'style[data-sophia="fonts"],style[data-sophia="paper"]',
      ),
    ]
      .map((n) => n.textContent)
      .join("\n");
    rootView = shell.querySelector("[data-document-host]").attachShadow({ mode: "open" });
    const listen = (target, type, fn) => target.addEventListener(type, fn, { signal: controller.signal });
    shell.dataset.h59Surface = "document";
    const switcher = el("div", undefined, "h59-switch");
    switcher.setAttribute("role", "group");
    switcher.setAttribute("aria-label", "History workspace");
    for (const [name, label] of [
      ["document", "Document"],
      ["changes", "Changes"],
    ]) {
      const b = el("button", label);
      b.type = "button";
      b.dataset.h59Go = name;
      b.setAttribute("aria-controls", name === "changes" ? "h37-aside" : "h59-document");
      switcher.append(b);
      listen(b, "click", () => {
        shell.dataset.h59Surface = name;
        syncSidebar37();
      });
    }
    shell.querySelector(".h20-view").id = "h59-document";
    shell.querySelector("[data-sidebar]").before(switcher);
    listen(compactHistory, "change", syncSidebar37);
    const h72head = shell.querySelector("header");
    h72head.append(shell.querySelector("[data-close]"));
    const h72context = el("div", undefined, "h72-context");
    const h72warn = shell.querySelector("[data-warning]");
    h72warn.before(h72context);
    h72context.append(h72warn);
    const latestButton = el("button", "Go to latest");
    latestButton.type = "button";
    latestButton.dataset.h72Latest = "";
    latestButton.hidden = true;
    h72context.append(latestButton);
    listen(latestButton, "click", () => {
      selected = -1;
      shell.querySelector("[data-version]").value = "-1";
      draw();
      shell.querySelector("[data-version]").focus({ preventScroll: true });
    });

    listen(shell, "keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeHistory();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    listen(shell.querySelector("[data-close]"), "click", closeHistory);
    listen(shell, "cancel", (e) => {
      e.preventDefault();
      closeHistory();
    });
    listen(shell, "close", closeHistory);
    listen(shell.querySelector("[data-version]"), "change", (e) => {
      selected = Number(e.target.value);
      draw();
    });
    listen(shell.querySelector("[data-pid]"), "change", (e) => {
      pidFilter = e.target.value;
      draw();
    });
    listen(window, "resize", () => fit37());
    const observer37 = new ResizeObserver(fit37);
    observer37.observe(shell.querySelector(".h20-view"));
    controller.signal.addEventListener("abort", () => observer37.disconnect(), { once: true });
    listen(shell.querySelector("[data-labels]"), "change", () => draw());
    listen(shell.querySelector("[data-deleted]"), "change", (e) => {
      showDeleted = e.target.checked;
      draw();
    });
    listen(shell.querySelector("[data-zoom]"), "change", (e) => {
      zoom = Number(e.target.value);
      draw();
    });
    listen(shell.querySelector("[data-query]"), "input", (e) => {
      query = e.target.value;
      draw();
    });
    for (const b of shell.querySelectorAll("[data-view]"))
      listen(b, "click", () => {
        view = b.dataset.view;
        draw();
      });
    listen(shell.querySelector("[data-sidebar]"), "click", () => {
      shell.dataset.sidebar = String(shell.dataset.sidebar !== "true");
      syncSidebar37();
    });
    listen(shell.querySelector("[data-print42]"), "click", () => {
      const i = selected < 0 ? data.revisions.length - 1 : selected,
        r = data.revisions[i];
      if (!r?.snapshot) return;
      PrintStudio42.open(safeRoot(r.snapshot), {
        old: i < data.revisions.length - 1,
        label: "Saved revision V" + String(r.version || "?"),
      });
    });
    listen(shell.querySelector("[data-close-sidebar41]"), "click", () => {
      shell.dataset.sidebar = "false";
      shell.dataset.h59Surface = "document";
      syncSidebar37();
      shell
        .querySelector(compactHistory.matches ? "[data-h59-go=document]" : "[data-sidebar]")
        .focus({ preventScroll: true });
    });
    function step(direction) {
      const idx = selected < 0 ? data.revisions.length - 1 : selected;
      selected = Math.max(0, Math.min(data.revisions.length - 1, idx + direction));
      shell.querySelector("[data-version]").value = selected;
      draw();
    }
    listen(shell.querySelector("[data-prev]"), "click", () => step(-1));
    listen(shell.querySelector("[data-next]"), "click", () => step(1));
    shell.querySelector("[data-version]").value = String(selected);
    document.body.append(shell);
    shell.showModal();
    shell.querySelector("[data-close]").focus();
    try {
      historyStates = replay();
    } catch (error) {
      historyStates = [];
      notice("Attribution replay failed: " + error.message + ". Showing raw saved snapshot.");
    }
    draw();
  };
  window.historyCompare = (oldHTML, newHTML, pid = "COMPARE") =>
    transition(
      blocks(oldHTML).map((b, i) => ({
        ...b,
        id: "test-" + i,
        attribution: tokens(b.text).map((t) => ({
          text: t,
          by: { pid: "Attribution unavailable", version: "old", date: "" },
        })),
      })),
      blocks(newHTML),
      { pid, version: "test", date: "test", index: 1 },
    );
  window.historyReplay = () => replay();
})();
