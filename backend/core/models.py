from django.db import models


class TimeStampedModel(models.Model):
    """Created/updated stamps on everything, so the admin can always sort by age."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class FilePreview(models.Model):
    """
    A rendered first page, remembered against the file it came from.

    Board records keep their attachments as URLs inside a JSON column, so there
    is no field to hang a preview on the way a newsletter has one. Keyed by the
    source URL instead: rendering is done once when the file is attached, and
    everything afterwards is a lookup.

    A row saying the preview is empty is itself worth keeping — it stops a
    malformed PDF being re-fetched and re-rendered on every save.
    """

    source = models.URLField(max_length=500, unique=True)
    image = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"preview of {self.source}"
