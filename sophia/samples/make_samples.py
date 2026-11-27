#!/usr/bin/env python3
"""Writes the two FICTIONAL sample documents used by the tests, the CI and the agent kit.

    python3 sophia/samples/make_samples.py        (needs Pillow only to redraw the images)

Everything here is invented: company "Example Labs", portal "SupplyDesk", PID "DEMO".
The demo key below is NOT a secret: it only lets the automated tests enter edit mode in
these sample files. Real SOPHIA documents (corporate content, logos, real PID keys) are
never stored in the repository.

Outputs (committed, so tests run without Pillow):
    sophia/samples/sample-sop.html          SOP profile, ~2 A4 pages
    sophia/samples/sample-quick-card.html   Quick Card profile
They are SOPHIA *input* documents: build them with
    python3 sophia/build.py sophia/samples/sample-sop.html out.html
Block IDs are fixed (readable) so the example proposals in sophia/agent-kit can target them.
"""
import base64
import io
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
DEMO_REGISTRY = {"DEMO": "demo-key-for-tests-only"}  # fictional, not a secret
DATE = "2026-11-27"


def png(draw_fn, size):
    """Draw a small PNG with Pillow and return a data URI; falls back to the committed file."""
    from PIL import Image, ImageDraw, ImageFont  # noqa: WPS433 (optional dependency)
    img = Image.new("RGB", size, "white")
    d = ImageDraw.Draw(img)
    draw_fn(d, ImageFont)
    buf = io.BytesIO()
    img.save(buf, "PNG", optimize=True)
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode("ascii")


def logo(d, F):
    d.ellipse((8, 14, 60, 66), fill="#0f6b74")
    d.ellipse((22, 28, 46, 52), fill="white")
    d.text((74, 22), "EXAMPLE LABS", fill="#16324a", font=F.load_default(size=30))


def screenshot(d, F):
    d.rectangle((0, 0, 639, 359), outline="#9fb3c8", width=2)
    d.rectangle((0, 0, 639, 44), fill="#16324a")
    d.text((16, 12), "SupplyDesk · New order", fill="white", font=F.load_default(size=18))
    for i, label in enumerate(["Catalogue item", "Quantity", "Cost centre", "Delivery"]):
        y = 70 + i * 62
        d.text((24, y), label, fill="#33405a", font=F.load_default(size=16))
        d.rectangle((200, y - 6, 600, y + 26), outline="#9fb3c8", width=2)
    d.rounded_rectangle((440, 312, 600, 346), radius=8, fill="#0f6b74")
    d.text((470, 318), "Submit order", fill="white", font=F.load_default(size=16))


