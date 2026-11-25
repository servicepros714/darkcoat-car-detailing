// ---------------------------------------------------------------------------
// SEO landing pages. One template renders all of them (src/pages/Landing.jsx);
// head tags and schema come from src/lib/seo.js.
//
// Home targets "Mobile Car Detailing San Clemente". Sister sites already use slugs like
// interior-car-detailing-, car-seat-carpet-shampoo-, car-detailing-in-<city> and
// mobile-car-detailing-<city>, so Dark Coat uses its own wording: <service>-san-clemente and
// /mobile-car-detail-<place>, with unique copy. The owner is fine with city overlap.
//
// Facts: prices and package contents are in src/config/services.js; the confirmed list is in
// src/config/business.js. Same prices and hours everywhere. The Exterior Wash is never sold alone.
// ---------------------------------------------------------------------------

const BRANDS = ['Dark Coat Car Detailing', 'Dark Coat Detailing', 'Dark Coat'];

// Longest title that fits in 60 chars (counting '&' as the escaped '&amp;').
export function fitTitle(keyword, place, region = 'CA') {
  const options = [
    ...BRANDS.map((b) => `${keyword} ${place}, ${region} | ${b}`),
    ...BRANDS.map((b) => `${keyword} ${place} | ${b}`),
  ];
  const len = (t) => t.replace(/&/g, '&amp;').length;
  return options.find((t) => len(t) <= 60) || options[options.length - 1];
}

export const HOME_CITY = 'San Clemente';

// Schema offers: only what a customer can book. The wash never appears alone.
const DETAIL_OFFERS = [
  ['Basic Detail', 150],
  ['Premium Detail', 200],
  ['Basic Detail + Exterior Wash', 200],
  ['Premium Detail + Exterior Wash', 250],
];
const PREMIUM_OFFERS = [
  ['Premium Detail', 200],
  ['Premium Detail + Exterior Wash', 250],
];
const WASH_OFFERS = [
  ['Basic Detail + Exterior Wash', 200],
  ['Premium Detail + Exterior Wash', 250],
];

const PHOTO = {
  rinse: { src: '/images/black-rinse.webp', alt: 'Black car being rinsed during a hand wash' },
  garage: { src: '/images/red-side-garage.webp', alt: 'Red car being hand washed panel by panel' },
  hood: { src: '/images/red-hood-foam.webp', alt: 'Red car covered in foam during an exterior wash' },
  headlight: { src: '/images/red-headlight.webp', alt: 'Foam on the paint and headlight of a red car' },
  gt: { src: '/images/blue-gt.webp', alt: 'Blue sports car under a snow foam pre-soak' },
  rear: { src: '/images/rear-foam.webp', alt: 'Foamed car being washed by hand' },
};

const FAQ_SIZE = { q: 'Is an SUV or truck more expensive?', a: 'No. Sedans, SUVs, trucks and minivans all pay the same price.' };
const FAQ_WATER = { q: 'Do I need to give you water or an outlet?', a: 'No. We bring our own water and power.' };
const FAQ_WASH = { q: 'Can I book just the exterior wash?', a: 'No. The Exterior Wash is a $50 add-on to the Basic or Premium Detail.' };
const FAQ_GUARANTEE = { q: 'What if I am not happy with something?', a: 'Let us know. Every detail is backed by our satisfaction guarantee, and we will make it right.' };
const FAQ_PAY = { q: 'Do I have to pay when I book?', a: 'No. Pay when the job is done, or prepay online with code PREPAY and save $15.' };
const FAQ_TIME = { q: 'How long will it take?', a: 'A Basic Detail usually takes 2 to 3 hours and a Premium Detail 4 to 6 hours, depending on the vehicle.' };
const FAQ_ECO = { q: 'Are your products eco-friendly?', a: 'Yes. We use eco-friendly detailing products.' };

