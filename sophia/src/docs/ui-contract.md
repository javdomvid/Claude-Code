# SOPHIA V78 · Developer contract (firmware for Copilot / GPT)

Use this when you change the EDITOR (not a document). It is embedded in every file
(`#sophia-ui-contract`) and lives in the repository as `sophia/src/docs/ui-contract.md`.

## 0. Golden rules
1. **Edit modules in place.** One concern = one file in `sophia/src/engine` (or one CSS file in
   `sophia/src/styles`). Never add "override" scripts or styles at the end of the file, never
   monkey-patch another module, never add a second toolbar. If a module is wrong, fix that module.
2. **Rebuild, then test.** `python3 sophia/build.py <document.html> <out.html>` and
   `node sophia/tests/functional.cjs <out.html>` (must print ALL PASS) +
   `node docs/sophia-audit/tests/sophia-regression.mjs <out.html>`.
3. **Never touch the document zone of a real document** while improving the editor. Content changes
   are the document agent's job (see `#sophia-agent-brief`).
4. Everything the interface creates carries `data-runtime` and lives outside `#document`.
5. Every document mutation goes through `EditorTransactions.run(label, fn)` (one undo step,
   rollback on error). Pure layout recalculation runs with `muted = true`.
6. The print style (`style[data-sophia="print"]`) is the last style element. Ctrl+P → Print Studio.
7. No network, no CDN, no `eval`, no external fonts or images. The file must work from `file://`.
8. Write UI strings in English inside the modules. The Spanish interface comes from ONE dictionary
   (`08-i18n.js`): add `"English text": "Texto"` there. Never translate the document, the firmware or
   the record; mark containers that show document text with `translate="no"`.
9. Inline code must never contain the literal closing-script sequence or an HTML comment opener —
   write `'\x3c/script>'` instead (build.py refuses such files).

## 1. File assembly (sophia/build.py and 50-persist serializeFile produce the same shape)
head styles: fonts (DM Sans, OFL) · tokens · paper (profile sheet + paper.common) · dialogs · app · print
body: zone markers + `main#document[data-sophia-zone=document]` · `#record` · `#sophia-pid-registry` ·
`script[data-sophia-doc]` (agent-brief, ui-contract, changelog) · `script[data-sophia-module]` in name order.
The saved file is rebuilt from these pristine parts (a quine): what you put in a module is what
every saved copy carries.

## 2. Modules (load order) and what they own
| Module | Owns | Public API |
|---|---|---|
| 00-core | namespace, strings, utils, sanitizers (`html`, `blocks`), bus, toasts, asset codec, record → `data`, `area`, versions | `SOPHIA.util/sanitize/bus/assets/versions`, `toast()`, `normalizeBody()` |
| 05-editor | metadata by label, editable regions, clean/canonical content (merged sheets, page-independent), undo journal + caret, observer, `modal()`, views, paste routing, core shortcuts | `SOPHIA.meta`, `SOPHIA.canonical`, `setEditable`, `cleanContent`, `mergeSheets`, `repaginate`, `capture`, `stepUndo`, `modal`, `setDocumentView` |
| 08-i18n | interface language EN/ES (dictionary + patterns, translates only runtime UI) | `SOPHIA.i18n.{set, tr, lang}` |
| 10-session | PID session, dirty state, local recovery (sanitized), discard; `edit()` dialog | `EditorSession.{start,saved,discard,recover,changed,rebase,get,panel,subscribe}` |
| 12-transactions | atomic mutation + undo + rollback | `EditorTransactions.run` |
| 14-commands | selection memory, execCommand adapter, paragraph/table dialogs | `EditorCommands.*` |
| 16-media | images: import, placement, size, Image Layout Studio, side panel | `EditorMedia.*` |
| 20-ids | block IDs `b-` + 10 chars, repair duplicates | `SOPHIA.ids.{ensure,find,blocks,VALID}` |
| 21-structure | block structure inspector | `BlockIdentity.open` |
| 22-history | History Studio, compare engine | `openHistoryStudio(i)`, `historyCompare(a,b)`, `enrichHistory(r)` |
| 24-find | find & replace in the side panel (Highlight API; replace one / all in one transaction) | `SOPHIA.find.open(q, replace?)`, `openDocumentFind`, `replaceDialog` |
| 28-tables / 40-table-resize / 42-table-flow | Table Studio, column resize, Table Flow (QC) | `TableStudio.open`, `TableFlow.open` |
| 30-layout-engine / 32-layout-studio | A4 pagination by whole blocks / layout rules | `LayoutEngine.{reflow,merge}`, `LayoutStudio.open` |
| 34-library | image alt text & captions in batches | `ImageLibrary.open` |
| 36-checks | advisory checks (also feeds the pre-publish checklist) | `DocumentReview.open` |
| 38-print | Print Studio (iframe + CSP), controlled footer, DRAFT watermark | `PrintStudio42.open`, `SOPHIA.print` |
| 50-persist | header trace row, zone serialization (one block per line), assets, verified-save receipt, Draft / Publish / Big Validation, migration, upgrade from file | `SOPHIA.persist`, `exportPID(mode)`, `downloadCurrentCopy()` |
| 55-review | comments (record), TBC marks, pre-publish checklist | `SOPHIA.comments/tbc/checklist` |
| 57-numbering | automatic heading numbers (`data-num` + CSS) | `SOPHIA.numbering` |
| 58-blocks | move block, style gallery, table of contents | `SOPHIA.blocks` |
| 60-compare-proposals | compare two revisions; agent proposals; document map | `SOPHIA.compare`, `SOPHIA.proposals` |
| 64-table-tools | contextual Table tab operations, size-grid picker, decision table | `SOPHIA.tables` |
| 62-docx | offline .docx import (DecompressionStream) / export (stored ZIP) | `SOPHIA.docx` |
| 70-shell | app bar, commands omnibox (commands + document search), main panel and edit panel (each Full/Mini/Hide), View panel, side panel, menus, status | `SOPHIA.commands`, `SOPHIA.ui`, `side(name)`, `Workbench` |
| 75-flow | selection bar, context menu, "/" menu, structured paste, changes card, shortcuts help | `SophiaFlow`, `SophiaPaste` |
| 80-profile-qc | Quick Card information cards | `SOPHIA.qc` |
| 99-boot | start-up order | — |

