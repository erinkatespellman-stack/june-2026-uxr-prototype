import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Shell from './Shell';
import theme from '../theme';

// The app chrome: the Adobe Experience Cloud bar, the Marriott property bar with
// breadcrumbs, and the researcher header icons. Wraps page content. Uses
// react-router's useNavigate, so every story runs inside MemoryRouter.
const meta = {
  title: 'Chrome/Shell',
  component: Shell,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <MemoryRouter><Story /></MemoryRouter>],
  args: {
    propertyName: 'The Ritz-Carlton, Amelia Island',
    propertyCode: 'AXAM',
  },
};

export default meta;

// A simple page body so the chrome has something to frame.
function SamplePage({ title = 'Library for The Ritz-Carlton, Amelia Island' }) {
  return (
    <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', fontFamily: theme.font.family }}>
      <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>{title}</h1>
      <p style={{ fontSize: 14, color: theme.color.textMuted, marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
        Manage pre-arrival communications, amenities, and audience versions for this property.
      </p>
    </main>
  );
}

// Default chrome with no breadcrumbs.
export const Default = {
  args: { children: <SamplePage /> },
};

// Deeper in the IA — the Email Versions breadcrumb trail.
export const WithBreadcrumbs = {
  args: {
    breadcrumbs: ['Pre-Arrival Communications', 'Email', 'Versions'],
    children: <SamplePage title="Email · Audience Versions" />,
  },
};

// A page that injects an action into the property bar via headerRight.
export const WithHeaderAction = {
  args: {
    breadcrumbs: ['Pre-Arrival Communications', 'Email', 'RC Club'],
    headerRight: (
      <button
        style={{
          background: theme.color.primary,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: theme.radius.md,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Publish Now
      </button>
    ),
    children: <SamplePage title="RC Club · Pre-Arrival Email" />,
  },
};
