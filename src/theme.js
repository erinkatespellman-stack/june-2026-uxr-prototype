// Design tokens — extracted from the real "🔮 UXR Portal 🔮" Figma
// (Marriott / Ritz-Carlton property portal on the Adobe Experience Cloud shell).
// Values below mirror the Figma globalVars: light Adobe shell header (#F4F4F4),
// dark Marriott property bar (#1C1C1C), Inter for portal UI, and the portal's
// blue / green / orange action + status palette.
export const theme = {
  color: {
    // Adobe Experience Cloud shell header (top bar) — LIGHT
    navBg: '#F4F4F4',
    navText: '#1C1C1C',
    navTextMuted: '#6B6B6B',
    navBorder: '#E0DEDD',

    // Marriott property bar (second bar) — DARK
    propBg: '#1C1C1C',
    propText: '#FFFFFF',
    propTextMuted: 'rgba(255,255,255,0.72)',
    propBorder: 'rgba(255,255,255,0.12)',

    // Surfaces
    appBg: '#F8F8F8',
    surface: '#FFFFFF',
    surfaceAlt: '#FAFAFA',
    border: '#E0DEDD',
    borderSoft: '#EBEBEB',
    borderStrong: '#C4C4C4',

    // Typography
    text: '#1C1C1C',
    textMuted: '#6B6B6B',
    textSubtle: '#A8A8A8',

    // Brand actions — Figma uses two blues:
    //   primary  = modern CTA / banner blue (#1473E6)
    //   link     = Adobe link / legacy outline blue (#007FD5)
    primary: '#1473E6',
    primaryHover: '#0F62C4',
    primaryActive: '#0B4FA0',
    link: '#007FD5',
    linkHover: '#0268B0',

    // AI / informational banner (Figma "Audience versions" discovery banner)
    aiBlueBorder: '#C2DAF0',
    aiBlueBg: '#E8F3FF',
    aiBlueAccent: '#1473E6',
    aiBlueBannerBg: '#E8F3FF',
    aiBlueBannerBorder: '#C2DAF0',

    // Filter pills (Figma library filter chips)
    pillBg: '#F8F9FC',
    pillBorder: '#D5D9EB',
    pillActiveBg: '#E5F2FB',
    pillActiveBorder: '#007FD5',
    pillActiveText: '#007FD5',

    // Marriott brand accents
    marriott: '#A1233B',
    ritz: '#1B3C53',
    devRed: '#D0021B', // environment "DEV" badge in the property bar

    // Status (Figma version badges)
    success: '#2D9D44', // "Published" / "Active"
    successBg: '#E6F4EA',
    warning: '#B05C0A', // "Draft"
    warningBg: '#FBEFE2',
    danger: '#D0021B',
  },

  radius: {
    sm: '4px',   // legacy chrome / badges
    md: '6px',   // modern buttons, inputs, cards' inner
    lg: '8px',   // cards
    xl: '12px',  // modals
    pill: '999px',
  },

  shadow: {
    // Figma card shadow: 0 1px 4px rgba(0,0,0,0.15)
    card: '0 1px 4px rgba(0,0,0,0.15)',
    cardHover: '0 6px 16px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.08)',
    // Figma property-bar shadow
    nav: '0 2px 4px 4px rgba(0,0,0,0.12)',
    // Figma publish dialog: 0 4px 16px rgba(0,0,0,0.1)
    modal: '0 4px 16px rgba(0,0,0,0.10), 0 24px 48px rgba(0,0,0,0.16)',
    overlay: '0 8px 24px rgba(0,0,0,0.12)',
  },

  font: {
    // Marriott / Ritz-Carlton brand font — Swiss721 BT (loaded via @font-face in index.css)
    family: "'Swiss721BT', 'Helvetica Neue', Arial, sans-serif",
    email: "'Swiss721BT', 'Helvetica Neue', Arial, sans-serif",
    serifDisplay: "'Swiss721BT', 'Helvetica Neue', Arial, sans-serif",
    size: {
      xs: '11px',
      sm: '12px',
      md: '13px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      h3: '20px',
      h2: '24px',
      h1: '28px',
      display: '34px',
    },
    weight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  space: {
    xxs: '4px',
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },

  motion: {
    fast: '120ms cubic-bezier(0.2, 0, 0.2, 1)',
    base: '180ms cubic-bezier(0.2, 0, 0.2, 1)',
    slow: '260ms cubic-bezier(0.2, 0, 0.2, 1)',
  },

  layout: {
    navHeight: '48px',     // Adobe shell header
    subNavHeight: '56px',  // Marriott property bar
    sidebarWidth: '256px',
    contentMax: '1440px',
  },
};

export default theme;
