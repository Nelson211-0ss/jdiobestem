from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        # Connects the PDF preview signals. Importing here rather than at module
        # level is what keeps it out of the way until the app registry is built.
        from core import preview_signals  # noqa: F401
