/* SOPHIA · interface snapshot (safety net for refactors)
 *
 *   node sophia/tools/snapshot.cjs <built.html> <out.json>          take a snapshot
 *   node sophia/tools/snapshot.cjs --diff <before.json> <after.json> compare two snapshots
 *
 * WHY: when you MOVE code or CSS (split a module, reorder a stylesheet, rename a file)
 * the interface must look and behave exactly the same. This tool opens the file in
 * Chromium, walks through every panel, menu and studio window, and records for each
 * visible interface element: its position in the tree, size and place on screen,
 * visible text, and the computed style properties that decide the look.
 * Take a snapshot before your change and after it; --diff must report 0 differences
 * (or only the differences you intended).
 *
 * The document zone (#document) is NOT recorded except its outer box: this tool is for
 * the interface. The PID key is read from the page and never printed.
 * Exit code of --diff: 0 = identical, 1 = differences found. */
'use strict';
const fs = require('fs');
const path = require('path');

const PROPS = ['display', 'position', 'visibility', 'opacity', 'z-index', 'box-sizing',
  'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-top-width', 'border-top-style', 'border-top-color', 'border-bottom-width', 'border-bottom-color',
  'border-left-width', 'border-left-color', 'border-right-width', 'border-right-color', 'border-radius',
  'color', 'background-color', 'background-image', 'box-shadow', 'backdrop-filter', 'outline-style',
  'font-family', 'font-size', 'font-weight', 'font-style', 'line-height', 'letter-spacing', 'text-transform',
  'text-align', 'text-decoration-line', 'white-space', 'overflow-x', 'overflow-y',
  'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis', 'justify-content', 'align-items',
  'gap', 'grid-template-columns', 'grid-template-rows', 'width', 'height', 'min-width', 'max-width',
  'min-height', 'max-height', 'cursor', 'filter', 'transform'];

/* The states the snapshot visits. Each one starts from a fresh page. Keep the list in
   sync with the interface: a new panel or studio deserves a state here. */
const STATES = [
  ['read', async () => {}],
  ['read-main-mini', async (p) => p.click('.sx-appbar [data-cmd=mainMode]')],
  ['read-status', async (p) => p.click('.sx-chip-status')],
  ['read-view-panel', async (p) => p.click('.sx-appbar [data-cmd=viewPanel]')],
  ['read-omnibox', async (p) => p.click('.sx-omni-input')],
  ['read-omnibox-search', async (p) => { await p.click('.sx-omni-input'); await p.keyboard.type('the'); }],
  ['read-side-find', async (p) => p.evaluate(() => side('find'))],
  ['read-side-versions', async (p) => p.evaluate(() => side('versions'))],
  ['read-side-checks', async (p) => p.evaluate(() => side('checks'))],
  ['read-side-images', async (p) => p.evaluate(() => side('images'))],
  ['read-light-canvas', async (p) => p.click('.sx-appbar [data-cmd=canvas]')],
  ['edit-home', async (p) => edit(p)],
  ['edit-insert', async (p) => { await edit(p); await tab(p, 'Insert'); }],
  ['edit-layout', async (p) => { await edit(p); await tab(p, 'Layout'); }],
  ['edit-review', async (p) => { await edit(p); await tab(p, 'Review'); }],
  ['edit-mini', async (p) => { await edit(p); await p.click('.sx-appbar [data-cmd=ribbonMode]'); }],
  ['edit-table-tab', async (p) => { await edit(p); await caret(p, '#document .pagecontent table:not(.identity) td'); await p.waitForTimeout(250); await tab(p, 'Table'); }],
  ['edit-save-menu', async (p) => { await edit(p); await p.click('.sx-split-more'); }],
  ['edit-side-comments', async (p) => { await edit(p); await p.evaluate(() => side('comments')); }],
  ['edit-grid-picker', async (p) => { await edit(p); await tab(p, 'Insert'); await caret(p, '#document .pagecontent p'); await p.click('.sx-ribbon [data-cmd=insertTable]'); }],
  ['studio-print', async (p) => { await p.evaluate(() => PrintStudio42.open()); await p.waitForTimeout(900); }],
  ['studio-layout', async (p) => { await p.evaluate(() => LayoutStudio.open()); await p.waitForTimeout(700); }],
  ['studio-history', async (p) => { await p.evaluate(() => openHistoryStudio()); await p.waitForTimeout(500); }],
  ['studio-checks', async (p) => p.evaluate(() => DocumentReview.open())],
  ['studio-structure', async (p) => p.evaluate(() => BlockIdentity.open())],
  ['studio-library', async (p) => p.evaluate(() => ImageLibrary.open())],
  ['studio-compare', async (p) => p.evaluate(() => SOPHIA.compare.open())],
  ['studio-brief', async (p) => p.evaluate(() => SOPHIA.commands.run('brief'))],
  ['studio-shortcuts', async (p) => p.evaluate(() => SophiaFlow.openHelp())],
  ['studio-table', async (p) => { await edit(p); await caret(p, '#document .pagecontent table:not(.identity) td'); await p.evaluate(() => EditorCommands.tableAction('')); }],
  ['studio-paragraph', async (p) => { await edit(p); await caret(p, '#document .pagecontent p'); await p.evaluate(() => EditorCommands.paragraphDialog()); }],
  ['studio-proposal', async (p) => { await edit(p); await p.evaluate(() => SOPHIA.proposals.open()); }],
  ['studio-table-flow', async (p) => { await edit(p); await p.evaluate(() => SOPHIA.profile === 'quick-card' && TableFlow.open()); }],
  ['studio-save', async (p) => { await edit(p); await p.evaluate(() => EditorTransactions.run('snapshot edit', () => document.querySelector('#document .pagecontent p').append(' x'))); await p.waitForTimeout(300); await p.evaluate(() => exportPID('Draft')); await p.waitForTimeout(300); }],
  ['studio-language', async (p) => { await p.evaluate(() => SOPHIA.i18n.set('es')); await p.waitForTimeout(300); }],
  // narrower screens (responsive rules): [name, action, viewport width]
  ['read@390', async () => {}, 390],
  ['edit@390', async (p) => edit(p), 390],
  ['edit@820', async (p) => edit(p), 820],
  ['edit@1280', async (p) => edit(p), 1280],
  ['edit-es@1280', async (p) => { await edit(p); await p.evaluate(() => SOPHIA.i18n.set('es')); }, 1280],
  ['studio-history@820', async (p) => { await p.evaluate(() => openHistoryStudio()); await p.waitForTimeout(500); }, 820],
  ['studio-print@820', async (p) => { await p.evaluate(() => PrintStudio42.open()); await p.waitForTimeout(900); }, 820]
];

