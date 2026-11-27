#!/usr/bin/env python3
"""SOPHIA architecture check — run automatically by build.py (a build stops on ERRORS).

    python3 sophia/tools/lint.py            check, print errors and warnings
    python3 sophia/tools/lint.py --map      also rewrite sophia/MODULES.md from the module cards

WHY: SOPHIA is one HTML file made of ~40 modules. They stay easy to change only if every
module says what it owns and what it offers, and if the layers do not get tangled. This tool
reads the code and the "module card" at the top of every engine module and checks that they
agree. It is the first thing to run after you change anything in sophia/src.

What it checks (E = error, stops the build · W = warning, fix when you touch the module):
  E1  every engine module starts with a module card that has PURPOSE, OWNS, EXPORTS, USES,
      RULES, TESTS and a "layer:" tag
  E2  every global the module creates (window.X, SOPHIA.x, top-level function/const/let/var)
      is named in its EXPORTS line  (a hidden global is how modules start breaking each other)
  E3  layers: CORE / SAFETY / DOCUMENT / FEATURE modules never use the interface
      (SOPHIA.ui, side(), Workbench, SophiaFlow); they ask with SOPHIA.ask.* instead
  E4  every bus event that is listened to is emitted somewhere (catches typos)
  E5  every command id placed in a panel, menu or button is registered; no id is registered twice
  E6  forbidden in the offline single file: eval, new Function, fetch, XMLHttpRequest,
      document.write, external http(s) URLs (except XML namespaces), '</script', '<!--'
  E7  every styles/ui/NN-name.css belongs to an engine module NN-name.js (or is the studio
      family sheet) and starts with its header
  E8  every interface language module (09-lang-xx) only translates strings, has the same
      keys as the Spanish reference, no empty translation and the same {n}/{x} placeholders
  W1  a SOPHIA.x the module uses is not mentioned in its USES line
  W2  a bus event the module emits / listens to is not in its EMITS / LISTENS line
  W3  module longer than 2000 lines (split it along its MAP sections)
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ENGINE = ROOT / "src" / "engine"
UI_CSS = ROOT / "src" / "styles" / "ui"
LAYERS = ["CORE", "SAFETY", "DOCUMENT", "FEATURE", "SHELL", "BOOT"]
NO_UI_LAYERS = {"CORE", "SAFETY", "DOCUMENT", "FEATURE"}
REQUIRED = ["PURPOSE", "OWNS", "EXPORTS", "USES", "RULES", "TESTS"]
FIELDS = REQUIRED + ["EMITS", "LISTENS", "DOM", "MAP", "NOTE"]
URL_OK = ("schemas.openxmlformats.org", "www.w3.org", "purl.org", "schemas.microsoft.com")

errors, warnings = [], []


def err(code, where, msg):
    errors.append(f"{code} {where}: {msg}")


def warn(code, where, msg):
    warnings.append(f"{code} {where}: {msg}")


def strip_comments_and_strings(js):
    """Code with comments removed and string contents blanked (keeps quotes and length roughly)."""
    out, i, n = [], 0, len(js)
    while i < n:
        c = js[i]
        if js.startswith("/*", i):
            j = js.find("*/", i + 2)
            j = n if j < 0 else j + 2
            out.append("\n" * js.count("\n", i, j)); i = j; continue
        if js.startswith("//", i) and (i == 0 or js[i - 1] != ":" ):
            j = js.find("\n", i)
            i = n if j < 0 else j; continue
        if c in "'\"`":
            q, j = c, i + 1
            while j < n and js[j] != q:
                if js[j] == "\\": j += 1
                elif q == "`" and js.startswith("${", j):
                    depth = 1; j += 2
                    while j < n and depth:
                        if js[j] == "{": depth += 1
                        elif js[j] == "}": depth -= 1
                        j += 1
                    continue
                j += 1
            seg = js[i:j + 1]
            out.append(q + re.sub(r"[^\n]", " ", seg[1:-1]) + q); i = j + 1; continue
        out.append(c); i += 1
    return "".join(out)


def read_card(name, text):
    m = re.match(r"\s*/\*\s*=+\s*\n(.*?)\n\s*\*\s*=+\s*\*/", text, re.S)
    if not m:
        return None
    lines = [re.sub(r"^\s*\* ?", "", l) for l in m.group(1).split("\n")]
    card = {"_head": lines[0] if lines else ""}
    lm = re.search(r"layer:\s*([A-Z]+)", card["_head"])
    card["layer"] = lm.group(1) if lm else None
    cur = None
    for l in lines[1:]:
        fm = re.match(r"([A-Z]+)\s{2,}(.*)$", l)
        if fm and fm.group(1) in FIELDS:
            cur = fm.group(1); card[cur] = fm.group(2).strip(); continue
        if cur and l.strip() and not re.match(r"^-{5,}", l.strip()):
            card[cur] += " " + l.strip()
    return card


def expand(text):
    """'SOPHIA.ui.{view, appbar}' → also 'SOPHIA.ui.view SOPHIA.ui.appbar'."""
    def rep(m):
        base, items = m.group(1), m.group(2)
        return " ".join(base + "." + re.split(r"[\s(]", x.strip())[0] for x in items.split(",") if x.strip())
    return text + " " + re.sub(r"([A-Za-z_][\w.]*)\.\{([^}]*)\}", rep, text)


def main():
    write_map = "--map" in sys.argv
    modules = sorted(ENGINE.glob("*.js"))
    stems = {m.stem for m in modules}
    emitted, listened, registered, placed = {}, {}, {}, []
    cards = {}
    for m in modules:
        text = m.read_text(encoding="utf-8")
        code = strip_comments_and_strings(text)
        name = m.stem
        card = read_card(name, text)
        if not card:
            err("E1", name, "no module card at the top of the file"); continue
        cards[name] = card
        missing = [f for f in REQUIRED if f not in card]
        if missing:
            err("E1", name, "module card lacks " + ", ".join(missing))
        if card.get("layer") not in LAYERS:
            err("E1", name, "module card needs 'layer: " + "|".join(LAYERS) + "' on its first line")
        exports = expand(card.get("EXPORTS", ""))
        uses = expand(card.get("USES", "")) + " " + exports + " " + card.get("OWNS", "")
        # E2 — globals created by this module
        for g in re.finditer(r"^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=|^window\.([A-Za-z_$][\w$]*)\s*=|^(SOPHIA(?:\.[A-Za-z_$][\w$]*)+)\s*=", code, re.M):
            ident = next(x for x in g.groups() if x)
            short = ident.split(".")[-1]
            if ident.startswith("SOPHIA."):
                ok = ident in exports or (ident + ".") in exports or re.search(re.escape(ident) + r"\b", exports)
            else:
                ok = re.search(r"(?<![\w.])" + re.escape(short) + r"\b", exports)
            if not ok:
                err("E2", name, f"creates global '{ident}' but EXPORTS does not name it")
        # E3 — layers
        if card.get("layer") in NO_UI_LAYERS:
            for pat, what in [(r"SOPHIA\.ui\b", "SOPHIA.ui"), (r"(?<![\w.])side\(", "side()"), (r"\bWorkbench\b", "Workbench"), (r"\bSophiaFlow\b", "SophiaFlow")]:
                for hit in re.finditer(pat, code):
                    line = code.count("\n", 0, hit.start()) + 1
                    err("E3", f"{name}:{line}", f"layer {card['layer']} must not use {what}; use SOPHIA.ask.* (00-core)")
        # bus
        for e in re.finditer(r"bus\.emit\(\s*['\"]([\w:-]+)['\"]", text):
            emitted.setdefault(e.group(1), set()).add(name)
        for e in re.finditer(r"bus\.on\(\s*['\"]([\w:-]+)['\"]", text):
            listened.setdefault(e.group(1), set()).add(name)
        for ev in sorted({e.group(1) for e in re.finditer(r"bus\.emit\(\s*['\"]([\w:-]+)['\"]", text)}):
            if ev not in card.get("EMITS", "") and not ev.startswith("ask:"):
                warn("W2", name, f"emits '{ev}' but EMITS does not list it")
        for ev in sorted({e.group(1) for e in re.finditer(r"bus\.on\(\s*['\"]([\w:-]+)['\"]", text)}):
            if ev not in card.get("LISTENS", "") and not ev.startswith("ask:"):
                warn("W2", name, f"listens to '{ev}' but LISTENS does not list it")
        # W1 — SOPHIA.x used but not declared
        for u in sorted({x for x in re.findall(r"SOPHIA\.([a-zA-Z_]\w*)", code)}):
            if u in ("ui", "util", "bus", "strings", "engine", "profile", "ask"):
                continue
            if not re.search(r"SOPHIA\." + re.escape(u) + r"\b", uses):
                warn("W1", name, f"uses SOPHIA.{u} but USES does not mention it")
        # commands
        for r in re.finditer(r"(?<![\w.])(?:R|T)\(\s*'([\w]+)'|commands\.register\(\s*'([\w]+)'|Workbench\.register\(\s*['\"]([\w]+)['\"]", text):
            cid = next(x for x in r.groups() if x)
            registered.setdefault(cid, []).append(name)
        for blk in re.finditer(r"items:\s*\[([^\]]*)\]", text):
            placed += [(name, x) for x in re.findall(r"'([@\w-]+)'", blk.group(1))]
        for b in re.finditer(r"(?<![\w.])button\(\s*'(\w+)'", text):
            placed.append((name, b.group(1)))
        for mm in re.finditer(r"menu\([^,\[]+,\s*\[([^\]]*)\]", text):
            placed += [(name, x) for x in re.findall(r"'([@\w-]+)'", mm.group(1))]
        # E6 — forbidden
        for pat, what in [(r"\beval\s*\(", "eval"), (r"\bnew\s+Function\b", "new Function"), (r"\bfetch\s*\(", "fetch"),
                          (r"\bXMLHttpRequest\b", "XMLHttpRequest"), (r"document\.write\s*\(", "document.write")]:
            for hit in re.finditer(pat, code):
                err("E6", f"{name}:{code.count(chr(10), 0, hit.start()) + 1}", f"{what} is not allowed (offline single file)")
        for hit in re.finditer(r"https?://([\w.-]+)", text):
            if not hit.group(1).endswith(URL_OK):
                err("E6", f"{name}:{text.count(chr(10), 0, hit.start()) + 1}", f"external URL {hit.group(0)} (the file must work offline)")
        low = text.lower()
        if "</script" in low or "<!--" in low:
            err("E6", name, "contains '</script' or '<!--' — write '\\x3c/script>' instead")
        n_lines = text.count("\n") + 1
        if n_lines > 2000:
            warn("W3", name, f"{n_lines} lines — consider splitting along its MAP sections")
        card["_lines"] = n_lines
    # E4 — bus events
    for ev, who in sorted(listened.items()):
        if ev not in emitted:
            err("E4", ", ".join(sorted(who)), f"listens to bus event '{ev}' that no module emits")
    # E5 — commands
    for cid, who in registered.items():
        if len(who) > 1 and len(set(who)) == len(who) and not all(w in ("79-shell", "85-flow") for w in who):
            err("E5", ", ".join(who), f"command '{cid}' is registered more than once")
    for where, cid in placed:
        if cid.startswith("@") or cid == "-":
            continue
        if cid not in registered:
            err("E5", where, f"places command '{cid}' that is not registered")
    # E7 — module stylesheets
    for css in sorted(UI_CSS.glob("*.css")):
        if css.stem not in stems and css.stem != "98-studio-family":
            err("E7", f"styles/ui/{css.name}", "has no engine module with the same name")
        if not css.read_text(encoding="utf-8").startswith("/* ====="):
            err("E7", f"styles/ui/{css.name}", "starts without its header comment")
    # E8 — language dictionaries
    langs = sorted(ENGINE.glob("09-lang-*.js"))
    ref = None
    dicts = {}
    for lf in langs:
        t = lf.read_text(encoding="utf-8")
        m = re.search(r"/\*DICT\*/(\{.*?\})/\*END\*/", t, re.S)
        if not m:
            err("E8", lf.stem, "dictionary must be written as /*DICT*/{…}/*END*/ (JSON)"); continue
        try:
            d = json.loads(m.group(1))
        except json.JSONDecodeError as e:
            err("E8", lf.stem, f"dictionary is not valid JSON: {e}"); continue
        dicts[lf.stem] = d
        for k, v in d.items():
            if not isinstance(v, str) or not v.strip():
                err("E8", lf.stem, f"empty translation for {k!r}")
            elif sorted(re.findall(r"\{(?:n\d?|[xyz])\}", k)) != sorted(re.findall(r"\{(?:n\d?|[xyz])\}", v)):
                err("E8", lf.stem, f"placeholders differ between {k!r} and its translation {v!r}")
    if "09-lang-es" in dicts:
        ref = set(dicts["09-lang-es"])
        for lf, d in dicts.items():
            miss, extra = ref - set(d), set(d) - ref
            if miss:
                err("E8", lf, f"{len(miss)} key(s) missing compared with 09-lang-es, e.g. {sorted(miss)[:3]}")
            if extra:
                err("E8", lf, f"{len(extra)} key(s) not in 09-lang-es, e.g. {sorted(extra)[:3]}")

    for w in warnings:
        print("warning", w)
    for e in errors:
        print("ERROR  ", e)
    print(f"lint: {len(modules)} modules, {len(list(UI_CSS.glob('*.css')))} module stylesheets, "
          f"{len(registered)} commands, {len(emitted)} bus events · {len(errors)} error(s), {len(warnings)} warning(s)")
    if write_map:
        write_modules_md(cards)
    return 1 if errors else 0


def write_modules_md(cards):
    out = ["# SOPHIA · module map", "",
           "Generated by `python3 sophia/tools/lint.py --map` from the module card at the top of every",
           "file in `sophia/src/engine`. Do not edit by hand: change the card, then regenerate.", "",
           "Layers, in load order: CORE → SAFETY → DOCUMENT → FEATURE → SHELL → BOOT. Dependencies point",
           "towards CORE. Enforced (lint E3): nothing below SHELL uses the interface; it asks with",
           "SOPHIA.ask.*. See `ARCHITECTURE.md`.", ""]
    for layer in LAYERS:
        mods = [(n, c) for n, c in cards.items() if c.get("layer") == layer]
        if not mods:
            continue
        out += [f"## {layer}", "", "| Module | Purpose | Exports | Stylesheet |", "|---|---|---|---|"]
        for n, c in mods:
            css = f"`styles/ui/{n}.css`" if (UI_CSS / f"{n}.css").exists() else "—"
            cell = lambda s: s.replace("|", "\\|")
            out.append(f"| `{n}` ({c.get('_lines', '?')} lines) | {cell(c.get('PURPOSE', ''))} | {cell(c.get('EXPORTS', ''))} | {css} |")
        out.append("")
    (ROOT / "MODULES.md").write_text("\n".join(out) + "\n", encoding="utf-8")
    print("wrote", ROOT / "MODULES.md")


if __name__ == "__main__":
    sys.exit(main())
