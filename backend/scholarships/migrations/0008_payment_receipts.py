"""Several receipts per payment, and terms that can be named before they are dated.

The School Pay code on the payment goes: it was added a few days ago and every
code it holds is already on the bursary it belongs to, which is where a pupil's
code belongs. Checked before writing this, not assumed — see the carry-over
below, which fills a bursary that somehow has none rather than dropping a fact
somebody typed.
"""

from django.db import migrations, models


def carry_over(apps, schema_editor):
    Payment = apps.get_model("scholarships", "ScholarshipPayment")
    for payment in Payment.objects.all().select_related("scholarship"):
        if payment.receipt:
            payment.receipts = [payment.receipt]
        bursary = payment.scholarship
        if payment.school_pay_code and not bursary.school_pay_code:
            bursary.school_pay_code = payment.school_pay_code
            bursary.save(update_fields=["school_pay_code"])
        payment.save(update_fields=["receipts"])


def back(apps, schema_editor):
    Payment = apps.get_model("scholarships", "ScholarshipPayment")
    for payment in Payment.objects.exclude(receipts=[]):
        payment.receipt = (payment.receipts or [""])[0]
        payment.save(update_fields=["receipt"])


class Migration(migrations.Migration):

    dependencies = [("scholarships", "0007_payment_school_pay_code")]

    operations = [
        migrations.AddField(
            model_name="scholarshippayment",
            name="receipts",
            field=models.JSONField(
                blank=True, default=list, help_text="The receipts for this payment."
            ),
        ),
        migrations.RunPython(carry_over, back),
        migrations.RemoveField(model_name="scholarshippayment", name="receipt"),
        migrations.RemoveField(model_name="scholarshippayment", name="school_pay_code"),
        migrations.AlterField(
            model_name="scholarshipterm",
            name="starts_on",
            field=models.DateField(blank=True, db_index=True, null=True),
        ),
        migrations.AlterField(
            model_name="scholarshipterm",
            name="ends_on",
            field=models.DateField(blank=True, null=True),
        ),
    ]
