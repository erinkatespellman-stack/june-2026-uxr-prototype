import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import { setParticipant, getParticipant, getSessionId } from '../tracking/sessionTracker';
import {
  MOMENTS,
  DIAL_POSITIONS,
  addDialResponse,
  useDialResponses,
  momentLabel,
  positionLabel,
} from '../store/dialStore';

// The control-dial capture form (research plan §5). Used both as the full
// /research/console page and inside the slide-in Capture drawer, so a researcher
// can record answers without leaving the participant's screen. Self-contained:
// names the participant and writes dial answers to the dialStore → report.

function SegButton({ options, value, onChange }) {
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

function FieldLabel({ children }) {
  return <div style={{ fontSize: 13.5, fontWeight: 600, color: theme.color.text, marginBottom: 7 }}>{children}</div>;
}

const emptyMoment = () => ({ desired: null, current: null, why: '' });

export default function CaptureDial({ onDone }) {
  const navigate = useNavigate();
  const responses = useDialResponses();

  const [nameInput, setNameInput] = useState(getParticipant() || '');
  const [participant, setParticipantState] = useState(getParticipant());
  const [forms, setForms] = useState(() => ({ amenities: emptyMoment(), versions: emptyMoment() }));
  const [toast, setToast] = useState('');

  const flash = (msg) => { setToast(msg); window.setTimeout(() => setToast(''), 2200); };

  const commitParticipant = () => {
    const n = nameInput.trim();
    if (!n) return;
    setParticipant(n);
    setParticipantState(n);
    flash(`Now interviewing ${n}`);
  };

  const setMomentField = (moment, field, value) => {
    setForms((f) => ({ ...f, [moment]: { ...f[moment], [field]: value } }));
  };

  const saveAnswers = () => {
    if (!participant) { flash('Set a participant first'); return; }
    let saved = 0;
    MOMENTS.forEach((m) => {
      const form = forms[m.key];
      if (form.desired) {
        addDialResponse({ participant, sessionId: getSessionId(), moment: m.key, desired: form.desired, current: form.current, why: form.why, mode: 'moderated' });
        saved += 1;
      }
    });
    if (saved === 0) { flash('Pick a dial position to save'); return; }
    setForms({ amenities: emptyMoment(), versions: emptyMoment() });
    flash(`Saved for ${participant}`);
  };

  // Most recent captures, newest first (kept short in the drawer).
  const captured = [...responses].reverse();

  return (
    <div>
      {/* Participant */}
      <div style={{ background: participant ? '#F7F3FE' : '#FFFFFF', border: `1px solid ${participant ? '#CDB8F0' : theme.color.border}`, borderRadius: theme.radius.lg, padding: '14px 16px', marginBottom: 18 }}>
        <FieldLabel>Who are you interviewing?</FieldLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitParticipant(); }}
            placeholder="Name or label, e.g. Maria or P3"
            style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.md, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: theme.color.text }}
          />
          <button
            type="button"
            onClick={commitParticipant}
            style={{ background: theme.color.text, color: '#FFFFFF', border: 'none', borderRadius: theme.radius.md, padding: '0 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            Set
          </button>
        </div>
        <div style={{ fontSize: 12.5, color: theme.color.textMuted, marginTop: 8, lineHeight: 1.45 }}>
          {participant
            ? <>Capturing for <strong style={{ color: '#7A4DD0' }}>{participant}</strong>. Answers link to their session.</>
            : 'Name them first so answers tie to what they do in the prototype.'}
        </div>
      </div>

      {/* Dial per moment */}
      {MOMENTS.map((m) => {
        const form = forms[m.key];
        return (
          <div key={m.key} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{m.label}</div>
            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Where would they set the dial?</FieldLabel>
              <SegButton options={DIAL_POSITIONS} value={form.desired} onChange={(v) => setMomentField(m.key, 'desired', v)} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Where does it feel today?</FieldLabel>
              <SegButton options={DIAL_POSITIONS} value={form.current} onChange={(v) => setMomentField(m.key, 'current', v)} />
            </div>
            <FieldLabel>Why? (their words)</FieldLabel>
            <textarea
              value={form.why}
              onChange={(e) => setMomentField(m.key, 'why', e.target.value)}
              placeholder="Quote what they said…"
              rows={2}
              style={{ width: '100%', padding: '9px 11px', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.md, fontSize: 14.5, fontFamily: 'inherit', resize: 'vertical', outline: 'none', color: theme.color.text, lineHeight: 1.5, boxSizing: 'border-box' }}
            />
          </div>
        );
      })}

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={saveAnswers}
          style={{ background: '#7A4DD0', color: '#FFFFFF', border: 'none', borderRadius: theme.radius.pill, padding: '12px 24px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Save answers
        </button>
        <button
          type="button"
          onClick={() => { navigate('/report'); if (onDone) onDone(); }}
          style={{ background: 'transparent', border: 'none', color: theme.color.link, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          View results →
        </button>
        {toast && <span style={{ fontSize: 14, color: '#7A4DD0', fontWeight: 600 }}>{toast}</span>}
      </div>

      {/* Recent */}
      {captured.length > 0 && (
        <div style={{ marginTop: 24, paddingTop: 16, borderTop: `1px solid ${theme.color.borderSoft}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.color.textSubtle, letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 10 }}>
            Captured ({captured.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {captured.slice(0, 6).map((r) => (
              <div key={r.id} style={{ fontSize: 13.5, color: theme.color.text, lineHeight: 1.4 }}>
                <strong style={{ color: '#7A4DD0' }}>{r.participant || 'anon'}</strong>
                <span style={{ color: theme.color.textMuted }}> · {momentLabel(r.moment)}: </span>
                {positionLabel(r.desired)}
                {r.current && <span style={{ color: theme.color.textMuted }}> (feels {positionLabel(r.current).toLowerCase()})</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
