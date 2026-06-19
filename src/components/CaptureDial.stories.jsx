import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import CaptureDial from './CaptureDial';
import theme from '../theme';
import { setParticipant, resetSession, setMode } from '../tracking/sessionTracker';
import { saveFollowup, addDialResponse, clearDialResponses } from '../store/dialStore';

// The moderator's research capture form: name + user type, the "is versioning
// worth it?" block, the per-moment control dial, and optional follow-ups. It
// reads/writes the dial + session singletons (localStorage-backed), so each
// story seeds that state synchronously in its decorator before the form mounts.

function Frame({ children }) {
  return (
    <MemoryRouter>
      <div style={{ width: 460, fontFamily: theme.font.family, background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: 12, padding: 22 }}>
        {children}
      </div>
    </MemoryRouter>
  );
}

const seed = (fn) => (Story) => {
  setMode('moderated');
  fn();
  return <Frame><Story /></Frame>;
};

const meta = {
  title: 'Research/CaptureDial',
  component: CaptureDial,
  parameters: { layout: 'centered' },
};

export default meta;

// Fresh form — no participant named yet.
export const Blank = {
  decorators: [seed(() => { resetSession(); clearDialResponses(); })],
};

// A participant has been named and typed as a Creator; nothing captured yet.
export const ParticipantNamed = {
  decorators: [
    seed(() => {
      clearDialResponses();
      resetSession();
      setParticipant('Maria Alvarez');
      saveFollowup('Maria Alvarez', { role: 'creator' });
    }),
  ],
};

// A full capture: user type, versioning answers, dial for both moments, and the
// recent-captures list populated.
export const FullyCaptured = {
  decorators: [
    seed(() => {
      clearDialResponses();
      resetSession();
      setParticipant('Maria Alvarez');
      saveFollowup('Maria Alvarez', {
        role: 'creator',
        wouldUse: 'yes',
        frequency: 'monthly',
        effortWorth: 'depends',
        drivers: ['brand', 'time'],
        versioningWhy: "I'd use it for RC Club and wedding blocks, but managing five versions per campaign is a lot to keep straight.",
      });
      addDialResponse({ participant: 'Maria Alvarez', moment: 'amenities', desired: 'just-right', current: 'more', why: 'The amenity picks felt on-brand, I just tweaked the wording.' });
      addDialResponse({ participant: 'Maria Alvarez', moment: 'versions', desired: 'more', current: 'less', why: "I'd let it draft the whole thing if I could approve at the end." });
    }),
  ],
};
