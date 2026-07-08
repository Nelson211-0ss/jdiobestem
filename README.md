# jdiobe STEM Foundation — site

Static HTML/CSS/JS with optional **Stripe Checkout** for donations via **Netlify Functions**.

## Donations (Stripe)

1. Copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY` (Stripe Dashboard → Developers → API keys — start with **test** keys for local/preview).
2. Install dependencies: `npm install`
3. Run locally so `/api/create-checkout-session` is served: **`npm run dev`** then open **http://localhost:3000/donate**. The dev server loads `.env` and serves the same checkout handler used in production. (Avoid the editor's "Live Server" on port 5500 — it serves static files only and cannot run the donate API.)
4. Test the flow with a [Stripe test card](https://stripe.com/docs/testing) such as `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.
5. Connect the repo to **Netlify**, set **`STRIPE_SECRET_KEY`** (and **`PUBLIC_SITE_URL`**) in the site’s environment variables. Deploy.
6. Use [Stripe test cards](https://stripe.com/docs/testing) on **deploy previews** until you switch the **production** context to **live** keys.

> Alternative: `npx netlify dev` also works and additionally exercises the Netlify rewrite in `netlify.toml`, but requires the Netlify CLI.

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

1. Import the repo in Vercel. `api/create-checkout-session.js` and
   `api/stripe-webhook.js` are auto-detected as serverless functions at
   `/api/*`; the static pages use `vercel.json` rewrites.
2. In **Project → Settings → Environment Variables** (Production), set
   **`STRIPE_SECRET_KEY`** (`sk_live_…`), **`STRIPE_WEBHOOK_SECRET`** (`whsec_…`
   from the live webhook endpoint), and **`PUBLIC_SITE_URL`** (your canonical
   origin, no trailing slash). Production **rejects `sk_test_…`** keys.
3. Deploy, then add the live webhook endpoint (step 1 above) pointing at the
   deployed `/api/stripe-webhook`.

### Production (go-live)

Before pointing donors at the live site:

1. In **Netlify** → Site settings → Environment variables ( **Production** context ), set **`STRIPE_SECRET_KEY`** to your **live** secret (`sk_live_…`). Production deploys **reject `sk_test_…`** when Netlify sets `CONTEXT=production`.
2. Set **`PUBLIC_SITE_URL`** to your canonical origin (e.g. `https://www.jdiobestem.org`, no trailing slash) so Stripe success/cancel URLs are correct.
3. If you ever run the same checkout code on **another host** (not Netlify), set **`SITE_ENV=production`** there so mock checkout stays off and test keys are rejected.
4. Do **not** set **`MOCK_CHECKOUT`** in production (it is ignored when production is detected, but keep envs clean).
5. Complete Stripe **activation** for live charges; smoke-test on a **branch / deploy preview** first.

### Offline / no-Stripe testing

Real Stripe Checkout needs the internet. For **UI-only** testing:

1. **Browser-only (localhost)** — `donate.html?mock_checkout=1` on `localhost` / `127.0.0.1`. Optional: `localStorage.setItem('jdiobe_donate_mock', '1')`; clear with `removeItem`.
2. **Local dev server, no Stripe** — in `.env`, `MOCK_CHECKOUT=1` and `npm run dev` (or `npx netlify dev`). Ignored on **production** deploys.

**GitHub Pages–only** cannot run Netlify Functions; use Netlify (or another backend that implements the same POST API) for donations.

## Project layout

- `donate.html` — amount picker; redirects to Stripe Checkout.
- `donate-success.html` — post-payment thank-you page.
- `api/create-checkout-session.js` — checkout session API (Vercel serverless function at `/api/create-checkout-session`).
- `api/stripe-webhook.js` — Stripe webhook receiver (`/api/stripe-webhook`).
- `netlify/functions/*.js` — same two handlers for Netlify (`netlify.toml` rewrites the `/api/*` paths here).
- `lib/stripeCheckoutSession.js` — shared Stripe session creation.
- `lib/stripeWebhook.js` — shared webhook verification + `recordDonation()` hook.