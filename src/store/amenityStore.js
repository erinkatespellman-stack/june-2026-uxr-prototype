import { useSyncExternalStore } from 'react';

// Drives the A → B → C → 1 amenity-discovery flow.
//
// Library "before" state (screen A): only the two base Property Features exist,
// Dining is empty. The AI-discovery modals (B = guide, C = review) let the user
// add discovered amenities; on "Done" we flip `discoveryComplete` and the Library
// re-renders as the "after" state (screen 1) with the added amenities in place.

const BASE_FEATURES = [
  {
    key: 'seasonal-pool',
    name: 'Seasonal Pool Enhancements',
    category: 'Property Features',
    image: '/images/amenities/seasonal-pool.png',
    draftDate: 'April 16, 2026',
  },
  {
    key: 'angel-christmas-tree',
    name: 'Angel Christmas Tree',
    category: 'Property Features',
    image: '/images/amenities/angel-christmas-tree.png',
    draftDate: 'April 9, 2026',
  },
];

// Below this brand-match confidence we flag the amenity for the user to refine.
export const REFINE_THRESHOLD = 85;

// Concrete venue/amenity-type words. When a title contains one of these, the AI
// can map it to the brand taxonomy with high confidence.
const CONCRETE_TERMS = [
  'spa', 'pool', 'hot tub', 'bar', 'restaurant', 'dining', 'grill', 'lounge',
  'terrace', 'beach', 'golf', 'tennis', 'cabana', 'suite', 'lobby', 'cafe',
  'café', 'kitchen', 'fitness', 'marina', 'pier',
];

// AI brand-match confidence — a transparent heuristic standing in for the model.
// The more literally a title names a real amenity, the higher the confidence:
// an explicit type word ("Bar", "Spa") or a clean proper noun ("Salt") maps
// cleanly; a figurative/punny phrase ("Hook, Line & Supper") is harder to place
// and scores lower, prompting the user to refine. Deterministic, so values are
// stable across reloads.
function computeBrandMatch(name) {
  const lower = name.toLowerCase();
  const hasConcreteTerm = CONCRETE_TERMS.some((t) => lower.includes(t));
  const figurative = /[,&]/.test(name) && !hasConcreteTerm; // clever phrase, no literal type word
  const meaningfulWords = name
    .split(/\s+/)
    .filter((w) => !['the', 'of', 'a', 'at', '&', 'and'].includes(w.toLowerCase()));

  let score = 84; // baseline confidence for a recognized venue name
  if (hasConcreteTerm) score += 11; // explicit amenity type → confident mapping
  else if (meaningfulWords.length <= 1) score += 3; // clean single proper noun (Salt, Coquina)
  if (figurative) score -= 14; // idiomatic / punny → uncertain
  else if (!hasConcreteTerm && meaningfulWords.length >= 4) score -= 8; // long, flowery, non-literal

  score += (name.length % 5) - 2; // small deterministic spread so similar names aren't identical
  return Math.max(60, Math.min(98, score));
}

// ──────────────────────────────────────────────────────────────────────────
// Discovery targets — which audience version the amenities are being generated
// for. Generation is version-aware: rather than one generic sweep of the property
// site, the user picks who the amenities are for, and the AI pulls from the page
// that describes that experience. "All audiences" reads the property overview;
// "RC Club" reads the Club Level page, so the discovered amenities (Club Lounge
// Access, Club Beach…) are the ones that actually belong in the RC Club email —
// not generic property highlights.
export const DISCOVERY_TARGETS = [
  {
    key: 'property-wide',
    label: 'All audiences',
    sublabel: 'Property-wide highlights',
    url: 'https://www.ritzcarlton.com/en/hotels/jaxam-the-ritz-carlton-amelia-island/overview/',
  },
  {
    key: 'rc-club',
    label: 'RC Club',
    sublabel: 'Club Level members',
    url: 'https://www.ritzcarlton.com/en/hotels/jaxam-the-ritz-carlton-amelia-island/club/',
  },
  {
    key: 'beach',
    label: 'Beach Lovers',
    sublabel: 'Beach & coastal guests',
    url: 'https://www.ritzcarlton.com/en/hotels/jaxam-the-ritz-carlton-amelia-island/area-activities/',
  },
];

export function getTarget(key) {
  return DISCOVERY_TARGETS.find((t) => t.key === key) || DISCOVERY_TARGETS[0];
}

