"""
Money in and money out, summarised for the dashboard.

The figures are read from where the Foundation already records them — the
Expenses and Gifts & Pledges boards, and the donations table — rather than
being kept a second time in a model of their own. A total that is stored
separately from the rows it came from starts disagreeing with them, and the
disagreement is always found late.

Two things shape this.

Nothing is converted between currencies. An expense in UGX and a donation in
USD are not comparable without a rate, and inventing one would produce a total
that looks authoritative and is wrong. So every figure is grouped by its own
currency and the dashboard shows one currency at a time.

Board columns are found by title rather than by monday's opaque ids, so this
keeps working if a board is re-imported and the ids change. If a title is
renamed the series for that board goes quiet rather than reporting a wrong
number — which is the failure worth having.
"""

from collections import defaultdict
from datetime import date

from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts import policy
from api.permissions import IsStaff
from core.countries import Country
from donations.models import Donation
from operations.models import Board, ExchangeRate, Record

#: Currencies are stored on the boards as "UGX — Uganda"; only the code matters.
def shift_month(value: date, months: int) -> date:
    """The first of the month `months` away from `value`.

    Written out rather than pulled from dateutil, which is only present here as
    something botocore happens to install — a dependency this code has not
    declared is one that can vanish in a rebuild.
    """
    total = value.year * 12 + (value.month - 1) + months
    return date(total // 12, total % 12 + 1, 1)


def rate_table() -> dict[tuple[str, str], list[tuple[date, float]]]:
    """Every recorded rate, newest first per pair."""
    table: dict[tuple[str, str], list[tuple[date, float]]] = defaultdict(list)
    for row in ExchangeRate.objects.all():
        table[(row.base.upper(), row.quote.upper())].append(
            (row.effective_from, float(row.rate))
        )
    for pair in table.values():
        pair.sort(key=lambda entry: entry[0], reverse=True)
    return table


def rate_for(table, source: str, target: str, when: date | None):
    """
    The rate to use, and the date it was set — or None if none was recorded.

    Falls back to the inverse of the opposite pair, so recording UGX→USD is
    enough to convert either way. Never invents a rate: an unconverted figure
    is reported as unconverted rather than folded into a total at a number
    nobody chose.
    """
    if source == target:
        return 1.0, None
    for (base, quote), entries in ((( source, target), table.get((source, target), [])),
                                   ((target, source), table.get((target, source), []))):
        for effective, value in entries:
            if when is None or effective <= when:
                if not value:
                    continue
                return (value, effective) if base == source else (1.0 / value, effective)
    return None, None


def financial_year(month_key: str, start_month: int) -> str:
    """
    The label of the financial year a month falls in.

    July-to-June reads as "2026/27"; a year that starts in January is just the
    year, because "2026/26" would be nonsense.
    """
    if not month_key:
        return ""
    year, month = int(month_key[:4]), int(month_key[5:7])
    opening = year if month >= start_month else year - 1
    if start_month == 1:
        return str(opening)
    return f"{opening}/{str(opening + 1)[-2:]}"


def financial_year_range(label: str, start_month: int) -> str:
    """"Jul 2026 – Jun 2027", so the label can never be read the wrong way."""
    if not label:
        return ""
    opening = int(label.split("/")[0])
    start = date(opening, start_month, 1)
    end = shift_month(start, 11)
    return f"{start:%b %Y} – {end:%b %Y}"


def currency_code(value: str) -> str:
    if not value:
        return ""
    return str(value).split("—")[0].split("-")[0].strip().upper()[:3]


def to_number(value) -> float:
    if value is None or value == "":
        return 0.0
    try:
        return float(str(value).replace(",", "").strip())
    except (TypeError, ValueError):
        return 0.0


def columns_by_title(board: Board) -> dict[str, str]:
    """Title -> monday id, for the columns this board still has."""
    return {c.title: c.monday_id for c in board.columns.all()}


def month_key(value) -> str:
    """`2026-08` from whatever shape the date arrived in, or '' if unusable."""
    if not value:
        return ""
    text = str(value)[:10]
    try:
        date.fromisoformat(text)
    except ValueError:
        return ""
    return text[:7]


def rows_from_board(user, name: str, amount_title: str, date_title: str, extra: dict[str, str] | None = None):
    """Every record on one board, reduced to the fields the dashboard needs."""
    board = Board.objects.filter(name=name).prefetch_related("columns").first()
    if not board:
        return []

    ids = columns_by_title(board)
    amount_id, date_id = ids.get(amount_title), ids.get(date_title)
    if not amount_id or not date_id:
        # A renamed column is reported as no data rather than as a wrong total.
        return []
    currency_id = ids.get("Currency")

    wanted = {key: ids.get(title) for key, title in (extra or {}).items()}

    records = policy.scope(
        user, Record.objects.filter(board=board).select_related("office"), "boards"
    )
    out = []
    for record in records:
        values = record.values or {}
        amount = to_number(values.get(amount_id))
        if not amount:
            continue
        day = str(values.get(date_id) or "")[:10]
        row = {
            "id": record.id,
            "name": record.name,
            "amount": amount,
            "currency": currency_code(values.get(currency_id)) if currency_id else "",
            "month": month_key(values.get(date_id)),
            "date": day,
            "board": board.monday_id,
            "country": record.country or "",
            "office": record.office.name if record.office_id else "",
        }
        for key, column_id in wanted.items():
            row[key] = str(values.get(column_id) or "") if column_id else ""
        out.append(row)
    return out


@api_view(["GET"])
@permission_classes([IsStaff])
def accounting(request):
    """
    Twelve months of money in and money out, per currency.

    Staff only, and then only the money their country covers — `policy.scope`
    narrows every source below. `IsAuthenticated` was too weak for a figure
    this sensitive: it asks whether somebody holds a token, not whether they
    are staff, which is the question every other endpoint here asks.
    """
    months_back = 11
    today = timezone.localdate()
    first = shift_month(today, -months_back)

    # The window, oldest first, so the chart reads left to right.
    window = []
    cursor = first
    last = today.replace(day=1)
    while cursor <= last:
        window.append(cursor)
        cursor = shift_month(cursor, 1)
    keys = [d.strftime("%Y-%m") for d in window]
    key_set = set(keys)
    # The twelve months before the window, for the comparison figure.
    previous_keys = {
        shift_month(first, -n).strftime("%Y-%m") for n in range(1, months_back + 2)
    }

    expenses = rows_from_board(
        request.user,
        "Expenses",
        "Amount",
        "Date Incurred",
        {"category": "Category", "status": "Approval Status", "paid_by": "Paid By"},
    )
    # Every gift is in one table now, whether it came through Stripe or was
    # written down after a cheque arrived. A pledge is a promise, so only the
    # banked statuses count as money the Foundation actually has.
    money_in = []
    for row in policy.scope(
        request.user, Donation.objects.filter(status__in=Donation.BANKED), "donations"
    ).only("amount_cents", "currency", "created_at", "received_on", "country"):
        when = row.received_on or row.created_at.date()
        money_in.append(
            {
                "amount": (row.amount_cents or 0) / 100,
                "currency": (row.currency or "").upper()[:3],
                "month": when.strftime("%Y-%m"),
                "date": when.strftime("%Y-%m-%d"),
                "country": row.country or "",
            }
        )
    everything = expenses + money_in

    currencies = sorted({r["currency"] for r in everything if r["currency"]}) or ["UGX"]

    # "" is every country at once. A record with no country set belongs to the
    # whole Foundation, so it is counted in the total and nowhere else — which
    # is why the totals can exceed the sum of the named countries.
    present = sorted({r["country"] for r in everything if r["country"]})
    labels = dict(Country.choices)
    countries = [{"code": "", "label": "All countries"}] + [
        {"code": code, "label": labels.get(code, code)} for code in present
    ]

    def build(rows_in, rows_out) -> dict:
        by_month = {key: {"in": 0.0, "out": 0.0} for key in keys}
        # Only days that saw something are sent: a year of empty keys would be
        # three hundred entries saying nothing.
        by_day: dict[str, dict[str, float]] = defaultdict(lambda: {"in": 0.0, "out": 0.0})
        in_total = out_total = in_previous = out_previous = 0.0
        by_category: dict[str, float] = defaultdict(float)

        for row in rows_in:
            if row["month"] in key_set:
                by_month[row["month"]]["in"] += row["amount"]
                in_total += row["amount"]
                if row.get("date"):
                    by_day[row["date"]]["in"] += row["amount"]
            elif row["month"] in previous_keys:
                in_previous += row["amount"]

        for row in rows_out:
            if row["month"] in key_set:
                by_month[row["month"]]["out"] += row["amount"]
                out_total += row["amount"]
                by_category[row.get("category") or "Uncategorised"] += row["amount"]
                if row.get("date"):
                    by_day[row["date"]]["out"] += row["amount"]
            elif row["month"] in previous_keys:
                out_previous += row["amount"]

        return {
            "months": [
                {
                    "key": key,
                    "label": date.fromisoformat(f"{key}-01").strftime("%b"),
                    "year": key[:4],
                    "in": round(by_month[key]["in"], 2),
                    "out": round(by_month[key]["out"], 2),
                }
                for key in keys
            ],
            "in_total": round(in_total, 2),
            "out_total": round(out_total, 2),
            "in_previous": round(in_previous, 2),
            "out_previous": round(out_previous, 2),
            "days": {
                day: {"in": round(v["in"], 2), "out": round(v["out"], 2)}
                for day, v in sorted(by_day.items())
            },
            "by_category": sorted(
                ({"label": k, "amount": round(v, 2)} for k, v in by_category.items()),
                key=lambda r: -r["amount"],
            ),
        }

    series: dict[str, dict[str, dict]] = {}
    for country in [c["code"] for c in countries]:
        per_currency = {}
        for code in currencies:
            def keep(row, country=country, code=code):
                return row["currency"] == code and (not country or row["country"] == country)

            per_currency[code] = build(
                [r for r in money_in if keep(r)], [r for r in expenses if keep(r)]
            )
        series[country] = per_currency

    # The most recent spending, whatever its currency — the list is read row by
    # row, so mixing currencies in it is honest as long as each says which.
    recent = sorted(
        (r for r in expenses if r["date"]), key=lambda r: r["date"], reverse=True
    )[:6]

    # --- breakdowns ---------------------------------------------------------
    #
    # Every one of these is grouped by currency as well as by whatever it is
    # breaking down. Summing UGX and USD into one figure would be a number that
    # looks authoritative and means nothing; the conversion below is the only
    # place the two are ever added together, and it says at what rate.

    labels_by_code = dict(Country.choices)

    def tally(rows_in, rows_out, key):
        """(key, currency) -> money in, money out."""
        found: dict[tuple[str, str], dict[str, float]] = defaultdict(
            lambda: {"in": 0.0, "out": 0.0}
        )
        for row in rows_in:
            found[(key(row), row["currency"])]["in"] += row["amount"]
        for row in rows_out:
            found[(key(row), row["currency"])]["out"] += row["amount"]
        return found

    def shape(found, label_for=lambda k: k, key_name="key"):
        out = []
        for (key, currency), sums in found.items():
            out.append(
                {
                    key_name: key,
                    "label": label_for(key),
                    "currency": currency,
                    "in": round(sums["in"], 2),
                    "out": round(sums["out"], 2),
                    "net": round(sums["in"] - sums["out"], 2),
                }
            )
        return sorted(out, key=lambda r: (r[key_name] or "", r["currency"]))

    in_window = [r for r in money_in if r["month"] in key_set]
    out_window = [r for r in expenses if r["month"] in key_set]

    by_currency = shape(
        tally(in_window, out_window, lambda r: r["currency"]), key_name="currency_key"
    )
    by_country = shape(
        tally(in_window, out_window, lambda r: r["country"]),
        label_for=lambda code: labels_by_code.get(code, code) or "Not set",
        key_name="code",
    )
    by_year = shape(
        tally(in_window, out_window, lambda r: (r["month"] or "")[:4]), key_name="year"
    )
    # Financial years are counted over everything recorded, not the rolling
    # twelve months: a year that opened fourteen months ago is still the year
    # somebody is reporting on.
    fy_start = settings.FINANCIAL_YEAR_START_MONTH
    by_financial_year = shape(
        tally(money_in, expenses, lambda r: financial_year(r["month"], fy_start)),
        label_for=lambda label: f"{label}  ({financial_year_range(label, fy_start)})"
        if label
        else "Undated",
        key_name="financial_year",
    )
    by_month = shape(
        tally(in_window, out_window, lambda r: r["month"]), key_name="month"
    )
    # Only money out: a gift is credited to a country, never to an office.
    by_office = shape(
        tally([], out_window, lambda r: r.get("office") or ""),
        label_for=lambda name: name or "No office",
        key_name="office",
    )

    # --- conversion ---------------------------------------------------------
    display = (request.query_params.get("display") or "").strip().upper()[:3]
    converted = None
    if display:
        table = rate_table()
        used: dict[tuple[str, str, str], dict] = {}
        totals = {"in": 0.0, "out": 0.0}
        missing: dict[str, dict[str, float]] = defaultdict(lambda: {"in": 0.0, "out": 0.0})

        def add(rows, bucket):
            for row in rows:
                source = row["currency"] or display
                when = date.fromisoformat(row["date"]) if row.get("date") else None
                rate, effective = rate_for(table, source, display, when)
                if rate is None:
                    missing[source][bucket] += row["amount"]
                    continue
                totals[bucket] += row["amount"] * rate
                if source != display:
                    used[(source, display, str(effective))] = {
                        "from": source,
                        "to": display,
                        "rate": round(rate, 6),
                        "effective_from": str(effective) if effective else "",
                    }

        add(in_window, "in")
        add(out_window, "out")
        converted = {
            "currency": display,
            "in_total": round(totals["in"], 2),
            "out_total": round(totals["out"], 2),
            "net": round(totals["in"] - totals["out"], 2),
            # Shown with the figures, so a converted total can be checked
            # against the rate that produced it.
            "rates": sorted(used.values(), key=lambda r: (r["from"], r["effective_from"])),
            # Named rather than folded in at a rate nobody chose.
            "unconverted": [
                {"currency": code, "in": round(v["in"], 2), "out": round(v["out"], 2)}
                for code, v in sorted(missing.items())
            ],
        }

    return Response(
        {
            "countries": countries,
            "currencies": currencies,
            "series": series,
            "recent": recent,
            "has_any": bool(expenses or money_in),
            "breakdowns": {
                "by_currency": by_currency,
                "by_country": by_country,
                "by_office": by_office,
                "by_year": by_year,
                "by_financial_year": by_financial_year,
                "by_month": by_month,
            },
            "converted": converted,
            # What the Foundation has recorded, so the dashboard can say which
            # conversions are possible at all.
            # Stated so the dashboard can say which year it means, and so a
            # wrong setting is visible rather than silently misreported.
            "financial_year": {
                "start_month": fy_start,
                "current": financial_year(timezone.localdate().strftime("%Y-%m"), fy_start),
                "range": financial_year_range(
                    financial_year(timezone.localdate().strftime("%Y-%m"), fy_start), fy_start
                ),
            },
            "rates_available": sorted(
                {r.quote.upper() for r in ExchangeRate.objects.all()}
                | {r.base.upper() for r in ExchangeRate.objects.all()}
            ),
        }
    )
