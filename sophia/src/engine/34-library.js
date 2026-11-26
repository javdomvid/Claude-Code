/* ============================================================================
 * SOPHIA · 34-library
 * Image library: alternative text and captions in reviewed batches.
 * Reused from V76 (image-library-v23); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* V23: isolated draft model for image metadata. No document mutation until
   reviewed apply; one transaction per batch. Existing rich captions are read-only. */
window.ImageLibrary = (() => {
  "use strict";
  let active = null;
  const make = (tag, text, cls) => {
    const n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    if (cls) n.className = cls;
    return n;
  };
  function open() {
    if (active?.isConnected) {
      active.querySelector("[data-search]").focus();
      return;
    }
    if (document.querySelector("dialog[open],#archiveView")) {
      toast("Finish the current dialog first.");
      return;
    }
    const origin = document.activeElement,
      session = EditorSession.get(),
      pid = session.pid,
      editable = !!pid,
      baseline = cleanContent();
    const sheets = [...area.querySelectorAll(".sheet")];
    const entries = [...area.querySelectorAll(".pagecontent img")].map((im, i) => {
      const figure = im.closest("figure"),
        caps = figure ? [...figure.children].filter((n) => n.tagName === "FIGCAPTION") : [],
        cap = caps[0] || null;
      const captionEditable =
        !!figure &&
        figure.querySelectorAll("img").length === 1 &&
        caps.length <= 1 &&
        (!cap || cap.children.length === 0);
      return {
        im,
        index: i,
        page: sheets.indexOf(im.closest(".sheet")) + 1,
        src: im.getAttribute("src") || "",
        alt: im.getAttribute("alt") || "",
        caption: cap?.textContent || "",
        figure,
        cap,
        captionEditable,
        draftAlt: im.getAttribute("alt") || "",
        draftCaption: cap?.textContent || "",
      };
    });
    const d = make("dialog");
    active = d;
    d.className = "image-library-v23";
    d.setAttribute("aria-label", "Image library");
    d.innerHTML =
      '<header><div><small>ASSETS · IMAGE LIBRARY</small><h2>Image library</h2><p>Browse body images. Edit alternative text and simple figure captions together, then review before applying.</p></div><span data-mode></span></header><nav><label>Search metadata<input type="search" data-search placeholder="Alternative text, caption or image number"></label><label>Filter<select data-filter><option value="all">All images</option><option value="missing">Missing alternative text</option><option value="pending">Pending edits</option><option value="external">Not embedded</option></select></label><button type="button" data-prev>Previous</button><span data-page></span><button type="button" data-next>Next</button></nav><section><p data-status role="status" aria-live="polite"></p><p data-error role="alert"></p><div data-grid class="il23-grid"></div><div data-review hidden></div></section><footer><div><button type="button" data-close>Close</button><button type="button" data-discard hidden>Discard edits and close</button></div><div><button type="button" data-back hidden>Back to editing</button><button type="button" data-review-button>Review batch</button><button type="button" data-apply hidden>Apply reviewed batch</button></div></footer>';
    const q = (x) => d.querySelector("[data-" + x + "]");
    q("mode").textContent = editable
      ? "Editing session · " + pid
      : "Read only · start editing to change metadata";
    let page = 0,
      reviewing = false,
      reviewSignature = "",
      closed = false,
      sessionInvalid = false;
    const changed = (e) => e.draftAlt !== e.alt || (e.captionEditable && e.draftCaption !== e.caption);
    const changes = () => entries.filter(changed);
    const signature = () => JSON.stringify(changes().map((e) => [e.index, e.draftAlt, e.draftCaption]));
    function valid() {
      return (
        !sessionInvalid &&
        EditorSession.get().pid === pid &&
        cleanContent() === baseline &&
        entries.every(
          (e) =>
            e.im.isConnected &&
            area.contains(e.im) &&
            e.im.getAttribute("src") === e.src &&
            e.im.closest("figure") === e.figure,
        )
      );
    }
    function close(force = false) {
      if (closed) return;
      if (changes().length && !force) {
        q("error").textContent =
          "You have unapplied edits. Return to editing, apply the batch, or explicitly discard edits below.";
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
    function counts() {
      q("status").textContent =
        entries.length +
        " body image(s) · " +
        changes().length +
        " image(s) with pending metadata edits. " +
        (editable
          ? "Nothing is saved until you apply and export the HTML."
          : "Browsing does not change the document.");
      q("review-button").disabled = !editable || !changes().length || sessionInvalid;
    }
    function filter() {
      const term = q("search").value.toLowerCase(),
        f = q("filter").value;
      return entries.filter(
        (e) =>
          (!term || [e.index + 1, e.draftAlt, e.draftCaption].join(" ").toLowerCase().includes(term)) &&
          (f === "all" ||
            (f === "missing" && !e.draftAlt.trim()) ||
            (f === "pending" && changed(e)) ||
            (f === "external" && !e.src.startsWith("data:"))),
      );
    }
    function render() {
      const shown = filter(),
        pages = Math.max(1, Math.ceil(shown.length / 24));
      page = Math.min(page, pages - 1);
      q("page").textContent = page + 1 + " / " + pages;
      q("prev").disabled = page === 0;
      q("next").disabled = page >= pages - 1;
      q("grid").replaceChildren();
      for (const e of shown.slice(page * 24, page * 24 + 24)) {
        const card = make("article");
        card.dataset.imageIndex = String(e.index);
        const thumb = make("div", undefined, "il23-thumb");
        if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(e.src)) {
          const im = make("img");
          im.src = e.src;
          im.alt = e.alt || "Body image " + (e.index + 1);
          im.loading = "lazy";
          im.decoding = "async";
          thumb.append(im);
        } else thumb.append(make("p", "Preview not loaded: external or unsupported source."));
        card.append(
          thumb,
          make("h3", "Image " + (e.index + 1) + " · Page " + e.page),
          make(
            "small",
            (e.im.naturalWidth || "?") +
              " × " +
              (e.im.naturalHeight || "?") +
              " px · " +
              (e.src.startsWith("data:") ? "Embedded" : "Not embedded"),
          ),
        );
        const altLabel = make("label", "Alternative text"),
          alt = make("textarea");
        alt.rows = 2;
        alt.maxLength = 2000;
        alt.value = e.draftAlt;
        alt.dataset.alt = String(e.index);
        alt.disabled = !editable || sessionInvalid;
        altLabel.append(alt);
        const capLabel = make("label", "Caption"),
          cap = make("textarea");
        cap.rows = 2;
        cap.maxLength = 5000;
        cap.value = e.draftCaption;
        cap.dataset.caption = String(e.index);
        cap.disabled = !editable || !e.captionEditable || sessionInvalid;
        capLabel.append(cap);
        const note = make(
          "p",
          e.captionEditable
            ? "Plain-text caption. Empty text removes an existing simple caption."
            : "Caption protected: standalone image, shared figure or formatted caption. Use the document editor.",
          "il23-note",
        );
        const locate = make("button", "Locate in document");
        locate.type = "button";
        locate.onclick = () => {
          if (changes().length) {
            q("error").textContent = "Apply or discard your pending edits before leaving the library.";
            return;
          }
          if (!e.im.isConnected) {
            q("error").textContent = "Image no longer exists. Close and reopen the library.";
            return;
          }
          close(true);
          e.im.scrollIntoView({ block: "center", behavior: "instant" });
          toast("Image " + (e.index + 1) + " located.");
        };
        alt.oninput = () => {
          e.draftAlt = alt.value;
          counts();
        };
        cap.oninput = () => {
          e.draftCaption = cap.value;
          counts();
        };
        card.append(altLabel, capLabel, note, locate);
        q("grid").append(card);
      }
      if (!shown.length)
        q("grid").append(
          make(
            "p",
            entries.length
              ? "No images match this filter."
              : "No body images yet. Insert an image from the editor, then reopen the library.",
          ),
        );
      counts();
    }
    function review() {
      if (!changes().length) return;
      if (!valid()) {
        q("error").textContent =
          "Document or editing session changed. Close, discard these drafts and reopen the library. Nothing was applied.";
        return;
      }
      reviewing = true;
      reviewSignature = signature();
      q("review").replaceChildren(make("h3", "Review all pending edits"));
      for (const e of changes()) {
        const card = make("article");
        card.append(make("h4", "Image " + (e.index + 1) + " · Page " + e.page));
        for (const [label, before, after] of [
          ["Alternative text", e.alt, e.draftAlt],
          ["Caption", e.caption, e.draftCaption],
        ])
          if (before !== after) {
            card.append(
              make("strong", label),
              make("p", "Before: " + (before || "(empty)"), "il23-before"),
              make("p", "After: " + (after || "(empty)"), "il23-after"),
            );
          }
        q("review").append(card);
      }
      q("grid").hidden = true;
      q("review").hidden = false;
      q("back").hidden = false;
      q("apply").hidden = false;
      q("review-button").hidden = true;
      d.querySelector("nav").hidden = true;
      q("error").textContent = "";
      q("apply").focus();
    }
    function back() {
      reviewing = false;
      q("grid").hidden = false;
      q("review").hidden = true;
      q("back").hidden = true;
      q("apply").hidden = true;
      q("review-button").hidden = false;
      d.querySelector("nav").hidden = false;
      render();
    }
    q("apply").onclick = () => {
      if (!reviewing || signature() !== reviewSignature || !valid()) {
        q("error").textContent =
          "Document or session changed after review. No metadata was applied. Close and reopen.";
        q("apply").disabled = true;
        return;
      }
      const batch = changes();
      const ok = EditorTransactions.run("Image library metadata batch", () => {
        for (const e of batch) {
          if (e.draftAlt !== e.alt) e.im.setAttribute("alt", e.draftAlt);
          if (e.captionEditable && e.draftCaption !== e.caption) {
            if (!e.draftCaption) {
              e.cap?.remove();
            } else if (e.cap) {
              e.cap.textContent = e.draftCaption;
            } else {
              e.figure.append(make("figcaption", e.draftCaption));
            }
          }
        }
      });
      if (ok) {
        close(true);
        toast(
          batch.length + " image metadata update(s) applied. Undo is available. Export HTML to keep them.",
        );
      } else {
        q("error").textContent =
          "Batch failed. Close and reopen before retrying; the transaction attempted to restore the document.";
        q("apply").disabled = true;
      }
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
    q("review-button").onclick = review;
    q("back").onclick = back;
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
        sessionInvalid = true;
        if (d.isConnected) {
          q("error").textContent = "Editing session changed. Close and reopen the library.";
          q("apply").disabled = true;
          render();
        }
      }
    });
    document.body.append(d);
    d.showModal();
    render();
    q("search").focus();
  }
  return Object.freeze({ open });
})();
