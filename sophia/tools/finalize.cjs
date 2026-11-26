/* SOPHIA V77 · finalize — writes an already-upgraded file.
 *   node sophia/tools/finalize.cjs <built.html> <final.html>
 * Opens the output of build.py in headless Chromium, lets the editor run its own
 * start-up migration (block IDs, automatic numbers, header), records that migration
 * as a revision ("Migration", version unchanged) and saves with SOPHIA's own
 * serializer — exactly what a person gets after "Save draft", minus the draft. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [input, output] = process.argv.slice(2).map((p) => p && path.resolve(p));
if (!input || !output) { console.error('usage: node sophia/tools/finalize.cjs <built.html> <final.html>'); process.exit(2); }
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p.goto('file://' + input);
  await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
  await p.waitForTimeout(1200);
  const res = await p.evaluate(() => {
    const r = JSON.parse(JSON.stringify(data));
    const m = SOPHIA.migration.pending;
    if (m) { r.revisions.push(m); r.events.push({ type: 'migration', date: m.date, engine: SOPHIA.engine, reason: m.reason }); }
    window.enrichHistory?.(r);
    return { html: SOPHIA.persist.serializeFile(r), migrated: !!m, reason: m?.reason || '' };
  });
  if (errors.length) { console.error('errors while finalizing:', errors); process.exit(1); }
  fs.writeFileSync(output, res.html);
  const p2 = await b.newPage();
  const e2 = [];
  p2.on('pageerror', (e) => e2.push(e.message));
  await p2.goto('file://' + output);
  await p2.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
  await p2.waitForTimeout(1200);
  const check = await p2.evaluate(() => ({ pending: !!SOPHIA.migration.pending, dirty: EditorSession.get().dirty, format: data.format, version: data.documentVersion, revisions: data.revisions.length }));
  await b.close();
  const okay = !e2.length && !check.pending && !check.dirty && check.format === 'sophia/77';
  console.log((okay ? 'OK ' : 'FAIL ') + output + ' · ' + Math.round(fs.statSync(output).size / 1024) + ' KB · ' + JSON.stringify(check) + (res.migrated ? '\n   ' + res.reason : ''));
  if (e2.length) console.log(e2);
  process.exit(okay ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
