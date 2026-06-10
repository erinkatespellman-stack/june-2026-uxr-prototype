import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import VersionCard from '../components/VersionCard';
import theme from '../theme';
import { trackPageVisit, trackClick } from '../tracking/sessionTracker';
import { useVersions } from '../store/versionsStore';

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
                persona={v.persona}
                status={v.status}
                scheduledAt={v.scheduledAt}
                lastEdited={v.lastEdited}
                variant={v.variant}
                onOpen={() => trackClick('open_version', { version: v.key })}
                onEdit={() => trackClick('edit_version', { version: v.key })}
                onDuplicate={() => trackClick('duplicate_version', { version: v.key })}
                onDelete={() => trackClick('delete_version', { version: v.key })}
              />
            ))}
          </div>
        </div>
      </main>
    </Shell>
  );
}
