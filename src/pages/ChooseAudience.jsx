import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import theme from '../theme';
import { trackPageVisit, trackClick } from '../tracking/sessionTracker';

// Screen 3 — "Choose your audience".
// Preset audiences grouped by Loyalty / Passions, plus a Custom option.
// Picking an audience kicks off the AI build loader (screens 4 → 5).

const LOYALTY = [
  { key: 'rc-club', name: 'RC Club', desc: 'Guests we booked into an RC Club room', bestMatch: true, accent: '#7A4DD0' },
  { key: 'ambassador', name: 'Ambassador Elite', desc: 'Bonvoy members with a personal ambassador', accent: '#2D9D44' },
  { key: 'titanium', name: 'Titanium Elite', desc: 'Bonvoy members at the Titanium tier', accent: '#2F7DC4' },
  { key: 'platinum', name: 'Platinum Elite', desc: 'Bonvoy members at the Platinum tier', accent: '#B0741F' },
];

const PASSIONS = [
  { key: 'surf', name: 'Surf & Water Sports', desc: 'Guests who book surf, paddle, and water experiences' },
  { key: 'hikers', name: 'Hikers & Outdoorsmen', desc: 'Guests who book trail, nature, and outdoor excursions' },
  { key: 'wellness', name: 'Wellness Seekers', desc: 'Guests who book spa, fitness, and wellness sessions' },
  { key: 'beach', name: 'Beach Lovers', desc: 'Guests who engage with beach and coastal activities' },
  { key: 'golf', name: 'Golf Enthusiasts', desc: 'Guests who book golf tee times and course experiences' },
  { key: 'ski', name: 'Ski & Snow', desc: 'Guests who book ski, snow, and mountain experiences' },
];

const CUSTOM = { key: 'custom', name: 'Custom audience', desc: 'Define your own rules for a guest not yet created' };

function BestMatchBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        color: '#7A4DD0',
        background: '#F1EAFB',
        padding: '3px 8px',
        borderRadius: theme.radius.pill,
        whiteSpace: 'nowrap',
      }}
    >
      <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M7 1.2 8.1 4.4 11.3 5.5 8.1 6.6 7 9.8 5.9 6.6 2.7 5.5 5.9 4.4 7 1.2Z" fill="#7A4DD0" />
      </svg>
      Best match
    </span>
  );
}

function AudienceCard({ item, accent, onCreate }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        background: theme.color.surface,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        boxShadow: hover ? theme.shadow.cardHover : theme.shadow.card,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: `box-shadow ${theme.motion.base}, transform ${theme.motion.base}`,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 168,
      }}
    >
      <div style={{ padding: '18px 18px 20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {/* Short rounded accent segment, top-left */}
        {accent && <div style={{ width: 36, height: 4, borderRadius: 999, background: accent, marginBottom: 8 }} />}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, minHeight: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.text }}>{item.name}</div>
          {item.bestMatch && <BestMatchBadge />}
        </div>
        <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.5, flex: 1 }}>{item.desc}</div>
        <button
          onClick={onCreate}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          style={{
            marginTop: 10,
            width: '100%',
            background: pressed ? '#1C1C1C' : '#FFFFFF',
            color: pressed ? '#FFFFFF' : '#1C1C1C',
            border: `1px solid ${pressed ? '#1C1C1C' : '#5A5A5A'}`,
            borderRadius: theme.radius.pill,
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: `background ${theme.motion.fast}, color ${theme.motion.fast}, border-color ${theme.motion.fast}`,
          }}
        >
          Create
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '6px 0 14px' }}>
      {children}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 18, marginBottom: 32 };

export default function ChooseAudience() {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageVisit('choose_audience');
  }, []);

  const pick = (item) => {
    trackClick('pick_audience', { audience: item.key });
    navigate(`/versions/creating?audience=${encodeURIComponent(item.name)}`);
  };

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Pre-Arrival Communications', 'Email', 'Audience Versions', 'New']}
    >
      <main style={{ flex: 1, padding: '28px 36px 56px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          {/* Header */}
          <button
            onClick={() => { trackClick('back_to_versions'); navigate('/versions'); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.color.primary,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              padding: 0,
              cursor: 'pointer',
              marginBottom: 8,
              display: 'block',
            }}
          >
            ← Email · Audience Versions
          </button>
          <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>Choose your audience</h1>
          <p style={{ fontSize: 13.5, color: theme.color.textMuted, margin: '8px 0 28px', lineHeight: 1.5 }}>
            Select a preset audience or build a custom one for your new version.
          </p>

          {/* Loyalty */}
          <SectionLabel>Loyalty</SectionLabel>
          <div style={grid}>
            {LOYALTY.map((item) => (
              <AudienceCard key={item.key} item={item} accent={item.accent} onCreate={() => pick(item)} />
            ))}
          </div>

          {/* Passions */}
          <SectionLabel>Passions</SectionLabel>
          <div style={grid}>
            {PASSIONS.map((item) => (
              <AudienceCard key={item.key} item={item} accent="#D98A3D" onCreate={() => pick(item)} />
            ))}
          </div>

          {/* Created by you */}
          <SectionLabel>Created by you</SectionLabel>
          <div style={grid}>
            <AudienceCard item={CUSTOM} accent="#9AA0A8" onCreate={() => pick(CUSTOM)} />
          </div>
        </div>
      </main>
    </Shell>
  );
}
