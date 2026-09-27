// Prices here are for display only — the Worker recalculates every charge server-side.
export const PACKAGES = [
  {
    id: 'basic',
    name: 'Basic Detail',
    price: 150,
    tagline: 'The reset your daily driver needs.',
    image: '/images/red-side-garage.webp',
    features: [
      'Triple-Stage Vacuuming for Deep Debris Removal',
      'Complete Interior Surface Wipe-Down',
      'Floor Mat Cleaning & Restoration',
    ],
  },
  {
    id: 'premium',
    name: 'Premium Detail',
    price: 200,
    tagline: 'Deep extraction, shampoo and UV protection.',
    image: '/images/black-rinse.webp',
    popular: true,
    features: [
      'Triple-Stage Vacuuming',
      'Cabin Application',
      'Dust Elimination',
      'Interior Window Cleaning',
      'Deep Carpet Cleaning',
      'Cloth & Carpet Extraction',
      'Full Interior Shampooing',
      'UV-Protectant Coating',
    ],
  },
];

export const ADDON = {
  id: 'exterior',
  name: 'Exterior Wash',
  price: 50,
  tagline: 'Hand wash, wheels, tires and jambs.',
  image: '/images/red-hood-foam.webp',
  features: [
    'Hand-Washed Exterior',
    'Detailed Rim Cleaning',
    'Tire Scrub and Degrease',
    'Door Jamb & Panel Wipe-Down',
    'Premium Tire Shine Application',
    'Spot-Free Hand Drying',
  ],
};

export const PREPAY_CODE = 'PREPAY';
export const PREPAY_DISCOUNT = 15;

export function getPackage(id) {
  return PACKAGES.find((p) => p.id === id) || null;
}

export function serviceLabel(pkgId, addon) {
  const pkg = getPackage(pkgId);
  if (!pkg) return '';
  return addon ? `${pkg.name} + ${ADDON.name}` : pkg.name;
}

export function subtotal(pkgId, addon) {
  const pkg = getPackage(pkgId);
  if (!pkg) return 0;
  return pkg.price + (addon ? ADDON.price : 0);
}
