/* ============================================================================
 * SOPHIA · 00-core                                     layer: CORE
 * ----------------------------------------------------------------------------
 * PURPOSE  The foundation every module stands on: the SOPHIA namespace, interface strings,
 *          small DOM utilities, the two sanitizers, the event bus, toasts, the image asset
 *          codec, the record (#record → data) and the document-version rules.
 * OWNS     SOPHIA (namespace), SOPHIA.{engine, profile, strings, util, sanitize, bus, ask,
 *          assets, record, versions}; the legacy globals data, area, toast, normalizeBody.
 * EXPORTS  SOPHIA, SOPHIA.engine, SOPHIA.profile, SOPHIA.strings, SOPHIA.util, SOPHIA.sanitize
 *          {html, blocks}, SOPHIA.bus {on, emit}, SOPHIA.ask {panel, leaveFocus},
 *          SOPHIA.assets, SOPHIA.record, SOPHIA.versions {nextPublish, nextMajor, label, …},
 *          data (the record object), area (main#document), toast(text, opts), normalizeBody()
 * USES     nothing (loads first)
 * EMITS    ask:panel, ask:leave-focus (through SOPHIA.ask)
 * RULES    - Nothing here may depend on a later module.
 *          - SOPHIA.ask is how lower layers request something from the interface
 *            (79-shell answers); never call SOPHIA.ui from CORE/SAFETY/DOCUMENT/FEATURE.
 *          - Version rules (owner decision D): Save draft keeps the number; Publish & save
 *            +0.01; Big Validation → next major .00. Change them only here.
 * NOTE     LEGACY CONTRACT: reused modules expect the top-level globals data, area, toast(),
 *          normalizeBody(); keep their names.
 * TESTS    tests/functional.cjs (versions, sanitizer via proposals and paste)
 * ========================================================================== */
'use strict';

const SOPHIA = (window.SOPHIA = window.SOPHIA || {});
SOPHIA.engine = 'V78';
SOPHIA.profile =
  document.documentElement.dataset.profile ||
  (document.querySelector('#document .qc-hero') ? 'quick-card' : 'sop');
document.documentElement.dataset.profile = SOPHIA.profile;

/* ---------- strings (English UI; one place to translate later) ---------- */
SOPHIA.strings = {
  profileLabel: { sop: 'SOP', 'quick-card': 'Quick Card' },
  readOnly: 'Read only',
  editing: 'Editing',
  unsaved: 'Unsaved changes',
  noChanges: 'No changes since last save',
  startEditingFirst: 'Start editing with your PID first.',
  finishDialogFirst: 'Finish or cancel the current dialog first.'
};

/* ---------- small utilities ---------- */
SOPHIA.util = {
  el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  },
  nodeOf: (n) => (n && n.nodeType === 1 ? n : n ? n.parentElement : null),
  /** Cheap, stable, non-cryptographic hash (cyrb53). Used for asset keys and diffs, never for security. */
  hash53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
  },
  /** JSON for embedding in <script type="application/json">: '<' and friends escaped. */
  scriptJSON(value) {
    return JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  },
  escapeHTML: (s) =>
    String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]),
  dateStamp(d = new Date()) {
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  },
  isEditing: () => !!window.EditorSession?.get().pid && !document.body.classList.contains('focusmode'),
  dialogOpen: () => !!document.querySelector('dialog[open]')
};

/* ---------- sanitizer for HTML that did not come from this page's own DOM ----------
 * Used for local recovery (localStorage is shared by every file:// page), upgrades
 * from older files and agent proposals. Parses inertly, drops active content,
 * event handlers and non-http(s)/mailto links; keeps document markup otherwise. */