def sop_zone():
    rows = [
        '<section class="sheet">',
        '  <div class="brand"><img alt="Example Labs" class="corporate-logo" data-asset="samplelogo01"></div>',
        '  <div class="doc-classification">Classification: Internal · fictional sample</div>',
        '  <table class="identity"><tbody>'
        '<tr><td class="label">Level</td><td class="value">Team</td><td class="label">Organization</td><td class="value">Example Labs · Operations</td></tr>'
        '<tr><td class="label">Document Identity</td><td class="value">Working Instructions</td><td class="label">Document Owner</td><td class="value">TO BE CONFIRMED</td></tr>'
        '<tr><td class="label">Title</td><td class="value">Order laboratory consumables in SupplyDesk</td><td class="label">Document Version</td><td class="value" data-version-cell="true">V1</td></tr>'
        '</tbody></table>',
        '  <div class="pagecontent">',
        '    <aside class="warning" data-block-id="b-draftnote1"><b>SAMPLE DOCUMENT — FICTIONAL CONTENT</b><br>Used by the SOPHIA tests and the agent kit. Example Labs and SupplyDesk do not exist.</aside>',
        '    <h2 data-block-id="b-scopehead1">SCOPE</h2>',
        '    <p data-block-id="b-scopetext1">Describe how a laboratory technician orders consumables in SupplyDesk, follows the approval and receives the delivery at the correct location.</p>',
        '    <h2 data-block-id="b-generalhd1">GENERAL CONSIDERATIONS</h2>',
        '    <p data-block-id="b-generalpa1">Orders above the monthly budget of the cost centre need the approval of the laboratory manager. The <b>Catalogue</b> tab only shows items from contracted suppliers.</p>',
        '    <ul><li data-block-id="b-generalli1">Use the catalogue item number, not the supplier reference.</li><li data-block-id="b-generalli2">Hazardous items are delivered only to the chemical store.</li><li data-block-id="b-generalli3">The approval limit per order is TO BE CONFIRMED.</li></ul>',
        '    <h2 data-block-id="b-procedure1">PROCEDURES</h2>',
        '    <h3 data-block-id="b-accesshd01">Sign in to SupplyDesk</h3>',
        '    <ol><li data-block-id="b-accessst01">Open SupplyDesk from the intranet start page.</li><li data-block-id="b-accessst02">Sign in with your company account.</li><li data-block-id="b-accessst03">Check that your cost centre is shown at the top right.</li></ol>',
        '    <h3 data-block-id="b-orderhd001">Create the order</h3>',
        '    <p data-block-id="b-orderpa001">Select <b>New order</b>, search the item by its catalogue number and enter the quantity in <b>Quantity</b>.</p>',
        '    <figure data-block-id="b-orderfig01"><img alt="SupplyDesk new order form with catalogue item, quantity, cost centre and delivery fields" data-asset="sampleshot01"><figcaption>New order form in SupplyDesk (illustration).</figcaption></figure>',
        '    <aside class="warning" data-block-id="b-orderwarn1"><b>Confirmation required:</b> check whether frozen items can be ordered on Fridays.</aside>',
        '    <h3 data-block-id="b-approvehd1">Send the order for approval</h3>',
        '    <ol><li data-block-id="b-approvest1">Select <b>Submit order</b>.</li><li data-block-id="b-approvest2">Wait for the approval e-mail from the laboratory manager.</li><li data-block-id="b-approvest3">If the order is rejected, read the comment, correct the order and submit it again.</li></ol>',
        '    <h3 data-block-id="b-deliverhd1">Choose the delivery option</h3>',
        '    <table data-block-id="b-delivertb1"><tbody><tr><th>Option</th><th>When to use it</th></tr><tr><td>Laboratory</td><td>Standard consumables for daily work.</td></tr><tr><td>Chemical store</td><td>Hazardous or flammable items.</td></tr><tr><td>Cold room</td><td>Items that must stay below 8 °C.</td></tr></tbody></table>',
        '    <h2 data-block-id="b-reviewhd01">REVIEW POINTS AND SOURCE</h2>',
        '    <ul><li data-block-id="b-reviewli01">Confirm the approval limit with Finance.</li><li data-block-id="b-reviewli02">Confirm the Friday rule for frozen items.</li></ul>',
        '    <p data-block-id="b-reviewpa01">Report errors in this instruction to the document owner.</p>',
        '    <p class="source-note" data-block-id="b-sourcenot1">Source: fictional SupplyDesk user guide, version 2.1 (sample).</p>',
        '  </div>',
        '  <div class="pagefoot"><span class="page-number">1</span></div>',
        '</section>',
    ]
    return "\n".join(rows)


