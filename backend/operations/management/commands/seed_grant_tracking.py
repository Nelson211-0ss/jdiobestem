"""
Grants: one board for the whole process.

The Foundation had two. `Grant Providers` was a contact list — who funds this
sort of work, and how to reach them. `Grant Proposals` was the writing — who is
drafting, when it is due, how much is being asked for. They described the same
pursuit at two different moments, so anyone answering "where are we with that
grant?" had to read both and join them by name in their head.

They are one thing now. A record is a grant the Foundation is pursuing: whose
it is, when it closes, what stage it has reached, what was asked for, what was
awarded, and when the report on it falls due.

Columns are reconciled rather than the board rebuilt: what exists is updated,
what is missing is added, and what the merge left behind is hidden rather than
dropped, so nothing recorded is destroyed. Re-running changes nothing.
"""

from django.core.management.base import BaseCommand

from operations.models import Board, BoardColumn

OLD_NAME = "Grant Providers"
NEW_NAME = "Grants"

CURRENCIES = ["UGX — Uganda", "SSP — South Sudan", "USD — United States"]

#: The stages a grant actually passes through, in order. Kept as one status
#: column rather than as board groups so it can be filtered and shown as a
#: badge alongside everything else.
STAGES = [
    "Identified",
    "Checking eligibility",
    "Drafting",
    "Submitted",
    "Under review",
    "Awarded",
    "Declined",
    "Reporting",
    "Closed",
]

# (monday_id, title, type, labels, show_in_list)
# Order here is the order on the board.
COLUMNS = [
    ("local_funder", "Funder", "text", [], True),
    ("local_stage", "Stage", "status", STAGES, True),
    ("local_deadline", "Deadline", "date", [], True),
    ("local_amount_requested", "Amount requested", "numbers", [], True),
    ("local_amount_awarded", "Grant amount", "numbers", [], True),
    ("local_currency", "Currency", "status", CURRENCIES, False),
    ("local_submitted_on", "Submitted on", "date", [], False),
    ("local_decision_on", "Decision on", "date", [], False),
    ("local_report_due", "Report due", "date", [], False),
    ("local_lead", "Lead", "people", [], False),
    ("local_document", "Proposal document", "file", [], False),
    ("local_doc_link", "Document link", "link", [], False),
    ("local_focus", "What it funds", "text", [], False),
    ("local_award", "Typical award", "text", [], False),
    ("local_grant_notes", "Notes", "long_text", [], False),
]

#: Columns the two boards brought that the merged one does not want. Hidden,
#: never deleted — a hidden column keeps whatever was recorded in it.
RETIRE = {
    # The record's own Name is the grant now, so a second field for it would be
    # two places to write the same thing.
    "local_grant_name",
    # Pointed at the board this one absorbed.
    "board_relation",
    # An earlier, shorter status column. `Stage` replaced it with the full
    # sequence a grant passes through, and two status columns on one board is
    # two answers to the same question.
    "local_grant_status",
}

#: Contact details stay on the board and off the table: six columns is the cap,
#: and a deadline earns its place there more than a phone number does.
OFF_TABLE = {"text", "phone", "email"}


def labels_setting(labels: list[str]) -> dict:
    """monday's status-column settings for a plain list of labels."""
    if not labels:
        return {}
    return {
        "labels": {str(i): label for i, label in enumerate(labels)},
        "labels_positions_v2": {str(i): i for i, _ in enumerate(labels)},
    }


class Command(BaseCommand):
    help = "Merge Grant Providers and Grant Proposals into one Grants board."

    def handle(self, *args, **options):
        board = (
            Board.objects.filter(name=NEW_NAME).first()
            or Board.objects.filter(name=OLD_NAME).first()
        )
        if not board:
            self.stderr.write(f"  no board named {OLD_NAME!r} or {NEW_NAME!r}")
            return

        if board.name != NEW_NAME:
            board.name = NEW_NAME
            board.description = (
                "Every grant the Foundation is pursuing, from spotting it to "
                "reporting on it: the funder and how to reach them, when it "
                "closes, what stage it has reached, and what was asked for."
            )
            board.save(update_fields=["name", "description"])
            self.stdout.write(f"  renamed  {OLD_NAME} -> {NEW_NAME}")

        position = 1
        for monday_id, title, column_type, labels, in_list in COLUMNS:
            column = board.columns.filter(monday_id=monday_id).first()
            if column:
                column.title = title
                column.column_type = column_type
                column.show_in_list = in_list
                column.is_hidden = False
                column.position = position
                if labels:
                    column.settings = labels_setting(labels)
                column.save()
                self.stdout.write(f"  updated  {title}")
            else:
                BoardColumn.objects.create(
                    board=board,
                    monday_id=monday_id,
                    title=title,
                    column_type=column_type,
                    position=position,
                    show_in_list=in_list,
                    settings=labels_setting(labels),
                )
                self.stdout.write(f"  added    {title}")
            position += 1

        for monday_id in RETIRE:
            hidden = board.columns.filter(monday_id=monday_id).update(is_hidden=True)
            if hidden:
                self.stdout.write(f"  retired  {monday_id}")

        moved = board.columns.filter(monday_id__in=OFF_TABLE).update(show_in_list=False)
        if moved:
            self.stdout.write(f"  {moved} contact column(s) taken off the table")

        self.stdout.write(
            f"  {board.columns.filter(is_hidden=False).count()} live columns on {NEW_NAME}"
        )