Legacy globals kept on purpose (reused modules read them): `data`, `area`, `toast`, `normalizeBody`,
`muted`, `observer`, `capture`, `cleanContent`, `setEditable`, `refreshOutline`, `selectedImage`,
`localPIDKeys`, `setDocumentView`, `continuationTemplate`, `stepUndo`, `modal`, `pidSession`, `side`.

## 3. Events (`SOPHIA.bus`)
`session` (EditorSession snapshot) · `transaction` (label, after a committed EditorTransactions.run) · `content-changed` · `outline-changed` · `view-changed` · `lang-changed` ·
`record-changed` (after a confirmed save) · `comments-changed` · `commands-changed` · `ready`.

## 4. Adding a tool (the only correct way)
1. Implement it in the module that owns the concern (or a new `NN-name.js` if it is a new concern).
2. Register it: `SOPHIA.commands.register(id, 'Label', 'Group', run, needsEditing, { icon, keys, when, why, profile })`
   (70-shell registers the core list; a module may register its own at load time).
3. Place its id in 70-shell: `MAIN` (main panel tile), `RIBBON` (edit panel tab + group) and/or
   `SHEET` (omnibox bento by area). Mini modes show every tool of their panel automatically;
   Full shows labels (and, in the edit panel, the selected tab).
4. Add a check to `sophia/tests/functional.cjs`.

## 5. Styles
Studio windows share the «studio family» section at the end of `dialogs.css` (glass frame, tonal
header, × close added by 70-shell, tonal buttons, filled primary). A new studio joins it by adding its
class to that section and to `STUDIOS` in 70-shell.
The style gallery offers only the established styles of each profile (`SOPHIA.blocks.STYLES`); do not
add free styles or colours.

`tokens.css` (all app colours, radii, shadows; `--sx-*`) · `app.css` (interface, `sx-*` classes,
never selects page content) · `paper.sop.css` / `paper.qc.css` + `paper.common.css` (the printed
page; also used by Print Studio and history snapshots) · `dialogs.css` (reused studios) · `print.css`.
Obsidian JAOM roles: teal = primary action, lavender = selection, amber = attention/unsaved,
red = error/historical, glass only for bars/menus/sheet, bento tiles in the command sheet.

## 6. Data
Record (`#record`, format `sophia/77`): `id`, `status`, `documentVersion`, `revisions[]`
(`version`, `draft`, `date`, `editorPID`, `mode`, `status`, `reason`, `engine`, `snapshot`),
`events[]`, `comments[]` (`id`, `blockId`, `excerpt`, `pid`, `date`, `text`, `resolved`, `replies`),
`settings.autoNumber`, `assets{KEY: dataURI}` (images stored once; snapshots use `sophia-asset:KEY`).
Never edit `#record` by hand; the save path writes it.

## 7. Pending decisions (do not implement without the owner)
- E: PID keys are a local convenience lock (visible in the file). Real authentication later.
- F (integrity hash of revisions) — later version.
