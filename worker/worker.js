// dark-coat-car-detailing-v2
// Cloudflare Worker for Dark Coat Car Detailing (San Clemente): availability, Stripe
// PaymentIntents and bookings, in the shared D1 database `detailing-bookings-detailingmarketers2`.
// Every read/write is scoped by source = "darkcoat-san-clemente". Dates/times are California time.
// That database keeps the PaymentIntent on the booking row (bookings.payment_intent_id, unique
// index) and has no booking_payments / booking_notifications tables, so the total goes in notes.
//
// Flow (matches src/pages/Checkout.jsx + Confirmation.jsx):
//   card:      POST /api/create-payment-intent -> browser confirms with Stripe ->
//              POST /api/bookings { paymentIntentId }  (the Worker re-reads the PaymentIntent
//              from Stripe and checks status, site, amount, services, date and time)
//   pay later: POST /api/bookings { payLater: true }
// A new booking sends one `booking_confirmed` event to GHL (only when the row is first inserted).
//
// Secrets (dashboard -> Worker -> Settings -> Variables and Secrets, or `wrangler secret put`):
//   STRIPE_SECRET_KEY  required. Same Stripe account as VITE_STRIPE_PUBLISHABLE_KEY
//   GHL_WEBHOOK_URL    required for the booking email
//   ADMIN_TOKEN        optional. `Authorization: Bearer <token>` for GET/PATCH /api/bookings.
//                      Without it the admin routes stay closed.
//
// The shared table already exists; this Worker never creates or alters tables.

const SOURCE = 'darkcoat-san-clemente'
const SOURCE_LABEL = 'Dark Coat Car Detailing'
const PREFIX = 'DKC-'

const SERVICES = {
  basic: { name: 'Basic Detail', price: 150 },
  premium: { name: 'Premium Detail', price: 200 },
  exterior: { name: 'Exterior Wash', price: 50 }, // add-on only
}
const COUPONS = { PREPAY: 15 }

// Start times 8:00 AM - 5:00 PM, every 30 minutes, every day (must match src/lib/caTime.js).
const SLOT_START_MIN = 8 * 60
const SLOT_END_MIN = 17 * 60
const SLOT_STEP_MIN = 30
const LEAD_MINUTES = 240
const MAX_DAYS_AHEAD = 90
const SLOTS = (() => {
  const out = []
  for (let t = SLOT_START_MIN; t <= SLOT_END_MIN; t += SLOT_STEP_MIN) {
    const h24 = Math.floor(t / 60)
    const m = t % 60
    out.push(`${h24 % 12 === 0 ? 12 : h24 % 12}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`)
  }
  return out
})()

// Fields the shared admin dashboard is allowed to update.
const PATCHABLE = new Set([
  'status',
  'payment_status',
  'notes2',
  'reschedule_date',
  'reschedule_time',
  'original_date',
  'original_time',
])

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function json(env, body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...corsHeaders(env) },
  })
}

class HttpError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

function newId() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return PREFIX + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}

// ---------- validation ----------

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

function nowLA() {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t) => p.find((x) => x.type === t).value
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

function addDays(iso, days) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + days))
  return dt.toISOString().slice(0, 10)
}

function slotMinutes(label) {
  const [t, sfx] = label.split(' ')
  const [h, m] = t.split(':').map(Number)
  return (h % 12) * 60 + (sfx === 'PM' ? 720 : 0) + m
}

// One detail (Basic or Premium), optionally plus the Exterior Wash. Returned in catalog order.
function checkServices(list) {
  if (!Array.isArray(list) || list.length === 0) throw new HttpError(400, 'Choose a Basic or Premium Detail.', 'services')
  const ids = [...new Set(list.map(String))]
  if (ids.some((id) => !SERVICES[id])) throw new HttpError(400, 'Unknown service selected.', 'services')
  const details = ids.filter((id) => id === 'basic' || id === 'premium')
  if (details.length !== 1) {
    throw new HttpError(400, 'Choose either the Basic or the Premium Detail. The Exterior Wash is an add-on.', 'services')
  }
  return Object.keys(SERVICES).filter((id) => ids.includes(id))
}

