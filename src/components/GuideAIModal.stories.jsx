import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import GuideAIModal from './GuideAIModal';
import { setDiscoveryAudience } from '../store/amenityStore';

// Step B of amenity discovery: "Guide our AI." Reads the chosen audience from the
// amenity store to show the "Generating for…" summary and pre-point the URL, so
// each story seeds that audience first.
const seed = (audience) => (Story) => {
  setDiscoveryAudience(audience);
  return <MemoryRouter><Story /></MemoryRouter>;
};

const meta = {
  title: 'Amenities/GuideAIModal',
  component: GuideAIModal,
  parameters: { layout: 'fullscreen' },
  args: {
    onCancel: () => {},
    onNext: () => {},
    onBack: () => {},
  },
};

export default meta;

// Targeted at the RC Club audience — shows the tailored-set summary + Club page URL.
export const RcClubTargeted = {
  decorators: [seed({ key: 'rc-club', name: 'RC Club' })],
};

// Targeted at the Beach Lovers passion audience.
export const BeachLovers = {
  decorators: [seed({ key: 'beach', name: 'Beach Lovers' })],
};

// Property-wide sweep (no tailored set) — the "All audiences" default.
export const AllAudiences = {
  decorators: [seed({ key: 'property-wide', name: 'All audiences' })],
};
