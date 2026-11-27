/* SOPHIA · performance check for LONG documents (Playwright + Chromium).
 *
 *   python3 sophia/samples/make_long.py long-src.html --repeat 14
 *   python3 sophia/build.py long-src.html long.html
 *   node sophia/tests/performance.cjs long.html
 *
 * Measures what a person feels in a 40+ page document with images: opening, A4 pagination,
 * typing (and the re-flow when typing pauses), deleting a block (half-empty pages are
 * refilled), the checks, the side panel and preparing a save. Budgets are generous so that
 * slower computers and CI pass; the numbers are printed so changes can be compared.
 * Exit 1 if a budget is exceeded or something breaks. Never prints PID keys. */
'use strict';
const path = require('path');
const file = path.resolve(process.argv[2] || '');
const BUDGET = { ready: 9000, paginate: 4000, reflowAfterTyping: 4000, refill: 4000, checks: 600, outline: 600, serialize: 2500, keystroke: 60 };

(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const t0 = Date.now();
  await p.goto('file://' + file);
  await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true', null, { timeout: 30000 });
  const ready = Date.now() - t0;
  /* wait until the A4 pages have settled (font load → pagination) */
  let pagesNow = 0, stable = 0;
  while (stable < 4) {
    await p.waitForTimeout(250);
    const n = await p.evaluate(() => document.querySelectorAll('#document .sheet').length);
    stable = n === pagesNow ? stable + 1 : 0;
    pagesNow = n;
  }
  const m = await p.evaluate(() => {
    const time = (fn) => { const s = performance.now(); const r = fn(); return [Math.round(performance.now() - s), r]; };
    const [paginate] = time(() => LayoutEngine.reflow(false));
    const pages = document.querySelectorAll('#document .sheet').length;
    const [checks, found] = time(() => SOPHIA.checklist.collect().length + SOPHIA.writing.check().length);
    const [canonical] = time(() => SOPHIA.canonical().length);
    const [serialize, size] = time(() => SOPHIA.persist.serializeFile(JSON.parse(JSON.stringify(data))).length);
    return { paginate, pages, checks, found, canonical, serialize, size: Math.round(size / 1024), images: document.querySelectorAll('#document img').length, blocks: SOPHIA.ids.blocks().length };
  });
  /* side panel outline */
  const outline = await p.evaluate(() => { const s = performance.now(); side('outline'); return Math.round(performance.now() - s); });
  /* typing on page ~10 */
  await p.evaluate(() => EditorSession.start(Object.keys(localPIDKeys)[0]));
  await p.waitForTimeout(400);
  const target = await p.evaluate(() => {
    const sheets = document.querySelectorAll('#document .sheet');
    const sheet = sheets[Math.min(9, sheets.length - 1)];
    const para = sheet.querySelector('.pagecontent > p, .pagecontent li');
    para.scrollIntoView({ block: 'center' });
    const r = document.createRange(); r.selectNodeContents(para); r.collapse(false);
    para.closest('[contenteditable=true]').focus();
    getSelection().removeAllRanges(); getSelection().addRange(r);
    return para.dataset.blockId;
  });
  const text = ' The technician checks the delivery note against the order and reports any missing items in the portal.'.repeat(14);
  const k0 = Date.now();
  await p.keyboard.type(text, { delay: 0 });
  const keystroke = (Date.now() - k0) / text.length;
  const overflowAfterTyping = await p.evaluate(() => LayoutEngine.overflowing());
  const r0 = Date.now();
  await p.waitForFunction(() => !LayoutEngine.overflowing(), null, { timeout: 20000, polling: 100 });
  const reflowAfterTyping = Date.now() - r0;
  const caretKept = await p.evaluate((id) => { const s = getSelection(); return !!(s.rangeCount && s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentElement).closest('[data-block-id="' + id + '"]')); }, target);
  /* delete a large block on page ~5 → the gap must be refilled */
  const del = await p.evaluate(() => {
    const sheets = document.querySelectorAll('#document .sheet');
    const sheet = sheets[Math.min(4, sheets.length - 2)];
    const big = [...sheet.querySelectorAll('.pagecontent > figure, .pagecontent > table, .pagecontent > ol')].sort((x, y) => y.offsetHeight - x.offsetHeight)[0];
    EditorTransactions.run('perf delete', () => big.remove());
    return { underfullAfterDelete: LayoutEngine.underfull() };
  });
  const f0 = Date.now();
  await p.waitForFunction(() => !LayoutEngine.underfull() && !LayoutEngine.overflowing(), null, { timeout: 20000, polling: 100 });
  const refill = Date.now() - f0;
  await b.close();

  const res = { ready, ...m, outline, keystroke: Math.round(keystroke * 10) / 10, overflowAfterTyping, reflowAfterTyping, caretKept, ...del, refill };
  let fails = 0;
  const line = (label, value, budget, unit = 'ms') => {
    const ok = budget === undefined || value <= budget;
    if (!ok) fails++;
    console.log((ok ? 'PASS ' : 'FAIL ') + label.padEnd(34) + String(value).padStart(7) + ' ' + unit + (budget !== undefined ? '   (budget ' + budget + ' ' + unit + ')' : ''));
  };
  console.log('Long document: ' + res.pages + ' A4 pages · ' + res.blocks + ' blocks · ' + res.images + ' images · saved size ' + res.size + ' KB');
  line('open → ready', res.ready, BUDGET.ready);
  line('full A4 pagination', res.paginate, BUDGET.paginate);
  line('checks + writing checks', res.checks, BUDGET.checks);
  line('outline side panel', res.outline, BUDGET.outline);
  line('typing: time per character', res.keystroke, BUDGET.keystroke);
  line('re-flow after typing pause', res.reflowAfterTyping, BUDGET.reflowAfterTyping);
  line('refill after deleting a block', res.refill, BUDGET.refill);
  line('prepare the saved file', res.serialize, BUDGET.serialize);
  line('canonical content (dirty check)', res.canonical);
  if (!res.caretKept) { fails++; console.log('FAIL caret kept in the same block after the re-flow'); } else console.log('PASS caret kept in the same block after the re-flow');
  if (!res.overflowAfterTyping) { fails++; console.log('FAIL the typed text should have overflowed its page (test did not exercise the re-flow)'); }
  if (!res.underfullAfterDelete) { fails++; console.log('FAIL deleting the largest block should leave a half-empty page (test did not exercise the refill)'); }
  if (errors.length) { fails++; console.log('FAIL page errors · ' + JSON.stringify(errors)); }
  console.log(fails ? fails + ' FAIL' : 'ALL PASS · performance within budget');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
