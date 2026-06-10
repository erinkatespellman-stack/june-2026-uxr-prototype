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

// AI-discovered amenities surfaced in the "Review AI Generated Amenities" modal (C).
// These are the real venues & experiences at The Ritz-Carlton, Amelia Island
// (pulled from ritzcarlton.com/.../jaxam). brandMatch + the "Consider refining"
// flag are computed from the title via computeBrandMatch above.
function freshDiscovered() {
  const raw = [
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
  ];

  return raw.map((a) => {
    const brandMatch = computeBrandMatch(a.name);
    return {
      ...a,
      brandMatch,
      suggestion: brandMatch < REFINE_THRESHOLD ? 'Consider refining' : null,
      added: false,
    };
  });
}

function freshState() {
  return {
    baseFeatures: BASE_FEATURES,
    discovered: freshDiscovered(),
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

// Library selectors — base features plus any committed (accepted) discoveries,
// grouped by the category sections the Library renders.
export function getFeaturesByCategory(category) {
  const base = state.baseFeatures.filter((f) => f.category === category);
  const added = state.discoveryComplete
    ? state.discovered.filter((a) => a.added && a.category === category)
    : [];
  return [...base, ...added];
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAmenityState() {
  return useSyncExternalStore(subscribe, getAmenityState, getAmenityState);
}