// Which bespoke amenity set an audience maps to. Audiences not listed here fall
// back to the general property-wide sweep (we don't have a dedicated page for
// every passion/tier yet), but RC Club and Beach Lovers pull tailored sets.
const AUDIENCE_TO_TARGET = {
  'rc-club': 'rc-club',
  beach: 'beach',
  'property-wide': 'property-wide',
};

export function targetForAudience(audienceKey) {
  return AUDIENCE_TO_TARGET[audienceKey] || 'property-wide';
}

// Real venues & experiences at The Ritz-Carlton, Amelia Island, grouped by the
// audience version they belong to (pulled from ritzcarlton.com/.../jaxam).
// brandMatch + the "Consider refining" flag are computed from each title via
// computeBrandMatch above.
const TARGET_AMENITIES = {
  'property-wide': [
    {
      key: 'salt',
      name: 'Salt',
      category: 'Dining',
      image: '/images/amenities/michelin-dining.png',
      description:
        "Michelin-trained Chef Okan Kizilbayir reimagines coastal cuisine in an intimate dining room — a celebration of the Lowcountry's salt and sea.",
    },
    {
      key: 'coquina',
      name: 'Coquina',
      category: 'Dining',
      image: '/images/amenities/rooftop-terrace.png',
      description:
        'Latin-inspired seafood and coastal plates served beneath the stars on a breezy ocean-view terrace.',
    },
    {
      key: 'lobby-bar',
      name: 'The Lobby Bar',
      category: 'Dining',
      image: '/images/library/bar-cocktail.png',
      description:
        'Specialty cocktails, curated sushi, and live music come together in a convivial, classic lounge.',
    },
    {
      key: 'spa',
      name: 'The Ritz-Carlton Spa',
      category: 'Property Features',
      image: '/images/amenities/spa.png',
      description:
        'A full-service sanctuary of rejuvenation — from restorative massage to guided Yoga Nidra meditation.',
    },
    {
      key: 'pool',
      name: 'Oceanfront Pool & Hot Tub',
      category: 'Property Features',
      image: '/images/library/ocean-pool.png',
      description:
        'Sun-warmed pools and a tranquil hot tub overlooking thirteen miles of pristine Atlantic shoreline.',
    },
    {
      key: 'beach-cabanas',
      name: 'Atlantic Beach Cabanas',
      category: 'Property Features',
      image: '/images/library/pool-cabanas.png',
      description:
        "Private beachfront cabanas with chilled towels and attentive service along the island's unspoiled coast.",
    },
    {
      key: 'hook-line-supper',
      name: 'Hook, Line & Supper',
      category: 'Experiences',
      image: '/images/library/beach-deck.png',
      description:
        "Cast a line on the Amelia River with our Executive Chef, then savor your catch at Salt's Chef's Table.",
    },
  ],
  'rc-club': [
    {
      key: 'club-lounge-access',
      name: 'Club Lounge Access',
      category: 'Dining',
      image: '/images/library/bar-cocktail.png',
      description:
        'Delight in an exclusive lounge experience, replete with an endless array of sumptuous beverages and culinary delights — from exquisite breakfast to delectable lunch, mid-day snacks, hors d’oeuvres, desserts, and cordials.',
    },
    {
      key: 'club-beach',
      name: 'Club Beach Experience',
      category: 'Experiences',
      image: '/images/library/beach-deck.png',
      description:
        'A personalized stretch of sand reserved for Club members, with complimentary cocktails, packed-lunch delivery, plush towels, umbrellas, and chilled refreshments throughout the day.',
    },
    {
      key: 'first-call',
      name: 'First Call Cocktail Hour',
      category: 'Experiences',
      image: '/images/amenities/rooftop-terrace.png',
      description:
        'Each evening at five, Club members gather in the lounge for a specially crafted cocktail showcasing a rotating selection of spirits.',
    },
    {
      key: 'sommelier-selection',
      name: "Sommelier's Selection",
      category: 'Dining',
      image: '/images/amenities/michelin-dining.png',
      description:
        'A curated daily pour of wines, sparkling wines, local beers, and spirits — hand-selected by our sommelier and served throughout the day.',
    },
    {
      key: 'club-concierge',
      name: 'Dedicated Club Concierge',
      category: 'Property Features',
      image: '/images/library/pool-cabanas.png',
      description:
        'An expert concierge devoted to your stay — arranging dining reservations, curating excursions, and tending to every personal detail.',
    },
    {
      key: 'eighth-floor-suites',
      name: 'Eighth-Floor Club Suites',
      category: 'Property Features',
      image: '/images/library/pool-aerial.png',
      description:
        'Luxurious ocean-view rooms and suites on our exclusive eighth floor, reserved entirely for Club members.',
    },
  ],
  beach: [
    {
      key: 'oceanfront-pool',
      name: 'Oceanfront Pool & Hot Tub',
      category: 'Property Features',
      image: '/images/library/ocean-pool.png',
      description:
        'Sun-warmed pools and a tranquil hot tub overlooking thirteen miles of pristine Atlantic shoreline.',
    },
    {
      key: 'beach-cabanas',
      name: 'Atlantic Beach Cabanas',
      category: 'Property Features',
      image: '/images/library/pool-cabanas.png',
      description:
        "Private beachfront cabanas with chilled towels and attentive service along the island's unspoiled coast.",
    },
    {
      key: 'club-beach',
      name: 'Club Beach Experience',
      category: 'Experiences',
      image: '/images/library/beach-deck.png',
      description:
        'A personalized stretch of sand with complimentary cocktails, packed-lunch delivery, plush towels, umbrellas, and chilled refreshments throughout the day.',
    },
    {
      key: 'hook-line-supper',
      name: 'Hook, Line & Supper',
      category: 'Experiences',
      image: '/images/amenities/rooftop-terrace.png',
      description:
        "Cast a line on the Amelia River with our Executive Chef, then savor your catch at Salt's Chef's Table.",
    },
    {
      key: 'coquina',
      name: 'Coquina',
      category: 'Dining',
      image: '/images/library/pool-aerial.png',
      description:
        'Latin-inspired seafood and coastal plates served beneath the stars on a breezy ocean-view terrace.',
    },
  ],
};

