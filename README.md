# Dark Coat Car Detailing — San Clemente, CA

Mobile car detailing site (https://darkcoatcardetailing.site) with SEO landing pages, online
booking (Cloudflare Worker + shared D1) and Stripe payments.

| Item | Value |
|---|---|
| Phone | (949) 676-2205 |
| Cloudflare account | Detailingmarketers2 (`5df257c170669d41c20367d89e7963d1`) |
| Pages project | `dark-coat-car-detailing-v2` (production branch `main`) |
| Worker | `dark-coat-car-detailing-v2` → https://dark-coat-car-detailing-v2.detailingmarketers2.workers.dev |
| D1 database | `detailing-bookings-detailingmarketers2` (shared; rows scoped by `source`) |
| D1 source tag | `darkcoat-san-clemente` |
| Booking ID prefix | `DKC-` |
| Hours | Every day, start times 8 AM – 5 PM, 4-hour lead time, 90 days ahead |

## Build

```bash
npm install
npm run build   # vite build → SSR build → scripts/prerender.js
```

`scripts/prerender.js` writes static HTML for every route in `ROUTES` (src/lib/seo.js), injects
the head tags and schema, writes `dist/sitemap.xml` and fails the build if a title is over 60
or a description over 160 characters. `/book`, `/checkout` and `/confirmation` ship head tags
only (they use the date, localStorage and Stripe). `dist/404.html` is served by Pages for
unknown URLs. There is no `public/_redirects` (it would hide the prerendered pages).
`public/_headers` keeps `*.pages.dev` out of search results.

## Where things live

| What | File |
|---|---|
| Business facts, FAQ, reviews, Google profile | `src/config/business.js` |
| Packages, prices, durations | `src/config/services.js` (display only; the Worker prices every charge) |
| Service and place pages (data) | `src/lib/pages.js` |
| Landing page template | `src/pages/Landing.jsx` |
| Head tags, schema, route list | `src/lib/seo.js` |
| Shared sections (packages, FAQ, reviews, CTA, link chips) | `src/components/Sections.jsx` |
| SEO styles | `src/styles/seo.css` |
| Booking API client | `src/lib/api.js` |
| Worker | `worker/worker.js`, `worker/wrangler.jsonc` |

**Reviews:** add real Google reviews to `REVIEWS` in `src/config/business.js`
(`{ name: 'First L.', text: '...' }`). The section and its menu link appear once the list has
entries. Set `GOOGLE_PROFILE_URL` (schema `sameAs`) and `GOOGLE_RATING` when known.

**Photos:** `public/images/`. The share image is `public/og-image.jpg` (1200×630).

## Worker

```bash
npx wrangler deploy --config worker/wrangler.jsonc
npx wrangler secret put STRIPE_SECRET_KEY --config worker/wrangler.jsonc
npx wrangler secret put GHL_WEBHOOK_URL   --config worker/wrangler.jsonc
npx wrangler secret put ADMIN_TOKEN       --config worker/wrangler.jsonc   # optional; admin routes stay closed without it
```

Routes: `GET /api/health`, `GET /api/availability?start=&end=`,
`POST /api/create-payment-intent`, `POST /api/bookings`, admin `GET /api/bookings` and
`PATCH /api/bookings/<id>` (Bearer `ADMIN_TOKEN`).
A card booking is saved as Paid only after the Worker checks the PaymentIntent with Stripe
(status, amount, services, date and time). If the slot was taken meanwhile, the payment is
refunded automatically. This D1 keeps the PaymentIntent on `bookings.payment_intent_id`
(unique) and the total/coupon in `notes`. Each new booking sends one `booking_confirmed`
event to GHL.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name dark-coat-car-detailing-v2 --branch main
```

Stripe: the publishable key in `.env.local` is public. Add the domain under Stripe → Settings →
Payment method domains so Apple Pay / Google Pay / Link show up.
