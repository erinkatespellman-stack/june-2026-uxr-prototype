import React, { useState } from 'react';
import theme from '../theme';
import { trackClick } from '../tracking/sessionTracker';

// Screen that precedes the Guide-AI modal: pick WHO the amenities are for from
// the audience library, then we generate a set tailored to that audience.
// Audiences mirror the "Choose your audience" version screen (screen 3) so the
// mental model stays consistent. RC Club and Beach Lovers pull bespoke amenity
// sets; the rest fall back to a property-wide sweep (flagged in amenityStore).

const EVERYONE = { key: 'property-wide', name: 'All audiences', desc: 'Property-wide highlights for every guest', accent: '#9AA0A8' };

const LOYALTY = [
  { key: 'rc-club', name: 'RC Club', desc: 'Guests we booked into an RC Club room', bestMatch: true, tailored: true, accent: '#7A4DD0' },
  { key: 'ambassador', name: 'Ambassador Elite', desc: 'Bonvoy members with a personal ambassador', accent: '#2D9D44' },
  { key: 'titanium', name: 'Titanium Elite', desc: 'Bonvoy members at the Titanium tier', accent: '#2F7DC4' },
  { key: 'platinum', name: 'Platinum Elite', desc: 'Bonvoy members at the Platinum tier', accent: '#B0741F' },
];

const PASSIONS = [
  { key: 'beach', name: 'Beach Lovers', desc: 'Guests who engage with beach and coastal activities', tailored: true, accent: '#D98A3D' },
  { key: 'surf', name: 'Surf & Water Sports', desc: 'Guests who book surf, paddle, and water experiences', accent: '#D98A3D' },
  { key: 'wellness', name: 'Wellness Seekers', desc: 'Guests who book spa, fitness, and wellness sessions', accent: '#D98A3D' },
  { key: 'golf', name: 'Golf Enthusiasts', desc: 'Guests who book golf tee times and course experiences', accent: '#D98A3D' },
];

const CUSTOM = { key: 'custom', name: 'Custom audience', desc: 'Define your own rules for a guest not yet created', accent: '#9AA0A8' };

function SparkleIcon({ color = '#7A4DD0', size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M7 1.2 8.1 4.4 11.3 5.5 8.1 6.6 7 9.8 5.9 6.6 2.7 5.5 5.9 4.4 7 1.2Z" fill={color} />
    </svg>
  );
}

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
      <SparkleIcon /> Best match
    </span>
  );
}

function AudienceCard({ item, onPick }) {
  const [hover, setHover] = useState(false);
  const [pressed, setPressed] = useState(false);
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
        minHeight: 158,
      }}
    >
      <div style={{ padding: '16px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {item.accent && <div style={{ width: 36, height: 4, borderRadius: 999, background: item.accent, marginBottom: 6 }} />}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, minHeight: 20 }}>
          <div style={{ fontSize: 15.5, fontWeight: 600, color: theme.color.text }}>{item.name}</div>
          {item.bestMatch && <BestMatchBadge />}
        </div>
        <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.5, flex: 1 }}>{item.desc}</div>
        {item.tailored && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 600, color: '#7A4DD0' }}>
            <SparkleIcon /> Tailored amenity set
          </div>
        )}
        <button
          onClick={() => onPick(item)}
          onMouseDown={() => setPressed(true)}
          onMouseUp={() => setPressed(false)}
          onMouseLeave={() => setPressed(false)}
          style={{
            marginTop: 8,
            width: '100%',
            background: pressed ? '#1C1C1C' : '#FFFFFF',
            color: pressed ? '#FFFFFF' : '#1C1C1C',
            border: `1px solid ${pressed ? '#1C1C1C' : '#5A5A5A'}`,
            borderRadius: theme.radius.pill,
            padding: '9px 16px',
            fontSize: 13.5,
            fontWeight: 500,
            cursor: 'pointer',
            transition: `background ${theme.motion.fast}, color ${theme.motion.fast}, border-color ${theme.motion.fast}`,
          }}
        >
          Generate for this audience
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 12, fontWeight: 700, color: theme.color.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '4px 0 12px' }}>
      {children}
    </div>
  );
}

const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 };

export default function AudienceLibraryModal({ onCancel, onPick }) {
  const handlePick = (item) => {
    trackClick('amenity_audience_pick', { audience: item.key });
    onPick(item);
  };

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,26,34,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 160ms ease-out',
      }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          width: 960,
          maxWidth: '100%',
          maxHeight: '90vh',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadow.modal,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 12px' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.text, marginBottom: 6 }}>
            Who are these amenities for?
          </div>
          <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.55, maxWidth: 620 }}>
            Pick an audience and our AI pulls amenities tailored to their experience — not generic property
            highlights. You can always start from <strong style={{ color: theme.color.text }}>All audiences</strong> for a property-wide sweep.
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 28px 8px' }}>
          <SectionLabel>Everyone</SectionLabel>
          <div style={grid}>
            <AudienceCard item={EVERYONE} onPick={handlePick} />
          </div>

          <SectionLabel>Loyalty</SectionLabel>
          <div style={grid}>
            {LOYALTY.map((item) => (
              <AudienceCard key={item.key} item={item} onPick={handlePick} />
            ))}
          </div>

          <SectionLabel>Passions</SectionLabel>
          <div style={grid}>
            {PASSIONS.map((item) => (
              <AudienceCard key={item.key} item={item} onPick={handlePick} />
            ))}
          </div>

          <SectionLabel>Created by you</SectionLabel>
          <div style={grid}>
            <AudienceCard item={CUSTOM} onPick={handlePick} />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '14px 28px 22px',
            borderTop: `1px solid ${theme.color.borderSoft}`,
          }}
        >
          <button
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', color: theme.color.textMuted, fontSize: 13, cursor: 'pointer', padding: '8px 4px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