async function edit(p) {
  await p.evaluate(() => EditorSession.start(Object.keys(localPIDKeys)[0]));
  await p.waitForTimeout(300);
}
async function tab(p, name) {
  await p.evaluate((n) => [...document.querySelectorAll('.sx-ribbon .sx-tab')].find((t) => t.textContent.replace(' ✦', '') === n)?.click(), name);
  await p.waitForTimeout(150);
}
async function caret(p, sel) {
  await p.evaluate((s) => {
    const n = document.querySelector(s);
    if (!n) return;
    n.closest('[contenteditable=true]')?.focus();
    const r = document.createRange();
    r.selectNodeContents(n);
    r.collapse(true);
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    window.EditorCommands?.remember?.();
  }, sel);
}

/* Runs in the page: records every visible interface element (not the document zone). */
function collect(props) {
  const out = [];
  const roots = [...document.body.children].filter((n) => n.id !== 'document' && !['SCRIPT', 'STYLE'].includes(n.tagName));
  const docBox = document.getElementById('document').getBoundingClientRect();
  out.push({ path: '#document(box)', r: [docBox.x, docBox.y, docBox.width, docBox.height].map(Math.round) });
  const pathOf = (n) => {
    const parts = [];
    for (let x = n; x && x !== document.body; x = x.parentElement) {
      const cls = [...x.classList].filter((c) => !/^is-|^h\d+-anim/.test(c)).sort().join('.');
      const i = x.parentElement ? [...x.parentElement.children].filter((y) => y.tagName === x.tagName).indexOf(x) : 0;
      parts.unshift(x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + (cls ? '.' + cls : '') + '[' + i + ']');
    }
    return parts.join('>');
  };
  const visit = (n) => {
    if (n.nodeType !== 1 || n.id === 'document' || ['SCRIPT', 'STYLE', 'TEMPLATE'].includes(n.tagName)) return;
    const cs = getComputedStyle(n);
    if (cs.display === 'none') return;
    const r = n.getBoundingClientRect();
    const own = [...n.childNodes].filter((c) => c.nodeType === 3).map((c) => c.nodeValue).join('').replace(/\s+/g, ' ').trim();
    const rec = { path: pathOf(n), r: [r.x, r.y, r.width, r.height].map(Math.round), s: props.map((k) => cs.getPropertyValue(k)).join('|') };
    const norm = (v) => String(v).replace(/\bb-[a-z0-9]{10}\b/g, 'b-ID').replace(/\d/g, '#').slice(0, 120);
    if (own) rec.t = norm(own);
    for (const a of ['title', 'aria-label', 'placeholder', 'aria-pressed', 'aria-selected', 'aria-expanded', 'disabled', 'hidden']) {
      if (n.hasAttribute(a)) rec[a] = norm(n.getAttribute(a));
    }
    out.push(rec);
    for (const c of n.children) visit(c);
    if (n.tagName === 'IFRAME') return;
  };
  roots.forEach(visit);
  return out;
}