SOPHIA.sanitize = (() => {
  const DROP = 'script,style,iframe,frame,object,embed,link,meta,base,form,input,button,select,textarea,template,noscript,svg,math,video,audio,source,track,canvas';
  function clean(root) {
    root.querySelectorAll(DROP).forEach((n) => n.remove());
    for (const n of root.querySelectorAll('*')) {
      for (const a of [...n.attributes]) {
        const name = a.name.toLowerCase(), v = a.value.trim();
        if (name.startsWith('on') || name === 'srcdoc' || name === 'srcset' || name === 'formaction' || name === 'ping') n.removeAttribute(a.name);
        else if ((name === 'href' || name === 'xlink:href') && !/^(https?:|mailto:|#)/i.test(v)) n.removeAttribute(a.name);
        else if (name === 'src' && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v)) n.removeAttribute(a.name);
        else if (name === 'style' && /(url\s*\(|expression\s*\(|@import|javascript:)/i.test(v)) n.removeAttribute(a.name);
      }
    }
    return root;
  }
  return {
    /** Returns sanitized markup (string). */
    html(markup) {
      const doc = new DOMParser().parseFromString('<!doctype html><body>' + String(markup || ''), 'text/html');
      return clean(doc.body).innerHTML;
    },
    element: clean,
    blocks
  };
  /** Document-grammar sanitizer (agent proposals, Word import). Keeps exactly the
   *  markup allowed by #sophia-agent-brief §3 and unwraps everything else. */
  function blocks(markup) {
    const doc = new DOMParser().parseFromString('<!doctype html><body>' + String(markup || ''), 'text/html');
    const TAGS = /^(H1|H2|H3|H4|P|UL|OL|LI|TABLE|THEAD|TBODY|TR|TH|TD|ASIDE|BLOCKQUOTE|HR|BR|B|I|U|S|SUP|SUB|A|SPAN|DIV|SECTION|FIGURE|FIGCAPTION|IMG)$/;
    const MAP = { STRONG: 'B', EM: 'I', STRIKE: 'S', DEL: 'S', H5: 'H4', H6: 'H4', TFOOT: 'TBODY' };
    const CLASSES = { ASIDE: ['warning'], SPAN: ['tbc'], DIV: ['cards'], SECTION: ['pending'], P: ['source-note'], H2: ['nonum'], H3: ['nonum'], H4: ['nonum'] };
    const DROP = /^(SCRIPT|STYLE|IFRAME|FRAME|OBJECT|EMBED|LINK|META|BASE|FORM|INPUT|BUTTON|SELECT|TEXTAREA|TEMPLATE|NOSCRIPT|SVG|MATH|VIDEO|AUDIO|CANVAS|NAV|MAIN|HEADER|FOOTER)$/;
    function copy(node, parent) {
      if (node.nodeType === 3) { parent.append(document.createTextNode(node.nodeValue)); return; }
      if (node.nodeType !== 1) return;
      let tag = node.tagName.toUpperCase();
      tag = MAP[tag] || tag;
      if (DROP.test(tag)) return;
      const cls = (CLASSES[tag] || []).filter((c) => node.classList.contains(c));
      if (!TAGS.test(tag) || ((tag === 'SPAN' || tag === 'DIV' || tag === 'ASIDE') && !cls.length && tag !== 'ASIDE')) {
        node.childNodes.forEach((c) => copy(c, parent));
        return;
      }
      if (tag === 'H1') tag = 'H2';
      const el = document.createElement(tag.toLowerCase());
      if (tag === 'ASIDE') el.className = 'warning';
      else if (cls.length) el.className = cls.join(' ');
      if (tag === 'SPAN') el.title = 'To Be Confirmed';
      if (tag === 'A') {
        const href = (node.getAttribute('href') || '').trim();
        if (!/^(https?:|mailto:)/i.test(href)) { node.childNodes.forEach((c) => copy(c, parent)); return; }
        el.href = href;
        el.rel = 'noopener noreferrer';
      }
      if (tag === 'IMG') {
        const src = node.getAttribute('src') || '';
        if (!/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/i.test(src)) return;
        el.src = src;
        el.alt = node.getAttribute('alt') || '';
      }
      if (tag === 'TD' || tag === 'TH') for (const a of ['colspan', 'rowspan']) { const v = +node.getAttribute(a); if (v > 1 && v <= 50) el.setAttribute(a, String(v)); }
      if (node.getAttribute('data-layout-before') === 'page') el.dataset.layoutBefore = 'page';
      node.childNodes.forEach((c) => copy(c, el));
      parent.append(el);
    }
    const out = document.createDocumentFragment();
    doc.body.childNodes.forEach((c) => copy(c, out));
    /* loose inline text at top level → paragraphs */
    let run = null;
    for (const n of [...out.childNodes]) {
      const inline = n.nodeType === 3 || /^(B|I|U|S|SUP|SUB|A|SPAN|BR|IMG)$/.test(n.tagName);
      if (inline && (n.nodeType !== 3 || n.nodeValue.trim() || run)) { if (!run) { run = document.createElement('p'); n.before(run); } run.append(n); }
      else { if (n.nodeType === 3) n.remove(); run = null; }
    }
    return out;
  }
})();

/* ---------- event bus (UI listens; engine announces) ---------- */
SOPHIA.bus = (() => {
  const map = new Map();
  return {
    on(type, fn) {
      if (!map.has(type)) map.set(type, new Set());
      map.get(type).add(fn);
      return () => map.get(type).delete(fn);
    },
    emit(type, detail) {
      (map.get(type) || []).forEach((fn) => {
        try { fn(detail); } catch (e) { console.error('SOPHIA bus', type, e); }
      });
    }
  };
})();
/* Requests from lower layers to the interface. Core, document and feature modules never
   call the shell (SOPHIA.ui) directly: they ASK, and 79-shell answers. This keeps the
   layers independent (docs/ARCHITECTURE.md §2). */
SOPHIA.ask = {
  /** Show a side panel: 'outline' | 'find' | 'comments' | 'versions' | 'images' | 'checks'. */
  panel: (name) => SOPHIA.bus.emit('ask:panel', name),
  /** Leave focus reading (e.g. before a dialog that needs the interface). */
  leaveFocus: () => SOPHIA.bus.emit('ask:leave-focus')
};

/* ---------- toasts (aria-live region, never printed, never saved) ---------- */
function toast(text, opts = {}) {
  let region = document.getElementById('sophia-toasts');
  if (!region) {
    region = SOPHIA.util.el('div', 'sophia-toasts');
    region.id = 'sophia-toasts';
    region.dataset.runtime = '';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  const n = SOPHIA.util.el('div', 'toast' + (opts.tone ? ' toast-' + opts.tone : ''), text);
  region.append(n);
  setTimeout(() => n.remove(), opts.ms || 3200);
  while (region.children.length > 3) region.firstElementChild.remove();
}

/* ---------- normalizeBody (legacy contract): wrap stray inline runs in <p> ---------- */
function normalizeBody(root) {
  root.querySelectorAll('.pagecontent').forEach((c) => {
    function wrap(container) {
      let run = [];
      function flush() {
        if (!run.length) return;
        const p = document.createElement('p');
        run[0].before(p);
        run.forEach((n) => p.append(n));
        run = [];
      }
      for (const n of [...container.childNodes]) {
        const inline =
          n.nodeType === 3 ||
          (n.nodeType === 1 && !/^(P|DIV|H[1-6]|UL|OL|LI|TABLE|FIGURE|ASIDE|BLOCKQUOTE|SECTION|HR|NAV)$/.test(n.tagName));
        if (inline) {
          if (n.nodeType !== 3 || n.textContent.trim() || run.length) run.push(n);
        } else {
          flush();
          if (n.nodeType === 1 && n.tagName === 'DIV') wrap(n);
        }
      }
      flush();
    }
    wrap(c);
  });
  return root;
}

/* ---------- assets codec (each embedded image stored once in the file) ----------
 * On disk: document images are <img data-asset="KEY"> and revision snapshots use
 * the token "sophia-asset:KEY" inside src="". record.assets = { KEY: "data:image/…" }.
 * In memory: everything is expanded back to data: URIs, so the rest of the engine
 * never sees the codec. */
SOPHIA.assets = {
  TOKEN: 'sophia-asset:',
  keyFor(dataURI) {
    return 'a' + SOPHIA.util.hash53(dataURI) + dataURI.length.toString(36);
  },
  expandRecord(record) {
    const store = record.assets || {};
    for (const r of record.revisions || []) {
      if (typeof r.snapshot === 'string' && r.snapshot.includes(this.TOKEN)) {
        r.snapshot = r.snapshot.replace(/sophia-asset:([a-z0-9]+)/g, (m, k) => store[k] || m);
      }
    }
    return record;
  },
  /** Returns a deep-copied record whose snapshots reference `assets` instead of embedding data URIs. */
  packRecord(record, extraDataURIs = []) {
    const out = JSON.parse(JSON.stringify(record));
    const store = {};
    const put = (uri) => {
      const k = this.keyFor(uri);
      store[k] = uri;
      return k;
    };
    for (const uri of extraDataURIs) put(uri);
    for (const r of out.revisions || []) {
      if (typeof r.snapshot !== 'string') continue;
      r.snapshot = r.snapshot.replace(/data:image\/[a-z+.-]+;base64,[A-Za-z0-9+/=]+/g, (uri) => this.TOKEN + put(uri));
    }
    out.assets = store;
    return out;
  },
  resolveDocumentImages(root = document) {
    const store = (SOPHIA.record && SOPHIA.record.assets) || {};
    root.querySelectorAll('img[data-asset]').forEach((img) => {
      const uri = store[img.dataset.asset];
      if (uri && img.getAttribute('src') !== uri) img.setAttribute('src', uri);
    });
  }
};

/* ---------- record (legacy contract: global `data`) ---------- */
const data = SOPHIA.assets.expandRecord(JSON.parse(document.getElementById('record').textContent));
data.revisions = Array.isArray(data.revisions) ? data.revisions : [];
data.events = Array.isArray(data.events) ? data.events : [];
data.comments = Array.isArray(data.comments) ? data.comments : [];
data.status = data.status || 'Draft';
data.documentVersion = String(data.documentVersion || '1');
SOPHIA.record = data;

/* ---------- document area (legacy contract: global `area`) ---------- */
const area = document.getElementById('document');
SOPHIA.assets.resolveDocumentImages(area);

/* ---------- document versions (owner rule, 2026-11-26) ----------
 * - Save draft: version unchanged; revision labelled "Draft n · based on Vx".
 * - Publish & save: always +0.01 (1 → 1.01 → 1.02 … 1.99 → 1.100).
 * - Big Validation: next major with ".00" (2.28 → 3.00). */
SOPHIA.versions = {
  parse(v) {
    const [a, b] = String(v || '1').replace(/^v/i, '').split('.');
    return { major: Number(a) || 1, minor: b === undefined ? 0 : Number(b) || 0 };
  },
  format(major, minor) {
    return major + '.' + String(minor).padStart(2, '0');
  },
  nextPublish(v) {
    const { major, minor } = this.parse(v);
    return this.format(major, minor + 1);
  },
  nextMajor(v) {
    return this.format(this.parse(v).major + 1, 0);
  },
  /** Number of draft saves recorded since the last non-draft revision. */
  draftsSinceRelease(record = data) {
    let n = 0;
    for (let i = record.revisions.length - 1; i >= 0; i--) {
      if (record.revisions[i].status === 'Draft' && record.revisions[i].draft) n++;
      else break;
    }
    return n;
  },
  label(rev) {
    if (!rev) return '';
    if (rev.status === 'Draft' && rev.draft) return 'Draft ' + rev.draft + ' · based on V' + rev.version;
    return 'V' + rev.version + (rev.status ? ' · ' + rev.status : '');
  }
};
