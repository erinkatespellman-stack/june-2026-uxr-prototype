import React from 'react';
import theme from '../theme';

// Segmented single-select toggle. Clicking the active option deselects it
// (onChange receives null). Extracted from CaptureDial so it can be reused across
// the research console and elsewhere. `options` = [{ key, label }].
export default function SegButton({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', background: '#F0F0F0', borderRadius: theme.radius.md, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(active ? null : o.key)}
            style={{
              flex: '1 1 auto',
              border: 'none',
              borderRadius: theme.radius.sm,
              padding: '9px 14px',
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              background: active ? theme.color.text : 'transparent',
              color: active ? '#FFFFFF' : theme.color.textMuted,
              transition: `all ${theme.motion.fast}`,
              whiteSpace: 'nowrap',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
