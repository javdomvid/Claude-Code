# SOPHIA · architecture and how to change it safely

Read this before changing the editor (Copilot, GPT or a person). It explains how the pieces fit,
which rules keep them apart, and the exact steps for the usual changes. The module-by-module
list is in [`MODULES.md`](MODULES.md) (generated from the code); every module also starts with
its own **module card** that says what it owns, offers and uses.

> Changing a **document** (an SOP or Quick Card text) is a different job: see
> `src/docs/agent-brief.md`. This file is about the **editor**.

---

## 1. What SOPHIA is

One HTML file that is both the document and its editor. It works offline from `file://`.

```
<head>   style "fonts" · "tokens" · "paper" · one "ui:NN-name" per module stylesheet · "print" (LAST)
<body>   main#document  ← the document zone (the only part a document agent edits)
         #record        ← JSON: revisions, events, comments, images (assets), versions
         #sophia-pid-registry
         script[data-sophia-doc]    ← agent brief, UI contract, changelog (firmware)
         script[data-sophia-module] ← the engine: src/engine/NN-name.js, in name order
```

- **Built** by `build.py` from `src/` + the content of any older SOPHIA file.
- **Saved** by the editor itself (`50-persist`): it rebuilds the file from the pristine parts
  (a quine). Whatever is in a module is copied into every saved file. The live page (with its
  interface) is never written to disk.

## 2. Layers

Modules load in file-name order. The number also tells the layer:

| Layer | Modules | What lives there |
|---|---|---|
| **CORE** | `00-core`, `05-editor`, `08-i18n`, `09-lang-*` | namespace, utilities, sanitizers, bus, record, versions; editing surface, undo, views; interface languages |
| **SAFETY** | `10-session`, `12-transactions` | who edits, dirty state, recovery; atomic changes with rollback |
| **DOCUMENT** | `14-editor-commands`, `20-ids`, `30-layout-engine`, `57-numbering`, `58-blocks`, `64-table-tools`, `80-profile-qc` | operations on the document itself |
| **FEATURE** | `16-media`, `21-structure`, `22-history`, `24-find`, `28-tables`, `32-layout-studio`, `34-library`, `36-checks`, `38-print`, `40-table-resize`, `42-table-flow`, `50-persist`, `55-review`, `60-compare-proposals`, `62-docx` | studios and services (each owns its window and its stylesheet) |
| **SHELL** | `70-command-registry` … `79-shell`, `85-flow` | the interface: commands, app bar, panels, omnibox, menus |
| **BOOT** | `99-boot` | start-up order only |

**The rule (checked by `tools/lint.py`, E3):** nothing below SHELL touches the interface.
A feature that needs the interface *asks*:

```js
SOPHIA.ask.panel('comments');   // show a side panel (79-shell answers)
SOPHIA.ask.leaveFocus();        // leave focus reading
```

The shell, in turn, reaches features only by running **commands** or calling their public API.

### The shell, piece by piece

```
70-command-registry  SOPHIA.commands — the list of everything a person can do (data only)
71-ui-kit            SOPHIA.ui.kit   — buttons, icons, menus, preferences (building blocks)
72-command-list      the core commands (id, English label, group, icon, shortcut, run)
73-view              zoom, focus, canvas, View panel
74-appbar            top bar: title, chips, status popover, actions, language menu
75-omnibox           Ctrl+K: commands by area (SHEET) + search in the document
76-main-panel        main panel tiles (MAIN), Full / Mini / Hide
77-edit-panel        ribbon (RIBBON), style gallery, contextual Table tab
78-side-panel        side panel tabs (PANELS)
79-shell             mount order, one refresh() for all parts, layout, keyboard, bus wiring,
                     × close on every studio window (STUDIOS)
85-flow              selection bar, context and "/" menus, structured paste, changes card
```

Each part exposes `SOPHIA.ui.<part>` (`appbar`, `omnibox`, `mainPanel`, `editPanel`, `sidePanel`,
`view`). Parts never reach into each other's variables; `79-shell` calls their `refresh()`.

## 3. How a change flows

```
person clicks a button
  → kit.button → SOPHIA.commands.run(id)            (70: availability, "why not" message)
  → the owning module, e.g. SOPHIA.tables.row()
  → EditorTransactions.run(label, fn)                (12: one undo step, rollback on error)
  → bus "transaction" → layout engine re-flows A4 pages, find refreshes highlights …
  → EditorSession.changed() → bus "session"          (10: dirty state, recovery copy)
  → 79-shell refreshSoon() → every part updates (buttons enabled, chips, labels)
```

Save: `exportPID(mode)` (50) → new record copy → `serializeFile` → save receipt → person
confirms the download → bus `record-changed`.

Start-up: `99-boot` — migrate older files, numbering, header, view → `SOPHIA.ui.mount()` →
`SOPHIA.i18n.start()` → after the font loads, A4 pagination.

### Bus events

| Event | Emitted by | Meaning |
|---|---|---|
| `session` | 10-session | editing session changed (pid, dirty, recovery) |
| `transaction` | 12-transactions | a document change was committed (label) |
| `content-changed` | 05, 10, 22 | content replaced (restore, discard, recover) |
| `outline-changed` | 05, 57, 99 | headings or numbers changed |
| `view-changed` | 05, 99 | A4 pages ↔ continuous, repagination |
| `record-changed` | 50-persist | a save was confirmed |
| `comments-changed` | 55-review | comments added/resolved |
| `commands-changed` | 70 | a command was registered |
| `lang-changed` | 08-i18n | interface language changed |
| `ready` | 99-boot | start-up finished |
| `ask:panel`, `ask:leave-focus` | SOPHIA.ask (00) | requests from lower layers to the shell |

