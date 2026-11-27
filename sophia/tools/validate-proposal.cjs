/* SOPHIA · validate an agent proposal against a document, without changing anything.
 *
 *   node sophia/tools/validate-proposal.cjs <document.html> <proposal.json> [--expect valid|invalid]
 *
 * 1. Checks the JSON against the proposal schema embedded in the document
 *    (#sophia-proposal-schema, source: sophia/src/docs/proposal-schema.json).
 * 2. Opens the document in Chromium and asks the editor itself (SOPHIA.proposals.validate):
 *    right document? every target block found? expected text still the same? HTML allowed?
 * 3. Says which markup the editor would drop from each "html" (style, scripts, unknown tags…).
 *
 * Exit code: 0 when the proposal is valid (or matches --expect), 1 otherwise.
 * Used by tools/check.sh on the examples in sophia/agent-kit/examples. Never prints PID keys. */
'use strict';
const fs = require('fs');
const path = require('path');

const [docArg, propArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const expectIdx = process.argv.indexOf('--expect');
const expect = expectIdx > 0 ? process.argv[expectIdx + 1] : null;
if (!docArg || !propArg) {
  console.log('usage: node sophia/tools/validate-proposal.cjs <document.html> <proposal.json> [--expect valid|invalid]');
  process.exit(2);
}

/* A small JSON-Schema checker for the subset the proposal schema uses
   (type, required, additionalProperties:false, const, enum, pattern, minLength, minItems,
   items, oneOf, $ref to #/$defs). For oneOf on operations it picks the branch by "op". */
function check(schema, root, value, where, errors) {
  if (schema.$ref) schema = root.$defs[schema.$ref.replace('#/$defs/', '')];
  if (schema.oneOf) {
    const byOp = value && typeof value === 'object' ? schema.oneOf.find((s) => s.properties?.op?.const === value.op) : null;
    if (!byOp) { errors.push(where + ': "op" must be one of ' + schema.oneOf.map((s) => s.properties.op.const).join(', ')); return; }
    return check(byOp, root, value, where + ' (' + value.op + ')', errors);
  }
  if (schema.const !== undefined && value !== schema.const) errors.push(where + ': must be ' + JSON.stringify(schema.const));
  if (schema.enum && !schema.enum.includes(value)) errors.push(where + ': must be one of ' + schema.enum.join(', '));
  const type = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  if (schema.type && schema.type !== type) { errors.push(where + ': must be ' + schema.type + ', got ' + type); return; }
  if (type === 'string') {
    if (schema.minLength && value.length < schema.minLength) errors.push(where + ': must not be empty');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(where + ': "' + value + '" does not match ' + schema.pattern);
  }
  if (type === 'array') {
    if (schema.minItems && value.length < schema.minItems) errors.push(where + ': needs at least ' + schema.minItems + ' item(s)');
    if (schema.items) value.forEach((v, i) => check(schema.items, root, v, where + '[' + i + ']', errors));
  }
  if (type === 'object') {
    for (const k of schema.required || []) if (!(k in value)) errors.push(where + ': missing "' + k + '"');
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) check(schema.properties[k], root, v, where + '.' + k, errors);
      else if (schema.additionalProperties === false) errors.push(where + ': unknown field "' + k + '"');
    }
  }
}

(async () => {
  const file = path.resolve(docArg);
  let proposal;
  try { proposal = JSON.parse(fs.readFileSync(propArg, 'utf8')); } catch (e) {
    return finish(false, ['not valid JSON: ' + e.message]);
  }
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage();
  const pageErrors = [];
  p.on('pageerror', (e) => pageErrors.push(e.message));
  await p.goto('file://' + file);
  await p.waitForFunction(() => document.documentElement.dataset.sophiaReady === 'true');
  const schemaText = await p.evaluate(() => document.getElementById('sophia-proposal-schema')?.textContent || '');
  const schemaErrors = [];
  if (schemaText) check(JSON.parse(schemaText), JSON.parse(schemaText), proposal, 'proposal', schemaErrors);
  else schemaErrors.push('this document has no #sophia-proposal-schema (built before V80?) — schema not checked');
  const res = await p.evaluate((prop) => {
    const r = SOPHIA.proposals.validate(prop);
    const dropped = (html) => {
      if (typeof html !== 'string') return [];
      const parsed = new DOMParser().parseFromString('<body>' + html, 'text/html').body;
      const kept = SOPHIA.sanitize.blocks(html);
      const names = (root) => {
        const s = new Set();
        root.querySelectorAll('*').forEach((n) => { s.add('<' + n.tagName.toLowerCase() + '>'); [...n.attributes].forEach((a) => s.add(n.tagName.toLowerCase() + '[' + a.name + ']')); });
        return s;
      };
      const before = names(parsed), after = names(kept);
      return [...before].filter((x) => !after.has(x) && !/\[data-block-id\]$/.test(x));
    };
    return {
      error: r.error, warnings: r.warnings,
      operations: r.operations.map((c, i) => ({ i, op: c.op.op, target: c.op.targetBlockId || c.op.field || c.op.value || '', ok: c.ok, note: c.note, before: c.before, after: c.after, dropped: dropped(c.op.html) }))
    };
  }, proposal);
  await b.close();

  console.log('Proposal ' + (proposal.proposalId || '(no proposalId)') + ' → ' + path.basename(file));
  for (const e of schemaErrors) console.log('  schema   ✗ ' + e);
  for (const w of res.warnings) console.log('  warning  ⚠ ' + w);
  if (res.error) console.log('  document ✗ ' + res.error);
  for (const o of res.operations) {
    console.log('  op ' + (o.i + 1) + '     ' + (o.ok ? '✓ ' : '✗ ') + o.op + (o.target ? ' · ' + o.target : '') + (o.ok ? '' : ' — ' + o.note));
    if (o.dropped.length) console.log('             ⚠ the editor will drop: ' + o.dropped.join(', '));
  }
  for (const e of pageErrors) console.log('  page     ✗ ' + e);
  const valid = !schemaErrors.filter((e) => !/schema not checked/.test(e)).length && !res.error && res.operations.length > 0 && res.operations.every((o) => o.ok) && !pageErrors.length;
  finish(valid, []);
})().catch((e) => { console.error(e); process.exit(2); });

function finish(valid, extra) {
  for (const e of extra) console.log('  ✗ ' + e);
  console.log(valid ? 'VALID · every operation can be applied' : 'INVALID · fix the ✗ lines above');
  if (expect) {
    const okExpect = (expect === 'valid') === valid;
    console.log(okExpect ? '(as expected: ' + expect + ')' : 'UNEXPECTED: this example should be ' + expect);
    process.exit(okExpect ? 0 : 1);
  }
  process.exit(valid ? 0 : 1);
}
