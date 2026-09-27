// The in-progress booking lives in sessionStorage so a refresh, or a Stripe redirect, doesn't lose it.
const KEY = 'darkcoat_booking_draft';
const DONE_KEY = 'darkcoat_last_booking';

function read(key) {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value == null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

export const loadDraft = () => read(KEY);
export const saveDraft = (d) => write(KEY, d);
export const clearDraft = () => write(KEY, null);
export const loadLastBooking = () => read(DONE_KEY);
export const saveLastBooking = (b) => write(DONE_KEY, b);
