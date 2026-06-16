import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import Shell from '../components/Shell';
import CaptureDial from '../components/CaptureDial';
import { getMode, setMode, resetSession } from '../tracking/sessionTracker';

// Full-page capture screen, opened from the pencil icon in the header. Set the
// study mode, name the participant, and record dial answers as they talk. This is
// the single capture surface and feeds the Study Summary report.

function ghostBtn() {
  return {
    background: '#FFFFFF',
    border: `1px solid ${theme.color.borderStrong}`,
    borderRadius: theme.radius.md,
    padding: '9px 16px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: theme.color.text,
  };
}

export default function ResearchConsole() {
  const navigate = useNavigate();
  const [mode, setModeState] = useState(() => getMode());
  const [resetKey, setResetKey] = useState(0);

  const chooseMode = (m) => { setModeState(m); setMode(m); };

  // Start a fresh session for the next participant (clears the capture form).
  const newSession = () => {
    if (window.confirm('Start a fresh session for a new participant? Saved results are kept.')) {
      resetSession();
      setResetKey((k) => k + 1);
    }
  };

  return (
    <Shell breadcrumbs={['Research', 'Capture Console']}>
      <main style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', color: theme.color.text, padding: '48px 56px 80px' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
                Researcher only
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Capture Console</h1>
              <div style={{ fontSize: 15, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>
                Keep this page open during the interview. Name the participant, then record their control-dial answers as they talk. Everything you save flows straight into the results.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={newSession} style={{ ...ghostBtn(), whiteSpace: 'nowrap' }}>New session</button>
              <button onClick={() => navigate('/report')} style={{ ...ghostBtn(), whiteSpace: 'nowrap' }}>View results</button>
            </div>
          </div>

          <div style={{ height: 1, background: theme.color.border, margin: '24px 0 28px' }} />

          {/* Mode */}
          <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 320px' }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Study mode</div>
              <div style={{ fontSize: 13.5, color: theme.color.textMuted, lineHeight: 1.5, marginTop: 2 }}>
                {mode === 'moderated'
                  ? 'Moderated: you capture answers. The in-flow popup is hidden so it does not interrupt the participant.'
                  : 'Unmoderated: the participant answers in the flow themselves. Use this console to review or add notes.'}
              </div>
            </div>
            <div style={{ display: 'inline-flex', background: '#F0F0F0', borderRadius: theme.radius.md, padding: 3, gap: 3 }}>
              {[{ key: 'moderated', label: 'Moderated' }, { key: 'unmoderated', label: 'Unmoderated' }].map((o) => {
                const active = mode === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => chooseMode(o.key)}
                    style={{ border: 'none', borderRadius: theme.radius.sm, padding: '8px 16px', fontSize: 14, fontWeight: active ? 600 : 500, cursor: 'pointer', background: active ? theme.color.text : 'transparent', color: active ? '#FFFFFF' : theme.color.textMuted, transition: `all ${theme.motion.fast}` }}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Capture form */}
          <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '22px 24px' }}>
            <CaptureDial key={resetKey} />
          </div>
        </div>
      </main>
    </Shell>
  );
}
