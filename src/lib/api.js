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

export function getAvailability(date) {
  return request(`/api/availability?date=${encodeURIComponent(date)}`);
}

export function createPaymentIntent(payload) {
  return request('/api/create-payment-intent', { method: 'POST', body: JSON.stringify(payload) });
}

export function createBooking(payload) {
  return request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
}
