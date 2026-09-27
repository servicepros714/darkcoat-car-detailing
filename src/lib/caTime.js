// All scheduling runs on California time, regardless of the visitor's device time zone.
export const TZ = 'America/Los_Angeles';
export const LEAD_MINUTES = 4 * 60;
export const OPEN_HOUR = 7; // 7:00 AM
export const CLOSE_HOUR = 19; // last slot 7:00 PM

export function caNow() {
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
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const minutes = Number(get('hour')) * 60 + Number(get('minute'));
  return { dateStr, minutes };
}

export function slotLabel(hour) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${hour < 12 ? 'AM' : 'PM'}`;
}

export const SLOTS = Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => {
  const hour = OPEN_HOUR + i;
  return { hour, label: slotLabel(hour), minutes: hour * 60 };
});

export function isSlotTooSoon(dateStr, slotMinutes) {
  const now = caNow();
  if (dateStr < now.dateStr) return true;
  if (dateStr > now.dateStr) return false;
  return slotMinutes < now.minutes + LEAD_MINUTES;
}

export function dateHasOpenSlots(dateStr) {
  return SLOTS.some((s) => !isSlotTooSoon(dateStr, s.minutes));
}

// Local-date helpers that avoid UTC drift.
export function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromDateStr(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
