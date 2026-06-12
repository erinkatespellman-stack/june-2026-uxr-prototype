import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';

// Researcher-facing planning doc for the moderated study behind this prototype.
// Opened from the book icon in the Adobe shell header. Static content — it's the
// study plan, kept alongside the live Session Report so both live in one place.

function Card({ title, caption, children }) {
  return (
    <section className="plan-card" style={{ marginBottom: 30 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px', letterSpacing: -0.2 }}>{title}</h2>
      {caption && <p style={{ fontSize: 13, color: theme.color.textMuted, margin: '0 0 14px', lineHeight: 1.5, maxWidth: 680 }}>{caption}</p>}
      <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '20px 22px' }}>
        {children}
      </div>
    </section>
  );
}

function Pill({ children, color = '#7A4DD0', bg = '#F1EAFB' }) {
  return (
    <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, color, background: bg, padding: '3px 10px', borderRadius: 999 }}>
      {children}
    </span>
  );
}

const th = { textAlign: 'left', fontSize: 11, fontWeight: 700, color: theme.color.textSubtle, textTransform: 'uppercase', letterSpacing: 0.4, padding: '0 12px 10px 0' };
const td = { fontSize: 13, color: theme.color.text, padding: '11px 12px 11px 0', borderTop: `1px solid ${theme.color.borderSoft}`, verticalAlign: 'top', lineHeight: 1.5 };

