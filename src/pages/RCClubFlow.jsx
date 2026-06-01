import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import EmailPreview from '../components/EmailPreview';
import AILoader from '../components/AILoader';
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
import { updateVersion } from '../store/versionsStore';
import { DEFAULT_CONTENT, HERO_VARIANTS } from '../content/emailContent';

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
        borderRadius: theme.radius.md,
        padding: '8px 14px',
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: `background ${theme.motion.fast}`,
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
            padding: '6px 16px',
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
    pending: { label: 'AI suggested', bg: theme.color.aiBlueBg, color: theme.color.primary },
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

// ──────── Right sidebar — overview ────────

function OverviewSidebar({ sections, onPublish, onRevert }) {
  const sectionRows = [
    { key: 'hero', label: 'Hero image' },
    { key: 'body', label: 'Body text' },
    { key: 'amenities', label: 'Amenities' },
  ];

  return (
    <>
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${theme.color.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 10,
              fontWeight: 700,
              color: theme.color.primary,
              background: theme.color.aiBlueBg,
              padding: '3px 8px',
              borderRadius: theme.radius.pill,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}
          >
            <SparkIcon /> AI-generated
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.text }}>RC Club version</div>
        <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 4, lineHeight: 1.45 }}>
          Hover over any blue-bordered section to Accept, Edit, or Reject the AI's suggestion.
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sectionRows.map((s) => {
          const sec = sections[s.key];
          return (
            <div key={s.key} style={{ borderBottom: `1px solid ${theme.color.border}`, padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
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
                    padding: '5px 10px',
                    borderRadius: theme.radius.sm,
                    fontSize: 11.5,
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
                    padding: '5px 10px',
                    borderRadius: theme.radius.sm,
                    fontSize: 11.5,
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
                    padding: '4px 10px',
                    borderRadius: theme.radius.sm,
                    fontSize: 11.5,
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

        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, marginBottom: 4 }}>Audience</div>
          <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.5 }}>
            Sent to guests with an RC Club room category on the booking record.
            <span style={{ color: theme.color.text, fontWeight: 600, marginLeft: 4 }}>
              ~84 guests / month
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${theme.color.border}`,
          background: '#FAFAFA',
          display: 'flex',
          gap: 8,
        }}
      >
        <GhostButton onClick={onRevert} style={{ flex: 1 }}>
          Discard
        </GhostButton>
        <PrimaryButton onClick={onPublish} style={{ flex: 1 }}>
          Review & Publish
        </PrimaryButton>
      </div>
    </>
  );
}

// ──────── Right sidebar — shared editor chrome (matches Figma editor panel) ────────

function PanelPencilIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="m2.5 9 .4-1.8L8 1.6l1.5 1.4-5 5.6L2.5 9Z" stroke="#FFFFFF" strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M7.1 2.5 8.6 4" stroke="#FFFFFF" strokeWidth="1.2" />
    </svg>
  );
}

// Figma: green "Currently Editing" pill + 24px section title + helper line.
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
      {helper && (
        <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>
          {helper}
        </div>
      )}
    </div>
  );
}

function PanelFooter({ onCancel, onDone, doneLabel = 'Done' }) {
  return (
    <div
      style={{
        padding: 16,
        borderTop: `1px solid ${theme.color.border}`,
        background: '#FAFAFA',
        display: 'flex',
        gap: 8,
      }}
    >
      <GhostButton onClick={onCancel} style={{ flex: 1 }}>
        Cancel
      </GhostButton>
      <PrimaryButton onClick={onDone} style={{ flex: 1 }}>
        {doneLabel}
      </PrimaryButton>
    </div>
  );
}

// ──────── Right sidebar — Hero editor ────────

function HeroEditPanel({ currentVariant, onPick, onDone, onCancel }) {
  return (
    <>
      <PanelHeader
        section="Hero Image"
        helper="Choose the imagery that appears at the top of this email. The preview updates in real time."
      />

      <div style={{ padding: 16, flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {HERO_VARIANTS.map((v) => {
            const active = v.key === currentVariant;
            return (
              <button
                key={v.key}
                onClick={() => {
                  trackClick('pick_hero_variant', { variant: v.key });
                  onPick(v.key);
                }}
                style={{
                  background: '#FFFFFF',
                  border: active ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`,
                  borderRadius: theme.radius.md,
                  padding: 6,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  transition: `border-color ${theme.motion.fast}`,
                }}
              >
                <div
                  style={{
                    aspectRatio: '4 / 3',
                    background: heroPreviewBg(v.key),
                    borderRadius: theme.radius.sm,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {active && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
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
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.color.text, padding: '0 4px' }}>
                  {v.label}
                </div>
                <div style={{ fontSize: 11, color: theme.color.textSubtle, padding: '0 4px 4px' }}>{v.note}</div>
              </button>
            );
          })}
        </div>
      </div>

      <PanelFooter onCancel={onCancel} onDone={onDone} />
    </>
  );
}

