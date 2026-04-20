# jdiobe STEM Foundation — site

Static HTML/CSS/JS with optional **Stripe Checkout** for donations (serverless).

## Donations (Stripe)

1. Copy `.env.example` to `.env` and set `STRIPE_SECRET_KEY` (Dashboard → Developers → API keys — start with **test** keys).
2. Install dependencies: `npm install`
3. Run locally with a serverless dev server so `/api/create-checkout-session` exists:
   - **Vercel:** `npx vercel dev`
   - **Netlify:** `npx netlify dev`
4. Deploy the repo to **Vercel** or **Netlify** (same env var `STRIPE_SECRET_KEY` in project settings). Set `PUBLIC_SITE_URL` if success/cancel URLs are wrong.
5. Use [Stripe test cards](https://stripe.com/docs/testing) until you switch to **live** keys.

**GitHub Pages–only hosting** cannot run the API route; use Vercel/Netlify (or another host with serverless functions) or a separate backend URL.

## Project layout

- `donate.html` — amount picker; redirects to Stripe Checkout.
- `donate-success.html` — post-payment thank-you page.
- `api/create-checkout-session.js` — Vercel serverless handler.
- `netlify/functions/create-checkout-session.js` — Netlify function (see `netlify.toml` rewrite to `/api/...`).
- `lib/stripeCheckoutSession.js` — shared Stripe session creation.