#!/usr/bin/env node
/**
 * SOPHIA · prueba de regresión en navegador (Chromium headless vía Playwright).
 *
 * Uso:
 *   node sophia-regression.mjs <archivo.html> [otro.html ...]
 *   SOPHIA_PID=XXXX SOPHIA_KEY=yyyy node sophia-regression.mjs SOP.html
 *
 * - Si el archivo todavía contiene `localPIDKeys` (V74/V75), la prueba usa el primer PID de prueba.
 *   En versiones sin claves, pasa SOPHIA_PID/SOPHIA_KEY (o adapta `startEditing`).
 * - Nunca modifica el archivo de entrada: descarga copias en un directorio temporal.
 * - Resultado por comprobación: PASS · FAIL · KNOWN (fallo conocido, pendiente de decisión) · SKIP.
 *   Código de salida 1 si hay algún FAIL.
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const files = process.argv.slice(2);
if (!files.length) { console.error('Uso: node sophia-regression.mjs <archivo.html> [...]'); process.exit(2); }
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'sophia-reg-'));
let failures = 0;

async function newPage(browser, file, viewport = { width: 1440, height: 900 }) {
  const ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('dialog', d => { errors.push('native dialog: ' + d.message()); d.dismiss(); });
  await page.goto(pathToFileURL(path.resolve(file)).href);
  await page.waitForTimeout(700);
  return { ctx, page, errors };
}

async function credentials(page) {
  if (process.env.SOPHIA_PID) return { pid: process.env.SOPHIA_PID, key: process.env.SOPHIA_KEY || '' };
  return page.evaluate(() => {
    if (typeof localPIDKeys === 'undefined') return null;
    const pid = Object.keys(localPIDKeys)[0]; return { pid, key: localPIDKeys[pid] };
  });
}

async function startEditing(page) {
  const cred = await credentials(page);
  if (!cred) throw new Error('Sin credenciales de prueba (define SOPHIA_PID/SOPHIA_KEY)');
  await page.evaluate(() => document.querySelector('[data-command-v24=edit]').click());
  await page.waitForTimeout(200);
  await page.fill('#pidInput', cred.pid);
  if (await page.$('#pidKey')) await page.fill('#pidKey', cred.key);
  await page.click('dialog.modalveil .primary');
  await page.waitForTimeout(300);
  return cred;
}

async function typeSomething(page, text = ' regression-edit') {
  const p = page.locator('#document .pagecontent p').first();
  await p.click();
  await page.keyboard.press('Control+End').catch(() => {});
  await p.click();
  await page.keyboard.type(text);
  await page.waitForTimeout(900);
}

async function saveDraftAndConfirm(page, outName) {
  await page.evaluate(() => exportPID('Draft'));
  await page.waitForTimeout(200);
  await page.fill('#v2reason', 'Regression test');
  await page.check('#v2confirm');
  await page.click('dialog.modalveil .primary');
  await page.waitForTimeout(300);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog.save-receipt [data-download]')]);
  const out = path.join(tmp, outName);
  await dl.saveAs(out);
  await page.setInputFiles('dialog.save-receipt [data-verify]', out);
  await page.waitForTimeout(400);
  await page.click('dialog.save-receipt [data-confirm]');
  await page.waitForTimeout(300);
  return out;
}

const dupIds = page => page.evaluate(() => {
  const m = {}; document.querySelectorAll('[id]').forEach(n => { m[n.id] = (m[n.id] || 0) + 1; });
  return Object.entries(m).filter(([, v]) => v > 1).map(([k, v]) => k + '×' + v);
});

function report(file, rows) {
  console.log('\n' + path.basename(file));
  for (const [status, name, detail] of rows) {
    if (status === 'FAIL') failures++;
    console.log(`  ${status.padEnd(5)} ${name}${detail ? ' — ' + detail : ''}`);
  }
}

async function check(rows, name, fn, { known = false } = {}) {
  try {
    const r = await fn();
    if (r === 'skip') rows.push(['SKIP', name, '']);
    else if (r === true || r?.ok) rows.push(['PASS', name, r?.detail || '']);
    else rows.push([known ? 'KNOWN' : 'FAIL', name, (r && r.detail) || String(r)]);
  } catch (e) { rows.push([known ? 'KNOWN' : 'FAIL', name, 'error: ' + e.message.split('\n')[0]]); }
}

const browser = await chromium.launch();
for (const file of files) {
  const rows = [];
  const base = path.basename(file, '.html');

  await check(rows, 'Carga sin errores de consola', async () => {
    const { ctx, errors } = await newPage(browser, file); await ctx.close();
    return { ok: !errors.length, detail: errors.slice(0, 3).join(' | ') };
  });

  await check(rows, 'C-01 Impresión del navegador: solo #document visible', async () => {
    const { ctx, page } = await newPage(browser, file);
    await page.emulateMedia({ media: 'print' });
    const visible = await page.evaluate(() => [...document.body.children]
      .filter(n => n.id !== 'document' && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE')
      .filter(n => getComputedStyle(n).display !== 'none' && n.getClientRects().length)
      .map(n => n.id ? '#' + n.id : '.' + [...n.classList].join('.') || n.tagName));
    await ctx.close();
    return { ok: !visible.length, detail: visible.join(', ') };
  });

  await check(rows, 'C-01 Ctrl+P abre Print Studio', async () => {
    const { ctx, page } = await newPage(browser, file);
    await page.keyboard.press('Control+p'); await page.waitForTimeout(400);
    const ok = await page.evaluate(() => !!document.getElementById('p42-print'));
    await ctx.close(); return { ok, detail: ok ? '' : 'no se abrió #p42-print' };
  });

  await check(rows, 'A-02 Ctrl+S en edición abre «Draft», no «Published»', async () => {
    const { ctx, page } = await newPage(browser, file);
    await startEditing(page); await typeSomething(page);
    await page.keyboard.press('Control+s'); await page.waitForTimeout(300);
    const summary = await page.evaluate(() => document.querySelector('#v2summary')?.textContent || document.querySelector('dialog[open] h2')?.textContent || '');
    await ctx.close(); return { ok: /Draft/.test(summary) && !/Published/.test(summary), detail: summary };
  });

  await check(rows, 'M-02 Herramientas de solo lectura activas en lectura', async () => {
    const { ctx, page } = await newPage(browser, file);
    const disabled = await page.evaluate(() => [...document.querySelectorAll('.ribbon button')]
      .filter(b => /countWords|overflowCheck|showmarks/.test(b.getAttribute('onclick') || '') && b.disabled).map(b => b.textContent.trim()));
    await ctx.close(); return { ok: !disabled.length, detail: disabled.join(', ') };
  });

  await check(rows, 'M-03 Estadísticas coherentes con la vista', async () => {
    const { ctx, page } = await newPage(browser, file);
    const r = await page.evaluate(() => ({ cont: document.body.classList.contains('continuous-view'), sheets: document.querySelectorAll('#document .sheet').length, text: document.getElementById('liveStats').textContent }));
    await ctx.close();
    const n = parseInt(r.text, 10);
    const ok = r.cont ? !/\d+ pages?/.test(r.text) || n === r.sheets : n === r.sheets;
    return { ok, detail: r.text + ` (hojas: ${r.sheets})` };
  });

  await check(rows, 'A-03 Sin cambios fantasma al abrir (historial vs. contenido actual)', async () => {
    const { ctx, page } = await newPage(browser, file);
    const r = await page.evaluate(() => typeof historyCompare === 'function'
      ? historyCompare(data.revisions.at(-1).snapshot, cleanContent()).changes.map(c => c.type + ':' + (c.after || c.before || '').slice(0, 30)) : null);
    await ctx.close();
    if (r === null) return 'skip';
    return { ok: r.length === 0, detail: r.length + ' cambios: ' + r.slice(0, 4).join(' | ') };
  });

  await check(rows, 'A-01/A-10 Ciclo guardar→reabrir ×2 sin IDs duplicados y sin recuperación residual', async () => {
    const { ctx, page } = await newPage(browser, file);
    await startEditing(page); await typeSomething(page, ' cycle-one');
    const out1 = await saveDraftAndConfirm(page, base + '_cycle1.html');
    const leftover = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('document-recovery:') && k.includes(data.id)));
    await ctx.close();
    const second = await newPage(browser, out1);
    const d1 = await dupIds(second.page);
    await startEditing(second.page); await typeSomething(second.page, ' cycle-two');
    const out2 = await saveDraftAndConfirm(second.page, base + '_cycle2.html');
    await second.ctx.close();
    const third = await newPage(browser, out2);
    const d2 = await dupIds(third.page); const errs = third.errors;
    await third.ctx.close();
    const ok = !d1.length && !d2.length && !leftover.length && !errs.length;
    return { ok, detail: `dups1=[${d1}] dups2=[${d2}] recovery=[${leftover}] errores=${errs.length}` };
  });

  await check(rows, 'M-04 Etiqueta Canvas correcta al reabrir una copia con lienzo claro', async () => {
    const { ctx, page } = await newPage(browser, file);
    await page.click('[data-jaom-canvas]');
    await page.evaluate(() => downloadCurrentCopy()); await page.waitForTimeout(300);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog.save-receipt [data-download]')]);
    const out = path.join(tmp, base + '_light.html'); await dl.saveAs(out); await ctx.close();
    const re = await newPage(browser, out);
    const r = await re.page.evaluate(() => ({ light: document.body.hasAttribute('data-jaom-light'), label: document.querySelector('[data-jaom-canvas]').textContent.trim() }));
    await re.ctx.close();
    return { ok: r.light === /Light/.test(r.label), detail: JSON.stringify(r) };
  });

  await check(rows, 'M-13 Selector «Verify saved HTML» con ancho usable', async () => {
    const { ctx, page } = await newPage(browser, file);
    await page.evaluate(() => downloadCurrentCopy()); await page.waitForTimeout(300);
    const w = await page.evaluate(() => document.querySelector('dialog.save-receipt [data-verify]').getBoundingClientRect().width);
    await ctx.close(); return { ok: w >= 120, detail: Math.round(w) + ' px' };
  });

  // ---- Fallos conocidos pendientes de decisión (no cuentan como FAIL) ----
  await check(rows, 'A-04 Intro no duplica data-block-id', async () => {
    const { ctx, page } = await newPage(browser, file);
    await startEditing(page);
    await page.evaluate(() => document.querySelector('#document .pagecontent p').setAttribute('data-block-id', 'b25-' + 'a'.repeat(32)));
    await page.locator('#document .pagecontent p').first().click({ position: { x: 30, y: 8 } });
    await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    const n = await page.evaluate(() => document.querySelectorAll('[data-block-id="b25-' + 'a'.repeat(32) + '"]').length);
    await ctx.close(); return { ok: n === 1, detail: n + ' bloques con el mismo ID' };
  }, { known: true });

  await check(rows, 'C-04 Publicar sin cambios no repite número de versión', async () => {
    const { ctx, page } = await newPage(browser, file);
    await startEditing(page);
    await page.evaluate(() => exportPID('Published')); await page.waitForTimeout(200);
    const s = await page.evaluate(() => document.querySelector('#v2summary')?.textContent || '');
    await ctx.close();
    const m = s.match(/V([\d.]+) → V([\d.]+)/);
    return { ok: !m || m[1] !== m[2], detail: s };
  }, { known: true });

  await check(rows, 'C-03 Contenido manipulado fuera del editor se detecta', async () => {
    const html = fs.readFileSync(file, 'utf8').replace(/(<div class="pagecontent"[^>]*>(?:(?!<\/div>)[\s\S]){0,4000}?<p>)/, '$1TAMPERED ');
    const out = path.join(tmp, base + '_tampered.html'); fs.writeFileSync(out, html);
    const { ctx, page } = await newPage(browser, out);
    const r = await page.evaluate(() => ({ dirty: window.EditorSession?.get().dirty, warn: !!document.querySelector('[data-integrity-warning],[data-integrity="mismatch"]'), seen: document.body.innerText.includes('TAMPERED') }));
    await ctx.close();
    return { ok: !r.seen || r.warn, detail: JSON.stringify(r) };
  }, { known: true });

  await check(rows, 'C-02 Sin claves en el HTML', async () => {
    const txt = fs.readFileSync(file, 'utf8');
    return { ok: !/localPIDKeys\s*=/.test(txt), detail: /localPIDKeys\s*=/.test(txt) ? 'localPIDKeys presente' : '' };
  }, { known: true });

  report(file, rows);
}
await browser.close();
console.log(`\nDescargas de prueba en: ${tmp}`);
process.exit(failures ? 1 : 0);
