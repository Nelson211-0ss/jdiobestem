"""
Turning a campaign into an email, and putting it on the wire.

The body is written as Markdown in the dashboard and rendered here rather than
in the browser: the HTML that reaches people's inboxes is built by the server
from the stored source, so what was approved is what goes out.

Email clients ignore stylesheets, so every rule is inlined. The palette is the
site's own, kept literal because there is no CSS layer to read it from.
"""

from __future__ import annotations

import logging
import re
from urllib.parse import quote

import markdown as md
import requests  # type: ignore[import-untyped]
from django.conf import settings
from django.utils.html import escape

logger = logging.getLogger(__name__)

#: Resend accepts at most 100 messages in one batch call.
BATCH_SIZE = 100
BATCH_URL = "https://api.resend.com/emails/batch"

CREAM = "#fff1e0"
CHARCOAL = "#3a3b47"
ORANGE = "#fe5c00"


DOMAINS_URL = "https://api.resend.com/domains"

#: Resend's own sink addresses, which work without a verified domain.
RESEND_TEST_ADDRESSES = {"delivered@resend.dev", "bounced@resend.dev", "complained@resend.dev"}


def sender_domain() -> str:
    """The domain of NOTIFY_FROM, e.g. 'jdiobestem.org'."""
    from django.conf import settings

    sender = settings.NOTIFY_FROM or ""
    address = sender.split("<")[-1].rstrip(">").strip() if "<" in sender else sender.strip()
    return address.split("@")[-1].lower() if "@" in address else ""


def sender_is_verified() -> tuple[bool, str]:
    """
    Whether the account can actually send from NOTIFY_FROM.

    Until a domain is verified, Resend only accepts its own test addresses and
    rejects everything else with a message about `example.com` — regardless of
    who the recipient really is. Checking first means the dashboard can say
    what is wrong instead of relaying a message that blames the wrong thing.
    """
    from django.conf import settings

    domain = sender_domain()
    if not settings.RESEND_API_KEY:
        return False, "RESEND_API_KEY is not set on the server, so no email can be sent."
    if not domain:
        return False, "NOTIFY_FROM does not contain an email address."
    if domain == "resend.dev":
        return False, (
            "Email is still going out from the shared onboarding@resend.dev address, which "
            "can only reach Resend's own test inboxes. Verify jdiobestem.org in Resend and "
            "set NOTIFY_FROM to an address at that domain."
        )

    try:
        response = requests.get(
            DOMAINS_URL,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            timeout=15,
        )
        if response.status_code >= 400:
            return False, f"Could not check the sending domain: Resend responded {response.status_code}."
        rows = response.json().get("data", []) or []
    except Exception as exc:  # noqa: BLE001
        return False, f"Could not reach Resend to check the sending domain: {exc}"

    match = next((r for r in rows if (r.get("name") or "").lower() == domain), None)
    if match is None:
        listed = ", ".join(sorted((r.get("name") or "") for r in rows)) or "none"
        return False, (
            f"{domain} is not set up in Resend, so mail from it will be refused. "
            f"Domains on this account: {listed}. Add {domain} in Resend and publish its DNS records."
        )
    if (match.get("status") or "").lower() != "verified":
        return False, (
            f"{domain} is in Resend but its status is '{match.get('status')}'. "
            "Publish the DNS records it asks for, then verify it."
        )
    return True, ""


def render_body(markdown_source: str) -> str:
    """Markdown to inline-styled HTML fit for an email client."""
    html = md.markdown(markdown_source or "", extensions=["extra", "sane_lists", "nl2br"])

    # Tables and stylesheets are unreliable in email; inline styles are not.
    styles = {
        "<h1>": f'<h1 style="font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;color:{CHARCOAL};margin:0 0 16px">',
        "<h2>": f'<h2 style="font-family:Arial,Helvetica,sans-serif;font-size:21px;line-height:1.3;color:{CHARCOAL};margin:28px 0 12px">',
        "<h3>": f'<h3 style="font-family:Arial,Helvetica,sans-serif;font-size:17px;line-height:1.35;color:{CHARCOAL};margin:24px 0 10px">',
        "<p>": f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:{CHARCOAL};margin:0 0 16px">',
        "<ul>": f'<ul style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:{CHARCOAL};margin:0 0 16px;padding-left:22px">',
        "<ol>": f'<ol style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:{CHARCOAL};margin:0 0 16px;padding-left:22px">',
        "<li>": '<li style="margin:0 0 8px">',
        "<a ": f'<a style="color:{ORANGE};text-decoration:underline" ',
        "<blockquote>": f'<blockquote style="margin:0 0 16px;padding:2px 0 2px 16px;border-left:3px solid {ORANGE};color:{CHARCOAL}">',
        "<hr />": f'<hr style="border:0;border-top:1px solid #e7ded2;margin:28px 0" />',
    }
    for tag, replacement in styles.items():
        html = html.replace(tag, replacement)
    return html


