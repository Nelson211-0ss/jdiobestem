"""Amounts in exports and option lists are led by their own currency."""

from django.test import TestCase

from core.reports import Report, RecordReport, record_to_csv
from operations.models import Board, BoardColumn, Record
from operations.views import _expense_options


class ExportCurrencyTests(TestCase):
    def test_list_rows_use_their_currency(self):
        r = Report(
            title="Payments",
            columns=[("student_name", "Student"), ("amount", "Amount"), ("paid_on", "Paid"), ("currency", "Currency")],
            rows=[
                {"student_name": "Ryan", "amount": "2500.00", "paid_on": "2026-05-08", "currency": "USD"},
                {"student_name": "Liz", "amount": "1450000", "paid_on": "2026-09-14", "currency": "UGX — Uganda"},
                {"student_name": "None", "amount": "300", "paid_on": "", "currency": ""},
            ],
        )
        self.assertEqual(r.cells(r.rows[0]), ["Ryan", "USD 2,500", "2026-05-08", "USD"])
        self.assertEqual(r.cells(r.rows[1])[1], "UGX 1,450,000")
        self.assertEqual(r.cells(r.rows[2])[1], "300")

    def test_board_rows_read_currency_from_values(self):
        r = Report(
            title="Expenses",
            columns=[("name", "Name"), ("values.c1", "Amount"), ("values.c2", "Currency")],
            rows=[{"name": "Dec airfare", "values": {"c1": "2867.19", "c2": "USD — United States"}}],
        )
        self.assertEqual(r.cells(r.rows[0])[1], "USD 2,867.19")

    def test_preformatted_left_alone(self):
        r = Report(title="t", columns=[("outstanding", "Outstanding"), ("currency", "Currency")],
                   rows=[{"outstanding": "UGX 1,450,000.00", "currency": "UGX"}])
        self.assertEqual(r.cells(r.rows[0])[0], "UGX 1,450,000.00")

    def test_record_report_pairs_and_tables(self):
        rep = RecordReport(
            title="Expense", heading="Corporate Filings",
            pairs=[("Amount", "125"), ("Currency", "USD — United States")],
            tables=[("Entries", [("name", "Entry"), ("amount", "Amount")], [{"name": "Fee", "amount": "125"}])],
        )
        text = record_to_csv(rep).decode("utf-8-sig")
        self.assertIn("Amount,USD 125", text)
        self.assertIn("Fee,USD 125", text)


class ExpensePickerTests(TestCase):
    def test_label_has_currency(self):
        b = Board.objects.create(monday_id="1", slug="expenses", name="Expenses")
        for mid, title in (("amt", "Amount"), ("cur", "Currency"), ("dt", "Date Incurred")):
            BoardColumn.objects.create(board=b, monday_id=mid, title=title, column_type="text")
        Record.objects.create(board=b, name="Corporate Filings",
                              values={"amt": "125", "cur": "USD — United States", "dt": "2025-10-05"})
        Record.objects.create(board=b, name="NIRA", values={"amt": "1000000", "dt": "2026-09-07"})
        labels = {o["label"] for o in _expense_options()}
        self.assertIn("Corporate Filings — 2025-10-05 — USD 125.00", labels)
        self.assertIn("NIRA — 2026-09-07 — 1,000,000.00", labels)
