import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import EmailPreview from '../components/EmailPreview';
import MicroSurvey from '../components/MicroSurvey';
import theme from '../theme';
import {
  trackPageVisit,
  trackClick,
  trackAIInteraction,
  trackSurveyResponse,
} from '../tracking/sessionTracker';
import {
  useRCClubState,
  acceptSection,
  rejectSection,
  startEditingSection,
  finishEditingSection,
  cancelEditing,
  setSectionContent,
} from '../store/rcClubStore';
import { publishVersion } from '../store/versionsStore';
import { DEFAULT_CONTENT, LIBRARY_IMAGES } from '../content/emailContent';

function PrimaryButton({ children, onClick, style, disabled }) {
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
        padding: '9px 18px',
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: `background ${theme.motion.fast}`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? '#F4F4F4' : '#FFFFFF',
        color: theme.color.text,
        border: `1px solid ${theme.color.borderStrong}`,
        borderRadius: theme.radius.pill,
        padding: '8px 16px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: `background ${theme.motion.fast}`,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Tabs({ active, onSelect }) {
  const tabs = [
    { key: 'default', label: 'Default' },
    { key: 'rc-club', label: 'RC Club' },
    { key: 'compare', label: 'Compare' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4, background: '#F0F0F0', padding: 3, borderRadius: theme.radius.md }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onSelect(t.key)}
          style={{
            background: active === t.key ? '#FFFFFF' : 'transparent',
            color: active === t.key ? theme.color.text : theme.color.textMuted,
            border: 'none',
            padding: '6px 18px',
            borderRadius: theme.radius.sm,
            fontSize: 12.5,
            fontWeight: active === t.key ? 600 : 500,
            cursor: 'pointer',
            boxShadow: active === t.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
            transition: `all ${theme.motion.fast}`,
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SparkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
      <path d="M6 1 7.1 4.4 10.5 5.5 7.1 6.6 6 10 4.9 6.6 1.5 5.5 4.9 4.4Z" />
    </svg>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { label: 'AI suggested', bg: '#F1EAFB', color: '#7A4DD0' },
    accepted: { label: 'Accepted', bg: '#E7F4EC', color: theme.color.success },
    rejected: { label: 'Reverted to default', bg: '#F0F0F0', color: '#6E6E6E' },
    editing: { label: 'Editing…', bg: '#EAF1FB', color: theme.color.primary },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        padding: '3px 8px',
        borderRadius: theme.radius.pill,
        letterSpacing: 0.3,
      }}
    >
      {s.label}
    </span>
  );
}

// ──────── Right sidebar — RC Club recommendations overview (screen 8) ────────

