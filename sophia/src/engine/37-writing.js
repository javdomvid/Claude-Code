/* ============================================================================
 * SOPHIA · 37-writing                                  layer: FEATURE
 * ----------------------------------------------------------------------------
 * PURPOSE  Writing checks for SOPs and Quick Cards (advisory, never blocking): the same
 *          rules the document agent follows, so a person and an agent review alike.
 *          Steps with several actions · interface labels in quotes instead of bold ·
 *          sections without content · repeated headings · very long sentences · skipped
 *          heading levels · typed numbering or bullets instead of a list.
 * OWNS     SOPHIA.writing and its RULES.
 * EXPORTS  SOPHIA.writing {RULES, check(root) → [{rule, title, detail, node}],
 *          summary(findings) → [{rule, title, count, nodes}]}
 * USES     area (default root), SOPHIA.util
 * RULES    - Read-only: never changes the document.
 *          - Shown in Document checks (kind "Writing", 36-checks) and as information items
 *            in the side-panel checklist (55-review); never in the pre-publish gate as a warning.
 *          - English titles; translations in every 09-lang-xx.
 *          - Ignored: the identity table, the Quick Card hero, the contents block, callouts
 *            (aside.warning may be longer) and the source note.
 *          - To add a rule: one entry in RULES + its test in tests/unit.cjs.
 * TESTS    tests/unit.cjs (writing rules on a test fragment)
 * ========================================================================== */
SOPHIA.writing = (() => {
  'use strict';
  const LONG_SENTENCE = 35, LONG_STEP = 30;
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const words = (s) => (norm(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
  const sentences = (s) => norm(s).split(/(?<=[.!?])\s+(?=[A-Z0-9“"«(])/).filter((x) => words(x) >= 3);
  const SKIP = '.identity, .qc-hero, nav.toc, aside.warning, .source-note, [data-trace]';

  /* Each rule: id, English title, test(context) → [{ node, detail }] */
  const RULES = [
    {
      id: 'step-actions',
      title: 'Step may contain more than one action',
      test: ({ steps }) => steps.filter((li) => {
        const t = norm(li.textContent);
        return sentences(t).length > 1 || words(t) > LONG_STEP || /\b(and then|then also)\b|;\s+\S/i.test(t);
      }).map((li) => ({ node: li, detail: norm(li.textContent).slice(0, 160) }))
    },
    {
      id: 'quoted-label',
      title: 'Interface label in quotes: use bold',
      test: ({ texts }) => texts.flatMap((n) => {
        const m = norm(n.textContent).match(/[“"«]([A-Z][^“”"«»]{0,40})[”"»]/);
        return m && m[1].split(/\s+/).length <= 5 ? [{ node: n, detail: '“' + m[1] + '”' }] : [];
      })
    },
    {
      id: 'empty-section',
      title: 'Section has no content',
      test: ({ blocks }) => blocks.flatMap((b, i) => {
        if (!/^H[2-4]$/.test(b.tagName)) return [];
        const next = blocks[i + 1];
        const empty = !next || (/^H[2-4]$/.test(next.tagName) && Number(next.tagName[1]) <= Number(b.tagName[1]));
        return empty ? [{ node: b, detail: norm(b.textContent) }] : [];
      })
    },
    {
      id: 'duplicate-heading',
      title: 'Heading repeated',
      test: ({ blocks }) => {
        const seen = new Map(), out = [];
        for (const h of blocks.filter((b) => /^H[2-4]$/.test(b.tagName))) {
          const key = h.tagName + '|' + norm(h.textContent).toLowerCase();
          if (!norm(h.textContent)) continue;
          if (seen.has(key)) out.push({ node: h, detail: norm(h.textContent) });
          else seen.set(key, h);
        }
        return out;
      }
    },
    {
      id: 'long-sentence',
      title: 'Very long sentence',
      test: ({ texts }) => texts.flatMap((n) => {
        const longest = sentences(n.textContent).map(words).sort((a, b) => b - a)[0] || 0;
        return longest > LONG_SENTENCE ? [{ node: n, detail: longest + ' words' }] : [];
      })
    },
    {
      id: 'level-jump',
      title: 'Heading level skipped',
      test: ({ blocks }) => {
        let last = 1;
        const out = [];
        for (const h of blocks.filter((b) => /^H[2-4]$/.test(b.tagName))) {
          const lvl = Number(h.tagName[1]);
          if (lvl > last + 1) out.push({ node: h, detail: 'H' + (last) + ' → H' + lvl + ': ' + norm(h.textContent) });
          last = lvl;
        }
        return out;
      }
    },
    {
      id: 'typed-list',
      title: 'Typed numbering or bullet: use a list',
      test: ({ blocks }) => blocks.filter((b) => b.tagName === 'P' && /^\s*(\d{1,2}[.)]\s|[•▪◦*-]\s)/.test(b.textContent))
        .map((b) => ({ node: b, detail: norm(b.textContent).slice(0, 120) }))
    }
  ];

  /** Run every rule on a document root (default: the live document). */
  function check(root = area) {
    const content = [...root.querySelectorAll('.pagecontent')];
    const blocks = content.flatMap((c) => [...c.children]).filter((b) => !b.matches(SKIP));
    const steps = content.flatMap((c) => [...c.querySelectorAll('ol > li')]).filter((li) => !li.closest(SKIP));
    const texts = content.flatMap((c) => [...c.querySelectorAll('p, li, td')])
      .filter((n) => !n.closest(SKIP) && !n.querySelector('p, li, td') && norm(n.textContent));
    const ctx = { blocks, steps, texts };
    const out = [];
    for (const r of RULES) for (const f of r.test(ctx)) out.push({ rule: r.id, title: r.title, detail: f.detail, node: f.node });
    return out;
  }
  /** One line per rule, for the side-panel checklist. */
  function summary(findings) {
    const by = new Map();
    for (const f of findings) {
      if (!by.has(f.rule)) by.set(f.rule, { rule: f.rule, title: f.title, count: 0, nodes: [] });
      const s = by.get(f.rule);
      s.count++;
      s.nodes.push(f.node);
    }
    return [...by.values()];
  }
  return { RULES, check, summary };
})();
