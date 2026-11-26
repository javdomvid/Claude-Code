# SOPHIA changelog

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