function OverviewSidebar({ sections }) {
  const sectionRows = [
    { key: 'hero', label: 'Hero image' },
    { key: 'body', label: 'Body text' },
    { key: 'amenities', label: 'Amenities' },
  ];

  return (
    <>
      <div style={{ padding: '20px 22px 18px', borderBottom: `1px solid ${theme.color.border}` }}>
        <div style={{ marginBottom: 10 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 10,
              fontWeight: 700,
              color: '#FFFFFF',
              background: '#7A4DD0',
              padding: '4px 10px',
              borderRadius: theme.radius.pill,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}
          >
            <SparkIcon /> RC Club Recommendations
          </span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.text }}>RC Club version</div>
        <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>
          Hover over any blue-bordered section to Accept, Edit, or Reject the suggested content.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sectionRows.map((s) => {
          const sec = sections[s.key];
          return (
            <div key={s.key} style={{ borderBottom: `1px solid ${theme.color.border}`, padding: '16px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.text }}>{s.label}</div>
                <StatusPill status={sec.status} />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  disabled={sec.status === 'accepted'}
                  onClick={() => {
                    trackClick('sidebar_accept', { section: s.key });
                    trackAIInteraction('accept_section', { section: s.key });
                    acceptSection(s.key);
                  }}
                  style={{
                    background: sec.status === 'accepted' ? '#F0F0F0' : '#E7F4EC',
                    color: sec.status === 'accepted' ? '#9A9A9A' : theme.color.success,
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: theme.radius.sm,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: sec.status === 'accepted' ? 'default' : 'pointer',
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    trackClick('sidebar_edit', { section: s.key });
                    trackAIInteraction('edit_section', { section: s.key });
                    startEditingSection(s.key);
                  }}
                  style={{
                    background: '#EAF1FB',
                    color: theme.color.primary,
                    border: 'none',
                    padding: '6px 14px',
                    borderRadius: theme.radius.sm,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit
                </button>
                <button
                  disabled={sec.status === 'rejected'}
                  onClick={() => {
                    trackClick('sidebar_reject', { section: s.key });
                    trackAIInteraction('reject_section', { section: s.key });
                    rejectSection(s.key);
                  }}
                  style={{
                    background: sec.status === 'rejected' ? '#F0F0F0' : 'transparent',
                    color: sec.status === 'rejected' ? '#9A9A9A' : theme.color.textMuted,
                    border: `1px solid ${theme.color.borderStrong}`,
                    padding: '5px 14px',
                    borderRadius: theme.radius.sm,
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: sec.status === 'rejected' ? 'default' : 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ padding: '18px 22px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: theme.color.text, marginBottom: 6 }}>Audience</div>
          <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.5 }}>
            Guests with an RC Club room category on the booking record.
            <span style={{ color: theme.color.text, fontWeight: 600, marginLeft: 4 }}>~84 guests / month</span>
          </div>
        </div>
      </div>
    </>
  );
}

// ──────── Shared editor panel chrome ────────

function PanelPencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="m2.5 9 .4-1.8L8 1.6l1.5 1.4-5 5.6L2.5 9Z" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7.1 2.5 8.6 4" stroke="#FFFFFF" strokeWidth="1.2" />
    </svg>
  );
}

function PanelHeader({ section, helper }) {
  return (
    <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${theme.color.border}` }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: theme.color.success,
          color: '#FFFFFF',
          borderRadius: theme.radius.sm,
          padding: '4px 11px',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: 0.2,
        }}
      >
        <PanelPencilIcon /> Currently Editing
      </span>
      <div style={{ fontSize: 22, fontWeight: 600, color: theme.color.text, marginTop: 14, letterSpacing: -0.2 }}>
        {section}
      </div>
      {helper && <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>{helper}</div>}
    </div>
  );
}

function PanelFooter({ onCancel, onDone, doneLabel = 'Save changes' }) {
  return (
    <div style={{ padding: 16, borderTop: `1px solid ${theme.color.border}`, background: '#FAFAFA', display: 'flex', gap: 8 }}>
      <GhostButton onClick={onCancel} style={{ flex: 1, borderRadius: theme.radius.md, textAlign: 'center' }}>
        Cancel
      </GhostButton>
      <PrimaryButton onClick={onDone} style={{ flex: 1 }}>
        {doneLabel}
      </PrimaryButton>
    </div>
  );
}

// ──────── Right sidebar — Hero image picker (screen 7) ────────

function ImageEditPanel({ currentImage, onPick, onDone, onCancel }) {
  return (
    <>
      <PanelHeader
        section="Image"
        helper={
          <>
            Select an image from the library below. To upload a new image, visit{' '}
            <span style={{ color: theme.color.link, fontWeight: 600 }}>DAC</span>.
          </>
        }
      />

      <div style={{ padding: '16px 18px', flex: 1, overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `1px solid ${theme.color.borderStrong}`,
            borderRadius: theme.radius.md,
            padding: '8px 12px',
            fontSize: 13,
            color: theme.color.textMuted,
            marginBottom: 14,
          }}
        >
          Category
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {LIBRARY_IMAGES.map((img) => {
            const active = img.src === currentImage;
            return (
              <button
                key={img.key}
                onClick={() => {
                  trackClick('pick_hero_image', { image: img.key });
                  onPick(img.src);
                }}
                style={{
                  position: 'relative',
                  padding: 0,
                  border: active ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`,
                  borderRadius: theme.radius.md,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  background: '#F0F0F0',
                }}
              >
                <img src={img.src} alt={img.key} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {img.topPick && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      left: 5,
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: '#FFFFFF',
                      background: '#7A4DD0',
                      padding: '2px 6px',
                      borderRadius: theme.radius.pill,
                      letterSpacing: 0.4,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <SparkIcon /> TOP PICK
                  </span>
                )}
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: theme.color.primary,
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                    }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <PanelFooter onCancel={onCancel} onDone={onDone} />
    </>
  );
}

