# Jdiobe STEM Foundation

Three parts, in three folders.

| | |
|---|---|
| `frontend/` | The public website and the admin dashboard. Next.js. |
| `backend/`  | The API, the database models, and the admin's authorisation. Django. |
| `deploy/`   | Production Docker Compose, nginx, and the TLS renewal script. |
| `assets/`   | Source files the app does not ship — see `assets/README.md`. |

```bash
cd frontend && npm install && npm run dev   # http://localhost:3000
cd backend  && docker compose up            # http://localhost:8000/api/health/
```

The frontend talks to the backend over HTTP, so the two run and deploy
independently. `backend/DEPLOYMENT.md` covers the live server.

The rest of this file documents the frontend in detail.

---

**Next.js** (App Router, TypeScript, Tailwind CSS) with optional **Stripe Checkout**
for donations via Next.js Route Handlers.

## Design system

Five colours and one typeface.

| Token | Hex | Role |
| --- | --- | --- |
| cream | `#FFF1E0` | the page |
| charcoal | `#3A3B47` | body ink, dark surfaces, ink on orange fills |
| orange | `#FE5C00` | the single accent: CTAs, eyebrows, rules, icons |
| white | `#FFFFFF` | cards and alternating bands |
| black | `#000000` | display headings |

**Type** is Vistol Sans throughout, self-hosted via `next/font/local` from
`app/fonts/` (weights 300–900 plus two italics). Headings run heavy (700–800)
with tight leading and negative tracking; body copy stays modest with generous
leading. Every display size is a `clamp()`, so headings scale continuously
rather than stepping at breakpoints — see `styles/typography.css`.

**Ink on orange is charcoal, not white.** White on `#FE5C00` is 3.11:1, which
fails AA for body copy and for button labels; charcoal on the same fill is
5.31:1. Orange surfaces and primary buttons therefore take charcoal ink, which
is also what the project's original colour spec called for.

Two feedback colours (a warm red, a desaturated green) sit outside the five for
form validation, because an error state needs to be distinguishable from the
accent. They are held close to the palette — see the comment in
`tailwind.config.ts`.

**Nothing on the site draws a border.** Cards, panels, and form fields are
distinguished by fill and shadow; sections are separated by a soft upward
shadow (`main > section + section`) rather than a rule; secondary buttons are a
charcoal tint rather than an outline; inputs are filled wells with an orange
focus ring. Buttons are flat — no shadow, no lift on hover.

Reusable pieces live in `styles/brand-colors.css`: `.btn-primary` /
`.btn-secondary` / `.btn-ghost` / `.btn-on-brand` (pills that resolve their
colours from the surface they sit on), `.card` / `.card-plain`, `.panel-brand`,
`.section` / `.container-page` / `.section-head`, `.split`, `.eyebrow`,
`.chip`, `.stat-figure`, `.underline-sketch`, and `.pattern-band`.

A section that lays copy over a photograph must carry `.on-dark-surface`, which
is what flips the surface-aware buttons and ink to their light-on-dark form.

Layout is fluid rather than breakpoint-driven: card grids use
`repeat(auto-fit, minmax(...))`, section padding and gutters are `clamp()`d, and
the site was checked for horizontal overflow at 320, 390, 768, and 1440px.

## Getting started

```bash
npm install
cd frontend && npm run dev      # http://localhost:3000
```

Other scripts: `npm run build` (production build), `npm start` (serve the build),
`npm run lint`, `npm run typecheck`.

## Donations (Stripe)

1. Copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY` (Stripe Dashboard → Developers → API keys — start with **test** keys for local/preview).
2. Install dependencies: `npm install`
3. Run locally so `/api/create-checkout-session` is served: **`cd frontend && npm run dev`** then open **http://localhost:3000/donate**. Next loads `.env` / `.env.local` and serves the same route handler used in production.
4. Test the flow with a [Stripe test card](https://stripe.com/docs/testing) such as `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.
5. Deploy to a host that runs Next.js (Vercel, or Netlify with `@netlify/plugin-nextjs`) and set **`STRIPE_SECRET_KEY`** (and **`PUBLIC_SITE_URL`**) in its environment variables.
6. Use [Stripe test cards](https://stripe.com/docs/testing) on **deploy previews** until you switch the **production** context to **live** keys.

### Webhook (records each donation)

When a payment completes, Stripe calls `POST /api/stripe-webhook`. The handler
verifies the Stripe signature and hands the donation to `recordDonation()` in
`lib/stripeWebhook.js`, which currently logs one `[donation] {…}` line to the
function logs (donors also get Stripe's own email receipt). Extend
`recordDonation()` to email yourself, append to a sheet, or write to a database.

Set up:

1. In **Stripe Dashboard → Developers → Webhooks → Add endpoint**, use
   `https://your-domain/api/stripe-webhook` and subscribe to
   **`checkout.session.completed`**. Copy the endpoint's **Signing secret**
   (`whsec_…`).
2. Add **`STRIPE_WEBHOOK_SECRET`** to your host's environment variables
   (alongside `STRIPE_SECRET_KEY`).
3. Test locally with the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   `stripe listen --forward-to localhost:3000/api/stripe-webhook` — it prints a
   `whsec_…` to put in `.env`, then `stripe trigger checkout.session.completed`.

### Donation notifications (optional)

`recordDonation()` always logs and, if configured, also notifies you. Each
channel is independent and off until its env vars are set.

**Email (Resend)** — set `RESEND_API_KEY`, `DONATION_NOTIFY_EMAIL` (recipient),
and `DONATION_FROM_EMAIL` (a sender on a domain you've verified in Resend). You
get one email per completed donation, and the **donor** gets a branded
thank-you email (uses `RESEND_API_KEY` + `DONATION_FROM_EMAIL`, sent to the
address they entered).

**Donor receipt** — the donor's email is passed to Stripe as `receipt_email`,
so Stripe emails them its official payment receipt. Enable **Dashboard →
Settings → Customer emails → "Successful payments"** for receipts to send (in
test mode this must be on to see them).

**Google Sheet** — set `GOOGLE_SHEET_WEBHOOK_URL` to a deployed Apps Script web
app. In your sheet: **Extensions → Apps Script**, paste the script below, then
**Deploy → New deployment → Web app**, execute as *Me*, access *Anyone*, and
copy the `/exec` URL:

```javascript
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['When', 'Amount', 'Currency', 'Name', 'Email', 'Session', 'PaymentIntent']);
  }
  sheet.appendRow([d.createdAt, d.amount, d.currency, d.name, d.email, d.sessionId, d.paymentIntent]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Notifications are best-effort: if one fails it's logged (`[donation:email]` /
`[donation:sheet]`) but the webhook still returns 200 so Stripe doesn't retry.

### Deploy on Vercel

1. Import the repo in Vercel. It is detected as a Next.js project — the route
   handlers under `app/api/*` become serverless functions at `/api/*`, and every
   page prerenders to static HTML at build time.
2. In **Project → Settings → Environment Variables** (Production), set
   **`STRIPE_SECRET_KEY`** (`sk_live_…`), **`STRIPE_WEBHOOK_SECRET`** (`whsec_…`
   from the live webhook endpoint), and **`PUBLIC_SITE_URL`** (your canonical
   origin, no trailing slash). Production **rejects `sk_test_…`** keys.
3. Deploy, then add the live webhook endpoint (step 1 above) pointing at the
   deployed `/api/stripe-webhook`.

### Production (go-live)

Before pointing donors at the live site:

1. In your host's **Production** environment variables, set **`STRIPE_SECRET_KEY`** to your **live** secret (`sk_live_…`). Production deploys **reject `sk_test_…`** when Netlify sets `CONTEXT=production`, or when you set `SITE_ENV=production` anywhere else.
2. Set **`PUBLIC_SITE_URL`** to your canonical origin (e.g. `https://www.jdiobestem.org`, no trailing slash) so Stripe success/cancel URLs are correct.
3. On any host that does not set Netlify's `CONTEXT=production` (Vercel included), set **`SITE_ENV=production`** so mock checkout stays off and test keys are rejected.
4. Do **not** set **`MOCK_CHECKOUT`** in production (it is ignored when production is detected, but keep envs clean).
5. Complete Stripe **activation** for live charges; smoke-test on a **branch / deploy preview** first.

### Offline / no-Stripe testing

Real Stripe Checkout needs the internet. For **UI-only** testing:

1. **Browser-only (localhost)** — `/donate?mock_checkout=1` on `localhost` / `127.0.0.1`. Optional: `localStorage.setItem('jdiobe_donate_mock', '1')`; clear with `removeItem`.
2. **Local dev server, no Stripe** — in `.env`, `MOCK_CHECKOUT=1` and `cd frontend && npm run dev`. Ignored on **production** deploys.

A static-only host (GitHub Pages) cannot run the donation route handlers; deploy to a host that runs Next.js server code.

## Project layout

- `app/layout.tsx` — root layout: fonts, global stylesheets, header, footer, and
  the client components that drive scroll reveals, counters, and FAQ accordions.
- `app/<route>/page.tsx` — one file per route; each sets its own metadata and
  renders the matching component from `content/`.
- `content/*.tsx` — the page bodies, one per route. Mostly plain markup.
- `components/Logo.tsx` — the full lockup, inlined from
  `public/icons/full logo.svg` so the wordmark follows `currentColor` and one
  asset serves both the cream header and the charcoal footer.
- `components/TeamDirectory.tsx` — the tabbed team grid on `/team`.
- `components/PartnerMarquee.tsx` — the monochrome partner strip. `scale` per
  logo optically balances files that crop very differently.
- `components/Testimonials.tsx` — the home testimonial carousel. Its quotes are
  existing site copy lifted from the outreach and youth-STEM pages; nothing here
  is invented, and each links back to its source page.
- `components/HomeIcon.tsx` — illustrative section icons, inlined from
  `public/icons/home-page` so they follow `currentColor`.
- `components/MegaIcon.tsx` — the two-tone mega-menu icons, inlined from
  `public/icons/mega-menu`; their colours come from `--mega-ico-*` variables.
- `components/Logo.tsx` / `components/MagazineLogo.tsx` — the foundation and
  magazine wordmarks, inlined so they follow `currentColor` and work on both
  cream and charcoal.
- `content/` — one component per route, taking its data as props. News stories,
  magazine issues, team members, programmes, site figures and the editable copy
  on the hand-built pages all come from the CMS through `lib/site-content.ts`;
  the page components hold layout, not content. Publishing is a change in the
  dashboard, not a deploy.
- `components/` — shared and interactive pieces: `Header`, `Footer`,
  `HeroSection` (the home carousel), `DonateForm`, `ContactForm`,
  `VolunteerForm`, and `Icon` / `SocialIcon`, which render Feather and brand
  SVGs on the server.
- `styles/` — the site's hand-written CSS: `brand-colors.css` (design tokens and
  component classes), `typography.css` (the type scale), `scroll-animations.css`,
  and `pages.css` (rules only a single route uses). `app/globals.css` holds the
  Tailwind layers; `app/layout.tsx` imports it after the others so utilities win.
- `tailwind.config.ts` — the five-colour palette expanded into Tailwind ramps, so
  the utility classes already spread through the markup resolve into it.
- `app/fonts/` — Vistol Sans woff2 files, loaded by `next/font/local`.
- `app/api/create-checkout-session/route.ts` — checkout session API.
- `app/api/stripe-webhook/route.ts` — Stripe webhook receiver.
- `app/api/volunteer/route.ts` — volunteer application relay (Resend).
- `app/api/newsletter/route.ts` — footer newsletter signup (Resend audience, or
  an email relay while the list is being set up).
- `app/api/project-proposal/route.ts` — Science Fair project registration
  (Resend relay). Needs `RESEND_API_KEY`; `PROPOSALS_TO` / `PROPOSALS_FROM`
  override the destination and sender.

`/about` covers the organisation — story, mission, founder's journey, values,
and where the work happens. `/team` covers the people, and is where team members
and mentors now live. `/news` is an index; each story has its own page.
`/magazine` is STEM Bridge Magazine. `/secondary-research` is the Science Fair
and research programme: how it works, who may enter, what a proposal contains,
the handbook and forms to download, and the online project registration. The
page's copy is taken from the Student Research & Innovation Handbook in
`public/science-fair-or-projects` — the six categories, the eight stages and the
proposal contents all come from that document, not from invention.

Two pages were folded into larger ones and now redirect (see `next.config.mjs`):
the FAQs live in a section on `/contact`, and the Regina Henry Scholarship is a
card on `/scholarship`.
- `lib/stripeCheckoutSession.js` — shared Stripe session creation.
- `lib/stripeWebhook.js` — shared webhook verification + `recordDonation()` hook.
- `public/` — images and the favicon, served from the site root.

## Backend, database, and staff dashboard

The Python backend lives in [`backend/`](backend/README.md) — Django + PostgreSQL,
with the staff dashboard served on its own subdomain (`admin.localhost:8000`
locally, `admin.jdiobestem.org` in production).

The site's volunteer, newsletter, project-proposal and donation paths proxy to
it, so submissions are stored before anyone tries to email them. Set
`BACKEND_API_URL` and `BACKEND_API_KEY` (see `.env.example`) for those forms to
work; without them the routes answer 503 rather than accepting a submission that
goes nowhere.

### Staff dashboard

`app/admin/` is the dashboard staff work in: Next.js, shadcn/ui, signed in
against the backend. It is served on the `admin.` subdomain (middleware routes
by hostname) and at `/admin` on the main host for local work.

Every screen is generated from `lib/admin/resources.ts` — the nav, the tables,
the filters and the forms — so a model change is one edit rather than fourteen
near-identical pages that drift apart.

Sign-in stores the API token in an **httpOnly** cookie, so no script on the page
can read it. What a person sees is decided by the backend's ABAC policy.
