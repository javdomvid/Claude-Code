/* ============================================================================
 * SOPHIA · 64-table-tools                              layer: DOCUMENT
 * ----------------------------------------------------------------------------
 * PURPOSE  Quick table operations for the contextual "Table ✦" tab and the insert-table
 *          size grid (owner decision V2): rows, columns, delete, header row, equal widths,
 *          shading from the document palette, decision table (Quick Card).
 * OWNS     SOPHIA.tables; the size-grid picker (style: styles/ui/64-table-tools.css).
 * EXPORTS  SOPHIA.tables {here, row, column, deleteRow, deleteColumn, deleteTable,
 *          toggleHeader, equalColumns, shade, insert, decisionTable, picker, SHADES}
 * USES     SOPHIA.blocks, EditorCommands, EditorTransactions, area, toast
 * RULES    Simple tables only (merged cells → Table Studio). Shading only from SHADES
 *          (header grey · attention amber · confirmed green · none).
 * TESTS    tests/functional.cjs (Table tab, grid picker)
 * ========================================================================== */
SOPHIA.tables = (() => {
  'use strict';
  const U = SOPHIA.util;
  const SHADES = { header: '#e7e7e7', attention: '#fff3d6', confirmed: '#e6f3ea' };
  function here() {
    const s = getSelection();
    const n = s.rangeCount ? U.nodeOf(s.anchorNode) : null;
    const cell = n?.closest?.('td,th');
    const table = cell?.closest('table');
    if (!table || !area.contains(table) || table.matches('.identity') || table.closest('.identity')) return null;
    return { cell, table, row: cell.parentElement };
  }
  const simple = (t) => ![...t.querySelectorAll('td,th')].some((c) => c.colSpan > 1 || c.rowSpan > 1);
  function guard(needSimple = true) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return null; }
    const h = here();
    if (!h) { toast('Place the cursor in a table cell first.'); return null; }
    if (needSimple && !simple(h.table)) { toast('This table has merged cells. Use Table Studio for structural changes.'); return null; }
    return h;
  }
  function caretTo(cell) {
    if (!cell) return;
    const r = document.createRange();
    r.selectNodeContents(cell);
    r.collapse(true);
    cell.closest('[contenteditable=true]')?.focus({ preventScroll: true });
    getSelection().removeAllRanges();
    getSelection().addRange(r);
  }
  function row(after) {
    const h = guard(); if (!h) return;
    let target = null;
    EditorTransactions.run(after ? 'Insert row below' : 'Insert row above', () => {
      const tr = document.createElement('tr');
      [...h.row.cells].forEach((c) => { const n = document.createElement(h.row.rowIndex === 0 && c.tagName === 'TH' && !after ? 'th' : 'td'); n.append(document.createElement('br')); tr.append(n); });
      if (after) h.row.after(tr); else h.row.before(tr);
      target = tr.cells[h.cell.cellIndex];
    });
    caretTo(target);
  }
  function column(after) {
    const h = guard(); if (!h) return;
    const i = h.cell.cellIndex;
    let target = null;
    EditorTransactions.run(after ? 'Insert column right' : 'Insert column left', () => {
      [...h.table.rows].forEach((tr) => {
        const ref = tr.cells[i];
        const c = document.createElement(ref?.tagName === 'TH' ? 'th' : 'td');
        c.append(document.createElement('br'));
        if (!ref) tr.append(c); else if (after) ref.after(c); else ref.before(c);
        if (tr === h.row) target = c;
      });
      h.table.querySelectorAll('colgroup').forEach((g) => g.remove());
    });
    caretTo(target);
  }
  function deleteRow() {
    const h = guard(); if (!h) return;
    if (h.table.rows.length <= 1) { deleteTable(); return; }
    const next = h.row.nextElementSibling || h.row.previousElementSibling;
    EditorTransactions.run('Delete row', () => h.row.remove());
    caretTo(next?.cells[Math.min(h.cell.cellIndex, (next?.cells.length || 1) - 1)]);
  }
  function deleteColumn() {
    const h = guard(); if (!h) return;
    if (h.row.cells.length <= 1) { deleteTable(); return; }
    const i = h.cell.cellIndex;
    EditorTransactions.run('Delete column', () => {
      [...h.table.rows].forEach((tr) => tr.cells[i]?.remove());
      h.table.querySelectorAll('colgroup').forEach((g) => g.remove());
    });
    caretTo(h.row.cells[Math.max(0, i - 1)]);
  }
  function deleteTable() {
    const h = guard(false); if (!h) return;
    const after = h.table.nextElementSibling;
    EditorTransactions.run('Delete table', () => h.table.remove());
    if (after) caretTo(after);
  }
  function toggleHeader() {
    const h = guard(); if (!h) return;
    const first = h.table.rows[0];
    const isHeader = [...first.cells].every((c) => c.tagName === 'TH');
    EditorTransactions.run(isHeader ? 'Header row off' : 'Header row on', () => {
      [...first.cells].forEach((c) => {
        const n = document.createElement(isHeader ? 'td' : 'th');
        n.append(...c.childNodes);
        for (const a of c.attributes) n.setAttribute(a.name, a.value);
        c.replaceWith(n);
      });
    });
  }
  function equalColumns() {
    const h = guard(); if (!h) return;
    const n = h.row.cells.length;
    EditorTransactions.run('Equal column widths', () => {
      h.table.querySelectorAll('colgroup').forEach((g) => g.remove());
      [...h.table.querySelectorAll('td,th')].forEach((c) => (c.style.width = ''));
      const g = document.createElement('colgroup');
      for (let i = 0; i < n; i++) { const c = document.createElement('col'); c.style.width = (100 / n).toFixed(2) + '%'; g.append(c); }
      h.table.prepend(g);
    });
  }
  function shade(kind) {
    const h = guard(false); if (!h) return;
    const s = getSelection();
    const cells = [...h.table.querySelectorAll('td,th')].filter((c) => s.rangeCount && !s.getRangeAt(0).collapsed ? s.getRangeAt(0).intersectsNode(c) : c === h.cell);
    EditorTransactions.run(kind ? 'Shade cells' : 'Clear cell shading', () => cells.forEach((c) => (c.style.backgroundColor = kind ? SHADES[kind] : '')));
  }
  /* insert a table after the current block (grid picker / decision table) */
  function insert(rows, cols, header = true, labels = null) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    const top = SOPHIA.blocks.currentTop() || area.querySelector('.pagecontent > :last-child');
    if (!top) { toast('Place the cursor in the document body first.'); return; }
    let first = null;
    EditorTransactions.run('Insert table ' + rows + '×' + cols, () => {
      const t = document.createElement('table'), tb = document.createElement('tbody');
      for (let r = 0; r < rows; r++) {
        const tr = document.createElement('tr');
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement(header && r === 0 ? 'th' : 'td');
          if (labels && r === 0 && labels[c]) cell.textContent = labels[c]; else cell.append(document.createElement('br'));
          tr.append(cell);
        }
        tb.append(tr);
      }
      t.append(tb);
      top.after(t);
      first = t.rows[header && labels ? Math.min(1, rows - 1) : 0].cells[0];
    });
    caretTo(first);
  }
  const decisionTable = () => insert(3, 2, true, ['Situation', 'Next action']);
  /* grid picker popover (anchored to the Insert ▸ Table button) */
  function picker(anchor) {
    if (!U.isEditing()) { toast(SOPHIA.strings.startEditingFirst); return; }
    document.querySelector('.sx-gridpick')?.remove();
    const pop = U.el('div', 'sx-menu sx-gridpick');
    pop.dataset.runtime = '';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Insert table');
    const label = U.el('p', 'sx-gridpick-label', 'Insert table');
    const grid = U.el('div', 'sx-gridpick-grid');
    const R = 8, C = 8;
    let hr = 0, hc = 0;
    for (let r = 1; r <= R; r++) for (let c = 1; c <= C; c++) {
      const b = U.el('button', 'sx-gridpick-cell');
      b.type = 'button';
      b.dataset.r = r; b.dataset.c = c;
      b.setAttribute('aria-label', r + ' rows × ' + c + ' columns');
      b.onmouseenter = b.onfocus = () => { hr = r; hc = c; grid.querySelectorAll('button').forEach((x) => x.classList.toggle('is-on', +x.dataset.r <= r && +x.dataset.c <= c)); label.textContent = r +
        ' × ' + c + (head.checked ? ' · header row' : ''); };
      b.onclick = () => { pop.remove(); insert(r, c, head.checked); };
      grid.append(b);
    }
    const headL = U.el('label', 'sx-find-opt');
    const head = document.createElement('input');
    head.type = 'checkbox';
    head.checked = true;
    headL.append(head, document.createTextNode(' First row is a header'));
    const custom = U.el('button', 'sx-btn sx-btn-text', 'Custom size…');
    custom.type = 'button';
    custom.onclick = () => { pop.remove(); EditorCommands.insertTable(); };
    pop.append(label, grid, headL, custom);
    document.body.append(pop);
    const r = anchor.getBoundingClientRect();
    pop.style.top = Math.round(r.bottom + 6) + 'px';
    pop.style.left = Math.round(Math.max(8, Math.min(window.innerWidth - pop.offsetWidth - 8, r.left))) + 'px';
    grid.querySelector('button').focus();
    const close = (e) => { if (!pop.contains(e.target) && e.target !== anchor) { pop.remove(); document.removeEventListener('pointerdown', close, true); } };
    document.addEventListener('pointerdown', close, true);
    pop.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { pop.remove(); anchor.focus(); return; }
      const m = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[e.key];
      if (!m) return;
      e.preventDefault();
      const nr = Math.min(R, Math.max(1, (hr || 1) + m[0])), nc = Math.min(C, Math.max(1, (hc || 1) + m[1]));
      grid.querySelector('[data-r="' + nr + '"][data-c="' + nc + '"]').focus();
    });
  }
  return { here, row, column, deleteRow, deleteColumn, deleteTable, toggleHeader, equalColumns, shade, insert, decisionTable, picker, SHADES };
})();
