# SOPHIA V78 — source

The SOPHIA single-file editors (SOP and Quick Card) built from readable source.
No patch layers: every concern is one module in `src/engine` or one sheet in `src/styles`,
and `build.py` assembles a complete offline HTML from them plus a document's content.

> Real documents (with corporate content, logos and PID keys) are **not** stored here.
> This folder holds only the engine, styles, fonts, docs, build and tests.

## Layout

```
sophia/
  build.py                 source + document → single HTML (content taken from any V74–V77 file)
  tools/finalize.cjs       opens a build headless and writes it already upgraded (Migration revision)
  tests/functional.cjs 46 end-to-end checks (Chromium): UI, ribbon modes, edit, comments, TBC,
                           moves, TOC, numbering, proposals, save/verify/reopen, versions, .docx, print
  src/
    engine/NN-name.js      modules in load order (see src/docs/ui-contract.md §2)
    styles/                tokens · app · paper.sop / paper.qc + paper.common · dialogs · print
    fonts/                 DM Sans variable (Latin) woff2 + OFL licence (embedded by build.py)
    docs/                  agent-brief.md (document agent firmware) · ui-contract.md (developer
                           firmware) · changelog.md — all three are embedded in every file
```

## Commands

```bash
# Build from any SOPHIA document (V74, V75, V76 or V77; SOP or Quick Card)
python3 sophia/build.py <document.html> <out.html>

# Optional: deliver it already upgraded (block IDs, automatic numbers, Migration revision)
node sophia/tools/finalize.cjs <out.html> <final.html>

# Test (Node 18+, Playwright with Chromium); exit code 1 on any FAIL
node sophia/tests/functional.cjs <final.html> [outDir]
```

The older `docs/sophia-audit/tests/sophia-regression.mjs` targets the V74–V76 toolbar and is kept
for those versions; V77 is covered by `functional.cjs`.

## Rules (short version — full text in `src/docs/ui-contract.md`)

1. Edit the module that owns the concern; never add override scripts or styles.
2. Every document change goes through `EditorTransactions.run`; UI nodes carry `data-runtime`.
3. The document zone (`main#document[data-sophia-zone=document]`) is the only part a document agent
   touches, preferably through a proposal (`src/docs/agent-brief.md` §6).
4. `style[data-sophia="print"]` stays last; Ctrl+P opens Print Studio.
5. Offline only: no CDN, no network, fonts and images embedded.
6. Rebuild and run the functional test before handing over.
