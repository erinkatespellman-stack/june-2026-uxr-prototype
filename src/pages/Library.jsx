import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import theme from '../theme';
import { trackPageVisit, trackClick } from '../tracking/sessionTracker';

function PrimaryButton({ children, onClick, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? theme.color.primaryHover : theme.color.primary,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: theme.radius.md,
        padding: '9px 18px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: `background ${theme.motion.fast}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function ChevronDown() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccordionChevron({ open }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden
      style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: `transform ${theme.motion.fast}`, flexShrink: 0 }}
    >
      <path d="M5 2.5 9.5 7 5 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon({ white = false }) {
  const c = white ? '#FFFFFF' : theme.color.primary;
  const size = white ? 20 : 14;
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M7 1.2 8.1 4.4 11.3 5.5 8.1 6.6 7 9.8 5.9 6.6 2.7 5.5 5.9 4.4 7 1.2Z" fill={c} />
      <path d="m11 9 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5L11 9Z" fill={c} opacity="0.6" />
    </svg>
  );
}

// ──────── Channel thumbnails ────────

function EmailMiniThumb() {
  return (
    <img
      src="/images/pre-arrival-email.png"
      alt="Pre-arrival email preview"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

function FormMiniThumb() {
  return (
    <img
      src="/images/travel-planner.png"
      alt="Travel planner form preview"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  );
}

// ──────── Discovery banner (Figma "Audience versions are now available") ────────

function AudienceVersionsBanner({ onGetStarted }) {
  return (
    <div
      style={{
        background: theme.color.aiBlueBannerBg,
        border: `1px solid ${theme.color.aiBlueBannerBorder}`,
        borderRadius: theme.radius.lg,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        justifyContent: 'space-between',
        marginBottom: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: 10,
            background: theme.color.aiBlueAccent,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SparkleIcon white />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.text }}>
            Audience versions are now available
          </div>
          <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.5, maxWidth: 620 }}>
            Create tailored email versions for specific guest segments, starting with RC Club.
            Customize the welcome, amenities, and more for Club members.
          </div>
        </div>
      </div>
      <PrimaryButton onClick={onGetStarted} style={{ flexShrink: 0 }}>
        Get Started
      </PrimaryButton>
    </div>
  );
}

// ──────── Status badge ("Active") ────────

function ActiveBadge() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: 11,
        fontWeight: 600,
        color: '#FFFFFF',
        background: theme.color.success,
        padding: '3px 9px',
        borderRadius: theme.radius.sm,
        letterSpacing: 0.2,
      }}
    >
      Active
    </span>
  );
}

// ──────── Channel card ────────

