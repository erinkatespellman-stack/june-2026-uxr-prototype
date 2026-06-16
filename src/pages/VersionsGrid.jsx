import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import VersionCard from '../components/VersionCard';
import theme from '../theme';
import { trackPageVisit, trackClick } from '../tracking/sessionTracker';
import { useVersions, deleteVersion } from '../store/versionsStore';

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 14 14" fill="none" aria-hidden style={{ flexShrink: 0 }}>
      <path d="M7 1.2 8.1 4.4 11.3 5.5 8.1 6.6 7 9.8 5.9 6.6 2.7 5.5 5.9 4.4 7 1.2Z" fill="#FFFFFF" />
      <path d="m11 9 .5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5L11 9Z" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

// Blue discovery banner — moved here from the main Library (it's about email
// versions, not amenities). "Get Started" kicks off the new-version flow.
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
        marginBottom: 22,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 10, background: theme.color.aiBlueAccent, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SparkleIcon />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.text }}>Audience versions are now available</div>
          <div style={{ fontSize: 13, color: theme.color.textMuted, lineHeight: 1.5, maxWidth: 620 }}>
            Create tailored email versions for specific guest segments, starting with RC Club. Customize the welcome, amenities, and more for Club members.
          </div>
        </div>
      </div>
      <PrimaryButton onClick={onGetStarted}>Get Started</PrimaryButton>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon }) {
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
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        transition: `background ${theme.motion.fast}`,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

function FilterSelect({ value, onChange, options, label }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{
          background: '#FFFFFF',
          border: `1px solid ${theme.color.borderStrong}`,
          borderRadius: theme.radius.md,
          padding: '8px 12px',
          fontSize: 13,
          fontWeight: 500,
          color: theme.color.text,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 180,
          justifyContent: 'space-between',
        }}
      >
        <span style={{ color: theme.color.textMuted, fontSize: 12, fontWeight: 500 }}>{label}:</span>
        <span style={{ flex: 1, textAlign: 'left' }}>{value}</span>
        <ChevronDown />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 38,
            left: 0,
            minWidth: 200,
            background: '#FFFFFF',
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadow.overlay,
            padding: '4px 0',
            zIndex: 5,
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              onMouseDown={() => { onChange(opt); setOpen(false); }}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                background: opt === value ? '#F4F8FE' : 'transparent',
                border: 'none',
                padding: '8px 14px',
                fontSize: 13,
                color: theme.color.text,
                cursor: 'pointer',
                fontWeight: opt === value ? 600 : 500,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VersionsGrid() {
  const navigate = useNavigate();
  const versions = useVersions();
  const [query, setQuery] = useState('');
  const [persona, setPersona] = useState('All Personas');
  const [sort, setSort] = useState('Recently Edited');

  useEffect(() => {
    trackPageVisit('versions_grid');
  }, []);

  // Email · Audience Versions starts with only the Default version; RC Club
  // appears here once it is published through the flow (exists flag).
  const filtered = versions.filter((v) => {
    if (!v.exists) return false;
    if (persona !== 'All Personas' && v.persona !== persona) return false;
    if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const createNew = () => {
    trackClick('open_choose_audience');
    navigate('/versions/audience');
  };

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Pre-Arrival Communications', 'Email', 'Versions']}
    >
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1340, margin: '0 auto' }}>
          {/* Page header */}
          <div style={{ marginBottom: 20 }}>
            <button
              onClick={() => { trackClick('back_to_library'); navigate('/'); }}
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
              ← Pre-Arrival Communications
            </button>
            <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>Email · Audience Versions</h1>
            <p style={{ fontSize: 13.5, color: theme.color.textMuted, margin: '8px 0 0', maxWidth: 640, lineHeight: 1.5 }}>
              Each version is sent to a specific guest segment. Guests outside any version receive the default.
            </p>
          </div>

          <AudienceVersionsBanner onGetStarted={createNew} />

          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '0 1 320px', display: 'flex', alignItems: 'center' }}>
              <span style={{ position: 'absolute', left: 11, color: theme.color.textMuted, display: 'flex' }}><SearchIcon /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 32px',
                  border: `1px solid ${theme.color.borderStrong}`,
                  borderRadius: theme.radius.md,
                  fontSize: 13,
                  background: '#FFFFFF',
                  color: theme.color.text,
                  outline: 'none',
                }}
              />
            </div>
            <FilterSelect label="Persona" value={persona} onChange={setPersona} options={['All Personas', 'Default', 'RC Club', 'Family', 'Wedding Block', 'Repeat']} />
            <FilterSelect label="Sort" value={sort} onChange={setSort} options={['Recently Edited', 'Name (A–Z)', 'Status']} />
            <div style={{ marginLeft: 'auto' }}>
              <PrimaryButton icon={<PlusIcon />} onClick={createNew}>Create New Version</PrimaryButton>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 22 }}>
            {filtered.map((v) => (
              <VersionCard
                key={v.key}
                name={v.name}
                status={v.status}
                scheduledAt={v.scheduledAt}
                lastEdited={v.lastEdited}
                variant={v.variant}
                onOpen={() => { trackClick('open_version', { version: v.key }); navigate('/versions/rc-club'); }}
                onEdit={() => { trackClick('edit_version', { version: v.key }); navigate('/versions/rc-club'); }}
                onDelete={() => {
                  trackClick('delete_version', { version: v.key });
                  if (window.confirm(`Delete the "${v.name}" version?`)) deleteVersion(v.key);
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </Shell>
  );
}
