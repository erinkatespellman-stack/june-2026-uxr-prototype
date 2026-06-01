import React from 'react';
import theme from '../theme';
import { getContentForVariant } from '../content/emailContent';

// Coastal "photograph" SVG — four palette variants used by the hero.
const PALETTES = {
  coast: {
    sky: ['#1F3B4A', '#3E6178', '#7FA2B8', '#C4D4DE'],
    water: ['#1F2D38', '#3B4E5B'],
    sand: '#D8C7A6',
    sun: '#F0DDB8',
    chair: '#3F4A55',
  },
  sunset: {
    sky: ['#3B2541', '#7A3A4D', '#D67F5A', '#F1B97A'],
    water: ['#2A2438', '#4A3A52'],
    sand: '#E8D2A6',
    sun: '#FFD9A2',
    chair: '#5C3A2E',
  },
  dawn: {
    sky: ['#1F2C44', '#5B6F92', '#C8A8B5', '#F3D8CC'],
    water: ['#1E2638', '#3A4858'],
    sand: '#E5D5B8',
    sun: '#FFE9CE',
    chair: '#4A5168',
  },
  moonlit: {
    sky: ['#06101F', '#16213F', '#34406A', '#646C8F'],
    water: ['#050B16', '#16203A'],
    sand: '#7A776C',
    sun: '#E9E5D9',
    chair: '#1F2640',
  },
};

function CoastalHero({ variant = 'coast' }) {
  const p = PALETTES[variant] || PALETTES.coast;
  const id = `hero-${variant}`;
  return (
    <svg viewBox="0 0 600 240" width="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          {p.sky.map((c, i) => (
            <stop key={i} offset={`${(i / (p.sky.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
        <linearGradient id={`water-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.water[1]} />
          <stop offset="100%" stopColor={p.water[0]} />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="0.72" cy="0.55" r="0.18">
          <stop offset="0%" stopColor={p.sun} stopOpacity="0.95" />
          <stop offset="100%" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="600" height="160" fill={`url(#sky-${id})`} />
      <rect x="0" y="0" width="600" height="160" fill={`url(#sun-${id})`} />
      <circle cx="432" cy="132" r="22" fill={p.sun} opacity="0.9" />

      <path
        d="M0,158 C80,150 140,156 220,152 C300,148 360,158 440,154 C520,150 560,156 600,154 L600,170 L0,170 Z"
        fill={p.water[0]}
        opacity="0.6"
      />
      <rect x="0" y="160" width="600" height="55" fill={`url(#water-${id})`} />
      <path
        d="M0,178 C100,174 200,182 300,178 C400,174 500,182 600,178 L600,184 L0,184 Z"
        fill="#FFFFFF"
        opacity="0.08"
      />
      <path
        d="M0,196 C120,192 220,200 340,196 C460,192 540,200 600,196 L600,202 L0,202 Z"
        fill="#FFFFFF"
        opacity="0.06"
      />
      <rect x="0" y="215" width="600" height="25" fill={p.sand} />
      <path d="M0,215 C100,213 280,220 600,216 L600,220 L0,220 Z" fill="#000000" opacity="0.06" />

      {[180, 240].map((x, i) => (
        <g key={i} transform={`translate(${x},198)`}>
          <path
            d="M0,0 L18,0 L17,16 L1,16 Z M-1,4 L19,4 M2,0 L0,-10 L4,-10 L5,0 M14,0 L13,-10 L17,-10 L16,0"
            fill={p.chair}
            opacity="0.75"
          />
        </g>
      ))}
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="m2.5 9 .4-1.7L8.2 2l1.4 1.4L4.4 8.5 2.5 9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7.3 2.9 9 4.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M5 0.5 5.9 3.6 9 4.5 5.9 5.4 5 8.5 4.1 5.4 1 4.5 4.1 3.6Z" fill="currentColor" />
    </svg>
  );
}

