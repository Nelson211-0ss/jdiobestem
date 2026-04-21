# jdiobe STEM Foundation — site

Static HTML/CSS/JS with optional **Stripe Checkout** for donations via **Netlify Functions**.

## Donations (Stripe)

1. Copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY` (Stripe Dashboard → Developers → API keys — start with **test** keys for local/preview).
2. Install dependencies: `npm install`
3. Run locally so `/api/create-checkout-session` is served: **`npx netlify dev`** (uses `netlify.toml` to route `/api/…` to the function).
4. Connect the repo to **Netlify**, set **`STRIPE_SECRET_KEY`** (and **`PUBLIC_SITE_URL`**) in the site’s environment variables. Deploy.
5. Use [Stripe test cards](https://stripe.com/docs/testing) on **deploy previews** until you switch the **production** context to **live** keys.

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
2. **Local Netlify dev, no Stripe** — in `.env`, `MOCK_CHECKOUT=1` and `npx netlify dev`. Ignored on Netlify **production** deploys.

**GitHub Pages–only** cannot run Netlify Functions; use Netlify (or another backend that implements the same POST API) for donations.

## Project layout

- `donate.html` — amount picker; redirects to Stripe Checkout.
- `donate-success.html` — post-payment thank-you page.
- `netlify/functions/create-checkout-session.js` — checkout session API (`netlify.toml` rewrites `/api/create-checkout-session` here).
- `api/create-checkout-session.js` — same handler shape for other hosts that expect an `api/` file; not required for Netlify.
- `lib/stripeCheckoutSession.js` — shared Stripe session creation.