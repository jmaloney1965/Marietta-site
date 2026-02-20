#!/usr/bin/env python3
"""
Rebuild capabilities.pdf from the original, preserving header exactly.
- Extract header elements (images + text + logo) from original
- Rebuild pages with 10pt minimum fonts
- Add thin gray separator lines between sections
- Add Antenna Integration Services
- Add Flat Lens patent
"""

import pymupdf

ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
ORIG_PATH = "/Users/jim.maloney/.openclaw/workspace/capabilities-original.pdf"

C_GOLD = (0.91, 0.72, 0.19)
C_NAVY_DARK = (0.12, 0.23, 0.37)
C_NAVY_MED = (0.18, 0.35, 0.54)
C_BODY = (0.20, 0.20, 0.20)
C_CONTACT = (0.13, 0.13, 0.13)
C_GRAY = (0.53, 0.53, 0.53)
C_LINE = (0.78, 0.78, 0.78)  # thin separator lines
WHITE = (1, 1, 1)
W, H = 612, 792

SZ_TITLE = 18
SZ_SUBTITLE = 10
SZ_SECTION = 12
SZ_LABEL = 10.5
SZ_BODY = 10
SZ_FOOTER = 10
SZ_CONTACT = 10

# ============================================================
# Extract header elements from original
# ============================================================
orig = pymupdf.open(ORIG_PATH)
p0 = orig[0]

# Get all images
img_list = p0.get_images(full=True)
# img_list[0] is the logo (796x165), there should also be header bg and accent

# Extract each image by xref
extracted = {}
for img in img_list:
    xref = img[0]
    pix = pymupdf.Pixmap(orig, xref)
    fname = f"/tmp/mrs_img_{xref}.png"
    # Handle CMYK
    if pix.n > 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    elif pix.n == 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    pix.save(fname)
    extracted[xref] = (fname, pix.width, pix.height)
    print(f"Extracted xref={xref}: {pix.width}x{pix.height} -> {fname}")

# From analysis:
# Image at (0,0,612,66) = header background - this is embedded as page content, not a simple image
# Image at (0,66,612,68.25) = accent line  
# Image at (29.76,13.2,220.8,52.8) = logo (xref with 796x165)
# The header bg and accent might be in the page's content stream, not extractable as simple images

# Better approach: render just the header area as a high-res pixmap
header_pix = p0.get_pixmap(clip=pymupdf.Rect(0, 0, 612, 68.25), dpi=288)
header_png = "/tmp/mrs_header_clean.png"
header_pix.save(header_png)
print(f"Header pixmap: {header_pix.width}x{header_pix.height}")

orig.close()


# ============================================================
# Build new PDF
# ============================================================
doc = pymupdf.open()


def setup_page(doc):
    """Create page with header from original (rendered as image to preserve everything)."""
    page = doc.new_page(width=W, height=H)
    page.insert_font(fontname="arial", fontfile=ARIAL)
    page.insert_font(fontname="arialb", fontfile=ARIAL_BOLD)
    # Insert the header as a single image — preserves logo, gradient, text, accent line
    page.insert_image(pymupdf.Rect(0, 0, 612, 68.25), filename=header_png)
    return page


def footer(page):
    page.insert_text((30, 777), "Marietta Research Solutions",
        fontname="arialb", fontsize=SZ_FOOTER, color=C_GRAY)
    page.insert_text((225, 777), "404-795-7674 | www.mariettaresearchsolutions.com",
        fontname="arial", fontsize=SZ_FOOTER, color=C_GRAY)
    page.insert_text((510, 777), "February 2026",
        fontname="arial", fontsize=SZ_FOOTER, color=C_GRAY)
    # Footer separator line
    page.draw_rect(pymupdf.Rect(30, 764, 582, 764.7), color=None, fill=C_LINE)


def sep_line(page, y):
    """Draw a thin gray separator line, centered between surrounding text.
    Previous elements typically end with ~4pt padding already baked in,
    and following text (section_head/bullet) renders at the returned y.
    So: above gap = trailing_pad(~4) + space_above(10) = ~14pt visual
        below gap = space_below(18) - ascender(~4) = ~14pt visual
    """
    line_y = y + 10
    page.draw_rect(pymupdf.Rect(30, line_y, 582, line_y + 0.7), color=None, fill=C_LINE)
    return line_y + 18


def section_head(page, y, text):
    page.insert_text((30, y), text, fontname="arialb", fontsize=SZ_SECTION, color=C_NAVY_MED)
    return y + SZ_SECTION + 6


def bullet_item(page, y, label, body):
    page.insert_text((30, y), "\u2022", fontname="arialb", fontsize=SZ_LABEL, color=C_GOLD)
    page.insert_text((42, y), label, fontname="arialb", fontsize=SZ_LABEL, color=C_NAVY_DARK)
    body_y = y + SZ_LABEL + 4
    r = pymupdf.Rect(44, body_y - SZ_BODY + 1, 582, body_y + 200)
    page.insert_textbox(r, body, fontname="arial", fontsize=SZ_BODY, color=C_BODY, align=0)
    tw = pymupdf.get_text_length(body, fontname="helv", fontsize=SZ_BODY)
    line_w = 582 - 44
    lines = max(1, int(tw / line_w + 0.999))
    return body_y + lines * (SZ_BODY + 3) + 4


