from django.db import models


class TimeStampedModel(models.Model):
    """Created/updated stamps on everything, so the admin can always sort by age."""

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