// ──────── Right sidebar — Body editor (screen 9) ────────

function BodyEditPanel({ value = '', onChange, onDone, onCancel }) {
  const max = 1200;
  return (
    <>
      <PanelHeader section="Body" helper="Optionally use this field to add a custom message from your property." />
      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: theme.color.text }}>Body</label>
          <span style={{ fontSize: 12, color: '#C4C4C4' }}>{value.length} of {max} characters</span>
        </div>
        <textarea
          value={value}
          maxLength={max}
          onChange={(e) => onChange && onChange(e.target.value)}
          rows={16}
          style={{
            width: '100%',
            border: `1px solid ${theme.color.borderStrong}`,
            borderRadius: 5,
            padding: '12px 14px',
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'inherit',
            color: theme.color.text,
            outline: 'none',
            resize: 'vertical',
            background: '#FFFFFF',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = theme.color.link)}
          onBlur={(e) => (e.currentTarget.style.borderColor = theme.color.borderStrong)}
        />
      </div>
      <PanelFooter onCancel={onCancel} onDone={onDone} />
    </>
  );
}

// ──────── Right sidebar — Amenities editor ────────

function AmenitiesEditPanel({ items, onChange, onDone, onCancel }) {
  const update = (i, patch) => onChange(items.map((item, idx) => (idx === i ? { ...item, ...patch } : item)));
  const move = (i, dir) => {
    const target = i + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[i], next[target]] = [next[target], next[i]];
    onChange(next);
    trackClick('reorder_amenity', { from: i, to: target });
  };
  const remove = (i) => {
    onChange(items.filter((_, idx) => idx !== i));
    trackClick('remove_amenity', { index: i });
  };

  return (
    <>
      <PanelHeader section="Amenities" helper="Reorder, edit, or remove the items shown in the amenities section." />
      <div style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={i} style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.md, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} style={iconBtnStyle(i === 0)} aria-label="Move up">▲</button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} style={iconBtnStyle(i === items.length - 1)} aria-label="Move down">▼</button>
              </div>
              <input
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
                style={{ flex: 1, border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.sm, padding: '5px 8px', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', outline: 'none' }}
              />
              <button onClick={() => remove(i)} style={{ background: 'transparent', border: 'none', color: theme.color.textMuted, cursor: 'pointer', fontSize: 16, padding: '2px 4px' }} aria-label="Remove amenity">×</button>
            </div>
            <textarea
              value={item.body}
              onChange={(e) => update(i, { body: e.target.value })}
              rows={3}
              style={{ width: '100%', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.sm, padding: '6px 8px', fontSize: 12, fontFamily: 'inherit', color: theme.color.text, lineHeight: 1.5, outline: 'none', resize: 'vertical' }}
            />
          </div>
        ))}
      </div>
      <PanelFooter onCancel={onCancel} onDone={onDone} />
    </>
  );
}

function iconBtnStyle(disabled) {
  return {
    background: '#F4F4F4',
    border: 'none',
    width: 18,
    height: 18,
    borderRadius: 3,
    cursor: disabled ? 'default' : 'pointer',
    color: disabled ? '#C8C8C8' : '#5A5A5A',
    fontSize: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  };
}

// ──────── Publish confirmation (screen 11) ────────

function PublishModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      onClick={onCancel}
      style={{ position: 'fixed', inset: 0, background: 'rgba(20,26,34,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 160ms ease-out' }}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#FFFFFF', width: 440, maxWidth: '90vw', borderRadius: theme.radius.xl, boxShadow: theme.shadow.modal, padding: 28, animation: 'modalRise 200ms ease-out' }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Publish RC Club Version?</div>
        <div style={{ fontSize: 13.5, color: theme.color.textMuted, lineHeight: 1.6, marginBottom: 22 }}>
          This will make the RC Club version live. Guests with RC Club bookings will start receiving this version.
          The Default version is not affected. Fields that inherit from Default will continue to stay in sync.
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <GhostButton onClick={onCancel} style={{ borderRadius: theme.radius.md }}>Cancel</GhostButton>
          <PrimaryButton onClick={onConfirm}>Publish version</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#102B1F', color: '#FFFFFF', padding: '12px 18px', borderRadius: theme.radius.md, boxShadow: theme.shadow.overlay, fontSize: 13, zIndex: 300, display: 'flex', alignItems: 'center', gap: 10, animation: 'surveyRise 220ms ease-out', whiteSpace: 'nowrap' }}
    >
      <span style={{ width: 18, height: 18, borderRadius: '50%', background: theme.color.success, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.2 4 7.2 8 3.2" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      {message}
    </div>
  );
}

// ──────── Sub-toolbar (screens 6–10) ────────

function EmailChip() {
  return (
    <span
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.sm, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: theme.color.text, background: '#FFFFFF' }}
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        <rect x="1.5" y="3" width="11" height="8" rx="1.2" stroke={theme.color.textMuted} strokeWidth="1.1" />
        <path d="m2 4 5 3.5L12 4" stroke={theme.color.textMuted} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Pre Arrival Email
    </span>
  );
}

// ──────── Main editor ────────

