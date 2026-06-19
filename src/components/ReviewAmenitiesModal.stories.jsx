import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ReviewAmenitiesModal from './ReviewAmenitiesModal';
import { setDiscoveryAudience, addAmenity } from '../store/amenityStore';

// Step C of amenity discovery: review the AI-found amenities and accept them. The
// grid + audience-match bars come from the amenity store, so each story seeds the
// targeted audience (and optionally pre-accepts a few) before the modal mounts.
const seed = (audience, added = []) => (Story) => {
  setDiscoveryAudience(audience);
  added.forEach(addAmenity);
  return <MemoryRouter><Story /></MemoryRouter>;
};

const meta = {
  title: 'Amenities/ReviewAmenitiesModal',
  component: ReviewAmenitiesModal,
  parameters: { layout: 'fullscreen' },
  args: {
    onCancel: () => {},
    onDone: () => {},
  },
};

export default meta;

// RC Club amenities, freshly discovered, none accepted yet.
export const RcClubReview = {
  decorators: [seed({ key: 'rc-club', name: 'RC Club' })],
};

// RC Club amenities with a few already added to the library.
export const RcClubWithSelections = {
  decorators: [seed({ key: 'rc-club', name: 'RC Club' }, ['club-lounge-access', 'club-beach', 'eighth-floor-suites'])],
};

// The property-wide sweep (Salt, Coquina, the spa, the pools…), AI-suggested.
export const PropertyWideReview = {
  decorators: [seed({ key: 'property-wide', name: 'All audiences' })],
};
