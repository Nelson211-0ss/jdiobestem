"""Creating accounts, revoking and restoring access, and signing people out."""

from django.contrib.auth.models import User
from django.contrib.sessions.backends.db import SessionStore
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from accounts.models import StaffProfile
from activity.models import ActivityLog
from content_cms.models import TeamMember


class StaffAccountsTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser("boss", "boss@jdiobestem.org", "x-Strong-Pass-1")
        self.c = APIClient()
        self.c.force_authenticate(self.admin)
        self.member = TeamMember.objects.create(name="Jane Doe", role=TeamMember.Role.choices[0][0], email="jane.doe@jdiobestem.org")

    def test_options(self):
        r = self.c.get("/api/admin/staff-accounts/")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertTrue(any(m["label"] == "Jane Doe" for m in r.data["team_members"]))
        self.assertTrue(r.data["roles"])

    def test_create_with_role_and_link(self):
        r = self.c.post("/api/admin/staff-accounts/", {
            "first_name": "Jane", "last_name": "Doe", "email": "Jane.Doe@jdiobestem.org",
            "role": "finance", "country": "UG", "team_member": self.member.id,
            "password": "Kampala-River-2026!"}, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        u = User.objects.get(pk=r.data["id"])
        self.assertEqual(u.username, "jane.doe")
        self.assertEqual(u.email, "jane.doe@jdiobestem.org")
        self.assertTrue(u.is_staff and u.is_active and u.has_usable_password())
        self.assertEqual(u.staff_profile.role, "finance")
        self.assertEqual(u.staff_profile.country, "UG")
        self.member.refresh_from_db()
        self.assertEqual(self.member.account_id, u.id)
        self.assertTrue(ActivityLog.objects.filter(resource="users", object_id=str(u.pk)).exists())
        # appears in the list with role/country
        lst = self.c.get("/api/admin/users/")
        row = [x for x in lst.data["results"] if x["id"] == u.id][0]
        self.assertEqual(row["role_display"], "Finance")
        self.assertEqual(row["country_label"], "Uganda")
        self.assertTrue(row["has_password"])

    def test_create_validation(self):
        r = self.c.post("/api/admin/staff-accounts/", {"first_name": "", "email": "x@gmail.com", "role": "nope", "password": "123"}, format="json")
        self.assertEqual(r.status_code, 400)
        for k in ("first_name", "email", "role", "password"):
            self.assertIn(k, r.data)
        r = self.c.post("/api/admin/staff-accounts/", {"first_name": "B", "email": "boss@jdiobestem.org"}, format="json")
        self.assertIn("email", r.data)

    def test_no_password_and_duplicate_username(self):
        User.objects.create_user("sam", "sam@other.org")
        r = self.c.post("/api/admin/staff-accounts/", {"first_name": "Sam", "email": "sam@jdiobestem.org"}, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        u = User.objects.get(pk=r.data["id"])
        self.assertEqual(u.username, "sam2")
        self.assertFalse(u.has_usable_password())
        self.assertEqual(u.staff_profile.role, "viewer")

    def test_non_superuser_refused(self):
        plain = User.objects.create_user("plain", "plain@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        StaffProfile.objects.create(user=plain, role="director")
        c = APIClient(); c.force_authenticate(plain)
        self.assertEqual(c.post("/api/admin/staff-accounts/", {"first_name": "A", "email": "a@jdiobestem.org"}, format="json").status_code, 403)
        target = User.objects.create_user("t", "t@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        self.assertEqual(c.post(f"/api/admin/users/{target.id}/active/", {"active": False}, format="json").status_code, 403)
        self.assertEqual(c.post(f"/api/admin/users/{target.id}/sign-out/", {}, format="json").status_code, 403)

    def _signed_in(self, user):
        Token.objects.create(user=user)
        s = SessionStore(); s["_auth_user_id"] = str(user.pk); s.create()
        return s.session_key

    def test_revoke_and_restore(self):
        t = User.objects.create_user("t", "t@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        key = self._signed_in(t)
        r = self.c.post(f"/api/admin/users/{t.id}/active/", {"active": False}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        t.refresh_from_db()
        self.assertFalse(t.is_active)
        self.assertFalse(Token.objects.filter(user=t).exists())
        self.assertFalse(SessionStore().exists(key))
        self.assertEqual(r.data["user"]["is_active"], False)
        r = self.c.post(f"/api/admin/users/{t.id}/active/", {"active": True}, format="json")
        t.refresh_from_db(); self.assertTrue(t.is_active)
        self.assertEqual(ActivityLog.objects.filter(resource="users", object_id=str(t.pk)).count(), 2)

    def test_cannot_revoke_self_or_last_superuser(self):
        r = self.c.post(f"/api/admin/users/{self.admin.id}/active/", {"active": False}, format="json")
        self.assertEqual(r.status_code, 400)
        other = User.objects.create_superuser("b2", "b2@jdiobestem.org", "x-Strong-Pass-1")
        other.is_active = True; other.save()
        # self.admin is another active superuser, so revoking b2 is fine
        self.assertEqual(self.c.post(f"/api/admin/users/{other.id}/active/", {"active": False}, format="json").status_code, 200)

    def test_sign_out_keeps_access(self):
        t = User.objects.create_user("t", "t@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        key = self._signed_in(t)
        r = self.c.post(f"/api/admin/users/{t.id}/sign-out/", {}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertEqual(r.data["ended"], 2)
        t.refresh_from_db(); self.assertTrue(t.is_active)
        self.assertFalse(Token.objects.filter(user=t).exists())
        self.assertEqual(self.c.post(f"/api/admin/users/{self.admin.id}/sign-out/", {}, format="json").status_code, 400)

    def test_access_form_deactivation_signs_out(self):
        t = User.objects.create_user("t", "t@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        self._signed_in(t)
        r = self.c.patch(f"/api/admin/users/{t.id}/access/update/", {"user": {"is_active": False}}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertFalse(Token.objects.filter(user=t).exists())

    def test_existing_routes_still_resolve(self):
        t = User.objects.create_user("t", "t@jdiobestem.org", "x-Strong-Pass-1", is_staff=True)
        self.assertEqual(self.c.get(f"/api/admin/users/{t.id}/").status_code, 200)
        self.assertEqual(self.c.get(f"/api/admin/users/{t.id}/access/").status_code, 200)
