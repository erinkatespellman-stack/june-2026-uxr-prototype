import React from 'react';
import { useNavigate } from 'react-router-dom';
import theme from '../theme';
import Shell from '../components/Shell';

// Stakeholder-facing plan for the moderated study behind this prototype, written
// for a marketing audience (plain language, no research jargon). Opened from the
// book icon in the Adobe shell header and kept alongside the live Study Summary.

function Card({ title, caption, children }) {
  return (
    <section className="plan-card" style={{ marginBottom: 30 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 4px', letterSpacing: -0.2 }}>{title}</h2>
      {caption && <p style={{ fontSize: 15, color: theme.color.textMuted, margin: '0 0 14px', lineHeight: 1.5, maxWidth: 680 }}>{caption}</p>}
      <div style={{ background: '#FFFFFF', border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.lg, padding: '20px 22px' }}>
        {children}
      </div>
    </section>
  );
}

function Pill({ children, color = '#7A4DD0', bg = '#F1EAFB' }) {
  return (
    <span style={{ display: 'inline-block', fontSize: 14, fontWeight: 600, color, background: bg, padding: '3px 10px', borderRadius: 999 }}>
      {children}
    </span>
  );
}

const th = { textAlign: 'left', fontSize: 13, fontWeight: 700, color: theme.color.textSubtle, textTransform: 'uppercase', letterSpacing: 0.4, padding: '0 12px 10px 0' };
const td = { fontSize: 15, color: theme.color.text, padding: '11px 12px 11px 0', borderTop: `1px solid ${theme.color.borderSoft}`, verticalAlign: 'top', lineHeight: 1.5 };

function ghostBtn() {
  return {
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
}

export default function ResearchPlan() {
  const navigate = useNavigate();

  return (
    <Shell breadcrumbs={['Research', 'Research Plan']}>
      <main style={{ flex: 1, overflowY: 'auto', background: '#FAFAFA', color: theme.color.text, padding: '48px 56px 80px' }}>
        <style>{`@media print { .no-print { display: none !important; } .plan-card { break-inside: avoid; } body { background: #FFF; } }`}</style>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ fontSize: 13, color: theme.color.textMuted, fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 8 }}>
              For the Marriott marketing team
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 600, margin: 0, letterSpacing: -0.5 }}>Research Plan</h1>
            <div style={{ fontSize: 15, color: theme.color.textMuted, marginTop: 6 }}>
              Whether audience versioning is worth it, and how much AI should help create it · 30-minute interviews
            </div>
          </div>
          <div className="no-print" style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => window.print()} style={ghostBtn()}>Print</button>
          </div>
        </div>

        <div style={{ height: 1, background: theme.color.border, margin: '24px 0 24px' }} />

        {/* Plain-English intro */}
        <div style={{ background: '#F3EFFC', border: '1px solid #E2D5F6', borderRadius: theme.radius.lg, padding: '18px 20px', marginBottom: 30 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>In plain terms</div>
          <div style={{ fontSize: 16.5, color: theme.color.text, lineHeight: 1.6 }}>
            We're sitting down with the people who create these guest emails to answer two questions. First, the basic one: <strong>is creating audience versions even worth it, would they use it, and is the effort worth the payoff?</strong> Then, if it is: <strong>how much should AI do the work, and where do they want to stay in control?</strong> Their answers tell us where to spend next year's time and budget.
          </div>
        </div>

        {/* 1. Why */}
        <Card
          title="1 · Why we're doing this"
          caption="Two things drive the roadmap. First: is versioning worth building at all? If the team won't use it, or the effort outweighs the payoff, that's the answer. If it is worth it, then the second question (how much should AI handle) points to one of three directions below (judged separately for amenities and email versions)."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { t: 'Give people more control', d: 'Add review steps, edit tools, and approvals before anything goes out', i: 'Build more guardrails' },
              { t: 'Let AI do more', d: 'Fewer steps, more done for them automatically', i: 'Invest in the AI' },
              { t: 'Leave it about as-is', d: 'The balance already feels right', i: 'Spend budget elsewhere' },
            ].map((x) => (
              <div key={x.t} style={{ border: `1px solid ${theme.color.border}`, borderRadius: theme.radius.md, padding: '14px 16px' }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{x.t}</div>
                <div style={{ fontSize: 14.5, color: theme.color.textMuted, lineHeight: 1.5, marginBottom: 8 }}>{x.d}</div>
                <Pill color={theme.color.textMuted} bg="#F2F2F3">{x.i}</Pill>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, fontSize: 15, color: theme.color.textMuted, lineHeight: 1.55 }}>
            The goal isn't "did people like it?" It's a clear answer to <strong style={{ color: theme.color.text }}>whether versioning is worth it</strong>, and if so, <strong style={{ color: theme.color.text }}>how much AI should do</strong>, for amenities and for email versions.
          </div>
        </Card>

        {/* 2. What we want to learn */}
        <Card title="2 · What we want to learn">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>First: is versioning worth it?</div>
          <ol style={{ margin: '0 0 18px', paddingLeft: 20, fontSize: 15.5, color: theme.color.text, lineHeight: 1.7 }}>
            <li><strong>Would they create audience versions at all?</strong> Even setting AI aside, is a tailored version per segment something they'd want?</li>
            <li><strong>How often would they really use it?</strong> Every campaign, now and then, or rarely?</li>
            <li><strong>Is the effort worth it?</strong> Does creating <em>and managing</em> versions feel worth the payoff?</li>
            <li>And a gut-check on language: <strong>what do they even picture when we say "amenities"?</strong></li>
          </ol>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 8 }}>Then: how much AI?</div>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 15.5, color: theme.color.text, lineHeight: 1.7 }}>
            <li>For amenities and for email versions <em>(asked separately, since people often feel differently)</em>: do they want AI to do <strong>less, more, or about the same?</strong></li>
            <li><strong>Why they feel that way</strong>: trust, protecting the brand, saving time, who's accountable, or wanting a personal touch?</li>
            <li><strong>Where's their line</strong>: which step do they want to check by hand, and where are they happy to let AI run?</li>
          </ol>
        </Card>

        {/* 3. Who */}
        <Card
          title="3 · Who we'll talk to"
          caption="We want the people who actually do this work, not just their managers. Eight to ten people is plenty. By then we're hearing the same things over and over."
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Who</th>
                <th style={th}>Why them</th>
                <th style={{ ...th, textAlign: 'right', paddingRight: 0 }}>How many</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>Marketers who build these emails today<br /><span style={{ color: theme.color.textMuted, fontSize: 14 }}>property &amp; area marketing managers</span></td>
                <td style={td}>They live the trade-off between speed and control every day</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>6</td>
              </tr>
              <tr>
                <td style={td}>People who approve guest emails<br /><span style={{ color: theme.color.textMuted, fontSize: 14 }}>brand reviewers / sign-off</span></td>
                <td style={td}>They care most about protecting the brand, which shapes what needs a sign-off step</td>
                <td style={{ ...td, textAlign: 'right', fontWeight: 600, paddingRight: 0 }}>3–4</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 14, fontSize: 14.5, color: theme.color.textMuted, lineHeight: 1.55 }}>
            <strong style={{ color: theme.color.text }}>We'll look for:</strong> people who've created or approved guest emails in the last 3 months, with a mix of AI fans and AI skeptics so we don't only hear from early adopters.
          </div>
        </Card>

        {/* 4. Session */}
        <Card title="4 · How each 30-minute session runs" caption="A big chunk is hands-on in the prototype while they talk us through their thinking. That's where we learn the most.">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...th, width: 80 }}>Time</th>
                <th style={th}>What we do</th>
                <th style={th}>Why</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['0–3 min', 'Warm-up', "How they work today and what's frustrating, before AI even comes up"],
                ['3–7 min', 'How they do it now', '"Walk me through making or approving one of these today." We note effort, control, and whether versions feel worth it'],
                ['7–18 min', 'They try the prototype', 'Two tasks: create targeted amenities, then create the RC Club email version. They talk out loud while we mostly listen'],
                ['18–25 min', 'The key questions', 'Is versioning worth it (use / frequency / effort), then the AI "dial" exercise (see section 5)'],
                ['25–29 min', "What they'd improve", '"If we could fix one thing, do more for you or give you more control, which, and why?"'],
                ['29–30 min', 'Wrap up', "Anything we didn't ask about?"],
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

        {/* 5. The dial */}
        <Card
          title="5 · The main question: the “control dial”"
          caption="We ask this once about amenities and once about email versions, so we get a clear read on each. We keep it neutral and let them answer without nudging."
        >
          <div style={{ background: '#F3EFFC', border: '1px solid #E2D5F6', borderRadius: theme.radius.md, padding: '16px 18px', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7A4DD0', letterSpacing: 0.4, textTransform: 'uppercase', marginBottom: 6 }}>What we ask, word for word</div>
            <div style={{ fontSize: 16, color: theme.color.text, lineHeight: 1.6, fontStyle: 'italic' }}>
              “Picture a dial. One end: <strong>AI does it all, you just approve.</strong> Other end: <strong>you do it all, AI only helps when you ask.</strong> Where would you set it for <em>this</em>, and where does it feel like it sits in what you just used?”
            </div>
          </div>
          <div style={{ fontSize: 15, color: theme.color.text, fontWeight: 600, marginBottom: 8 }}>We write down three things each time</div>
          <ul style={{ margin: '0 0 16px', paddingLeft: 20, fontSize: 15, color: theme.color.text, lineHeight: 1.7 }}>
            <li>Where they'd <strong>set the dial</strong>: less, just right, or more AI</li>
            <li>Where they think it <strong>sits today</strong>: the gap between the two is the real insight</li>
            <li>Their <strong>reason</strong>, in their own words</li>
          </ul>
          <div style={{ fontSize: 15, color: theme.color.text, fontWeight: 600, marginBottom: 8 }}>Good follow-up questions</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: theme.color.text, lineHeight: 1.7 }}>
            <li>“Which step would you want to stop and double-check the AI?” → shows us where to add a sign-off</li>
            <li>“What would it take for you to let AI do more?” → our list of trust-builders to invest in</li>
            <li>“What's the worst that happens if it gets it wrong?” → how much brand risk is on the line</li>
            <li>“How much time would the right balance save you each time?” → helps justify the budget</li>
          </ul>
          <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${theme.color.borderSoft}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/research/console')}
              style={{ background: '#7A4DD0', color: '#FFFFFF', border: 'none', borderRadius: theme.radius.pill, padding: '10px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              ＋ Capture answers in the console
            </button>
            <span style={{ fontSize: 14, color: theme.color.textMuted }}>Record each participant's dial answers as you interview. They flow straight into the results.</span>
          </div>
        </Card>

        {/* 6. Keeping it honest */}
        <Card title="6 · How we'll keep the findings honest" caption="A few habits that stop us from fooling ourselves.">
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: theme.color.text, lineHeight: 1.75 }}>
            <li><strong>Ask what they'd change, not whether they liked it.</strong> Liking something isn't the same as using it.</li>
            <li><strong>Watch what they do, not just what they say.</strong> The prototype quietly tracks when people accept, edit, or redo the AI's work. If someone says “just right” but rewrites everything, that gap is the real story.</li>
            <li><strong>Switch up the order.</strong> Half the group starts with amenities, half with email versions, so the order doesn't skew the results.</li>
            <li><strong>Keep amenities and email versions separate</strong> so the two don't blur together.</li>
          </ul>
        </Card>

        {/* 7. What you get */}
        <Card title="7 · What you'll get at the end">
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 15, color: theme.color.text, lineHeight: 1.75 }}>
            <li>A simple picture of where each person landed (less / just right / more) for amenities and for versions.</li>
            <li>A check of <strong>what they said against what they actually did</strong> (accepted, edited, or redid the AI's work). When those match, we're confident; when they don't, there's something worth a closer look.</li>
            <li>Their reasons grouped into two lists: <strong>what would earn AI more trust</strong>, and <strong>the steps people always want a human to keep.</strong></li>
            <li>A <strong>one-page summary</strong>: how much AI should do, plus the 2–3 things to invest in to get there, ranked by impact.</li>
          </ul>
        </Card>

        {/* 8. Practical */}
        <Card title="8 · The practical bits">
          <div style={{ fontSize: 15, color: theme.color.text, lineHeight: 1.7 }}>
            Get permission to record · book 40-minute slots (30 to talk, plus a buffer) · offer a thank-you incentive · run the very first session as a practice round and adjust · and the quick feedback question at the end flows straight into the{' '}
            <button onClick={() => navigate('/report')} style={{ background: 'none', border: 'none', padding: 0, color: theme.color.link, fontWeight: 600, cursor: 'pointer', fontSize: 15, fontFamily: 'inherit' }}>live results report</button>{' '}
            so you can see it next to what people actually did.
          </div>
        </Card>

        <div style={{ marginTop: 28, fontSize: 13, color: theme.color.textSubtle, textAlign: 'center' }}>
          This plan lives with the prototype · see the live results anytime from the chart icon in the top bar.
        </div>
        </div>
      </main>
    </Shell>
  );
}
