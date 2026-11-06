"""
Retire the page blocks behind the section labels removed from the site.

Those labels (the small line above a section heading, such as "How it works")
are no longer rendered, so their rows would only leave editors changing text
that appears nowhere. The seed command no longer creates them either.
"""

from django.db import migrations

RETIRED = {'about': ['forward.eyebrow', 'founder.eyebrow', 'mission.eyebrow', 'where.eyebrow'], 'aerospace-institute': ['p.planned-facilities', 'p.the-road-there'], 'community-outreach': ['p.community-stem-outreach'], 'impact': ['p.evidence-of-activity', 'p.impact-snapshot', 'p.impact-story', 'p.looking-ahead', 'p.support-the-impact', 'p.what-we-measure'], 'mentorship': ['p.why-it-matters'], 'scholarship': ['p.stem-scholarship-program'], 'secondary-research': ['p.how-it-works', 'p.the-proposal', 'p.uganda-national-secondary-school-science', 'p.who-may-enter'], 'south-sudan': ['p.looking-ahead', 'p.our-approach'], 'uganda': ['p.looking-ahead', 'p.on-the-ground'], 'volunteers': ['p.get-involved', 'p.why-we-need-you'], 'youth-stem': ['p.youth-stem-school-program']}


def retire(apps, schema_editor):
    PageBlock = apps.get_model("content_cms", "PageBlock")
    for page, keys in RETIRED.items():
        PageBlock.objects.filter(page=page, key__in=keys).delete()


class Migration(migrations.Migration):
    dependencies = [("content_cms", "0012_teammember_account")]
    operations = [migrations.RunPython(retire, migrations.RunPython.noop)]
