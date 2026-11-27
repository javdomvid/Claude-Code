# SOPHIA changelog

## V79 (2026-11-27) — code health, base version, six interface languages
Same file format (`sophia/77`); documents saved with V77/V78 open unchanged.
- **Compartmentalized source.** The 1,200-line shell became ten modules (command registry,
  UI kit, command list, view, app bar, omnibox, main panel, edit panel, side panel, shell
  assembly). The two big stylesheets became one stylesheet per module
  (`styles/ui/NN-name.css`, same number and name as its module), each a labelled style block
  in the file. One-line HTML templates were split so they can be read.
- **Module cards.** Every module starts with a card: layer, purpose, what it owns, offers,
  uses, events, rules, map and tests. `sophia/MODULES.md` is generated from them.
- **Architecture check** (`tools/lint.py`, run by every build): hidden globals, layer rule
  (lower layers ask the interface with `SOPHIA.ask`, never call it), unknown bus events or
  command ids, network use, module stylesheets, language dictionaries.
- **Safety net:** `tests/unit.cjs` (16 fast checks), `tests/functional.cjs` (48 checks,
  renamed from v77-functional), `tools/snapshot.cjs` (42 interface states before/after a change).
- **Base version** (owner decision Q): *Save draft ▾ › Set base version…* and the proposal
  operation `setBaseVersion`, only before the first publish; recorded as an event. The agent
  brief says what an agent does about the version when creating vs editing.
- **Interface languages** (owner decision X): English (default), Español, Français, Italiano,
  Deutsch, Português — language menu in the app bar; one dictionary module per language.
- Fixes: discarding a session also drops its events (applied proposals, base version);
  F1 shown for Keyboard shortcuts (duplicate registration removed); "About this file" shows the
  real application version.

## V78 (2026-11-26) — owner review: studios, page planning, Word-like tools, Spanish
Same file format (`sophia/77`).
- **Studios, one family** (U): History, Print Studio, Layout Studio, Table Studio, Image Studio,
  Image library, Checks, Structure, paragraph / table dialogs and the save receipt share one look:
  glass frame, tonal header, × close, tonal buttons, filled main action on the right.
  New utilities: **History › Restore this version** (old content back as unsaved changes, one undo
  step); **Checks** with actions (next TBC mark, find «TO BE CONFIRMED», open comments, image
  library, update contents); **Print Studio** shows what the controlled output carries.
- **Layout Studio rebuilt** (T): pages as cards listing their blocks; click a block → start on a new
  page / keep with next / keep with previous; the plan recalculates by itself; apply.
- **Style gallery** (V): only the established styles of the profile (SOP: sections 1. / 1.1 / 1.1.1,
  procedure steps, bullets, warning, confirmation, source note; Quick Card: sections 01 ·, information
  card, card title, decision table, pending card…). No free styles.
- **Tables** (V2): contextual **Table ✦** tab while the cursor is in a table (rows, columns, delete,
  header row, equal widths, document-palette shading, Table Studio); insert a table from a size grid.
- **Find & replace** (V3) in the side panel: highlight all, ‹ ›, match case, whole word, include
  document information, replace one / all (one undo step). Replaces the two old dialogs.
- **Main panel → Mini** when entering edit mode (S); back when leaving; can still be changed.
- **Interface in Spanish** (X): ES/EN button; one dictionary (`08-i18n.js`); the document, the
  firmware and the record stay in English.
- Fixes: undo is independent of A4 pagination (no «empty» undo after a reflow); Quick Card
  «source note» style restored (lost in V77).
- V4 (suggestion mode) not done on purpose: «Changes since last save» with Revert per block and the
  agent proposals already cover it; to be revisited with the owner.

## V77.1 (2026-11-26) — owner review of V77
Same file format (`sophia/77`); documents saved with V77 open unchanged.
- **Main panel back** (as in V76), always available with **Main panel: Full / Mini / Hide** in the
  app bar: tonal bento tiles Navigate · Review · Assets · Save & publish · Output · Agent. It shows
  what can be done now (edit-only tools appear while editing). The edit panel keeps its own
  **Edit panel: Full / Mini / Hide** control while editing.
- **Commands omnibox** in the app bar (Ctrl+K): click to type; the panel shows every command grouped
  by area; typing filters commands **and** searches the document text (jump + highlight, or open Find).
- **View panel** in the V76 style: cards *A4 pages* / *Continuous* with check, Fit width, zoom,
  Layout Studio, Reflow, paragraph marks.
- **Glass and Material Expressive tones restored**: more transparent glass (app bar, panels, menus,
  side panel), V76 tonal colours per area in tiles, edit-panel groups and the omnibox.
- **History**: *Highlight changes* / *Clean text*. Clean text is the formatted document exactly as it
  reads and prints — no highlights, PIDs or dates; the changes sidebar closes. Historical red and
  watermark stay. Snapshots now keep automatic numbers and the contents block.
- **Save**: confirming after the download is enough; the byte check of a saved copy is optional.
  *Save HTML as…* writes the file, reads it back and confirms by itself.
- **A4 view while editing**: text never spills outside the page; when typing pauses the pages are
  recalculated and the cursor stays where it was.

## V77 (2026-11-26) — rebuilt from readable source
Built with `sophia/build.py` from `sophia/src` (no patch layers). Existing V74–V76 documents are
upgraded on open; the upgrade is recorded as a "Migration" revision at the next save.

Interface (C2, N)
- One glass app bar: brand · title · version chip (V + Draft/Published) · status chip with details
  · History · Edit / Save draft ▾ (Publish & save, Big Validation, Download a copy, Recover, Discard)
  · Focus · View ▾ · Canvas · Commands (Ctrl+K) · Side panel · Edit panel.
- Edit panel: Full (tabs Home / Insert / Layout / Review, labelled groups), Mini (every tool,
  icon-only, all groups in one compact strip), Hide.
- Side panel: Outline · Comments · Versions (with changes since last save) · Images · Checks.
- Command sheet: bento tiles with search; every command in one registry.
- English interface; DM Sans embedded (I); obsidian or light canvas; responsive down to 390 px.

Document
- Versions (D): Save draft keeps the number; Publish & save +0.01; Big Validation → next major .00.
- Automatic block IDs (F-id) and automatic heading numbers (K).
- Comments per block, To Be Confirmed marks, pre-publish checklist (J).
- Move block (Alt+↑/↓), style gallery, table of contents, compare any two revisions,
  Word .docx import/export (L).
- Images stored once in the record (G); the saved document zone is readable, one block per line (B1).
- Controlled print footer (ID · version · status · printed date · "Uncontrolled copy when printed")
  and DRAFT watermark for non-published documents (H).
- Agent proposals (M): block-level JSON, previewed and applied in one undo step; document map export.
- Upgrade an older SOPHIA file from the command sheet (O).

Not changed on purpose: PID keys (E), revision integrity hash (F) — next versions.
