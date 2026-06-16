import React, { useEffect, useState } from 'react';
import theme from '../theme';
import Shell from '../components/Shell';
import { getSessionData, resetSession, getAllSessions, clearAllSessions } from '../tracking/sessionTracker';
import { useDialResponses, useFollowups, MOMENTS, DIAL_POSITIONS, DRIVERS, FOLLOWUP_QUESTIONS, positionLabel, driverLabel } from '../store/dialStore';

// Colour per dial position, reused by the control-dial bars.
const POSITION_COLOR = { less: '#2F7DC4', 'just-right': theme.color.success, more: '#7A4DD0' };
const POSITION_ORDINAL = { less: 0, 'just-right': 1, more: 2 };

// Researcher view: a STUDY-LEVEL report aggregated across every stored session.
// It leads with the signals that actually answer the research question ("does AI
// generation feel trustworthy and appropriately controllable?"): sentiment,
// what people did with AI output (accept / edit / reject), completion, and where
// they struggled. A single session is available as a collapsible deep-dive.

// ──────── export helpers ────────

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function csvEscape(v) {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function feedbackCSV(sessions) {
  const rows = [['session_id', 'session_started', 'question', 'answer', 'answered_at']];
  sessions.forEach((s) => {
    (s.surveyResponses || []).forEach((r) => {
      rows.push([s.sessionId, new Date(s.startedAt).toISOString(), r.question, r.answer, new Date(r.at).toISOString()]);
    });
  });
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

// ──────── labels & formatting ────────

const PAGE_LABELS = {
  library: 'Communications hub',
  choose_audience: 'Choose audience',
  versions_grid: 'Versions library',
  creating_version: 'AI generating version',
  rc_club_flow: 'RC Club editor (AI review)',
  guided_config: 'Guided configuration',
  compare_versions: 'Side-by-side compare',
};

const EVENT_TYPE_STYLE = {
  page_visit: { dot: '#0265DC', label: 'Page' },
  click: { dot: '#7A7A7A', label: 'Click' },
  path_chosen: { dot: '#7B5A1A', label: 'Path' },
  ai_interaction: { dot: '#1A8856', label: 'AI' },
  survey_response: { dot: '#A1233B', label: 'Survey' },
  backtrack: { dot: '#C16C0F', label: 'Backtrack' },
};

// AI-output decisions grouped into accept / edit / reject buckets for the trust metric.
const ACCEPT_ACTIONS = new Set(['accept_section']);
const EDIT_ACTIONS = new Set(['edit_section', 'body_text_changed']);
const REJECT_ACTIONS = new Set(['reject_section']);

const SENTIMENT_ORDER = ['Just right', 'Too automated', 'More control'];
const SENTIMENT_COLOR = {
  'Just right': theme.color.success,
  'Too automated': '#E0892F',
  'More control': '#7A4DD0',
};

function pageLabel(p) {
  return PAGE_LABELS[p] || p;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function pct(n, d) {
  return d > 0 ? Math.round((n / d) * 100) : 0;
}

// ──────── aggregation ────────

function aggregate(sessions) {
  const sentiment = { 'Just right': 0, 'Too automated': 0, 'More control': 0, Other: 0 };
  let surveyTotal = 0;
  let accept = 0;
  let edit = 0;
  let reject = 0;
  let amenityAdded = 0;
  let amenityTotal = 0;
  let generated = 0;
  let published = 0;
  let totalBacktracks = 0;
  let totalDuration = 0;
  const pageDwell = {};
  const pageBacktracks = {};

  sessions.forEach((s) => {
    (s.surveyResponses || []).forEach((r) => {
      surveyTotal += 1;
      if (sentiment[r.answer] != null) sentiment[r.answer] += 1;
      else sentiment.Other += 1;
    });

    let didGenerate = false;
    let didPublish = false;
    (s.aiInteractions || []).forEach((a) => {
      if (ACCEPT_ACTIONS.has(a.action)) accept += 1;
      else if (EDIT_ACTIONS.has(a.action)) edit += 1;
      else if (REJECT_ACTIONS.has(a.action)) reject += 1;
      if (a.action === 'version_generated') didGenerate = true;
      if (a.action === 'publish_version') didPublish = true;
      if (a.action === 'amenities_committed') {
        amenityAdded += a.meta?.added || 0;
        amenityTotal += a.meta?.total || 0;
      }
    });
    if (didGenerate) generated += 1;
    if (didPublish) published += 1;

    totalBacktracks += s.backtrackCount || 0;
    totalDuration += s.durationSeconds || 0;
    Object.entries(s.pageTimings || {}).forEach(([p, sec]) => {
      pageDwell[p] = (pageDwell[p] || 0) + sec;
    });
    (s.timeline || []).forEach((e) => {
      if (e.type === 'backtrack') pageBacktracks[e.page] = (pageBacktracks[e.page] || 0) + 1;
    });
  });

  const dwellRows = Object.entries(pageDwell)
    .map(([page, sec]) => ({ page, sec, backtracks: pageBacktracks[page] || 0 }))
    .sort((a, b) => b.sec - a.sec);

  return {
    participants: sessions.length,
    sentiment,
    surveyTotal,
    accept,
    edit,
    reject,
    decisionTotal: accept + edit + reject,
    amenityAdded,
    amenityTotal,
    generated,
    published,
    totalBacktracks,
    avgDuration: sessions.length ? totalDuration / sessions.length : 0,
    dwellRows,
  };
}

// ──────── presentational ────────

function Stat({ label, value, hint, accent }) {
  return (
    <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '18px 20px' }}>
      <div style={{ fontSize: 13, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 600, marginTop: 6, letterSpacing: -0.4, color: accent || theme.color.text }}>{value}</div>
      {hint && <div style={{ fontSize: 14, color: theme.color.textMuted, marginTop: 4, lineHeight: 1.45 }}>{hint}</div>}
    </div>
  );
}

function Card({ title, caption, children }) {
  return (
    <section className="report-card" style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', letterSpacing: -0.2 }}>{title}</h2>
      {caption && <p style={{ fontSize: 15, color: theme.color.textMuted, margin: '0 0 14px', lineHeight: 1.5, maxWidth: 640 }}>{caption}</p>}
      <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '20px 22px' }}>
        {children}
      </div>
    </section>
  );
}

