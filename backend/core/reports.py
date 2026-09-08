"""
Report output for the dashboard: the table on screen, as a file.

Two formats, for two different jobs. CSV is data — it goes into a spreadsheet
and gets worked on. PDF is a document — it gets attached to an email, handed to
a trustee, or filed, so it carries the Foundation's mark, says who produced it
and when, and states which filters were applied. A report that does not say
what it is a report *of* is worse than no report, because it will be read as
"all of them".

Both take the columns the person was actually looking at, so a file never
disagrees with the screen it came from.

PDF is drawn with PyMuPDF, which is already a dependency for document previews.
The table flows through pymupdf.Story; the branded header and footer are stamped
onto each finished page afterwards, because Story has no concept of a running
header.
"""

from __future__ import annotations

import csv
import io
from dataclasses import dataclass, field
from datetime import datetime

import pymupdf

# The Foundation's palette, from brand-colors.css.
ORANGE = (0xFE / 255, 0x5C / 255, 0x00 / 255)
CHARCOAL = (0x3A / 255, 0x3B / 255, 0x47 / 255)
CREAM = (0xFF / 255, 0xF1 / 255, 0xE0 / 255)
MUTED = (0x6B / 255, 0x6C / 255, 0x78 / 255)
RULE = (0xE2 / 255, 0xE0 / 255, 0xDC / 255)

PAGE = pymupdf.paper_rect("a4-l")          # landscape: tables are wide
MARGIN = 36
HEADER_H = 74
FOOTER_H = 30


@dataclass
class Report:
    """One rendered table, with enough context to be read on its own."""

    title: str
    columns: list[tuple[str, str]]      # (field name, column heading)
    rows: list[dict]
    generated_by: str = ""
    generated_at: datetime | None = None
    filters: list[tuple[str, str]] = field(default_factory=list)
    total: int | None = None            # rows before any cap
    note: str = ""

    def headings(self) -> list[str]:
        return [label for _, label in self.columns]

    def cells(self, row: dict) -> list[str]:
        return [_text(row.get(name)) for name, _ in self.columns]

    def subtitle(self) -> str:
        shown = len(self.rows)
        total = self.total if self.total is not None else shown
        counted = f"{shown} of {total}" if shown != total else f"{shown}"
        bits = [f"{counted} record{'' if total == 1 else 's'}"]
        if self.filters:
            bits.append("; ".join(f"{k}: {v}" for k, v in self.filters))
        else:
            bits.append("no filters applied")
        return " · ".join(bits)


def _text(value) -> str:
    if value is None or value == "":
        return ""
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return str(value)


def to_csv(report: Report) -> bytes:
    """The table as data. Excel needs the BOM to read UTF-8 without mangling it."""
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(report.headings())
    for row in report.rows:
        writer.writerow(report.cells(row))
    return buf.getvalue().encode("utf-8-sig")


def _escape(text: str) -> str:
    return (
        text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    )


def _table_html(report: Report) -> str:
    head = "".join(f"<th>{_escape(h)}</th>" for h in report.headings())
    body = []
    for row in report.rows:
        cells = "".join(f"<td>{_escape(c)}</td>" for c in report.cells(row))
        body.append(f"<tr>{cells}</tr>")
    if not body:
        span = max(1, len(report.columns))
        body.append(f'<tr><td colspan="{span}" class="empty">Nothing matched.</td></tr>')
    return f"<table><thead><tr>{head}</tr></thead><tbody>{''.join(body)}</tbody></table>"


def _css(column_count: int) -> str:
    # Wide tables need smaller type; narrow ones would look silly at 6pt.
    size = 8.5 if column_count <= 6 else 7.5 if column_count <= 9 else 6.5
    return f"""
    body {{ font-family: sans-serif; font-size: {size}pt; color: #3a3b47; }}
    table {{ width: 100%; border-collapse: collapse; }}
    th {{
      background-color: #fff1e0; color: #3a3b47; text-align: left;
      padding: 5px 6px; font-size: {size}pt; border-bottom: 1.2px solid #fe5c00;
    }}
    td {{ padding: 4px 6px; border-bottom: 0.6px solid #e2e0dc; vertical-align: top; }}
    td.empty {{ color: #6b6c78; padding: 14px 6px; }}
    """


def to_pdf(report: Report) -> bytes:
    """The table as a document, with the Foundation's mark on every page."""
    body = pymupdf.Rect(
        MARGIN, MARGIN + HEADER_H, PAGE.width - MARGIN, PAGE.height - MARGIN - FOOTER_H
    )

    story = pymupdf.Story(html=_table_html(report), user_css=_css(len(report.columns)))
    buf = io.BytesIO()
    writer = pymupdf.DocumentWriter(buf)
    more = True
    # A cap that only a runaway would reach; without it a bad filter could spin.
    for _ in range(400):
        if not more:
            break
        device = writer.begin_page(PAGE)
        more, _ = story.place(body)
        story.draw(device)
        writer.end_page()
    writer.close()

    doc = pymupdf.open("pdf", buf.getvalue())
    _brand(doc, report)
    out = doc.tobytes(deflate=True)
    doc.close()
    return out


def _brand(doc: pymupdf.Document, report: Report) -> None:
    """Stamp the header and footer onto every page, once the flow is laid out."""
    stamped_at = report.generated_at or datetime.now()
    when = stamped_at.strftime("%d %b %Y, %H:%M")
    total_pages = doc.page_count

    for index, page in enumerate(doc, start=1):
        # A solid rule in the brand orange, rather than a logo the backend does
        # not hold: recognisable, and it cannot render as a broken image.
        page.draw_rect(
            pymupdf.Rect(MARGIN, MARGIN - 6, PAGE.width - MARGIN, MARGIN - 2),
            color=None, fill=ORANGE,
        )
        page.insert_text(
            (MARGIN, MARGIN + 16), "JDIOBE STEM FOUNDATION",
            fontname="hebo", fontsize=9, color=ORANGE, render_mode=0,
        )
        page.insert_text(
            (MARGIN, MARGIN + 38), report.title,
            fontname="hebo", fontsize=16, color=CHARCOAL,
        )
        page.insert_text(
            (MARGIN, MARGIN + 54), report.subtitle(),
            fontname="helv", fontsize=8, color=MUTED,
        )
        if report.note:
            page.insert_text(
                (MARGIN, MARGIN + 66), report.note,
                fontname="helv", fontsize=7.5, color=ORANGE,
            )

        footer_y = PAGE.height - MARGIN + 2
        page.draw_line(
            pymupdf.Point(MARGIN, footer_y - 12), pymupdf.Point(PAGE.width - MARGIN, footer_y - 12),
            color=RULE, width=0.6,
        )
        left = f"Produced {when}"
        if report.generated_by:
            left += f" by {report.generated_by}"
        page.insert_text((MARGIN, footer_y), left, fontname="helv", fontsize=7.5, color=MUTED)
        right = f"Page {index} of {total_pages}"
        page.insert_text(
            (PAGE.width - MARGIN - pymupdf.get_text_length(right, "helv", 7.5), footer_y),
            right, fontname="helv", fontsize=7.5, color=MUTED,
        )
