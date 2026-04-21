'use client';

import ProfileMenu from '@/components/ProfileMenu';
import AnalyticsBarChart from '@/components/AnalyticsBarChart';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type ApplicationRow = {
  id: string;
  status: string;
  applied_at: string;
  source: string | null;
  job_url?: string | null;
  jobs: {
    company: string;
    title: string;
    location?: string | null;
  } | null;
};

function getGreetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function groupCounts(items: string[]) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = item?.trim() || 'Unknown';
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

const demoApplications: ApplicationRow[] = [
  { id: '1', status: 'submitted', applied_at: '2026-04-01T12:00:00.000Z', source: 'LinkedIn', jobs: { company: 'Amazon', title: 'Security Program Manager', location: 'Seattle, WA' } },
  { id: '2', status: 'under_review', applied_at: '2026-04-02T12:00:00.000Z', source: 'Indeed', jobs: { company: 'Microsoft', title: 'Security Operations Analyst', location: 'Redmond, WA' } },
  { id: '3', status: 'interview', applied_at: '2026-04-03T12:00:00.000Z', source: 'Handshake', jobs: { company: 'Boeing', title: 'Corporate Security Specialist', location: 'Everett, WA' } },
  { id: '4', status: 'submitted', applied_at: '2026-04-04T12:00:00.000Z', source: 'Direct', jobs: { company: 'SpaceX', title: 'Security Systems Analyst', location: 'Los Angeles, CA' } },
  { id: '5', status: 'offer', applied_at: '2026-04-05T12:00:00.000Z', source: 'LinkedIn', jobs: { company: 'Stripe', title: 'Program Manager', location: 'Remote' } },
  { id: '6', status: 'submitted', applied_at: '2026-04-06T12:00:00.000Z', source: 'Indeed', jobs: { company: 'OpenAI', title: 'AI Research Operations', location: 'San Francisco, CA' } },
  { id: '7', status: 'under_review', applied_at: '2026-04-07T12:00:00.000Z', source: 'LinkedIn', jobs: { company: 'Meta', title: 'Security Operations Manager', location: 'New York, NY' } },
  { id: '8', status: 'submitted', applied_at: '2026-04-08T12:00:00.000Z', source: 'Direct', jobs: { company: 'Notion', title: 'Product Operations Lead', location: 'Austin, TX' } },
];

