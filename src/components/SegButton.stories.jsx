import React, { useState } from 'react';
import SegButton from './SegButton';

// Segmented single-select toggle used throughout the research capture flow.
const meta = {
  title: 'Controls/SegButton',
  component: SegButton,
  parameters: { layout: 'centered' },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
};

export default meta;

// Interactive wrapper so the control actually toggles in the canvas.
function Interactive({ options, initial = null }) {
  const [value, setValue] = useState(initial);
  return <SegButton options={options} value={value} onChange={setValue} />;
}

// The control-dial positions (less / just right / more).
export const DialPositions = {
  render: () => (
    <Interactive
      initial="just-right"
      options={[
        { key: 'less', label: 'Less AI' },
        { key: 'just-right', label: 'Just right' },
        { key: 'more', label: 'More AI' },
      ]}
    />
  ),
};

// "Would they use it?" — three short options.
export const WouldUse = {
  render: () => (
    <Interactive
      initial="yes"
      options={[
        { key: 'yes', label: 'Yes' },
        { key: 'maybe', label: 'Maybe' },
        { key: 'no', label: 'No' },
      ]}
    />
  ),
};

// Frequency — four options, demonstrating wrap behaviour at this width.
export const Frequency = {
  render: () => (
    <Interactive
      options={[
        { key: 'every-campaign', label: 'Every campaign' },
        { key: 'monthly', label: 'Monthly' },
        { key: 'few-times', label: 'A few times a year' },
        { key: 'rarely', label: 'Rarely' },
      ]}
    />
  ),
};

// Nothing selected yet.
export const Unselected = {
  render: () => (
    <Interactive
      options={[
        { key: 'creator', label: 'Creator' },
        { key: 'approver', label: 'Approver' },
        { key: 'other', label: 'Other' },
      ]}
    />
  ),
};
