/* ============================================================================
 * SOPHIA · 62-docx                                     layer: FEATURE
 * ----------------------------------------------------------------------------
 * PURPOSE  Word interchange, fully offline: import a .docx (text, headings, lists, tables,
 *          PNG/JPEG images) after the current block in one transaction; export a simple
 *          .docx review copy.
 * OWNS     SOPHIA.docx.
 * EXPORTS  SOPHIA.docx {importFile, exportFile}
 * USES     SOPHIA.{blocks, sanitize}, EditorTransactions, area, data, toast,
 *          DecompressionStream (browser)
 * RULES    Word styles, fonts and colours are not kept on purpose (the SOPHIA page style
 *          applies). The export is a reading copy, not a controlled version.
 * TESTS    tests/functional.cjs (.docx round trip)
 * ========================================================================== */
SOPHIA.docx = (() => {
  'use strict';
  const U = SOPHIA.util;

  /* ---------- ZIP reading ---------- */
  async function inflateRaw(bytes) {
    const ds = new DecompressionStream('deflate-raw');
    const out = new Response(new Blob([bytes]).stream().pipeThrough(ds));
    return new Uint8Array(await out.arrayBuffer());
  }
  function readZip(buf) {
    const dv = new DataView(buf), u8 = new Uint8Array(buf);
    let eocd = -1;
    for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    if (eocd < 0) throw Error('Not a .docx file (ZIP directory not found).');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = new Map(), dec = new TextDecoder();
    for (let n = 0; n < count; n++) {
      if (dv.getUint32(p, true) !== 0x02014b50) throw Error('Damaged .docx (central directory).');
      const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 20, true);
      const nameLen = dv.getUint16(p + 28, true), extraLen = dv.getUint16(p + 30, true), commentLen = dv.getUint16(p + 32, true);
      const local = dv.getUint32(p + 42, true);
      const name = dec.decode(u8.subarray(p + 46, p + 46 + nameLen));
      files.set(name, { method, size, local });
      p += 46 + nameLen + extraLen + commentLen;
    }
    return {
      has: (name) => files.has(name),
      async bytes(name) {
        const f = files.get(name);
        if (!f) return null;
        const start = f.local + 30 + dv.getUint16(f.local + 26, true) + dv.getUint16(f.local + 28, true);
        const raw = u8.subarray(start, start + f.size);
        if (f.method === 0) return raw;
        if (f.method === 8) return inflateRaw(raw);
        throw Error('Unsupported compression in ' + name + '.');
      },
      async text(name) { const b = await this.bytes(name); return b ? new TextDecoder().decode(b) : null; }
    };
  }

  /* ---------- .docx → HTML ---------- */
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const kids = (n, local) => [...n.childNodes].filter((c) => c.nodeType === 1 && c.localName === local);
  const attr = (n, name) => n?.getAttributeNS(W, name) ?? n?.getAttribute('w:' + name) ?? null;
  const first = (n, local) => n && [...n.getElementsByTagNameNS(W, local)][0];
  function toBase64(u8) {
    let s = '';
    for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000));
    return btoa(s);
  }
  async function convert(buf) {
    const zip = readZip(buf);
    const docXML = await zip.text('word/document.xml');
    if (!docXML) throw Error('word/document.xml is missing.');
    const doc = xml(docXML);
    const rels = new Map();
    const relXML = await zip.text('word/_rels/document.xml.rels');
    if (relXML) for (const r of xml(relXML).getElementsByTagName('Relationship')) rels.set(r.getAttribute('Id'), r.getAttribute('Target'));
    const numFmt = new Map(); // numId → 'bullet' | 'decimal'
    const numXML = await zip.text('word/numbering.xml');
    if (numXML) {
      const nd = xml(numXML), abs = new Map();
      for (const a of nd.getElementsByTagNameNS(W, 'abstractNum')) {
        const lvl0 = kids(a, 'lvl').find((l) => attr(l, 'ilvl') === '0') || kids(a, 'lvl')[0];
        abs.set(attr(a, 'abstractNumId'), attr(first(lvl0, 'numFmt'), 'val') === 'bullet' ? 'ul' : 'ol');
      }
      for (const n of nd.getElementsByTagNameNS(W, 'num')) numFmt.set(attr(n, 'numId'), abs.get(attr(first(n, 'abstractNumId'), 'val')) || 'ul');
    }
    const images = [];
    async function imageFor(drawing) {
      const blip = drawing.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/main', 'blip')[0];
      const id = blip?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
      const target = id && rels.get(id);
      if (!target) return null;
      const path = 'word/' + target.replace(/^\/?word\//, '').replace(/^\.\//, '');
      const ext = (path.split('.').pop() || '').toLowerCase();
      const mime = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' }[ext];
      if (!mime) return null;
      const bytes = await zip.bytes(path);
      if (!bytes) return null;
      const img = document.createElement('img');
      img.src = 'data:' + mime + ';base64,' + toBase64(bytes);
      img.alt = drawing.getElementsByTagNameNS('http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing', 'docPr')[0]?.getAttribute('descr') || '';
      images.push(img);
      return img;
    }
    async function runs(p, into) {
      for (const node of p.childNodes) {
        if (node.nodeType !== 1) continue;
        if (node.localName === 'hyperlink') {
          const href = rels.get(node.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id'));
          const a = document.createElement('a');
          if (href && /^(https?:|mailto:)/i.test(href)) a.href = href;
          await runs(node, a);
          into.append(a);
          continue;
        }
        if (node.localName !== 'r') continue;
        const pr = first(node, 'rPr');
        let target = into;
        const wrap = (tag) => { const e = document.createElement(tag); target.append(e); target = e; };
        if (pr && first(pr, 'b') && attr(first(pr, 'b'), 'val') !== '0') wrap('b');
        if (pr && first(pr, 'i') && attr(first(pr, 'i'), 'val') !== '0') wrap('i');
        if (pr && first(pr, 'u') && attr(first(pr, 'u'), 'val') !== 'none') wrap('u');
        const va = pr && attr(first(pr, 'vertAlign'), 'val');
        if (va === 'superscript') wrap('sup');
        if (va === 'subscript') wrap('sub');
        for (const c of node.childNodes) {
          if (c.localName === 't') target.append(c.textContent);
          else if (c.localName === 'tab') target.append(' ');
          else if (c.localName === 'br') target.append(document.createElement('br'));
          else if (c.localName === 'drawing') { const im = await imageFor(c); if (im) target.append(im); }
        }
      }
    }
    const out = document.createDocumentFragment();
    let list = null;
    async function paragraph(p, container) {
      const pPr = first(p, 'pPr');
      const style = (pPr && attr(first(pPr, 'pStyle'), 'val')) || '';
      const numId = pPr && first(pPr, 'numPr') ? attr(first(first(pPr, 'numPr'), 'numId'), 'val') : null;
      const h = /^(Heading|Titre|Überschrift|Titulo|Título)\s*([1-3])$/i.exec(style.replace(/([a-z])(\d)$/i, '$1 $2'));
      let el;
      if (numId && numId !== '0' && container === out) {
        const kind = numFmt.get(numId) || 'ul';
        if (!list || list.tagName.toLowerCase() !== kind) { list = document.createElement(kind); out.append(list); }
        el = document.createElement('li');
        list.append(el);
      } else {
        if (container === out) list = null;
        el = document.createElement(h ? 'h' + (Number(h[2]) + 1) : /^Title$/i.test(style) ? 'h2' : 'p');
        container.append(el);
      }
      await runs(p, el);
      if (h && el.tagName !== 'LI') { const t = el.firstChild; if (t?.nodeType === 3) t.nodeValue = t.nodeValue.replace(/^\s*\d+(\.\d+)*\.?\s+/, ''); }
      if (!el.textContent.trim() && !el.querySelector('img')) el.remove();
    }
    async function table(tbl) {
      list = null;
      const t = document.createElement('table'), tb = document.createElement('tbody');
      t.append(tb);
      kids(tbl, 'tr').forEach((tr, i) => tr.__i = i);
      for (const tr of kids(tbl, 'tr')) {
        const row = document.createElement('tr');
        const header = !!(first(tr, 'trPr') && first(first(tr, 'trPr'), 'tblHeader'));
        for (const tc of kids(tr, 'tc')) {
          const cell = document.createElement(header ? 'th' : 'td');
          const span = first(first(tc, 'tcPr'), 'gridSpan');
          if (span) cell.colSpan = Number(attr(span, 'val')) || 1;
          for (const p of kids(tc, 'p')) await paragraph(p, cell);
          if (cell.children.length === 1 && cell.firstElementChild.tagName === 'P') cell.replaceChildren(...cell.firstElementChild.childNodes);
          row.append(cell);
        }
        tb.append(row);
      }
      out.append(t);
    }
    const body = first(doc.documentElement, 'body');
    for (const n of body.childNodes) {
      if (n.localName === 'p') await paragraph(n, out);
      else if (n.localName === 'tbl') await table(n);
    }
    return { fragment: out, images: images.length };
  }
  function importFile() {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    if (!('DecompressionStream' in window)) { toast('This browser cannot read .docx files offline. Use Microsoft Edge or Chrome.'); return; }
    const anchor = SOPHIA.blocks.currentTop() || area.querySelector('.pagecontent > :last-child');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const { fragment, images } = await convert(await file.arrayBuffer());
        const holder = document.createElement('div');
        holder.append(fragment);
        const clean = SOPHIA.sanitize.blocks(holder.innerHTML);
        if (!clean || !clean.childNodes.length) { toast('No text was found in that document.'); return; }
        const blocks = clean.children.length;
        const ok = EditorTransactions.run('Import ' + file.name, () => {
          if (anchor && area.contains(anchor)) anchor.after(clean);
          else area.querySelector('.pagecontent').append(clean);
        });
        if (ok) toast('Imported ' + blocks + ' block(s)' + (images ? ' and ' + images + ' image(s)' : '') + ' from ' + file.name + '. Ctrl+Z undoes it.');
      } catch (e) {
        toast('Could not import this .docx: ' + e.message, { tone: 'error', ms: 6000 });
      }
    };
    input.click();
  }

  /* ---------- HTML → .docx ---------- */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(u8) { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
  function zip(entries) {
    const enc = new TextEncoder(), parts = [], central = [];
    let offset = 0;
    for (const [name, content] of entries) {
      const data = typeof content === 'string' ? enc.encode(content) : content;
      const nameB = enc.encode(name), crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30));
      h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(8, 0, true);
      h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, nameB.length, true);
      parts.push(new Uint8Array(h.buffer), nameB, data);
      const c = new DataView(new ArrayBuffer(46));
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
      c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, nameB.length, true); c.setUint32(42, offset, true);
      central.push(new Uint8Array(c.buffer), nameB);
      offset += 30 + nameB.length + data.length;
    }
    const size = central.reduce((s, p) => s + p.length, 0);
    const e = new DataView(new ArrayBuffer(22));
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true); e.setUint32(12, size, true); e.setUint32(16, offset, true);
    return new Blob([...parts, ...central, new Uint8Array(e.buffer)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }
  const X = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]);
  function exportFile() {
    const media = [];
    const runsOf = (node, fmt = {}) => {
      let out = '';
      for (const c of node.childNodes) {
        if (c.nodeType === 3) {
          if (!c.nodeValue) continue;
          const pr = (fmt.b ? '<w:b/>' : '') + (fmt.i ? '<w:i/>' : '') + (fmt.u ? '<w:u w:val="single"/>' : '') +
            (fmt.sup ? '<w:vertAlign w:val="superscript"/>' : fmt.sub ? '<w:vertAlign w:val="subscript"/>' : '') +
            (fmt.tbc ? '<w:highlight w:val="yellow"/>' : '');
          out += '<w:r>' + (pr ? '<w:rPr>' + pr + '</w:rPr>' : '') + '<w:t xml:space="preserve">' + X(c.nodeValue.replace(/\s+/g, ' ')) + '</w:t></w:r>';
        } else if (c.nodeType === 1) {
          const t = c.tagName;
          if (t === 'BR') out += '<w:r><w:br/></w:r>';
          else if (t === 'IMG') out += imageRun(c);
          else out += runsOf(c, { ...fmt, b: fmt.b || t === 'B' || t === 'STRONG', i: fmt.i || t === 'I' || t === 'EM', u: fmt.u || t === 'U', sup: fmt.sup || t === 'SUP', sub: fmt.sub || t === 'SUB', tbc: fmt.tbc || c.classList.contains('tbc') });
        }
      }
      return out;
    };
    function imageRun(img) {
      const m = /^data:image\/(png|jpeg);base64,(.+)$/.exec(img.getAttribute('src') || '');
      if (!m) return '<w:r><w:t>[image]</w:t></w:r>';
      const bin = atob(m[2]), u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const n = media.length + 1, ext = m[1] === 'png' ? 'png' : 'jpeg';
      media.push({ name: 'image' + n + '.' + ext, u8, id: 'rIdImg' + n });
      const live = [...area.querySelectorAll('img')].find((i) => i.getAttribute('src') === img.getAttribute('src')) || img;
      const nw = live.naturalWidth || 400, nh = live.naturalHeight || 300;
      const wpx = Math.min(live.offsetWidth || nw, 600), hpx = Math.round(wpx * (nh / nw));
      const cx = wpx * 9525, cy = hpx * 9525;
      return '<w:r><w:drawing><wp:inline><wp:extent cx="' + cx + '" cy="' + cy + '"/><wp:docPr id="' + n + '" name="Image ' + n + '" descr="' + X(img.alt || '') + '"/>' +
        '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">' +
        '<pic:nvPicPr><pic:cNvPr id="' + n + '" name="image' + n + '"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdImg' + n + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>' +
        '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    }
    const p = (inner, style, extra = '') => '<w:p>' + (style || extra ? '<w:pPr>' + (style ? '<w:pStyle w:val="' + style + '"/>' : '') + extra + '</w:pPr>' : '') + inner + '</w:p>';
    const cellXML = (c) => '<w:tc><w:tcPr>' + (c.colSpan > 1 ? '<w:gridSpan w:val="' + c.colSpan + '"/>' : '') +
      (c.tagName === 'TH' ? '<w:shd w:val="clear" w:fill="E7E7E7"/>' : '') + '</w:tcPr>' + (blocksOf(c, true) || p('')) + '</w:tc>';
    const tableXML = (t) => '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map((s) => '<w:' +
      s + ' w:val="single" w:sz="4" w:color="999999"/>').join('') + '</w:tblBorders></w:tblPr>' +
      [...t.rows].map((r) => '<w:tr>' + [...r.cells].map(cellXML).join('') + '</w:tr>').join('') + '</w:tbl>';
    function blocksOf(root, inCell) {
      let out = '';
      const inlineOnly = ![...root.children].some((c) => /^(P|H[1-6]|UL|OL|TABLE|ASIDE|BLOCKQUOTE|FIGURE|DIV|SECTION|NAV)$/.test(c.tagName));
      if (inlineOnly) return root.textContent.trim() || root.querySelector('img') ? p(runsOf(root)) : '';
      for (const n of root.children) {
        const t = n.tagName;
        if (/^H[2-4]$/.test(t)) out += p((n.dataset.num ? '<w:r><w:t xml:space="preserve">' + X(n.dataset.num) + ' </w:t></w:r>' : '') + runsOf(n), 'Heading' + (Number(t[1]) - 1));
        else if (t === 'H1') out += p(runsOf(n), 'Title');
        else if (t === 'UL' || t === 'OL') [...n.children].forEach((li, i) => { out += p('<w:r><w:t xml:space="preserve">' +
          (t === 'OL' ? i + 1 + '. ' : '• ') + '</w:t></w:r>' + runsOf(li), null, '<w:ind w:left="567" w:hanging="283"/>'); });
        else if (t === 'TABLE') out += tableXML(n) + (inCell ? '' : p(''));
        else if (t === 'ASIDE') out += p(runsOf(n), null, '<w:pBdr><w:left w:val="single" w:sz="18" w:color="C49832"/></w:pBdr><w:shd w:val="clear" w:fill="FFF8E8"/>');
        else if (t === 'BLOCKQUOTE') out += p(runsOf(n), null, '<w:ind w:left="567"/>');
        else if (t === 'HR') out += p('', null, '<w:pBdr><w:bottom w:val="single" w:sz="6" w:color="8899AA"/></w:pBdr>');
        else if (t === 'NAV') out += [...n.querySelectorAll('li')].map((li) => p('<w:r><w:t xml:space="preserve">' +
          X(li.textContent) + '</w:t></w:r>', null, li.className === 'toc-l2' ? '<w:ind w:left="400"/>' : '')).join('');
        else if (/^(DIV|SECTION|FIGURE)$/.test(t)) out += blocksOf(n, inCell);
        else if (t === 'IMG') out += p(imageRun(n));
        else out += p(runsOf(n));
      }
      return out;
    }
    const clone = SOPHIA.persist.contentClone();
    let body = '';
    const title = SOPHIA.meta.title();
    body += p('<w:r><w:t xml:space="preserve">' + X(title) + '</w:t></w:r>', 'Title');
    const ident = clone.querySelector('.identity');
    if (ident) body += tableXML(ident) + p('');
    body += p('<w:r><w:rPr><w:i/></w:rPr><w:t xml:space="preserve">' + X(data.id + ' · V' + data.documentVersion +
      ' · ' + data.status + ' · exported ' + U.dateStamp() + ' from SOPHIA ' + SOPHIA.engine + ' — review copy, not the controlled document.') + '</w:t></w:r>');
    clone.querySelectorAll('.pagecontent').forEach((pc) => (body += blocksOf(pc, false)));
    const NS = 'xmlns:w="' + W + '" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"';
    const documentXML = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS +
      '><w:body>' + body + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1418" w:bottom="1134" w:left="1418" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>';
    const font = '<w:rFonts w:ascii="DM Sans" w:hAnsi="DM Sans" w:cs="Arial"/>';
    const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="' + W +
      '"><w:docDefaults><w:rPrDefault><w:rPr>' + font + '<w:sz w:val="21"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>' +
      '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
      '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="36"/></w:rPr></w:style>' +
      [1, 2, 3].map((n) => '<w:style w:type="paragraph" w:styleId="Heading' + n + '"><w:name w:val="heading ' +
        n + '"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="' +
        (360 - n * 60) + '"/><w:outlineLvl w:val="' + (n - 1) + '"/></w:pPr><w:rPr><w:b/><w:sz w:val="' + (30 - n * 3) +
        '"/></w:rPr></w:style>').join('') + '</w:styles>';
    const rels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
      media.map((m) => '<Relationship Id="' + m.id + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/' + m.name + '"/>').join('') + '</Relationships>';
    const types = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>' +
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>';
    const root = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>';
    const blob = zip([['[Content_Types].xml', types], ['_rels/.rels', root], ['word/document.xml', documentXML], ['word/styles.xml', styles], ['word/_rels/document.xml.rels', rels], ...media.map((m) => ['word/media/' + m.name, m.u8])]);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = data.id + '_V' + data.documentVersion + '_review-copy.docx';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Word review copy downloaded. Changes made in Word do not come back automatically: re-import the text you need.');
  }
  return { importFile, exportFile, convert, readZip };
})();
