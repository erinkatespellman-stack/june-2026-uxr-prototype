import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import theme from '../theme';
import EmailPreview from './EmailPreview';

function MoreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <circle cx="3.5" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="12.5" cy="8" r="1.4" />
    </svg>
  );
}

function CheckMarkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 6.2 5 8.7 9.5 3.6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PersonaBadge({ persona }) {
  const map = {
    Default: { bg: '#EFEFEF', color: '#4A4A4A' },
    'RC Club': { bg: '#F1E7D1', color: '#7B5A1A' },
    Family: { bg: '#E4F1E0', color: '#3E6D38' },
    'Wedding Block': { bg: '#F4E3EA', color: '#88385C' },
    Repeat: { bg: '#E1ECF9', color: '#2A5BA0' },
  };
  const s = map[persona] || map.Default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10.5,
        fontWeight: 600,
        color: s.color,
        background: s.bg,
        padding: '3px 8px',
        borderRadius: theme.radius.pill,
        letterSpacing: 0.3,
      }}
    >
      {persona}
    </span>
  );
}

function StatusBadge({ status, scheduledAt }) {
  // Figma: solid filled pills — Published (green), Draft (orange), white text.
  const map = {
    Published: { bg: theme.color.success, label: 'Published' },
    Draft: { bg: theme.color.warning, label: 'Draft' },
    Scheduled: { bg: '#C16C0F', label: 'Scheduled' },
  };
  const s = map[status] || map.Published;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#FFFFFF',
          background: s.bg,
          padding: '3px 9px',
          borderRadius: theme.radius.sm,
          letterSpacing: 0.2,
          alignSelf: 'flex-start',
        }}
      >
        {s.label}
      </span>
      {status === 'Scheduled' && scheduledAt && (
        <span style={{ fontSize: 10.5, color: theme.color.textSubtle }}>
          {scheduledAt}
        </span>
      )}
    </div>
  );
}

function HoverActions({ onEdit, onDuplicate, onDelete }) {
  return (
    <div
      className="version-card-hover-actions"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        background: 'rgba(20,26,34,0.55)',
        backdropFilter: 'blur(2px)',
        opacity: 0,
        transition: `opacity ${theme.motion.base}`,
        pointerEvents: 'none',
      }}
    >
      {[
        { label: 'Edit', primary: true, onClick: onEdit },
        { label: 'Duplicate', onClick: onDuplicate },
        { label: 'Delete', onClick: onDelete },
      ].map((b) => (
        <button
          key={b.label}
          onClick={(e) => {
            e.stopPropagation();
            b.onClick && b.onClick();
          }}
          style={{
            background: b.primary ? '#FFFFFF' : 'transparent',
            color: b.primary ? theme.color.text : '#FFFFFF',
            border: b.primary ? 'none' : '1px solid rgba(255,255,255,0.6)',
            padding: b.primary ? '8px 16px' : '7px 14px',
            borderRadius: theme.radius.md,
            fontSize: 12.5,
            fontWeight: b.primary ? 600 : 500,
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

function PortalDropdown({ anchorRef, open, onClose, items }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    if (open && anchorRef.current) {
      setRect(anchorRef.current.getBoundingClientRect());
    }
  }, [open, anchorRef]);

  if (!open || !rect) return null;

  return createPortal(
    <>
      <div onMouseDown={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          right: window.innerWidth - rect.right,
          top: rect.bottom + 4,
          background: '#FFFFFF',
          border: `1px solid ${theme.color.border}`,
          borderRadius: theme.radius.md,
          boxShadow: theme.shadow.overlay,
          minWidth: 180,
          padding: '4px 0',
          zIndex: 1000,
        }}
      >
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              onClose();
              item.onClick && item.onClick();
            }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              padding: '8px 14px',
              fontSize: 12.5,
              color: item.danger ? theme.color.danger : theme.color.text,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F4F4F4')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>,
    document.body
  );
}

function SelectionCheckbox({ checked, onChange, alwaysVisible }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      style={{
        position: 'absolute',
        top: 12,
        left: 12,
        width: 22,
        height: 22,
        borderRadius: theme.radius.sm,
        background: checked ? theme.color.primary : 'rgba(255,255,255,0.92)',
        border: checked ? `2px solid ${theme.color.primary}` : `1.5px solid ${theme.color.borderStrong}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: alwaysVisible || checked ? 1 : 0,
        transition: `opacity ${theme.motion.fast}, background ${theme.motion.fast}, border-color ${theme.motion.fast}`,
        zIndex: 4,
        padding: 0,
      }}
      aria-pressed={checked}
      aria-label={checked ? 'Deselect version' : 'Select version'}
    >
      {checked && <CheckMarkIcon />}
    </button>
  );
}

export default function VersionCard({
  name,
  persona,
  status = 'Published',
  scheduledAt,
  lastEdited,
  variant = 'default',
  selected = false,
  onToggleSelect,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}) {
  const [hover, setHover] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnchorRef = useRef(null);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onOpen}
      style={{
        background: theme.color.surface,
        border: selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        cursor: 'pointer',
        boxShadow: hover ? theme.shadow.cardHover : theme.shadow.card,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: `box-shadow ${theme.motion.base}, transform ${theme.motion.base}, border-color ${theme.motion.base}`,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <style>{`
        .version-card-thumb-wrap:hover .version-card-hover-actions {
          opacity: 1 !important;
        }
      `}</style>

      <div
        className="version-card-thumb-wrap"
        style={{
          position: 'relative',
          background: '#F0EEEA',
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          borderRadius: `${theme.radius.lg} ${theme.radius.lg} 0 0`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 640,
            transform: 'translateX(-50%) scale(0.42)',
            transformOrigin: 'top center',
            pointerEvents: 'none',
          }}
        >
          <EmailPreview variant={variant} width={640} />
        </div>
        {onToggleSelect && (
          <SelectionCheckbox
            checked={selected}
            onChange={onToggleSelect}
            alwaysVisible={hover || selected}
          />
        )}
        <HoverActions onEdit={onEdit} onDuplicate={onDuplicate} onDelete={onDelete} />
      </div>

      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: theme.color.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <PersonaBadge persona={persona} />
              <StatusBadge status={status} scheduledAt={scheduledAt} />
            </div>
          </div>
          <button
            ref={menuAnchorRef}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            style={{
              background: menuOpen ? '#F0F0F0' : 'transparent',
              border: 'none',
              width: 28,
              height: 28,
              borderRadius: 4,
              cursor: 'pointer',
              color: theme.color.textMuted,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `background ${theme.motion.fast}`,
              flexShrink: 0,
            }}
            aria-label="More actions"
          >
            <MoreIcon />
          </button>
        </div>
        <div style={{ marginTop: 10, fontSize: 11.5, color: theme.color.textSubtle }}>
          Last edited {lastEdited}
        </div>
      </div>

      <PortalDropdown
        anchorRef={menuAnchorRef}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Edit', onClick: onEdit },
          { label: 'Duplicate', onClick: onDuplicate },
          { label: 'Preview in inbox', onClick: () => {} },
          { label: 'Rename', onClick: () => {} },
          { label: 'Delete', onClick: onDelete, danger: true },
        ]}
      />
    </div>
  );
}
