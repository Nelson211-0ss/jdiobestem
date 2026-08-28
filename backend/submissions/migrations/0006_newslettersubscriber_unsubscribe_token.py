"""
Give every subscriber an unsubscribe token.

Adding a unique field with a callable default in one step would hand every
existing row the *same* UUID and fail the unique index, so this goes in three
moves: add it nullable, fill each row with its own value, then tighten it.
"""

import uuid

from django.db import migrations, models


def fill_tokens(apps, schema_editor):
    Subscriber = apps.get_model("submissions", "NewsletterSubscriber")
    for subscriber in Subscriber.objects.filter(unsubscribe_token__isnull=True).iterator():
        subscriber.unsubscribe_token = uuid.uuid4()
        subscriber.save(update_fields=["unsubscribe_token"])


def noop(apps, schema_editor):
    """Reversing just drops the column again."""


class Migration(migrations.Migration):

    dependencies = [
        ("submissions", "0005_contactmessage_office_projectproposal_office_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="newslettersubscriber",
            name="unsubscribe_token",
            field=models.UUIDField(null=True, editable=False),
        ),
        migrations.RunPython(fill_tokens, noop),
        migrations.AlterField(
            model_name="newslettersubscriber",
            name="unsubscribe_token",
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
