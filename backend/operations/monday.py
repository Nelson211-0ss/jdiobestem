"""
monday.com API client and the mapping rules.

One place decides how a monday value becomes something readable and how a board
name becomes a dashboard category, so the sync command stays about moving data
rather than interpreting it.
"""

import json
import logging

import requests  # type: ignore[import-untyped]
from django.conf import settings

logger = logging.getLogger(__name__)

API_URL = "https://api.monday.com/v2"
API_VERSION = "2024-10"


class MondayError(RuntimeError):
    pass


class MondayClient:
    def __init__(self, token: str | None = None):
        self.token = token or settings.MONDAY_API_TOKEN
        if not self.token:
            raise MondayError(
                "MONDAY_API_TOKEN is not set. Create one in monday.com under "
                "your avatar → Developers → My access tokens."
            )

    def query(self, query: str, variables: dict | None = None) -> dict:
        response = requests.post(
            API_URL,
            json={"query": query, "variables": variables or {}},
            headers={
                "Authorization": self.token,
                "Content-Type": "application/json",
                "API-Version": API_VERSION,
            },
            timeout=60,
        )
        if response.status_code >= 400:
            raise MondayError(f"monday.com responded {response.status_code}: {response.text[:400]}")

        payload = response.json()
        if payload.get("errors"):
            raise MondayError(json.dumps(payload["errors"])[:600])
        return payload.get("data") or {}


BOARDS_QUERY = """
query Boards($limit: Int!, $page: Int!) {
  boards(limit: $limit, page: $page, order_by: created_at) {
    id
    name
    description
    state
    items_count
    groups { id title color }
    columns { id title type settings_str }
  }
}
"""

ITEMS_QUERY = """
query Items($boardId: ID!, $cursor: String) {
  boards(ids: [$boardId]) {
    items_page(limit: 100, cursor: $cursor) {
      cursor
      items {
        id
        name
        updated_at
        group { id }
        column_values { id type text value }
      }
    }
  }
}
"""

#: Board name (lowercased) -> dashboard category. Matched on substrings, first
#: hit wins, so ordering matters: "grant providers" must be seen before the
#: generic "provider" rules further down.
CATEGORY_RULES: list[tuple[tuple[str, ...], str]] = [
    (("donor", "gift", "pledge", "grant", "campaign", "fundrais"), "fundraising"),
    (("budget", "expense", "accounting", "salary", "invoice", "asset", "inventory", "vendor", "procure"), "finance"),
    (("beneficiar", "student", "mentee", "mentor", "scholarship", "session", "project", "activit",
      "youth stem", "community outreach", "applicant", "school"), "programmes"),
    (("employee", "position", "role", "onboarding", "performance", "leave", "volunteer", "staff"), "people"),
    (("polic", "risk", "compliance", "regulator", "governance", "board of directors", "insurance",
      "contract", "safeguard", "privacy", "data access"), "governance"),
    (("content", "media", "event", "marketing", "partner", "inquir", "website"), "marketing"),
    (("country office", "convention", "structure"), "operations"),
]


def categorise(board_name: str) -> str:
    name = board_name.lower()
    for needles, category in CATEGORY_RULES:
        if any(needle in name for needle in needles):
            return category
    return "other"


#: Column types whose content is too long or too structured for a table cell.
NOT_IN_LIST = {"long_text", "file", "subtasks", "doc", "board_relation", "dependency", "mirror"}


def normalise_value(column_type: str, text: str | None, raw: str | None):
    """
    Turn a monday column value into something storable and renderable.

    monday sends both a display `text` and a structured `value`. The text is
    what a person expects to read, so it is what gets stored — with the raw JSON
    kept alongside for the types where the display string genuinely loses
    information (files, links, people, relations).
    """
    text = (text or "").strip()

    if column_type in {"file", "link", "people", "multiple-person", "board_relation", "dependency", "mirror"}:
        parsed = None
        if raw:
            try:
                parsed = json.loads(raw)
            except (ValueError, TypeError):
                parsed = None
        return {"text": text, "raw": parsed}

    if column_type in {"numbers", "numeric"}:
        if text == "":
            return None
        try:
            return float(text) if "." in text else int(text)
        except ValueError:
            return text

    if column_type == "checkbox":
        return text.lower() in {"v", "true", "yes", "checked"}

    return text
