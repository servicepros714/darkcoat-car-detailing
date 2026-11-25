const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiConfigured = Boolean(API) && !API.includes('YOUR-SUBDOMAIN');

async function request(path, options = {}) {
  if (!apiConfigured) throw new Error('Booking server is not configured yet.');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

// The Worker (worker/worker.js) prices everything from the service ids and checks card payments
// with Stripe; these helpers translate the booking draft into its API.
const serviceIds = (p) => [p.pkg, ...(p.addon ? ['exterior'] : [])];

// -> { booked: ["9:00 AM", ...] } for one date
export function getAvailability(date) {
  const d = encodeURIComponent(date);
  return request(`/api/availability?start=${d}&end=${d}`).then((r) => ({ booked: (r.booked && r.booked[date]) || [] }));
}

// { pkg, addon, coupon, email, name, date, time } -> { clientSecret, paymentIntentId, amount }
export function createPaymentIntent(p) {
  return request('/api/create-payment-intent', {
    method: 'POST',
    body: JSON.stringify({ services: serviceIds(p), coupon: p.coupon || '', date: p.date, time: p.time, name: p.name, email: p.email }),
  });
}

// Booking fields + payment_status ('Paid' | 'Pay Later') + payment_intent_id -> { id, payment_status, total }.
// A Paid booking is only saved after the Worker verifies the PaymentIntent with Stripe.
export function createBooking(p) {
  const paid = p.payment_status === 'Paid';
  return request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      services: serviceIds(p),
      date: p.date, time: p.time,
      name: p.name, phone: p.phone, email: p.email, vehicle: p.vehicle, address: p.address,
      payLater: !paid,
      paymentIntentId: paid ? p.payment_intent_id : undefined,
    }),
  });
}