function ghostBtn() {
  return {
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
}

export default function ResearchPlan() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', color: theme.color.text, fontFamily: theme.font.family, padding: '48px 56px 80px' }}>
      <style>{`@media print { .no-print { display: none !important; } .plan-card { break-inside: avoid; } body { background: #FFF; } }`}</style>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
              Researcher View · Internal
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Research Plan</h1>
            <div style={{ fontSize: 13, color: theme.color.textMuted, marginTop: 6 }}>
              AI control preferences for amenity &amp; email-version creation · 50-min moderated interviews
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/report')} style={ghostBtn()}>View live report →</button>
            <button onClick={() => window.print()} style={ghostBtn()}>Print</button>
          </div>
        </div>

        <div style={{ height: 1, background: theme.color.border, margin: '24px 0 30px' }} />

        {/* 1. Decision */}
        <Card
          title="1 · The decision this informs"
          caption="We're roadmapping and budgeting how much autonomy to give the AI. Every finding should ladder up to one of three investment directions — judged separately for each AI moment."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { t: 'More control surfaces', d: 'Review gates, edit tools, approvals', i: 'Invest in UI & guardrails' },
              { t: 'More automation', d: 'AI does more, fewer steps', i: 'Invest in model & pipeline' },
              { t: 'Hold — "just right"', d: 'Current balance lands', i: 'Invest elsewhere' },
            ].map((x) => (
              <div key={x.t} style={{ border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.md, padding: '14px 16px' }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{x.t}</div>
                <div style={{ fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.5, marginBottom: 8 }}>{x.d}</div>
                <Pill color={theme.color.textMuted} bg="#F2F2F3">{x.i}</Pill>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: theme.color.textMuted, lineHeight: 1.55 }}>
            The deliverable isn't "people liked it" — it's a defensible read on <strong style={{ color: theme.color.text }}>where the dial should sit</strong>, separately for amenity generation and version generation.
          </div>
        </Card>

        {/* 2. Questions */}
        <Card title="2 · Research questions">
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, color: theme.color.text, lineHeight: 1.7 }}>
            <li>For <strong>amenity generation</strong> and <strong>email-version generation</strong> <em>(treat separately — feelings differ)</em>: do users want AI to have <strong>less / more / about-right</strong> control?</li>
            <li><strong>Why</strong> — what drives the preference? (trust, brand risk, time saved, accountability, craft/ownership)</li>
            <li><strong>Where's the line</strong> — at which exact step do they want a human gate vs. happy to let AI run?</li>
            <li>What would move someone from <em>"too automated"</em> → <em>"just right"</em>, and what's the cost of getting it wrong?</li>
          </ol>
        </Card>

        {/* 3. Recruit */}
        <Card
          title="3 · Who to recruit"
          caption="Talk to the actual creators, not just leaders. 8–10 total is right for moderated discovery feeding a roadmap — you'll hit saturation on the control themes before 10."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Segment</th>
                <th style={th}>Why</th>
                <th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>Target n</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Hands-on creators<br /><span style={{ color: theme.color.textMuted, fontSize: 12 }}>property / area marketing mgrs who build these emails today</span></td>
                <td style={td}>Primary users; feel the time/control tradeoff most</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>6</td>
              </tr>
              <tr>
                <td style={td}>Approvers / brand stewards<br /><span style={{ color: theme.color.textMuted, fontSize: 12 }}>sign off on guest comms</span></td>
                <td style={td}>Hold the "brand risk" view — drives gating needs</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>3–4</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 12.5, color: theme.color.textMuted, lineHeight: 1.55 }}>
            <strong style={{ color: theme.color.text }}>Screen for:</strong> created or approved guest comms in the last 3 months; mix of AI-skeptics and AI-enthusiasts so you don't over-index on early adopters.
          </div>
        </Card>

        {/* 4. Agenda */}
        <Card title="4 · The 50-minute agenda" caption="Roughly half the session is hands-on think-aloud in the prototype — that's where the real signal is.">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 70 }}>Time</th>
                <th style={th}>Segment</th>
                <th style={th}>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['0–5', 'Warm-up & role', "Current process, who touches it, what's painful today — baseline before AI bias creeps in"],
                ['5–10', 'Current-state', '"Walk me through how you create/approve one today." Capture effort & control now'],
                ['10–30', 'Task think-aloud', 'Hand them the prototype. Two tasks: (a) generate targeted amenities, (b) generate the RC Club version. They narrate; you stay quiet.'],
                ['30–42', 'Control probe', 'The dial exercise + targeted feelings questions (§5)'],
                ['42–48', 'Roadmap reactions', '"If we could improve only one thing — do more for you, or give you more control — which, and why?"'],
                ['48–50', 'Wrap', "Anything we didn't ask?"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td style={{ ...td, fontWeight: 600, whiteSpace: 'nowrap' }}>{r[0]}</td>
                  <td style={{ ...td, fontWeight: 500 }}>{r[1]}</td>
                  <td style={td}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* 5. Instrument */}
        <Card
          title="5 · The core instrument — the “control dial”"
          caption="Run it once per AI moment (amenities, then versions) so you get two clean reads. Keep it neutral."
        >
          <div style={{ background: '#F3EFFC', border: '1px solid #E2D5F6', borderRadius: theme.radius.md, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>Ask verbatim</div>
            <div style={{ fontSize: 14, color: theme.color.text, lineHeight: 1.6, fontStyle: 'italic' }}>
              “Picture a dial. One end: <strong>AI does it all, you just approve.</strong> Other end: <strong>you do it all, AI only assists when asked.</strong> Where would you set it for <em>this</em> — and where do you feel it sits in what you just used?”
            </div>
          </div>
          <div style={{ fontSize: 13, color: theme.color.text, fontWeight: 600, marginBottom: 8 }}>Capture three things each time</div>
          <ul style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 13, color: theme.color.text, lineHeight: 1.7 }}>
            <li><strong>Desired position</strong> (less / just-right / more AI control)</li>
            <li><strong>Perceived current position</strong> — the gap between the two is your signal</li>
            <li>The <strong>“why”</strong> verbatim</li>
          </ul>
          <div style={{ fontSize: 13, color: theme.color.text, fontWeight: 600, marginBottom: 8 }}>Follow-ups that produce roadmap gold</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.color.text, lineHeight: 1.7 }}>
            <li>“At which exact step would you want to <em>stop</em> and check the AI?” → where to put gates</li>
            <li>“What would have to be true for you to let it do <em>more</em>?” → trust-unlock backlog</li>
            <li>“What's the worst thing that happens if it gets this wrong?” → brand-risk weighting for budget</li>
            <li>“How much time would <em>just right</em> save you per version?” → ROI input for budgeting</li>
          </ul>
        </Card>

        {/* 6. Guardrails */}
        <Card title="6 · Guardrails so the data is trustworthy">
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.color.text, lineHeight: 1.75 }}>
            <li><strong>Don't ask “do you like the AI?”</strong> — ask what they'd change. Liking ≠ adoption.</li>
            <li><strong>Watch behavior, not just words.</strong> The prototype logs accept/edit/reject. If someone says “just right” but edits every section, that gap <em>is</em> the finding — reconcile the two in analysis.</li>
            <li><strong>Counterbalance task order</strong> — alternate which AI moment goes first to avoid order bias.</li>
            <li><strong>Separate amenities vs versions</strong> everywhere — don't let them blur.</li>
          </ul>
        </Card>

        {/* 7. Analysis */}
        <Card title="7 · Analysis → output">
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: theme.color.text, lineHeight: 1.75 }}>
            <li>Plot each participant on the <strong>less / just-right / more</strong> spectrum, per AI moment.</li>
            <li>Triangulate the <strong>stated dial vs. logged edit/reject rate</strong> — agreement = confidence; gap = nuance to dig into.</li>
            <li>Theme the “why” into <strong>trust-unlock requirements</strong> (what earns more autonomy) and <strong>non-negotiable gates</strong> (where humans must stay).</li>
            <li>One-page readout: <strong>recommended dial position + the 2–3 investments that move it there</strong>, sized by impact.</li>
          </ul>
        </Card>

        {/* 8. Logistics */}
        <Card title="8 · Logistics">
          <div style={{ fontSize: 13, color: theme.color.text, lineHeight: 1.7 }}>
            Consent + recording · 60-min calendar holds (50 active + buffer) · incentive · pilot the first session as a dry run and adjust · pipe the closing micro-survey response into the prototype so it appears in the{' '}
            <button onClick={() => navigate('/report')} style={{ background: 'none', border: 'none', padding: 0, color: theme.color.link, fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Study Summary report</button>{' '}
            alongside the behavioral data.
          </div>
        </Card>

        <div style={{ marginTop: 28, fontSize: 11, color: theme.color.textSubtle, textAlign: 'center' }}>
          Plan lives with the prototype · open the live data anytime from the report icon in the header.
        </div>
      </div>
    </div>
  );
}