export const SERVICE_PAGES = [
  {
    path: '/car-interior-detail-san-clemente',
    nav: 'Car interior detail',
    city: HOME_CITY,
    title: fitTitle('Car Interior Detail', HOME_CITY),
    description: 'Car interior detail in San Clemente, CA: Basic Detail $150 or Premium Detail $200 with shampoo and extraction. Mobile, own water and power. Book online.',
    eyebrow: 'Interior detail · San Clemente, CA',
    h1: ['Car interior detail', 'in San Clemente.'],
    lede: 'Beach sand in the carpet, sunscreen on the door panels, crumbs down the seat rails. We take the cabin apart surface by surface, right where you park.',
    facts: ['From $150', 'Own water & power', 'Every day 8–5'],
    card: 'premium',
    pkg: 'basic',
    photo: PHOTO.garage,
    intro: {
      h2: 'Pick the depth of clean.',
      paras: [
        'Every interior starts with triple-stage vacuuming: three passes for the sand and grit that collect under the seats, in the rails and deep in the carpet.',
        'The $150 Basic Detail adds a complete wipe-down of every interior surface plus floor mats cleaned and restored. It usually takes 2 to 3 hours.',
        'The $200 Premium Detail runs about 4 to 6 hours and adds a cabin application, dust elimination, interior windows, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating.',
      ],
    },
    pointsTitle: 'Why San Clemente drivers book Dark Coat',
    points: [
      { title: 'At your address', text: 'Driveway, office or condo lot, with nothing for you to set up.' },
      { title: 'Eco-friendly products', text: 'Every package uses eco-friendly detailing products.' },
      { title: 'Satisfaction guarantee', text: 'If something is not right, tell us and we will make it right.' },
    ],
    faqs: [
      { q: 'Should I pick Basic or Premium?', a: 'Basic suits a lived-in car without stains. Premium is the one to book when seats or carpets need shampoo and extraction.' },
      FAQ_TIME,
      FAQ_SIZE,
      FAQ_ECO,
      FAQ_PAY,
    ],
    service: { type: 'Car interior detailing', offers: DETAIL_OFFERS },
  },
  {
    path: '/seat-and-carpet-extraction-san-clemente',
    nav: 'Seat & carpet extraction',
    city: HOME_CITY,
    title: fitTitle('Seat & Carpet Extraction', HOME_CITY),
    description: 'Car seat and carpet shampoo with extraction in San Clemente, CA, part of the $200 Premium Detail. We come to you. One price for any vehicle size.',
    eyebrow: 'Shampoo & extraction · San Clemente, CA',
    h1: ['Seat & carpet extraction', 'in San Clemente.'],
    lede: 'Wet towels, spilled drinks and muddy shoes soak into cloth seats and carpet. Shampoo with extraction pulls the dirt out of the fibers instead of spreading it.',
    facts: ['$200 Premium Detail', 'Any vehicle size', 'Every day 8–5'],
    card: 'premium',
    pkg: 'premium',
    photo: PHOTO.rinse,
    intro: {
      h2: 'Vacuum, shampoo, extract.',
      paras: [
        'Seat and carpet extraction comes with the Premium Detail. Three vacuum passes go first, so loose sand and grit are gone before any water touches the fabric.',
        'Then the cloth seats and carpets are shampooed and extracted: the fibers are rinsed and the dirty water is pulled back out. Deep carpet cleaning, interior windows, dust elimination and a UV-protectant coating finish the cabin.',
        'Most everyday spills and dirt come out. Old set-in stains, ink or dye transfer may lighten rather than disappear.',
      ],
    },
    pointsTitle: 'Before you book',
    points: [
      { title: 'One price', text: '$200 for a compact car or a three-row SUV.' },
      { title: '4 to 6 hours', text: 'The usual time for a Premium Detail.' },
      { title: 'Add the outside', text: 'The $50 Exterior Wash brings it to $250 inside and out.' },
    ],
    faqs: [
      { q: 'Does the Basic Detail include extraction?', a: 'No. Shampoo and extraction are part of the Premium Detail ($200). The Basic Detail is vacuuming, a full wipe-down and floor mats.' },
      { q: 'Will every stain come out?', a: 'Most everyday stains do. Old set-in stains, ink or dye transfer may only lighten.' },
      FAQ_SIZE,
      FAQ_WATER,
      FAQ_GUARANTEE,
    ],
    service: { type: 'Car seat and carpet shampoo and extraction', offers: PREMIUM_OFFERS },
  },
  {
    path: '/full-detail-and-hand-wash-san-clemente',
    nav: 'Detail & hand wash',
    city: HOME_CITY,
    title: fitTitle('Full Detail & Hand Wash', HOME_CITY),
    description: 'Full car detail and hand wash in San Clemente, CA: a $150 or $200 interior detail plus the $50 exterior hand wash. Mobile, with our own water and power.',
    eyebrow: 'Inside & out · San Clemente, CA',
    h1: ['Full detail & hand wash', 'in San Clemente.'],
    lede: 'The whole car in one visit. We detail the cabin first, then hand wash, clean the rims and hand dry the outside where it is parked.',
    facts: ['From $200', 'Hand wash & dry', 'Own water & power'],
    card: 'combo',
    pkg: 'premium',
    photo: PHOTO.hood,
    intro: {
      h2: 'Cabin first, then the wash.',
      paras: [
        'The Exterior Wash is an add-on, so every visit begins with the Basic Detail ($150) or the Premium Detail ($200) inside the car.',
        'For $50 more we hand wash the exterior, clean the rims in detail, scrub and degrease the tires, wipe down the door jambs and panels, apply tire shine and hand dry the paint so it dries without spots.',
        'That makes it $200 with the Basic Detail or $250 with the Premium Detail. We bring our own water and power.',
      ],
    },
    pointsTitle: 'One visit, the whole car',
    points: [
      { title: 'Hand wash & dry', text: 'Plus detailed rims, tire scrub and a spot-free hand dry.' },
      { title: 'Self-contained', text: 'Our own water and power at your San Clemente address.' },
      { title: '$15 off online', text: 'Use code PREPAY at checkout, or pay when the job is done.' },
    ],
    faqs: [
      { q: 'What does inside and out cost?', a: '$200 for the Basic Detail with the Exterior Wash, or $250 for the Premium Detail with the Exterior Wash.' },
      FAQ_WASH,
      FAQ_WATER,
      FAQ_ECO,
      FAQ_PAY,
    ],
    service: { type: 'Interior car detail and exterior hand wash', offers: WASH_OFFERS },
  },
  {
    path: '/detailing-packages-san-clemente',
    nav: 'Packages & prices',
    city: HOME_CITY,
    title: fitTitle('Car Detailing Packages', HOME_CITY),
    description: 'Car detailing packages in San Clemente, CA: Basic Detail $150, Premium Detail $200, Exterior Wash add-on $50. Same price for any car, SUV or truck.',
    eyebrow: 'Packages · San Clemente, CA',
    h1: ['Car detailing packages', 'in San Clemente.'],
    lede: 'Posted prices that stay the same whatever you drive. Here is what each package costs, what it covers and how long it usually takes.',
    facts: ['Basic $150', 'Premium $200', 'Wash add-on $50'],
    card: 'premium',
    pkg: 'premium',
    photo: PHOTO.gt,
    intro: {
      h2: 'Every package, side by side.',
      paras: [
        'Basic Detail, $150, about 2 to 3 hours: triple-stage vacuuming for deep debris, a complete interior surface wipe-down, and floor mats cleaned and restored.',
        'Premium Detail, $200, about 4 to 6 hours: triple-stage vacuuming, cabin application, dust elimination, interior windows, deep carpet cleaning, cloth and carpet extraction, full interior shampooing and a UV-protectant coating.',
        'Exterior Wash, +$50 on either detail: hand wash, detailed rims, tire scrub and degrease, door jambs and panels, tire shine and a spot-free hand dry. Code PREPAY takes $15 off online.',
      ],
    },
    pointsTitle: 'No size upcharge',
    points: [
      { title: 'Any vehicle, one price', text: 'A coupe and a pickup pay the same.' },
      { title: 'We come to you', text: 'The price includes coming to your address.' },
      { title: 'Pay now or later', text: 'Prepay online for $15 off, or pay when the job is done.' },
    ],
    faqs: [
      { q: 'What is the most complete visit?', a: 'The Premium Detail with the Exterior Wash: $250, or $235 if you prepay online with code PREPAY.' },
      FAQ_SIZE,
      FAQ_TIME,
      FAQ_WASH,
      FAQ_GUARANTEE,
    ],
    service: { type: 'Auto detailing', offers: DETAIL_OFFERS },
  },
];

