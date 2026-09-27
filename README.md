# Dark Coat Car Detailing — San Clemente, CA

Mobile car detailing site with online booking (Cloudflare Worker + D1) and Stripe payments.

| Item | Value |
|---|---|
| Phone | (949) 676-2205 |
| D1 source tag | `darkcoat` |
| Booking ID prefix | `DKC-` |
| Worker name | `darkcoat-detailing-worker` |
| Pages project | `darkcoat-car-detailing` |
| GitHub repo | `servicepros714/dark-coat` |
| Booking hours | 7:00 AM – 7:00 PM hourly, Mon–Sun, earliest slot 4 hours after current California time |
| Coupon | `PREPAY` = $15 off when paying online |

## Stack
Vite + React 18, React Router, date-fns, Stripe.js + @stripe/react-stripe-js, lucide-react, react-hot-toast.
Brand palette pulled from the logo: coat black `#08080A`, graphite `#16171A`, gunmetal `#2B2D32`, chrome `#E7E7EA`, candy red `#D40A0F`, red highlight `#F22A2F`, deep red `#8C0006`.
Fonts: Saira Semi Expanded (display), Saira Condensed (labels), Figtree (body).

## Setup

### 1. Worker (Cloudflare dashboard)
1. Workers & Pages → Create → Worker → name it `darkcoat-detailing-worker`.
2. Edit code → paste `worker/worker.js` → Deploy.
3. Settings → Bindings → add **D1 database**, variable name `DB`, pick the shared bookings database for the account.
4. Settings → Variables and Secrets → add secret `STRIPE_SECRET_KEY` (sk_live_...).
5. Optional: add variable `ALLOWED_ORIGIN` = your Pages URL.
6. Test: open `https://darkcoat-detailing-worker.<subdomain>.workers.dev/api/health`.

### 2. Frontend
Edit `.env.local` (committed on purpose — both values are public):
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_API_URL=https://darkcoat-detailing-worker.<subdomain>.workers.dev
```

### 3. GitHub + Cloudflare Pages
1. Create the Pages project `darkcoat-car-detailing` (Direct Upload) in Cloudflare.
2. GitHub repo → Settings → Secrets and variables → Actions → add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
3. Push to `main` — `.github/workflows/deploy.yml` builds and deploys `dist`.

## Local dev (Windows CMD)
```
npm install
npm run dev
```

## Before launch
- Replace the placeholder reviews in `src/config/business.js` with real Google reviews.
