import React from 'react';
import VersionCard from './VersionCard';

// Stories for the Email Versions library card. The card renders a scaled-down
// <EmailPreview> as its thumbnail, so each story is wrapped to a realistic
// grid-cell width.
const meta = {
  title: 'Library/VersionCard',
  component: VersionCard,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div style={{ width: 300 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    name: 'RC Club',
    status: 'Published',
    lastEdited: 'Apr 18, 2026',
    variant: 'rc-club',
    onOpen: () => {},
    onEdit: () => {},
    onDelete: () => {},
  },
  argTypes: {
    status: { control: 'select', options: ['Published', 'Draft', 'Scheduled'] },
    variant: { control: 'select', options: ['default', 'rc-club'] },
    name: { control: 'text' },
    lastEdited: { control: 'text' },
    selected: { control: 'boolean' },
  },
};

export default meta;

// Default published RC Club version.
export const Published = {};

// Draft status (orange pill), default variant thumbnail.
export const Draft = {
  args: { name: 'Family', status: 'Draft', variant: 'default' },
};

// Scheduled status, with the send date shown beneath the pill.
export const Scheduled = {
  args: { name: 'Wedding Block', status: 'Scheduled', scheduledAt: 'Sends Apr 25, 2026' },
};

// Selected state (purple ring) — passing onToggleSelect also reveals the checkbox.
export const Selected = {
  args: { selected: true, onToggleSelect: () => {} },
};

// Compare-flow variant: the selection checkbox is available on hover.
export const WithSelectionCheckbox = {
  args: { onToggleSelect: () => {} },
};