function Section({ id, status, label, onEdit, children }) {
  // Idle states (pending OR accepted) render in blue; only 'editing' flips to green.
  const isEditing = status === 'editing';
  const interactive = status === 'pending' || status === 'editing' || status === 'accepted';

  const borderColor = isEditing ? theme.color.success : theme.color.aiBlueAccent;
  const surfaceTint = isEditing ? theme.color.successBg : theme.color.aiBlueBg;
  const badgeBg = borderColor;
  const iconColor = borderColor;

  const handleSectionClick = (e) => {
    if (!interactive) return;
    // Click inside the edit-icon bubbles up here too — same outcome either way.
    onEdit && onEdit(id);
  };

  return (
    <div
      onClick={interactive ? handleSectionClick : undefined}
      style={{
        position: 'relative',
        padding: interactive ? 14 : 0,
        margin: interactive ? '4px -14px 12px' : 0,
        border: interactive ? `2px solid ${borderColor}` : '2px solid transparent',
        borderRadius: interactive ? theme.radius.md : 0,
        background: interactive ? surfaceTint : 'transparent',
        cursor: interactive ? 'pointer' : 'default',
        transition: `border-color ${theme.motion.base}, background ${theme.motion.base}, padding ${theme.motion.base}, margin ${theme.motion.base}`,
      }}
    >
      {interactive && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -11,
              left: 12,
              background: badgeBg,
              color: '#FFFFFF',
              fontSize: 10.5,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: theme.radius.sm,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              zIndex: 2,
              pointerEvents: 'none',
              transition: `background ${theme.motion.base}`,
            }}
          >
            <SparkIcon />
            {label || 'AI suggested'}
          </div>

          <button
            type="button"
            className="section-edit-icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(id);
            }}
            aria-label="Edit section"
            title="Edit section"
            style={{
              position: 'absolute',
              top: -13,
              right: 12,
              width: 26,
              height: 26,
              background: '#FFFFFF',
              color: iconColor,
              border: `1.5px solid ${borderColor}`,
              borderRadius: theme.radius.sm,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              zIndex: 3,
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
              transition: `color ${theme.motion.fast}, border-color ${theme.motion.fast}`,
            }}
          >
            <PencilIcon />
          </button>
        </>
      )}

      {children}
    </div>
  );
}

