import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import Shell from '../components/Shell';
import { setParticipant, getParticipant, getSessionId, getMode, setMode } from '../tracking/sessionTracker';
import {
  MOMENTS,
  DIAL_POSITIONS,
  addDialResponse,
  useDialResponses,
  clearDialResponses,
  momentLabel,
  positionLabel,
} from '../store/dialStore';

// Moderated capture screen (research plan §5). The researcher keeps this open
// while the participant drives the prototype, naming the participant first so the
// answers tie to that participant's tracked session. Feeds the Study Summary.

function SegButton({ options, value, onChange }) {
  return (
    <div style={{ display: 'inline-flex', background: '#F0F0F0', borderRadius: theme.radius.md, padding: 3, gap: 3 }}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            onClick={() => onChange(active ? null : o.key)}
            style={{
              border: 'none',
              borderRadius: theme.radius.sm,
              padding: '8px 16px',
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              cursor: 'pointer',
              background: active ? theme.color.text : 'transparent',
              color: active ? '#FFFFFF' : theme.color.textMuted,
              transition: `all ${theme.motion.fast}`,
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
  return <div style={{ fontSize: 14, fontWeight: 600, color: theme.color.text, marginBottom: 8 }}>{children}</div>;
}

function ghostBtn() {
  return {
    background: '#FFFFFF',
    border: `1px solid ${theme.color.borderStrong}`,
    borderRadius: theme.radius.md,
    padding: '9px 16px',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: theme.color.text,
  };
}

const emptyMoment = () => ({ desired: null, current: null, why: '' });

export default function ResearchConsole() {
  const navigate = useNavigate();
  const responses = useDialResponses();

  const [mode, setModeState] = useState(() => getMode());
  const [nameInput, setNameInput] = useState(getParticipant() || '');
  const [participant, setParticipantState] = useState(getParticipant());
  const [forms, setForms] = useState(() => ({ amenities: emptyMoment(), versions: emptyMoment() }));
  const [toast, setToast] = useState('');

  const chooseMode = (m) => { setModeState(m); setMode(m); };

  const commitParticipant = () => {
    const n = nameInput.trim();
    if (!n) return;
    setParticipant(n);
    setParticipantState(n);
    setToast(`Now interviewing ${n}`);
    window.setTimeout(() => setToast(''), 2000);
  };

  const setMomentField = (moment, field, value) => {
    setForms((f) => ({ ...f, [moment]: { ...f[moment], [field]: value } }));
  };

  const saveAnswers = () => {
    if (!participant) { setToast('Set a participant first'); window.setTimeout(() => setToast(''), 2000); return; }
    let saved = 0;
    MOMENTS.forEach((m) => {
      const form = forms[m.key];
      if (form.desired) {
        addDialResponse({
          participant,
          sessionId: getSessionId(),
          moment: m.key,
          desired: form.desired,
          current: form.current,
          why: form.why,
          mode: 'moderated',
        });
        saved += 1;
      }
    });
    if (saved === 0) { setToast('Set a dial position to save'); window.setTimeout(() => setToast(''), 2000); return; }
    setForms({ amenities: emptyMoment(), versions: emptyMoment() });
    setToast(`Saved ${saved} answer${saved === 1 ? '' : 's'} for ${participant}`);
    window.setTimeout(() => setToast(''), 2400);
  };

  const captured = [...responses].reverse();

  return (
    <Shell breadcrumbs={['Research', 'Capture Console']}>
      <main style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', color: theme.color.text, padding: '48px 56px 80px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
                Researcher only
              </div>
              <h1 style={{ fontSize: 34, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Capture Console</h1>
              <div style={{ fontSize: 15, color: theme.color.textMuted, marginTop: 6, lineHeight: 1.5 }}>
                Keep this open while your participant uses the prototype. Name them first, then record the “control dial” answers as they talk.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => navigate('/report')} style={ghostBtn()}>View results →</button>
            </div>
          </div>

          <div style={{ height: 1, background: theme.color.border, margin: '24px 0 28px' }} />

          {/* Mode */}
          <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Study mode</div>
              <div style={{ fontSize: 13.5, color: theme.color.textMuted, lineHeight: 1.5, marginTop: 2, maxWidth: 460 }}>
                {mode === 'moderated'
                  ? 'Moderated: you capture answers here. The in-flow popup is hidden so it does not interrupt the participant.'
                  : 'Unmoderated: the participant answers in the flow themselves. Use this console to review or add notes.'}
              </div>
            </div>
            <SegButton
              options={[{ key: 'moderated', label: 'Moderated' }, { key: 'unmoderated', label: 'Unmoderated' }]}
              value={mode}
              onChange={(m) => m && chooseMode(m)}
            />
          </div>

          {/* Participant */}
          <div style={{ background: '#FFFFFF', border: `1px solid ${participant ? '#CDB8F0' : theme.color.border}`, borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 20 }}>
            <FieldLabel>Who are you interviewing?</FieldLabel>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') commitParticipant(); }}
                placeholder="Name or label, e.g. Maria or P3"
                style={{ flex: 1, height: 42, padding: '0 14px', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.md, fontSize: 15, fontFamily: 'inherit', outline: 'none', color: theme.color.text }}
              />
              <button
                onClick={commitParticipant}
                style={{ background: theme.color.text, color: '#FFFFFF', border: 'none', borderRadius: theme.radius.md, padding: '11px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                Set participant
              </button>
            </div>
            <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 10 }}>
              {participant
                ? <>Interviewing <strong style={{ color: '#7A4DD0' }}>{participant}</strong>. Their answers link to this session ({getSessionId()}).</>
                : 'Set a participant before capturing, so answers tie to what they do in the prototype.'}
            </div>
          </div>

          {/* Dial capture */}
          <div style={{ fontSize: 13, fontWeight: 700, color: theme.color.textMuted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '6px 0 12px' }}>
            The control dial · ask once per AI moment
          </div>
          {MOMENTS.map((m) => {
            const form = forms[m.key];
            return (
              <div key={m.key} style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '20px 22px', marginBottom: 16 }}>
                <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 16 }}>{m.label}</div>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel>Where would they set the dial?</FieldLabel>
                  <SegButton options={DIAL_POSITIONS} value={form.desired} onChange={(v) => setMomentField(m.key, 'desired', v)} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FieldLabel>Where does it feel today?</FieldLabel>
                  <SegButton options={DIAL_POSITIONS} value={form.current} onChange={(v) => setMomentField(m.key, 'current', v)} />
                </div>
                <FieldLabel>Why? (their words)</FieldLabel>
                <textarea
                  value={form.why}
                  onChange={(e) => setMomentField(m.key, 'why', e.target.value)}
                  placeholder="Quote what they said…"
                  rows={2}
                  style={{ width: '100%', padding: '10px 12px', border: `1px solid ${theme.color.borderStrong}`, borderRadius: theme.radius.md, fontSize: 15, fontFamily: 'inherit', resize: 'vertical', outline: 'none', color: theme.color.text, lineHeight: 1.5 }}
                />
              </div>
            );
          })}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4 }}>
            <button
              onClick={saveAnswers}
              style={{ background: '#7A4DD0', color: '#FFFFFF', border: 'none', borderRadius: theme.radius.pill, padding: '12px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Save answers
            </button>
            {toast && <span style={{ fontSize: 14, color: '#7A4DD0', fontWeight: 600 }}>{toast}</span>}
          </div>

          {/* Captured so far */}
          {captured.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Captured so far ({captured.length})</h2>
                <button
                  onClick={() => { if (window.confirm('Clear all captured dial answers?')) clearDialResponses(); }}
                  style={{ ...ghostBtn(), color: theme.color.danger, padding: '7px 12px', fontSize: 13 }}
                >
                  Clear all
                </button>
              </div>
              <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, overflow: 'hidden' }}>
                {captured.map((r) => (
                  <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '130px 130px 1fr', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${theme.color.borderSoft}`, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#7A4DD0' }}>{r.participant || 'anon'}</span>
                    <span style={{ fontSize: 13.5, color: theme.color.textMuted }}>{momentLabel(r.moment)}</span>
                    <span style={{ fontSize: 14, color: theme.color.text }}>
                      <strong>{positionLabel(r.desired)}</strong>
                      {r.current && <span style={{ color: theme.color.textMuted }}> · feels {positionLabel(r.current).toLowerCase()} today</span>}
                      {r.why && <span style={{ color: theme.color.textMuted }}> · “{r.why}”</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </Shell>
  );
}
