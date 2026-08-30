"""
Write the form contract the dashboard and website validate against.

The rules that decide whether a submission is valid live in the serializers.
Restating them by hand in TypeScript guarantees they drift: a field made
optional here stays starred there, and a `max_length` nobody mirrored becomes a
500 the user meets only after typing three paragraphs.

So they are not restated. This reads the serializers and writes what it finds,
and the frontend validates from that file. Re-run it after changing a
serializer or a model field:

    python manage.py dump_form_contract

Client-side checks are courtesy, not security — the serializer still refuses
bad input on its own. This only means the browser refuses it first, with a
message next to the field instead of a red box after a round trip.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from rest_framework import serializers as S

from api import urls as api_urls
from api.serializers import (
    ContactMessageSerializer,
    NewsletterSubscriberSerializer,
    ProjectProposalSerializer,
    VolunteerApplicationSerializer,
)
from jobs.serializers import PublicApplicationSerializer

# What the website posts, keyed by the name the form component uses.
PUBLIC = {
    "volunteer": VolunteerApplicationSerializer,
    "newsletter": NewsletterSubscriberSerializer,
    "contact": ContactMessageSerializer,
    "proposal": ProjectProposalSerializer,
    "job-application": PublicApplicationSerializer,
}


def describe(field):
    """One field's rules, in the shape the TypeScript validator expects."""
    spec = {}
    if field.required:
        spec["required"] = True
    if getattr(field, "allow_null", False):
        spec["allowNull"] = True

    # Order matters: EmailField and SlugField are both CharFields, and the
    # narrower rule is the one worth reporting.
    if isinstance(field, S.EmailField):
        spec["kind"] = "email"
    elif isinstance(field, S.URLField):
        spec["kind"] = "url"
    elif isinstance(field, S.SlugField):
        spec["kind"] = "slug"
    elif isinstance(field, (S.IntegerField, S.FloatField, S.DecimalField)):
        spec["kind"] = "number"
        if getattr(field, "max_value", None) is not None:
            spec["maxValue"] = field.max_value
        if getattr(field, "min_value", None) is not None:
            spec["minValue"] = field.min_value
        if isinstance(field, S.IntegerField):
            spec["integer"] = True
        if isinstance(field, S.DecimalField):
            spec["decimals"] = field.decimal_places
    elif isinstance(field, S.BooleanField):
        spec["kind"] = "boolean"
    elif isinstance(field, S.DateTimeField):
        spec["kind"] = "datetime"
    elif isinstance(field, S.DateField):
        spec["kind"] = "date"
    elif isinstance(field, S.ChoiceField) and not isinstance(field, S.MultipleChoiceField):
        spec["kind"] = "choice"
        spec["choices"] = [str(c) for c in field.choices.keys()]
    elif isinstance(field, S.CharField):
        spec["kind"] = "text"
        if getattr(field, "max_length", None):
            spec["maxLength"] = field.max_length
        if getattr(field, "min_length", None):
            spec["minLength"] = field.min_length

    return spec


def fields_of(serializer):
    # Read-only fields carry no rules a form can break — they are shown, never
    # submitted.
    return {
        name: describe(field)
        for name, field in serializer.fields.items()
        if not field.read_only
    }


class Command(BaseCommand):
    help = "Write the serializer validation contract to the frontend."

    def add_arguments(self, parser):
        parser.add_argument(
            "--out",
            default="../frontend/lib/admin/contract.generated.json",
            help="Where to write, relative to the backend directory.",
        )

    def handle(self, *args, **options):
        contract = {"admin": {}, "public": {}}

        for prefix, viewset, _basename in api_urls.router.registry:
            try:
                view = viewset()
                # A viewset that varies its serializer by action needs one to
                # look at; `create` is the one the form posts.
                view.action = "create"
                view.request = None
                view.format_kwarg = None
                contract["admin"][prefix] = fields_of(view.get_serializer_class()())
            except Exception as exc:  # noqa: BLE001 - reported, not swallowed
                self.stderr.write(f"  skipped {prefix}: {exc}")

        for name, serializer in PUBLIC.items():
            contract["public"][name] = fields_of(serializer())

        path = Path(options["out"]).resolve()
        path.write_text(json.dumps(contract, indent=2, sort_keys=True) + "\n")

        admin_n = sum(len(v) for v in contract["admin"].values())
        public_n = sum(len(v) for v in contract["public"].values())
        self.stdout.write(
            f"  {admin_n} admin fields across {len(contract['admin'])} resources, "
            f"{public_n} public fields across {len(contract['public'])} forms"
        )
        self.stdout.write(f"  written to {path}")