const subtotalOf = (ids) => ids.reduce((sum, id) => sum + SERVICES[id].price, 0)
const labelOf = (ids) => ids.map((id) => SERVICES[id].name).join(' + ')

function couponCode(code) {
  const c = String(code || '').trim().toUpperCase()
  return COUPONS[c] ? c : ''
}

// enforceLead is false when saving a booking that is already paid, so a customer who paid
// just before the cutoff is never rejected after their card was charged.
function checkSlot(date, time, enforceLead = true) {
  if (!ISO_DATE.test(date || '')) throw new HttpError(400, 'Pick a valid date.', 'date')
  if (!SLOTS.includes(time)) throw new HttpError(400, 'Pick a valid time.', 'time')
  const now = nowLA()
  if (date < now.date) throw new HttpError(400, 'That date has already passed.', 'date')
  if (date > addDays(now.date, MAX_DAYS_AHEAD)) throw new HttpError(400, 'Please pick a date within the next 90 days.', 'date')
  if (enforceLead && date === now.date && slotMinutes(time) < now.minutes + LEAD_MINUTES) {
    throw new HttpError(400, 'That time is too soon. Please pick a later time.', 'time')
  }
}

function checkContact(b) {
  const clean = (v, max) => String(v || '').trim().slice(0, max)
  const out = {
    name: clean(b.name, 120),
    phone: clean(b.phone, 30),
    email: clean(b.email, 200),
    vehicle: clean(b.vehicle, 120),
    address: clean(b.address, 250),
  }
  if (out.name.length < 2) throw new HttpError(400, 'Enter your full name.', 'name')
  if (out.phone.replace(/\D/g, '').length < 10) throw new HttpError(400, 'Enter a valid phone number.', 'phone')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(out.email)) throw new HttpError(400, 'Enter a valid email address.', 'email')
  if (out.vehicle.length < 3) throw new HttpError(400, 'Enter your vehicle (year, make, model).', 'vehicle')
  if (out.address.length < 6) throw new HttpError(400, 'Enter the address where we should meet you.', 'address')
  return out
}

// ---------- D1 ----------

async function slotTaken(db, date, time) {
  const row = await db
    .prepare(
      `SELECT COUNT(*) AS n FROM bookings
       WHERE source = ? AND date = ? AND time = ?
       AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'canceled')`,
    )
    .bind(SOURCE, date, time)
    .first()
  return (row?.n || 0) > 0
}

async function findByPaymentIntent(db, piId) {
  const row = await db
    .prepare(`SELECT id, payment_status, notes FROM bookings WHERE payment_intent_id = ? AND source = ? LIMIT 1`)
    .bind(piId, SOURCE)
    .first()
  if (!row) return null
  const m = /Total \$(\d+)/.exec(row.notes || '')
  return { ...row, total: m ? Number(m[1]) : null }
}

// ---------- Stripe ----------

async function stripe(env, method, path, params) {
  if (!env.STRIPE_SECRET_KEY) throw new HttpError(500, 'Payments are not configured yet.', 'stripe_config')
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    body: params ? new URLSearchParams(params) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new HttpError(502, data?.error?.message || 'Payment provider error.', 'stripe')
  return data
}

// ---------- GHL ----------

// Sends the booking to GHL. Called once, right after the booking row is first inserted
// (a refresh or retry finds the existing row and never reaches this). Never throws.
async function notifyBookingConfirmed(env, booking) {
  if (!env.GHL_WEBHOOK_URL) return
  await fetch(env.GHL_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...booking, source: SOURCE, source_label: SOURCE_LABEL, event_type: 'booking_confirmed' }),
  }).catch((err) => console.error('GHL webhook failed', err?.message || err))
}

// ---------- routes ----------

