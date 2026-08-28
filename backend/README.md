# Jdiobe STEM Foundation — backend

Django + PostgreSQL. It serves:

- **API** for the website, at `/api/` — the Next.js route handlers proxy to it
- **API** for the staff dashboard, at `/api/admin/` — token-authenticated, ABAC-scoped
- **Django admin**, on its own subdomain, for the things only a superuser does
  (creating accounts, setting roles and country scope)
- **Postgres**, which is the first place any of this data has been kept

The dashboard staff actually work in is the Next.js one, in `app/admin/` of the
site repo — see "Access control" below for how the two relate.

Until now every form on the site relayed to an inbox once and forgot. There was
no record of who volunteered, which schools registered projects, or who is on
the mailing list. That is what this fixes.

## Running it

Nothing to install on the host — Docker pins Python 3.12 and Postgres 16.

```bash
cd backend
cp .env.example .env          # optional; the defaults already work locally
docker compose up -d
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

| | |
|---|---|
| Dashboard | http://admin.localhost:8000/ |
| API health | http://localhost:8000/api/health/ |
| Postgres | `localhost:5432`, database `jdiobe`, user `jdiobe` |

`admin.localhost` resolves to `127.0.0.1` in every current browser, so there is
no `/etc/hosts` editing to do.

Without Docker: create a virtualenv, `pip install -r requirements.txt`, point
`POSTGRES_HOST` at your own Postgres, then `python manage.py migrate`.

## The subdomain split

`core/middleware.AdminSubdomainMiddleware` picks the URLconf by hostname:

- `admin.localhost` (production: `admin.jdiobestem.org`) → `config/admin_urls.py`, the dashboard
- anything else → `config/urls.py`, the API only

So `/admin/` on the API hostname returns **404**, not a login page. The
dashboard is absent from that host rather than merely unlinked.

## Authentication

Every endpoint except `/api/health/` requires either:

- an `X-API-Key` header matching `SERVICE_API_KEY` — this is what the Next.js
  route handlers send, server-to-server, or
- a signed-in staff session, for reading the API in a browser

The key is compared in constant time. It must never reach a browser, so keep it
out of any `NEXT_PUBLIC_*` variable.

## Endpoints

| Method | Path | Used by |
|---|---|---|
| GET | `/api/health/` | load balancers (unauthenticated) |
| POST | `/api/volunteers/` | `/api/volunteer` on the site |
| POST | `/api/newsletter/` | footer signup — idempotent, re-subscribes on return |
| POST | `/api/contact/` | ready; the site's contact form is not wired to it yet |
| POST | `/api/project-proposals/` | Science Fair registration |
| POST | `/api/donations/` | the Stripe webhook, keyed on session id so redelivery updates |
| GET | `/api/content/news/` | published news stories |
| GET | `/api/content/team/` | published team members |
| GET | `/api/content/magazine/` | magazine issues |

Writes **store first, then notify**. A flaky email provider can lose you a
notification; it can no longer lose you a submission.

## What the models do and do not assume

`programmes/` records what the Foundation does without prescribing it. There is
no matching algorithm, no cycle length, no vetting workflow and no safeguarding
field, because none of those has been written down — inventing them in a schema
would be worse than leaving them out. A pairing is two people, a cohort, and
dates.

The one exception is `ScienceFairProject.stage`, which is exactly the eight
stages published on `/secondary-research`, in order.

`submissions/` mirrors the live forms field for field. Submitted fields are
read-only in the admin: this is a record of what somebody sent, and editing it
after the fact would quietly destroy that. Only `status` and `staff_notes` can
be changed.

`donations/` is read-only end to end. Stripe stays the source of truth for
money; a locally edited amount would produce a total that silently disagrees
with the payment processor.

## Access control (ABAC)

What somebody may do is computed from **attributes** — their role, the country
they work in, and the resource they are reaching for — not from a fixed list of
permissions. That matters because the Foundation works in two countries: a
Uganda coordinator and a South Sudan coordinator hold the same role and must not
see each other's students.

`accounts/policy.py` holds the whole thing, and answers two separate questions:

| | |
|---|---|
| `can(user, resource, action)` | may they do this at all? |
| `scope(user, queryset, resource)` | which rows may they see? |

Keeping them apart is what makes country scoping work. Both coordinators answer
yes to the first question for mentees; they get different answers to the second.

**Roles**: super administrator, executive director, country director, programme
manager, mentorship coordinator, Science Fair coordinator, content editor,
finance, viewer. The matrix is a literal in `policy.py` — read it there rather
than trusting a summary here.

**Country**: blank means every country. A country-scoped user sees rows matching
their country **plus rows not yet assigned to one** — a volunteer application
arrives with no country on it, and a coordinator who could not see it could
never act on it. Assigning a country is how a record leaves the other office's
view.

Set a person's role and country in Django admin: **Staff and access → Staff
profiles**, or inline while editing the user.

Two layers enforce it, and both are required:

- `ResourcePermission` decides whether the action is allowed
- each ViewSet's `get_queryset` narrows the rows

The dashboard also receives the matrix at sign-in and hides what it is told to
hide. That is for the interface only — the API re-checks every request, so a
hidden button is a convenience, never a control.

## Object storage (Cloudflare R2)

Uploads go to R2 through django-storages' S3 backend — R2 speaks the S3 API. The
differences that matter are handled in `settings.py`: a custom endpoint, `auto`
as the region, and **no ACLs** (R2 rejects them, so asking for `public-read`
makes every upload fail).

Set `R2_ACCOUNT_ID`, `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID` and
`R2_SECRET_ACCESS_KEY` to switch it on; without all four, uploads go to the
local filesystem so a fresh clone runs without live storage keys.

`R2_PUBLIC_URL` is the bucket's public hostname (an `r2.dev` URL or your own
domain). Without it, media URLs are time-limited signed links — fine privately,
useless in an `<img src>` on the public site.

`POST /api/uploads/` takes one file, checks it against
`UPLOAD_ALLOWED_TYPES` and `UPLOAD_MAX_BYTES` server-side, stores it under a
generated name (never the uploaded one — user filenames bring path separators
and collisions with them), and returns the URL.

## Operations boards (migrated from monday.com)

The Foundation is **leaving monday.com**. Postgres is the system of record and
nothing is ever written back — the import is a migration, run once, not a sync.

The account held **74 boards** (about 50 real ones plus monday's hidden
"Subitems of X" boards) covering fundraising, finance, programmes, HR,
governance, marketing and operations. Writing a Django model per board would be
weeks of work that breaks the next time somebody adds a column, so `operations/`
mirrors monday's own shape instead:

    Board -> BoardGroup, BoardColumn -> Record(values JSONB, keyed by column)

That means every board works, including ones that did not exist when this was
written; a new column appears after an import rather than needing a migration;
and the dashboard renders any board from its column definitions — its table,
its filters, and its record form are all generated.

Values are JSONB keyed by column id rather than an entity-attribute-value
table. Postgres queries JSONB well and one record stays one row; EAV would turn
every list into a pivot.

### Running the migration

    # one personal API token, used once
    export MONDAY_API_TOKEN=...
    docker compose exec web python manage.py import_from_monday

    # or without a token, from an export file
    docker compose exec web python manage.py import_from_monday \
        --from-file operations/fixtures/monday-export-sample.json

Idempotent — keyed on the monday id, so a re-run updates rather than
duplicates. Records created in the dashboard (`is_local`) are never touched.
**Delete `MONDAY_API_TOKEN` once the import is verified.**

### Boards that overlap the typed tables

Some boards cover the same ground as tables the public website writes to. The
typed table stays the system of record for anything a visitor submits; see
`OVERLAPS` in `operations/management/commands/import_from_monday.py`.

| Board | Also lives in |
|---|---|
| Volunteer Applications, Volunteer registration management | `submissions.VolunteerApplication` |
| Marketing Contacts | `submissions.NewsletterSubscriber` |
| Donors | `donations.Donation` (Stripe owns the money itself) |
| Mentees, Mentors | `programmes.Mentee`, `programmes.Mentor` |
| Project Proposals | `submissions.ProjectProposal` |
| Beneficiaries / Students | `programmes.Mentee` |

## Before this goes to a server

- [ ] `DJANGO_SECRET_KEY` and `SERVICE_API_KEY` — real values (startup refuses to run without them once `DJANGO_DEBUG=0`)
- [ ] `DJANGO_DEBUG=0`
- [ ] `DJANGO_ALLOWED_HOSTS` and `ADMIN_HOST` set to the real hostnames
- [ ] `DJANGO_CSRF_TRUSTED_ORIGINS` set to the `https://` origins
- [ ] TLS on both hostnames, and a DNS record for `admin.`
- [ ] `python manage.py collectstatic`
- [ ] Run under gunicorn, not `runserver`
- [ ] Managed Postgres with automated backups
- [ ] `python manage.py check --deploy` clean
