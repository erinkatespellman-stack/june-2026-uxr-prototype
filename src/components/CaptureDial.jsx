import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import { setParticipant, getParticipant, getSessionId } from '../tracking/sessionTracker';
import {
  MOMENTS,
  DIAL_POSITIONS,
  DRIVERS,
  FOLLOWUP_QUESTIONS,
  addDialResponse,
  saveFollowup,
  getFollowup,
  useDialResponses,
  momentLabel,
  positionLabel,
} from '../store/dialStore';

// The control-dial capture form (research plan §5). Used both as the full
// /research/console page and inside the slide-in Capture drawer, so a researcher
// can record answers without leaving the participant's screen. Captures the dial
// per AI moment plus the optional §5 follow-ups and §2 driver tags.

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

const textareaStyle = {
  width: '100%',
  padding: '9px 11px',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  fontSize: 14.5,
  fontFamily: 'inherit',
  resize: 'vertical',
  outline: 'none',
  color: theme.color.text,
  lineHeight: 1.5,
  boxSizing: 'border-box',
};

const emptyMoment = () => ({ desired: null, current: null, why: '' });
const emptyFollow = () => ({ drivers: [], gate: '', trustUnlock: '', worstCase: '', timeSaved: '' });

function loadFollow(name) {
  const existing = name ? getFollowup(name) : null;
  return existing ? { ...emptyFollow(), ...existing } : emptyFollow();
}

function hasFollowContent(f) {
  return f.drivers.length > 0 || FOLLOWUP_QUESTIONS.some((q) => (f[q.key] || '').trim());
}

export default function CaptureDial({ onDone }) {
  const navigate = useNavigate();
  const responses = useDialResponses();

  const [nameInput, setNameInput] = useState(getParticipant() || '');
  const [participant, setParticipantState] = useState(getParticipant());
  const [forms, setForms] = useState(() => ({ amenities: emptyMoment(), versions: emptyMoment() }));
  const [follow, setFollow] = useState(() => loadFollow(getParticipant()));
  const [followOpen, setFollowOpen] = useState(false);
  const [toast, setToast] = useState('');

  const flash = (msg) => { setToast(msg); window.setTimeout(() => setToast(''), 2200); };

  const commitParticipant = () => {
    const n = nameInput.trim();
    if (!n) return;
    setParticipant(n);
    setParticipantState(n);
    setFollow(loadFollow(n)); // pull any follow-ups already captured for them
    flash(`Now interviewing ${n}`);
  };

  const setMomentField = (moment, field, value) => {
    setForms((f) => ({ ...f, [moment]: { ...f[moment], [field]: value } }));
  };

  const setFollowField = (field, value) => setFollow((f) => ({ ...f, [field]: value }));

  const toggleDriver = (key) => {
    setFollow((f) => ({ ...f, drivers: f.drivers.includes(key) ? f.drivers.filter((d) => d !== key) : [...f.drivers, key] }));
  };

  const saveAnswers = () => {
    if (!participant) { flash('Set a participant first'); return; }
    let savedDial = 0;
    MOMENTS.forEach((m) => {
      const form = forms[m.key];
      if (form.desired) {
        addDialResponse({ participant, sessionId: getSessionId(), moment: m.key, desired: form.desired, current: form.current, why: form.why, mode: 'moderated' });
        savedDial += 1;
      }
    });
    const savedFollow = hasFollowContent(follow);
    if (savedFollow) saveFollowup(participant, follow);
    if (!savedDial && !savedFollow) { flash('Add a dial position or a follow-up'); return; }
    setForms({ amenities: emptyMoment(), versions: emptyMoment() }); // follow-ups persist (one per participant)
    flash(`Saved for ${participant}`);
  };

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
              style={textareaStyle}
            />
          </div>
        );
      })}

      {/* Optional follow-ups */}
      <div style={{ border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, marginBottom: 18, overflow: 'hidden' }}>
        <button
          type="button"
          onClick={() => setFollowOpen((v) => !v)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FAFAFA', border: 'none', padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.text }}>
            Follow-ups <span style={{ color: theme.color.textMuted, fontWeight: 400 }}>(optional)</span>
            {hasFollowContent(follow) && <span style={{ marginLeft: 8, color: '#7A4DD0', fontSize: 12, fontWeight: 600 }}>● filled</span>}
          </span>
          <span style={{ transform: followOpen ? 'rotate(90deg)' : 'none', transition: 'transform 120ms', color: theme.color.textMuted, fontSize: 13 }}>▶</span>
        </button>
        {followOpen && (
          <div style={{ padding: '16px', borderTop: `1px solid ${theme.color.borderSoft}` }}>
            <FieldLabel>What's driving their preference?</FieldLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
              {DRIVERS.map((d) => {
                const on = follow.drivers.includes(d.key);
                return (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => toggleDriver(d.key)}
                    style={{
                      border: `1px solid ${on ? '#7A4DD0' : theme.color.borderStrong}`,
                      background: on ? '#F1EAFB' : '#FFFFFF',
                      color: on ? '#7A4DD0' : theme.color.textMuted,
                      borderRadius: 999,
                      padding: '6px 13px',
                      fontSize: 13.5,
                      fontWeight: on ? 600 : 500,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: `all ${theme.motion.fast}`,
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
            {FOLLOWUP_QUESTIONS.map((q) => (
              <div key={q.key} style={{ marginBottom: 14 }}>
                <FieldLabel>{q.label}</FieldLabel>
                <textarea
                  value={follow[q.key]}
                  onChange={(e) => setFollowField(q.key, e.target.value)}
                  placeholder={q.placeholder}
                  rows={2}
                  style={textareaStyle}
                />
              </div>
            ))}
          </div>
        )}
      </div>

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