async function availability(env, url) {
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  if (!ISO_DATE.test(start || '') || !ISO_DATE.test(end || '') || end < start) {
    throw new HttpError(400, 'start and end are required (YYYY-MM-DD).')
  }
  const { results } = await env.DB
    .prepare(
      `SELECT date, time FROM bookings
       WHERE source = ? AND date >= ? AND date <= ?
       AND LOWER(COALESCE(status, '')) NOT IN ('cancelled', 'canceled')`,
    )
    .bind(SOURCE, start, end)
    .all()
  const booked = {}
  for (const r of results || []) (booked[r.date] ||= []).push(r.time)
  return json(env, { booked })
}

async function createPaymentIntent(env, request) {
  const b = await request.json()
  const ids = checkServices(b.services)
  checkSlot(b.date, b.time)
  const sub = subtotalOf(ids)
  const coupon = couponCode(b.coupon)
  const total = sub - (coupon ? Math.min(COUPONS[coupon], sub) : 0)

  // Card payments should not depend on D1, but a known clash is refused up front.
  try {
    if (await slotTaken(env.DB, b.date, b.time)) {
      throw new HttpError(409, 'That time was just booked. Please pick another time.', 'slot_taken')
    }
  } catch (e) {
    if (e instanceof HttpError) throw e
  }

  const params = {
    amount: String(total * 100),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: `${SOURCE_LABEL} - ${labelOf(ids)} on ${b.date} at ${b.time}`,
    'metadata[source]': SOURCE,
    'metadata[services]': ids.join(','),
    'metadata[date]': b.date,
    'metadata[time]': b.time,
    'metadata[coupon]': coupon,
    'metadata[customer]': String(b.name || '').slice(0, 100),
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || '')) params.receipt_email = String(b.email)

  const pi = await stripe(env, 'POST', '/payment_intents', params)
  return json(env, { clientSecret: pi.client_secret, paymentIntentId: pi.id, amount: total })
}

async function createBooking(env, request, ctx) {
  const b = await request.json()
  const ids = checkServices(b.services)
  const payLater = b.payLater === true
  checkSlot(b.date, b.time, payLater)
  const contact = checkContact(b)
  const sub = subtotalOf(ids)

  let paymentStatus = 'Pay Later'
  let coupon = null
  let total = sub
  let piId = null

  if (!payLater) {
    piId = String(b.paymentIntentId || '')
    if (!/^pi_[A-Za-z0-9_]+$/.test(piId)) throw new HttpError(400, 'Missing payment confirmation.', 'payment')

    // Idempotent: a refresh or retry after a successful save returns the same booking.
    const existing = await findByPaymentIntent(env.DB, piId)
    if (existing) return json(env, { id: existing.id, payment_status: existing.payment_status, total: existing.total, existing: true })

    const pi = await stripe(env, 'GET', `/payment_intents/${encodeURIComponent(piId)}`)
    const md = pi.metadata || {}
    if (md.source !== SOURCE) throw new HttpError(400, 'Payment does not match this business.', 'payment')
    if (!['succeeded', 'processing'].includes(pi.status)) throw new HttpError(402, 'Payment has not completed.', 'payment')
    if (md.services !== ids.join(',') || md.date !== b.date || md.time !== b.time) {
      throw new HttpError(400, 'Payment does not match this booking.', 'payment')
    }
    coupon = couponCode(md.coupon) || null
    total = sub - (coupon ? Math.min(COUPONS[coupon], sub) : 0)
    if (pi.amount !== total * 100) throw new HttpError(400, 'Payment amount does not match the selected services.', 'payment')
    paymentStatus = 'Paid'
  }

  if (await slotTaken(env.DB, b.date, b.time)) {
    if (piId) {
      try {
        await stripe(env, 'POST', '/refunds', { payment_intent: piId })
      } catch {
        throw new HttpError(409, 'That time was just booked and we could not refund automatically. Please call us.', 'slot_taken_refund_failed')
      }
      throw new HttpError(409, 'That time was just booked by someone else, so your payment has been refunded. Please pick another time.', 'slot_taken_refunded')
    }
    throw new HttpError(409, 'That time was just booked. Please pick another time.', 'slot_taken')
  }

  const id = newId()
  const service = labelOf(ids)
  const createdAt = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const notes = [`Total $${total}`, coupon ? `Coupon ${coupon}` : '', piId ? `Stripe ${piId}` : ''].filter(Boolean).join(' | ')
  try {
    await env.DB.prepare(
      `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status, payment_intent_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?, ?)`,
    ).bind(id, b.date, b.time, service, contact.name, contact.phone, contact.email, contact.vehicle, contact.address,
      notes, SOURCE, createdAt, paymentStatus, piId).run()
  } catch (e) {
    // Unique index on payment_intent_id: a simultaneous retry already saved this payment.
    const existing = piId && (await findByPaymentIntent(env.DB, piId))
    if (existing) return json(env, { id: existing.id, payment_status: existing.payment_status, total: existing.total, existing: true })
    throw e
  }

  ctx.waitUntil(notifyBookingConfirmed(env, {
    id, ...contact, service, date: b.date, time: b.time, notes: String(b.notes || ''),
    payment_status: paymentStatus, total,
  }))

  return json(env, { id, payment_status: paymentStatus, total }, 201)
}

