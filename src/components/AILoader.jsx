import React, { useEffect, useState } from 'react';
import theme from '../theme';

// Slow, restrained AI thinking visual — not cartoonish.
// Pulsing orbital ring + cycling status lines.

const DEFAULT_STEPS = [
  'Reviewing your property\'s current welcome email…',
  'Studying Ritz-Carlton Club brand guidelines…',
  'Drafting personalized copy for Club guests…',
  'Curating amenity highlights…',
  'Polishing tone of voice…',
];

export default function AILoader({
  title = 'Creating your RC Club version',
  subtitle = "We're reviewing your property's content and RC Club brand guidelines",
  steps = DEFAULT_STEPS,
}) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % steps.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background:
          'radial-gradient(ellipse at 50% 30%, #1B2A3A 0%, #0F1721 70%, #08101A 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: theme.font.family,
        animation: 'aiOverlayFadeIn 320ms ease-out',
      }}
    >
      <style>{`
        @keyframes aiOverlayFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes aiRingSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aiRingSpinReverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes aiPulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes aiOrbDot {
          0% { transform: rotate(0deg) translateX(60px) rotate(0deg); opacity: 0.3; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(60px) rotate(-360deg); opacity: 0.3; }
        }
        @keyframes aiStepFade {
          0% { opacity: 0; transform: translateY(6px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-6px); }
        }
        @keyframes aiBarFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>

      <div style={{ textAlign: 'center', maxWidth: 520, padding: 32 }}>
        {/* Marriott M wordmark up top for branding */}
        <div
          style={{
            fontFamily: theme.font.serifDisplay,
            fontSize: 14,
            letterSpacing: 6,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 60,
            fontWeight: 600,
          }}
        >
          MARRIOTT
          <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.25)' }}>·</span>
          THE RITZ-CARLTON
        </div>

        {/* Orbital animation */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            margin: '0 auto 44px',
          }}
        >
          {/* outer ring */}
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ position: 'absolute', inset: 0, animation: 'aiRingSpin 8s linear infinite' }}
          >
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1473E6" />
                <stop offset="50%" stopColor="#5BA1F0" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#1473E6" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <circle
              cx="70"
              cy="70"
              r="62"
              fill="none"
              stroke="url(#ringGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 8"
            />
          </svg>
          {/* inner ring */}
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ position: 'absolute', inset: 0, animation: 'aiRingSpinReverse 14s linear infinite' }}
          >
            <circle
              cx="70"
              cy="70"
              r="48"
              fill="none"
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
          </svg>
          {/* orbit dot */}
          <div
            style={{
              position: 'absolute',
              top: 70,
              left: 70,
              width: 8,
              height: 8,
              marginTop: -4,
              marginLeft: -4,
              background: '#5BA1F0',
              borderRadius: '50%',
              boxShadow: '0 0 16px #5BA1F0',
              animation: 'aiOrbDot 3.5s linear infinite',
            }}
          />
          {/* core orb */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 60,
              height: 60,
              marginTop: -30,
              marginLeft: -30,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 30% 30%, #82B6F0 0%, #1473E6 55%, #01408F 100%)',
              boxShadow: '0 0 32px rgba(20,115,230,0.55), inset 0 0 18px rgba(255,255,255,0.18)',
              animation: 'aiPulse 2.4s ease-in-out infinite',
            }}
          />
          {/* sparkle accent */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -9,
              marginLeft: -9,
              animation: 'aiPulse 2.4s ease-in-out infinite',
            }}
          >
            <path
              d="M9 1.5 10.4 6.6 15.5 8 10.4 9.4 9 14.5 7.6 9.4 2.5 8 7.6 6.6Z"
              fill="#FFFFFF"
              opacity="0.95"
            />
          </svg>
        </div>

        <div
          style={{
            fontFamily: theme.font.serifDisplay,
            fontSize: 26,
            fontWeight: 600,
            marginBottom: 14,
            letterSpacing: -0.2,
          }}
        >
          {title}…
        </div>
        <div
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.55,
            maxWidth: 420,
            margin: '0 auto 30px',
          }}
        >
          {subtitle}
        </div>

        {/* Current step — fades in/out smoothly */}
        <div
          style={{
            height: 22,
            fontSize: 13,
            color: 'rgba(255,255,255,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          key={stepIndex}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#5BA1F0',
              boxShadow: '0 0 6px #5BA1F0',
              animation: 'aiPulse 1.2s ease-in-out infinite',
            }}
          />
          <span style={{ animation: 'aiStepFade 1.2s ease-in-out forwards' }}>{steps[stepIndex]}</span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            marginTop: 30,
            width: 280,
            height: 3,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 2,
            margin: '30px auto 0',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #1473E6 0%, #5BA1F0 100%)',
              animation: 'aiBarFill 3s ease-in-out forwards',
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    </div>
  );
}
