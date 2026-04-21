'use client';

import ProfileMenu from '@/components/ProfileMenu';
import AnalyticsBarChart from '@/components/AnalyticsBarChart';
import { EmptyState } from '@/components/UiPolish';
import {
  demoRecruiterApplications,
  demoRecruiterJobs,
  demoRecruiterProfile,
  demoUnreadMessagesCount,
} from '@/lib/demo/recruiterDemo';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type JobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  status: string | null;
  experience_level: string | null;
  certifications_required?: string[] | null;
};

type ApplicationRow = {
  id: string;
  status: string | null;
  applied_at: string | null;
  job_id: string;
};

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

export default function RecruiterDashboardPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('Recruiter');
  const [company, setCompany] = useState('');
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  const loadRecruiterData = async () => {
    setLoading(true);

    const demoEnabled =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('demo') === '1';

    setDemoMode(demoEnabled);

    if (demoEnabled) {
      setFullName(demoRecruiterProfile.fullName);
      setCompany(demoRecruiterProfile.company);
      setJobs(demoRecruiterJobs);
      setApplications(demoRecruiterApplications);
      setUnreadMessagesCount(demoUnreadMessagesCount);
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
      .select('full_name, company')
      .eq('id', user.id)
      .maybeSingle();

    if (profileData?.full_name) {
      setFullName(profileData.full_name);
    } else if (user.email) {
      setFullName(user.email.split('@')[0]);
    }

    setCompany(profileData?.company || '');

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('id, title, company, location, status, experience_level, certifications_required')
      .eq('recruiter_id', user.id)
      .order('created_at', { ascending: false });

    const recruiterJobs = (jobsData as JobRow[]) || [];
    setJobs(recruiterJobs);

    const jobIds = recruiterJobs.map((job) => job.id);

    if (jobIds.length > 0) {
      const { data: applicationsData } = await supabase
        .from('applications')
        .select('id, status, applied_at, job_id')
        .in('job_id', jobIds)
        .order('applied_at', { ascending: false });

      setApplications((applicationsData as ApplicationRow[]) || []);
    } else {
      setApplications([]);
    }

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
    } else {
      setUnreadMessagesCount(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadRecruiterData();
  }, []);

  const jobsCount = jobs.length;
  const openJobsCount = jobs.filter((job) => (job.status || '').toLowerCase() === 'open').length;
  const applicantsCount = applications.length;
  const certificationRequiredCount = jobs.filter(
    (job) => Array.isArray(job.certifications_required) && job.certifications_required.length > 0
  ).length;

  const jobLookup = useMemo(() => {
    const map = new Map<string, JobRow>();
    for (const job of jobs) {
      map.set(job.id, job);
    }
    return map;
  }, [jobs]);

  const applicationsByJob = groupCounts(
    applications.map((a) => jobLookup.get(a.job_id)?.title || 'Unknown')
  ).slice(0, 6);

  const applicationsByLocation = groupCounts(
    applications.map((a) => jobLookup.get(a.job_id)?.location || 'Unknown')
  ).slice(0, 6);

  const jobsByLevel = groupCounts(
    jobs.map((job) => job.experience_level || 'Unknown')
  );

  const recentJobs = jobs.slice(0, 8);

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
                Recruiter Demo Mode Active
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                This view is using curated demo analytics so you can showcase the platform even without live recruiter data.
              </div>
            </div>

            <Link href="/recruiter/dashboard" style={actionLink}>
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
              Recruiter Analytics Surface
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
              Recruiter
              <br />
              analytics
            </h1>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: 'clamp(18px, 2.8vw, 24px)',
                lineHeight: 1.4,
                maxWidth: '860px',
                margin: '0 0 18px',
              }}
            >
              Monitor job posting performance, applicant volume, job level demand,
              and certification-based openings from one command surface.
            </p>

            <p
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                margin: 0,
              }}
            >
              {fullName}{company ? ` • ${company}` : ''}
            </p>
          </div>

          <div style={heroPanelStyle}>
            <div style={heroInnerStyle}>
              <div style={panelHeading}>Live Recruiter Snapshot</div>

              <div
                style={{
                  fontSize: 'clamp(28px, 5vw, 54px)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '12px',
                }}
              >
                {applicantsCount} active
                <br />
                applicant records
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Track hiring demand by job, location, and level while monitoring
                message activity and open roles.
              </div>

              <div style={progressTrack}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(10, applicantsCount * 6))}%`,
                    height: '100%',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div style={heroFooterStyle}>
                <span>Pipeline Active</span>
                <span>{demoMode ? 'Demo Ready' : 'Visibility Enabled'}</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading recruiter analytics...</p>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '14px',
                marginBottom: '18px',
              }}
            >
              {[
                { label: 'Total Job Postings', value: jobsCount },
                { label: 'Open Jobs', value: openJobsCount },
                { label: 'Total Applicants', value: applicantsCount },
                { label: 'Unread Messages', value: unreadMessagesCount },
              ].map((item) => (
                <div key={item.label} style={metricCardStyle}>
                  <div style={metricLabelStyle}>{item.label}</div>
                  <div style={metricValueStyle}>{item.value}</div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '18px',
                marginBottom: '18px',
              }}
            >
              <AnalyticsBarChart title="Applications by Job" items={applicationsByJob} emptyText="No application data yet." />
              <AnalyticsBarChart title="Applications by Location" items={applicationsByLocation} emptyText="No location data yet." />
              <AnalyticsBarChart title="Jobs by Experience Level" items={jobsByLevel} emptyText="No job level data yet." />

              <div style={panelStyle}>
                <div style={panelHeading}>Recruiter Summary</div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <div style={summaryRowStyle}>
                    <span>Certification-Required Jobs</span>
                    <strong>{certificationRequiredCount}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>Tracked Levels</span>
                    <strong>{jobsByLevel.length}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>Most Applied Jobs</span>
                    <strong>{applicationsByJob.length}</strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>Most Applied Locations</span>
                    <strong>{applicationsByLocation.length}</strong>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <Link href="/recruiter/jobs" style={actionLinkPrimary}>Manage Jobs</Link>
                    <Link href="/messages" style={actionLink}>Messages</Link>
                    <Link href="/profile" style={actionLink}>Profile</Link>
                    <Link href="/recruiter/dashboard?demo=1" style={actionLink}>Demo Mode</Link>
                  </div>
                </div>
              </div>
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
                <div style={panelHeading}>Recent Job Postings</div>

                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                  }}
                >
                  {demoMode ? 'Portfolio Showcase View' : 'Live Recruiter Data'}
                </div>
              </div>

              {recentJobs.length === 0 ? (
                <div style={emptyStyle}>No jobs posted yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        {['Job Title', 'Company', 'Location', 'Level', 'Status', 'Certifications'].map((heading) => (
                          <th key={heading} style={tableHeadingStyle}>{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentJobs.map((job) => (
                        <tr key={job.id}>
                          <td style={cellStyle}>{job.title || 'Unknown'}</td>
                          <td style={cellStyle}>{job.company || 'Unknown'}</td>
                          <td style={cellStyle}>{job.location || 'Unknown'}</td>
                          <td style={cellStyle}>{job.experience_level || 'Unknown'}</td>
                          <td style={cellStyle}>{job.status || 'Unknown'}</td>
                          <td style={cellStyle}>
                            {Array.isArray(job.certifications_required) && job.certifications_required.length > 0
                              ? job.certifications_required.join(', ')
                              : 'None'}
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

const summaryRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: '#e2e8f0',
};

const emptyStyle: React.CSSProperties = {
  color: '#94a3b8',
  padding: '12px 0',
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


