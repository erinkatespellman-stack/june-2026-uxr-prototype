import React, { useEffect, useState } from 'react';
import theme from '../theme';
import { getSessionData, resetSession, getAllSessions, clearAllSessions } from '../tracking/sessionTracker';

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

// Flatten every micro-survey answer across all stored sessions into a CSV report.
function feedbackCSV(sessions) {
  const rows = [['session_id', 'session_started', 'question', 'answer', 'answered_at']];
  sessions.forEach((s) => {
    (s.surveyResponses || []).forEach((r) => {
      rows.push([s.sessionId, new Date(s.startedAt).toISOString(), r.question, r.answer, new Date(r.at).toISOString()]);
    });
  });
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n');
}

const PAGE_LABELS = {
  library: 'Communications hub',
  versions_grid: 'Versions library',
  rc_club_flow: 'RC Club flow (AI generation)',
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

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function formatTime(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ghostBtnStyle = {
  background: '#FFFFFF',
  border: `1px solid ${theme.color.borderStrong}`,
  borderRadius: theme.radius.md,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'inherit',
  color: theme.color.text,
};

function Stat({ label, value, hint }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: `1px solid ${theme.color.border}`,
        borderRadius: theme.radius.lg,
        padding: '18px 20px',
      }}
    >
      <div style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 600, marginTop: 6, letterSpacing: -0.3, color: theme.color.text }}>
        {value}
      </div>
      {hint && <div style={{ fontSize: 12, color: theme.color.textMuted, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export default function Report() {
  const [data, setData] = useState(() => getSessionData());

  useEffect(() => {
    const i = setInterval(() => {
      setData(getSessionData());
    }, 2000);
    return () => clearInterval(i);
  }, []);

  const pageVisits = data.timeline.filter((e) => e.type === 'page_visit');
  const surveyResponses = data.surveyResponses || [];

  const totalClicks = data.timeline.filter((e) => e.type === 'click').length;
  const totalAI = (data.aiInteractions || []).length;

  const allSessions = getAllSessions();
  const storedFeedback = allSessions.reduce((n, s) => n + (s.surveyResponses ? s.surveyResponses.length : 0), 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FFFFFF',
        color: theme.color.text,
        fontFamily: theme.font.family,
        padding: '48px 56px 80px',
      }}
    >
      <style>{`
        @media print {
          body { background: #FFFFFF; }
          .no-print { display: none !important; }
          .report-card { break-inside: avoid; }
        }
      `}</style>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                color: theme.color.textMuted,
                fontWeight: 600,
                letterSpacing: 0.6,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Researcher View · Internal
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Session Report</h1>
            <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 6 }}>
              Session ID <code style={{ background: '#F5F5F5', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{data.sessionId}</code>
              <span style={{ margin: '0 8px', color: '#C8C8C8' }}>·</span>
              Started {formatTime(data.startedAt)}
              <span style={{ margin: '0 8px', color: '#C8C8C8' }}>·</span>
              Duration {formatDuration(data.durationSeconds)}
              <span style={{ margin: '0 8px', color: '#C8C8C8' }}>·</span>
              Live (refreshes every 2s)
              <span style={{ margin: '0 8px', color: '#C8C8C8' }}>·</span>
              {allSessions.length} session{allSessions.length === 1 ? '' : 's'} stored · {storedFeedback} feedback response{storedFeedback === 1 ? '' : 's'}
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => downloadFile(`uxr-feedback-${Date.now()}.csv`, feedbackCSV(getAllSessions()), 'text/csv;charset=utf-8')}
              style={{
                background: theme.color.primary,
                border: 'none',
                borderRadius: theme.radius.md,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                color: '#FFFFFF',
              }}
            >
              Download CSV
            </button>
            <button
              onClick={() => downloadFile(`uxr-sessions-${Date.now()}.json`, JSON.stringify(getAllSessions(), null, 2), 'application/json')}
              style={ghostBtnStyle}
            >
              Export JSON
            </button>
            <button onClick={() => window.print()} style={ghostBtnStyle}>
              Print
            </button>
            <button
              onClick={() => {
                if (window.confirm('Start a new session? The current session is kept in stored history.')) {
                  resetSession();
                  setData(getSessionData());
                }
              }}
              style={{ ...ghostBtnStyle, color: theme.color.text }}
            >
              New session
            </button>
            <button
              onClick={() => {
                if (window.confirm('Clear ALL stored sessions and feedback? This cannot be undone.')) {
                  clearAllSessions();
                  resetSession();
                  setData(getSessionData());
                }
              }}
              style={{ ...ghostBtnStyle, color: theme.color.danger }}
            >
              Clear all
            </button>
          </div>
        </div>

        <div style={{ height: 1, background: theme.color.border, margin: '28px 0' }} />

        {/* Stats */}
        <div
          className="report-card"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 36,
          }}
        >
          <Stat label="Path chosen" value={data.pathChosen || '—'} hint={data.pathChosen ? 'Selected from version-creation modal' : 'Participant has not selected'} />
          <Stat label="Pages visited" value={pageVisits.length} hint={data.backtrackCount > 0 ? `${data.backtrackCount} backtrack${data.backtrackCount > 1 ? 's' : ''}` : 'Linear path'} />
          <Stat label="AI interactions" value={totalAI} hint="View, accept, edit, reject events" />
          <Stat label="Clicks logged" value={totalClicks} hint="All tracked button taps" />
        </div>

        {/* Page timings */}
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 14px' }}>Time on each page</h2>
        <div
          className="report-card"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.radius.lg,
            padding: 8,
            marginBottom: 36,
          }}
        >
          {Object.keys(data.pageTimings).length === 0 ? (
            <div style={{ padding: 20, color: theme.color.textMuted, fontSize: 13, textAlign: 'center' }}>
              No pages visited yet. Open the prototype in another tab and walk through the flow.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {Object.entries(data.pageTimings)
                  .sort(([, a], [, b]) => b - a)
                  .map(([page, sec]) => {
                    const max = Math.max(...Object.values(data.pageTimings));
                    const pct = (sec / max) * 100;
                    return (
                      <tr key={page} style={{ borderBottom: `1px solid ${theme.color.border}` }}>
                        <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 500, width: 240 }}>
                          {PAGE_LABELS[page] || page}
                        </td>
                        <td style={{ padding: '12px 14px', width: '100%' }}>
                          <div style={{ background: '#F0F0F0', height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: theme.color.primary,
                                transition: 'width 200ms ease-out',
                              }}
                            />
                          </div>
                        </td>
                        <td style={{ padding: '12px 14px', fontSize: 12.5, color: theme.color.textMuted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatDuration(sec)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}
        </div>

        {/* Survey */}
        {surveyResponses.length > 0 && (
          <>
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 14px' }}>Micro-survey responses</h2>
            <div
              className="report-card"
              style={{
                background: '#FFFFFF',
                border: `1px solid ${theme.color.border}`,
                borderRadius: theme.radius.lg,
                padding: 4,
                marginBottom: 36,
              }}
            >
              {surveyResponses.map((r, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 18px',
                    borderBottom: i < surveyResponses.length - 1 ? `1px solid ${theme.color.border}` : 'none',
                  }}
                >
                  <div style={{ fontSize: 13, color: theme.color.textMuted, marginBottom: 4 }}>{r.question}</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: theme.color.text }}>{r.answer}</div>
                  <div style={{ fontSize: 11, color: theme.color.textSubtle, marginTop: 4 }}>{formatTime(r.at)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Timeline */}
        <h2 style={{ fontSize: 17, fontWeight: 600, margin: '0 0 14px' }}>Session timeline</h2>
        <div
          className="report-card"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${theme.color.border}`,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
          }}
        >
          {data.timeline.length === 0 ? (
            <div style={{ padding: 20, color: theme.color.textMuted, fontSize: 13, textAlign: 'center' }}>
              No activity captured.
            </div>
          ) : (
            data.timeline.map((event, i) => {
              const style = EVENT_TYPE_STYLE[event.type] || { dot: '#C8C8C8', label: event.type };
              const elapsed = ((event.at - data.startedAt) / 1000).toFixed(1);
              return (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 120px 1fr',
                    gap: 14,
                    padding: '11px 18px',
                    borderBottom: i < data.timeline.length - 1 ? `1px solid #F0F0F0` : 'none',
                    alignItems: 'baseline',
                  }}
                >
                  <div style={{ fontSize: 11.5, color: theme.color.textSubtle, fontFamily: 'monospace' }}>
                    +{elapsed}s
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: style.dot }} />
                    <span style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      {style.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: theme.color.text }}>
                    {event.type === 'page_visit' && (
                      <>Visited <strong>{PAGE_LABELS[event.page] || event.page}</strong></>
                    )}
                    {event.type === 'click' && (
                      <>
                        <span style={{ color: theme.color.textMuted }}>on {PAGE_LABELS[event.page] || event.page} — </span>
                        <code style={{ background: '#F5F5F5', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>{event.label}</code>
                      </>
                    )}
                    {event.type === 'path_chosen' && (
                      <>Chose path <strong>{event.label}</strong></>
                    )}
                    {event.type === 'ai_interaction' && (
                      <>
                        AI interaction: <strong>{event.label}</strong>
                        {event.meta && event.meta.section && (
                          <span style={{ color: theme.color.textMuted }}> — {event.meta.section}</span>
                        )}
                      </>
                    )}
                    {event.type === 'survey_response' && (
                      <>
                        Answered survey: <strong>{event.meta.answer}</strong>
                      </>
                    )}
                    {event.type === 'backtrack' && (
                      <>
                        Backtracked to <strong>{PAGE_LABELS[event.page] || event.page}</strong>
                        {event.from && <span style={{ color: theme.color.textMuted }}> from {PAGE_LABELS[event.from] || event.from}</span>}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ marginTop: 36, fontSize: 11, color: theme.color.textSubtle, textAlign: 'center' }}>
          Data is held in memory for this session only. Refresh the prototype to start fresh.
        </div>
      </div>
    </div>
  );
}
