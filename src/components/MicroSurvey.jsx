import React, { useState } from 'react';
import theme from '../theme';

// Floating research micro-survey with the concierge-bell mascot.
// Shown after the user finishes an AI feature (amenity generation, RC Club
// version generation). Parent decides the recorded `question` label and wires
// onAnswer → trackSurveyResponse.
export default function MicroSurvey({ onAnswer, onDismiss }) {
  const [answered, setAnswered] = useState(null);
  const options = [
    { key: 'too-automated', label: 'Too automated' },
    { key: 'just-right', label: 'Just right' },
    { key: 'more-control', label: 'More control' },
  ];
  const handlePick = (opt) => {
    setAnswered(opt.key);
    onAnswer(opt.label);
    setTimeout(onDismiss, 1200);
  };
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        zIndex: 90,
        background: '#FFFFFF',
        border: `1px solid ${theme.color.border}`,
        boxShadow: theme.shadow.overlay,
        borderRadius: theme.radius.xl,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 32px)',
        animation: 'surveyRise 320ms cubic-bezier(0.2,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes surveyRise { from { opacity: 0; transform: translate(-50%, 14px) } to { opacity: 1; transform: translate(-50%, 0) } }
        @keyframes bellRing {
          0%, 55%, 100% { transform: rotate(0deg) translateY(0); }
          59% { transform: translateY(-3px) rotate(-15deg); }
          64% { transform: rotate(13deg); }
          69% { transform: rotate(-10deg); }
          74% { transform: rotate(7deg); }
          79% { transform: rotate(-4deg); }
          84% { transform: rotate(2deg) translateY(0); }
        }
      `}</style>
      <span
        aria-hidden
        style={{ fontSize: 20, display: 'inline-block', transformOrigin: '50% 12%', animation: 'bellRing 2.4s ease-in-out infinite' }}
      >
        🛎️
      </span>
      <div style={{ fontSize: 13, fontWeight: 500, color: theme.color.text, marginRight: 4 }}>How did that feel?</div>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map((opt) => {
          const isChosen = answered === opt.key;
          const isDimmed = answered && !isChosen;
          return (
            <button
              key={opt.key}
              disabled={!!answered}
              onClick={() => handlePick(opt)}
              style={{
                background: isChosen ? theme.color.primary : '#FFFFFF',
                color: isChosen ? '#FFFFFF' : theme.color.text,
                border: `1px solid ${isChosen ? theme.color.primary : theme.color.borderStrong}`,
                padding: '7px 14px',
                borderRadius: theme.radius.pill,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: answered ? 'default' : 'pointer',
                opacity: isDimmed ? 0.4 : 1,
                transition: `all ${theme.motion.fast}`,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{ background: 'transparent', border: 'none', color: theme.color.textMuted, fontSize: 16, cursor: 'pointer', marginLeft: 4, width: 22, height: 22 }}
      >
        ×
      </button>
    </div>
  );
}