export default function EmailPreview({
  variant,
  content: contentProp,
  sectionStatus,
  onAccept,
  onEdit,
  onReject,
  width = 640,
  scale = 1,
}) {
  const baseContent = contentProp || getContentForVariant(variant);

  // Resolve per-section status + content; default to 'static' (no border, no action bar).
  const resolve = (key) => ({
    status: sectionStatus?.[key]?.status || 'static',
    content: sectionStatus?.[key]?.content || baseContent[key],
  });

  const hero = resolve('hero');
  const body = resolve('body');
  const amenities = resolve('amenities');

  // Faithful Ritz pre-arrival palette (from Figma): #E9F1FA info bands,
  // #1C1C1C editorial type + black CTAs, Swiss721-style uppercase headings.
  const PANEL = '#E9F1FA';
  const INK = '#1C1C1C';
  const AMENITY_TINTS = [
    'linear-gradient(135deg, #2F4A5A 0%, #5C7C8E 100%)',
    'linear-gradient(135deg, #7A5A3A 0%, #C49A6C 100%)',
    'linear-gradient(135deg, #3A4A6A 0%, #8A9BB8 100%)',
    'linear-gradient(135deg, #4A5A4A 0%, #8AA08A 100%)',
  ];

  const sectionHeading = {
    fontFamily: theme.font.email,
    fontWeight: 400,
    fontSize: 26,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: INK,
    textAlign: 'center',
    lineHeight: 1.25,
  };
  const darkCta = {
    display: 'inline-block',
    background: INK,
    color: '#FFFFFF',
    padding: '12px 26px',
    textDecoration: 'none',
    fontSize: 11.5,
    fontWeight: 500,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
    fontFamily: theme.font.email,
  };

  return (
    <div
      style={{
        width,
        background: '#FFFFFF',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        transform: scale === 1 ? 'none' : `scale(${scale})`,
        transformOrigin: 'top center',
        fontFamily: theme.font.email,
        color: INK,
        margin: '0 auto',
      }}
    >
      {/* Brand header — light info band with crest, wordmark + property address */}
      <div
        style={{
          background: PANEL,
          borderTop: `2px solid ${INK}`,
          padding: '28px 24px 22px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, letterSpacing: 3, color: '#6E6E6E', marginBottom: 8 }}>
          THE
        </div>
        <div
          style={{
            fontFamily: theme.font.serifDisplay,
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: 1,
            color: INK,
            lineHeight: 1,
          }}
        >
          Ritz-Carlton
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: 3, color: '#6E6E6E', margin: '8px 0 18px' }}>
          AMELIA ISLAND
        </div>
        <div style={{ fontSize: 10.5, letterSpacing: 1.2, color: '#5A5A5A', lineHeight: 1.9, textTransform: 'uppercase' }}>
          <div>4750 Amelia Island Parkway</div>
          <div>Amelia Island, Florida USA</div>
          <div>+1 904-277-1100</div>
          <div style={{ marginTop: 4, color: '#8A8A8A' }}>Confirmation #: XXXXXXXX</div>
        </div>
      </div>

      {/* HERO — editable property photograph */}
      <Section
        id="hero"
        status={hero.status}
        label="AI suggested"
        onAccept={onAccept}
        onEdit={onEdit}
        onReject={onReject}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <CoastalHero variant={hero.content.variant} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.42) 100%)',
            }}
          />
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 22, color: '#FFFFFF', textAlign: 'center', padding: '0 24px' }}>
            <div style={{ fontSize: 9.5, letterSpacing: 3, fontWeight: 500, opacity: 0.92, textTransform: 'uppercase' }}>
              {hero.content.eyebrow}
            </div>
            <div
              style={{
                fontFamily: theme.font.serifDisplay,
                fontSize: 26,
                fontWeight: 600,
                marginTop: 8,
                lineHeight: 1.25,
              }}
            >
              {hero.content.title}
            </div>
          </div>
        </div>
      </Section>

      {/* BODY — welcome heading + highlight callout + editable letter */}
      <Section
        id="body"
        status={body.status}
        label="AI suggested"
        onAccept={onAccept}
        onEdit={onEdit}
        onReject={onReject}
      >
        <div style={{ padding: '38px 9% 34px' }}>
          <div style={{ ...sectionHeading, fontSize: 22, marginBottom: 18 }}>
            We Look Forward to Welcoming You
          </div>

          {/* Read-only live preview — editing happens in the right-hand panel */}
          <>
              <div
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.85,
                  color: INK,
                  whiteSpace: 'pre-wrap',
                  textAlign: 'center',
                }}
              >
                {body.content}
              </div>
              <div
                style={{
                  margin: '26px auto 0',
                  maxWidth: 360,
                  border: `1px dashed ${theme.color.borderStrong}`,
                  background: PANEL,
                  padding: '14px 18px',
                  textAlign: 'center',
                  fontSize: 13.5,
                  letterSpacing: 0.3,
                  color: INK,
                }}
              >
                We are looking forward to hosting you!
              </div>
            </>
        </div>
      </Section>

      {/* AMENITIES — "Curate an Extraordinary Stay" cards with Learn More CTAs */}
      <Section
        id="amenities"
        status={amenities.status}
        label="AI suggested"
        onAccept={onAccept}
        onEdit={onEdit}
        onReject={onReject}
      >
        <div style={{ background: '#FFFFFF', padding: '40px 7% 44px', borderTop: `1px solid ${theme.color.borderSoft}` }}>
          <div style={sectionHeading}>{amenities.content.title || 'Curate an Extraordinary Stay'}</div>
          <div
            style={{
              fontSize: 13.5,
              lineHeight: 1.65,
              color: '#5A5A5A',
              textAlign: 'center',
              maxWidth: 480,
              margin: '14px auto 28px',
            }}
          >
            Our ladies and gentlemen look forward to crafting a deeply personal experience
            for you at The Ritz-Carlton, Amelia Island.
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: 20,
            }}
          >
            {amenities.content.items.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '4 / 3',
                    background: AMENITY_TINTS[i % AMENITY_TINTS.length],
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'radial-gradient(circle at 70% 75%, rgba(255,255,255,0.22), transparent 60%)',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontFamily: theme.font.serifDisplay,
                    fontSize: 16,
                    fontWeight: 600,
                    color: INK,
                    margin: '14px 0 8px',
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.6, color: '#5A5A5A', marginBottom: 14, flex: 1 }}>
                  {item.body}
                </div>
                <button
                  onClick={(e) => e.preventDefault()}
                  style={{ ...darkCta, alignSelf: 'center', padding: '10px 20px', fontSize: 10.5 }}
                >
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* IN PREPARATION FOR YOUR STAY — reservation details band */}
      <div style={{ background: PANEL, padding: '38px 8% 40px', textAlign: 'center' }}>
        <div style={{ ...sectionHeading, fontSize: 22 }}>In Preparation for Your Stay</div>
        <div style={{ fontSize: 13, color: '#5A5A5A', margin: '12px auto 26px', maxWidth: 460, lineHeight: 1.6 }}>
          In anticipation of your visit, here's what we would like you to know:
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 18,
            maxWidth: 480,
            margin: '0 auto 28px',
          }}
        >
          {[
            ['Confirmation Number', '[Confirmation Number]'],
            ['Arrival Date', '[Arrival Date]'],
            ['Departure Date', '[Departure Date]'],
          ].map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: '#6E6E6E', marginBottom: 6 }}>
                {label}
              </div>
              <div style={{ fontSize: 13, color: INK }}>{value}</div>
            </div>
          ))}
        </div>
        <button onClick={(e) => e.preventDefault()} style={darkCta}>
          View Reservation Details
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          background: '#1B1B1B',
          color: 'rgba(255,255,255,0.7)',
          padding: '28px 8%',
          textAlign: 'center',
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <div style={{ color: '#FFFFFF', fontFamily: theme.font.serifDisplay, fontSize: 14, marginBottom: 8, letterSpacing: 0.5 }}>
          The Ritz-Carlton, Amelia Island
        </div>
        <div>4750 Amelia Island Parkway · Amelia Island, FL 32034</div>
        <div style={{ marginTop: 4 }}>+1 (904) 277-1100 · ritzcarlton.com/ameliaisland</div>
        <div style={{ marginTop: 16, color: 'rgba(255,255,255,0.4)', fontSize: 9.5, lineHeight: 1.7, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          You may opt out of promotional emails at any time. Each email also includes a link to unsubscribe.
          © 2026 Marriott International.
        </div>
      </div>
    </div>
  );
}
