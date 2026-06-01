import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Shell from '../components/Shell';
import EmailPreview from '../components/EmailPreview';
import theme from '../theme';
import {
  trackPageVisit,
  trackClick,
  trackPathChosen,
} from '../tracking/sessionTracker';

function PillSelect({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              background: active ? '#EAF1FB' : '#FFFFFF',
              color: active ? theme.color.primary : theme.color.text,
              border: `1px solid ${active ? theme.color.primary : theme.color.borderStrong}`,
              padding: '5px 10px',
              borderRadius: theme.radius.pill,
              fontSize: 12,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              transition: `all ${theme.motion.fast}`,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function RuleRow({ rule, index, onUpdate, onRemove }) {
  return (
    <div
      style={{
        background: '#FAFAFA',
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.md,
        padding: 12,
        marginBottom: 8,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: theme.color.textMuted, letterSpacing: 0.4 }}>
          {index === 0 ? 'WHEN' : 'AND'}
        </div>
        <button
          onClick={onRemove}
          style={{
            background: 'transparent',
            border: 'none',
            color: theme.color.textMuted,
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
          }}
          aria-label="Remove rule"
        >
          ×
        </button>
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={rule.field}
          onChange={(e) => onUpdate({ ...rule, field: e.target.value })}
          style={{
            border: `1px solid ${theme.color.borderStrong}`,
            background: '#FFFFFF',
            borderRadius: theme.radius.sm,
            padding: '5px 8px',
            fontSize: 12.5,
            fontFamily: 'inherit',
            color: theme.color.text,
          }}
        >
          <option>Room category</option>
          <option>Booking source</option>
          <option>Length of stay</option>
          <option>Loyalty tier</option>
          <option>Travel purpose</option>
          <option>Country of residence</option>
        </select>
        <select
          value={rule.op}
          onChange={(e) => onUpdate({ ...rule, op: e.target.value })}
          style={{
            border: `1px solid ${theme.color.borderStrong}`,
            background: '#FFFFFF',
            borderRadius: theme.radius.sm,
            padding: '5px 8px',
            fontSize: 12.5,
            fontFamily: 'inherit',
            color: theme.color.text,
          }}
        >
          <option>is</option>
          <option>is not</option>
          <option>contains</option>
        </select>
        <input
          value={rule.value}
          onChange={(e) => onUpdate({ ...rule, value: e.target.value })}
          style={{
            border: `1px solid ${theme.color.borderStrong}`,
            background: '#FFFFFF',
            borderRadius: theme.radius.sm,
            padding: '5px 10px',
            fontSize: 12.5,
            flex: 1,
            minWidth: 120,
            fontFamily: 'inherit',
            outline: 'none',
            color: theme.color.text,
          }}
        />
      </div>
    </div>
  );
}

export default function GuidedConfig() {
  const navigate = useNavigate();
  const [name, setName] = useState('Honeymoon Package');
  const [tone, setTone] = useState('Romantic');
  const [length, setLength] = useState('Concise');
  const [imagery, setImagery] = useState('Sunset');
  const [rules, setRules] = useState([
    { field: 'Booking source', op: 'is', value: 'Honeymoon Package' },
    { field: 'Length of stay', op: 'is', value: '4+ nights' },
  ]);

  useEffect(() => {
    trackPageVisit('guided_config');
    trackPathChosen('configure');
  }, []);

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Email', 'Versions', 'New Version']}
      headerRight={
        <button
          onClick={() => {
            trackClick('generate_from_config');
            navigate('/versions/rc-club');
          }}
          style={{
            background: theme.color.primary,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: theme.radius.md,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Generate version
        </button>
      }
    >
      {/* Left configuration panel */}
      <aside
        style={{
          width: 380,
          background: theme.color.surface,
          borderRight: `1px solid ${theme.color.border}`,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '20px 22px', borderBottom: `1px solid ${theme.color.border}` }}>
          <div style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.5 }}>
            STEP 1 OF 3
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 4 }}>Define your audience</div>
          <div style={{ fontSize: 12.5, color: theme.color.textMuted, marginTop: 4, lineHeight: 1.5 }}>
            Set the rules that determine which guests will receive this version.
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 6 }}>
              Version name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${theme.color.borderStrong}`,
                borderRadius: theme.radius.md,
                fontSize: 13,
                fontFamily: 'inherit',
                color: theme.color.text,
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: theme.color.text }}>Audience rules</label>
              <button
                onClick={() => {
                  setRules([...rules, { field: 'Room category', op: 'is', value: '' }]);
                  trackClick('add_rule');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.color.primary,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                + Add rule
              </button>
            </div>
            {rules.map((rule, i) => (
              <RuleRow
                key={i}
                index={i}
                rule={rule}
                onUpdate={(r) => {
                  const next = [...rules];
                  next[i] = r;
                  setRules(next);
                }}
                onRemove={() => setRules(rules.filter((_, ii) => ii !== i))}
              />
            ))}
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 8 }}>
              Tone
            </label>
            <PillSelect options={['Warm', 'Formal', 'Romantic', 'Playful', 'Discreet']} value={tone} onChange={setTone} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 8 }}>
              Length
            </label>
            <PillSelect options={['Concise', 'Standard', 'Detailed']} value={length} onChange={setLength} />
          </div>

          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: theme.color.text, display: 'block', marginBottom: 8 }}>
              Imagery direction
            </label>
            <PillSelect
              options={['Sunset', 'Beach', 'Suite interior', 'Spa', 'Dining']}
              value={imagery}
              onChange={setImagery}
            />
          </div>

          <div
            style={{
              background: '#F8FBFF',
              border: `1px solid ${theme.color.aiBlueBorder}`,
              borderRadius: theme.radius.md,
              padding: 12,
              fontSize: 12.5,
              color: theme.color.text,
              lineHeight: 1.5,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, color: theme.color.primary }}>
              Estimated audience: 36 guests / month
            </div>
            Based on bookings in the last 90 days matching these rules.
          </div>
        </div>

        <div
          style={{
            padding: 16,
            borderTop: `1px solid ${theme.color.border}`,
            background: '#FAFAFA',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => navigate('/versions')}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.color.textMuted,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Back to versions
          </button>
          <button
            onClick={() => {
              trackClick('continue_to_generate');
              navigate('/versions/rc-club');
            }}
            style={{
              background: theme.color.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: theme.radius.md,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          padding: '32px 32px 80px',
          overflowY: 'auto',
          background: theme.color.appBg,
        }}
      >
        <div
          style={{
            maxWidth: 740,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: theme.color.textMuted,
              letterSpacing: 0.5,
              fontWeight: 600,
              textTransform: 'uppercase',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Live preview · default version with your selected tone
          </div>
          <EmailPreview variant="default" width={680} />
        </div>
      </main>
    </Shell>
  );
}
