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
- `netlify/functions/create-checkout-session.js` — checkout session API (`netlify.toml` rewrites `/api/create-checkout-session` here).
- `api/create-checkout-session.js` — same handler shape for other hosts that expect an `api/` file; not required for Netlify.
- `lib/stripeCheckoutSession.js` — shared Stripe session creation.