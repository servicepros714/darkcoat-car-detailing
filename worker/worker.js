/**
 * Dark Coat Car Detailing — Cloudflare Worker
 * Worker name:   darkcoat-detailing-worker
 * D1 binding:    DB   (shared bookings table)
 * Secret:        STRIPE_SECRET_KEY   (sk_live_... — set in the dashboard)
 * Optional var:  ALLOWED_ORIGIN      (e.g. https://darkcoat-car-detailing.pages.dev — defaults to *)
 *
 * Routes
 *   GET  /api/health
 *   GET  /api/availability?date=YYYY-MM-DD
 *   POST /api/create-payment-intent
 *   POST /api/bookings
 */

const SOURCE = 'darkcoat';
const ID_PREFIX = 'DKC-';
const TZ = 'America/Los_Angeles';
const LEAD_MINUTES = 240; // 4 hours
const OPEN_HOUR = 7;
const CLOSE_HOUR = 19;

// Server-side prices in cents — never trust amounts from the browser.
const PACKAGES = {
  basic: { name: 'Basic Detail', cents: 15000 },
  premium: { name: 'Premium Detail', cents: 20000 },
};
const ADDON = { name: 'Exterior Wash', cents: 5000 };
const COUPONS = { PREPAY: 1500 };

// Fields the shared admin dashboard is allowed to patch.
const PATCHABLE = ['reschedule_date', 'reschedule_time', 'original_date', 'original_time', 'notes2'];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    service TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    vehicle TEXT,
    address TEXT,
    notes TEXT,
    source TEXT,
    created_at TEXT,
    status TEXT DEFAULT 'Confirmed',
    reschedule_date TEXT,
    reschedule_time TEXT,
    notes2 TEXT,
    original_date TEXT,
    original_time TEXT,
    payment_status TEXT
  )
`;

let schemaReady = false;

async function ensureSchema(db) {
  if (schemaReady) return;
  // .exec() fails on multi-line SQL ("incomplete input"), so collapse whitespace first.
  await db.exec(SCHEMA.replace(/\s+/g, ' ').trim());
  await db.exec('CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date)');
  schemaReady = true;
}

/* ---------------- helpers ---------------- */

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

function caNow() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  };
}

const VALID_TIMES = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => {
  const h = OPEN_HOUR + i;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { label: `${h12}:00 ${h < 12 ? 'AM' : 'PM'}`, minutes: h * 60 };
});

function isValidDate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
}

function slotTooSoon(date, minutes) {
  const now = caNow();
  if (date < now.dateStr) return true;
  if (date > now.dateStr) return false;
  return minutes < now.minutes + LEAD_MINUTES;
}

function priceFor(pkg, addon, coupon) {
  const p = PACKAGES[pkg];
  if (!p) return null;
  const subtotal = p.cents + (addon ? ADDON.cents : 0);
  const discount = COUPONS[String(coupon || '').toUpperCase()] || 0;
  return {
    subtotal,
    discount,
    total: subtotal - discount,
    service: addon ? `${p.name} + ${ADDON.name}` : p.name,
  };
}

function newId() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${ID_PREFIX}${t}${r}`;
}

function clean(v, max = 200) {
  return String(v ?? '').trim().slice(0, max);
}

async function stripe(env, path, method = 'GET', form) {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(form ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Stripe request failed');
  return data;
}

/* ---------------- routes ---------------- */

async function createPaymentIntent(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json(env, { error: 'Payments are not configured.' }, 503);
  const body = await request.json().catch(() => ({}));
  const price = priceFor(body.pkg, body.addon, body.coupon);
  if (!price) return json(env, { error: 'Invalid package.' }, 400);

  const form = {
    amount: String(price.total),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: `${price.service} — Dark Coat Car Detailing`,
    'metadata[source]': SOURCE,
    'metadata[service]': price.service,
    'metadata[date]': clean(body.date, 20),
    'metadata[time]': clean(body.time, 20),
    'metadata[name]': clean(body.name, 100),
    'metadata[coupon]': price.discount ? String(body.coupon).toUpperCase() : '',
  };
  const email = clean(body.email, 200);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) form.receipt_email = email;

  const pi = await stripe(env, 'payment_intents', 'POST', form);
  return json(env, { clientSecret: pi.client_secret, amount: price.total });
}

async function availability(url, env) {
  const date = url.searchParams.get('date');
  if (!isValidDate(date)) return json(env, { error: 'Invalid date.' }, 400);
  const { results } = await env.DB.prepare(
    `SELECT time, reschedule_date, reschedule_time FROM bookings
     WHERE source = ? AND (date = ? OR reschedule_date = ?)
     AND (status IS NULL OR status NOT IN ('Cancelled', 'Canceled'))`
  )
    .bind(SOURCE, date, date)
    .all();

  const booked = new Set();
  for (const r of results || []) {
    // A rescheduled booking occupies its new slot, not the original one.
    if (r.reschedule_date) {
      if (r.reschedule_date === date && r.reschedule_time) booked.add(r.reschedule_time);
    } else {
      booked.add(r.time);
    }
  }
  return json(env, { date, booked: [...booked] });
}

