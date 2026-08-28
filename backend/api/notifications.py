"""
Outbound notification email, via Resend.

The site has always relayed form submissions to an inbox through Resend, and
staff work from those emails. Moving storage into Django must not take that
away, so the same message still goes out — it is simply sent after the record
is safely written rather than instead of writing one.

A failure here is logged and swallowed: a submission that is stored but not
emailed is a nuisance, whereas one that is rejected because an email provider
was briefly down is lost data.
"""

import logging

import requests  # type: ignore[import-untyped]
from django.conf import settings

logger = logging.getLogger(__name__)


def send_notification(subject: str, lines: list[tuple[str, str]], reply_to: str = "") -> bool:
    """Send a plain 'label: value' notification. Returns whether it went out."""
    if not settings.RESEND_API_KEY:
        logger.info("RESEND_API_KEY not set — skipping notification %r", subject)
        return False

    text = "\n".join(f"{label}: {value}" for label, value in lines if value not in ("", None))
    rows = "".join(
        f"<tr><td style='font-weight:bold;vertical-align:top;padding:4px 12px 4px 0'>{label}</td>"
        f"<td style='white-space:pre-wrap'>{value}</td></tr>"
        for label, value in lines
        if value not in ("", None)
    )
    html = (
        f"<h2 style='font-family:Arial,sans-serif;margin:0 0 16px'>{subject}</h2>"
        f"<table cellpadding='0' style='font-family:Arial,sans-serif;font-size:14px'>{rows}</table>"
    )

    payload = {
        "from": settings.NOTIFY_FROM,
        "to": [settings.NOTIFY_TO],
        "subject": subject,
        "text": text,
        "html": html,
    }
    if reply_to:
        payload["reply_to"] = reply_to

    try:
        response = requests.post(
            settings.RESEND_API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            timeout=10,
        )
        if response.status_code >= 400:
            logger.error("Resend responded %s: %s", response.status_code, response.text[:500])
            return False
        return True
    except Exception:  # noqa: BLE001 — never let email failure lose a submission
        logger.exception("Notification %r failed to send", subject)
        return False
