/* ============================================================================
 * SOPHIA · 50-persist
 * Saving (Draft / Publish & save / Big Validation), the verified-save receipt,
 * the file serializer and upgrades from older SOPHIA files.
 *
 * HOW A FILE IS WRITTEN (never by serializing the live page):
 *   head  = charset + viewport + title + every <style data-sophia> (pristine text)
 *   body  = document zone (rebuilt from the content, one block per line)
 *         + #record (JSON, images packed once) + #sophia-pid-registry
 *         + every <script type="text/plain" data-sophia-doc> (brief, contract, changelog)
 *         + every <script data-sophia-module> (pristine engine code)
 * Runtime UI is created by JavaScript and is therefore never written to disk.
 * ========================================================================== */
SOPHIA.persist = (() => {
  'use strict';
  const U = SOPHIA.util;

  /* ---------- identity table: trace row + document version cell ---------- */
  function traceField(e) {
    return e ? e.pid + ' · ' + String(e.date).slice(0, 10) + ' · V' + e.version + ' · ' + e.action : 'Not yet performed';
  }
  function applyHeader(root, r) {
    const t = root.querySelector('.identity');
    if (!t) return;
    let row = t.querySelector('[data-trace]');
    if (!row) {
      row = document.createElement('tr');
      row.dataset.trace = 'true';
      row.innerHTML = '<td class="label">Last Edition</td><td data-edition></td><td class="label">Big Validation</td><td data-validation></td>';
      (t.tBodies[0] || t).append(row);
    }
    row.querySelector('[data-edition]').textContent = traceField(r.lastEdition);
    row.querySelector('[data-validation]').textContent = traceField(r.bigValidation);
    const label = [...t.querySelectorAll('.label')].find((n) => ['Validation Date', 'Document Version'].includes(n.textContent.trim()));
    if (label && label.nextElementSibling) {
      label.textContent = 'Document Version';
      label.nextElementSibling.textContent = 'V' + r.documentVersion;
      label.nextElementSibling.dataset.versionCell = 'true';
    }
  }

  /* ---------- document zone: merged, normalized, one block per line ---------- */
  function contentClone() {
    const c = normalizeBody(area.cloneNode(true));
    const sheets = [...c.children].filter((n) => n.matches?.('.sheet'));
    if (sheets.length > 1) {
      const first = sheets[0].querySelector(':scope > .pagecontent');
      for (const s of sheets.slice(1)) {
        const pc = s.querySelector(':scope > .pagecontent');
        if (pc && first) first.append(...pc.childNodes);
        s.remove();
      }
      const n = sheets[0].querySelector('.page-number');
      if (n) n.textContent = '1';
    }
    c.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));
    c.querySelectorAll('[spellcheck]').forEach((n) => n.removeAttribute('spellcheck'));
    c.querySelectorAll('.selected,.layout-overflow').forEach((n) => n.classList.remove('selected', 'layout-overflow'));
    c.querySelectorAll('[class=""]').forEach((n) => n.removeAttribute('class'));
    c.querySelectorAll('[style]').forEach((n) => { if (!n.getAttribute('style').trim()) n.removeAttribute('style'); });
    c.querySelectorAll('[data-runtime],[data-media-ui]').forEach((n) => n.remove());
    return c;
  }
  function openTag(el) {
    const attrs = [...el.attributes].map((a) => (a.value === '' ? ' ' + a.name : ' ' + a.name + '="' + U.escapeHTML(a.value) + '"')).join('');
    return '<' + el.tagName.toLowerCase() + attrs + '>';
  }
  function zoneMarkup(root, uris) {
    root.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (/^data:image\//.test(src)) {
        img.setAttribute('data-asset', SOPHIA.assets.keyFor(src));
        img.removeAttribute('src');
        uris.push(src);
      }
    });
    const lines = ['<main id="document" class="workspace" data-sophia-zone="document">'];
    for (const sheet of root.children) {
      if (sheet.nodeType !== 1) continue;
      lines.push(openTag(sheet));
      for (const part of sheet.children) {
        if (part.matches('.pagecontent, .qc-hero')) {
          lines.push('  ' + openTag(part));
          for (const block of part.childNodes) {
            if (block.nodeType === 3 && !block.nodeValue.trim()) continue;
            lines.push('    ' + (block.nodeType === 1 ? block.outerHTML : U.escapeHTML(block.nodeValue)));
          }
          lines.push('  </' + part.tagName.toLowerCase() + '>');
        } else lines.push('  ' + part.outerHTML);
      }
      lines.push('</' + sheet.tagName.toLowerCase() + '>');
    }
    lines.push('</main>');
    return lines.join('\n');
  }

  /* ---------- whole file ---------- */
  function pristine(selector) {
    return [...document.querySelectorAll(selector)];
  }
  function serializeFile(record, opts = {}) {
    const uris = [];
    const zoneRoot = opts.zoneRoot || contentClone();
    applyHeader(zoneRoot, record);
    const zone = zoneMarkup(zoneRoot, uris);
    const packed = SOPHIA.assets.packRecord(record, uris);
    delete packed.contentBaseline;
    delete packed.editorVersion;
    packed.format = 'sophia/77';
    const title = SOPHIA.meta.title(zoneRoot);
    const styles = pristine('head > style[data-sophia]').map((s) => '<style data-sophia="' + s.dataset.sophia + '">' + s.textContent + '</style>').join('\n');
    const docs = pristine('script[data-sophia-doc]').map((s) => '<script type="text/plain" data-sophia-doc="' + s.dataset.sophiaDoc + '" id="' + s.id + '">' + s.textContent + '</script>').join('\n');
    const modules = pristine('script[data-sophia-module]').map((s) => '<script data-sophia-module="' + s.dataset.sophiaModule + '">' + s.textContent + '</script>').join('\n');
    const registry = document.getElementById('sophia-pid-registry')?.textContent || '{}';
    return (
      '<!doctype html>\n<html lang="en" data-profile="' + SOPHIA.profile + '" data-sophia="' + SOPHIA.engine + '">\n<head>\n' +
      '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
      '<title>' + U.escapeHTML(title) + ' · V' + U.escapeHTML(record.documentVersion) + ' — ' + SOPHIA.strings.profileLabel[SOPHIA.profile] + ' Editor ' + SOPHIA.engine + '</title>\n' +
      styles + '\n</head>\n<body>\n' +
      '<!-- ===== SOPHIA DOCUMENT ZONE (see #sophia-agent-brief before editing) ===== -->\n' + zone + '\n<!-- ===== END DOCUMENT ZONE ===== -->\n' +
      '<script type="application/json" id="record">' + U.scriptJSON(packed) + '</script>\n' +
      '<script type="application/json" id="sophia-pid-registry">' + registry + '</script>\n' +
      docs + '\n' + modules + '\n</body>\n</html>\n'
    );
  }

  /* ---------- verified-save receipt (V63 design, unchanged contract) ---------- */
  function offer(r, name, commit, onError) {
    const fail = (m) => { onError ? onError(m) : toast(m); return false; };
    const canonicalAtRequest = SOPHIA.canonical();
    let html;
    try {
      html = serializeFile(r);
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      if (!parsed.querySelector('#record') || !parsed.querySelector('#document') || parsed.querySelectorAll('script[data-sophia-module]').length !== document.querySelectorAll('script[data-sophia-module]').length)
        throw Error('The portable copy failed its structure check.');
    } catch (error) {
      return fail('Export could not be prepared. Your session is unchanged. ' + error.message);
    }
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dialog = document.createElement('dialog');
    dialog.className = 'save-receipt';
    dialog.dataset.runtime = '';
    dialog.setAttribute('aria-labelledby', 'receipt-title');
    dialog.innerHTML =
      '<form method="dialog" class="receipt-card"><header><span class="receipt-eyebrow">PORTABLE DOCUMENT · SAVE</span><h2 id="receipt-title">Your HTML is ready</h2><p>Download creates a new file. The original is never overwritten. With “Save HTML as”, choose a new name.</p></header>' +
      '<section><div class="receipt-file"><span class="receipt-file-icon" aria-hidden="true">HTML</span><div><strong data-file-name></strong><small data-file-info></small></div></div>' +
      '<p class="receipt-state" data-state role="status" aria-live="polite">Ready to request download</p><div class="receipt-actions"><a data-download>Download HTML</a><button type="button" data-save-as>Save HTML as…</button></div>' +
      '<p class="receipt-help">If the download does not start, use “Save HTML as”. Previews inside SharePoint, Teams or Copilot may block downloads: open the file directly in Edge or Chrome.</p>' +
      '<label class="receipt-check">Verify saved HTML<input type="file" data-verify accept=".html,.htm,text/html"></label><p>Select the saved copy to check it against this export. The file stays on this device.</p><p class="receipt-error" data-error role="alert"></p></section>' +
      '<footer><button type="button" data-cancel>Back to editing</button><button type="button" data-confirm>Confirm saved</button></footer></form>';
    const q = (k) => dialog.querySelector('[data-' + k + ']');
    const ui = { name: q('file-name'), info: q('file-info'), state: q('state'), download: q('download'), saveAs: q('save-as'), verify: q('verify'), error: q('error'), confirm: q('confirm'), cancel: q('cancel') };
    let disposed = false, writing = false, verified = false, checkId = 0;
    const origin = document.activeElement;
    const reset = () => { verified = false; checkId++; ui.verify.value = ''; ui.confirm.disabled = true; };
    const phase = (v, m) => { dialog.dataset.phase = v; ui.state.textContent = m; ui.error.textContent = ''; };
    reset();
    function dispose() {
      if (disposed) return;
      disposed = true;
      if (dialog.open) dialog.close();
      dialog.remove();
      URL.revokeObjectURL(url);
      if (origin?.isConnected) origin.focus({ preventScroll: true });
    }
    async function matches(file) {
      if (!file || file.size !== blob.size) return false;
      const [a, b] = await Promise.all([file.arrayBuffer(), blob.arrayBuffer()]);
      const x = new Uint8Array(a), y = new Uint8Array(b);
      return x.length === y.length && x.every((v, i) => v === y[i]);
    }
    ui.name.textContent = name;
    ui.info.textContent = SOPHIA.versions.label(r.revisions.at(-1) || { version: r.documentVersion, status: r.status }) + ' · ' + Math.ceil(blob.size / 1024) + ' KB';
    ui.download.href = url;
    ui.download.download = name;
    ui.download.addEventListener('click', (e) => {
      if (writing) { e.preventDefault(); return; }
      reset();
      phase('requested', 'Download requested. Select the saved HTML to verify it.');
      ui.download.textContent = 'Download again';
    });
    ui.verify.addEventListener('change', async () => {
      const file = ui.verify.files[0];
      reset();
      const id = checkId;
      if (!file || writing) return;
      phase('verifying', 'Checking the saved copy locally…');
      try {
        const same = await matches(file);
        if (disposed || id !== checkId) return;
        if (!same) {
          phase('mismatch', 'This file does not match the current export.');
          ui.error.textContent = 'Choose the exact HTML just downloaded or saved. Nothing has been recorded yet.';
          return;
        }
        verified = true;
        phase('verified', 'Saved copy verified. You can confirm now.');
        ui.confirm.disabled = false;
      } catch {
        if (!disposed && id === checkId) { phase('failed', 'Could not read the selected file.'); ui.error.textContent = 'Choose the saved copy again.'; }
      }
    });
    ui.cancel.addEventListener('click', () => { if (writing) return; dispose(); toast('Save not confirmed. Your editing session is preserved.'); });
    dialog.addEventListener('cancel', (e) => { if (writing) { e.preventDefault(); return; } queueMicrotask(dispose); });
    dialog.addEventListener('close', () => { if (!disposed) dispose(); }, { once: true });
    dialog.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p', 'z', 'y'].includes((e.key || '').toLowerCase())) { e.preventDefault(); e.stopPropagation(); }
    });
    ui.saveAs.disabled = typeof window.showSaveFilePicker !== 'function';
    if (ui.saveAs.disabled) ui.saveAs.title = 'Unavailable in this browser or preview. Use Download HTML.';
    ui.saveAs.addEventListener('click', async () => {
      if (writing) return;
      reset();
      writing = true;
      ui.saveAs.disabled = ui.cancel.disabled = ui.verify.disabled = true;
      try {
        phase('writing', 'Choose a destination, then wait for the write to finish…');
        const handle = await window.showSaveFilePicker({ suggestedName: name, types: [{ description: 'HTML document', accept: { 'text/html': ['.html'] } }] });
        const stream = await handle.createWritable();
        try { await stream.write(blob); await stream.close(); } catch (e) { try { await stream.abort(); } catch {} throw e; }
        if (!(await matches(await handle.getFile()))) throw Error('The written file did not match this export.');
        verified = true;
        phase('verified', 'File written and verified. You can confirm now.');
      } catch (e) {
        phase('failed', e.name === 'AbortError' ? 'Save cancelled · changes remain in this tab' : 'Save failed · changes remain in this tab');
        ui.error.textContent = e.name === 'AbortError' ? 'You can retry or download the file instead.' : e.message;
      } finally {
        writing = false;
        ui.saveAs.disabled = ui.cancel.disabled = ui.verify.disabled = false;
        ui.confirm.disabled = !verified;
      }
    });
    ui.confirm.addEventListener('click', () => {
      if (writing) return;
      if (!verified) { ui.error.textContent = 'Verify the exact saved HTML before confirming.'; ui.verify.focus(); return; }
      if (commit && SOPHIA.canonical() !== canonicalAtRequest) {
        ui.error.textContent = 'The document changed after this export was prepared. Close and save again; nothing was recorded.';
        return;
      }
      if (commit) {
        for (const k of Object.keys(data)) if (!(k in r)) delete data[k];
        Object.assign(data, r);
        SOPHIA.migration.pending = null;
        applyHeader(area, data);
        EditorSession.saved();
        SOPHIA.bus.emit('record-changed');
      }
      dispose();
      toast(commit ? 'Saved copy verified and revision recorded. This is not corporate approval.' : 'Copy confirmed. Document version and history unchanged.');
    });
    document.body.append(dialog);
    dialog.showModal();
    ui.download.focus();
    return true;
  }

  /* ---------- save actions (owner versioning rule D) ---------- */
  function snapshotHTML(r) {
    const c = contentClone();
    applyHeader(c, r);
    return c.innerHTML;
  }
  function exportPID(mode, opts = {}) {
    const s = EditorSession.get();
    if (!s.pid) { toast(SOPHIA.strings.startEditingFirst); return; }
    const big = mode === 'Big Validation';
    if (mode === 'Draft' && !s.dirty && !SOPHIA.migration.pending) { toast('No changes to save as a draft.'); return; }
    if (big && s.dirty) { toast('Save or publish your content changes before Big Validation.'); return; }
    if (mode !== 'Draft' && !opts.checked && SOPHIA.checklist) {
      SOPHIA.checklist.gate(mode, () => exportPID(mode, { checked: true }));
      return;
    }
    const pid = s.pid;
    const version = mode === 'Draft' ? data.documentVersion : big ? SOPHIA.versions.nextMajor(data.documentVersion) : SOPHIA.versions.nextPublish(data.documentVersion);
    const draftNo = mode === 'Draft' ? SOPHIA.versions.draftsSinceRelease() + 1 : undefined;
    const action = big ? 'Big Validation' : mode === 'Draft' ? 'Save draft' : 'Publish & save';
    const summary = mode === 'Draft'
      ? 'PID ' + pid + ' · Draft ' + draftNo + ' · based on V' + data.documentVersion + ' (the version number does not change for drafts)'
      : 'PID ' + pid + ' · V' + data.documentVersion + ' → V' + version + ' · ' + action;
    const v = modal(
      big ? 'Big Validation' : mode === 'Draft' ? 'Save draft' : 'Publish & save',
      '<p id="v2summary"></p><p>Declared local PID record, not a verified signature or official approval.</p>' +
        '<label>Reason for the change<textarea id="v2reason"></textarea></label>' +
        (mode !== 'Draft' ? '<label>Confirm tool key<input id="v2key" type="password" autocomplete="off"></label>' : '') +
        (big ? '<label>Type BIG VALIDATION<input id="v2phrase" autocomplete="off"></label>' : '') +
        '<label class="check"><input id="v2confirm" type="checkbox"> I reviewed and confirm this action.</label><p id="v2err" role="alert"></p>',
      (dlg) => {
        const err = (m) => (dlg.querySelector('#v2err').textContent = m);
        const reason = dlg.querySelector('#v2reason').value.trim();
        if (!reason || !dlg.querySelector('#v2confirm').checked) return err('Reason and confirmation required.');
        if (mode !== 'Draft' && dlg.querySelector('#v2key').value !== localPIDKeys[pid]) return err('Incorrect key.');
        if (big && dlg.querySelector('#v2phrase').value !== 'BIG VALIDATION') return err('Type BIG VALIDATION exactly.');
        const r = JSON.parse(JSON.stringify(data));
        (r.comments || []).forEach((c) => delete c.unsaved);
        const date = new Date().toISOString();
        const event = { pid, date, version, action, reason, baseVersion: data.documentVersion };
        r.documentVersion = version;
        r.status = mode === 'Draft' ? 'Draft' : 'Published';
        r.events.push(event);
        if (big) r.bigValidation = event;
        else r.lastEdition = event;
        if (SOPHIA.migration.pending) r.revisions.push(SOPHIA.migration.pending);
        r.revisions.push({
          version, draft: draftNo, date, author: pid, editorPID: pid, publisherPID: mode === 'Draft' ? null : pid,
          mode: action, status: r.status, reason, engine: SOPHIA.engine, snapshot: snapshotHTML(r)
        });
        try {
          window.enrichHistory?.(r);
          const file = data.id + '_V' + version + (draftNo ? '_Draft' + draftNo : '') + '_' + (big ? 'BigValidated' : mode) + '.html';
          if (offer(r, file, true, err)) dlg.remove();
        } catch (e) {
          err('Export could not be prepared. Your session is unchanged. ' + e.message);
        }
      },
      mode === 'Draft' ? 'Save & download' : 'Confirm & download'
    );
    v.querySelector('#v2summary').textContent = summary;
  }
  function downloadCurrentCopy() {
    if (EditorSession.get().pid && EditorSession.get().dirty) { toast('Save your changes before downloading a copy.'); return; }
    offer(JSON.parse(JSON.stringify(data)), data.id + '_V' + data.documentVersion + '_copy.html', false);
  }

  /* ---------- upgrades from older SOPHIA files (V74–V76) ----------
   * Older files are migrated in memory when opened with this engine: block IDs,
   * automatic heading numbers and the trace row. The migration is recorded as its
   * own revision ("Migration to V77") at the next save, before the user's revision. */
  function runMigrationTransforms(reasonPrefix) {
    const notes = [];
    const ids = SOPHIA.ids?.ensure() || 0;
    if (ids) notes.push(ids + ' block IDs assigned');
    const stripped = SOPHIA.numbering?.migrate() || 0;
    if (stripped) notes.push(stripped + ' typed heading numbers replaced by automatic numbering');
    applyHeader(area, data);
    if (!notes.length) return null;
    const r = { documentVersion: data.documentVersion, lastEdition: data.lastEdition, bigValidation: data.bigValidation };
    return {
      version: data.documentVersion, date: new Date().toISOString(), author: 'SOPHIA ' + SOPHIA.engine, editorPID: null, publisherPID: null,
      mode: 'Migration', status: data.status, engine: SOPHIA.engine,
      reason: (reasonPrefix || 'Engine upgrade to ' + SOPHIA.engine) + ': ' + notes.join('; ') + '. Content wording unchanged.',
      snapshot: snapshotHTML(r)
    };
  }
  function upgradeFromFile() {
    if (EditorSession.get().pid) { toast('Finish or discard the current editing session first.'); return; }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm,text/html';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const doc = new DOMParser().parseFromString(await file.text(), 'text/html');
        const rec = JSON.parse(doc.getElementById('record')?.textContent || 'null');
        const zone = doc.getElementById('document');
        if (!rec || !zone) throw Error('This is not a SOPHIA document.');
        const isQC = !!zone.querySelector('.qc-hero');
        if ((isQC ? 'quick-card' : 'sop') !== SOPHIA.profile) throw Error('This is a ' + (isQC ? 'Quick Card' : 'SOP') + '. Open it with the matching SOPHIA editor.');
        SOPHIA.assets.expandRecord(rec);
        for (const k of Object.keys(data)) delete data[k];
        Object.assign(data, rec, { revisions: rec.revisions || [], events: rec.events || [], comments: rec.comments || [] });
        data.documentVersion = String(data.documentVersion || '1');
        const keys = (doc.documentElement.innerHTML.match(/const localPIDKeys\s*=\s*(\{[^}]*\})/) || [])[1];
        if (keys) document.getElementById('sophia-pid-registry').textContent = keys;
        muted = true;
        area.innerHTML = SOPHIA.sanitize.html(zone.innerHTML);
        muted = false;
        SOPHIA.assets.resolveDocumentImages(area);
        if (window.LayoutEngine) LayoutEngine.merge();
        SOPHIA.migration.pending = runMigrationTransforms('Upgrade from ' + file.name + ' to ' + SOPHIA.engine);
        EditorSession.rebase();
        undoStates.splice(0, undoStates.length, cleanContent());
        undoPosition = 0;
        SOPHIA.bus.emit('record-changed');
        refreshOutline();
        toast('Loaded ' + file.name + '. Start editing and save to write it as a ' + SOPHIA.engine + ' file.', { ms: 6000 });
      } catch (e) {
        toast('Could not upgrade: ' + e.message, { ms: 6000 });
      }
    };
    input.click();
  }

  return { applyHeader, contentClone, serializeFile, zoneMarkup, offer, exportPID, downloadCurrentCopy, runMigrationTransforms, upgradeFromFile };
})();

SOPHIA.migration = { pending: null };
/* Legacy names used by reused modules and the command registry. */
function exportPID(mode) { return SOPHIA.persist.exportPID(mode); }
function downloadCurrentCopy() { return SOPHIA.persist.downloadCurrentCopy(); }
function closeRevision() { return SOPHIA.persist.exportPID('Published'); }
