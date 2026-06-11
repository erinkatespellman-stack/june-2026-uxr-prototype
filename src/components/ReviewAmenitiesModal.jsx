import React from 'react';
import theme from '../theme';
import { useAmenityState, toggleAmenity } from '../store/amenityStore';
import { trackClick, trackAIInteraction } from '../tracking/sessionTracker';

// Screen C — "Review AI Generated Amenities".
// Second step of the discovery flow: preview AI-found amenities and accept them
// into the library. Selection is held in amenityStore; "Done" commits it.

function CheckIcon({ color = '#FFFFFF' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 5 8.7 9.5 3.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AmenityCard({ amenity }) {
  const added = amenity.added;
  return (
    <div
      style={{
        width: '100%',
        background: '#FFFFFF',
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.shadow.card,
      }}
    >
      <div style={{ height: 150, overflow: 'hidden', position: 'relative' }}>
        <img src={amenity.image} alt={amenity.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: theme.color.text }}>{amenity.name}</div>
        {(() => {
          const strong = amenity.brandMatch >= 85;
          const c = strong ? theme.color.success : '#E0892F';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#ECECEC', overflow: 'hidden' }}>
                <div style={{ width: `${amenity.brandMatch}%`, height: '100%', background: c, borderRadius: 3 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: c, whiteSpace: 'nowrap' }}>
                {amenity.brandMatch}% brand match
              </span>
            </div>
          );
        })()}
        {amenity.suggestion && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#E0892F', fontWeight: 500 }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
              <path d="M7 1.5 13 12H1L7 1.5Z" stroke="#E0892F" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M7 5.5v3" stroke="#E0892F" strokeWidth="1.2" strokeLinecap="round" />
              <circle cx="7" cy="10.3" r="0.7" fill="#E0892F" />
            </svg>
            {amenity.suggestion}
          </div>
        )}
        <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.55, flex: 1 }}>
          {amenity.description}
        </div>
        <button
          onClick={() => {
            toggleAmenity(amenity.key);
            trackAIInteraction(added ? 'amenity_removed' : 'amenity_added', { amenity: amenity.key });
          }}
          style={{
            marginTop: 4,
            width: '100%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '10px 14px',
            borderRadius: theme.radius.md,
            border: 'none',
            background: added ? theme.color.success : theme.color.link,
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: `background ${theme.motion.fast}`,
          }}
        >
          {added && <CheckIcon />}
          {added ? 'Added' : 'Add to library'}
        </button>
      </div>
    </div>
  );
}

export default function ReviewAmenitiesModal({ onCancel, onDone }) {
  const { discovered, target, audienceLabel } = useAmenityState();
  const addedCount = discovered.filter((a) => a.added).length;
  const targeted = target !== 'property-wide';

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
          width: 980,
          maxWidth: '100%',
          maxHeight: '90vh',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadow.modal,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '24px 28px 8px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.text, marginBottom: 6 }}>
                Review AI Generated Amenities
              </div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.55, maxWidth: 580 }}>
                {discovered.length} amenities found for the{' '}
                <strong style={{ color: theme.color.text }}>{audienceLabel}</strong> version
                {targeted ? ' — tailored to their experience' : ' across your property website'}.
                Preview and accept to add to library. You can edit the amenity once it is in your library.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
              {targeted && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    background: '#F1EAFB',
                    color: '#7A4DD0',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: theme.radius.pill,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Targeted to {audienceLabel}
                </div>
              )}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: theme.color.successBg,
                  color: theme.color.success,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: theme.radius.pill,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckIcon color={theme.color.success} /> Ritz-Carlton brand tone applied
              </div>
            </div>
          </div>
        </div>

        {/* Grid — all candidates scannable at once */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
            {discovered.map((a) => (
              <AmenityCard key={a.key} amenity={a} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 28px 24px',
            borderTop: `1px solid ${theme.color.borderSoft}`,
            marginTop: 4,
          }}
        >
          <button
            onClick={onCancel}
            style={{ background: 'transparent', border: 'none', color: theme.color.textMuted, fontSize: 13, cursor: 'pointer', padding: '8px 4px' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              trackClick('amenities_done', { addedCount });
              // Acceptance denominator for the report's amenity trust metric.
              trackAIInteraction('amenities_committed', {
                added: addedCount,
                total: discovered.length,
                audience: audienceLabel,
              });
              onDone();
            }}
            style={{
              background: theme.color.text,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radius.pill,
              padding: '10px 26px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