def small_bullet(page, y, label, body):
    page.insert_text((30, y), "\u2022", fontname="arialb", fontsize=SZ_BODY, color=C_GOLD)
    page.insert_text((42, y), label, fontname="arialb", fontsize=SZ_BODY, color=C_NAVY_DARK)
    body_y = y + SZ_BODY + 3
    r = pymupdf.Rect(44, body_y - SZ_BODY + 1, 582, body_y + 60)
    page.insert_textbox(r, body, fontname="arial", fontsize=SZ_BODY, color=C_BODY, align=0)
    tw = pymupdf.get_text_length(body, fontname="helv", fontsize=SZ_BODY)
    line_w = 582 - 44
    lines = max(1, int(tw / line_w + 0.999))
    return body_y + lines * (SZ_BODY + 3) + 3


# ============================================================
# PAGE 1
# ============================================================
page = setup_page(doc)

y = 85

# Contact
page.insert_text((30, y), "Susan Mercer \u2014 President", fontname="arialb", fontsize=SZ_CONTACT, color=C_NAVY_MED)
page.insert_text((30, y + 13), "susan@mariettaresearchsolutions.com | 404-795-7674", fontname="arial", fontsize=SZ_CONTACT, color=C_CONTACT)

page.insert_text((310, y), "Dr. James G. Maloney, PhD, MBA", fontname="arialb", fontsize=SZ_CONTACT, color=C_NAVY_MED)
page.insert_text((310, y + 13), "jim@mariettaresearchsolutions.com | 770-286-0254", fontname="arial", fontsize=SZ_CONTACT, color=C_CONTACT)

y += 18
y = sep_line(page, y)
page.insert_text((30, y), "Office:", fontname="arialb", fontsize=SZ_CONTACT, color=C_NAVY_MED)
page.insert_text((68, y), "1640 Powers Ferry Rd SE, Bldg 11, Ste 200, Marietta, GA 30067", fontname="arial", fontsize=SZ_CONTACT, color=C_CONTACT)
page.insert_text((420, y), "Web:", fontname="arialb", fontsize=SZ_CONTACT, color=C_NAVY_MED)
page.insert_text((448, y), "mariettaresearchsolutions.com", fontname="arial", fontsize=SZ_CONTACT, color=C_NAVY_MED)

y += 14
y = sep_line(page, y)

y = section_head(page, y, "Core Engineering Services")

y = bullet_item(page, y, "Computational Electromagnetics",
    "Proprietary FDTD electromagnetic simulation engine developed over 25+ years and used extensively "
    "across the defense community. Full-wave 3D analysis for antenna performance, scattering, coupling, "
    "and near-field characterization. Custom simulation tool development and RF materials characterization.")

y = bullet_item(page, y, "Antenna Design & Optimization",
    "Inventor of the Fragmented Aperture Antenna (US Patents 6,323,809 & 11,228,102) \u2014 a genetically "
    "optimized antenna topology. Broadband and wideband design from UHF through millimeter wave. Phased "
    "array element design. Electrically small antennas. Custom impedance matching network design.")

y = bullet_item(page, y, "Antenna Integration Services",
    "End-to-end antenna integration for IoT, wireless, and embedded devices. Antenna selection and trade "
    "studies, matching network design with component-level specs, full-wave EM simulation in device context, "
    "and test & tuning plans for prototype bring-up. LoRa, Bluetooth/Wi-Fi, cellular, GNSS, sub-GHz ISM, "
    "medical, and drones. Vendor-neutral. Remote-first. Fixed-scope engagements.")

y = bullet_item(page, y, "Platform Integration & Installed Performance",
    "Installed antenna analysis on vehicles, aircraft, and ships. EMI/EMC assessment and mitigation. "
    "RCS prediction, shaping, and treatment design for low-observable platforms. Co-site interference "
    "analysis. Radome and canopy RF scanning for military specification compliance.")

y = bullet_item(page, y, "AI/ML-Accelerated Engineering (Coming August 2026)",
    "ML surrogate models trained on proprietary FDTD data. Neural network-driven antenna optimization. "
    "Physics-informed ML models. AI-orchestrated design pipelines for faster iteration cycles.")

y = bullet_item(page, y, "SBIR/STTR Proposal Support",
    "Technical volume writing and proposal development for SBIR/STTR grants. Innovation narratives, "
    "feasibility arguments, work plans, milestones, and solicitation alignment.")

y = bullet_item(page, y, "Patent Drafting Support",
    "Technical drafting for patent materials prepared for attorney review. Invention disclosure, "
    "technical descriptions, figure preparation, and structured explanations of innovations.")

y = sep_line(page, y)
y = section_head(page, y, "Industries Served")

