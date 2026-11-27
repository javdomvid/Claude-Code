# SOPHIA V78 · Agent brief (firmware)

You are working on ONE self-contained SOPHIA file (an SOP or a Quick Card). It is an
offline HTML document that carries its own editor. This brief is embedded in every
file (script `#sophia-agent-brief`). Read it before changing anything.

## 1. Two kinds of work, two places

| You are… | You may change | You must not change |
|---|---|---|
| **Document agent** (writes or revises SOP / Quick Card content) | the DOCUMENT ZONE only, ideally through a **proposal** (section 6) | styles, modules, record, PID registry, docs |
| **Developer agent** (improves the editor itself) | the source in `sophia/src` (one module per concern) and then rebuild | the document zone of a real document |

The application version (SOPHIA V77, V78…) is NOT the document version (V1, V1.01, V2.00…).

## 2. File map (top to bottom)

1. `<html lang="en" data-profile="sop|quick-card" data-sophia="V78">`
2. `<head>`: `<style data-sophia="fonts|tokens|paper|dialogs|app|print">` — print is always last.
3. Comment marker `SOPHIA DOCUMENT ZONE` → **`<main id="document" class="workspace" data-sophia-zone="document">` … `</main>`** → comment marker `END DOCUMENT ZONE`.
4. `<script type="application/json" id="record">` — revisions, events, comments, assets, versions. Written ONLY by the editor's save.
5. `<script type="application/json" id="sophia-pid-registry">` — local PID keys (declared authorship, not security). Never copy or print these keys.
6. `<script type="text/plain" data-sophia-doc="…">` — this brief, the UI contract, the changelog.
7. `<script data-sophia-module="NN-name">` — the engine, in load order.

Nothing else exists. The interface is drawn at start-up and is never saved.

## 3. Document zone grammar (one block per line)

```
<main id="document" class="workspace" data-sophia-zone="document">
  <section class="sheet">
    <div class="brand"><img class="corporate-logo" alt="…" data-asset="KEY"></div>      (SOP)
    <div class="doc-classification">Classification: …</div>                            (SOP)
    <table class="identity">…label/value cells…</table>                               (SOP)
    <div class="qc-hero"> brand · div.eyebrow · h1 · p · div.hero-tags>span · table.identity </div>   (Quick Card)
    <div class="pagecontent">
      <h2 data-block-id="b-…">Heading 1 text</h2>          ← one block per line
      <p data-block-id="b-…">…</p>
      …
    </div>
    <div class="pagefoot"><span class="page-number">1</span></div>
  </section>
</main>
```

The saved file always has ONE `section.sheet`; A4 pages are recalculated on screen.

### Allowed blocks inside `.pagecontent`
| Block | Markup | Notes |
|---|---|---|
| Heading 1 / 2 / 3 | `h2` / `h3` / `h4` | **Do not type numbers.** The engine numbers them (SOP `3.`, `3.1`, `3.1.2`; Quick Card `01 ·` on h2). `class="nonum"` opts out. |
| Paragraph | `p` | Inline: `b`, `i`, `u`, `s`, `sup`, `sub`, `a href="https://…"`, `br`, `span.tbc` |
| Lists | `ul`/`ol` > `li` | Steps of a procedure are `ol > li`. |
| Table | `table > tbody > tr > th/td` | First row of `th` = header. No `.identity` class. |
| Callout | `aside.warning` with `<b>Warning:</b>` or `<b>Confirmation required:</b>` first | Also used for the draft banner. |
| Quote | `blockquote` | |
| Image | `figure > img[data-asset] + figcaption` | Images are stored once in the record (`assets`); never paste base64 into the zone. Ask a person to insert images. |
| Contents | `nav.toc[data-sophia-toc]` | Generated; never edit its items. |
| Line | `hr` | |
| Quick Card cards | `div.cards > section(.pending) > h3 + p/ul` | `.pending` = must be confirmed before use. |
| Source note | `p.source-note` | Last block: where the content comes from. |
| Decision table (Quick Card) | `table` with header row `Situation` · `Next action` | One decision per row. |
| Page break | attribute `data-layout-before="page"` on any block | |

### Never
- remove or change `data-block-id` of an existing block; never reuse an ID for a new block (leave new blocks without an ID — the editor assigns `b-` + 10 chars);
- edit `table.identity` rows marked `data-trace`, or the cell `data-version-cell` (the editor writes them);
- add `style`, `script`, `iframe`, event attributes (`on…`), external images or fonts;
- write version numbers, dates of approval or names of approvers that a person did not give you (a version a person gave you goes in `setBaseVersion`, never in the text);
- invent facts. Unknown → write `TO BE CONFIRMED` inside `<span class="tbc">…</span>`.

