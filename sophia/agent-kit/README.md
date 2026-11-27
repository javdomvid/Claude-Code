# SOPHIA agent kit — proposals that apply cleanly

> **Para el responsable (ES):** este kit es lo que necesita Copilot para cambiar el contenido de
> un SOP o una Quick Card sin tocar el archivo. Flujo: en el editor, *Comandos › Export document
> map (.json)* → pegas en Copilot la petición de la sección 2 junto con el mapa → Copilot
> devuelve una propuesta JSON → en el editor, *Comandos › Apply agent proposal…* → revisas cada
> operación y aplicas. Nada cambia hasta que tú aplicas, y Ctrl+Z lo deshace.

This kit is for the **document agent** (Copilot / GPT writing or revising SOP and Quick Card
content). The agent never edits the HTML file: it returns a small JSON *proposal* that a person
previews and applies in the editor. Full rules: the agent brief embedded in every file
(`#sophia-agent-brief`); the JSON contract: `#sophia-proposal-schema`
(source `sophia/src/docs/proposal-schema.json`).

## 1. What you receive and what you return

| You receive | You return |
|---|---|
| the **document map** (`sophia.document-map/1`): document ID, version, identity fields and every block with its `id`, `tag`, `num` and `text` | one **proposal** (`sophia.proposal/1`) with a list of operations |
| the person's request and, ideally, the source (manual, job aid…) | a short answer in plain words: what you changed and why, what stays TO BE CONFIRMED, and how to save (see agent brief §5) |

Operations: `replaceBlock` · `insertAfter` · `deleteBlock` · `updateMeta` · `setBaseVersion`.

## 2. Request to paste into Copilot (fill the brackets)

```
You are the SOPHIA document agent. Follow the SOPHIA agent brief (attached or embedded in the
file as #sophia-agent-brief) and return ONLY a JSON proposal that validates against
sophia.proposal/1 (#sophia-proposal-schema), followed by a short explanation.

Document map: [paste the exported .json]
Source material: [paste or attach the source, or say "none"]
Request: [what you want, e.g. "add the missing step to check the delivery note"]
Version: [only when CREATING a document: "it is V3 in the quality system" — otherwise leave empty]

Rules: use the block IDs and exact texts from the map in targetBlockId / expectedText; new
blocks have no data-block-id; no typed heading numbers; unknown facts as
<span class="tbc">TO BE CONFIRMED</span>; procedures as ol > li, one action per step,
interface labels in <b>bold</b>; no style, script, images or base64.
```

## 3. Examples (they are checked automatically against the sample documents)

`examples/sop/` targets `sophia/samples/sample-sop.html`, `examples/quick-card/` targets
`sophia/samples/sample-quick-card.html` (fictional documents). Names say whether the example
must be accepted (`valid`) or refused (`invalid`):

| Example | Shows |
|---|---|
| `sop/01-valid-clarify-paragraph.json` | `replaceBlock` with `expectedText`, bold interface labels, reason and source |
| `sop/02-valid-insert-warning.json` | `insertAfter` with a Warning callout |
| `sop/03-valid-new-section.json` | several new blocks in one operation (sub-section + steps) with a TBC mark |
| `sop/04-valid-owner-and-base-version.json` | `updateMeta` by label + `setBaseVersion` (only before the first publish, only with a version the person gave) |
| `sop/05-invalid-text-changed.json` | refused: the block text no longer matches `expectedText` |
| `sop/06-invalid-wrong-document.json` | refused: proposal made for another document |
| `sop/07-invalid-unknown-block-and-version-field.json` | refused: invented block ID; `Document Version` is written by the editor |
| `quick-card/01-valid-confirm-pending-card.json` | replace the text of a pending card |
| `quick-card/02-valid-add-cards.json` | add a `div.cards` block with two cards |
| `quick-card/03-invalid-wrong-document.json` | refused: SOP proposal sent to the Quick Card |

## 4. Check a proposal before applying it

```bash
node sophia/tools/validate-proposal.cjs <document.html> <proposal.json>
```

It checks the JSON against the schema, then asks the editor itself whether every operation
can be applied (right document, block found, expected text unchanged, allowed markup) and
lists any markup the editor would drop. The editor runs the same checks when a person opens
*Apply agent proposal…*, so a proposal that validates here applies there.

## 5. Common mistakes

- Inventing a block ID or copying it with a typo → *Block … not found*.
- Paraphrasing `expectedText` → *expected text does not match*. Copy it from the map.
- Typing heading numbers ("3.2 Review…") → the editor numbers headings itself.
- Writing a version, approval date or approver into the text → never; versions only through
  `setBaseVersion` and only when creating.
- Sending `<img>`, `style`, `class` names that are not in the grammar → dropped by the editor
  (the validator tells you which).
