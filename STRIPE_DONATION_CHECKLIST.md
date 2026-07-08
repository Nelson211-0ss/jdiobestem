# Stripe donation setup — checklist

**Implemented in this repo:** **Stripe Checkout (custom amount)** + **webhook** — `api/create-checkout-session.js` & `api/stripe-webhook.js` (Vercel), mirrored in `netlify/functions/`, shared logic in `lib/stripeCheckoutSession.js` & `lib/stripeWebhook.js`. Each completed donation is recorded via `recordDonation()` in `lib/stripeWebhook.js`. See **`README.md`** for env vars and deploy. **Remaining:** add `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + `PUBLIC_SITE_URL` to Vercel, create the live webhook endpoint, and go live.

Use the list below in order. Check items off as you complete them.

---

## 1. Stripe account and business profile

- [ ] Create or log in to a [Stripe account](https://dashboard.stripe.com/register).
- [ ] Complete **Business settings** (legal name, address, tax details) as required for your entity.
- [ ] If you operate as a nonprofit, add **nonprofit / tax-exempt** details in Stripe where applicable (and confirm what Stripe supports in your country).
- [ ] Add **bank account** for payouts and complete **identity / verification** prompts so the account can go live.

---

## 2. Choose how donations connect to the website

Pick **one** primary path (you can add the other later):

| Approach | Best for | Needs server code? |
|----------|----------|----------------------|
| **A. Stripe Payment Links** | Fixed amounts, fastest launch | No — link from `donate.html` |
| **B. Stripe Checkout (Session)** | Custom amounts (matches current cart UI) | Yes — small backend to create a session with your **secret** key |
| **C. Stripe Embedded / Elements** | Full custom UI on your page | Yes — more work + PCI considerations |

**Recommendation for this project:** start with **A** to go live quickly, or **B** if you must keep the exact “choose amount then pay” flow (e.g. Netlify/Vercel serverless function).

---

## 3. API keys and security

- [ ] In Stripe Dashboard → **Developers → API keys**, copy **Publishable key** and **Secret key**.
- [ ] Use **Test mode** until everything works end-to-end.
- [ ] **Never** put the **secret** key in `donate.html`, `main.js`, or any file served to the browser.
- [ ] **Publishable** key is only used in the browser if you use Stripe.js / Checkout redirect flows that require it (depends on integration).
- [ ] Plan where secrets live: environment variables on your host (Netlify, Vercel, Railway, etc.), not in Git.

---

## 4. Product and pricing (Checkout / Payment Links)

- [ ] Decide currency (e.g. **USD**).
- [ ] For **Payment Links:** create one or more products/prices (e.g. $25, $50, $100) or a “customer chooses amount” link if available in your Dashboard.
- [ ] For **Checkout Sessions:** define how line items map from your form (`data-amount` / custom field) to Stripe **Price** IDs or `price_data` in the session.

---

## 5. Success, cancel, and customer experience

- [ ] Set **success URL** (e.g. `https://yoursite.org/donate-success.html`) and **cancel URL** (back to donate page).
- [ ] Customize **Stripe Checkout** branding (logo, colors) in Dashboard if using Checkout.
- [ ] Turn on **Stripe customer emails** for receipts (Dashboard → Settings → Emails) or use your own.

---

## 6. Webhooks (recommended for production)

- [x] Endpoint implemented: `POST /api/stripe-webhook` (`api/stripe-webhook.js` + `lib/stripeWebhook.js`).
- [x] Signature verification with `STRIPE_WEBHOOK_SECRET` (client is never trusted alone).
- [x] Handles `checkout.session.completed`; records paid donations via `recordDonation()`.
- [ ] In **Developers → Webhooks**, add the endpoint URL `https://your-domain/api/stripe-webhook`, subscribe to `checkout.session.completed`, and copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
- [ ] Optional: extend `recordDonation()` to email you / append to a sheet / write to a DB (currently logs a `[donation]` line to function logs).

---

## 7. Legal, tax, and trust

- [ ] Add or keep on the site: nonprofit status, EIN (if applicable), and that donations may be tax-deductible **only** if accurate for your jurisdiction (get professional advice).
- [ ] Privacy policy: mention payment processing via Stripe.
- [ ] Terms for donations/refunds if required.

---

## 8. Site and technical

- [ ] Serve the site over **HTTPS** in production (required by Stripe).
- [ ] Replace the current `donate.html` **alert** placeholder with the real flow (redirect to Payment Link or POST to your session endpoint).
- [ ] Test in **Test mode** with [test card numbers](https://stripe.com/docs/testing) (`4242 4242 4242 4242`, etc.).
- [ ] Switch to **Live** keys only after a full live-mode test with a small real charge if appropriate.

---

## 9. Go live

- [ ] Complete Stripe **activation** requirements for live charges.
- [ ] Rotate any test keys out of configs; deploy **live** publishable + secret (secret only on server).
- [ ] Monitor **Dashboard → Payments** and set up **email alerts** for failed payments or disputes.

---

## Quick reference — this repo

- Donation UI: `donate.html` (preset amounts + custom amount; submit currently shows an alert).
- Shared scripts: `main.js` (header/footer load).
- No `package.json` yet — if you add a backend, it will likely be a **separate** small API or serverless folder; keep secrets out of this static tree.

When this checklist is done for your chosen path (A or B), the next step is wiring `donate.html` and (if needed) adding the minimal serverless/backend project.
