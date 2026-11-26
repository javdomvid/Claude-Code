/* SOPHIA V77 · functional test (Playwright + Chromium, offline).
 *   node sophia/tests/v77-functional.cjs <file.html> [outDir]
 * Opens the file, edits with the first PID of the local registry (the key is read
 * from the page and never printed), and checks: interface, ribbon Full/Mini/Hide,
 * undo, comments, TBC, block moves, TOC, numbering, proposals, Save draft →
 * verified receipt → reopen, Publish (+0.01), Big Validation (next major),
 * publish without changes, .docx round trip, print shell and PDF. Exit 1 on FAIL. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), os = require('os');
const file = path.resolve(process.argv[2] || '');
const out = process.argv[3] || fs.mkdtempSync(path.join(os.tmpdir(), 'sophia-v77-'));
let fails = 0;
const ok = (cond, label, extra) => { console.log((cond ? 'PASS ' : 'FAIL ') + label + (extra !== undefined ? ' · ' + JSON.stringify(extra) : '')); if (!cond) fails++; };

async function open(ctx, f) {
  const p = await ctx.newPage();
  p.errors = [];
  p.on('pageerror', (e) => p.errors.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') p.errors.push(m.text()); });
  p.on('dialog', (d) => { p.errors.push('native dialog ' + d.message()); d.dismiss(); });
  await p.goto('file://' + f);
  await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
  await p.waitForTimeout(900);
  return p;
}
async function startEditing(p) {
  await p.click('.sx-appbar [data-cmd=edit]');
  const pid = await p.evaluate(() => Object.keys(localPIDKeys)[0]);
  await p.fill('#pidInput', pid.toLowerCase());
  await p.evaluate(() => { document.getElementById('pidKey').value = localPIDKeys[Object.keys(localPIDKeys)[0]]; });
  await p.click('dialog.legacy-modal .primary');
  await p.waitForTimeout(250);
  return pid;
}
async function save(p, mode, reason) {
  await p.evaluate((m) => exportPID(m), mode);
  await p.waitForTimeout(250);
  if (await p.$('#chkOk')) { await p.check('#chkOk'); await p.click('dialog.legacy-modal .primary'); await p.waitForTimeout(250); }
  const summary = await p.evaluate(() => document.getElementById('v2summary')?.textContent);
  await p.fill('#v2reason', reason);
  if (await p.$('#v2key')) await p.evaluate(() => { document.getElementById('v2key').value = localPIDKeys[EditorSession.get().pid]; });
  if (await p.$('#v2phrase')) await p.fill('#v2phrase', 'BIG VALIDATION');
  await p.check('#v2confirm');
  await p.click('dialog.legacy-modal .primary');
  await p.waitForSelector('dialog.save-receipt');
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('dialog.save-receipt [data-download]')]);
  const name = dl.suggestedFilename(), target = path.join(out, name);
  await dl.saveAs(target);
  await p.setInputFiles('dialog.save-receipt [data-verify]', target);
  await p.waitForFunction(() => !document.querySelector('dialog.save-receipt [data-confirm]').disabled);
  await p.click('dialog.save-receipt [data-confirm]');
  await p.waitForTimeout(300);
  return { target, name, summary };
}

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  let p = await open(ctx, file);
  const s0 = await p.evaluate(() => ({ engine: SOPHIA.engine, profile: SOPHIA.profile, dirty: EditorSession.get().dirty, ids: document.querySelectorAll('#document [data-block-id]').length, appbar: !!document.querySelector('.sx-appbar'), cmds: SOPHIA.commands.all().length, ribbonHidden: document.querySelector('.sx-ribbon').hidden, sheets: document.querySelectorAll('#document .sheet').length }));
  ok(s0.engine === 'V77' && s0.appbar, 'V77 interface mounted', s0);
  ok(!s0.dirty, 'not dirty on open');
  ok(s0.ribbonHidden, 'edit panel hidden while reading');
  ok(p.errors.length === 0, 'no errors on load', p.errors);
  const imgs = await p.evaluate(() => [...document.querySelectorAll('#document img')].map((i) => ({ ok: i.complete && i.naturalWidth > 0, asset: i.dataset.asset || null })));
  ok(imgs.length > 0 && imgs.every((i) => i.ok), 'all document images load', imgs);

  const pid = await startEditing(p);
  const r1 = await p.evaluate(() => {
    const ribbon = document.querySelector('.sx-ribbon');
    const tabs = [...ribbon.querySelectorAll('.sx-tab')].map((t) => t.textContent);
    const ids = new Set();
    for (const t of tabs) { [...ribbon.querySelectorAll('.sx-tab')].find((x) => x.textContent === t).click(); ribbon.querySelectorAll('[data-cmd]').forEach((b) => ids.add(b.dataset.cmd)); }
    return { visible: !ribbon.hidden, mode: ribbon.dataset.mode, tabs, fullTools: ids.size, editable: document.querySelectorAll('#document [contenteditable=true]').length };
  });
  ok(r1.visible && r1.mode === 'full' && r1.tabs.length === 4, 'edit panel Full with 4 tabs', r1);
  await p.click('.sx-appbar [data-cmd=ribbonMode]');
  const r2 = await p.evaluate(() => { const r = document.querySelector('.sx-ribbon'); return { mode: r.dataset.mode, tools: new Set([...r.querySelectorAll('[data-cmd]')].map((b) => b.dataset.cmd)).size, height: r.offsetHeight }; });
  ok(r2.mode === 'mini' && r2.tools >= r1.fullTools, 'Mini keeps every tool (compact)', { mini: r2.tools, full: r1.fullTools, height: r2.height });
  await p.screenshot({ path: path.join(out, 'ribbon-mini.png') });
  await p.click('.sx-appbar [data-cmd=ribbonMode]');
  ok(await p.evaluate(() => document.querySelector('.sx-ribbon').hidden), 'Hide hides the edit panel');
  await p.click('.sx-appbar [data-cmd=ribbonMode]');
  ok(await p.evaluate(() => document.querySelector('.sx-ribbon').dataset.mode === 'full'), 'cycle returns to Full');
  await p.screenshot({ path: path.join(out, 'ribbon-full.png') });

  // typing, undo, redo
  const para = p.locator('#document .pagecontent > p').first();
  await para.click();
  await p.keyboard.press('End');
  await p.keyboard.type(' EDIT-TEST');
  await p.waitForTimeout(900);
  const t1 = await p.evaluate(() => ({ dirty: EditorSession.get().dirty, saveEnabled: !document.querySelector('.sx-appbar [data-cmd=saveDraft]').disabled }));
  ok(t1.dirty && t1.saveEnabled, 'typing makes the document dirty and enables Save draft', t1);
  await p.keyboard.press('Control+z');
  await p.waitForTimeout(200);
  const undone = await p.evaluate(() => !document.querySelector('#document').textContent.includes('EDIT-TEST'));
  await p.keyboard.press('Control+y');
  await p.waitForTimeout(200);
  const redone = await p.evaluate(() => document.querySelector('#document').textContent.includes('EDIT-TEST'));
  ok(undone && redone, 'undo / redo', { undone, redone });

  // comment + TBC
  await para.click();
  await p.keyboard.press('Control+Alt+m');
  await p.fill('#cmtText', 'Please confirm this sentence.');
  await p.click('dialog.legacy-modal .primary');
  const c1 = await p.evaluate(() => ({ n: data.comments.length, panel: document.querySelectorAll('.sx-side .sx-comment').length, badge: document.querySelector('[data-panel=comments] .sx-badge')?.textContent }));
  ok(c1.n === 1 && c1.panel === 1, 'comment added and listed in the side panel', c1);
  await p.evaluate(() => { const p = document.querySelector('#document .pagecontent > p'); const t = [...p.childNodes].find((n) => n.nodeType === 3 && n.nodeValue.trim().length > 6); const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 5); getSelection().removeAllRanges(); getSelection().addRange(r); });
  await p.keyboard.press('Control+Shift+t');
  ok(await p.evaluate(() => document.querySelectorAll('#document .pagecontent .tbc').length === 1), 'TBC mark added');

  // move block, TOC, numbering
  const mv = await p.evaluate(() => {
    const blocks = () => [...document.querySelectorAll('#document .pagecontent')].flatMap((pc) => [...pc.children]).map((n) => n.dataset.blockId);
    const target = document.querySelectorAll('#document .pagecontent > p')[1];
    const id = target.dataset.blockId, before = blocks().indexOf(id);
    const r = document.createRange(); r.selectNodeContents(target); r.collapse(true); getSelection().removeAllRanges(); getSelection().addRange(r);
    SOPHIA.blocks.move(1);
    const afterDown = blocks().indexOf(id);
    SOPHIA.blocks.move(-1);
    return { before, afterDown, back: blocks().indexOf(id) };
  });
  ok(mv.afterDown === mv.before + 1 && mv.back === mv.before, 'move block down/up', mv);
  const toc = await p.evaluate(() => { const h = document.querySelector('#document .pagecontent h2'); const r = document.createRange(); r.selectNodeContents(h); r.collapse(false); getSelection().removeAllRanges(); getSelection().addRange(r); SOPHIA.blocks.insertToc(); const nav = document.querySelector('nav[data-sophia-toc]'); return { items: nav?.querySelectorAll('li').length, first: nav?.querySelector('li')?.textContent, nums: [...document.querySelectorAll('#document [data-num]')].length }; });
  ok(toc.items > 0 && toc.nums > 0, 'table of contents + automatic numbers', toc);

  // proposal (agent)
  const prop = await p.evaluate(() => {
    const target = document.querySelectorAll('#document .pagecontent > p')[2];
    return { schema: 'sophia.proposal/1', proposalId: 'TEST-1', documentId: data.id, baseDocumentVersion: data.documentVersion, author: 'test-agent', intent: 'Clarify one sentence',
      operations: [{ op: 'replaceBlock', targetBlockId: target.dataset.blockId, expectedText: target.textContent, html: '<p>PROPOSED REPLACEMENT TEXT.</p>', reason: 'clarity' },
        { op: 'insertAfter', targetBlockId: target.dataset.blockId, html: '<p>Inserted by proposal.</p>' },
        { op: 'replaceBlock', targetBlockId: 'b-doesnotexist', html: '<p>x</p>' }] };
  });
  await p.evaluate(() => SOPHIA.proposals.open());
  await p.fill('#propText', JSON.stringify(prop));
  await p.dispatchEvent('#propText', 'change');
  const pv = await p.evaluate(() => ({ items: document.querySelectorAll('.sx-proposal li').length, invalid: document.querySelectorAll('.sx-proposal li.is-invalid').length }));
  await p.click('dialog.legacy-modal .primary');
  const pa = await p.evaluate((id) => ({ text: document.querySelector('[data-block-id="' + id + '"]')?.textContent, inserted: document.querySelector('#document').textContent.includes('Inserted by proposal.'), event: data.events.at(-1)?.type }), prop.operations[0].targetBlockId);
  ok(pv.items === 3 && pv.invalid === 1 && pa.text === 'PROPOSED REPLACEMENT TEXT.' && pa.inserted && pa.event === 'proposal-applied', 'agent proposal: preview, keep block ID, apply, record event', { pv, pa });

  // Save draft (version unchanged)
  const d1 = await save(p, 'Draft', 'Automated test · draft');
  const s1 = await p.evaluate(() => ({ v: data.documentVersion, status: data.status, revs: data.revisions.map((r) => r.mode + '@' + r.version + (r.draft ? '#d' + r.draft : '')), pid: EditorSession.get().pid, format: data.format }));
  ok(s1.v === '1' && !s1.pid && s1.revs.at(-1).startsWith('Save draft@1#d1'), 'Save draft keeps the version and records Draft 1', { s1, file: d1.name });
  ok(p.errors.length === 0, 'no errors during editing session', p.errors);

  // the saved file: structure
  const html = fs.readFileSync(d1.target, 'utf8');
  const zone = html.slice(html.indexOf('<main id="document"'), html.indexOf('</main>'));
  ok(/data-sophia="V77"/.test(html) && /"format":"sophia\/77"/.test(html), 'saved file is sophia/77');
  ok(!/<img[^>]+src="data:/.test(zone) && /data-asset="/.test(zone), 'images stored once (data-asset in the zone)');
  ok(zone.split('\n').length > 20, 'document zone is one block per line', zone.split('\n').length);
  const head = html.slice(0, html.indexOf('</head>'));
  ok(head.lastIndexOf('<style') === head.indexOf('<style data-sophia="print"') && !/<style/.test(html.slice(html.indexOf('</head>')).replace(/<script[\s\S]*?<\/script>/g, '')), 'print shell is the last <style>');
  ok(!/data-runtime|sx-appbar|contenteditable/.test(zone), 'no interface or runtime markup saved in the zone');

  // reopen, publish (+0.01), Big Validation (next major), publish without changes (+0.01)
  p = await open(ctx, d1.target);
  const s2 = await p.evaluate(() => ({ pending: !!SOPHIA.migration.pending, dirty: EditorSession.get().dirty, comments: data.comments.length, tbc: document.querySelectorAll('#document .tbc').length, toc: !!document.querySelector('nav[data-sophia-toc]'), dup: (() => { const m = {}; document.querySelectorAll('#document [data-block-id]').forEach((n) => (m[n.dataset.blockId] = (m[n.dataset.blockId] || 0) + 1)); return Object.values(m).filter((v) => v > 1).length; })() }));
  const imgs2 = await p.evaluate(() => [...document.querySelectorAll('#document img')].every((i) => i.complete && i.naturalWidth > 0));
  ok(imgs2, 'images load in the reopened copy (assets resolved)');
  ok(!s2.pending && !s2.dirty && s2.comments === 1 && s2.tbc === 1 && s2.toc && s2.dup === 0, 'reopened copy: clean, comments/TBC/TOC kept, unique IDs', s2);
  await startEditing(p);
  await p.locator('#document .pagecontent > p').first().click();
  await p.keyboard.press('End');
  await p.keyboard.type(' PUBLISH-TEST');
  await p.waitForTimeout(800);
  const pub = await save(p, 'Published', 'Automated test · publish');
  const v1 = await p.evaluate(() => data.documentVersion);
  ok(v1 === '1.01' && /V1 → V1\.01/.test(pub.summary), 'Publish & save adds 0.01', { v1, summary: pub.summary });
  await startEditing(p);
  const big = await save(p, 'Big Validation', 'Automated test · big validation');
  const v2 = await p.evaluate(() => ({ v: data.documentVersion, cell: SOPHIA.meta.get('Document Version'), trace: document.querySelector('[data-trace] [data-validation]')?.textContent }));
  ok(v2.v === '2.00' && v2.cell === 'V2.00', 'Big Validation jumps to the next major (.00)', v2);
  await startEditing(p);
  const pub2 = await save(p, 'Published', 'Automated test · publish without changes');
  ok(await p.evaluate(() => data.documentVersion) === '2.01', 'Publish without changes still adds 0.01', pub2.name);

  // .docx round trip
  const [docx] = await Promise.all([p.waitForEvent('download'), p.evaluate(() => SOPHIA.docx.exportFile())]);
  const docxPath = path.join(out, docx.suggestedFilename());
  await docx.saveAs(docxPath);
  const bytes = fs.readFileSync(docxPath).toString('base64');
  const rt = await p.evaluate(async (b64) => {
    const bin = atob(b64), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    const res = await SOPHIA.docx.convert(u8.buffer);
    const d = document.createElement('div'); d.append(res.fragment);
    return { blocks: d.children.length, h: d.querySelectorAll('h2,h3').length, tables: d.querySelectorAll('table').length, images: res.images, hasText: d.textContent.includes('PUBLISH-TEST') };
  }, bytes);
  ok(rt.blocks > 10 && rt.h > 0 && rt.tables > 0 && rt.hasText, '.docx export → import round trip', rt);

  // print shell + PDF
  await p.emulateMedia({ media: 'print' });
  const pr = await p.evaluate(() => ({ appbar: getComputedStyle(document.querySelector('.sx-appbar')).display, side: getComputedStyle(document.querySelector('.sx-side')).display, bg: getComputedStyle(document.body).backgroundColor }));
  ok(pr.appbar === 'none' && pr.side === 'none' && pr.bg === 'rgb(255, 255, 255)', 'print shows only the document', pr);
  await p.emulateMedia({ media: 'screen' });
  await p.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
  const footer = await p.evaluate(() => document.getElementById('sophia-print-runtime')?.textContent || '');
  ok(/Uncontrolled copy when printed/.test(footer) && /V2\.01/.test(footer), 'controlled print footer (ID · version · status · date)');
  const pdf = await p.pdf({ format: 'A4', path: path.join(out, 'print.pdf') });
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  ok(pages >= 1, 'PDF generated', { pages });
  await p.evaluate(() => window.dispatchEvent(new Event('afterprint')));
  ok(p.errors.length === 0, 'no errors in reopened copy', p.errors);

  console.log(fails ? fails + ' FAIL' : 'ALL PASS', '· outputs in', out);
  await b.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