## 4. Where things are

| You want to change… | Go to |
|---|---|
| a button / menu entry / shortcut | `72-command-list` (the command) + `76`/`77`/`75`/`74` (where it shows) |
| how a studio window looks | its module + `styles/ui/NN-name.css`; shared look in `styles/ui/98-studio-family.css` |
| the printed page | `styles/paper.sop.css` / `paper.qc.css` / `paper.common.css` |
| colours, radii, glass | `styles/tokens.css` |
| version rules | `SOPHIA.versions` in `00-core` (+ `setBaseVersion` in `50-persist`) |
| what the document may contain | `SOPHIA.sanitize.blocks` in `00-core` + `src/docs/agent-brief.md` §3 |
| interface languages | `08-i18n` (engine) + `09-lang-xx` (one dictionary per language) |
| the styles a profile offers | `SOPHIA.blocks.STYLES` in `58-blocks` |

## 5. The safety net — run these, in this order

| Step | Command | Catches |
|---|---|---|
| 1. Architecture check | `python3 sophia/tools/lint.py` (also runs inside `build.py`) | hidden globals, layer violations, unknown bus events or command ids, network use, missing translations, module stylesheet without module |
| 2. Build | `python3 sophia/build.py <document.html> <out.html>` then `node sophia/tools/finalize.cjs <out.html> <final.html>` | broken assembly, forbidden text in modules |
| 3. Unit checks | `node sophia/tests/unit.cjs <final.html>` (5 s) | versions, sanitizer, IDs, numbering, commands, languages |
| 4. Functional test | `node sophia/tests/functional.cjs <final.html>` (2 min) | the whole editor: edit, undo, panels, studios, save, reopen, publish, print, .docx |
| 5. Snapshot (when you MOVE code or CSS) | `node sophia/tools/snapshot.cjs before.html before.json` · same for after · `node sophia/tools/snapshot.cjs --diff before.json after.json` | any visual or textual change in 42 interface states (styles, sizes, labels) |

A refactor (split, rename, move) must give **IDENTICAL** in step 5. A feature change must show
only the differences you intended.

## 6. Recipes

### Add a command (button, menu entry, omnibox entry)
1. In `72-command-list` (or in the module that owns the feature, at load time):
   `R('myTool', 'My tool…', 'Insert', 'icon', () => SOPHIA.myModule.open(), true /* editing only */, { when, why, keys })`.
2. Show it: add `'myTool'` to a tile in `MAIN` (76), a group in `RIBBON` (77) and/or an area in
   `SHEET` (75). Mini modes pick it up automatically.
3. New icon? Add a 24×24 stroke path to `ICONS` in `71-ui-kit`.
4. Translate the label in every `09-lang-xx` (lint E8 tells you if one is missing).
5. Add a check to `tests/functional.cjs`. Run the safety net.

### Add a side-panel tab
`78-side-panel`: one entry in `PANELS` + one branch in `renderSide()` that calls
`SOPHIA.myModule.render(container)`. Style in the module's own stylesheet.

### Add a studio window
1. New module `NN-name.js` (FEATURE) with a module card; build the `<dialog>` with
   `data-runtime`; change the document only inside `EditorTransactions.run`.
2. Its stylesheet `styles/ui/NN-name.css` (same name; start with the header comment).
3. Join the family: add its selector to `STUDIOS` in `79-shell` and to the `:is(…)` lists in
   `styles/ui/98-studio-family.css`.
4. A command to open it (recipe above).

### Add an interface text or a language
- Write the text in English in the module. Add `"English text": "translation"` to **every**
  `09-lang-xx.js`. Texts with numbers use templates: `"{n} open comment(s).": "{n} …"`.
- New language: copy `09-lang-es.js` to `09-lang-xx.js`, change the code and name, translate
  the values; add the code to `ORDER` in `08-i18n` for its place in the menu.
- Containers that show document text get `translate="no"`.

### Add a bus event
Emit it with `SOPHIA.bus.emit('name', detail)` and list it in the module card (`EMITS`);
listeners list it in `LISTENS`. Add it to the table in §3.

### Change a style of the document (SOP / Quick Card)
`styles/paper.*.css` only, and the matching entry in `SOPHIA.blocks.STYLES` (58) if the
gallery offers it. Update `src/docs/agent-brief.md` §3 if the markup changes.

### Move or split code
Keep behaviour identical: snapshot before, move, snapshot after, `--diff` must say
IDENTICAL; then the functional test.

## 7. Never

- add "override" scripts or styles, or a second toolbar; fix the module that owns the concern;
- create a global without naming it in the module card (lint E2);
- call the interface from CORE/SAFETY/DOCUMENT/FEATURE (lint E3);
- change the document outside `EditorTransactions.run`, or write `#record` by hand;
- use the network, CDNs, `eval`, external fonts or images (lint E6);
- write the closing-script sequence or an HTML comment opener inside a module (write `'\x3c/script>'`);
- put anything after `style[data-sophia="print"]`;
- print, log or copy PID keys.

## 8. Old names you will meet

Several studios were reused from earlier versions and keep their class names so their styles
still apply: `#p42-print` (Print Studio), `.review-workspace-v22` (Checks),
`.image-library-v23`, `.structure-v25`, `.table-studio-v26`, `.layout-studio-v27`,
`.table-flow-v28`, `.sv76-*` (85-flow menus), `#historyStudio.history-v20…v71` (History, styled
in layers). The numbers are historical, not versions to keep in step. The History stylesheet is
layered on purpose: edit the last layer that styles an element and check with the snapshot.