export default function RCClubFlow() {
  const navigate = useNavigate();
  const rcState = useRCClubState();

  const [activeTab, setActiveTab] = useState('rc-club');
  const [publishing, setPublishing] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [toast, setToast] = useState(null);
  const surveyShownRef = useRef(false);

  // Show the research micro-survey once per editor visit — fires as soon as the
  // generated version is on screen (and earlier if they accept/edit/reject).
  const triggerSurvey = () => {
    if (surveyShownRef.current) return;
    surveyShownRef.current = true;
    setShowSurvey(true);
  };

  useEffect(() => {
    trackPageVisit('rc_club_editor');
    const t = setTimeout(triggerSurvey, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAccept = (key) => {
    trackAIInteraction('accept_section', { section: key });
    acceptSection(key);
    triggerSurvey();
  };
  const handleReject = (key) => {
    trackAIInteraction('reject_section', { section: key });
    rejectSection(key);
    triggerSurvey();
  };
  const handleEdit = (key) => {
    trackAIInteraction('edit_section', { section: key });
    startEditingSection(key);
    triggerSurvey();
  };

  const resolvedSections = useMemo(() => {
    if (activeTab === 'default') {
      return {
        hero: { status: 'static', content: DEFAULT_CONTENT.hero },
        body: { status: 'static', content: DEFAULT_CONTENT.body },
        amenities: { status: 'static', content: DEFAULT_CONTENT.amenities },
      };
    }
    return rcState.sections;
  }, [activeTab, rcState.sections]);

  const editingKey = rcState.editingKey;
  const isCompare = activeTab === 'compare';
  const showSidebar = activeTab === 'rc-club';

  const staticDefault = {
    hero: { status: 'static', content: DEFAULT_CONTENT.hero },
    body: { status: 'static', content: DEFAULT_CONTENT.body },
    amenities: { status: 'static', content: DEFAULT_CONTENT.amenities },
  };
  const staticRC = {
    hero: { status: 'static', content: rcState.sections.hero.content },
    body: { status: 'static', content: rcState.sections.body.content },
    amenities: { status: 'static', content: rcState.sections.amenities.content },
  };

  return (
    <Shell propertyName="The Ritz-Carlton, Amelia Island" propertyCode="AXAM" breadcrumbs={['Email', 'Versions', 'RC Club']}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', minWidth: 0 }}>
        {/* Sub-toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '12px 24px',
            background: '#FFFFFF',
            borderBottom: `1px solid ${theme.color.border}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => { trackClick('back_to_library_from_editor'); navigate('/'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: theme.color.text, fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}
          >
            ‹ Back to Library
          </button>
          <EmailChip />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Tabs active={activeTab} onSelect={(k) => { setActiveTab(k); trackClick('switch_version_tab', { tab: k }); }} />
          </div>
          <GhostButton onClick={() => { trackClick('send_sample'); setToast('Sample sent to your inbox.'); }}>Send a Sample</GhostButton>
          <GhostButton onClick={() => { trackClick('save_draft'); setToast('Draft saved.'); }}>Save as Draft</GhostButton>
          <PrimaryButton onClick={() => { trackClick('open_publish_modal'); setPublishing(true); }} style={{ borderRadius: theme.radius.pill, padding: '9px 20px' }}>
            Publish Now
          </PrimaryButton>
        </div>

        {/* Body: editor (main + sidebar) or compare (two columns) */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
          {isCompare ? (
            <main style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 60px', background: theme.color.appBg }}>
              <div style={{ display: 'flex', gap: 28, justifyContent: 'center', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {[
                  { label: 'Default', sections: staticDefault },
                  { label: 'RC Club', sections: staticRC },
                ].map((col) => (
                  <div key={col.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.textMuted, letterSpacing: 0.4, textTransform: 'uppercase' }}>{col.label}</div>
                    <EmailPreview sectionStatus={col.sections} content={DEFAULT_CONTENT} width={440} />
                  </div>
                ))}
              </div>
            </main>
          ) : (
            <>
              <main style={{ flex: 1, overflowY: 'auto', padding: '32px 32px 80px', background: theme.color.appBg, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: 720 }}>
                  <EmailPreview
                    sectionStatus={resolvedSections}
                    content={DEFAULT_CONTENT}
                    onAccept={handleAccept}
                    onEdit={handleEdit}
                    onReject={handleReject}
                    width={680}
                  />
                  <div style={{ marginTop: 18, textAlign: 'center', fontSize: 11.5, color: theme.color.textSubtle }}>
                    Preview · sent on guest's behalf 7 days before arrival
                  </div>
                </div>
              </main>

              {showSidebar && (
                <aside style={{ width: 360, background: theme.color.surface, borderLeft: `1px solid ${theme.color.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
                  {editingKey === 'hero' && (
                    <ImageEditPanel
                      currentImage={rcState.sections.hero.content.image}
                      onPick={(image) => setSectionContent('hero', { ...rcState.sections.hero.content, image })}
                      onDone={() => { trackClick('finish_editing_hero'); finishEditingSection('hero'); }}
                      onCancel={() => { trackClick('cancel_editing_hero'); cancelEditing(); }}
                    />
                  )}
                  {editingKey === 'body' && (
                    <BodyEditPanel
                      value={rcState.sections.body.content}
                      onChange={(v) => { trackAIInteraction('body_text_changed'); setSectionContent('body', v); }}
                      onDone={() => { trackClick('finish_editing_body'); finishEditingSection('body'); }}
                      onCancel={() => { trackClick('cancel_editing_body'); cancelEditing(); }}
                    />
                  )}
                  {editingKey === 'amenities' && (
                    <AmenitiesEditPanel
                      items={rcState.sections.amenities.content.items}
                      onChange={(items) => setSectionContent('amenities', { ...rcState.sections.amenities.content, items })}
                      onDone={() => { trackClick('finish_editing_amenities'); finishEditingSection('amenities'); }}
                      onCancel={() => { trackClick('cancel_editing_amenities'); cancelEditing(); }}
                    />
                  )}
                  {!editingKey && <OverviewSidebar sections={rcState.sections} />}
                </aside>
              )}
            </>
          )}
        </div>
      </div>

      <PublishModal
        open={publishing}
        onCancel={() => { trackClick('cancel_publish'); setPublishing(false); }}
        onConfirm={() => {
          trackClick('confirm_publish');
          trackAIInteraction('publish_version', { version: 'rc-club' });
          publishVersion('rc-club');
          navigate('/versions');
        }}
      />

      {showSurvey && (
        <MicroSurvey
          onAnswer={(label) => trackSurveyResponse('RC Club version — how did that feel?', label)}
          onDismiss={() => setShowSurvey(false)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </Shell>
  );
}
