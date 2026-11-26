# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository (`javdomvid/Claude-Code`) holds **documentation and tooling for Project SOPHIA**, an offline single-file HTML document studio (SOP and Quick Card editors). It is **not** the Claude Code CLI source; for questions about the Claude Code CLI itself, use the `claude-code-guide` agent or public docs.

The SOPHIA HTML documents themselves (V74 base, V75/V76/V77 deliveries) are **deliberately not committed**: they contain corporate content, logos and test PID keys. They are exchanged as conversation attachments. Do not add them to the repo without the owner's explicit consent. Since V77 the **editor source** is committed in `sophia/` (engine, styles, fonts, docs, build, tests) — it contains no document content.

## Layout

- `sophia/` — **V77 source** (current): `build.py` (source + any V74–V77 document → single HTML), `tools/finalize.cjs` (deliver already upgraded), `tests/v77-functional.cjs` (33 Chromium checks), `src/engine/NN-*.js` (modules in load order), `src/styles/` (tokens · app · paper.sop/qc + paper.common · dialogs · print), `src/fonts/` (DM Sans, OFL), `src/docs/` (agent-brief = document-agent firmware, ui-contract = developer firmware, changelog; embedded in every built file)
- `docs/sophia-audit/` — audit of SOPHIA V74 and the V75 hand-off (Spanish):
  - `01_INFORME_AUDITORIA.md` findings by severity, with V75 status
  - `02_ARQUITECTURA_OBJETIVO.md` target architecture (engine + data, block model, integrity, agent proposals)
  - `03_DISENO_OBSIDIAN_JAOM.md` design audit/spec; `tokens/jaom-tokens.css` design tokens
  - `04_PLAN_DE_TRABAJO.md` batch plan; `05_HERRAMIENTAS_TIPO_WORD.md` Word-like tool proposals
  - `HANDOFF_V77_PARA_COPILOT.md` current hand-off (V75/V76 hand-offs kept for history); `copilot-instructions.md` standing rules for the dev AI
  - `schemas/sophia-document.schema.json` (+ example documents) — JSON Schema 2020-12 for block content
  - `tools/make_v75.py` — regenerates V75 from the V74 bases via anchored patches (verifies SHA-256)
  - `tests/sophia-regression.mjs` — Playwright (Chromium) regression check for SOPHIA HTML files

## Commands

```bash
# V77: build from any SOPHIA document, optionally finalize (already upgraded), then test
python3 sophia/build.py <document.html> <out.html>
node sophia/tools/finalize.cjs <out.html> <final.html>
node sophia/tests/v77-functional.cjs <final.html> [outDir]   # exit 1 on any FAIL

# Regenerate V75 from the V74 bases (aborts if hashes or anchors don't match)
python3 docs/sophia-audit/tools/make_v75.py <SOP_V74.html> <QuickCard_V74.html> <out_dir>

# V74–V76 browser regression check (targets the old toolbar; V77 uses v77-functional.cjs)
node docs/sophia-audit/tests/sophia-regression.mjs <file.html> [more.html ...]

# Validate example documents against the schema
python3 -c "import json,jsonschema;s=json.load(open('docs/sophia-audit/schemas/sophia-document.schema.json'));[jsonschema.Draft202012Validator(s).validate(json.load(open(f))) for f in ['docs/sophia-audit/schemas/example.sop.document.json','docs/sophia-audit/schemas/example.quick-card.document.json']]"
```

## Rules that matter when touching SOPHIA

V77+: change the editor only in `sophia/src`, editing the module that owns the concern in place (no override/patch layers), then rebuild and run `v77-functional.cjs`. Document content is changed only inside `main#document[data-sophia-zone=document]`, preferably through a `sophia.proposal/1` JSON (see `sophia/src/docs/agent-brief.md`). Keep `style[data-sophia="print"]` last; mark JS-created UI nodes `data-runtime`; route document mutations through `EditorTransactions.run`; never edit `#record` by hand; never print or copy the PID keys; inline module code must not contain a literal closing-script tag or HTML comment opener (build.py refuses it). Full contract: `sophia/src/docs/ui-contract.md`; standing rules for Copilot: `docs/sophia-audit/copilot-instructions.md`.

V74–V76 files (legacy): edit only via exact, uniquely anchored substitutions and keep `sophia-v75-print-shell` as the last `<style>`.
