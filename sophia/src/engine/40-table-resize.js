/* ============================================================================
 * SOPHIA · 40-table-resize
 * Column resize handles for simple body tables.
 * Reused from V76 (p425-table-resize); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
(() => {
  "use strict";
  const root = document.getElementById("document");
  if (!root) return;
  document.getElementById("v425-table-ui")?.remove();
  const surface = document.createElement("div");
  surface.id = "v425-table-ui";
  surface.dataset.runtime = "";
  surface.hidden = true;
  document.body.append(surface);
  const canEdit = () =>
    !!window.EditorSession?.get().pid &&
    !document.body.classList.contains("focusmode") &&
    !document.querySelector("dialog[open],.modalveil,#historyStudio,#archiveView");
  let current = null,
    drag = null,
    raf = 0;
  const valid = (t) =>
    t?.isConnected &&
    root.contains(t) &&
    t.matches(".pagecontent table:not(.identity)") &&
    !t.closest(".identity,[data-trace],.pagehead") &&
    !t.parentElement.closest("table") &&
    !t.querySelector("table") &&
    t.rows.length &&
    t.rows[0].cells.length > 1 &&
    [...t.rows].every(
      (r) =>
        r.cells.length === t.rows[0].cells.length &&
        [...r.cells].every((c) => c.rowSpan === 1 && c.colSpan === 1),
    ) &&
    [...t.children].filter((c) => c.tagName === "COLGROUP").every((c) => c.hasAttribute("data-v425-cols"));
  function info() {
    const cells = [...current.rows[0].cells],
      boxes = cells.map((c) => c.getBoundingClientRect()),
      sum = boxes.reduce((a, b) => a + b.width, 0);
    return { boxes, sum, weights: boxes.map((b) => (100 * b.width) / sum) };
  }
  function adjusted(w, i, delta) {
    const out = w.slice(),
      total = w[i] + w[i + 1],
      min = Math.min(5, total / 3);
    out[i] = Math.max(min, Math.min(total - min, out[i] + delta));
    out[i + 1] = total - out[i];
    return out;
  }
  function commit(t, w) {
    if (!canEdit() || !valid(t)) return;
    EditorTransactions.run("Resize table columns", () => {
      const g = t.ownerDocument.createElement("colgroup");
      g.dataset.v425Cols = "";
      w.forEach((v) => {
        const col = t.ownerDocument.createElement("col");
        col.style.width = v.toFixed(5) + "%";
        g.append(col);
      });
      t.querySelector(":scope > colgroup[data-v425-cols]")?.remove();
      const before = [...t.children].find((n) => n.tagName !== "CAPTION");
      t.insertBefore(g, before || null);
      return true;
    });
    schedule();
  }
  function stop(save) {
    if (!drag) return;
    const d = drag;
    drag = null;
    d.guide.remove();
    if (save && Math.abs(d.delta) > 0.15) commit(d.table, adjusted(d.weights, d.i, d.delta));
    schedule();
  }
  function draw() {
    raf = 0;
    if (drag) return;
    if (!canEdit() || !valid(current)) {
      surface.hidden = true;
      return;
    }
    const { boxes, weights } = info(),
      b = current.getBoundingClientRect();
    const chrome = document.elementFromPoint(
      Math.max(1, Math.min(innerWidth - 1, b.left + b.width / 2)),
      Math.max(1, Math.min(innerHeight - 1, b.top + 4)),
    );
    if (
      !b.width ||
      b.top < 0 ||
      b.top > innerHeight - 24 ||
      (chrome && !root.contains(chrome) && !surface.contains(chrome))
    ) {
      surface.hidden = true;
      return;
    }
    surface.hidden = false;
    if (surface.children.length !== boxes.length - 1 || surface.firstChild?.table !== current) {
      surface.replaceChildren();
      for (let i = 0; i < boxes.length - 1; i++) {
        const h = document.createElement("button");
        h.type = "button";
        h.table = current;
        h.setAttribute("role", "separator");
        h.setAttribute("aria-orientation", "vertical");
        h.setAttribute("aria-valuemin", "0");
        h.setAttribute("aria-valuemax", "100");
        h.setAttribute("aria-label", "Resize columns " + (i + 1) + " and " + (i + 2));
        h.title = "Drag to resize. Arrow keys adjust; Home distributes widths evenly.";
        h.textContent = "↔";
        h.onpointerdown = (e) => {
          if (!e.isPrimary || e.button !== 0 || !canEdit() || !valid(h.table)) return;
          e.preventDefault();
          const { boxes, sum, weights } = info(),
            g = document.createElement("i");
          g.className = "v425-guide";
          g.style.top = b.top + "px";
          g.style.height = Math.min(b.height, innerHeight - b.top) + "px";
          g.style.left = boxes[i].right + "px";
          surface.append(g);
          drag = {
            table: h.table,
            i,
            id: e.pointerId,
            x: e.clientX,
            edge: boxes[i].right,
            delta: 0,
            sum,
            weights,
            guide: g,
          };
          h.setPointerCapture(e.pointerId);
        };
        h.onpointermove = (e) => {
          const d = drag;
          if (!d || d.id !== e.pointerId) return;
          const w = adjusted(d.weights, d.i, (100 * (e.clientX - d.x)) / d.sum);
          d.delta = w[d.i] - d.weights[d.i];
          d.guide.style.left = d.edge + (d.delta * d.sum) / 100 + "px";
        };
        h.onpointerup = (e) => {
          if (drag?.id === e.pointerId) stop(true);
        };
        h.onpointercancel = h.onlostpointercapture = (e) => {
          if (drag?.id === e.pointerId) stop(false);
        };
        h.onkeydown = (e) => {
          if (!["ArrowLeft", "ArrowRight", "Home"].includes(e.key) || !canEdit() || !valid(h.table)) return;
          e.preventDefault();
          e.stopPropagation();
          const w = info().weights;
          commit(
            h.table,
            e.key === "Home"
              ? w.map(() => 100 / w.length)
              : adjusted(w, i, (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 5 : 1)),
          );
        };
        surface.append(h);
      }
    }
    [...surface.children].forEach((h, i) => {
      h.style.left = boxes[i].right + "px";
      h.style.top = Math.round(b.top + 2) + "px";
      h.hidden = boxes[i].right < 8 || boxes[i].right > innerWidth - 8;
      h.setAttribute("aria-valuenow", String(Math.round(weights[i])));
    });
  }
  function schedule() {
    if (!raf) raf = requestAnimationFrame(draw);
  }
  document.addEventListener(
    "pointerdown",
    (e) => {
      if (surface.contains(e.target)) return;
      current = e.target.closest?.(".pagecontent table") || null;
      schedule();
    },
    true,
  );
  document.addEventListener("selectionchange", () => {
    if (surface.contains(document.activeElement) || drag) return;
    const n = getSelection()?.anchorNode;
    const t = (n?.nodeType === 1 ? n : n?.parentElement)?.closest(".pagecontent table");
    if (t && root.contains(t)) current = t;
    schedule();
  });
  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && drag) {
        e.preventDefault();
        stop(false);
      }
    },
    true,
  );
  window.addEventListener("resize", schedule);
  window.addEventListener("scroll", schedule, true);
  window.addEventListener("blur", () => stop(false));
  new MutationObserver(schedule).observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "contenteditable"],
  });
  window.EditorSession?.subscribe(schedule);
})();
document.addEventListener(
  "click",
  (e) => {
    const b = e.target.closest?.('button[onclick="window.print()"]');
    if (b) {
      e.preventDefault();
      e.stopImmediatePropagation();
      PrintStudio42.open();
    }
  },
  true,
);
