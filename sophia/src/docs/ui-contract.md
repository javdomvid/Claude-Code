# SOPHIA V79 · Developer contract (firmware for Copilot / GPT)

Use this when you change the EDITOR (not a document). It is embedded in every file
(`#sophia-ui-contract`) and lives in the repository as `sophia/src/docs/ui-contract.md`.
Repository extras: `sophia/ARCHITECTURE.md` (full guide with recipes) and `sophia/MODULES.md`
(module map generated from the module cards).

## 0. Golden rules
1. **Edit modules in place.** One concern = one file `src/engine/NN-name.js`, its look in
   `src/styles/ui/NN-name.css` (same number and name). Never add "override" scripts or styles,
   never monkey-patch another module, never add a second toolbar. If a module is wrong, fix it.
2. **Read the module card first.** Every module starts with a card: layer, PURPOSE, OWNS,
   EXPORTS, USES, EMITS/LISTENS, DOM, RULES, MAP, TESTS. Keep it true when you change the module.
3. **Layers.** CORE → SAFETY → DOCUMENT → FEATURE → SHELL → BOOT. Nothing below SHELL touches the
   interface: it asks with `SOPHIA.ask.panel(name)` / `SOPHIA.ask.leaveFocus()`.
4. **Safety net, in order:** `python3 sophia/tools/lint.py` (also run by build.py; errors stop the
   build) → `python3 sophia/build.py <doc.html> <out.html>` → `node sophia/tools/finalize.cjs
   <out.html> <final.html>` → `node sophia/tests/unit.cjs <final.html>` →
   `node sophia/tests/functional.cjs <final.html>` (ALL PASS). When you move or split code:
   `node sophia/tools/snapshot.cjs` before/after and `--diff` must say IDENTICAL.
5. **Never touch the document zone of a real document** while improving the editor. Content changes
   are the document agent's job (see `#sophia-agent-brief`).
6. Everything the interface creates carries `data-runtime` and lives outside `#document`.
7. Every document mutation goes through `EditorTransactions.run(label, fn)` (one undo step,
   rollback on error). Pure layout recalculation runs with `muted = true`.
8. `style[data-sophia="print"]` is the last style element. Ctrl+P → Print Studio.
9. No network, no CDN, no `eval`, no external fonts or images. The file must work from `file://`.
10. Interface texts are written in English in the modules. Translations live in ONE dictionary per
    language (`09-lang-es/fr/it/de/pt`), all with the same keys (lint E8). Texts with numbers use
    templates: `"Page {n}": "Página {n}"`. A missing translation shows English. Never translate the
    document, the firmware or the record; containers showing document text get `translate="no"`.
11. Inline code must never contain the literal closing-script sequence or an HTML comment opener —
    write `'\x3c/script>'` instead (build.py refuses such files).

## 1. File assembly (build.py and 50-persist serializeFile produce the same shape)
head styles: `fonts` (DM Sans, OFL) · `tokens` · `paper` (profile sheet + paper.common) ·
one `ui:NN-name` per module stylesheet (name order) · `print` (last).
body: zone markers + `main#document[data-sophia-zone=document]` · `#record` · `#sophia-pid-registry` ·
`script[data-sophia-doc]` (agent-brief, ui-contract, changelog, proposal-schema) · `script[data-sophia-module]` in name order.
The saved file is rebuilt from these pristine parts (a quine): what you put in a module is what
every saved copy carries.

