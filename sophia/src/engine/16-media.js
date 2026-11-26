/* ============================================================================
 * SOPHIA · 16-media
 * Images: import, replace, placement, size, Image Layout Studio, side-panel properties.
 * Reused from V76 (editor-media-v14); adapted for the V77 core. Edit this module in
 * place — do not add override layers in other files.
 * ========================================================================== */
/* Hidden file inputs used by EditorMedia (runtime only, never saved). */
(() => {
  if (!document.getElementById('imageInput')) {
    const i = document.createElement('input');
    i.type = 'file'; i.id = 'imageInput'; i.hidden = true; i.multiple = true; i.dataset.runtime = '';
    i.accept = 'image/png,image/jpeg,image/webp';
    document.body.append(i);
  }
})();
/* V13 media service: staged local imports, explicit session/selection checks,
   image-only mutations, and no remote fetch or automatic lossy conversion. */
window.EditorMedia = (() => {
  "use strict";
  let a = null,
    range = null,
    epoch = 0,
    lastPID = null,
    busy = false,
    pending = null;
  const types = ["image/png", "image/jpeg", "image/webp"];
  const editable = () => !!window.EditorSession?.get().pid && !document.body.classList.contains("focusmode");
  const nodeOf = (n) => (n?.nodeType === 1 ? n : n?.parentElement);
  function valid(r) {
    return (
      !!r &&
      r.startContainer.isConnected &&
      r.endContainer.isConnected &&
      !!nodeOf(r.commonAncestorContainer)?.closest(".pagecontent") &&
      a.area.contains(r.startContainer) &&
      a.area.contains(r.endContainer)
    );
  }
  function remember() {
    if (!a || !editable()) return;
    let s = getSelection();
    if (s.rangeCount && valid(s.getRangeAt(0))) range = s.getRangeAt(0).cloneRange();
  }
  function ticket() {
    remember();
    if (!editable()) {
      a.notify("Start editing with your PID first.");
      return null;
    }
    if (valid(range) && !range.collapsed) {
      a.notify("Place a single insertion cursor; image import does not replace selected text.");
      return null;
    }
    if (!valid(range)) {
      a.notify("Place the cursor in the document body before inserting an image.");
      return null;
    }
    let r = range.cloneRange();
    return { r, start: r.startContainer, end: r.endContainer, epoch, pid: EditorSession.get().pid };
  }
  function current(t) {
    return editable() && t?.epoch === epoch && t.pid === EditorSession.get().pid;
  }
  function destination(t) {
    return (
      current(t) &&
      valid(t.r) &&
      t.start.isConnected &&
      t.end.isConnected &&
      t.r.startContainer === t.start &&
      t.r.endContainer === t.end
    );
  }
  function image() {
    let im = a.selected();
    return im?.isConnected && a.area.contains(im) && im.closest(".pagecontent") ? im : null;
  }
  function mutate(im, fn) {
    if (!editable() || !im?.isConnected || !a.area.contains(im) || !im.closest(".pagecontent")) {
      a.notify("Select a document image in an active editing session.");
      return false;
    }
    const ok = EditorTransactions.run("Image mutation", fn);
    if (ok) render();
    return ok;
  }
  function make(tag, text) {
    let n = document.createElement(tag);
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function select(im) {
    a.area.querySelectorAll("img.selected").forEach((n) => n.classList.remove("selected"));
    a.select(im);
    if (im) im.classList.add("selected");
    a.side("images");
  }
  function ensureFigure(im) {
    let f = im.closest("figure");
    if (f) return f;
    f = make("figure");
    let p = im.parentElement;
    if (p?.tagName === "P" && p.childNodes.length === 1) {
      p.replaceWith(f);
      f.append(im);
    } else if (p?.tagName === "P") {
      let tail = document.createRange();
      tail.selectNodeContents(p);
      tail.setStartAfter(im);
      let after = make("p");
      after.append(tail.extractContents());
      p.after(f);
      f.append(im);
      if (after.hasChildNodes()) f.after(after);
    } else {
      im.before(f);
      f.append(im);
    }
    return f;
  }
  function layout(im, mode) {
    let fig = im.closest("figure"),
      target = fig || im;
    ["float", "clear", "display", "maxWidth", "marginLeft", "marginRight", "verticalAlign"].forEach(
      (k) => (target.style[k] = ""),
    );
    im.style.float = "";
    if (!fig) im.style.maxWidth = "100%";
    im.dataset.wrap = mode;
    if (mode === "left" || mode === "right") {
      target.style.float = mode;
      target.style.maxWidth = "48%";
      target.style.marginLeft = mode === "right" ? "18px" : "0";
      target.style.marginRight = mode === "left" ? "18px" : "0";
      im.style.display = "block";
    } else if (mode === "inline") {
      target.style.display = "inline-block";
      target.style.verticalAlign = "middle";
      im.style.display = "inline-block";
    } else {
      target.style.display = "block";
      target.style.clear = "both";
      im.style.display = "block";
    }
  }
  function wrap(mode) {
    if (!["block", "inline", "left", "right"].includes(mode)) return;
    let im = image();
    mutate(im, () => layout(im, mode));
  }
  function align(value) {
    if (!["left", "center", "right"].includes(value)) return;
    let im = image();
    mutate(im, () => {
      let target = im.closest("figure") || im;
      target.style.float = "";
      target.style.display = "block";
      target.style.textAlign = value;
      im.style.display = "block";
      im.style.marginLeft = value === "left" ? "0" : "auto";
      im.style.marginRight = value === "right" ? "0" : "auto";
    });
  }
  function remove() {
    let im = image();
    if (!editable() || !im) return;
    let f = im.closest("figure");
    if (f && f.querySelectorAll("img").length > 1) {
      a.notify(
        "This figure contains several images. Separate them before deleting to avoid losing other content.",
      );
      return;
    }
    let d = document.createElement("dialog");
    d.className = "command-dialog media-dialog";
    d.innerHTML =
      '<form method="dialog"><header><h2>Delete selected image?</h2><p>The image and its own caption will be removed. You can undo this action in the current session.</p></header><footer><button type="button" value="cancel">Cancel</button><button type="button" class="primary" data-remove>Delete image</button></footer></form>';
    let e = epoch;
    d.querySelector("[data-remove]").onclick = () => {
      if (e !== epoch || !editable() || !im.isConnected) {
        d.close();
        d.remove();
        a.notify("The editing session or image changed. Nothing was deleted.");
        return;
      }
      mutate(im, () => {
        (f || im).remove();
        a.select(null);
      });
      d.close();
      d.remove();
    };
    d.querySelector('button[value="cancel"]').onclick = () => d.close("cancel");
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      d.close("cancel");
    });
    d.addEventListener("close", () => d.remove(), { once: true });
    document.body.append(d);
    d.showModal();
  }
  /* Explicit local optimisation; originals stay in the import preview until closed.
   Never touches images already in saved historical snapshots. */
  function importTools(asset, card, preview, info) {
    const original = { src: asset.src, width: asset.width, height: asset.height, size: asset.size };
    const controls = make("div");
    controls.className = "import-tools-v22";
    const label = make("label", "Maximum edge (px)"),
      limit = make("input");
    limit.type = "number";
    limit.min = "320";
    limit.max = "8000";
    limit.step = "1";
    limit.value = "1600";
    label.append(limit);
    const optimize = make("button", "Create smaller PNG preview"),
      restore = make("button", "Restore original");
    optimize.type = restore.type = "button";
    restore.disabled = true;
    const status = make("p", "Original file retained. Optimisation is optional.");
    status.setAttribute("role", "status");
    function describe() {
      info.textContent =
        asset.name +
        " · " +
        asset.width +
        " × " +
        asset.height +
        " px · " +
        Math.ceil(asset.size / 1024) +
        " KB";
    }
    optimize.onclick = async () => {
      const max = Number(limit.value);
      if (!Number.isInteger(max) || max < 320 || max > 8000) {
        status.textContent = "Choose a whole number between 320 and 8000.";
        return;
      }
      optimize.disabled = true;
      restore.disabled = true;
      status.textContent = "Preparing a local preview…";
      try {
        const im = new Image();
        im.src = original.src;
        await im.decode();
        if (!card.isConnected) return;
        const scale = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight)),
          canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(im.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(im.naturalHeight * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) throw Error("Image processing is unavailable.");
        ctx.drawImage(im, 0, 0, canvas.width, canvas.height);
        const src = canvas.toDataURL("image/png"),
          size = Math.floor(((src.length - src.indexOf(",") - 1) * 3) / 4);
        if (size >= original.size) {
          status.textContent = "The PNG would not be smaller. Original retained.";
          Object.assign(asset, original);
          preview.src = asset.src;
          describe();
          return;
        }
        Object.assign(asset, { src, width: canvas.width, height: canvas.height, size });
        preview.src = src;
        describe();
        restore.disabled = false;
        status.textContent =
          "Preview reduced by " +
          Math.round((1 - size / original.size) * 100) +
          "%. Check screenshot text legibility before inserting. Historical images are unchanged.";
      } catch (error) {
        status.textContent = "Optimisation failed: " + error.message + ". Original remains available.";
      } finally {
        optimize.disabled = false;
        restore.disabled = asset.src === original.src;
      }
    };
    restore.onclick = () => {
      Object.assign(asset, original);
      preview.src = asset.src;
      describe();
      restore.disabled = true;
      status.textContent = "Original restored.";
    };
    controls.append(label, optimize, restore, status);
    card.append(controls);
  }

  async function decode(file) {
    if (!types.includes(file.type)) throw Error("Use PNG, JPEG or WebP: " + file.name);
    if (!file.size || file.size > 15 * 1024 * 1024)
      throw Error("Each image must be non-empty and no larger than 15 MB: " + file.name);
    let src = await new Promise((resolve, reject) => {
      let r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(Error("Could not read " + file.name));
      r.onabort = () => reject(Error("Reading cancelled"));
      r.readAsDataURL(file);
    });
    let im = new Image();
    im.src = src;
    await im.decode().catch(() => {
      throw Error("The file could not be decoded as an image: " + file.name);
    });
    if (im.naturalWidth * im.naturalHeight > 40000000)
      throw Error("Image exceeds 40 megapixels: " + file.name);
    return { src, width: im.naturalWidth, height: im.naturalHeight, name: file.name, size: file.size };
  }
  function insertFigures(t, assets) {
    let r = t.r;
    let parent = nodeOf(r.commonAncestorContainer);
    if (parent?.closest("figure")) throw Error("Select a text position outside an existing figure.");
    r.deleteContents();
    let p = nodeOf(r.startContainer)?.closest("p,h1,h2,h3,h4");
    let fragment = document.createDocumentFragment();
    let images = [];
    assets.forEach((asset) => {
      let f = make("figure"),
        im = make("img");
      im.src = asset.src;
      im.alt = asset.alt;
      im.style.width = "100%";
      im.style.maxWidth = asset.width + "px";
      im.style.height = "auto";
      f.append(im);
      if (asset.caption) {
        let cap = make("figcaption", asset.caption);
        f.append(cap);
      }
      fragment.append(f);
      images.push(im);
    });
    let after = make("p");
    after.append(make("br"));
    if (p && a.area.contains(p)) {
      let tail = document.createRange();
      tail.selectNodeContents(p);
      tail.setStart(r.startContainer, r.startOffset);
      let contents = tail.extractContents();
      after.replaceChildren(contents);
      if (!after.hasChildNodes()) after.append(make("br"));
      p.after(fragment);
      images.at(-1).closest("figure").after(after);
    } else {
      fragment.append(after);
      r.insertNode(fragment);
    }
    let caret = document.createRange();
    caret.selectNodeContents(after);
    caret.collapse(true);
    getSelection().removeAllRanges();
    getSelection().addRange(caret);
    range = caret.cloneRange();
    a.select(images.at(-1));
    return images;
  }
  async function stage(files, t, replacement = null) {
    if (busy) {
      a.notify("Finish the current image import first.");
      return;
    }
    if (!files?.length) return;
    files = [...files];
    if (files.length > 10 || files.reduce((s, f) => s + f.size, 0) > 50 * 1024 * 1024) {
      a.notify("Import up to 10 images and 50 MB per batch.");
      return;
    }
    busy = true;
    let d = document.createElement("dialog");
    d.className = "command-dialog media-dialog";
    d.setAttribute("aria-label", replacement ? "Replace image" : "Insert images");
    d.innerHTML =
      '<form method="dialog"><header><h2></h2><p data-status role="status">Reading and validating local files…</p></header><section data-assets></section><p class="command-error" data-error role="alert"></p><footer><button type="button" data-cancel>Cancel</button><button type="button" class="primary" data-apply disabled></button></footer></form>';
    d.querySelector("h2").textContent = replacement ? "Replace image" : "Insert images";
    let apply = d.querySelector("[data-apply]");
    apply.textContent = replacement ? "Replace image" : "Insert images";
    const importOrigin = document.activeElement;
    let cancelled = false;
    function close() {
      cancelled = true;
      busy = false;
      if (d.open) d.close();
      d.remove();
      if (importOrigin?.isConnected) importOrigin.focus({ preventScroll: true });
    }
    d.querySelector("[data-cancel]").onclick = close;
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && ["s", "z", "y", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    document.body.append(d);
    d.showModal();
    let assets;
    try {
      assets = [];
      for (let i = 0; i < files.length; i++) {
        if (cancelled) return;
        d.querySelector("[data-status]").textContent =
          "Reading image " + (i + 1) + " of " + files.length + "…";
        assets.push(await decode(files[i]));
      }
      if (cancelled) return;
      if (!current(t)) {
        close();
        a.notify("Editing session changed. No images were imported.");
        return;
      }
      let body = d.querySelector("[data-assets]");
      assets.forEach((asset, i) => {
        let card = make("div");
        card.className = "media-asset";
        let preview = make("img");
        preview.src = asset.src;
        preview.alt = "Local file preview";
        let info = make(
          "p",
          asset.name +
            " · " +
            asset.width +
            " × " +
            asset.height +
            " px · " +
            Math.ceil(asset.size / 1024) +
            " KB",
        );
        card.append(preview, info);
        importTools(asset, card, preview, info);
        if (!replacement) {
          [
            ["alt", "Alternative text"],
            ["caption", "Caption (optional)"],
          ].forEach(([key, label]) => {
            let l = make("label", label),
              input = make("input");
            input.type = "text";
            input.dataset.asset = i;
            input.dataset.field = key;
            input.value = key === "alt" ? asset.name.replace(/\.[^.]+$/, "") : "";
            l.append(input);
            card.append(l);
          });
        }
        body.append(card);
      });
      d.querySelector("[data-status]").textContent = replacement
        ? "Only the image source changes. Layout, alternative text and caption are retained."
        : "Files stay embedded in the HTML. Original pixels are retained; no compression is applied.";
      apply.disabled = false;
      apply.onclick = () => {
        if (
          !current(t) ||
          (!replacement && !destination(t)) ||
          (replacement && (!replacement.isConnected || !a.area.contains(replacement)))
        ) {
          d.querySelector("[data-error]").textContent =
            "The session or destination changed. Cancel and choose a new destination; nothing was imported.";
          return;
        }
        if (!replacement) {
          assets.forEach((asset, i) => {
            asset.alt = d.querySelector('[data-asset="' + i + '"][data-field=alt]').value;
            asset.caption = d.querySelector('[data-asset="' + i + '"][data-field=caption]').value;
          });
          if (nodeOf(t.r.commonAncestorContainer)?.closest("figure")) {
            d.querySelector("[data-error]").textContent =
              "Choose a text position outside an existing figure.";
            return;
          }
        }
        try {
          const committed = EditorTransactions.run(
            replacement ? "Replace embedded image" : "Insert embedded image batch",
            () => {
              if (replacement) {
                replacement.src = assets[0].src;
                a.select(replacement);
              } else insertFigures(t, assets);
            },
          );
          if (!committed) {
            d.querySelector("[data-error]").textContent =
              "Import did not complete. Cancel and select the destination again.";
            apply.disabled = true;
            return;
          }
          close();
          a.side("images");
          a.notify(
            replacement
              ? "Image replaced; formatting and caption retained."
              : "Images embedded. Export HTML to keep this change.",
          );
        } catch (error) {
          d.querySelector("[data-error]").textContent = error.message;
        }
      };
    } catch (error) {
      if (!cancelled) {
        d.querySelector("[data-status]").textContent = "Import stopped. The document is unchanged.";
        d.querySelector("[data-error]").textContent = error.message;
      }
    }
  }
  function open() {
    if (busy) {
      a.notify("Finish the current image import first.");
      return;
    }
    let t = ticket();
    if (!t) return;
    pending = t;
    let input = document.getElementById("imageInput");
    input.value = "";
    input.click();
  }
  function replace() {
    let im = image();
    if (!editable() || !im) return;
    let t = { epoch, pid: EditorSession.get().pid };
    let input = document.getElementById("media-replace-file");
    input.value = "";
    input.onchange = () => {
      let file = input.files[0];
      if (file) stage([file], t, im);
      input.value = "";
    };
    input.click();
  }
  /* V14 placement lives inside EditorMedia, sharing permission and undo adapters.
   Gestures preview outside the document; only pointer-up commits one mutation. */
  let overlay = null,
    guide = null,
    ghost = null,
    gesture = null,
    frame = 0,
    moveMode = false,
    point = null;
  function unit(im) {
    let f = im?.closest("figure");
    return f || im;
  }
  function movable(im) {
    let u = unit(im);
    return (
      !!im &&
      editable() &&
      im.isConnected &&
      a.area.contains(im) &&
      !!im.closest(".pagecontent") &&
      (!u.matches("figure") || u.querySelectorAll("img").length === 1)
    );
  }
  function targets(im) {
    let u = unit(im);
    return [
      ...a.area.querySelectorAll(
        ".pagecontent p,.pagecontent h1,.pagecontent h2,.pagecontent h3,.pagecontent h4,.pagecontent figure,.pagecontent table,.pagecontent ul,.pagecontent ol",
      ),
    ].filter(
      (n) =>
        !u?.contains(n) &&
        n !== u &&
        !n.contains(u) &&
        !n.parentElement.closest("figure,table,ul,ol") &&
        !n.closest(".identity,[data-trace]") &&
        n.getBoundingClientRect().width > 0,
    );
  }
  function locationText(n) {
    let sheet = n.closest(".sheet"),
      sheets = [...a.area.querySelectorAll(".sheet")],
      body = n.closest(".pagecontent"),
      bodies = [...a.area.querySelectorAll(".pagecontent")];
    return (
      "Page " +
      (sheet ? sheets.indexOf(sheet) + 1 : bodies.indexOf(body) + 1) +
      " · " +
      n.tagName.toLowerCase() +
      " · " +
      (n.innerText || n.querySelector("img")?.alt || "Image").trim().replace(/\s+/g, " ").slice(0, 85)
    );
  }
  function safeTarget(im, n) {
    return movable(im) && n?.isConnected && a.area.contains(n) && targets(im).includes(n);
  }
  function relocate(im, n, where = "before") {
    if (!safeTarget(im, n)) {
      a.notify("Choose a valid body block outside the image. No move was made.");
      return false;
    }
    let u = unit(im);
    if (
      (where === "before" && u.nextElementSibling === n) ||
      (where === "after" && n.nextElementSibling === u)
    )
      return true;
    let ok = mutate(im, () => {
      u = ensureFigure(im);
      if (where === "after") n.after(u);
      else n.before(u);
      u.style.breakInside = "avoid";
      u.style.pageBreakInside = "avoid";
      a.select(im);
    });
    if (ok) {
      im.scrollIntoView({ block: "nearest", behavior: "instant" });
      position();
      a.notify("Image and caption moved together. Undo is available.");
    }
    return ok;
  }
  function stepMove(direction) {
    let im = image();
    if (!movable(im)) {
      a.notify("Select a single-image figure to move.");
      return;
    }
    let u = unit(im),
      sibling = direction < 0 ? u.previousElementSibling : u.nextElementSibling;
    if (sibling && safeTarget(im, sibling)) return relocate(im, sibling, direction < 0 ? "before" : "after");
    let candidates = targets(im),
      flag = direction < 0 ? Node.DOCUMENT_POSITION_PRECEDING : Node.DOCUMENT_POSITION_FOLLOWING;
    let next =
      direction < 0
        ? candidates.filter((n) => u.compareDocumentPosition(n) & flag).at(-1)
        : candidates.find((n) => u.compareDocumentPosition(n) & flag);
    if (next) relocate(im, next, direction < 0 ? "before" : "after");
    else a.notify("No further body block in that direction.");
  }
  function moveDialog() {
    let im = image();
    if (!movable(im)) {
      a.notify("Select a single-image figure first.");
      return;
    }
    let options = targets(im),
      e = epoch;
    let d = make("dialog");
    d.className = "command-dialog media-dialog";
    d.setAttribute("aria-label", "Move image and caption");
    d.innerHTML =
      '<form method="dialog"><header><h2>Move image and caption</h2><p>Choose a body block. The original image is moved, not copied; its caption and formatting stay attached.</p></header><section><label>Find destination<input data-find type="search" placeholder="Search page, heading or text"></label><label>Destination<select data-target size="7"></select></label><label>Position<select data-where><option value="before">Before selected block</option><option value="after">After selected block</option></select></label><p class="command-error" data-error role="alert"></p></section><footer><button type="button" value="cancel">Cancel</button><button type="button" data-place class="primary">Move image</button></footer></form>';
    let list = d.querySelector("[data-target]");
    function filter() {
      let text = d.querySelector("[data-find]").value.toLowerCase();
      list.replaceChildren();
      options.forEach((n, i) => {
        let label = locationText(n);
        if (label.toLowerCase().includes(text)) {
          let o = make("option", label);
          o.value = i;
          list.append(o);
        }
      });
      if (list.options.length) list.selectedIndex = 0;
    }
    filter();
    d.querySelector("[data-find]").oninput = filter;
    d.querySelector("[data-place]").onclick = () => {
      let n = options[Number(list.value)];
      if (list.selectedIndex < 0 || epoch !== e || !safeTarget(im, n)) {
        d.querySelector("[data-error]").textContent =
          "Destination or session changed. Choose a new destination.";
        return;
      }
      d.close();
      d.remove();
      relocate(im, n, d.querySelector("[data-where]").value);
    };
    const origin = document.activeElement;
    d.querySelector('button[value="cancel"]').onclick = () => d.close("cancel");
    d.querySelector("form").addEventListener("submit", (event) => event.preventDefault());
    d.addEventListener("cancel", (event) => {
      event.preventDefault();
      d.close("cancel");
    });
    d.addEventListener(
      "close",
      () => {
        d.remove();
        if (origin?.isConnected) origin.focus({ preventScroll: true });
      },
      { once: true },
    );
    document.body.append(d);
    d.showModal();
    d.querySelector("[data-find]").focus();
  }
  function preset(percent) {
    let im = image();
    if (!movable(im)) return;
    let p = Number(percent);
    if (![25, 33, 50, 66, 75, 100].includes(p)) return;
    mutate(im, () => {
      let fig = ensureFigure(im);
      fig.style.width = "";
      fig.style.maxWidth = "100%";
      im.dataset.wrap = "block";
      fig.style.float = "";
      fig.style.display = "block";
      fig.style.clear = "both";
      fig.style.width = "";
      im.style.width = p + "%";
      im.style.maxWidth = "100%";
      im.style.height = "auto";
      fig.style.breakInside = "avoid";
    });
    position();
  }
  function precise() {
    let im = image();
    if (!movable(im)) return;
    let e = epoch,
      d = make("dialog");
    d.className = "command-dialog media-dialog";
    d.setAttribute("aria-label", "Image size and spacing");
    d.innerHTML =
      '<form method="dialog"><header><h2>Size and spacing</h2><p>Proportional sizing. Original pixels are retained. Spacing applies to the image and caption group.</p></header><section><label>Width<input data-width type="number" min="1" max="2400" step="1" required></label><label>Unit<select data-unit><option value="px">Pixels</option><option value="%">% of containing block</option></select></label><div class="media-spacing"></div><p data-size-info></p><p class="command-error" data-error role="alert"></p></section><footer><button type="button" value="cancel">Cancel</button><button type="button" data-size-apply class="primary">Apply size and spacing</button></footer></form>';
    let width = d.querySelector("[data-width]"),
      unitSelect = d.querySelector("[data-unit]");
    width.value = Math.round(im.offsetWidth);
    let fig = unit(im),
      style = getComputedStyle(fig);
    ["Top", "Right", "Bottom", "Left"].forEach((side) => {
      let l = make("label", "Space " + side.toLowerCase() + " (px)"),
        input = make("input");
      input.type = "number";
      input.min = "0";
      input.max = "2400";
      input.step = "1";
      input.required = true;
      input.dataset.space = side;
      input.dataset.original = fig.style["margin" + side] || style["margin" + side];
      input.value = Math.max(0, Math.round(parseFloat(style["margin" + side]) || 0));
      l.append(input);
      d.querySelector(".media-spacing").append(l);
    });
    unitSelect.onchange = () => {
      width.max = unitSelect.value === "%" ? "100" : "2400";
      width.value = unitSelect.value === "%" ? "50" : String(Math.round(im.offsetWidth));
    };
    d.querySelector("[data-size-info]").textContent =
      "Original: " +
      im.naturalWidth +
      " × " +
      im.naturalHeight +
      " px. Widths above the original may look less sharp.";
    d.querySelector("[data-size-apply]").onclick = () => {
      if (!d.querySelector("form").reportValidity()) return;
      if (epoch !== e || !movable(im)) {
        d.querySelector("[data-error]").textContent = "Session or image changed. Nothing was applied.";
        return;
      }
      let w = Number(width.value),
        suffix = unitSelect.value,
        spaces = [...d.querySelectorAll("[data-space]")].map((n) => [
          n.dataset.space,
          n.value,
          n.dataset.original,
        ]);
      d.close();
      d.remove();
      mutate(im, () => {
        let f = ensureFigure(im);
        f.style.width = "";
        im.style.width = w + suffix;
        im.style.maxWidth = "100%";
        im.style.height = "auto";
        spaces.forEach(
          ([side, v, original]) =>
            (f.style["margin" + side] = original === "auto" && Number(v) === 0 ? "auto" : v + "px"),
        );
        f.style.breakInside = "avoid";
        f.style.pageBreakInside = "avoid";
      });
      position();
    };
    const origin = document.activeElement;
    d.querySelector('button[value="cancel"]').onclick = () => d.close("cancel");
    d.querySelector("form").addEventListener("submit", (event) => event.preventDefault());
    d.addEventListener("cancel", (event) => {
      event.preventDefault();
      d.close("cancel");
    });
    d.addEventListener(
      "close",
      () => {
        d.remove();
        if (origin?.isConnected) origin.focus({ preventScroll: true });
      },
      { once: true },
    );
    document.body.append(d);
    d.showModal();
    width.focus();
  }
  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      position();
    });
  }
  function position() {
    if (!overlay) return;
    let im = image();
    if (
      !movable(im) ||
      document.querySelector("dialog[open],.modalveil,#historyStudio") ||
      document.body.classList.contains("archive-mode")
    ) {
      overlay.hidden = true;
      return;
    }
    let r = im.getBoundingClientRect();
    if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) {
      overlay.hidden = true;
      return;
    }
    overlay.hidden = false;
    overlay.style.left = r.left + "px";
    overlay.style.top = r.top + "px";
    overlay.style.width = r.width + "px";
    overlay.style.height = r.height + "px";
    let bar = overlay.querySelector("[data-media-bar]");
    bar.style.top = r.top < 160 ? "0" : "-40px";
    bar.style.left = Math.max(0, Math.min(r.width - 330, innerWidth - r.left - 350)) + "px";
    overlay.querySelector("[data-media-dimensions]").textContent =
      Math.round(r.width) + " × " + Math.round(r.height) + " px";
  }
  function showGuide(n, where) {
    if (!guide) return;
    if (!n) {
      guide.hidden = true;
      return;
    }
    let r = n.getBoundingClientRect();
    guide.hidden = false;
    guide.style.left = r.left + "px";
    guide.style.top = (where === "before" ? r.top : r.bottom) + "px";
    guide.style.width = r.width + "px";
    guide.textContent = (where === "before" ? "Before · " : "After · ") + locationText(n);
  }
  function atPoint(x, y, im) {
    let el = document.elementFromPoint(x, y);
    if (!el || !a.area.contains(el) || !el.closest(".pagecontent")) return null;
    let list = targets(im),
      n = list.find((n) => n === el || n.contains(el));
    if (!n) {
      let body = el.closest(".pagecontent");
      list = list.filter((n) => n.closest(".pagecontent") === body);
      n = list.reduce((best, n) => {
        let r = n.getBoundingClientRect(),
          distance = Math.min(Math.abs(y - r.top), Math.abs(y - r.bottom));
        return !best || distance < best.distance ? { n, distance } : best;
      }, null)?.n;
    }
    if (!n) return null;
    let r = n.getBoundingClientRect();
    return { n, where: y < r.top + r.height / 2 ? "before" : "after" };
  }
  function endGesture(cancel = false) {
    let g = gesture;
    gesture = null;
    moveMode = false;
    point = null;
    if (guide) guide.hidden = true;
    if (ghost) ghost.hidden = true;
    document.body.classList.remove("media-placing");
    if (!g) {
      position();
      return;
    }
    if (!cancel && g.epoch === epoch && movable(g.im)) {
      if (g.kind === "resize" && g.width !== g.initialWidth) {
        mutate(g.im, () => {
          if (g.im.closest("figure")) g.im.closest("figure").style.width = "";
          g.im.style.width = Math.round(g.width) + "px";
          g.im.style.maxWidth = "100%";
          g.im.style.height = "auto";
        });
      } else if (g.kind === "move" && g.target) relocate(g.im, g.target.n, g.target.where);
    }
    position();
  }
  function beginGesture(event, kind) {
    if (event.button !== 0) return;
    let im = image();
    if (!movable(im)) return;
    event.preventDefault();
    event.stopPropagation();
    endGesture(true);
    let r = im.getBoundingClientRect();
    gesture = {
      kind,
      im,
      epoch,
      startX: event.clientX,
      startY: event.clientY,
      initialWidth: im.offsetWidth,
      width: im.offsetWidth,
      scale: r.width / Math.max(1, im.offsetWidth),
      ratio: r.height / r.width,
      rect: r,
      maxWidth: Math.max(1, unit(im).parentElement.clientWidth),
    };
    if (kind === "resize") {
      ghost.hidden = false;
      ghost.style.left = r.left + "px";
      ghost.style.top = r.top + "px";
      ghost.style.width = r.width + "px";
      ghost.style.height = r.height + "px";
      ghost.textContent = Math.round(r.width) + " px";
    }
    document.body.classList.add("media-placing");
  }
  function pointerMove(e) {
    if (gesture) {
      e.preventDefault();
      let g = gesture;
      if (g.epoch !== epoch || !movable(g.im)) {
        endGesture(true);
        return;
      }
      if (g.kind === "resize") {
        let width = Math.max(24, Math.min(g.maxWidth, g.initialWidth + (e.clientX - g.startX) / g.scale));
        if (e.shiftKey) width = Math.round(width / 10) * 10;
        g.width = width;
        ghost.style.width = width * g.scale + "px";
        ghost.style.height = width * g.scale * g.ratio + "px";
        ghost.textContent =
          Math.round(width) + " × " + Math.round(width * g.ratio) + " px · release to apply";
      } else {
        g.target = atPoint(e.clientX, e.clientY, g.im);
        showGuide(g.target?.n, g.target?.where);
        if (e.clientY > innerHeight - 60) window.scrollBy(0, 24);
        else if (e.clientY < 160) window.scrollBy(0, -24);
      }
    } else if (moveMode) {
      if (moveMode.epoch !== epoch || !movable(moveMode.im)) {
        endGesture(true);
        return;
      }
      point = atPoint(e.clientX, e.clientY, moveMode.im);
      showGuide(point?.n, point?.where);
    }
  }
  /* V16 Image Layout Studio. Preview is detached from the document.
   Commit checks session epoch, original markup and supported figure structure. */
  function studio() {
    const im = image();
    if (!movable(im)) {
      a.notify("Select a single document image in an editing session.");
      return;
    }
    const originalUnit = unit(im);
    if (
      originalUnit.matches("figure") &&
      [...originalUnit.children].some((n) => n !== im && n.tagName !== "FIGCAPTION")
    ) {
      a.notify("This figure has additional content. Use existing controls to preserve it.");
      return;
    }
    if (document.querySelector("dialog[open]")) return;
    const startEpoch = epoch,
      startPID = EditorSession.get().pid,
      original = originalUnit.outerHTML;
    const d = make("dialog");
    d.className = "command-dialog media-dialog layout-studio";
    d.setAttribute("aria-label", "Image Layout Studio");
    d.innerHTML = `<form novalidate><header><h2>Image Layout Studio</h2><p>Preview locally. Nothing changes in the document until you apply.</p></header><div class="studio-grid"><section class="studio-controls"><label>Width (% of text area)<input data-width type="number" min="10" max="100" step="1" required></label><div class="studio-presets"></div><label>Layout<select data-layout><option value="block">Separate block</option><option value="left">Float left, text on right</option><option value="right">Float right, text on left</option></select></label><label>Block alignment<select data-align><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label><label>Space above (px)<input data-top type="number" min="0" max="2400" step="1" required></label><label>Space below (px)<input data-bottom type="number" min="0" max="2400" step="1" required></label><label>Text gap (px)<input data-gap type="number" min="0" max="160" step="1" value="18" required></label><label>Alternative text<input data-alt type="text"></label><label>Caption<textarea data-caption rows="3"></textarea></label></section><section class="studio-preview"><strong>LAYOUT PREVIEW</strong><p>Illustrative text, not your document content.</p><div data-canvas><figure data-figure><img data-preview alt="Layout preview"><figcaption data-preview-caption></figcaption></figure><p>Example paragraph showing how the image sits within the text area. The caption stays attached to the image.</p><p>Change width, alignment and spacing to compare the layout before applying it to your document.</p><p>Original image pixels are retained. This preview does not compress or crop your image.</p></div><p data-dimensions role="status"></p><p class="command-error" data-error role="alert"></p></section></div><footer><button type="button" data-cancel>Cancel</button><button type="button" class="primary" data-commit>Apply layout</button></footer></form>`;
    const q = (x) => d.querySelector("[data-" + x + "]");
    const parent = originalUnit.parentElement;
    const cs = getComputedStyle(originalUnit);
    q("width").value = Math.max(
      10,
      Math.min(100, Math.round((im.offsetWidth / Math.max(1, parent.clientWidth)) * 100)),
    );
    q("layout").value = ["left", "right"].includes(cs.cssFloat) ? cs.cssFloat : "block";
    q("align").value =
      (originalUnit.style.marginLeft || im.style.marginLeft) === "auto"
        ? (originalUnit.style.marginRight || im.style.marginRight) === "auto"
          ? "center"
          : "right"
        : "left";
    q("top").value = Math.max(0, Math.round(parseFloat(cs.marginTop) || 0));
    q("bottom").value = Math.max(0, Math.round(parseFloat(cs.marginBottom) || 0));
    q("alt").value = im.alt;
    q("caption").value = im.closest("figure")?.querySelector("figcaption")?.textContent || "";
    q("preview").src = im.src;
    function values() {
      return {
        width: Number(q("width").value),
        layout: q("layout").value,
        align: q("align").value,
        top: Number(q("top").value),
        bottom: Number(q("bottom").value),
        gap: Number(q("gap").value),
        alt: q("alt").value,
        caption: q("caption").value,
      };
    }
    function validValues(v) {
      return (
        ["width", "top", "bottom", "gap"].every((k) => Number.isFinite(v[k]) && Number.isInteger(v[k])) &&
        v.width >= 10 &&
        v.width <= 100 &&
        v.top >= 0 &&
        v.top <= 2400 &&
        v.bottom >= 0 &&
        v.bottom <= 2400 &&
        v.gap >= 0 &&
        v.gap <= 160 &&
        ["block", "left", "right"].includes(v.layout) &&
        ["left", "center", "right"].includes(v.align)
      );
    }
    function applyLayout(fig, img, v) {
      fig.style.width = v.width + "%";
      fig.style.maxWidth = "100%";
      fig.style.display = "block";
      fig.style.clear = v.layout === "block" ? "both" : "none";
      fig.style.float = v.layout === "block" ? "none" : v.layout;
      fig.style.marginTop = v.top + "px";
      fig.style.marginBottom = v.bottom + "px";
      fig.style.marginLeft =
        v.layout === "right" ? v.gap + "px" : v.layout === "left" ? "0" : v.align === "left" ? "0" : "auto";
      fig.style.marginRight =
        v.layout === "left" ? v.gap + "px" : v.layout === "right" ? "0" : v.align === "right" ? "0" : "auto";
      fig.style.breakInside = "avoid";
      fig.style.pageBreakInside = "avoid";
      img.style.width = "100%";
      img.style.maxWidth = "100%";
      img.style.height = "auto";
      img.style.display = "block";
      img.style.float = "none";
      img.style.margin = "0";
      img.dataset.wrap = v.layout;
    }
    function preview() {
      let v = values();
      let ok =
        validValues(v) && [...d.querySelectorAll("input[type=number]")].every((n) => n.checkValidity());
      q("commit").disabled = !ok;
      q("align").disabled = v.layout !== "block";
      if (!ok) {
        q("error").textContent = "Use a width of 10-100% and valid non-negative spacing.";
        return;
      }
      q("error").textContent = "";
      applyLayout(q("figure"), q("preview"), v);
      q("preview-caption").textContent = v.caption;
      q("preview-caption").hidden = !v.caption;
      q("dimensions").textContent =
        "Target width: about " +
        Math.round((parent.clientWidth * v.width) / 100) +
        " px. Original: " +
        im.naturalWidth +
        " x " +
        im.naturalHeight +
        " px.";
    }
    [25, 33, 50, 66, 75, 100].forEach((w) => {
      let b = make("button", w + "%");
      b.type = "button";
      b.onclick = () => {
        q("width").value = w;
        preview();
      };
      d.querySelector(".studio-presets").append(b);
    });
    const origin = document.activeElement;
    let unsubscribe = () => {};
    function close() {
      unsubscribe();
      if (d.open) d.close();
      d.remove();
      if (origin?.isConnected) origin.focus({ preventScroll: true });
      schedule();
    }
    q("cancel").onclick = close;
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      close();
    });
    d.querySelector("form").addEventListener("submit", (e) => e.preventDefault());
    d.addEventListener("input", preview);
    d.addEventListener("change", preview);
    q("commit").onclick = () => {
      const v = values();
      if (!validValues(v) || !d.querySelector("form").reportValidity()) return;
      if (
        epoch !== startEpoch ||
        EditorSession.get().pid !== startPID ||
        !movable(im) ||
        unit(im) !== originalUnit ||
        originalUnit.outerHTML !== original
      ) {
        q("error").textContent =
          "The session or image changed. Cancel and reopen this studio. Nothing was applied.";
        q("commit").disabled = true;
        return;
      }
      const backup = a.area.innerHTML;
      a.capture();
      try {
        const f = ensureFigure(im);
        applyLayout(f, im, v);
        im.alt = v.alt;
        let cap = f.querySelector("figcaption");
        if (v.caption) {
          if (!cap) {
            cap = make("figcaption");
            f.append(cap);
          }
          cap.textContent = v.caption;
        } else cap?.remove();
      } catch (error) {
        a.area.innerHTML = backup;
        a.select(null);
        EditorSession.changed();
        q("error").textContent = "Layout failed and was rolled back. Close and reopen the studio.";
        q("commit").disabled = true;
        return;
      }
      a.capture();
      EditorSession.changed();
      close();
      select(im);
      a.notify("Layout applied. Image and caption stay together. Undo is available.");
    };
    document.body.append(d);
    d.showModal();
    preview();
    q("width").focus();
    unsubscribe = EditorSession.subscribe(() => {
      if (epoch !== startEpoch || EditorSession.get().pid !== startPID) close();
    });
  }

  function placementPanel(root, im) {
    let box = make("section");
    box.className = "media-placement";
    box.append(make("strong", "PLACEMENT & SIZE"));
    let note = make(
      "p",
      "Move the image and caption as one group. Use the floating handle to drag between body blocks. Esc cancels.",
    );
    box.append(note);
    let grid = make("div");
    grid.className = "media-placement-grid";
    [
      ["Layout Studio...", studio],
      ["Move up", () => stepMove(-1)],
      ["Move down", () => stepMove(1)],
      ["Move to…", moveDialog],
      [
        "Click destination",
        () => {
          moveMode = { im, epoch };
          a.notify("Click above or below a body block to place the image. Esc cancels.");
        },
      ],
      ["Size & spacing…", precise],
      [
        "Find in document",
        () => {
          im.scrollIntoView({ block: "center", behavior: "instant" });
          schedule();
        },
      ],
    ].forEach(([text, fn]) => {
      let b = make("button", text);
      b.type = "button";
      b.onclick = fn;
      b.disabled = !movable(im);
      b.dataset.mediaLocked = String(!movable(im));
      grid.append(b);
    });
    box.append(grid);
    let presets = make("div");
    presets.className = "media-presets";
    [25, 33, 50, 66, 75, 100].forEach((p) => {
      let b = make("button", p + "%");
      b.type = "button";
      b.title = "Set image width to " + p + "% of containing block";
      b.disabled = !movable(im);
      b.dataset.mediaLocked = String(!movable(im));
      b.onclick = () => preset(p);
      presets.append(b);
    });
    box.append(presets);
    if (!movable(im) && editable())
      box.append(make("p", "Movement is limited to figures with a single image to protect grouped content."));
    root.append(box);
    schedule();
  }
  function attachPlacement() {
    document.querySelectorAll("[data-media-ui]").forEach((n) => n.remove());
    overlay = make("div");
    overlay.dataset.mediaUi = "selection";
    overlay.id = "media-selection";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div data-media-bar role="toolbar" aria-label="Selected image placement"><button type="button" data-drag title="Drag image and caption between blocks">Move ↕</button><button type="button" data-up title="Move one block up">↑</button><button type="button" data-down title="Move one block down">↓</button><button type="button" data-to>Move to…</button><button type="button" data-size>Size…</button></div><span data-media-dimensions></span><button type="button" data-resize aria-label="Resize image proportionally" title="Drag to resize; Shift snaps to 10 px. Arrow keys resize by 10 px.">↘</button>';
    overlay.querySelector("[data-drag]").onpointerdown = (e) => beginGesture(e, "move");
    overlay.querySelector("[data-resize]").onpointerdown = (e) => beginGesture(e, "resize");
    overlay.querySelector("[data-up]").onclick = () => stepMove(-1);
    overlay.querySelector("[data-down]").onclick = () => stepMove(1);
    overlay.querySelector("[data-to]").onclick = moveDialog;
    overlay.querySelector("[data-size]").onclick = precise;
    overlay.addEventListener("keydown", (e) => {
      if (
        e.target.matches("[data-resize]") &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
        let im = image();
        mutate(im, () => {
          let oldWidth = im.offsetWidth;
          if (im.closest("figure")) im.closest("figure").style.width = "";
          im.style.width =
            Math.max(24, Math.round(oldWidth) + (["ArrowLeft", "ArrowUp"].includes(e.key) ? -10 : 10)) + "px";
          im.style.maxWidth = "100%";
          im.style.height = "auto";
        });
        position();
      } else if (e.altKey && ["ArrowUp", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        stepMove(e.key === "ArrowUp" ? -1 : 1);
      }
    });
    guide = make("div");
    guide.dataset.mediaUi = "guide";
    guide.id = "media-drop-guide";
    guide.hidden = true;
    ghost = make("div");
    ghost.dataset.mediaUi = "ghost";
    ghost.id = "media-resize-preview";
    ghost.hidden = true;
    document.body.append(overlay, guide, ghost);
    document.addEventListener("pointermove", pointerMove, { passive: false });
    document.addEventListener("pointerup", () => {
      if (gesture) endGesture();
    });
    document.addEventListener("pointercancel", () => endGesture(true));
    window.addEventListener("blur", () => endGesture(true));
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    a.area.addEventListener("load", schedule, true);
    a.area.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG") e.preventDefault();
    });
    a.area.addEventListener("click", (e) => {
      if (e.target.tagName === "IMG") schedule();
    });
    document.addEventListener(
      "click",
      (e) => {
        if (!moveMode || e.target.closest("[data-media-ui],#sideContent,dialog")) return;
        if (moveMode.epoch !== epoch || !movable(moveMode.im)) {
          endGesture(true);
          return;
        }
        let im = moveMode.im,
          dest = atPoint(e.clientX, e.clientY, im);
        if (dest) {
          e.preventDefault();
          e.stopImmediatePropagation();
          moveMode = false;
          showGuide(null);
          relocate(im, dest.n, dest.where);
        }
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Escape" && (gesture || moveMode)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          endGesture(true);
        } else if (gesture && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
    EditorSession.subscribe(() => {
      if ((gesture && gesture.epoch !== epoch) || (moveMode && (moveMode.epoch !== epoch || !editable())))
        endGesture(true);
      schedule();
    });
    new MutationObserver(schedule).observe(document.body, { childList: true });
    new MutationObserver(schedule).observe(a.area, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["style"],
    });
    schedule();
  }

  function render() {
    let root = document.getElementById("imageTools");
    if (!root) return;
    root.replaceChildren();
    let im = image(),
      all = [...a.area.querySelectorAll(".pagecontent img")];
    let summary = make("div");
    summary.className = "media-summary";
    summary.append(
      make("strong", "IMAGE STUDIO · " + all.length),
      make("p", "Local files are embedded. External image addresses may need internet."),
    );
    root.append(summary);
    let list = make("select");
    list.setAttribute("aria-label", "Select document image");
    let empty = make("option", "Choose an image");
    empty.value = "";
    list.append(empty);
    all.forEach((n, i) => {
      let o = make(
        "option",
        i +
          1 +
          ". " +
          (n.alt || "No alternative text") +
          (n.src.startsWith("data:") ? " · embedded" : " · external"),
      );
      o.value = i;
      list.append(o);
    });
    list.value = im ? String(all.indexOf(im)) : "";
    list.onchange = () => select(list.value === "" ? null : all[Number(list.value)] || null);
    root.append(list);
    if (!im) {
      root.append(make("p", "Select a document image to inspect its properties."));
      return;
    }
    let preview = make("img");
    preview.className = "media-preview";
    preview.src = im.src;
    preview.alt = "Selected image preview";
    root.append(preview);
    root.append(
      make(
        "p",
        (im.naturalWidth || "?") +
          " × " +
          (im.naturalHeight || "?") +
          " px · " +
          (im.src.startsWith("data:") ? "Embedded in HTML" : "External resource"),
      ),
    );
    placementPanel(root, im);
    let form = make("form");
    form.className = "media-properties";
    let fields = {};
    function field(key, label, value, type = "text", min, max) {
      let l = make("label", label),
        n = make("input");
      n.type = type;
      n.value = value;
      n.name = key;
      n.dataset.mediaField = key;
      if (min !== undefined) n.min = min;
      if (max !== undefined) n.max = max;
      if (type === "number") {
        n.required = true;
        n.step = "1";
      }
      l.append(n);
      form.append(l);
      fields[key] = n;
    }
    field("alt", "Alternative text", im.alt);
    field("width", "Width (px)", Math.max(1, Math.round(im.offsetWidth)), "number", 1, 2400);
    field("caption", "Caption", im.closest("figure")?.querySelector("figcaption")?.textContent || "");
    field("space", "Space around image (px)", parseInt(im.style.marginTop) || 0, "number", 0, 120);
    field("border", "Border width (px)", parseInt(im.style.borderWidth) || 0, "number", 0, 20);
    field("radius", "Corner radius (px)", parseInt(im.style.borderRadius) || 0, "number", 0, 200);
    let l = make("label", "Text wrapping"),
      wrapSelect = make("select");
    wrapSelect.dataset.mediaField = "wrap";
    [
      ["block", "Separate block"],
      ["inline", "Inline group (caption retained)"],
      ["left", "Text wraps on right"],
      ["right", "Text wraps on left"],
    ].forEach(([v, text]) => {
      let o = make("option", text);
      o.value = v;
      wrapSelect.append(o);
    });
    wrapSelect.value = im.dataset.wrap || "block";
    l.append(wrapSelect);
    form.append(l);
    let apply = make("button", "Apply image properties");
    apply.type = "submit";
    apply.className = "media-primary";
    form.append(apply);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      mutate(im, () => {
        im.alt = fields.alt.value;
        if (im.closest("figure")) im.closest("figure").style.width = "";
        im.style.width = fields.width.value + "px";
        im.style.maxWidth = "100%";
        im.style.height = "auto";
        im.style.margin = fields.space.value + "px";
        im.style.border = fields.border.value + "px solid #aab5c2";
        im.style.borderRadius = fields.radius.value + "px";
        let caption = fields.caption.value;
        if (caption || im.closest("figure")?.querySelector("figcaption")) {
          let f = ensureFigure(im),
            cap = f.querySelector("figcaption");
          if (caption) {
            if (!cap) {
              cap = make("figcaption");
              f.append(cap);
            }
            cap.textContent = caption;
          } else cap?.remove();
        }
        layout(im, wrapSelect.value);
      });
    };
    root.append(form);
    let actions = make("div");
    actions.className = "media-buttons";
    function button(text, fn) {
      let b = make("button", text);
      b.type = "button";
      b.onclick = fn;
      actions.append(b);
    }
    [
      ["Align left", "left"],
      ["Centre", "center"],
      ["Align right", "right"],
    ].forEach(([text, v]) => button(text, () => align(v)));
    button("Fit to text width", () =>
      mutate(im, () => {
        if (im.closest("figure")) im.closest("figure").style.width = "";
        im.style.width = "100%";
        im.style.maxWidth = "100%";
        im.style.height = "auto";
      }),
    );
    button("Replace image (keep formatting)", replace);
    button("Reset image layout", () =>
      mutate(im, () => {
        im.removeAttribute("style");
        delete im.dataset.wrap;
        let f = im.closest("figure");
        if (f)
          [
            "width",
            "float",
            "clear",
            "display",
            "maxWidth",
            "marginLeft",
            "marginRight",
            "verticalAlign",
            "textAlign",
          ].forEach((k) => (f.style[k] = ""));
      }),
    );
    button("Delete image", remove);
    root.append(actions);
    form.querySelectorAll("input,select,button").forEach((n) => (n.disabled = !editable()));
    actions.querySelectorAll("button").forEach((n) => (n.disabled = !editable()));
    queueMicrotask(() => EditorSession.refresh());
  }
  function attach(config) {
    if (a) return;
    a = config;
    attachPlacement();
    let input = document.getElementById("imageInput");
    input.onchange = () => {
      let files = [...input.files];
      let t = pending || ticket();
      pending = null;
      input.value = "";
      if (t && files.length) stage(files, t);
    };
    input.oncancel = () => (pending = null);
    let replaceInput = document.getElementById("media-replace-file");
    if (!replaceInput) {
      replaceInput = make("input");
      replaceInput.id = "media-replace-file";
      replaceInput.dataset.runtime = "";
      replaceInput.type = "file";
      replaceInput.accept = types.join(",");
      replaceInput.hidden = true;
      document.body.append(replaceInput);
    }
    document.addEventListener("selectionchange", remember);
    EditorSession.subscribe((s) => {
      if (s.pid !== lastPID) {
        epoch++;
        range = null;
        pending = null;
        lastPID = s.pid;
        a.select(null);
        if (s.panel === "images") render();
      }
    });
    document.addEventListener(
      "keydown",
      (e) => {
        if (
          document.querySelector("dialog.media-dialog[open]") &&
          (e.ctrlKey || e.metaKey) &&
          ["s", "z", "y", "p"].includes(e.key.toLowerCase())
        ) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  }
  return Object.freeze({
    attach,
    open,
    render,
    wrap,
    align,
    remove,
    replace,
    studio,
    stepMove,
    moveDialog,
    precise,
    preset,
    clear() {
      endGesture(true);
      range = null;
      pending = null;
      a?.select(null);
      schedule();
    },
    importFiles(files) {
      let t = ticket();
      if (t) return stage(files, t);
    },
    focusWidth() {
      a.side("images");
      document.querySelector("[data-media-field=width]")?.focus();
    },
  });
})();

EditorMedia.attach({
  area,
  capture,
  notify: toast,
  side: (name) => window.side?.(name),
  selected: () => selectedImage,
  select: (im) => { selectedImage = im; },
});