function ChannelCard({ thumbnail, title, draftDate, publishedDate, ctaLabel, onOpen, onManage }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        background: theme.color.surface,
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: hover ? theme.shadow.cardHover : theme.shadow.card,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: `box-shadow ${theme.motion.base}, transform ${theme.motion.base}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ height: 132, width: '100%', overflow: 'hidden', borderBottom: `1px solid ${theme.color.borderSoft}` }}>
        {thumbnail}
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: theme.color.text }}>{title}</div>
          <ActiveBadge />
        </div>
        <div style={{ fontSize: 12, color: theme.color.textMuted, lineHeight: 1.6 }}>
          <div>Draft edits saved on {draftDate}</div>
          <div>Published on {publishedDate}</div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onManage && onManage();
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#F4FAFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
          style={{
            marginTop: 2,
            width: '100%',
            background: '#FFFFFF',
            color: theme.color.link,
            border: `1px solid ${theme.color.link}`,
            borderRadius: theme.radius.pill,
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: `background ${theme.motion.fast}`,
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

// ──────── Filter pills ────────

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 13px',
        borderRadius: theme.radius.pill,
        background: active ? theme.color.pillActiveBg : theme.color.pillBg,
        border: `1px solid ${active ? theme.color.pillActiveBorder : theme.color.pillBorder}`,
        color: active ? theme.color.pillActiveText : theme.color.text,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        transition: `all ${theme.motion.fast}`,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ──────── Collapsible category section ────────

function AccordionSection({ title, defaultOpen = false, empty = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#F5F5F5',
          border: 'none',
          borderRadius: theme.radius.lg,
          padding: '11px 16px',
          cursor: 'pointer',
          color: '#414651',
          textAlign: 'left',
        }}
      >
        <AccordionChevron open={open} />
        <span style={{ fontSize: 18, fontWeight: 600 }}>{title}</span>
      </button>
      {open && (
        <div style={{ padding: '20px 4px 4px' }}>
          {empty ? (
            <div style={{ fontSize: 13, color: theme.color.textSubtle, padding: '8px 12px' }}>
              No items configured for this category yet.
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}

export default function Library() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    trackPageVisit('library');
  }, []);

  const goVersions = () => {
    trackClick('open_versions_from_banner', { source: 'discovery_banner' });
    navigate('/versions');
  };

  const openEmail = () => {
    trackClick('open_email_card');
    navigate('/versions');
  };

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Guest Touchpoints', 'Pre-Arrival Communications']}
    >
      <main style={{ flex: 1, padding: '24px 32px 56px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1340, margin: '0 auto' }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
            <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0, letterSpacing: -0.3, color: theme.color.text }}>
              Library for The Ritz-Carlton, Amelia Island{' '}
              <span style={{ color: theme.color.textMuted, fontWeight: 400 }}>(JAXAM)</span>
            </h1>
            <button
              onClick={() => trackClick('change_property')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: '#FFFFFF',
                color: theme.color.link,
                border: `1px solid ${theme.color.borderStrong}`,
                borderRadius: 5,
                padding: '9px 16px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Change Property <ChevronDown />
            </button>
          </div>

          {/* Toolbar: search + create */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: '0 1 400px', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 12, color: theme.color.textMuted, display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                style={{
                  width: '100%',
                  height: 40,
                  padding: '0 12px 0 36px',
                  border: `1px solid ${theme.color.borderStrong}`,
                  borderRadius: theme.radius.sm,
                  fontSize: 14,
                  background: '#FFFFFF',
                  color: theme.color.text,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <PrimaryButton onClick={() => { trackClick('create_new_from_library'); navigate('/versions'); }}>
                Create New
              </PrimaryButton>
            </div>
          </div>

          {/* Filter pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <FilterPill label="Show All (27)" active={filter === 'all'} onClick={() => setFilter('all')} />
            <div style={{ width: 1, height: 22, background: theme.color.borderStrong }} />
            <FilterPill label="Active (4)" active={filter === 'active'} onClick={() => setFilter('active')} />
            <FilterPill label="Inactive (23)" active={filter === 'inactive'} onClick={() => setFilter('inactive')} />
            <FilterPill label="Expired (2)" active={filter === 'expired'} onClick={() => setFilter('expired')} />
          </div>

          {/* Pre-Arrival Communications */}
          <AccordionSection title="Pre-Arrival Communications" defaultOpen>
            <AudienceVersionsBanner onGetStarted={goVersions} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: theme.color.text }}>Channels</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.color.textMuted,
                  background: '#EFEFEF',
                  borderRadius: theme.radius.pill,
                  padding: '1px 8px',
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                2
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20, maxWidth: 900 }}>
              <ChannelCard
                title="Email"
                thumbnail={<EmailMiniThumb />}
                draftDate="April 16, 2026"
                publishedDate="April 16, 2026"
                ctaLabel="Manage Versions"
                onOpen={openEmail}
                onManage={openEmail}
              />
              <ChannelCard
                title="Travel Planner Form"
                thumbnail={<FormMiniThumb />}
                draftDate="March 30, 2026"
                publishedDate="March 30, 2026"
                ctaLabel="Manage"
                onOpen={() => trackClick('open_travel_planner_card')}
                onManage={() => trackClick('manage_travel_planner')}
              />
            </div>
          </AccordionSection>

          {/* Other categories — collapsed by default, matching Figma */}
          <AccordionSection title="Property Features" empty />
          <AccordionSection title="Dining" empty />
          <AccordionSection title="Experiences" empty />
        </div>
      </main>
    </Shell>
  );
}