// Place pages: same packages, prices and hours; local wording.
// `schemaCity` is the city used in the schema (a neighborhood's own city).
function placePage({ slug, place, schemaCity, regionLabel = 'CA', areas, mapQuery, lede, paras, photo, faq }) {
  const where = schemaCity && schemaCity !== place ? `${place}, ${schemaCity}` : `${place}, CA`;
  return {
    path: `/mobile-car-detail-${slug}`,
    nav: place,
    city: place,
    schemaCity: schemaCity || place,
    isCity: true,
    title: fitTitle('Mobile Car Detailing', place, regionLabel),
    description: `Mobile car detailing in ${where}: Basic Detail $150, Premium Detail $200, $50 exterior wash add-on. Own water and power, every day 8 to 5.`,
    eyebrow: `Mobile detailing · ${where}`,
    h1: ['Mobile car detailing', `in ${place}.`],
    lede,
    facts: ['From $150', 'Own water & power', 'Every day 8–5'],
    card: 'premium',
    pkg: 'premium',
    photo,
    areas,
    mapQuery: mapQuery || `${place}, CA`,
    intro: { h2: `Dark Coat in ${place}.`, paras },
    pointsTitle: `Booking a detail in ${place}`,
    points: [
      { title: 'Same prices as San Clemente', text: `No extra charge to come to ${place}.` },
      { title: 'Self-contained', text: 'We bring our own water and power.' },
      { title: 'Satisfaction guarantee', text: 'If something is not right, we will make it right.' },
    ],
    faqs: [faq, FAQ_TIME, FAQ_SIZE, FAQ_WATER, FAQ_PAY],
    service: { type: 'Mobile car detailing', offers: DETAIL_OFFERS },
  };
}