function freshDiscovered(target = 'property-wide') {
  const raw = TARGET_AMENITIES[target] || TARGET_AMENITIES['property-wide'];
  return raw.map((a) => {
    const brandMatch = computeBrandMatch(a.name);
    return {
      ...a,
      target,
      brandMatch,
      suggestion: brandMatch < REFINE_THRESHOLD ? 'Consider refining' : null,
      added: false,
    };
  });
}

function freshState(target = 'property-wide', audienceLabel = 'All audiences') {
  return {
    baseFeatures: BASE_FEATURES,
    target,
    audienceLabel,
    discovered: freshDiscovered(target),
    discoveryComplete: false,
  };
}

let state = freshState();
const listeners = new Set();

function notify() {
  for (const l of listeners) l();
}

export function getAmenityState() {
  return state;
}

// Toggle an amenity's accepted state inside the review modal (Add ⇄ Added).
export function toggleAmenity(key) {
  state = {
    ...state,
    discovered: state.discovered.map((a) =>
      a.key === key ? { ...a, added: !a.added } : a
    ),
  };
  notify();
}

export function addAmenity(key) {
  state = {
    ...state,
    discovered: state.discovered.map((a) =>
      a.key === key ? { ...a, added: true } : a
    ),
  };
  notify();
}

// Commit the discovery: accepted amenities now appear in the Library (screen 1).
export function completeDiscovery() {
  state = { ...state, discoveryComplete: true };
  notify();
}

export function resetAmenities() {
  state = freshState();
  notify();
}

// Choose which audience the discovery is generating for. Maps the audience to its
// bespoke amenity set (or the property-wide fallback), re-runs the AI sweep, and
// resets accepted state — so the review modal shows the newly-targeted candidates.
// `audience` = { key, name } from the audience-library grid.
export function setDiscoveryAudience(audience) {
  const target = targetForAudience(audience.key);
  state = freshState(target, audience.name || getTarget(target).label);
  notify();
}

export function getDiscoveryTarget() {
  return state.target;
}

export function getDiscoveryAudienceLabel() {
  return state.audienceLabel;
}

// Library selectors — base features plus any committed (accepted) discoveries,
// grouped by the category sections the Library renders.
export function getFeaturesByCategory(category) {
  const base = state.baseFeatures.filter((f) => f.category === category);
  const added = state.discoveryComplete
    ? state.discovered.filter((a) => a.added && a.category === category)
    : [];
  return [...base, ...added];
}

// Added amenities formatted for the RC Club email's "Curate an Extraordinary
// Stay" section, so the generated version reflects what the user discovered.
export function getAddedAmenitiesForEmail() {
  if (!state.discoveryComplete) return [];
  return state.discovered
    .filter((a) => a.added)
    .map((a) => ({ title: a.name, body: a.description, image: a.image }));
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAmenityState() {
  return useSyncExternalStore(subscribe, getAmenityState, getAmenityState);
}
