# Deployment — 147.224.178.246

The backend and database run as Docker containers on a **shared** host that also
carries several unrelated services. Nothing here binds a port another stack
holds, and none of the host's own configuration is modified.

| | |
|---|---|
| API | `https://147-224-178-246.nip.io` |
| Django admin | **closed** — see below |
| Directory | `~/jdiobestem-platform` on the host |
| Compose project | `jdiobestem` |

## Why those hostnames

The provider exposes only ports **22, 80 and 443** to the internet, and 80
belongs to the host's own nginx (it path-proxies several other tenants). So this
stack owns 443 and nothing else.

`nip.io` resolves `<anything>.147-224-178-246.nip.io` to this IP, which supplies
a real hostname without owning a domain.

When a real domain points here, this is a three-line change: add the names to
`DJANGO_ALLOWED_HOSTS` / `DJANGO_CSRF_TRUSTED_ORIGINS`, set `ADMIN_HOST`, and
reissue the certificate for them.

## Shape of the stack

```
                     :443  ──►  proxy (nginx, TLS)  ──►  web (gunicorn, 3 workers)
                                                              │
                                                              ▼
                                                        db (postgres 16)
```

- **db** publishes no ports at all. It is reachable only from `web` on the
  compose network — not from the host, not from the internet.
- **web** publishes no ports either; the proxy is the only way in.
- **proxy** holds `443` and nothing else.
- All three use `restart: unless-stopped`, and Docker is enabled at boot, so the
  stack returns after a reboot.

## The Django admin is deliberately closed

The Foundation does not use it — the Next.js dashboard is the only admin UI —
so it is shut off rather than left running, because a login form reachable on
the public internet is attack surface with no corresponding benefit.

It is closed at two independent layers:

1. **nginx** answers any `admin.*` host with `444` (connection closed, no
   response), so those requests never reach the application.
2. **`DJANGO_ALLOWED_HOSTS` contains no `admin.*` name**, and `ADMIN_HOST` is
   `disabled.invalid`. `AdminSubdomainMiddleware` selects the dashboard URLconf
   on a `Host` beginning `admin.` — a Host that can no longer arrive. On the API
   host, `/admin/` and `/login/` are 404: absent, not merely unlinked.

Neither layer affects the dashboard you do use. The Next.js app authenticates
against `/api/auth/login/` with DRF tokens and reads `/api/admin/...`; none of
that touches Django's admin site.

`manage.py createsuperuser` and friends still work — they are auth, not admin.

The `admin.` name is left **reserved, not reused**: when the Next.js dashboard
is deployed it belongs on that hostname, and the certificate already covers it.
At that point, replace the `return 444;` server block with a proxy to the
Next.js app.

If you want it gone entirely rather than merely unreachable, dropping
`django.contrib.admin` from `INSTALLED_APPS` and deleting `config/admin_urls.py`
removes the code as well — a change to the app rather than the deployment, so it
is not done here.

## TLS

A real Let's Encrypt certificate, issued over TLS-ALPN-01 on 443 (certbot's
standalone plugin cannot do that challenge; `acme.sh` can — which is why it is
the client here). Port 80 was never touched.

`renew-cert.sh` runs weekly from cron. It stops the proxy for the ~20 seconds
the challenge needs, renews only if due, reinstalls the cert only if it actually
changed, and restores the proxy from an `EXIT` trap so a failed renewal can
never leave the site down.

No email was registered with Let's Encrypt, so **there are no expiry warnings** —
the cron job is the only thing keeping the certificate alive. Check
`renew-cert.log` occasionally, or register an address to get notices.

## Everyday commands

```bash
cd ~/jdiobestem-platform
DC="docker compose -f docker-compose.prod.yml --env-file .env.prod"

$DC ps
$DC logs -f web
$DC exec web python manage.py <command>
$DC up -d --build web          # after changing backend code
```

## Deploying a code change

```bash
# from the repo root, on your machine — `backend/` sits at the top level,
# alongside `frontend/`, so this path is unchanged by the reorganisation
tar czf - --exclude=__pycache__ --exclude='*.pyc' --exclude=.env \
          --exclude=media --exclude=staticfiles backend \
  | ssh dockeruser@147.224.178.246 'tar xzf - -C ~/jdiobestem-platform'
ssh dockeruser@147.224.178.246 \
  'cd ~/jdiobestem-platform && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build web'
```

`migrate` and `collectstatic` run automatically on every container start.

If you copy from macOS, delete the `._*` AppleDouble files tar brings along:
`find ~/jdiobestem-platform -name '._*' -delete`.

## Seeding a fresh database

```bash
$DC exec web python manage.py seed_countries
$DC exec web python manage.py import_from_monday --schema-only \
      --from-file operations/fixtures/board-structures.json
$DC exec web python manage.py prune_boards
```

`prune_boards` matters: the fixture is a faithful monday.com export, so
re-importing it resurrects the boards the Foundation decided to drop. The
command re-applies that decision (73 boards → 59). Run it after every import.

## Secrets

`.env.prod` (mode 600, on the host only) holds freshly generated
`DJANGO_SECRET_KEY`, `SERVICE_API_KEY` and `POSTGRES_PASSWORD` — **not** the
development values, which the app refuses to start with when `DJANGO_DEBUG=0`.

The R2 credentials were copied from local development. They were exposed in
chat, so **rotate them in Cloudflare** and update both `backend/.env` and
`~/jdiobestem-platform/.env.prod`, then `$DC up -d web`.

The R2 bucket is world-readable by URL. Donor records, safeguarding documents
and student personal data must not be stored in it.

## Connecting the website

The site is not deployed yet. When it is, set on the host:

```
SITE_ORIGIN=https://<the site's origin>
CORS_ALLOWED_ORIGINS=https://<the site's origin>
```

and give the Next.js app `BACKEND_URL=https://147-224-178-246.nip.io` plus the
`SERVICE_API_KEY` from `.env.prod` (server-side only — never `NEXT_PUBLIC_*`).

Deploying the dashboard itself on `admin.<domain>` means swapping the `444`
block described above for a proxy to it, and adding that origin to
`DJANGO_CSRF_TRUSTED_ORIGINS` and `CORS_ALLOWED_ORIGINS`.