async function snapshot(file, outFile) {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const result = { file: path.basename(file), props: PROPS, states: {} };
  for (const [name, act, width] of STATES) {
    const ctx = await b.newContext({ viewport: { width: width || 1440, height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.clear(); } catch {} Date.prototype.getTimezoneOffset = () => 0; });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('dialog', (d) => d.dismiss());
    await p.goto('file://' + path.resolve(file));
    await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
    await p.waitForTimeout(800);
    await p.evaluate(() => document.querySelectorAll('.toast, .toast-host, [data-toast]').forEach((t) => t.remove()));
    try { await act(p); } catch (e) { errors.push('state action: ' + e.message); }
    await p.waitForTimeout(400);
    await p.evaluate(() => {
      document.querySelectorAll('.toast, .toast-host, [data-toast]').forEach((t) => t.remove());
      document.querySelectorAll('*').forEach((n) => { n.style.transition = 'none'; n.style.animation = 'none'; });
    });
    result.states[name] = { errors, nodes: await p.evaluate(collect, PROPS) };
    await ctx.close();
    process.stdout.write('.');
  }
  await b.close();
  fs.writeFileSync(outFile, JSON.stringify(result));
  console.log('\nsnapshot: ' + Object.keys(result.states).length + ' states → ' + outFile);
}

function diff(aFile, bFile) {
  const A = JSON.parse(fs.readFileSync(aFile, 'utf8')), B = JSON.parse(fs.readFileSync(bFile, 'utf8'));
  let total = 0;
  for (const state of Object.keys(A.states)) {
    const a = A.states[state], b = B.states[state];
    if (!b) { console.log('[' + state + '] missing in after'); total++; continue; }
    const mapA = new Map(a.nodes.map((n) => [n.path, n])), mapB = new Map(b.nodes.map((n) => [n.path, n]));
    const lines = [];
    for (const [k, n] of mapA) {
      const m = mapB.get(k);
      if (!m) { lines.push('  - removed ' + k); continue; }
      if (String(n.r) !== String(m.r)) lines.push('  ~ box ' + k + ' ' + n.r + ' → ' + m.r);
      if (n.s !== m.s) {
        const sa = n.s.split('|'), sb = m.s.split('|');
        const changed = A.props.map((p, i) => (sa[i] !== sb[i] ? p + ': ' + sa[i] + ' → ' + sb[i] : null)).filter(Boolean);
        lines.push('  ~ style ' + k + '\n      ' + changed.join('\n      '));
      }
      for (const f of ['t', 'title', 'aria-label', 'placeholder', 'aria-pressed', 'aria-selected', 'aria-expanded', 'disabled', 'hidden'])
        if ((n[f] || '') !== (m[f] || '')) lines.push('  ~ ' + f + ' ' + k + ': "' + (n[f] || '') + '" → "' + (m[f] || '') + '"');
    }
    for (const k of mapB.keys()) if (!mapA.has(k)) lines.push('  + added ' + k);
    const errs = (b.errors || []).filter((e) => !(a.errors || []).includes(e));
    for (const e of errs) lines.push('  ! new error: ' + e);
    if (lines.length) {
      total += lines.length;
      console.log('[' + state + '] ' + lines.length + ' difference(s)');
      console.log(lines.slice(0, 25).join('\n') + (lines.length > 25 ? '\n  … ' + (lines.length - 25) + ' more' : ''));
    }
  }
  console.log(total ? total + ' difference(s) in total' : 'IDENTICAL · ' + Object.keys(A.states).length + ' states');
  process.exit(total ? 1 : 0);
}

if (process.argv[2] === '--diff') diff(process.argv[3], process.argv[4]);
else if (process.argv.length >= 4) snapshot(process.argv[2], process.argv[3]).catch((e) => { console.error(e); process.exit(2); });
else { console.log('usage:\n  node sophia/tools/snapshot.cjs <built.html> <out.json>\n  node sophia/tools/snapshot.cjs --diff <before.json> <after.json>'); process.exit(2); }
