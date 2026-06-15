import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import CaptureDial from './CaptureDial';

// Slide-in panel that hosts the dial-capture form on top of whatever page the
// researcher is on, so they can record answers mid-interview without navigating
// away from the participant's screen. Opened from the header "Capture" button.

export default function CaptureDrawer({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end', background: 'rgba(20,26,34,0.32)', animation: 'capFade 140ms ease-out' }}
    >
      <style>{`
        @keyframes capFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes capSlide { from { transform: translateX(24px); opacity: 0.4 } to { transform: translateX(0); opacity: 1 } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 460,
          maxWidth: '94vw',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'capSlide 180ms ease-out',
          fontFamily: theme.font.family,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${theme.color.border}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.5, textTransform: 'uppercase' }}>Control dial</div>
            <div style={{ fontSize: 18, fontWeight: 600, color: theme.color.text, marginTop: 2 }}>Capture a response</div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.color.textMuted, fontSize: 22, lineHeight: 1, padding: 4 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 28px' }}>
          <CaptureDial onDone={onClose} />
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${theme.color.border}`, padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => { navigate('/research/console'); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: theme.color.textMuted, fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Open full console ↗
          </button>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.md, padding: '8px 16px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: theme.color.text }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