### Established styles
The editor's style gallery offers exactly these blocks: **SOP** — Body text, Section (h2), Sub-section (h3),
Step group (h4), Procedure steps (`ol`), Bullet list (`ul`), Warning, Confirmation required, Source note.
**Quick Card** — Body text, Section (h2), Information card, Card title (h3), Bullet list, Decision table,
Warning, Confirmation required, Pending card, Source note. Use only these; no inline styles or colours.

## 4. Metadata (identity table)
Change fields by their **label**, never by position: Level, Organization, Document Identity,
Document Owner, Title, Classification (SOP line above the table). In a proposal use
`updateMeta` with `field` = the label text.

## 5. Versions (owner rules D and Q)
- Save draft: number unchanged; revision "Draft n · based on Vx".
- Publish & save: always **+0.01** (V1 → V1.01 → V1.02…), even without content changes.
- Big Validation: next major with `.00` (V2.28 → V3.00); requires the phrase and the tool key.
- **Base version** (only while the document has NEVER been published): a document can start at
  the version it already had elsewhere (for example V3 in the quality system).

### What you do about the version
| Situation | What you do |
|---|---|
| **Creating** a new SOP / Quick Card from a template, and the person told you its version (e.g. "this SOP is V3") | Add `{"op": "setBaseVersion", "value": "3", "reason": "…as the person said"}` to your proposal. Never guess the number: no number given → no operation (the document stays V1). |
| **Creating**, no version given | Nothing. Say in your answer that the person can use *Save draft ▾ › Set base version…* later. |
| **Editing** a document that was already published (it shows V1.01, V2.00, V3.04…) | Never touch the version: `setBaseVersion` is refused for published documents. In your answer, recommend how to save: wording / small corrections → **Publish & save** (+0.01); a substantive procedure change that was validated → **Big Validation** (next major); work in progress → **Save draft**. The person decides. |
| **Editing** a draft that was never published | Same as editing; use `setBaseVersion` only if the person asks to set its starting version. |

Never write a version, approval date or approver into the text or the identity table yourself;
the editor writes the `Document Version` cell and the trace row.

## 6. Proposals — the safe way for an agent to change a document
The agent does not rewrite the file. It returns a small JSON that a person loads with
**Commands → Apply agent proposal…** (preview per operation, accept/reject, one undo step,
recorded as event `proposal-applied`). Get the current block IDs and text from
**Commands → Export document map (.json)** (`sophia.document-map/1`).

```json
{
  "schema": "sophia.proposal/1",
  "proposalId": "SOP-123-2026-11-26-a",
  "documentId": "PG-SBM-RMI-SOP",
  "baseDocumentVersion": "1.02",
  "author": "SOPHIA agent (Copilot)",
  "intent": "Clarify step 3.2 and add a missing check",
  "operations": [
    { "op": "replaceBlock", "targetBlockId": "b-ai3m7rtybm", "expectedText": "Review the initial information",
      "html": "<h3>Review the information prefilled by P&amp;G</h3>", "reason": "Clearer title", "source": "Job aid p. 4" },
    { "op": "insertAfter", "targetBlockId": "b-ai3m7rtybm",
      "html": "<p>Check the supplier name before continuing. <span class=\"tbc\">TO BE CONFIRMED</span></p>" },
    { "op": "deleteBlock", "targetBlockId": "b-xxxxxxxxxx", "expectedText": "Old sentence." },
    { "op": "updateMeta", "field": "Document Owner", "expectedValue": "TO BE CONFIRMED", "value": "Quality team" },
    { "op": "setBaseVersion", "value": "3", "reason": "The person said this SOP is V3 in the quality system" }
  ]
}
```
Operations: `replaceBlock`, `insertAfter`, `deleteBlock`, `updateMeta`, `setBaseVersion` (see §5;
refused once the document was published; applied after the content operations).
Rules: `expectedText` / `expectedValue` must equal the current text (whitespace-normalised),
otherwise the operation is refused; `html` passes the document-grammar sanitizer (only the blocks, classes and attributes of section 3 survive);
a `replaceBlock` keeps the target's ID on its first element; a proposal for another
`documentId` is refused; a different `baseDocumentVersion` shows a warning.

## 7. Checklist before you hand over
1. Only the document zone changed (or you produced a proposal).
2. Every new heading has no typed number; levels are h2 → h3 → h4 without gaps.
3. Every unknown is `span.tbc` "TO BE CONFIRMED"; nothing invented.
4. Procedures are `ol > li`, one action per step, imperative voice, UI labels in **bold**.
5. Tables have a header row; no empty cells unless intended.
6. Images have `alt` text; captions in `figcaption`.
7. No `style`, script, external link to images/fonts, base64, or ID reuse.
8. The pre-publish checklist (TBC marks, open comments, alt text, empty cells, contents) is clean, or a person accepted the remaining items.

## 8. Comments and review marks
Comments live in the record (`comments`), anchored to `data-block-id`; they are never part of
the text and never print. An agent reports review points in its answer or as a proposal
with `reason`, not as comments in the zone.
