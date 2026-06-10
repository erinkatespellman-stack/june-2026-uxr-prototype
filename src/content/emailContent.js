// Central content model for the pre-arrival email.
// Each section: hero (image + eyebrow + title), body (one rich-text block), amenities (titled list with images).

export const DEFAULT_CONTENT = {
  hero: {
    image: '/images/library/beach-deck.png',
    eyebrow: 'YOUR ARRIVAL · OCEANFRONT RESORT',
    title: 'Welcome to The Ritz-Carlton, Amelia Island',
  },
  body: `Dear [Guest Name],

We are honored that you have chosen The Ritz-Carlton, Amelia Island for your upcoming stay. From the moment you cross the marsh and pass through our gates, our team is dedicated to anticipating every comfort.

Your oceanfront accommodation has been reserved for your arrival. Should you wish to share any preferences in advance — a preferred pillow, a quiet table at Salt — please simply reply to this note.

With warmest regards,
Your Guest Relations Team`,
  amenities: {
    title: 'Curate an Extraordinary Stay',
    items: [
      {
        title: 'Coastal Spa Ritual',
        body: 'A 60-minute restorative treatment inspired by the salt and citrus of the Lowcountry.',
        image: '/images/amenities/spa.png',
      },
      {
        title: 'Sunrise Beach Walk',
        body: 'Join our naturalist for a guided shoreline walk along three miles of unspoiled Atlantic beach.',
        image: '/images/library/beach-deck.png',
      },
      {
        title: 'Salt — Coastal Cuisine',
        body: 'Our AAA Five Diamond restaurant featuring locally-sourced seafood and our signature salt collection.',
        image: '/images/amenities/michelin-dining.png',
      },
    ],
  },
};

export const RC_CLUB_CONTENT = {
  hero: {
    image: '/images/library/ocean-pool.png',
    eyebrow: 'CLUB LEVEL · YOUR PRIVATE RETREAT',
    title: 'Welcome to The Ritz-Carlton Club, Amelia Island',
  },
  body: `Dear [Guest Name],

It is our privilege to welcome you back to The Ritz-Carlton Club, Amelia Island. Your Club Concierge, Beatriz, will be your single point of contact throughout your stay — from securing a sunset table at Salt to arranging private transport to Cumberland Island.

Upon arrival, please proceed directly to the Club Lounge on the seventh floor, where your room key, a glass of Veuve Clicquot, and our afternoon canapé presentation will be ready for you.

At your service,
Your Guest Relations Team`,
  // The RC Club email surfaces the property's discovered amenities (see amenityStore).
  amenities: {
    title: 'Curate an Extraordinary Stay',
    items: [
      {
        title: 'Seasonal Pool Enhancements',
        body: 'Enjoy our redesigned oceanfront pool deck with private cabanas and an elevated poolside menu.',
        image: '/images/amenities/seasonal-pool.png',
      },
      {
        title: 'Angel Christmas Tree',
        body: 'Experience our beloved holiday tree lighting, a cherished Amelia Island tradition each winter.',
        image: '/images/amenities/angel-christmas-tree.png',
      },
      {
        title: 'Rooftop Terrace & Bar',
        body: 'Ascend to handcrafted cocktails and panoramic coastal views as the evening unfolds.',
        image: '/images/amenities/rooftop-terrace.png',
      },
      {
        title: 'Club Lounge Access',
        body: 'Five daily culinary presentations and dedicated concierge service, reserved for Club guests.',
        image: '/images/library/bar-cocktail.png',
      },
    ],
  },
};

// Library of images available in the Hero image picker (screen 7).
// The first entry is flagged as the AI "Top Pick".
export const LIBRARY_IMAGES = [
  { key: 'ocean-pool', src: '/images/library/ocean-pool.png', topPick: true },
  { key: 'pool-cabanas', src: '/images/library/pool-cabanas.png' },
  { key: 'pool-mountain', src: '/images/library/pool-mountain.png' },
  { key: 'pool-aerial', src: '/images/library/pool-aerial.png' },
  { key: 'beach-deck', src: '/images/library/beach-deck.png' },
  { key: 'bar-cocktail', src: '/images/library/bar-cocktail.png' },
  { key: 'spa', src: '/images/amenities/spa.png' },
  { key: 'rooftop', src: '/images/amenities/rooftop-terrace.png' },
  { key: 'michelin', src: '/images/amenities/michelin-dining.png' },
];

export function getContentForVariant(variant) {
  return variant === 'rc-club' ? RC_CLUB_CONTENT : DEFAULT_CONTENT;
}
