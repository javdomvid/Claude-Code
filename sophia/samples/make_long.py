#!/usr/bin/env python3
"""Make a LONG fictional SOP for performance tests (not committed; written where you say).

    python3 sophia/samples/make_long.py <out.html> [--repeat 14]

Takes sophia/samples/sample-sop.html and repeats its PROCEDURES sub-sections (with their
steps, figure, warning and table) N times with new block IDs, so the document reaches
~40+ A4 pages with many images. Build it like any other document:
    python3 sophia/build.py <out.html> <built.html>
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
src = (HERE / "sample-sop.html").read_text(encoding="utf-8")
out = pathlib.Path(sys.argv[1])
repeat = int(sys.argv[sys.argv.index("--repeat") + 1]) if "--repeat" in sys.argv else 14
start = src.index('    <h3 data-block-id="b-accesshd01">')
end = src.index('    <h2 data-block-id="b-reviewhd01">')
chunk = src[start:end]
copies = []
for i in range(1, repeat + 1):
    # keep IDs unique and valid (b- + 10 chars): first 4 + copy number + last 4
    c = re.sub(r'data-block-id="b-([a-z0-9]{10})"', lambda m: 'data-block-id="b-%s%02d%s"' % (m.group(1)[:4], i, m.group(1)[-4:]), chunk)
    c = c.replace("Sign in to SupplyDesk", "Sign in to SupplyDesk (case %d)" % i).replace("Create the order", "Create the order (case %d)" % i)
    c = c.replace("Send the order for approval", "Send the order for approval (case %d)" % i).replace("Choose the delivery option", "Choose the delivery option (case %d)" % i)
    copies.append(c)
long = src[:start] + "".join(copies) + src[end:]
long = long.replace('"id":"SAMPLE-SOP"', '"id":"SAMPLE-LONG"').replace('"id": "SAMPLE-SOP"', '"id": "SAMPLE-LONG"')
out.write_text(long, encoding="utf-8")
print("wrote", out, "·", repeat, "copies of the procedures")
