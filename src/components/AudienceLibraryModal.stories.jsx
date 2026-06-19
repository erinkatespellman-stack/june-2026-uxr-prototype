import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AudienceLibraryModal from './AudienceLibraryModal';

// The "who are these amenities for?" picker that precedes Guide-AI. Self-contained
// (its audiences are defined in-file), so no store seeding is needed.
const meta = {
  title: 'Amenities/AudienceLibraryModal',
  component: AudienceLibraryModal,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: {
    onCancel: () => {},
    onPick: () => {},
  },
};

export default meta;

// The full audience library: Everyone, Loyalty (RC Club best-match), Passions, and
// Created-by-you, with "tailored amenity set" flags on RC Club and Beach Lovers.
export const Open = {};