function heroPreviewBg(variant) {
  const gradients = {
    coast: 'linear-gradient(180deg, #3E6178 0%, #7FA2B8 60%, #D8C7A6 100%)',
    sunset: 'linear-gradient(180deg, #7A3A4D 0%, #D67F5A 60%, #E8D2A6 100%)',
    dawn: 'linear-gradient(180deg, #5B6F92 0%, #C8A8B5 60%, #E5D5B8 100%)',
    moonlit: 'linear-gradient(180deg, #16213F 0%, #34406A 60%, #7A776C 100%)',
  };
  return gradients[variant] || gradients.coast;
}

// ──────── Right sidebar — Body editor ────────

function BodyEditPanel({ value = '', onChange, onDone, onCancel, onRevertToDefault }) {
  const max = 1200;
  return (
    <>
      <PanelHeader
        section="Body"
        helper="Optionally use this field to add a custom message from your property."
      />

      <div style={{ padding: '18px 22px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: theme.color.text }}>Body</label>
          <span style={{ fontSize: 12, color: '#C4C4C4' }}>
            {value.length} of {max} characters
          </span>
        </div>
        <textarea
          value={value}
          maxLength={max}
          onChange={(e) => onChange && onChange(e.target.value)}
          rows={14}
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

        <button
          onClick={() => {
            trackClick('revert_body_to_default');
            onRevertToDefault();
          }}
          style={{
            marginTop: 14,
            width: '100%',
            background: 'transparent',
            color: theme.color.textMuted,
            border: `1px dashed ${theme.color.borderStrong}`,
            borderRadius: theme.radius.md,
            padding: 10,
            fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          Reset to default version's body
        </button>
      </div>

      <PanelFooter onCancel={onCancel} onDone={onDone} />
    </>
  );
}

// ──────── Right sidebar — Amenities editor ────────

function AmenitiesEditPanel({ items, onChange, onDone, onCancel }) {
  const update = (i, patch) => {
    const next = items.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
    onChange(next);
  };
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
  const add = () => {
    onChange([...items, { title: 'New amenity', body: 'Describe what guests receive.' }]);
    trackClick('add_amenity');
  };

  return (
    <>
      <PanelHeader
        section="Amenities"
        helper="Reorder, edit, or remove the items shown in the amenities section."
      />

      <div style={{ padding: 14, flex: 1, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              background: '#FFFFFF',
              border: `1px solid ${theme.color.border}`,
              borderRadius: theme.radius.md,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  style={iconBtnStyle(i === 0)}
                  aria-label="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  style={iconBtnStyle(i === items.length - 1)}
                  aria-label="Move down"
                >
                  ▼
                </button>
              </div>
              <input
                value={item.title}
                onChange={(e) => update(i, { title: e.target.value })}
                style={{
                  flex: 1,
                  border: `1px solid ${theme.color.borderStrong}`,
                  borderRadius: theme.radius.sm,
                  padding: '5px 8px',
                  fontSize: 12.5,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => remove(i)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.color.textMuted,
                  cursor: 'pointer',
                  fontSize: 16,
                  padding: '2px 4px',
                }}
                aria-label="Remove amenity"
              >
                ×
              </button>
            </div>
            <textarea
              value={item.body}
              onChange={(e) => update(i, { body: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                border: `1px solid ${theme.color.borderStrong}`,
                borderRadius: theme.radius.sm,
                padding: '6px 8px',
                fontSize: 12,
                fontFamily: 'inherit',
                color: theme.color.text,
                lineHeight: 1.5,
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>
        ))}
        <button
          onClick={add}
          style={{
            width: '100%',
            background: 'transparent',
            border: `1px dashed ${theme.color.borderStrong}`,
            borderRadius: theme.radius.md,
            padding: 10,
            fontSize: 12.5,
            color: theme.color.primary,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          + Add amenity
        </button>
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

// ──────── Schedule modal ────────

function pad(n) {
  return n.toString().padStart(2, '0');
}

function getDefaultScheduleDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;
}

function formatSchedule(dateStr, timeStr) {
  // dateStr "YYYY-MM-DD", timeStr "HH:MM"
  const dt = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(dt.getTime())) return `${dateStr} at ${timeStr}`;
  const dateOut = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const timeOut = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${dateOut} at ${timeOut} ET`;
}

function ScheduleModal({ open, onCancel, onConfirm }) {
  const [date, setDate] = useState(getDefaultScheduleDate());
  const [time, setTime] = useState('10:00');

  if (!open) return null;

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(20,26,34,0.5)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 160ms ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalRise { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          width: 480,
          maxWidth: '90vw',
          borderRadius: theme.radius.xl,
          boxShadow: theme.shadow.modal,
          padding: 28,
          animation: 'modalRise 200ms ease-out',
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Schedule RC Club Version</div>
        <div style={{ fontSize: 13.5, color: theme.color.textMuted, lineHeight: 1.55, marginBottom: 20 }}>
          Choose when this version begins sending to RC Club guests. The default version remains active for all other guests.
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 6, letterSpacing: 0.2 }}>
              SEND DATE
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: `1px solid ${theme.color.borderStrong}`,
                borderRadius: theme.radius.md,
                fontSize: 13,
                fontFamily: 'inherit',
                color: theme.color.text,
                outline: 'none',
                background: '#FFFFFF',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11.5, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 6, letterSpacing: 0.2 }}>
              SEND TIME
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                border: `1px solid ${theme.color.borderStrong}`,
                borderRadius: theme.radius.md,
                fontSize: 13,
                fontFamily: 'inherit',
                color: theme.color.text,
                outline: 'none',
                background: '#FFFFFF',
              }}
            />
          </div>
        </div>

        <div
          style={{
            background: '#F8FBFF',
            border: `1px solid ${theme.color.aiBlueBorder}`,
            borderRadius: theme.radius.md,
            padding: 12,
            marginBottom: 22,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color.primary }} />
          <div style={{ fontSize: 12.5, color: theme.color.text }}>
            Will send to <strong>14 RC Club guests</strong> on <strong>{formatSchedule(date, time)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <GhostButton onClick={onCancel}>Cancel</GhostButton>
          <PrimaryButton onClick={() => onConfirm({ date, time, formatted: formatSchedule(date, time) })}>
            Schedule
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

// ──────── Micro-survey ────────

function MicroSurvey({ onAnswer, onDismiss }) {
  const [answered, setAnswered] = useState(null);

  const options = [
    { key: 'too-automated', label: 'Too automated' },
    { key: 'just-right', label: 'Just right' },
    { key: 'more-control', label: 'More control' },
  ];

  const handlePick = (opt) => {
    setAnswered(opt.key);
    onAnswer(opt.label);
    setTimeout(onDismiss, 1200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: 28,
        transform: 'translateX(-50%)',
        zIndex: 90,
        background: '#FFFFFF',
        border: `1px solid ${theme.color.border}`,
        boxShadow: theme.shadow.overlay,
        borderRadius: theme.radius.xl,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        whiteSpace: 'nowrap',
        maxWidth: 'calc(100vw - 32px)',
        animation: 'surveyRise 320ms cubic-bezier(0.2,0,0.2,1)',
      }}
    >
      <style>{`
        @keyframes surveyRise { from { opacity: 0; transform: translate(-50%, 14px) } to { opacity: 1; transform: translate(-50%, 0) } }
      `}</style>
      <div style={{ fontSize: 13, fontWeight: 500, color: theme.color.text, marginRight: 4, whiteSpace: 'nowrap' }}>
        How did that feel?
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
        {options.map((opt) => {
          const isChosen = answered === opt.key;
          const isDimmed = answered && !isChosen;
          return (
            <button
              key={opt.key}
              disabled={!!answered}
              onClick={() => handlePick(opt)}
              style={{
                background: isChosen ? theme.color.primary : '#FFFFFF',
                color: isChosen ? '#FFFFFF' : theme.color.text,
                border: `1px solid ${isChosen ? theme.color.primary : theme.color.borderStrong}`,
                padding: '7px 14px',
                borderRadius: theme.radius.pill,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: answered ? 'default' : 'pointer',
                opacity: isDimmed ? 0.4 : 1,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: `all ${theme.motion.fast}`,
              }}
              onMouseEnter={(e) => {
                if (!answered) e.currentTarget.style.background = '#F4F8FE';
              }}
              onMouseLeave={(e) => {
                if (!answered) e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.color.textMuted,
          fontSize: 16,
          cursor: 'pointer',
          marginLeft: 4,
          width: 22,
          height: 22,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}

function ScheduledToast({ scheduleLabel, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#102B1F',
        color: '#FFFFFF',
        padding: '12px 18px',
        borderRadius: theme.radius.md,
        boxShadow: theme.shadow.overlay,
        fontSize: 13,
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        animation: 'surveyRise 220ms ease-out',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: theme.color.success,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5.2 4 7.2 8 3.2" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      RC Club version scheduled for {scheduleLabel}.
    </div>
  );
}

// ──────── Main flow ────────

const STATES = {
  LOADING: 'loading',
  GENERATED: 'generated',
  CONFIRMING: 'confirming',
  PUBLISHED: 'published',
};

export default function RCClubFlow() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromExisting = searchParams.get('from') === 'existing';
  const fromCompare = searchParams.get('from') === 'compare';

  const rcState = useRCClubState();

  const initialState = fromExisting || fromCompare ? STATES.GENERATED : STATES.LOADING;
  const [state, setState] = useState(initialState);
  const [activeTab, setActiveTab] = useState('rc-club');
  const [showSurvey, setShowSurvey] = useState(false);
  const [scheduleLabel, setScheduleLabel] = useState(null);

  useEffect(() => {
    trackPageVisit('rc_club_flow');
    if (state === STATES.LOADING) {
      trackAIInteraction('ai_loading_started');
      const t = setTimeout(() => {
        setState(STATES.GENERATED);
        trackAIInteraction('ai_loading_complete');
        setTimeout(() => setShowSurvey(true), 700);
      }, 3000);
      return () => clearTimeout(t);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wired to the sidebar's Accept button. EmailPreview's section/icon clicks go to handleEdit instead.
  const handleAccept = (key) => {
    trackAIInteraction('accept_section', { section: key });
    trackClick('accept_ai_section', { section: key });
    acceptSection(key);
  };
  const handleReject = (key) => {
    trackAIInteraction('reject_section', { section: key });
    trackClick('reject_ai_section', { section: key });
    rejectSection(key);
  };
  const handleEdit = (key) => {
    trackAIInteraction('edit_section', { section: key });
    trackClick('edit_ai_section', { section: key });
    startEditingSection(key);
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

  if (state === STATES.LOADING) {
    return <AILoader />;
  }

  const editingKey = rcState.editingKey;

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Email', 'Versions', 'RC Club']}
      headerRight={
        <>
          <Tabs
            active={activeTab}
            onSelect={(k) => {
              setActiveTab(k);
              trackClick('switch_version_tab', { tab: k });
            }}
          />
          <GhostButton
            onClick={() => {
              trackClick('compare_from_rc_club');
              navigate('/versions/compare?left=default&right=rc-club&from=rc-club');
            }}
          >
            Compare
          </GhostButton>
          <PrimaryButton
            onClick={() => {
              trackClick('open_publish_modal');
              setState(STATES.CONFIRMING);
            }}
          >
            Review & Publish
          </PrimaryButton>
        </>
      }
    >
      <main
        style={{
          flex: 1,
          padding: '32px 32px 80px',
          overflowY: 'auto',
          background: theme.color.appBg,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: 740 }}>
          <EmailPreview
            sectionStatus={resolvedSections}
            content={DEFAULT_CONTENT}
            onAccept={handleAccept}
            onEdit={handleEdit}
            onReject={handleReject}
            width={680}
          />
          <div
            style={{
              marginTop: 18,
              textAlign: 'center',
              fontSize: 11.5,
              color: theme.color.textSubtle,
            }}
          >
            Preview · sent on guest's behalf 7 days before arrival
          </div>
        </div>
      </main>

      {/* Right sidebar swaps based on editing state */}
      <aside
        style={{
          width: 340,
          background: theme.color.surface,
          borderLeft: `1px solid ${theme.color.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: 'auto',
        }}
      >
        {editingKey === 'hero' && (
          <HeroEditPanel
            currentVariant={rcState.sections.hero.content.variant}
            onPick={(variant) =>
              setSectionContent('hero', { ...rcState.sections.hero.content, variant })
            }
            onDone={() => {
              trackClick('finish_editing_hero');
              finishEditingSection('hero');
            }}
            onCancel={() => {
              trackClick('cancel_editing_hero');
              cancelEditing();
            }}
          />
        )}
        {editingKey === 'body' && (
          <BodyEditPanel
            value={rcState.sections.body.content}
            onChange={(v) => {
              trackAIInteraction('body_text_changed');
              setSectionContent('body', v);
            }}
            onDone={() => {
              trackClick('finish_editing_body');
              finishEditingSection('body');
            }}
            onCancel={() => {
              trackClick('cancel_editing_body');
              cancelEditing();
            }}
            onRevertToDefault={() => setSectionContent('body', DEFAULT_CONTENT.body)}
          />
        )}
        {editingKey === 'amenities' && (
          <AmenitiesEditPanel
            items={rcState.sections.amenities.content.items}
            onChange={(items) =>
              setSectionContent('amenities', { ...rcState.sections.amenities.content, items })
            }
            onDone={() => {
              trackClick('finish_editing_amenities');
              finishEditingSection('amenities');
            }}
            onCancel={() => {
              trackClick('cancel_editing_amenities');
              cancelEditing();
            }}
          />
        )}
        {!editingKey && (
          <OverviewSidebar
            sections={rcState.sections}
            onPublish={() => {
              trackClick('open_publish_modal_from_sidebar');
              setState(STATES.CONFIRMING);
            }}
            onRevert={() => {
              trackClick('discard_version');
              navigate('/versions');
            }}
          />
        )}
      </aside>

      <ScheduleModal
        open={state === STATES.CONFIRMING}
        onCancel={() => {
          trackClick('cancel_publish');
          setState(STATES.GENERATED);
        }}
        onConfirm={({ date, time, formatted }) => {
          trackClick('confirm_schedule', { date, time });
          trackAIInteraction('schedule_ai_version', { date, time });
          updateVersion('rc-club', {
            status: 'Scheduled',
            scheduledAt: formatted,
            lastEdited: 'Today',
          });
          setScheduleLabel(formatted);
          setState(STATES.PUBLISHED);
        }}
      />

      {showSurvey && (
        <MicroSurvey
          onAnswer={(label) => {
            trackSurveyResponse('How did that feel?', label);
          }}
          onDismiss={() => setShowSurvey(false)}
        />
      )}

      {state === STATES.PUBLISHED && scheduleLabel && (
        <ScheduledToast
          scheduleLabel={scheduleLabel}
          onDone={() => {
            setScheduleLabel(null);
            navigate('/versions');
          }}
        />
      )}
    </Shell>
  );
}
