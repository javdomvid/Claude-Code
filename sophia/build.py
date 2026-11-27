#!/usr/bin/env python3
"""SOPHIA build — assembles a single-file editor from sophia/src + a document.

    python3 sophia/build.py <input.html> <output.html>

<input.html> is any SOPHIA document (V74, V75, V76 or V77, SOP or Quick Card). Only its
CONTENT is taken: the document zone (#document), the record (#record) and the local PID
registry. Everything else (styles, engine, docs) comes from sophia/src, so a build never
carries old patch layers forward.

Before building, tools/lint.py checks the module contracts (a build stops on errors).

The output opens directly in Edge/Chrome. If the input was older than V77, the editor
upgrades it on open (block IDs, automatic heading numbers) and records a "Migration"
revision at the next save. To deliver an already-upgraded file, run
    node sophia/tools/finalize.cjs <output.html> <final.html>
which opens the build headless and writes it with SOPHIA's own serializer.
"""
import base64
import html.parser
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
ENGINE = "V79"


def fail(msg):
    sys.exit("build.py: " + msg)


class ZoneFinder(html.parser.HTMLParser):
    """Finds the start/end offsets of the element with id="document"."""

    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.line_starts = [0]
        for m in re.finditer("\n", text):
            self.line_starts.append(m.end())
        self.tag = None
        self.depth = 0
        self.inner_start = None
        self.inner_end = None
        self.capture = None
        self.scripts = {}

    def pos(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "script" and a.get("id") in ("record", "sophia-pid-registry"):
            self.capture = a["id"]
            self.scripts[self.capture] = ""
            return
        if self.inner_end is not None:
            return
        if self.tag is None:
            if dict(attrs).get("id") == "document":
                self.tag = tag
                self.depth = 1
                self.inner_start = self.pos() + len(self.get_starttag_text())
            return
        if tag == self.tag and tag not in self.VOID:
            self.depth += 1

    def handle_data(self, data):
        if self.capture:
            self.scripts[self.capture] += data

    def handle_endtag(self, tag):
        if tag == "script":
            self.capture = None
        if self.tag is None or self.inner_end is not None:
            return
        if tag == self.tag:
            self.depth -= 1
            if self.depth == 0:
                self.inner_end = self.pos()


def extract(text):
    finder = ZoneFinder(text)
    # Parse only up to the record/scripts that follow the zone is not enough for old files
    # (scripts precede the zone), so feed everything; HTMLParser handles <script> as CDATA.
    finder.feed(text)
    if finder.inner_start is None or finder.inner_end is None:
        fail("no #document element found — is this a SOPHIA file?")
    zone = text[finder.inner_start:finder.inner_end]
    if "record" not in finder.scripts:
        fail("no #record found")
    record = json.loads(finder.scripts["record"])
    keys = {}
    if "sophia-pid-registry" in finder.scripts:
        keys = json.loads(finder.scripts["sophia-pid-registry"] or "{}")
    else:
        m = re.search(r"const\s+localPIDKeys\s*=\s*(\{[^}]*\})", text)
        if m:
            try:
                keys = json.loads(m.group(1))
            except json.JSONDecodeError:
                print("build.py: warning — localPIDKeys could not be read; the registry is empty", file=sys.stderr)
    profile = "quick-card" if 'class="qc-hero"' in zone or "class='qc-hero'" in zone else "sop"
    return zone, record, keys, profile


def script_json(value):
    s = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return (s.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
             .replace("\u2028", "\\u2028").replace("\u2029", "\\u2029"))


def safe_inline(name, text):
    low = text.lower()
    if "</script" in low or "<!--" in low:
        fail(f"{name} contains '</script' or '<!--' — escape it (e.g. '\\x3c/script>') so the file stays one piece")
    return text


def fonts_css():
    out = ["/* DM Sans (variable, Latin) · SIL Open Font License 1.1 · Copyright 2014 The DM Sans Project Authors.\n"
           " * Embedded so documents look and print the same on every computer (owner decision I). */"]
    for style, file in (("normal", "dm-sans-latin-wght-normal.woff2"), ("italic", "dm-sans-latin-wght-italic.woff2")):
        data = base64.b64encode((SRC / "fonts" / file).read_bytes()).decode("ascii")
        out.append('@font-face{font-family:"DM Sans";font-style:%s;font-weight:100 1000;font-display:block;'
                   'src:url(data:font/woff2;base64,%s) format("woff2")}' % (style, data))
    return "\n".join(out)


def lint():
    """Architecture check first (tools/lint.py): a build with broken module contracts stops here."""
    import importlib.util
    spec = importlib.util.spec_from_file_location("sophia_lint", ROOT / "tools" / "lint.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if mod.main() != 0:
        fail("architecture check failed (see ERROR lines above). Fix them, or read sophia/ARCHITECTURE.md.")


def build(input_path, output_path):
    lint()
    text = pathlib.Path(input_path).read_text(encoding="utf-8")
    zone, record, keys, profile = extract(text)
    short = "qc" if profile == "quick-card" else "sop"
    read = lambda p: (SRC / p).read_text(encoding="utf-8")
    # Style order (cascade): fonts · tokens · paper · one "ui:NN-name" block per module stylesheet
    # (styles/ui/NN-name.css, in name order, next to engine/NN-name.js) · print LAST.
    styles = [
        ("fonts", fonts_css()),
        ("tokens", read("styles/tokens.css")),
        ("paper", read(f"styles/paper.{short}.css") + "\n" + read("styles/paper.common.css")),
    ]
    styles += [("ui:" + f.stem, f.read_text(encoding="utf-8")) for f in sorted((SRC / "styles" / "ui").glob("*.css"))]
    styles.append(("print", read("styles/print.css")))
    for name, css in styles:
        if "</style" in css.lower():
            fail(f"style {name} contains '</style'")
    docs = [("agent-brief", "sophia-agent-brief", "docs/agent-brief.md"),
            ("ui-contract", "sophia-ui-contract", "docs/ui-contract.md"),
            ("changelog", "sophia-changelog", "docs/changelog.md")]
    modules = sorted((SRC / "engine").glob("*.js"))
    label = "Quick Card" if profile == "quick-card" else "SOP"
    parts = [
        "<!doctype html>",
        f'<html lang="en" data-profile="{profile}" data-sophia="{ENGINE}">',
        "<head>",
        '<meta charset="utf-8">',
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
        f"<title>{record.get('id', 'Document')} — {label} Editor {ENGINE}</title>",
    ]
    parts += [f'<style data-sophia="{n}">{css}</style>' for n, css in styles]
    parts += ["</head>", "<body>",
              "<!-- ===== SOPHIA DOCUMENT ZONE (see #sophia-agent-brief before editing) ===== -->",
              '<main id="document" class="workspace" data-sophia-zone="document">' + zone + "</main>",
              "<!-- ===== END DOCUMENT ZONE ===== -->",
              f'<script type="application/json" id="record">{script_json(record)}</script>',
              f'<script type="application/json" id="sophia-pid-registry">{script_json(keys)}</script>']
    for kind, ident, path in docs:
        parts.append(f'<script type="text/plain" data-sophia-doc="{kind}" id="{ident}">{safe_inline(path, read(path))}</script>')
    for m in modules:
        parts.append(f'<script data-sophia-module="{m.stem}">{safe_inline(m.name, m.read_text(encoding="utf-8"))}</script>')
    parts += ["</body>", "</html>", ""]
    pathlib.Path(output_path).write_text("\n".join(parts), encoding="utf-8")
    print(f"{output_path}: {profile}, record {record.get('id')}, V{record.get('documentVersion', '1')}, "
          f"{len(modules)} modules, {pathlib.Path(output_path).stat().st_size // 1024} KB")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        fail(__doc__)
    build(sys.argv[1], sys.argv[2])