def qc_zone():
    rows = [
        '<section class="sheet">',
        '  <div class="qc-hero">',
        '    <div class="brand"><img alt="Example Labs" class="corporate-logo" data-asset="samplelogo01"></div>',
        '    <div class="eyebrow">EXAMPLE LABS · OPERATIONS · QUICK CARD</div>',
        '    <h1 data-block-id="b-qctitle001">Order consumables<br>in SupplyDesk</h1>',
        '    <p data-block-id="b-qcintro001">A one-page reference for laboratory technicians (fictional sample).</p>',
        '    <div class="hero-tags"><span>ACCESS</span><span>ORDER</span><span>APPROVAL</span><span>DELIVERY</span></div>',
        '    <table class="identity"><tbody>'
        '<tr><td class="label">Level</td><td class="value">Team</td><td class="label">Organization</td><td class="value">Example Labs · Operations</td></tr>'
        '<tr><td class="label">Document Identity</td><td class="value">Quick Card</td><td class="label">Document Owner</td><td class="value">TO BE CONFIRMED</td></tr>'
        '<tr><td class="label">Title</td><td class="value">Order consumables in SupplyDesk</td><td class="label">Document Version</td><td class="value" data-version-cell="true">V1</td></tr>'
        '</tbody></table>',
        '  </div>',
        '  <div class="pagecontent">',
        '    <aside class="warning" data-block-id="b-qcdraft001"><b>SAMPLE · FICTIONAL CONTENT</b><br>Used by the SOPHIA tests and the agent kit.</aside>',
        '    <h2 data-block-id="b-qcaccess01">ACCESS</h2>',
        '    <div class="cards"><section><h3 data-block-id="b-qccard0001">Open SupplyDesk</h3><p data-block-id="b-qccardtx01">Use the link on the intranet start page and sign in with your company account.</p></section><section><h3 data-block-id="b-qccard0002">Check the cost centre</h3><p data-block-id="b-qccardtx02">It is shown at the top right. Ask your manager if it is wrong.</p></section></div>',
        '    <table data-block-id="b-qcdecide01"><tbody><tr><th>Situation</th><th>Next action</th></tr><tr><td>Item not in the catalogue</td><td>Ask Purchasing for a new catalogue entry.</td></tr><tr><td>Budget exceeded</td><td>Submit anyway: the order goes to the laboratory manager.</td></tr></tbody></table>',
        '    <h2 data-block-id="b-qcorder001">ORDER</h2>',
        '    <p data-block-id="b-qcorderp01">Select <b>New order</b>, search by catalogue number and enter the <b>Quantity</b>.</p>',
        '    <div class="cards"><section><h3 data-block-id="b-qccard0003">Required fields</h3><ul><li data-block-id="b-qcfield001">Catalogue item</li><li data-block-id="b-qcfield002">Quantity</li><li data-block-id="b-qcfield003">Cost centre</li><li data-block-id="b-qcfield004">Delivery</li></ul></section><section class="pending"><h3 data-block-id="b-qccard0004">Frozen items</h3><p data-block-id="b-qccardtx04">Friday ordering rule to be confirmed.</p></section></div>',
        '    <h2 data-block-id="b-qcdeliver1">DELIVERY</h2>',
        '    <table data-block-id="b-qcdelivtb1"><tbody><tr><th>Option</th><th>Use it for</th></tr><tr><td>Laboratory</td><td>Standard consumables.</td></tr><tr><td>Chemical store</td><td>Hazardous items.</td></tr><tr><td>Cold room</td><td>Items below 8 °C.</td></tr></tbody></table>',
        '    <p data-block-id="b-qcreport01">Report errors to the document owner.</p>',
        '    <p class="source-note" data-block-id="b-qcsource01">Source: fictional SupplyDesk user guide, version 2.1 (sample).</p>',
        '  </div>',
        '  <div class="pagefoot"><span class="page-number">1</span></div>',
        '</section>',
    ]
    return "\n".join(rows)


def record(doc_id, zone, assets, kind):
    return {
        "id": doc_id, "status": "Draft", "documentVersion": "1", "documentType": kind,
        "source": "Fictional sample for SOPHIA tests", "format": "sophia/77",
        "revisions": [{"version": "1", "date": DATE, "author": "SOPHIA sample generator", "editorPID": None,
                       "publisherPID": None, "mode": "Created", "status": "Draft",
                       "reason": "Fictional sample document for tests and the agent kit", "engine": "V80",
                       "snapshot": zone.replace('data-asset="', 'src="sophia-asset:')}],
        "events": [], "comments": [], "settings": {"autoNumber": True}, "assets": assets,
    }


def page(title, profile, zone, rec):
    js = lambda v: json.dumps(v, ensure_ascii=False).replace("<", "\\u003c")
    return (
        "<!doctype html>\n"
        f'<html lang="en" data-profile="{profile}">\n<head><meta charset="utf-8"><title>{title}</title></head>\n<body>\n'
        "<!-- Fictional SOPHIA sample (input for sophia/build.py). Generated by make_samples.py. -->\n"
        f'<main id="document" class="workspace" data-sophia-zone="document">\n{zone}\n</main>\n'
        f'<script type="application/json" id="record">{js(rec)}</script>\n'
        f'<script type="application/json" id="sophia-pid-registry">{js(DEMO_REGISTRY)}</script>\n'
        "</body>\n</html>\n"
    )


def main():
    try:
        assets = {"samplelogo01": png(logo, (360, 80)), "sampleshot01": png(screenshot, (640, 360))}
    except ImportError:
        old = json.loads((HERE / "sample-sop.html").read_text(encoding="utf-8").split('id="record">')[1].split("</script>")[0])
        assets = old["assets"]
    sz, qz = sop_zone(), qc_zone()
    (HERE / "sample-sop.html").write_text(
        page("SAMPLE-SOP — fictional", "sop", sz, record("SAMPLE-SOP", sz, assets, "SOP")), encoding="utf-8")
    (HERE / "sample-quick-card.html").write_text(
        page("SAMPLE-QC — fictional", "quick-card", qz, record("SAMPLE-QC", qz, {"samplelogo01": assets["samplelogo01"]}, "Quick Card")), encoding="utf-8")
    print("wrote", HERE / "sample-sop.html", "and", HERE / "sample-quick-card.html")


if __name__ == "__main__":
    main()
