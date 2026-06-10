import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';

// Adobe-style Experience Cloud waffle (3x3 dots)
function AppSwitcherIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      {[0, 6, 12].map((y) =>
        [0, 6, 12].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.5" fill="currentColor" />
        ))
      )}
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M6.4 6.2c0-.9.7-1.7 1.8-1.7 1 0 1.7.6 1.7 1.5 0 .7-.4 1.1-1.2 1.6-.6.4-.9.7-.9 1.3v.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.6" r="0.7" fill="currentColor" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3.5 12V7.5a4.5 4.5 0 0 1 9 0V12l1 1.2v.3h-11v-.3L3.5 12Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M6.8 14.2a1.4 1.4 0 0 0 2.4 0" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

// Researcher session-report entry (discreet — opens /report)
function ReportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2.5" y="2" width="11" height="12" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 9.5v2M8 6.5v5M11 8v3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Adobe Experience Cloud "infinity ribbon" mark — sits on the LIGHT shell header
function AdobeExperienceCloudMark() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 15c0-3.5 3-6 6.5-6 2.3 0 3.7 1.4 5 3 1.3 1.6 2.7 3 5 3 1.7 0 3-1.3 3-3"
          stroke="#FA0F00"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M21 9c0 3.5-3 6-6.5 6-2.3 0-3.7-1.4-5-3C8.2 10.4 6.8 9 4.5 9 2.8 9 1.5 10.3 1.5 12"
          stroke="#C8C8C8"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span style={{ fontSize: 14, color: theme.color.navText, fontWeight: 600, letterSpacing: 0.1 }}>
        Adobe Experience Cloud
      </span>
    </div>
  );
}

// Official Marriott M + wordmark, recolored white via filter for the DARK property bar.
// Clickable: navigates to the library landing page (/).
function MarriottWordmark({ onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label="Marriott — go to library"
      title="Go to library"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        height: 38,
      }}
    >
      <img
        src="/images/marriott-logo.png"
        alt="Marriott"
        style={{
          height: '100%',
          width: 'auto',
          display: 'block',
          // Recolor: brightness(0) makes every non-transparent pixel black,
          // invert(1) flips that to pure white (#FFFFFF). Transparent stays transparent.
          filter: 'brightness(0) invert(1)',
        }}
      />
    </button>
  );
}

function ShellIconButton({ label, children, dark = false, onClick }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        color: dark ? theme.color.propTextMuted : theme.color.navTextMuted,
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        borderRadius: 4,
        position: 'relative',
      }}
    >
      {children}
    </button>
  );
}

function UserAvatar({ initials = 'EK', onDark = false }) {
  return (
    <div
      style={{
        width: 25,
        height: 25,
        borderRadius: '50%',
        background: onDark ? '#E9E9E9' : '#3D6FA8',
        color: onDark ? '#1C1C1C' : '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        cursor: 'pointer',
        transition: `background ${theme.motion.fast}`,
      }}
      title="Erin Kate"
    >
      {initials}
    </div>
  );
}

export default function Shell({
  propertyName = 'The Ritz-Carlton, Amelia Island',
  propertyCode = 'AXAM',
  breadcrumbs = [],
  headerRight = null,
  children,
}) {
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.color.appBg,
        fontFamily: theme.font.family,
        color: theme.color.text,
        fontSize: theme.font.size.base,
      }}
    >
      {/* Bar 1 — Adobe Experience Cloud shell header (LIGHT) */}
      <div
        style={{
          height: theme.layout.navHeight,
          background: theme.color.navBg,
          color: theme.color.navText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'sticky',
          top: 0,
          zIndex: 60,
          borderBottom: `1px solid ${theme.color.navBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            aria-label="App switcher"
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.color.navText,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: 4,
            }}
          >
            <AppSwitcherIcon />
          </button>
          <AdobeExperienceCloudMark />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ShellIconButton label="Session report" onClick={() => navigate('/report')}>
            <ReportIcon />
          </ShellIconButton>
          <ShellIconButton label="Help">
            <HelpIcon />
          </ShellIconButton>
          <ShellIconButton label="Notifications">
            <NotificationIcon />
            <span
              style={{
                position: 'absolute',
                top: 2,
                right: 2,
                minWidth: 14,
                height: 14,
                padding: '0 3px',
                borderRadius: 999,
                background: '#EC1009',
                color: '#FFFFFF',
                fontSize: 8,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              9+
            </span>
          </ShellIconButton>
          <div style={{ width: 1, height: 22, background: theme.color.navBorder, margin: '0 4px' }} />
          <UserAvatar />
        </div>
      </div>

      {/* Bar 2 — Marriott property bar (DARK) */}
      <div
        style={{
          height: theme.layout.subNavHeight,
          background: theme.color.propBg,
          color: theme.color.propText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'relative',
          zIndex: 50,
          boxShadow: theme.shadow.nav,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <MarriottWordmark onClick={() => navigate('/')} />
          <div style={{ width: 1, height: 24, background: theme.color.propBorder }} />
          <span
            style={{
              fontFamily: theme.font.email,
              fontWeight: 300,
              fontSize: 16,
              color: theme.color.propText,
              letterSpacing: 0.2,
            }}
          >
            {propertyName}
          </span>
          {breadcrumbs.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginLeft: 8,
                color: theme.color.propTextMuted,
                fontSize: 13,
              }}
            >
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  <span style={{ color: 'rgba(255,255,255,0.35)' }}>›</span>
                  <span
                    style={{
                      color: i === breadcrumbs.length - 1 ? theme.color.propText : theme.color.propTextMuted,
                      fontWeight: i === breadcrumbs.length - 1 ? 500 : 400,
                    }}
                  >
                    {b}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {headerRight}
          {headerRight && <div style={{ width: 1, height: 22, background: theme.color.propBorder }} />}
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.color.propText,
              fontSize: 14,
              fontWeight: 400,
              cursor: 'pointer',
              padding: 0,
              fontFamily: theme.font.email,
            }}
          >
            See What's New
          </button>
          <UserAvatar onDark />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          // Fixed height so the content pane scrolls internally — the two nav
          // bars and the sidebar stay pinned (proper app-shell scroll).
          height: `calc(100vh - ${theme.layout.navHeight} - ${theme.layout.subNavHeight})`,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}
