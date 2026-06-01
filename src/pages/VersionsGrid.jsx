import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import VersionCard from '../components/VersionCard';
import theme from '../theme';
import { trackPageVisit, trackClick, trackPathChosen } from '../tracking/sessionTracker';
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

function PrimaryButton({ children, onClick, icon, disabled }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      disabled={disabled}
      style={{
        background: disabled ? '#E5E5E5' : hover ? theme.color.primaryHover : theme.color.primary,
        color: disabled ? '#9A9A9A' : '#FFFFFF',
        border: 'none',
        borderRadius: theme.radius.md,
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
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
              onMouseDown={() => {
                onChange(opt);
                setOpen(false);
              }}
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

function CreateNewModal({ open, onClose, onPickPath }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,26,34,0.45)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 160ms ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          width: 560,
          maxWidth: '90vw',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadow.modal,
          padding: 32,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Create a new version</div>
        <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 22 }}>
          Choose how you'd like to build this audience version.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            {
              key: 'rc-club',
              title: 'RC Club',
              desc: 'AI generates a personalized version using Ritz-Carlton Club brand guidelines.',
              tag: 'AI-assisted',
              tagColor: theme.color.primary,
            },
            {
              key: 'configure',
              title: 'Build a custom audience',
              desc: 'Use guided configuration to define rules for a custom guest segment.',
              tag: 'Guided',
              tagColor: '#7B5A1A',
            },
            {
              key: 'blank',
              title: 'Start from scratch',
              desc: 'Duplicate the default template and edit manually — no AI assistance.',
              tag: 'Manual',
              tagColor: theme.color.textMuted,
              disabled: true,
            },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={opt.disabled ? undefined : () => onPickPath(opt.key)}
              disabled={opt.disabled}
              aria-disabled={opt.disabled}
              style={{
                textAlign: 'left',
                background: opt.disabled ? '#F7F7F7' : '#FFFFFF',
                border: `1px solid ${theme.color.border}`,
                borderRadius: theme.radius.md,
                padding: 16,
                cursor: opt.disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 16,
                opacity: opt.disabled ? 0.55 : 1,
                transition: `border-color ${theme.motion.fast}, background ${theme.motion.fast}`,
              }}
              onMouseEnter={(e) => {
                if (opt.disabled) return;
                e.currentTarget.style.borderColor = theme.color.primary;
                e.currentTarget.style.background = '#F8FBFF';
              }}
              onMouseLeave={(e) => {
                if (opt.disabled) return;
                e.currentTarget.style.borderColor = theme.color.border;
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{opt.title}</span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: opt.tagColor,
                      background: `${opt.tagColor}15`,
                      padding: '2px 7px',
                      borderRadius: theme.radius.pill,
                      letterSpacing: 0.4,
                      textTransform: 'uppercase',
                    }}
                  >
                    {opt.tag}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.5 }}>
                  {opt.desc}
                </div>
              </div>
              <span style={{ color: theme.color.textMuted, fontSize: 20 }}>›</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 22, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.color.textMuted,
              fontSize: 13,
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VersionsGrid() {
  const navigate = useNavigate();
  const versions = useVersions();
  const [query, setQuery] = useState('');
  const [persona, setPersona] = useState('All personas');
  const [sort, setSort] = useState('Recently edited');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(() => new Set());

  useEffect(() => {
    trackPageVisit('versions_grid');
  }, []);

  const toggleSelect = (key) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      trackClick('toggle_version_selection', { key, selected: next.has(key) });
      return next;
    });
  };

  const filtered = versions.filter((v) => {
    if (persona !== 'All personas' && v.persona !== persona) return false;
    if (query && !v.name.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const handlePickPath = (key) => {
    setModalOpen(false);
    trackPathChosen(key);
    trackClick('new_version_path', { path: key });
    if (key === 'rc-club') navigate('/versions/rc-club');
    else if (key === 'configure') navigate('/versions/configure');
    else navigate('/versions/rc-club');
  };

  const compareReady = selected.size === 2;
  const tooManySelected = selected.size > 2;

  const handleCompare = () => {
    if (!compareReady) return;
    const keys = Array.from(selected);
    trackClick('compare_versions', { keys });
    navigate(`/versions/compare?left=${keys[0]}&right=${keys[1]}`);
  };

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Pre-Arrival Communications', 'Email', 'Versions']}
      headerRight={
        <PrimaryButton
          onClick={handleCompare}
          disabled={!compareReady}
        >
          Compare versions{selected.size > 0 ? ` (${selected.size})` : ''}
        </PrimaryButton>
      }
    >
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1340, margin: '0 auto' }}>
          {/* Page header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <button
                onClick={() => {
                  trackClick('back_to_library');
                  navigate('/');
                }}
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
              <h1 style={{ fontSize: 26, fontWeight: 600, margin: 0, letterSpacing: -0.3 }}>
                Email · Audience Versions
              </h1>
              <p style={{ fontSize: 13.5, color: theme.color.textMuted, margin: '8px 0 0', maxWidth: 640, lineHeight: 1.5 }}>
                Each version is sent to a specific guest segment. Guests outside any version receive the default.
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 8,
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                position: 'relative',
                flex: '0 1 320px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ position: 'absolute', left: 11, color: theme.color.textMuted, display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search versions"
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
            <FilterSelect
              label="Persona"
              value={persona}
              onChange={setPersona}
              options={['All personas', 'Default', 'RC Club', 'Family', 'Wedding Block', 'Repeat']}
            />
            <FilterSelect
              label="Sort"
              value={sort}
              onChange={setSort}
              options={['Recently edited', 'Name (A–Z)', 'Status']}
            />
            <div style={{ marginLeft: 'auto' }}>
              <PrimaryButton
                icon={<PlusIcon />}
                onClick={() => {
                  trackClick('open_create_version_modal');
                  setModalOpen(true);
                }}
              >
                Create New Version
              </PrimaryButton>
            </div>
          </div>

          {/* Selection hint */}
          <div style={{ minHeight: 22, marginBottom: 14 }}>
            {tooManySelected && (
              <div style={{ fontSize: 12.5, color: theme.color.warning, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: theme.color.warning,
                    color: '#FFFFFF',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  !
                </span>
                Select exactly 2 versions to compare. You have {selected.size} selected.
              </div>
            )}
            {selected.size === 1 && (
              <div style={{ fontSize: 12.5, color: theme.color.textMuted }}>
                1 version selected · pick one more to enable Compare.
              </div>
            )}
            {compareReady && (
              <div style={{ fontSize: 12.5, color: theme.color.primary, fontWeight: 500 }}>
                2 versions selected · ready to compare.
              </div>
            )}
          </div>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 22,
            }}
          >
            {filtered.map((v) => (
              <VersionCard
                key={v.key}
                name={v.name}
                persona={v.persona}
                status={v.status}
                scheduledAt={v.scheduledAt}
                lastEdited={v.lastEdited}
                variant={v.variant}
                selected={selected.has(v.key)}
                onToggleSelect={() => toggleSelect(v.key)}
                onOpen={() => {
                  trackClick('open_version', { version: v.key });
                  if (v.key === 'rc-club') navigate('/versions/rc-club?from=existing');
                }}
                onEdit={() => {
                  trackClick('edit_version', { version: v.key });
                  if (v.key === 'rc-club') navigate('/versions/rc-club?from=existing');
                }}
                onDuplicate={() => trackClick('duplicate_version', { version: v.key })}
                onDelete={() => trackClick('delete_version', { version: v.key })}
              />
            ))}
          </div>
        </div>
      </main>

      <CreateNewModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPickPath={handlePickPath}
      />
    </Shell>
  );
}
