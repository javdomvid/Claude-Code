/* SOPHIA · unit checks (Playwright + Chromium, offline, ~5 seconds).
 *   node sophia/tests/unit.cjs <file.html>
 *
 * Small, fast checks of the pure rules that many modules rely on. Run them after touching
 * 00-core (versions, sanitizer), 08-i18n / 09-lang-xx (languages), 20-ids, 57-numbering or
 * the command registry. They never edit or save the document. Exit 1 on any FAIL.
 * The bigger end-to-end test is tests/functional.cjs. */
const { chromium } = require('playwright');
const path = require('path');
const file = path.resolve(process.argv[2] || '');

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto('file://' + file);
  await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
  const results = await p.evaluate(() => {
    const out = [];
    const check = (label, cond, detail) => out.push({ label, ok: !!cond, detail });
    const V = SOPHIA.versions;
    // versions (owner decisions D and Q)
    check('versions: Publish adds 0.01', V.nextPublish('1') === '1.01' && V.nextPublish('1.09') === '1.10' && V.nextPublish('2.99') === '2.100');
    check('versions: Big Validation → next major .00', V.nextMajor('2.28') === '3.00' && V.nextMajor('1') === '2.00');
    check('versions: base version input', V.valid('3') && V.valid('V3.05') && !V.valid('three') && !V.valid('3.123') && V.normalize('v3.5') === '3.05' && V.normalize('3') === '3');
    check('versions: never published (test document)', !V.everPublished(data));
    check('versions: published record detected', V.everPublished({ revisions: [{ mode: 'Publish & save' }] }) && V.everPublished({ status: 'Published', revisions: [] }));
    // sanitizer: only the document grammar survives
    const f = SOPHIA.sanitize.blocks('<p onclick="x()" style="color:red">Hi <b>there</b><script>bad()</script></p><iframe src="x"></iframe><aside class="warning evil">W</aside>');
    const html = [...f.childNodes].map((n) => n.outerHTML || n.textContent).join('');
    check('sanitizer: no script/iframe/on*/style', !/script|iframe|onclick|style=/.test(html) && /<b>there<\/b>/.test(html), html);
    // ids
    check('ids: every block has a valid unique ID', (() => { const ids = SOPHIA.ids.blocks().map((n) => n.dataset.blockId); return ids.length > 5 && ids.every((i) => SOPHIA.ids.VALID.test(i)) && new Set(ids).size === ids.length; })());
    // numbering
    const nums = SOPHIA.numbering.compute();
    check('numbering: headings numbered in order', nums.length > 2 && nums[0].num && nums.every((x) => typeof x.num === 'string'), nums.slice(0, 3).map((x) => x.num));
    // commands: every placed id exists and runs through the registry
    const ids = SOPHIA.commands.all().map((c) => c.id);
    check('commands: core set registered', ['edit', 'saveDraft', 'publish', 'bigValidation', 'baseVersion', 'find', 'print', 'language'].every((i) => ids.includes(i)));
    check('commands: unique ids', new Set(ids).size === ids.length);
    // languages
    const L = SOPHIA.i18n;
    check('languages: English + 5 registered in owner order', L.codes().join(',') === 'en,es,fr,it,de,pt', L.codes());
    const keys = Object.keys(L.LANGS.es.dict).sort().join('\n');
    check('languages: same keys in every dictionary', ['fr', 'it', 'de', 'pt'].every((c) => Object.keys(L.LANGS[c].dict).sort().join('\n') === keys));
    L.set('de');
    const t1 = L.tr('Page 3'), t2 = L.tr('12 words · 2 A4 pages'), t3 = L.tr('Find (Ctrl+F)'), t4 = L.tr('Not a known text');
    L.set('en');
    check('languages: templates, shortcut suffix, safe fallback', t1 === 'Seite 3' && t2 === '12 Wörter · 2 A4-Seiten' && t3 === 'Suchen (Ctrl+F)' && t4 === 'Not a known text', { t1, t2, t3, t4 });
    check('languages: back to English restores the interface', document.querySelector('.sx-appbar [data-cmd=edit] .sx-label').textContent === 'Edit mode');
    // writing checks (37-writing) on a test fragment (never on the document)
    const frag = document.createElement('div');
    frag.innerHTML = '<div class="pagecontent"><h2>Alpha</h2><h4>Deep</h4><h2>Alpha</h2><ol><li>Open the file. Then save it and close the window.</li></ol>' +
      '<p>Click “Save changes” to continue.</p><p>1. Do this first</p><p>' + Array(40).fill('word').join(' ') + ' end.</p><h3>Empty</h3></div>';
    const found = new Set(SOPHIA.writing.check(frag).map((f) => f.rule));
    const rules = ['step-actions', 'quoted-label', 'empty-section', 'duplicate-heading', 'long-sentence', 'level-jump', 'typed-list'];
    check('writing checks: every rule fires on its example', rules.every((r) => found.has(r)), [...found]);
    check('writing checks: summary groups by rule', SOPHIA.writing.summary(SOPHIA.writing.check(frag)).every((x) => x.count >= 1 && x.nodes.length === x.count));
    check('writing checks: run on the live document without error', Array.isArray(SOPHIA.writing.check()));
    // layers: lower layers ask the interface through SOPHIA.ask
    check('layers: SOPHIA.ask available', typeof SOPHIA.ask.panel === 'function' && typeof SOPHIA.ask.leaveFocus === 'function');
    // nothing runtime inside the document zone
    check('document zone has no interface nodes', !document.querySelector('#document [data-runtime], #document .sx-appbar'));
    return out;
  });
  let fails = 0;
  for (const r of results) {
    console.log((r.ok ? 'PASS ' : 'FAIL ') + r.label + (r.ok || r.detail === undefined ? '' : ' · ' + JSON.stringify(r.detail)));
    if (!r.ok) fails++;
  }
  if (errors.length) { console.log('FAIL page errors · ' + JSON.stringify(errors)); fails++; }
  console.log(fails ? fails + ' FAIL' : 'ALL PASS · ' + results.length + ' unit checks');
  await b.close();
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
