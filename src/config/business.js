// Dark Coat Car Detailing San Clemente — business facts, FAQ and reviews.
//
// Confirmed facts (owner, Nov 2026): phone (949) 676-2205, mobile only, we bring our own water
// and power, every day with start times 8 AM - 5 PM, Basic Detail usually 2-3 hours and Premium
// Detail 4-6 hours, satisfaction guarantee, same price for every vehicle size, eco-friendly
// products, prepay online with code PREPAY for $15 off. Same prices and hours nearby.
// NOT confirmed, so never claimed: ratings, a shop or facility, pickup and delivery, ceramic
// coating, paint correction, engine detailing, headlight restoration, an "Ultimate" package,
// boats/RVs, certifications. (The old Horizons site claimed these and showed a fake
// (949) 555-1234 number; the draft had placeholder reviews and said the customer gives water.)

// Canonical domain (no www; www redirects to it).
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://darkcoatcardetailing.site').replace(/\/$/, '');

// Google Business Profile, used in the schema (sameAs). Leave '' until known.
export const GOOGLE_PROFILE_URL = '';
// Shown above the reviews once real reviews are added, e.g. { value: '5.0', count: 12 }.
export const GOOGLE_RATING = null;

export const BUSINESS = {
  name: 'Dark Coat Car Detailing',
  shortName: 'Dark Coat',
  phone: '(949) 676-2205',
  phoneHref: 'tel:+19496762205',
  phoneSchema: '+1-949-676-2205',
  city: 'San Clemente',
  region: 'CA',
  address: 'San Clemente, CA',
  hours: 'Every day, 8 AM – 5 PM',
  hoursDetail: 'Start times 8 AM – 5 PM, 7 days a week',
  source: 'darkcoat-san-clemente', // must match worker/worker.js
  mapQuery: 'San Clemente, CA',
  // San Clemente neighborhoods named on the home page; nearby places with pages are in src/lib/pages.js.
  homeAreas: ['Downtown and Avenida Del Mar', 'the Pier Bowl', 'Forster Ranch', 'Marblehead', 'Rancho San Clemente', 'Southwest San Clemente'],
};

// Real Google reviews only, as { name: 'First L.', text: '...' } (first name + last initial,
// typos fixed; leave out reviews that read like a shop visit). The section and its menu link
// stay hidden while this is empty. (The draft's four reviews were placeholders and are gone.)
export const REVIEWS = [];

// Home page FAQ. Shown on the page and used for the FAQPage schema, so keep both in sync.
export const FAQS = [
  { q: 'Do you come to me?', a: 'Yes. Dark Coat is mobile only. We detail your car at your home or office in San Clemente and the nearby South OC cities.' },
  { q: 'Do I need to provide water or power?', a: 'No. We bring our own water and power, so there is nothing for you to set up.' },
  { q: 'How long does a detail take?', a: 'A Basic Detail usually takes 2 to 3 hours and a Premium Detail 4 to 6 hours, depending on the vehicle.' },
  { q: 'Does an SUV or truck cost more?', a: 'No. Sedans, SUVs, trucks and minivans all pay the same price.' },
  { q: 'Can I book only the exterior wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail.' },
  { q: 'What products do you use?', a: 'Eco-friendly detailing products.' },
  { q: 'When can I book?', a: 'Every day, with start times from 8 AM to 5 PM. Same-day bookings need at least 4 hours notice.' },
  { q: 'Can I pay later?', a: 'Yes. Prepay online and save $15 with code PREPAY, or reserve your time now and pay when the job is done.' },
  { q: 'What if I am not happy with the result?', a: 'Tell us. Every detail is backed by our satisfaction guarantee, and we will make it right.' },
  { q: 'What if I need to reschedule?', a: 'Call (949) 676-2205 and we will move your appointment to a time that works.' },
];