def absolute(url: str) -> str:
    """A link an email client can follow.

    Uploads come back as full URLs from object storage, but a file already
    sitting under /public is stored as a site-relative path — and a relative
    link in an email goes nowhere.
    """
    from django.conf import settings

    if not url:
        return ""
    if url.startswith(("http://", "https://")):
        return url
    # Filenames with spaces are ordinary — "August Newsletter.pdf" — and a raw
    # space in an href breaks the link in several mail clients. Already-encoded
    # sequences are left alone so this is safe to apply twice.
    path = quote(url.lstrip("/"), safe="/%")
    return f"{settings.PUBLIC_BASE_URL}/{path}"


def pdf_block(pdf_url: str, cover_url: str, issue_label: str) -> str:
    """The cover and the button. This is the point of the email."""
    if not pdf_url:
        return ""

    cover = (
        f'<tr><td style="padding-bottom:20px" align="center">'
        f'<a href="{pdf_url}"><img src="{cover_url}" alt="" width="440" '
        f'style="max-width:100%;height:auto;border-radius:10px;display:block" /></a>'
        f"</td></tr>"
        if cover_url
        else ""
    )
    label = escape(issue_label) if issue_label else "the newsletter"
    return f"""
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">
  {cover}
  <tr><td align="center">
    <a href="{pdf_url}"
       style="display:inline-block;background:{ORANGE};color:#ffffff;text-decoration:none;
              font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;
              padding:14px 28px;border-radius:9999px">
      Read {label}
    </a>
  </td></tr>
  <tr><td align="center" style="padding-top:10px">
    <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#7a7a86;margin:0">
      Opens as a PDF.
    </p>
  </td></tr>
</table>"""


def wrap_email(
    subject: str,
    body_html: str,
    unsubscribe_url: str,
    preheader: str = "",
    pdf_url: str = "",
    cover_url: str = "",
    issue_label: str = "",
) -> str:
    """The campaign body inside the Foundation's shell, with the footer the law
    and every mailbox provider expect."""
    hidden_preheader = (
        f'<div style="display:none;max-height:0;overflow:hidden;opacity:0">{escape(preheader)}</div>'
        if preheader
        else ""
    )
    issue_suffix = f" &middot; {escape(issue_label)}" if issue_label else ""
    pdf_html = pdf_block(pdf_url, cover_url, issue_label)

    return f"""<!doctype html>
<html><body style="margin:0;padding:0;background:{CREAM}">
{hidden_preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{CREAM};padding:24px 12px">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;padding:32px">
      <tr><td>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:{ORANGE};font-weight:bold;margin:0 0 20px">
          Jdiobe STEM Foundation{issue_suffix}
        </p>
        {body_html}
        {pdf_html}
      </td></tr>
      <tr><td style="padding-top:28px">
        <hr style="border:0;border-top:1px solid #e7ded2;margin:0 0 16px" />
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#7a7a86;margin:0">
          You are receiving this because you subscribed to updates from the
          Jdiobe STEM Foundation.<br />
          <a href="{unsubscribe_url}" style="color:#7a7a86;text-decoration:underline">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>"""


def to_plain_text(markdown_source: str, unsubscribe_url: str, pdf_url: str = "") -> str:
    """A text alternative. Mail that is HTML-only is far likelier to be filtered."""
    text = re.sub(r"[*_`>#]", "", markdown_source or "")
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r"\1 (\2)", text)  # links → "label (url)"
    parts = [text.strip()] if text.strip() else []
    if pdf_url:
        parts.append(f"Read the newsletter: {pdf_url}")
    parts.append(f"—\nUnsubscribe: {unsubscribe_url}")
    return "\n\n".join(parts) + "\n"


def send_batch(messages: list[dict]) -> tuple[list[str], str]:
    """
    Hand one batch to Resend.

    Returns (provider ids in order, error). An empty error means it went; the
    ids line up with `messages` so each delivery row can be marked individually.
    """
    if not settings.RESEND_API_KEY:
        return [], "RESEND_API_KEY is not set on the server, so no email can be sent."

    try:
        response = requests.post(
            BATCH_URL,
            json=messages,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            timeout=30,
        )
    except Exception as exc:  # noqa: BLE001 — reported per delivery, not raised
        logger.exception("Newsletter batch failed to reach Resend")
        return [], f"Could not reach the email provider: {exc}"

    if response.status_code >= 400:
        logger.error("Resend batch responded %s: %s", response.status_code, response.text[:500])

        # Resend answers an unverified sending domain with a 422 about
        # `example.com`, whoever the recipient actually is. Passing that
        # through sends people looking in the wrong place entirely.
        if response.status_code == 422 and "example.com" in response.text:
            ok, reason = sender_is_verified()
            if not ok:
                return [], reason

        return [], f"Email provider responded {response.status_code}: {response.text[:200]}"

    try:
        data = response.json().get("data", [])
        return [item.get("id", "") for item in data], ""
    except ValueError:
        return [], "Email provider returned a response that could not be read."
