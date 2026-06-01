// Central content model for the pre-arrival email.
// Each section: hero (image + eyebrow + title), body (one rich-text block), amenities (titled list).

export const DEFAULT_CONTENT = {
  hero: {
    variant: 'coast',
    eyebrow: 'YOUR ARRIVAL · OCEANFRONT RESORT',
    title: 'Welcome to The Ritz-Carlton, Amelia Island',
  },
  body: `Dear Ms. Cole,

We are honored that you have chosen The Ritz-Carlton, Amelia Island for your upcoming stay. From the moment you cross the marsh and pass through our gates, our team is dedicated to anticipating every comfort.

Your oceanfront accommodation has been reserved for arrival on Thursday, June 11. Should you wish to share any preferences in advance — a preferred pillow, a quiet table at Salt — please simply reply to this note.

With warmest regards,
Marisol Vega
Director of Guest Experience`,
  amenities: {
    title: 'Anticipating Your Stay',
    items: [
      {
        title: 'Coastal Spa Ritual',
        body: 'A 60-minute restorative treatment inspired by the salt and citrus of the Lowcountry.',
      },
      {
        title: 'Sunrise Beach Walk',
        body: 'Join our naturalist for a guided shoreline walk along three miles of unspoiled Atlantic beach.',
      },
      {
        title: 'Salt — Coastal Cuisine',
        body: 'Our AAA Five Diamond restaurant featuring locally-sourced seafood and our signature salt collection.',
      },
    ],
  },
};

export const RC_CLUB_CONTENT = {
  hero: {
    variant: 'sunset',
    eyebrow: 'CLUB LEVEL · YOUR PRIVATE RETREAT',
    title: 'Welcome to The Ritz-Carlton Club, Amelia Island',
  },
  body: `Dear Ms. Cole,

It is our privilege to welcome you back to The Ritz-Carlton Club, Amelia Island. Your Club Concierge, Beatriz, will be your single point of contact throughout your stay — from securing a sunset table at Salt to arranging private transport to Cumberland Island.

Upon arrival, please proceed directly to the Club Lounge on the seventh floor, where your room key, a glass of Veuve Clicquot, and our afternoon canapé presentation will be ready for you.

At your service,
Beatriz Almeida
Club Level Concierge`,
  amenities: {
    title: 'Reserved for Club Guests',
    items: [
      {
        title: 'Five Daily Culinary Presentations',
        body: 'Continental breakfast, midday refreshments, afternoon tea, evening hors d\'oeuvres, and cordials prepared by Chef de Cuisine Antoine Laurent.',
      },
      {
        title: 'Private Beach Cabana',
        body: 'A reserved oceanfront cabana with chilled towels, frozen grapes, and our Club sunscreen service — held in your name for the duration of your stay.',
      },
      {
        title: 'Dedicated Concierge',
        body: 'Beatriz will reach out personally 48 hours before arrival to confirm dining, spa, and excursion preferences.',
      },
    ],
  },
};

export const HERO_VARIANTS = [
  { key: 'coast', label: 'Coastal afternoon', note: 'Default · cool palette' },
  { key: 'sunset', label: 'Atlantic sunset', note: 'Warmer tones · golden hour' },
  { key: 'dawn', label: 'Maritime dawn', note: 'Soft pastels · early morning' },
  { key: 'moonlit', label: 'Moonlit shore', note: 'Evening · deep navy' },
];

export function getContentForVariant(variant) {
  return variant === 'rc-club' ? RC_CLUB_CONTENT : DEFAULT_CONTENT;
}