export const CITY_PAGES = [
  placePage({
    slug: 'dana-point',
    place: 'Dana Point',
    areas: ['the Lantern District', 'Dana Point Harbor', 'Monarch Beach', 'Niguel Shores', 'Del Obispo Street'],
    lede: 'Salt air and harbor parking are hard on a car. We detail it at your Dana Point home or office, with our own water and power.',
    paras: [
      'We work all over Dana Point, from the Lantern District and the streets above Dana Point Harbor to Monarch Beach, Niguel Shores and the homes off Del Obispo Street.',
      'Choose the $150 Basic Detail, or the $200 Premium Detail with deep carpet cleaning, extraction, full shampoo and a UV-protectant coating.',
      'Add the $50 Exterior Wash for a hand wash and a spot-free hand dry. Start times run every day from 8 AM to 5 PM.',
    ],
    photo: PHOTO.headlight,
    faq: { q: 'Do you charge more to come to Dana Point?', a: 'No. Dana Point gets the same prices and hours as San Clemente.' },
  }),
  placePage({
    slug: 'capistrano-beach',
    place: 'Capistrano Beach',
    schemaCity: 'Dana Point',
    regionLabel: 'CA',
    areas: ['Beach Road', 'the Palisades', 'Doheny Park Road', 'Camino Capistrano', 'Capistrano Beach Park'],
    lede: 'Capo Beach sits between Doheny and San Clemente, just up the coast from our home base. We detail your car right at home.',
    paras: [
      'We come to homes along Beach Road and up in the Palisades, and to the streets off Doheny Park Road and Camino Capistrano near Capistrano Beach Park.',
      'The Basic Detail ($150) covers vacuuming, a full wipe-down and floor mats. The Premium Detail ($200) adds deep carpet cleaning, extraction, shampoo and UV protection.',
      'Beach days bring sand into everything, and three vacuum passes are built into both packages. No extra charge for an SUV, truck or minivan.',
    ],
    photo: PHOTO.rear,
    faq: { q: 'Is Capistrano Beach part of your service area?', a: 'Yes. Capistrano Beach is part of Dana Point, right next to San Clemente, and gets the same prices and hours.' },
  }),
  placePage({
    slug: 'san-juan-capistrano',
    place: 'San Juan Capistrano',
    areas: ['the Los Rios Historic District', 'Ortega Highway', 'Marbella', 'San Juan Hills', 'Rancho Viejo Road'],
    lede: 'From the streets around the Mission to the homes up Ortega Highway, we bring the full detail to your San Juan Capistrano driveway.',
    paras: [
      'We detail cars across San Juan Capistrano: near the Los Rios Historic District, along Ortega Highway, in Marbella and San Juan Hills, and off Rancho Viejo Road.',
      'Horse country and canyon roads mean dusty cabins. The Premium Detail ($200) adds dust elimination, deep carpet cleaning, extraction and full shampooing; the Basic Detail is $150.',
      'Add the $50 Exterior Wash to either package. Prepay online with code PREPAY for $15 off, or pay when the job is done.',
    ],
    photo: PHOTO.garage,
    faq: { q: 'Do you come to the homes off Ortega Highway?', a: 'Yes, as long as we can park next to the car and reach all sides of it. Call if you are not sure about your address.' },
  }),
  placePage({
    slug: 'laguna-niguel',
    place: 'Laguna Niguel',
    areas: ['Crown Valley Parkway', 'Rancho Niguel Road', 'Niguel Road', 'Golden Lantern', 'Laguna Niguel Regional Park'],
    lede: 'Hillside homes, HOA garages and office parks: we detail cars all over Laguna Niguel and bring everything we need.',
    paras: [
      'We work in neighborhoods off Crown Valley Parkway, Rancho Niguel Road, Niguel Road and Golden Lantern, and around Laguna Niguel Regional Park.',
      'Because we bring our own water and power, you do not need a hose bib or an outlet, which helps in condo lots and HOA communities.',
      'Book the $150 Basic Detail or the $200 Premium Detail, and add the $50 Exterior Wash if you want the outside done too.',
    ],
    photo: PHOTO.hood,
    faq: { q: 'Can you work in an HOA or condo lot in Laguna Niguel?', a: 'Usually, yes. We bring our own water and power, so nothing has to be hooked up. Check that your HOA allows it.' },
  }),
  placePage({
    slug: 'talega',
    place: 'Talega',
    schemaCity: 'San Clemente',
    regionLabel: 'San Clemente',
    areas: ['Avenida Talega', 'Avenida Vista Hermosa', 'the Talega Golf Club area', 'Vista Hermosa Sports Park'],
    mapQuery: 'Talega, San Clemente, CA',
    lede: 'Talega is San Clemente’s inland corner. We detail cars at homes all through the neighborhood, every day of the week.',
    paras: [
      'We come to Talega homes off Avenida Talega and Avenida Vista Hermosa, around the Talega Golf Club and near Vista Hermosa Sports Park.',
      'Family SUVs pay the same price as a sedan: $150 for the Basic Detail or $200 for the Premium Detail with extraction and full shampoo.',
      'The $50 Exterior Wash adds a hand wash, rims, tires, door jambs and a spot-free dry. Start times run 8 AM to 5 PM every day.',
    ],
    photo: PHOTO.rinse,
    faq: { q: 'Is Talega part of your San Clemente service area?', a: 'Yes. Talega is in San Clemente, so it gets the same prices and hours.' },
  }),
  placePage({
    slug: 'rancho-mission-viejo',
    place: 'Rancho Mission Viejo',
    areas: ['Sendero', 'Esencia', 'Rienda', 'Antonio Parkway', 'Cow Camp Road'],
    lede: 'New homes, busy families and plenty of driving. We detail cars at your Rancho Mission Viejo home without you lifting a hose.',
    paras: [
      'We work in the Rancho Mission Viejo villages, including Sendero, Esencia and Rienda, and along Antonio Parkway and Cow Camp Road.',
      'Kids and pets are hard on a cabin. The Premium Detail ($200) adds deep carpet cleaning, cloth and carpet extraction and full shampooing; the Basic Detail is $150.',
      'Add the $50 Exterior Wash to either package. There is no extra charge for an SUV, truck or minivan.',
    ],
    photo: PHOTO.gt,
    faq: { q: 'Do you need a driveway?', a: 'No. A garage, driveway or street spot works, as long as we can reach all sides of the car.' },
  }),
  placePage({
    slug: 'ladera-ranch',
    place: 'Ladera Ranch',
    areas: ['Covenant Hills', 'Terramor', 'Oso Parkway', 'Crown Valley Parkway', 'Antonio Parkway'],
    lede: 'From Covenant Hills to Terramor, we bring the detail to your Ladera Ranch driveway with our own water and power.',
    paras: [
      'We detail cars all over Ladera Ranch, in Covenant Hills and Terramor and in the neighborhoods off Oso Parkway, Crown Valley Parkway and Antonio Parkway.',
      'The Basic Detail ($150) covers triple-stage vacuuming, a full interior wipe-down and floor mats. The Premium Detail ($200) adds extraction, full shampoo and a UV-protectant coating.',
      'Add the $50 Exterior Wash for the outside. Start times run every day from 8 AM to 5 PM.',
    ],
    photo: PHOTO.headlight,
    faq: { q: 'Do you charge more to come to Ladera Ranch?', a: 'No. Ladera Ranch gets the same prices and hours as San Clemente.' },
  }),
  placePage({
    slug: 'mission-viejo',
    place: 'Mission Viejo',
    areas: ['Lake Mission Viejo', 'Casta del Sol', 'Marguerite Parkway', 'Oso Parkway', 'the Shops at Mission Viejo'],
    lede: 'Commuter cars and family SUVs pick up a lot in a week. We detail them at your Mission Viejo home or workplace.',
    paras: [
      'We come to homes around Lake Mission Viejo and Casta del Sol, along Marguerite Parkway and Oso Parkway, and to workplaces near the Shops at Mission Viejo.',
      'Pick the $150 Basic Detail for regular upkeep, or the $200 Premium Detail when seats and carpets need shampoo and extraction.',
      'Add the $50 Exterior Wash for a hand wash and spot-free dry. Prepay online with code PREPAY for $15 off.',
    ],
    photo: PHOTO.rear,
    faq: { q: 'Can you detail my car at work in Mission Viejo?', a: 'Yes, if the lot allows it and we can park next to your car. We bring our own water and power.' },
  }),
];

export const LANDING_PAGES = [...SERVICE_PAGES, ...CITY_PAGES];

export function findLanding(path) {
  return LANDING_PAGES.find((p) => p.path === path);
}
