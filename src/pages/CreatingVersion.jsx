import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import theme from '../theme';
import { trackPageVisit, trackAIInteraction } from '../tracking/sessionTracker';
import { generateRCClubVersion } from '../store/rcClubStore';

// Screens 4 → 5 — "Creating your <audience> version".
// A checklist whose steps complete one by one; when all are done it shows the
// "ready… opening editor" banner. Per the current flow it stops here (the editor
// is a later screen), so it does not navigate away on its own.

const STEP_MS = 950;

function DoneCircle() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: theme.color.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M3 7.2 5.7 10 11 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function SpinnerCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden style={{ flexShrink: 0, animation: 'cvSpin 0.8s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="#D7E6FB" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={theme.color.primary} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function CreatingVersion() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const audience = params.get('audience') || 'RC Club';

  const steps = [
    `Reviewing ${audience} brand guidelines`,
    'Analyzing existing property content',
    `Scanning amenities for ${audience} relevance`,
    'Selecting best-fit hero imagery',
    'Drafting personalized welcome message',
    `Assembling your ${audience} version`,
  ];

  const [completed, setCompleted] = useState(0);
  const done = completed >= steps.length;

  useEffect(() => {
    trackPageVisit('creating_version');
    // Assemble the version now, pulling amenities from what the user added.
    generateRCClubVersion();
  }, []);

  useEffect(() => {
    if (done) {
      trackAIInteraction('version_generated', { audience });
      // Hold on the "ready" banner briefly, then open the editor (screen 6).
      const t = setTimeout(() => navigate('/versions/rc-club'), 1300);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [completed, done, audience, navigate]);

  const visibleCount = Math.min(completed + 1, steps.length);
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <Shell propertyName="The Ritz-Carlton, Amelia Island" propertyCode="AXAM">
      <style>{`@keyframes cvSpin { to { transform: rotate(360deg) } }
        @keyframes cvStepIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes cvBannerIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 24px' }}>
        <div
          style={{
            width: 760,
            maxWidth: '100%',
            background: theme.color.surface,
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.radius.xl,
            boxShadow: theme.shadow.card,
            padding: '40px 44px 44px',
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 600, color: theme.color.text, marginBottom: 8 }}>
            Creating your {audience} version
          </div>
          <div style={{ fontSize: 14, color: theme.color.textMuted, marginBottom: 32 }}>
            Reviewing your property's content and {audience} brand guidelines
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, minHeight: 60 }}>
            {steps.slice(0, visibleCount).map((label, i) => {
              const isDone = i < completed;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, animation: 'cvStepIn 280ms ease-out' }}>
                  {isDone ? <DoneCircle /> : <SpinnerCircle />}
                  <span style={{ fontSize: 15, color: isDone ? theme.color.textMuted : theme.color.text, fontWeight: isDone ? 400 : 500 }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 36, height: 4, background: '#ECECEC', borderRadius: 2, overflow: 'hidden' }}>
            <div
              style={{
                width: done ? '100%' : `${pct}%`,
                height: '100%',
                background: theme.color.primary,
                borderRadius: 2,
                transition: `width ${STEP_MS}ms ease-in-out`,
              }}
            />
          </div>

          {/* Ready banner */}
          {done && (
            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: theme.color.successBg,
                border: `1px solid #BfE4C8`,
                borderRadius: theme.radius.md,
                padding: '14px 18px',
                animation: 'cvBannerIn 360ms ease-out',
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: theme.color.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M3 7.2 5.7 10 11 4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.success }}>
                {audience} version ready… opening editor
              </span>
            </div>
          )}
        </div>
      </main>
    </Shell>
  );
}
