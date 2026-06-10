import React, { useState } from 'react';
import theme from '../theme';
import { trackClick, trackAIInteraction } from '../tracking/sessionTracker';

// Screen B — "Guide our AI with a little context".
// First step of the AI amenity-discovery flow opened from the Library banner.

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M11 2.5 13.5 5 5.5 13H3v-2.5L11 2.5Z" stroke={theme.color.textMuted} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ color = theme.color.primary, size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M7 1.2 8.1 4.4 11.3 5.5 8.1 6.6 7 9.8 5.9 6.6 2.7 5.5 5.9 4.4 7 1.2Z" fill={color} />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7h8M7 3.5 10.5 7 7 10.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Segmented control (One amenity | Multiple from my website)
function Segmented({ value, onChange }) {
  const options = [
    { key: 'single', label: 'One amenity' },
    { key: 'multiple', label: 'Multiple from my website' },
  ];
  return (
    <div
      style={{
        display: 'inline-flex',
        background: '#F0F0F0',
        borderRadius: theme.radius.md,
        padding: 3,
        gap: 3,
      }}
    >
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            style={{
              border: 'none',
              borderRadius: theme.radius.sm,
              padding: '7px 16px',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              background: active ? theme.color.text : 'transparent',
              color: active ? '#FFFFFF' : theme.color.textMuted,
              transition: `all ${theme.motion.fast}`,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.text, marginBottom: 4 }}>{children}</div>
  );
}

function FieldHelp({ children }) {
  return (
    <div style={{ fontSize: 12, color: theme.color.textMuted, lineHeight: 1.5, marginBottom: 10 }}>{children}</div>
  );
}

const inputStyle = {
  width: '100%',
  height: 38,
  padding: '0 12px',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  fontSize: 13,
  background: '#FFFFFF',
  color: theme.color.text,
  outline: 'none',
  fontFamily: theme.font.family,
};

export default function GuideAIModal({ onCancel, onNext }) {
  const [mode, setMode] = useState('multiple');
  const [url, setUrl] = useState('https://www.ritzcarlton.com/en/hotels/jaxam-the-ritz-carlton-amelia-island/overview/');
  const [tone, setTone] = useState('Ritz-Carlton');
  const [focus, setFocus] = useState('');
  const [amenity, setAmenity] = useState('');

  const handleNext = () => {
    trackAIInteraction('guide_ai_submit', { mode, tone, hasFocus: !!focus.trim() });
    onNext({ mode, url, tone, focus, amenity });
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
          width: 540,
          maxWidth: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadow.modal,
        }}
      >
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <PencilIcon />
          </div>
          <div style={{ fontSize: 20, fontWeight: 600, color: theme.color.text, marginBottom: 6 }}>
            Guide our AI with a little context
          </div>
          <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.55, marginBottom: 18 }}>
            Tell us what you have in mind, and we'll draft audience versions you're free to approve before anything is saved.
          </div>

          {/* Mode toggle */}
          <div style={{ marginBottom: 20 }}>
            <Segmented value={mode} onChange={(m) => { setMode(m); trackClick('guide_ai_mode', { mode: m }); }} />
          </div>

          {mode === 'multiple' ? (
            <>
              <FieldLabel>Your property website</FieldLabel>
              <FieldHelp>
                AI will scan your website, discover your amenities, and draft content — applying your chosen brand tone automatically.
              </FieldHelp>
              <div style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, marginBottom: 4 }}>Web Page URL</div>
              <input value={url} onChange={(e) => setUrl(e.target.value)} style={inputStyle} placeholder="https://" />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, marginBottom: 20 }}>
                <SparkleIcon />
                <span style={{ fontSize: 12, color: theme.color.primary }}>
                  We'll generate up to 10 amenities — review and approve before anything is saved
                </span>
              </div>
            </>
          ) : (
            <>
              <FieldLabel>Describe one amenity</FieldLabel>
              <FieldHelp>Name a single amenity and we'll draft on-brand content for it.</FieldHelp>
              <input
                value={amenity}
                onChange={(e) => setAmenity(e.target.value)}
                style={inputStyle}
                placeholder="e.g. The Spa at Ritz-Carlton"
              />
              <div style={{ height: 20 }} />
            </>
          )}

          {/* Brand tone */}
          <FieldLabel>Brand tone</FieldLabel>
          <FieldHelp>
            Choose the voice applied to all generated content. System-defined tones maintain brand consistency.
          </FieldHelp>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {['Ritz-Carlton', 'Marriott Bonvoy'].map((t) => {
              const active = tone === t;
              return (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: theme.radius.md,
                    border: `1px solid ${active ? theme.color.text : theme.color.border}`,
                    background: active ? theme.color.text : '#FFFFFF',
                    color: active ? '#FFFFFF' : theme.color.text,
                    fontSize: 13,
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: `all ${theme.motion.fast}`,
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {/* Focus areas */}
          <FieldLabel>Focus areas <span style={{ color: theme.color.textSubtle, fontWeight: 400 }}>(optional)</span></FieldLabel>
          <FieldHelp>Tell AI what to prioritize — or leave blank to discover everything.</FieldHelp>
          <input
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            style={inputStyle}
            placeholder="e.g. Spa, Dining, Rooftop, Fitness"
          />

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 26 }}>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.color.textMuted,
                fontSize: 13,
                cursor: 'pointer',
                padding: '8px 4px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: theme.color.text,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: theme.radius.pill,
                padding: '10px 22px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Next <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
