#!/usr/bin/env bash
# SOPHIA · run the whole safety net on the FICTIONAL sample documents.
#
#   bash sophia/tools/check.sh            lint + build + finalize + unit + proposals + functional + performance
#   bash sophia/tools/check.sh --quick    lint + build + finalize + unit only (about 30 s)
#
# Needs Python 3 and Node 18+ with Playwright (Chromium). Outputs go to a temporary folder
# (or $SOPHIA_OUT). Exit code 1 if anything fails. This is what the GitHub workflow runs.
set -euo pipefail
cd "$(dirname "$0")/../.."
OUT="${SOPHIA_OUT:-$(mktemp -d)}"
mkdir -p "$OUT"
QUICK="${1:-}"
fail=0
step() { printf '\n== %s\n' "$*"; }

step "architecture check"
python3 sophia/tools/lint.py

for doc in sop quick-card; do
  step "build + finalize · sample-$doc"
  python3 sophia/build.py "sophia/samples/sample-$doc.html" "$OUT/sample-$doc-raw.html"
  node sophia/tools/finalize.cjs "$OUT/sample-$doc-raw.html" "$OUT/sample-$doc.html" | sed -n 1p

  step "unit checks · sample-$doc"
  node sophia/tests/unit.cjs "$OUT/sample-$doc.html" | sed -n "\$p" || fail=1

  if [ -f sophia/tools/validate-proposal.cjs ] && [ -d "sophia/agent-kit/examples/$doc" ]; then
    step "agent-kit example proposals · sample-$doc"
    for p in sophia/agent-kit/examples/$doc/*.json; do
      node sophia/tools/validate-proposal.cjs "$OUT/sample-$doc.html" "$p" --expect "$(basename "$p" | sed -E 's/^[0-9]+-(valid|invalid).*/\1/')" || fail=1
    done
  fi

  if [ "$QUICK" != "--quick" ]; then
    step "functional test · sample-$doc"
    node sophia/tests/functional.cjs "$OUT/sample-$doc.html" "$OUT/functional-$doc" > "$OUT/functional-$doc.log" 2>&1 || fail=1
    grep -E '^(FAIL|ALL PASS|[0-9]+ FAIL)' "$OUT/functional-$doc.log" || true
  fi
done

if [ "$QUICK" != "--quick" ]; then
  step "performance · fictional long document (~40 A4 pages)"
  python3 sophia/samples/make_long.py "$OUT/long-src.html" --repeat 40 | sed -n 1p
  python3 sophia/build.py "$OUT/long-src.html" "$OUT/long.html" | sed -n '$p'
  node sophia/tests/performance.cjs "$OUT/long.html" || fail=1
fi

step "result"
if [ "$fail" = 0 ]; then echo "ALL CHECKS PASSED · outputs in $OUT"; else echo "SOME CHECKS FAILED · outputs in $OUT"; exit 1; fi
