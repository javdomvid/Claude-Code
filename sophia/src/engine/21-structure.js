/* ============================================================================
 * SOPHIA · 21-structure
 * Structure inspector: block inventory, identity status and comparison with the last saved revision. IDs are maintained automatically by 20-ids.
 * Reused from V76 (block-identity-v25); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V25 identity service: explicit, undoable metadata migration. Never mutates on
   opening, typing, undo, replay or export. New/copied blocks require refresh.
   All occurrences of a duplicated key are rekeyed: no guessed original. */
window.BlockIdentity = (() => {
  "use strict";
  const attr = "data-block-id",
    pattern = SOPHIA.ids.VALID;
  const selector = "h1,h2,h3,h4,p,li,td,th,figcaption,img,table,figure,blockquote";
  let active = null;
  function nodes(root = area) {
    return [...root.querySelectorAll(".pagecontent")].flatMap((c) => [...c.querySelectorAll(selector)]);
  }
  function inspect(root = area) {
    const all = nodes(root),
      counts = new Map();
    for (const n of all) {
      const id = n.getAttribute(attr);
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    }
    return all.map((node, index) => {
      const id = node.getAttribute(attr) || "";
      return {
        node,
        index,
        id,
        status: !id ? "Missing" : !pattern.test(id) ? "Invalid" : counts.get(id) > 1 ? "Duplicate" : "Ready",
      };
    });
  }
  function uuid(used) {
    let id;
    do {
      const bytes = crypto.getRandomValues(new Uint8Array(16));
      id = SOPHIA.ids.newId(new Set(used)); void bytes;
    } while (used.has(id));
    used.add(id);
    return id;
  }
  function plan() {
    const entries = inspect(),
      used = new Set(entries.map((e) => e.id));
    return {
      baseline: cleanContent(),
      pid: EditorSession.get().pid,
      entries,
      changes: entries.filter((e) => e.status !== "Ready").map((e) => ({ ...e, next: uuid(used) })),
    };
  }
  function apply(p) {
    if (
      !p?.pid ||
      EditorSession.get().pid !== p.pid ||
      cleanContent() !== p.baseline ||
      p.entries.some(
        (e) => !e.node.isConnected || !area.contains(e.node) || e.node.getAttribute(attr) !== (e.id || null),
      )
    )
      return false;
    if (!p.changes.length) return true;
    return EditorTransactions.run("Assign / repair stable block identities", () => {
      for (const e of p.changes) e.node.setAttribute(attr, e.next);
    });
  }
  function compare() {
    const last = data.revisions.at(-1);
    if (!last?.snapshot) return { note: "No saved snapshot available.", rows: [] };
    const doc = new DOMParser().parseFromString(last.snapshot, "text/html"),
      old = inspect(doc),
      current = inspect(),
      a = new Map(old.filter((e) => e.status === "Ready").map((e) => [e.id, e])),
      b = new Map(current.filter((e) => e.status === "Ready").map((e) => [e.id, e]));
    const rows = [],
      leaf = (e) =>
        !e.node.matches("table,figure,blockquote") &&
        !e.node.querySelector("h1,h2,h3,h4,p,li,td,th,figcaption");
    const shared = current.filter((e) => leaf(e) && e.status === "Ready" && a.has(e.id) && leaf(a.get(e.id))),
      oldOrder = old
        .filter((e) => leaf(e) && e.status === "Ready" && b.has(e.id) && leaf(b.get(e.id)))
        .map((e) => e.id),
      positions = new Map(oldOrder.map((id, i) => [id, i]));
    const sequence = shared.map((e) => positions.get(e.id));
    let max = -1;
    const prefix = sequence.map((x) => {
      const p = max;
      max = Math.max(max, x);
      return p;
    });
    let min = Infinity;
    const suffix = sequence.map(() => 0);
    for (let i = sequence.length - 1; i >= 0; i--) {
      suffix[i] = min;
      min = Math.min(min, sequence[i]);
    }
    shared.forEach((e, i) => {
      const prev = a.get(e.id),
        text =
          e.node.tagName === "IMG"
            ? (e.node.getAttribute("src") || "") + "|" + e.node.alt
            : e.node.textContent,
        oldText =
          prev.node.tagName === "IMG"
            ? (prev.node.getAttribute("src") || "") + "|" + prev.node.alt
            : prev.node.textContent;
      const kinds = [];
      if (text !== oldText || e.node.tagName !== prev.node.tagName) kinds.push("Modified");
      if (sequence[i] < prefix[i] || sequence[i] > suffix[i]) kinds.push("Reordered");
      if (kinds.length)
        rows.push({
          kind: kinds.join(" + "),
          id: e.id,
          text: e.node.tagName === "IMG" ? "Image" : e.node.textContent.slice(0, 200),
          node: e.node,
        });
    });
    for (const e of current)
      if (leaf(e) && e.status === "Ready" && !a.has(e.id))
        rows.push({
          kind: "Newly identified / added",
          id: e.id,
          text: e.node.tagName === "IMG" ? "Image" : e.node.textContent.slice(0, 200),
          node: e.node,
        });
    for (const e of old)
      if (leaf(e) && e.status === "Ready" && !b.has(e.id))
        rows.push({
          kind: "Identity absent in current content",
          id: e.id,
          text: e.node.tagName === "IMG" ? "Image" : e.node.textContent.slice(0, 200),
          node: null,
        });
    return {
      note:
        "Comparison against latest saved snapshot. " +
        shared.length +
        " uniquely identified leaf block(s) matched. " +
        current.filter((e) => e.status !== "Ready").length +
        " current block(s) need identity review. Legacy/unidentified blocks are not guessed; newly assigned IDs do not prove content was added. Formatting-only changes are not listed here.",
      rows,
    };
  }
  const el = (tag, text) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  };
  function open() {
    if (active?.isConnected) {
      active.querySelector("input").focus();
      return;
    }
    if (document.querySelector("dialog[open],.modalveil")) {
      toast("Finish the current dialog first.");
      return;
    }
    const origin = document.activeElement,
      d = el("dialog");
    active = d;
    d.className = "structure-v25";
    d.setAttribute("aria-label", "Document structure");
    d.innerHTML =
      '<header><small>REVIEW · DOCUMENT STRUCTURE</small><h2>Stable block identities</h2><p>Inspect structure and prepare a controlled identity migration. Saved historical snapshots are never rewritten.</p></header><nav><button type="button" data-inventory>Block inventory</button><button type="button" data-compare>Compare with saved</button><button type="button" data-refresh>Refresh inspection</button></nav><section><p data-summary role="status" aria-live="polite"></p><p data-error role="alert"></p><div data-filters><label>Search text, tag or ID<input type="search" data-search></label><label>Identity status<select data-filter><option value="">All</option><option>Ready</option><option>Missing</option><option>Duplicate</option><option>Invalid</option></select></label></div><div data-list></div><div data-pages><button type="button" data-prev>Previous</button><span data-page></span><button type="button" data-next>Next</button></div><div data-preview hidden></div></section><footer><button type="button" data-close>Close</button><div><button type="button" data-back hidden>Back</button><button type="button" data-plan>Preview identity migration</button><button type="button" data-apply hidden>Apply identity migration</button></div></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    let inventory = inspect(),
      page = 0,
      pending = null,
      mode = "inventory",
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
    function locate(node) {
      if (!node?.isConnected) {
        q("error").textContent = "Block no longer exists. Refresh inspection.";
        return;
      }
      close();
      node.scrollIntoView({ block: "center", behavior: "instant" });
      toast("Block located.");
    }
    function render() {
      q("list").replaceChildren();
      q("filters").hidden = mode !== "inventory";
      q("pages").hidden = mode !== "inventory";
      q("plan").hidden = mode !== "inventory";
      q("plan").disabled = !EditorSession.get().pid || !inventory.some((e) => e.status !== "Ready");
      if (mode === "compare") {
        const report = compare();
        q("summary").textContent = report.note;
        for (const r of report.rows) {
          const card = el("article");
          card.append(el("strong", r.kind), el("code", r.id), el("p", r.text));
          if (r.node) {
            const go = el("button", "Locate block");
            go.type = "button";
            go.onclick = () => locate(r.node);
            card.append(go);
          }
          q("list").append(card);
        }
        if (!report.rows.length)
          q("list").append(
            el("p", "No identity-based differences found. This is not a full content comparison."),
          );
        return;
      }
      const ready = inventory.filter((e) => e.status === "Ready").length;
      q("summary").textContent =
        inventory.length +
        " structural block(s) · " +
        ready +
        " ready · " +
        (inventory.length - ready) +
        " requiring identity assignment or repair. Opening this view changes nothing.";
      const term = q("search").value.toLowerCase(),
        status = q("filter").value,
        shown = inventory.filter(
          (e) =>
            (!status || e.status === status) &&
            (!term ||
              [e.id, e.node.tagName, e.node.textContent, e.node.getAttribute("alt") || ""]
                .join(" ")
                .toLowerCase()
                .includes(term)),
        );
      const pages = Math.max(1, Math.ceil(shown.length / 60));
      page = Math.min(page, pages - 1);
      q("page").textContent = page + 1 + " / " + pages;
      q("prev").disabled = page === 0;
      q("next").disabled = page >= pages - 1;
      for (const e of shown.slice(page * 60, page * 60 + 60)) {
        const card = el("article");
        card.append(
          el("strong", e.node.tagName.toLowerCase() + " · " + e.status),
          el("code", e.id || "No stable identity"),
          el(
            "p",
            e.node.tagName === "IMG"
              ? e.node.alt || "Image without alternative text"
              : e.node.textContent.trim().slice(0, 200),
          ),
        );
        const go = el("button", "Locate block");
        go.type = "button";
        go.onclick = () => locate(e.node);
        card.append(go);
        q("list").append(card);
      }
      if (!shown.length) q("list").append(el("p", "No blocks match this filter."));
    }
    function reset() {
      pending = null;
      q("preview").hidden = true;
      q("list").hidden = false;
      q("back").hidden = true;
      q("apply").hidden = true;
      d.querySelector("nav").hidden = false;
      inventory = inspect();
      q("error").textContent = "";
      render();
    }
    q("plan").onclick = () => {
      if (!EditorSession.get().pid) return;
      pending = plan();
      q("preview").replaceChildren(
        el("h3", "Migration preview"),
        el(
          "p",
          pending.changes.length +
            " block(s) will receive new IDs. Text, images, order and formatting are not changed. All occurrences of duplicate IDs receive new identities; no original is guessed. This can be undone in one step. Export a new HTML revision to retain it. New/copied blocks later require another explicit inspection.",
        ),
      );
      for (const e of pending.changes.slice(0, 100)) {
        const p = el("p", e.node.tagName.toLowerCase() + " · " + e.status + " → " + e.next);
        q("preview").append(p);
      }
      if (pending.changes.length > 100)
        q("preview").append(
          el("p", "First 100 shown. All " + pending.changes.length + " planned changes will apply."),
        );
      q("preview").hidden = false;
      q("list").hidden = true;
      q("filters").hidden = true;
      q("pages").hidden = true;
      q("plan").hidden = true;
      q("back").hidden = false;
      q("apply").hidden = false;
      q("apply").disabled = false;
      d.querySelector("nav").hidden = true;
    };
    q("apply").onclick = () => {
      if (!pending || !apply(pending)) {
        q("error").textContent =
          "Document or session changed, or migration failed. Nothing further will be applied. Go back and preview again.";
        q("apply").disabled = true;
        return;
      }
      reset();
      toast("Stable identities updated. Undo is available; export HTML to retain them.");
    };
    q("back").onclick = reset;
    q("refresh").onclick = reset;
    q("inventory").onclick = () => {
      mode = "inventory";
      reset();
    };
    q("compare").onclick = () => {
      mode = "compare";
      reset();
    };
    q("search").oninput = () => {
      page = 0;
      render();
    };
    q("filter").onchange = () => {
      page = 0;
      render();
    };
    q("prev").onclick = () => {
      page--;
      render();
    };
    q("next").onclick = () => {
      page++;
      render();
    };
    q("close").onclick = close;
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
        return;
      }
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    const unsubscribe = EditorSession.subscribe(() => {
      q("plan").disabled = !EditorSession.get().pid || !inventory.some((e) => e.status !== "Ready");
      if (pending && EditorSession.get().pid !== pending.pid) q("apply").disabled = true;
    });
    document.body.append(d);
    d.showModal();
    render();
    q("search").focus();
  }
  return Object.freeze({
    open,
    inspect: () =>
      inspect().map((e) => ({ id: e.id, tag: e.node.tagName, status: e.status, index: e.index })),
    compare: () => {
      const r = compare();
      return { note: r.note, rows: r.rows.map(({ kind, id, text }) => ({ kind, id, text })) };
    },
  });
})();
