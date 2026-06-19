import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import EmailPreview from './EmailPreview';

// The scaled-down pre-arrival email used as the editor canvas and as version-card
// thumbnails. `variant` swaps the underlying copy; `sectionStatus` drives the
// editable AI-review states (purple "AI suggested", green "Editing", blue
// "Edited"). Section content falls back to the variant's copy when omitted.
const meta = {
  title: 'Email/EmailPreview',
  component: EmailPreview,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: { width: 600 },
  argTypes: {
    variant: { control: 'select', options: ['default', 'rc-club'] },
    width: { control: { type: 'range', min: 320, max: 720, step: 20 } },
  },
};

export default meta;

// Default pre-arrival email (the everyone-gets-this version).
export const DefaultVariant = {
  args: { variant: 'default' },
};

// The RC Club audience version, with club-specific hero + amenities.
export const RcClubVariant = {
  args: { variant: 'rc-club' },
};

// All three sections in the untouched AI-suggested state (purple frames).
export const AiSuggestedSections = {
  args: {
    variant: 'rc-club',
    sectionStatus: {
      hero: { status: 'pending' },
      body: { status: 'pending' },
      amenities: { status: 'pending' },
    },
  },
};

// The body section actively being edited (green frame), others suggested.
export const BodyEditing = {
  args: {
    variant: 'rc-club',
    sectionStatus: {
      hero: { status: 'pending' },
      body: { status: 'editing' },
      amenities: { status: 'pending' },
    },
  },
};

// The body overridden by the property (blue "Edited" frame), with custom copy.
export const BodyEdited = {
  args: {
    variant: 'rc-club',
    sectionStatus: {
      hero: { status: 'pending' },
      body: {
        status: 'accepted',
        edited: true,
        content:
          'Dear Ms. Alvarez, as a valued Ritz-Carlton Club member we have reserved an oceanfront suite on the eighth floor and arranged a private welcome at the Club Lounge. We cannot wait to host you on Amelia Island.',
      },
      amenities: { status: 'pending' },
    },
  },
};
