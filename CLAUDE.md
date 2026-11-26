# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository (`javdomvid/Claude-Code`) holds **documentation and tooling for Project SOPHIA**, an offline single-file HTML document studio (SOP and Quick Card editors). It is **not** the Claude Code CLI source; for questions about the Claude Code CLI itself, use the `claude-code-guide` agent or public docs.

The SOPHIA HTML editors themselves (V74 base, V75 delivery) are **deliberately not committed**: they contain corporate content, logos and test PID keys. They are exchanged as conversation attachments. Do not add them to the repo without the owner's explicit consent.

## Layout

- `docs/sophia-audit/` — audit of SOPHIA V74 and the V75 hand-off (Spanish):
  - `01_INFORME_AUDITORIA.md` findings by severity, with V75 status
  - `02_ARQUITECTURA_OBJETIVO.md` target architecture (engine + data, block model, integrity, agent proposals)
  - `03_DISENO_OBSIDIAN_JAOM.md` design audit/spec; `tokens/jaom-tokens.css` design tokens
  - `04_PLAN_DE_TRABAJO.md` batch plan; `05_HERRAMIENTAS_TIPO_WORD.md` Word-like tool proposals
  - `HANDOFF_V75_PARA_COPILOT.md` paste-ready hand-off; `copilot-instructions.md` standing rules for the dev AI
  - `schemas/sophia-document.schema.json` (+ example documents) — JSON Schema 2020-12 for block content
  - `tools/make_v75.py` — regenerates V75 from the V74 bases via anchored patches (verifies SHA-256)
  - `tests/sophia-regression.mjs` — Playwright (Chromium) regression check for SOPHIA HTML files

## Commands

```bash
# Regenerate V75 from the V74 bases (aborts if hashes or anchors don't match)
python3 docs/sophia-audit/tools/make_v75.py <SOP_V74.html> <QuickCard_V74.html> <out_dir>

# Browser regression check (Node 18+, Playwright with Chromium); exit code 1 on any FAIL
node docs/sophia-audit/tests/sophia-regression.mjs <file.html> [more.html ...]

# Validate example documents against the schema
python3 -c "import json,jsonschema;s=json.load(open('docs/sophia-audit/schemas/sophia-document.schema.json'));[jsonschema.Draft202012Validator(s).validate(json.load(open(f))) for f in ['docs/sophia-audit/schemas/example.sop.document.json','docs/sophia-audit/schemas/example.quick-card.document.json']]"
```

## Rules that matter when touching SOPHIA HTML

Edit only via exact, uniquely anchored substitutions (lines can be 70k chars); apply every change to both profiles; keep `sophia-v75-print-shell` as the last `<style>`; mark JS-created UI nodes `data-runtime`; route document mutations through `EditorTransactions.run`; never edit `#record` by hand; keep the approved toolbar layout unless the owner approves a change. Details: `docs/sophia-audit/copilot-instructions.md`.