r = pymupdf.Rect(44, y - SZ_BODY + 1, 582, y + 30)
page.insert_textbox(r,
    "Defense & Aerospace \u00b7 Telecommunications (5G/6G) \u00b7 Satellite & Space \u00b7 "
    "IoT & Embedded Systems \u00b7 Automotive \u00b7 Intelligence Community",
    fontname="arial", fontsize=SZ_BODY, color=C_BODY, align=0)

footer(page)
print(f"Page 1: last content y = {y:.0f}")


# ============================================================
# PAGE 2
# ============================================================
page = setup_page(doc)

y = 85
y = section_head(page, y, "Additional Professional Services")

y = bullet_item(page, y, "AI for Small Businesses & Law Firms",
    "Practical AI workflow implementation. Intake organization, drafting support, research workflows, "
    "and reusable templates. Deliverables include prompt libraries, SOPs, checklists, and staff training.")

y = bullet_item(page, y, "Paralegal Support & Document Preparation",
    "Professional document preparation and administrative support. Form prep, records organization, "
    "proofreading, and filing readiness. Non-legal support only.")

y = bullet_item(page, y, "Prison Consulting & Reentry Support",
    "Structured non-legal support for planning, documentation, and reentry organization. "
    "Checklist-based timelines and practical reentry planning.")

y = bullet_item(page, y, "Notary Public Services",
    "Professional notarizations by appointment in Marietta, Georgia.")

y = sep_line(page, y)
y = section_head(page, y, "Engagement Options")

y = small_bullet(page, y, "Initial Consultation",
    "Confirm goals, scope, timeline, and deliverables (phone or virtual). No-obligation.")
y = small_bullet(page, y, "Hourly Support",
    "Flexible support for ongoing tasks, technical work, and document development.")
y = small_bullet(page, y, "Fixed-Fee Projects",
    "Defined scope and deliverables with agreed pricing before work begins.")
y = small_bullet(page, y, "Retainer Agreements",
    "Reserved capacity for clients requiring ongoing engineering support or advisory services.")

y = sep_line(page, y)
y = section_head(page, y, "Proprietary Tools & Credentials")

y = small_bullet(page, y, "Proprietary FDTD Solver",
    "Production-grade, full-wave 3D electromagnetic simulation engine. Used by multiple defense "
    "contractors and government laboratories.")
y = small_bullet(page, y, "Antenna Matching Suite",
    "Specialized tools for broadband impedance matching, combining circuit synthesis with full-wave validation.")

# Patents
page.insert_text((30, y), "\u2022", fontname="arialb", fontsize=SZ_LABEL, color=C_GOLD)
page.insert_text((42, y), "Patents & Publications", fontname="arialb", fontsize=SZ_LABEL, color=C_NAVY_DARK)
y += SZ_LABEL + 4

patent_lines = [
    ("\u2013  Granted:", "US 6,323,809 & 11,228,102 (Fragmented Aperture) \u00b7 US 11,937,270 (Flat Lens) \u00b7 US 11,215,655 (Transmission Line Correction) \u00b7 US 10,203,202 (Non-Contact Coating) \u00b7 US 5,689,275 (Photonic Bandgap)"),
    ("\u2013  Applications:", "US 20030108263 & 20030108265 (Polarization Multiplexed Optical)"),
    ("\u2013  Awards:", "IEEE AP-S Best Paper (1993) & Runner-up (1992)"),
    ("\u2013  Book:", "Fragmented Aperture Antennas (in progress)"),
    ("\u2013  Scholar:", "scholar.google.com/citations?user=445KFCoAAAAJ"),
]

for dash_label, dash_body in patent_lines:
    full = f"{dash_label} {dash_body}"
    r = pymupdf.Rect(54, y - SZ_BODY + 1, 582, y + 50)
    page.insert_textbox(r, full, fontname="arial", fontsize=SZ_BODY, color=C_BODY, align=0)
    tw = pymupdf.get_text_length(full, fontname="helv", fontsize=SZ_BODY)
    line_w = 582 - 54
    lines = max(1, int(tw / line_w + 0.999))
    y += lines * (SZ_BODY + 3) + 2

y = sep_line(page, y)
y = section_head(page, y, "Important Notes")

notes = [
    "No legal advice or legal representation is provided. Paralegal/document services are non-legal support only.",
    "Notary services do not include legal interpretation, drafting, or advice.",
    "Engineering consulting does not include PE-stamped plans unless explicitly contracted with a licensed PE.",
]

for note in notes:
    r = pymupdf.Rect(30, y - SZ_BODY + 1, 582, y + 30)
    page.insert_textbox(r, f"\u2022  {note}", fontname="arial", fontsize=SZ_BODY, color=C_BODY, align=0)
    tw = pymupdf.get_text_length(f"\u2022  {note}", fontname="helv", fontsize=SZ_BODY)
    lines = max(1, int(tw / (582 - 30) + 0.999))
    y += lines * (SZ_BODY + 3) + 3

footer(page)
print(f"Page 2: last content y = {y:.0f}")

doc.save("capabilities.pdf")
doc.close()
print("Done — capabilities.pdf rebuilt with 10pt fonts, separator lines, original header")
