import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../components/Shell';
import EmailPreview from '../components/EmailPreview';
import theme from '../theme';
import { trackPageVisit, trackClick } from '../tracking/sessionTracker';
import { useVersions } from '../store/versionsStore';

function ColumnHeader({ label, persona, audience, color }) {
  return (
    <div
      style={{
        background: '#FFFFFF',
        borderBottom: `1px solid ${theme.color.border}`,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
          <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        </div>
        <div style={{ fontSize: 11.5, color: theme.color.textMuted, marginTop: 3 }}>
          {persona} · {audience}
        </div>
      </div>
    </div>
  );
}

export default function CompareVersions() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const versions = useVersions();

  const leftKey = params.get('left') || 'default';
  const rightKey = params.get('right') || 'rc-club';
  const from = params.get('from'); // 'rc-club' if opened from the editor

  const left = useMemo(() => versions.find((v) => v.key === leftKey) || versions[0], [versions, leftKey]);
  const right = useMemo(() => versions.find((v) => v.key === rightKey) || versions[1], [versions, rightKey]);

  useEffect(() => {
    trackPageVisit('compare_versions');
  }, []);

  const closeDestination = from === 'rc-club' ? '/versions/rc-club?from=compare' : '/versions';
  const closeLabel = from === 'rc-club' ? 'Back to editor' : 'Close compare';

  return (
    <Shell
      propertyName="The Ritz-Carlton, Amelia Island"
      propertyCode="AXAM"
      breadcrumbs={['Email', 'Versions', 'Compare']}
      headerRight={
        <button
          onClick={() => {
            trackClick('close_compare', { from: from || 'grid' });
            navigate(closeDestination);
          }}
          style={{
            background: '#FFFFFF',
            color: theme.color.text,
            border: `1px solid ${theme.color.borderStrong}`,
            borderRadius: theme.radius.md,
            padding: '7px 14px',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {closeLabel}
        </button>
      }
    >
      <main
        style={{
          flex: 1,
          background: theme.color.appBg,
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            borderRight: `1px solid ${theme.color.border}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ColumnHeader
            label={left.name}
            persona={`${left.persona} guests`}
            audience={left.key === 'rc-club' ? '~84 / month' : '~1,200 / month'}
            color={left.key === 'rc-club' ? theme.color.primary : '#7A7A7A'}
          />
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 80px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <EmailPreview variant={left.variant} width={520} />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#FAFCFE',
          }}
        >
          <ColumnHeader
            label={right.name}
            persona={`${right.persona} guests`}
            audience={right.key === 'rc-club' ? '~84 / month' : '~1,200 / month'}
            color={right.key === 'rc-club' ? theme.color.primary : '#7A7A7A'}
          />
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px 80px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <EmailPreview variant={right.variant} width={520} />
            </div>
          </div>
        </div>
      </main>
    </Shell>
  );
}