## 2. Modules (load order)
CORE · `00-core` namespace, utils, sanitizers, bus, `SOPHIA.ask`, toasts, assets, record `data`,
`area`, versions · `05-editor` editable regions, undo, canonical content, `modal()`, views ·
`08-i18n` language engine · `09-lang-xx` one dictionary per language.
SAFETY · `10-session` PID session, dirty, recovery, discard · `12-transactions` `EditorTransactions.run`.
DOCUMENT · `14-editor-commands` `EditorCommands` (text/paragraph commands; not the registry) ·
`20-ids` block IDs · `30-layout-engine` A4 pagination · `57-numbering` heading numbers ·
`58-blocks` move, established styles (`STYLES`), contents · `64-table-tools` Table tab
operations · `80-profile-qc` Quick Card cards.
FEATURE · `16-media` images · `21-structure` · `22-history` History Studio · `24-find` find &
replace panel · `28-tables` Table Studio · `32-layout-studio` · `34-library` · `36-checks` ·
`38-print` Print Studio · `40-table-resize` · `42-table-flow` · `50-persist` saving, receipt,
serializer, migration, base version · `55-review` comments, TBC, checklist ·
`60-compare-proposals` compare, agent proposals, document map · `62-docx` Word in/out.
SHELL · `70-command-registry` `SOPHIA.commands` · `71-ui-kit` buttons, icons, menus, prefs ·
`72-command-list` core commands · `73-view` zoom, focus, canvas, View panel · `74-appbar` ·
`75-omnibox` (SHEET) · `76-main-panel` (MAIN) · `77-edit-panel` (RIBBON) · `78-side-panel`
(PANELS) · `79-shell` mount, refresh, layout, keyboard, bus wiring, studio × (STUDIOS) ·
`85-flow` selection bar, context and "/" menus, paste, changes card.
BOOT · `99-boot` start-up order.

Legacy globals kept on purpose (reused modules read them): `data`, `area`, `toast`, `normalizeBody`,
`muted`, `observer`, `capture`, `cleanContent`, `setEditable`, `refreshOutline`, `selectedImage`,
`localPIDKeys`, `setDocumentView`, `continuationTemplate`, `stepUndo`, `modal`, `pidSession`, `side`.

## 3. Events (`SOPHIA.bus`)
`session` · `transaction` (label, after a committed change) · `content-changed` · `outline-changed` ·
`view-changed` · `record-changed` (after a confirmed save) · `comments-changed` · `commands-changed` ·
`lang-changed` · `ready` · `ask:panel` / `ask:leave-focus` (requests to the shell via `SOPHIA.ask`).

## 4. Adding a tool (the only correct way)
1. Implement it in the module that owns the concern (or a new `NN-name.js` with its card).
2. Register it: `R(id, 'Label', 'Group', 'icon', run, editingOnly, { keys, when, why, profile })` in
   `72-command-list`, or `SOPHIA.commands.register(...)` from its module at load time.
3. Show it: id in `MAIN` (76-main-panel), `RIBBON` (77-edit-panel) and/or `SHEET` (75-omnibox).
4. Translate its label in every `09-lang-xx`. 5. Add a check to `tests/functional.cjs`.
A new studio window also joins the family: selector in `STUDIOS` (79-shell) and in
`styles/ui/98-studio-family.css`; its own stylesheet `styles/ui/NN-name.css`.

## 5. Styles
`tokens.css` (colours, radii, shadows, glass; `--sx-*`) · `paper.sop.css` / `paper.qc.css` +
`paper.common.css` (the printed page; also Print Studio and History snapshots) · `ui/NN-name.css`
(interface of module NN, never page content) · `ui/98-studio-family.css` (one look for every
studio) · `print.css`. Obsidian JAOM roles: teal = primary action, lavender = selection,
amber = attention/unsaved, red = error/historical, glass for bars/menus/panels, tonal tiles by area.
The style gallery offers only `SOPHIA.blocks.STYLES` of each profile: no free styles or colours.

## 6. Data
Record (`#record`, format `sophia/77`): `id`, `status`, `documentVersion`, `revisions[]`
(`version`, `draft`, `date`, `editorPID`, `mode`, `status`, `reason`, `engine`, `snapshot`),
`events[]` (session-start, proposal-applied, base-version, …), `comments[]`, `settings.autoNumber`,
`assets{KEY: dataURI}` (images stored once; snapshots use `sophia-asset:KEY`).
Never edit `#record` by hand; the save path writes it.
Versions: Save draft keeps the number · Publish & save +0.01 · Big Validation next major .00 ·
base version (`SOPHIA.persist.setBaseVersion`) only before the first publish.

## 7. Pending decisions (do not implement without the owner)
- E: PID keys are a local convenience lock (visible in the file). How keys are stored, added
  and changed is still to be decided.
- F: integrity fingerprint of revisions (detect edits made outside SOPHIA).
- W: rehearsal of the agent flow with the owner's Copilot (document map → proposal → apply).
- V4 (suggestion mode / track changes) and R (new document from template) not decided.