async function timingSafeEqual(a, b) {
  const enc = new TextEncoder()
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ])
  return crypto.subtle.timingSafeEqual(ha, hb)
}

// Admin routes are closed unless ADMIN_TOKEN is set and matches.
async function requireAdmin(env, request) {
  const header = request.headers.get('Authorization') || ''
  if (!env.ADMIN_TOKEN || !header.startsWith('Bearer ') || !(await timingSafeEqual(header.slice(7), env.ADMIN_TOKEN))) {
    throw new HttpError(401, 'Unauthorized.')
  }
}

async function listBookings(env, request) {
  await requireAdmin(env, request)
  const { results } = await env.DB
    .prepare(
      `SELECT * FROM bookings WHERE source = ? ORDER BY date DESC, time DESC`,
    )
    .bind(SOURCE)
    .all()
  return json(env, results || [])
}

async function patchBooking(env, request, id) {
  await requireAdmin(env, request)
  const body = await request.json()
  const entries = Object.entries(body || {}).filter(([k]) => PATCHABLE.has(k))
  if (!entries.length) throw new HttpError(400, 'No updatable fields supplied.')
  const sets = entries.map(([k]) => `${k} = ?`).join(', ')
  const result = await env.DB
    .prepare(`UPDATE bookings SET ${sets} WHERE id = ? AND source = ?`)
    .bind(...entries.map(([, v]) => (v == null ? null : String(v))), id, SOURCE)
    .run()
  if (!result.meta.changes) throw new HttpError(404, 'Booking not found.')
  return json(env, { ok: true, id })
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(env) })
    const url = new URL(request.url)
    const path = url.pathname.replace(/\/+$/, '') || '/'
    try {
      if (path === '/api/health') return json(env, { ok: true, source: SOURCE })
      if (path === '/api/availability' && request.method === 'GET') return await availability(env, url)
      if (path === '/api/create-payment-intent' && request.method === 'POST') return await createPaymentIntent(env, request)
      if (path === '/api/bookings' && request.method === 'POST') return await createBooking(env, request, ctx)
      if (path === '/api/bookings' && request.method === 'GET') return await listBookings(env, request)
      const m = path.match(/^\/api\/bookings\/([^/]+)$/)
      if (m && request.method === 'PATCH') return await patchBooking(env, request, decodeURIComponent(m[1]))
      return json(env, { error: 'Not found' }, 404)
    } catch (e) {
      if (e instanceof HttpError) return json(env, { error: e.message, code: e.code }, e.status)
      if (e instanceof SyntaxError) return json(env, { error: 'Invalid request.' }, 400)
      console.error(e)
      return json(env, { error: 'Server error. Please try again.' }, 500)
    }
  },
}