// A labelled, segmented horizontal bar with a legend underneath.
function SegmentBar({ segments, total }) {
  if (!total) {
    return <div style={{ fontSize: 15, color: theme.color.textMuted }}>No data captured yet.</div>;
  }
  return (
    <>
      <div style={{ display: 'flex', height: 30, borderRadius: 8, overflow: 'hidden', background: '#F0F0F0' }}>
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.label}
              title={`${s.label}: ${s.value} (${pct(s.value, total)}%)`}
              style={{ width: `${pct(s.value, total)}%`, background: s.color, transition: 'width 200ms ease-out' }}
            />
          ) : null
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 22px', marginTop: 14 }}>
        {segments.map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0, alignSelf: 'center' }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: theme.color.text }}>{s.label}</span>
            <span style={{ fontSize: 15, color: theme.color.textMuted }}>
              {s.value} · {pct(s.value, total)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────── control dial (research plan §5) ────────

function ControlDialBody({ dial, followups }) {
  if (!dial.length && !followups.length) {
    return (
      <div style={{ fontSize: 15, color: theme.color.textMuted, lineHeight: 1.5 }}>
        No dial answers captured yet. Record them with the Capture button (top bar) as you run interviews and they appear here.
      </div>
    );
  }
  // Driver tags aggregated across all participants' follow-ups.
  const driverCounts = DRIVERS.map((d) => ({
    ...d,
    count: followups.filter((f) => (f.drivers || []).includes(d.key)).length,
  })).filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const driverMax = driverCounts.length ? driverCounts[0].count : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {MOMENTS.map((m) => {
        const rows = dial.filter((r) => r.moment === m.key && r.desired);
        if (!rows.length) return null;
        const segments = DIAL_POSITIONS.map((p) => ({
          label: p.label,
          value: rows.filter((r) => r.desired === p.key).length,
          color: POSITION_COLOR[p.key],
        }));
        const withCurrent = rows.filter((r) => r.current);
        let aligned = 0;
        let wantLess = 0;
        let wantMore = 0;
        withCurrent.forEach((r) => {
          const d = POSITION_ORDINAL[r.desired];
          const c = POSITION_ORDINAL[r.current];
          if (c === d) aligned += 1;
          else if (c > d) wantLess += 1; // feels more automated than they'd like
          else wantMore += 1;
        });
        const whys = rows.filter((r) => r.why);
        return (
          <div key={m.key}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{m.label}</div>
            <SegmentBar segments={segments} total={rows.length} />
            {withCurrent.length > 0 && (
              <div style={{ marginTop: 14, fontSize: 14.5, color: theme.color.textMuted, lineHeight: 1.55 }}>
                Versus how it feels today: <strong style={{ color: theme.color.text }}>{aligned} of {withCurrent.length}</strong> feel it's about right.
                {wantLess > 0 && <> {wantLess} want AI to do <strong style={{ color: '#2F7DC4' }}>less</strong>.</>}
                {wantMore > 0 && <> {wantMore} want it to do <strong style={{ color: '#7A4DD0' }}>more</strong>.</>}
              </div>
            )}
            {whys.length > 0 && (
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {whys.map((r) => (
                  <div key={r.id} style={{ fontSize: 14.5, color: theme.color.text, lineHeight: 1.5, paddingLeft: 12, borderLeft: `3px solid ${POSITION_COLOR[r.desired]}` }}>
                    “{r.why}”
                    <span style={{ color: theme.color.textSubtle }}> · {r.participant || 'anon'} ({positionLabel(r.desired).toLowerCase()})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {driverCounts.length > 0 && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>What's driving it</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {driverCounts.map((d) => (
              <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 120, fontSize: 14, color: theme.color.text, flexShrink: 0 }}>{d.label}</span>
                <div style={{ flex: 1, height: 8, background: '#F0F0F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(d.count / driverMax) * 100}%`, height: '100%', background: '#7A4DD0', borderRadius: 4 }} />
                </div>
                <span style={{ width: 28, textAlign: 'right', fontSize: 14, fontWeight: 600, color: theme.color.textMuted, flexShrink: 0 }}>{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────── per-session deep dive ────────

function SessionRow({ session, dial, followups }) {
  const [open, setOpen] = useState(false);
  const published = (session.aiInteractions || []).some((a) => a.action === 'publish_version');
  const sentiment = (session.surveyResponses || []).map((r) => r.answer).join(', ') || 'no answer';
  const tl = session.timeline || [];
  const myDial = session.participant ? dial.filter((r) => r.participant === session.participant && r.desired) : [];
  const myFollow = session.participant ? (followups || []).find((f) => f.participant === session.participant) : null;
  const myAnswers = myFollow ? FOLLOWUP_QUESTIONS.filter((q) => (myFollow[q.key] || '').trim()) : [];
  return (
    <div style={{ borderBottom: `1px solid ${theme.color.border}` }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '18px 150px 1fr 90px 90px',
          gap: 12,
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          padding: '12px 14px',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 120ms', color: theme.color.textMuted, fontSize: 14 }}>▶</span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ fontSize: 14.5, fontWeight: session.participant ? 600 : 400, color: session.participant ? '#7A4DD0' : theme.color.textMuted, fontFamily: session.participant ? 'inherit' : 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {session.participant || session.sessionId}
          </span>
          {session.participant && <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: theme.color.textSubtle }}>{session.sessionId}</span>}
        </span>
        <span style={{ fontSize: 15, color: theme.color.text }}>{sentiment}</span>
        <span style={{ fontSize: 14.5, color: theme.color.textMuted }}>{formatDuration(session.durationSeconds)}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: published ? theme.color.success : theme.color.textSubtle }}>
          {published ? 'Published' : 'Incomplete'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '4px 14px 16px' }}>
          {myDial.length > 0 && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: '#F3EFFC', borderRadius: theme.radius.md, fontSize: 13.5, color: theme.color.text, lineHeight: 1.6 }}>
              <strong style={{ color: '#7A4DD0' }}>Dial answers:</strong>{' '}
              {myDial.map((r, idx) => (
                <span key={r.id}>
                  {idx > 0 && ' · '}
                  {(r.moment === 'amenities' ? 'Amenities' : 'Versions')}: {positionLabel(r.desired)}
                  {r.current && ` (feels ${positionLabel(r.current).toLowerCase()} today)`}
                </span>
              ))}
            </div>
          )}
          {myFollow && (myFollow.drivers?.length > 0 || myAnswers.length > 0) && (
            <div style={{ marginBottom: 12, padding: '10px 12px', background: '#FAFAFA', borderRadius: theme.radius.md, fontSize: 13.5, color: theme.color.text, lineHeight: 1.6 }}>
              {myFollow.drivers?.length > 0 && (
                <div style={{ marginBottom: myAnswers.length ? 8 : 0 }}>
                  <strong style={{ color: theme.color.textMuted }}>Drivers:</strong>{' '}
                  {myFollow.drivers.map((d) => driverLabel(d)).join(' · ')}
                </div>
              )}
              {myAnswers.map((q) => (
                <div key={q.key} style={{ marginTop: 4 }}>
                  <span style={{ color: theme.color.textMuted }}>{q.label}</span> {myFollow[q.key]}
                </div>
              ))}
            </div>
          )}
          {tl.length === 0 ? (
            <div style={{ fontSize: 14.5, color: theme.color.textMuted, padding: 8 }}>No events.</div>
          ) : (
            tl.map((event, i) => {
              const style = EVENT_TYPE_STYLE[event.type] || { dot: '#C8C8C8', label: event.type };
              const elapsed = ((event.at - session.startedAt) / 1000).toFixed(1);
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '64px 90px 1fr', gap: 12, padding: '6px 0', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 13, fontFamily: 'monospace', color: theme.color.textSubtle }}>+{elapsed}s</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: style.dot }} />
                    <span style={{ fontSize: 12.5, color: theme.color.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{style.label}</span>
                  </span>
                  <span style={{ fontSize: 14.5, color: theme.color.text }}>
                    {event.type === 'page_visit' && <>Visited <strong>{pageLabel(event.page)}</strong></>}
                    {event.type === 'click' && <span style={{ color: theme.color.textMuted }}>{event.label} <span style={{ color: theme.color.textSubtle }}>· {pageLabel(event.page)}</span></span>}
                    {event.type === 'ai_interaction' && <>AI: <strong>{event.label}</strong>{event.meta?.section ? <span style={{ color: theme.color.textMuted }}> · {event.meta.section}</span> : null}</>}
                    {event.type === 'survey_response' && <>Survey: <strong>{event.meta?.answer}</strong></>}
                    {event.type === 'path_chosen' && <>Chose path <strong>{event.label}</strong></>}
                    {event.type === 'backtrack' && <>Backtracked to <strong>{pageLabel(event.page)}</strong></>}
                  </span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ──────── main ────────

const ghostBtnStyle = {
  background: '#FFFFFF',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  padding: '8px 14px',
  fontSize: 15,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: theme.color.text,
};

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 10.2V2.4M8 2.4 5.3 5.1M8 2.4l2.7 2.7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 8.4v4.1a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V8.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownSm() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// One "Share" control with a dropdown of export options, replacing the row of
// CSV / JSON / Print buttons.
function ShareMenu({ onCsv, onJson, onPrint }) {
  const [open, setOpen] = useState(false);
  const Item = ({ title, sub, onPick }) => (
    <button
      onMouseDown={() => { onPick(); setOpen(false); }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F4FAFF'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', borderRadius: theme.radius.md, padding: '9px 12px', cursor: 'pointer', fontFamily: 'inherit', transition: `background ${theme.motion.fast}` }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: theme.color.text }}>{title}</span>
      <span style={{ fontSize: 12, color: theme.color.textMuted }}>{sub}</span>
    </button>
  );
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: theme.color.primary, border: 'none', borderRadius: theme.radius.md, padding: '8px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', color: '#FFFFFF' }}
      >
        <ShareIcon /> Share <ChevronDownSm />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 42, right: 0, width: 236, background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, boxShadow: theme.shadow.overlay, padding: 6, zIndex: 30 }}>
          <Item title="Download CSV" sub="Feedback responses (spreadsheet)" onPick={onCsv} />
          <Item title="Export JSON" sub="Full study data" onPick={onJson} />
          <Item title="Print / Save as PDF" sub="Formatted report" onPick={onPrint} />
        </div>
      )}
    </div>
  );
}

export default function Report() {
  const dial = useDialResponses();
  const followups = useFollowups();
  const [sessions, setSessions] = useState(() => getAllSessions());
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    const refresh = () => {
      getSessionData(); // flush live page timing into storage
      setSessions(getAllSessions());
    };
    const i = setInterval(refresh, 2000);
    return () => clearInterval(i);
  }, []);

  const a = aggregate(sessions);

  const sentimentSegments = SENTIMENT_ORDER.map((label) => ({ label, value: a.sentiment[label] || 0, color: SENTIMENT_COLOR[label] }));
  if (a.sentiment.Other) sentimentSegments.push({ label: 'Other', value: a.sentiment.Other, color: '#9AA0A8' });

  const decisionSegments = [
    { label: 'Accepted as-is', value: a.accept, color: theme.color.success },
    { label: 'Edited', value: a.edit, color: '#E0892F' },
    { label: 'Rejected / regenerated', value: a.reject, color: '#A1233B' },
  ];

  const editRate = pct(a.edit, a.decisionTotal);
  const completionRate = pct(a.published, a.participants);

  return (
    <Shell breadcrumbs={['Research', 'Study Summary']}>
      <main style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', color: theme.color.text, padding: '48px 56px 80px' }}>
        <style>{`@media print { .no-print { display: none !important; } .report-card { break-inside: avoid; } body { background: #FFF; } }`}</style>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
              Researcher View · Internal
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Study Summary</h1>
            <div style={{ fontSize: 15, color: theme.color.textMuted, marginTop: 6 }}>
              AI version &amp; amenity generation · {a.participants} participant{a.participants === 1 ? '' : 's'} · {a.surveyTotal} feedback response{a.surveyTotal === 1 ? '' : 's'}
              <span style={{ margin: '0 8px', color: '#C8C8C8' }}>·</span>
              <span style={{ color: theme.color.success }}>● live</span>
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <ShareMenu
              onCsv={() => downloadFile(`uxr-feedback-${getAllSessions().length}p.csv`, feedbackCSV(getAllSessions()), 'text/csv;charset=utf-8')}
              onJson={() => downloadFile('uxr-study-data.json', JSON.stringify({ sessions: getAllSessions(), dial, followups }, null, 2), 'application/json')}
              onPrint={() => window.print()}
            />
            <button
              onClick={() => { if (window.confirm('Start a fresh session? Stored history is kept.')) { resetSession(); setSessions(getAllSessions()); } }}
              style={ghostBtnStyle}
            >
              New session
            </button>
            <button
              onClick={() => { if (window.confirm('Clear ALL stored sessions and feedback? This cannot be undone.')) { clearAllSessions(); resetSession(); setSessions(getAllSessions()); } }}
              style={{ ...ghostBtnStyle, color: theme.color.danger }}
            >
              Clear all
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: theme.color.border, margin: '24px 0 30px' }} />

        {a.participants === 0 ? (
          <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '40px 24px', textAlign: 'center', color: theme.color.textMuted, fontSize: 16 }}>
            No sessions recorded yet. Open the prototype and walk through the flow. Results land here automatically.
          </div>
        ) : (
          <>
            {/* Hero stats */}
            <div className="report-card" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 34 }}>
              <Stat label="Participants" value={a.participants} hint={`${a.generated} generated a version`} />
              <Stat label="Completion" value={`${completionRate}%`} hint={`${a.published} reached Publish`} accent={completionRate >= 60 ? theme.color.success : undefined} />
              <Stat label="Edit rate" value={a.decisionTotal ? `${editRate}%` : '–'} hint="AI output changed before accepting" accent={editRate > 50 ? '#E0892F' : undefined} />
              <Stat label="Avg. time on task" value={formatDuration(a.avgDuration)} hint={`${a.totalBacktracks} backtrack${a.totalBacktracks === 1 ? '' : 's'} total`} />
            </div>

            {/* Sentiment: the hero signal */}
            <Card
              title="How did AI generation feel?"
              caption="Micro-survey responses pooled across every participant, the core attitudinal read on whether the automation lands."
            >
              <SegmentBar segments={sentimentSegments} total={a.surveyTotal} />
            </Card>

            {/* Control dial: moderated/unmoderated capture from §5 */}
            <Card
              title="The control dial: how much AI do people want?"
              caption="Where participants set the dial for each AI moment, captured in interviews. The gap between where they'd set it and how it feels today is the signal for the roadmap."
            >
              <ControlDialBody dial={dial} followups={followups} />
            </Card>

            {/* Trust behaviour */}
            <Card
              title="What people did with the AI's output"
              caption="Every accept / edit / reject decision on AI-generated email sections. A high edit or reject share is the behavioural signal that people wanted more control than the draft gave them."
            >
              <SegmentBar segments={decisionSegments} total={a.decisionTotal} />
              {a.amenityTotal > 0 && (
                <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${theme.color.borderSoft}`, fontSize: 15, color: theme.color.textMuted }}>
                  Amenity acceptance: <strong style={{ color: theme.color.text }}>{a.amenityAdded} of {a.amenityTotal}</strong> AI-suggested amenities ({pct(a.amenityAdded, a.amenityTotal)}%) were kept.
                </div>
              )}
            </Card>

            {/* Friction */}
            <Card
              title="Where people spent time (and got stuck)"
              caption="Total dwell per step across all participants, with how often each step was revisited. Long dwell plus backtracks flags friction worth a closer look."
            >
              {a.dwellRows.length === 0 ? (
                <div style={{ fontSize: 15, color: theme.color.textMuted }}>No page activity captured yet.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {a.dwellRows.map(({ page, sec, backtracks }) => {
                      const max = a.dwellRows[0].sec || 1;
                      return (
                        <tr key={page} style={{ borderBottom: `1px solid ${theme.color.borderSoft}` }}>
                          <td style={{ padding: '11px 12px 11px 0', fontSize: 15, fontWeight: 500, width: 230 }}>{pageLabel(page)}</td>
                          <td style={{ padding: '11px 12px', width: '100%' }}>
                            <div style={{ background: '#F0F0F0', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${(sec / max) * 100}%`, height: '100%', background: theme.color.primary }} />
                            </div>
                          </td>
                          <td style={{ padding: '11px 0 11px 12px', fontSize: 14.5, color: theme.color.textMuted, textAlign: 'right', whiteSpace: 'nowrap', width: 80 }}>{formatDuration(sec)}</td>
                          <td style={{ padding: '11px 0 11px 16px', fontSize: 14, color: backtracks ? '#C16C0F' : theme.color.textSubtle, textAlign: 'right', whiteSpace: 'nowrap', width: 90 }}>
                            {backtracks ? `${backtracks} revisit${backtracks === 1 ? '' : 's'}` : '–'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </Card>

            {/* Behaviour tracking: collapsed by default. In a moderated study
                this is mostly the researcher's own test runs, so the report leads
                with the captured dial answers above. */}
            <section className="report-card" style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', letterSpacing: -0.2 }}>
                    Behaviour tracking <span style={{ color: theme.color.textMuted, fontWeight: 400 }}>({sessions.length})</span>
                  </h2>
                  <p style={{ fontSize: 15, color: theme.color.textMuted, margin: 0, lineHeight: 1.5, maxWidth: 640 }}>
                    Automatic click-by-click tracking from this browser. In a moderated study it's mostly your own test runs; your captured answers live in “The control dial” above.
                  </p>
                </div>
                <button onClick={() => setShowSessions((v) => !v)} style={{ ...ghostBtnStyle, whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {showSessions ? 'Hide details' : 'Show details'}
                </button>
              </div>
              {showSessions && (
                <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '20px 22px', marginTop: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '18px 150px 1fr 90px 90px', gap: 12, padding: '0 14px 8px', fontSize: 13, fontWeight: 600, color: theme.color.textSubtle, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    <span />
                    <span>Session</span>
                    <span>Sentiment</span>
                    <span>Time</span>
                    <span>Status</span>
                  </div>
                  <div style={{ borderTop: `1px solid ${theme.color.border}` }}>
                    {[...sessions].reverse().map((s) => (
                      <SessionRow key={s.sessionId} session={s} dial={dial} followups={followups} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        <div style={{ marginTop: 28, fontSize: 13, color: theme.color.textSubtle, textAlign: 'center' }}>
          Sessions persist in this browser via local storage. Export the CSV/JSON to share or aggregate elsewhere.
        </div>
        </div>
      </main>
    </Shell>
  );
}