async function slotTaken(env, date, time) {
  const row = await env.DB.prepare(
    `SELECT id FROM bookings
     WHERE source = ?
     AND ((date = ? AND time = ? AND reschedule_date IS NULL) OR (reschedule_date = ? AND reschedule_time = ?))
     AND (status IS NULL OR status NOT IN ('Cancelled', 'Canceled'))
     LIMIT 1`
  )
    .bind(SOURCE, date, time, date, time)
    .first();
  return Boolean(row);
}

async function createBooking(request, env) {
  const b = await request.json().catch(() => null);
  if (!b) return json(env, { error: 'Invalid request.' }, 400);

  const price = priceFor(b.pkg, b.addon, b.coupon);
  if (!price) return json(env, { error: 'Invalid package.' }, 400);

  const date = clean(b.date, 10);
  const time = clean(b.time, 10);
  const slot = VALID_TIMES.find((t) => t.label === time);
  if (!isValidDate(date) || !slot) return json(env, { error: 'Invalid date or time.' }, 400);

  const name = clean(b.name, 100);
  const phone = clean(b.phone, 30);
  const email = clean(b.email, 200);
  const vehicle = clean(b.vehicle, 120);
  const address = clean(b.address, 250);
  if (!name) return json(env, { error: 'Name is required.' }, 400);
  if (phone.replace(/\D/g, '').length < 10) return json(env, { error: 'Phone is required.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(env, { error: 'A valid email is required.' }, 400);
  if (!vehicle) return json(env, { error: 'Vehicle is required.' }, 400);
  if (!address) return json(env, { error: 'Address is required.' }, 400);

  const wantsPaid = b.payment_status === 'Paid';
  let paymentStatus = 'Pay Later';
  let paidCents = 0;
  const piId = clean(b.payment_intent_id, 100);

  if (wantsPaid) {
    if (!piId || !env.STRIPE_SECRET_KEY) return json(env, { error: 'Missing payment reference.' }, 400);
    // Idempotency: the same PaymentIntent can only create one booking.
    const dupe = await env.DB.prepare('SELECT id FROM bookings WHERE source = ? AND notes LIKE ? LIMIT 1')
      .bind(SOURCE, `%${piId}%`)
      .first();
    if (dupe) return json(env, { id: dupe.id, duplicate: true });

    const pi = await stripe(env, `payment_intents/${encodeURIComponent(piId)}`);
    if (!['succeeded', 'processing'].includes(pi.status) || pi.metadata?.source !== SOURCE) {
      return json(env, { error: 'Payment not verified.' }, 402);
    }
    paymentStatus = 'Paid';
    paidCents = pi.amount_received || pi.amount;
  } else {
    // Unpaid bookings must respect the lead time and a free slot.
    if (slotTooSoon(date, slot.minutes)) return json(env, { error: 'That time is too soon to book.' }, 409);
    if (await slotTaken(env, date, time)) return json(env, { error: 'That time was just booked.' }, 409);
  }

  // A paid customer is never turned away — flag a conflict for the admin instead.
  const conflict = wantsPaid && (await slotTaken(env, date, time));

  const noteParts = [
    `Total $${((paymentStatus === 'Paid' ? paidCents : price.subtotal) / 100).toFixed(2)}`,
    price.discount && paymentStatus === 'Paid' ? `Coupon ${String(b.coupon).toUpperCase()}` : '',
    piId && paymentStatus === 'Paid' ? `PI ${piId}` : '',
    conflict ? 'SLOT CONFLICT — please reschedule' : '',
  ].filter(Boolean);

  const id = newId();
  await env.DB.prepare(
    `INSERT INTO bookings
      (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status,
       reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, NULL, ?)`
  )
    .bind(
      id,
      date,
      time,
      price.service,
      name,
      phone,
      email,
      vehicle,
      address,
      noteParts.join(' · '),
      SOURCE,
      new Date().toISOString(),
      'Confirmed',
      paymentStatus
    )
    .run();

  return json(env, { id, payment_status: paymentStatus }, 201);
}

/* ---------------- entry ---------------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    try {
      // Payment route runs BEFORE any schema work so D1 can never block checkout.
      if (pathname === '/api/create-payment-intent' && request.method === 'POST') {
        return await createPaymentIntent(request, env);
      }

      if (pathname === '/api/health') {
        return json(env, { ok: true, source: SOURCE, patchable: PATCHABLE });
      }

      if (!env.DB) return json(env, { error: 'Database not bound.' }, 500);
      await ensureSchema(env.DB);

      if (pathname === '/api/availability' && request.method === 'GET') {
        return await availability(url, env);
      }
      if (pathname === '/api/bookings' && request.method === 'POST') {
        return await createBooking(request, env);
      }

      return json(env, { error: 'Not found' }, 404);
    } catch (err) {
      return json(env, { error: err.message || 'Server error' }, 500);
    }
  },
};