export default function DashboardPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('Candidate');
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [demoMode, setDemoMode] = useState(false);

  const [localTimeZone, setLocalTimeZone] = useState('UTC');
  const [localHour, setLocalHour] = useState<number>(9);

  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setLocalTimeZone(tz);
      setLocalHour(now.getHours());
    };

    updateLocalTime();
    const interval = setInterval(updateLocalTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(() => getGreetingForHour(localHour), [localHour]);

  const loadDashboardData = async () => {
    const demoEnabled =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('demo') === '1';

    setDemoMode(demoEnabled);

    if (demoEnabled) {
      setFullName('Guest Candidate');
      setApplications(demoApplications);
      setUnreadMessagesCount(3);
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData?.full_name) {
      setFullName(profileData.full_name);
    } else if (user.email) {
      setFullName(user.email.split('@')[0]);
    }

    const { data: applicationsData } = await supabase
      .from('applications')
      .select('id, status, applied_at, source, job_url, jobs:job_id(company, title, location)')
      .eq('candidate_id', user.id)
      .order('applied_at', { ascending: false });

    setApplications((applicationsData as any) || []);

    const { data: participantRows } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    const conversationIds = (participantRows || []).map((row: any) => row.conversation_id);

    if (conversationIds.length > 0) {
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, sender_id, read_by, conversation_id')
        .in('conversation_id', conversationIds);

      const unreadCount = (messagesData || []).filter(
        (message: any) =>
          message.sender_id !== user.id &&
          !(message.read_by || []).includes(user.id)
      ).length;

      setUnreadMessagesCount(unreadCount);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalApplications = applications.length;
  const distinctCompanies = new Set(
    applications.map((a) => a.jobs?.company || 'Unknown')
  ).size;
  const interviewCount = applications.filter((a) =>
    ['interview', 'interview_scheduled'].includes((a.status || '').toLowerCase())
  ).length;
  const offerCount = applications.filter((a) =>
    ['offer', 'offered'].includes((a.status || '').toLowerCase())
  ).length;

  const companyCounts = groupCounts(applications.map((a) => a.jobs?.company || 'Unknown')).slice(0, 6);
  const locationCounts = groupCounts(applications.map((a) => a.jobs?.location || 'Unknown')).slice(0, 6);
  const statusCounts = groupCounts(applications.map((a) => a.status || 'unknown'));
  const sourceCounts = groupCounts(applications.map((a) => a.source || 'Unknown'));
  const recentApplications = applications.slice(0, 8);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 56px) clamp(18px, 3vw, 32px) 70px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '20px',
          }}
        >
          <ProfileMenu />
        </div>

        {demoMode && (
          <div
            style={{
              marginBottom: '18px',
              padding: '14px 16px',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              display: 'flex',
              justifyContent: 'space-between',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Candidate Demo Mode Active
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                This is a guest candidate view using curated demo analytics for class exploration.
              </div>
            </div>

            <Link href="/dashboard" style={actionLink}>
              Exit Demo Mode
            </Link>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start',
            marginBottom: '42px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                marginBottom: '18px',
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
              }}
            >
              Candidate Analytics Surface
            </div>

            <h1
              style={{
                fontSize: 'clamp(38px, 8vw, 78px)',
                lineHeight: 0.94,
                letterSpacing: '-0.05em',
                margin: '0 0 10px',
                fontWeight: 800,
              }}
            >
              {greeting},
              <br />
              {fullName}
            </h1>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: '0 0 18px',
              }}
            >
              Local time zone: {localTimeZone}
            </p>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: 'clamp(18px, 2.8vw, 24px)',
                lineHeight: 1.4,
                maxWidth: '860px',
                margin: '0 0 24px',
              }}
            >
              See how your search is performing across companies, locations, sources,
              and status changes from one command dashboard.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
              }}
            >
              {[
                { label: 'Total Applications', value: totalApplications },
                { label: 'Companies Applied To', value: distinctCompanies },
                { label: 'Interviews', value: interviewCount },
                { label: 'Offers', value: offerCount },
              ].map((item) => (
                <div key={item.label} style={metricCardStyle}>
                  <div style={metricLabelStyle}>{item.label}</div>
                  <div style={metricValueStyle}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={heroPanelStyle}>
            <div style={heroInnerStyle}>
              <div style={panelHeading}>Live Application Snapshot</div>

              <div
                style={{
                  fontSize: 'clamp(28px, 5vw, 54px)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '12px',
                }}
              >
                {totalApplications} active
                <br />
                application records
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Review where you apply most, which companies dominate your search,
                and how your pipeline is progressing.
              </div>

              <div style={progressTrack}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(8, totalApplications * 8))}%`,
                    height: '100%',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div style={heroFooterStyle}>
                <span>Search Active</span>
                <span>{demoMode ? 'Demo Ready' : 'Visibility Enabled'}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading analytics...</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px',
                marginBottom: '18px',
              }}
            >
              <AnalyticsBarChart title="Applications by Company" items={companyCounts} emptyText="No company data yet." />
              <AnalyticsBarChart title="Applications by Location" items={locationCounts} emptyText="No location data yet." />
              <AnalyticsBarChart title="Applications by Status" items={statusCounts} emptyText="No status data yet." />
              <AnalyticsBarChart title="Applications by Source" items={sourceCounts} emptyText="No source data yet." />
            </div>

            <div style={panelStyle}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                }}
              >
                <div style={panelHeading}>Recent Applications</div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/jobs" style={actionLinkPrimary}>Browse Jobs</Link>
                  <Link href="/recommended-jobs" style={actionLink}>Recommended Jobs</Link>
                  <Link href="/resume-match" style={actionLink}>Resume Match</Link>
                  <Link href="/resume-builder" style={actionLink}>Resume Builder</Link>
                  <Link href="/messages" style={actionLink}>Messages</Link>
                </div>
              </div>

              {recentApplications.length === 0 ? (
                <div style={{ color: '#94a3b8', padding: '12px 0' }}>No applications yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {['Company', 'Role', 'Location', 'Source', 'Status', 'Applied'].map((heading) => (
                          <th key={heading} style={tableHeadingStyle}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((application) => (
                        <tr key={application.id}>
                          <td style={cellStyle}>{application.jobs?.company || 'Unknown'}</td>
                          <td style={cellStyle}>{application.jobs?.title || 'Unknown'}</td>
                          <td style={cellStyle}>{application.jobs?.location || 'Unknown'}</td>
                          <td style={cellStyle}>{application.source || 'Unknown'}</td>
                          <td style={cellStyle}>{application.status || 'Unknown'}</td>
                          <td style={cellStyle}>
                            {application.applied_at
                              ? new Date(application.applied_at).toLocaleDateString()
                              : 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

const metricCardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
  padding: '18px',
};

const metricLabelStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '10px',
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '34px',
  fontWeight: 800,
  letterSpacing: '-0.04em',
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
  padding: '22px',
};

const heroPanelStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.1)',
  background: '#05080d',
  padding: '22px',
  boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
};

const heroInnerStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  padding: '28px',
  background: 'linear-gradient(180deg, #070b12 0%, #03060b 100%)',
};

const panelHeading: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '14px',
};

const progressTrack: React.CSSProperties = {
  height: '10px',
  background: 'rgba(255,255,255,0.08)',
  marginBottom: '10px',
  overflow: 'hidden',
};

const heroFooterStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const cellStyle: React.CSSProperties = {
  padding: '12px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: '#e2e8f0',
  fontSize: '14px',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: '#f8fafc',
};

const tableHeadingStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '12px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  color: '#94a3b8',
  fontSize: '11px',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
};

const actionLinkPrimary: React.CSSProperties = {
  background: '#ffffff',
  color: '#020406',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
};

const actionLink: React.CSSProperties = {
  background: 'transparent',
  color: '#f8fafc',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
};
