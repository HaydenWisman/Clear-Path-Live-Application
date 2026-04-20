'use client';
import ProfileMenu from '@/components/ProfileMenu';

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

export default function DashboardPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('Candidate');
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const [localTimeZone, setLocalTimeZone] = useState('UTC');
  const [localHour, setLocalHour] = useState<number>(9);

  const [showDirectForm, setShowDirectForm] = useState(false);
  const [directUrl, setDirectUrl] = useState('');
  const [directTitle, setDirectTitle] = useState('');
  const [directCompany, setDirectCompany] = useState('');
  const [directAppliedDate, setDirectAppliedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [savingDirect, setSavingDirect] = useState(false);
  const [directMessage, setDirectMessage] = useState('');
  const [directError, setDirectError] = useState('');

  useEffect(() => {
    const updateLocalTime = () => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      setLocalTimeZone(tz);
      setLocalHour(now.getHours());
    };

    updateLocalTime();
    const interval = setInterval(updateLocalTime, 60_000);
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(() => getGreetingForHour(localHour), [localHour]);

  const loadDashboardData = async () => {
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
  }, [supabase]);

  const guessCompanyFromUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace('www.', '');
      const firstPart = hostname.split('.')[0];
      if (!firstPart) return '';
      return firstPart
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    } catch {
      return '';
    }
  };

  const handleDirectUrlChange = (value: string) => {
    setDirectUrl(value);

    if (!directCompany.trim()) {
      const guessed = guessCompanyFromUrl(value);
      if (guessed) {
        setDirectCompany(guessed);
      }
    }
  };

  const saveDirectApplication = async () => {
    setSavingDirect(true);
    setDirectMessage('');
    setDirectError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setDirectError('You must be logged in.');
      setSavingDirect(false);
      return;
    }

    if (!directUrl.trim() || !directTitle.trim() || !directCompany.trim()) {
      setDirectError('Please fill in the job URL, title, and company.');
      setSavingDirect(false);
      return;
    }

    const appliedAtIso = new Date(`${directAppliedDate}T12:00:00`).toISOString();

    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert({
        recruiter_id: user.id,
        title: directTitle,
        company: directCompany,
        location: 'External / Direct',
        description: 'Imported by candidate from external direct application link.',
        status: 'open',
      })
      .select()
      .single();

    if (jobError) {
      setDirectError(jobError.message);
      setSavingDirect(false);
      return;
    }

    const { error: applicationError } = await supabase
      .from('applications')
      .insert({
        candidate_id: user.id,
        job_id: jobData.id,
        status: 'submitted',
        source: 'Direct',
        applied_at: appliedAtIso,
        job_url: directUrl,
      });

    if (applicationError) {
      setDirectError(applicationError.message);
      setSavingDirect(false);
      return;
    }

    setDirectMessage('Direct application saved successfully.');
    setDirectUrl('');
    setDirectTitle('');
    setDirectCompany('');
    setDirectAppliedDate(new Date().toISOString().split('T')[0]);
    setShowDirectForm(false);
    setSavingDirect(false);

    await loadDashboardData();
  };

  const topApplications = applications.slice(0, 6);

  const getProgress = (status: string) => {
    switch (status) {
      case 'offer':
        return 94;
      case 'interview':
        return 82;
      case 'under_review':
        return 51;
      case 'submitted':
        return 33;
      case 'withdrawn':
        return 20;
      case 'rejected':
        return 15;
      default:
        return 25;
    }
  };

  const getStageLabel = (status: string) => {
    switch (status) {
      case 'offer':
        return 'Offer';
      case 'interview':
        return 'Interview';
      case 'under_review':
        return 'Under Review';
      case 'submitted':
        return 'Submitted';
      case 'withdrawn':
        return 'Withdrawn';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const totalApplications = applications.length;
  const advancing = applications.filter((a) =>
    ['interview', 'offer', 'under_review'].includes(a.status)
  ).length;
  const matchSignal = totalApplications > 0 ? 82 : 0;

  const chipStyle: React.CSSProperties = {
    padding: '10px 14px',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    background: 'rgba(255,255,255,0.02)',
    textDecoration: 'none',
  };

  const metricCardStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
    padding: '18px',
  };

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
          padding: '56px 32px 70px',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
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
              Candidate Surface
            </div>

            <h1
              style={{
                fontSize: '78px',
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
                fontSize: '24px',
                lineHeight: 1.4,
                maxWidth: '860px',
                margin: '0 0 24px',
              }}
            >
              Your live command view for application progress, recruiting activity,
              and next-step momentum.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <a href="https://www.linkedin.com/login" target="_blank" rel="noreferrer" style={chipStyle}>
                LinkedIn
              </a>

              <a href="https://secure.indeed.com/account/login" target="_blank" rel="noreferrer" style={chipStyle}>
                Indeed
              </a>

              <a href="https://app.joinhandshake.com/login" target="_blank" rel="noreferrer" style={chipStyle}>
                Handshake
              </a>

              <button
                onClick={() => setShowDirectForm(!showDirectForm)}
                style={{ ...chipStyle, cursor: 'pointer' }}
              >
                Add Direct URL
              </button>
            </div>

            {showDirectForm && (
              <div
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  padding: '18px',
                  marginBottom: '26px',
                }}
              >
                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '14px',
                  }}
                >
                  Add Direct Application
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                  <input
                    value={directUrl}
                    onChange={(e) => handleDirectUrlChange(e.target.value)}
                    placeholder="Job posting URL"
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: '#0b1118',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input
                      value={directTitle}
                      onChange={(e) => setDirectTitle(e.target.value)}
                      placeholder="Job title"
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#0b1118',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxSizing: 'border-box',
                      }}
                    />

                    <input
                      value={directCompany}
                      onChange={(e) => setDirectCompany(e.target.value)}
                      placeholder="Company name"
                      style={{
                        width: '100%',
                        padding: '14px',
                        background: '#0b1118',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <input
                    type="date"
                    value={directAppliedDate}
                    onChange={(e) => setDirectAppliedDate(e.target.value)}
                    style={{
                      width: '240px',
                      padding: '14px',
                      background: '#0b1118',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={saveDirectApplication}
                      disabled={savingDirect}
                      style={{
                        background: '#ffffff',
                        color: '#020406',
                        textDecoration: 'none',
                        padding: '14px 20px',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        cursor: savingDirect ? 'not-allowed' : 'pointer',
                        opacity: savingDirect ? 0.6 : 1,
                      }}
                    >
                      {savingDirect ? 'Saving...' : 'Save Direct Application'}
                    </button>

                    <button
                      onClick={() => setShowDirectForm(false)}
                      style={{
                        background: 'transparent',
                        color: '#f8fafc',
                        padding: '14px 20px',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: '1px solid rgba(255,255,255,0.16)',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  {directMessage && (
                    <div style={{ color: '#86efac', fontSize: '14px' }}>{directMessage}</div>
                  )}

                  {directError && (
                    <div style={{ color: '#fca5a5', fontSize: '14px' }}>{directError}</div>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px',
              }}
            >
              {[
                { label: 'Tracked Applications', value: totalApplications },
                { label: 'Advancing', value: advancing },
                { label: 'Unread Messages', value: unreadMessagesCount },
                { label: 'Match Signal', value: `${matchSignal}%` },
              ].map((item) => (
                <div key={item.label} style={metricCardStyle}>
                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '10px',
                    }}
                  >
                    {item.label}
                  </div>
                  <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.04em' }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#05080d',
              padding: '22px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '28px',
                background: 'linear-gradient(180deg, #070b12 0%, #03060b 100%)',
              }}
            >
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '18px',
                }}
              >
                Live Mission Snapshot
              </div>

              <div
                style={{
                  fontSize: '54px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '12px',
                }}
              >
                {totalApplications} active
                <br />
                tracked roles
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Last application activity synced through your dashboard.
              </div>

              <div
                style={{
                  height: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.max(8, totalApplications * 8))}%`,
                    height: '100%',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <span>Applied</span>
                <span>Onboarding trajectory active</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            padding: '18px',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '14px',
            }}
          >
            Action Bar
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/jobs"
              style={{
                background: '#ffffff',
                color: '#020406',
                textDecoration: 'none',
                padding: '14px 20px',
                fontWeight: 800,
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid #ffffff',
              }}
            >
              Browse Jobs
            </Link>

            {[
              { href: '/recommended-jobs', label: 'Recommended Jobs' },
              { href: '/resume-match', label: 'Resume Match' },
              { href: '/resume-builder', label: 'Resume Builder' },
              { href: '/messages', label: 'Messages' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  background: 'transparent',
                  color: '#f8fafc',
                  textDecoration: 'none',
                  padding: '14px 20px',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  border: '1px solid rgba(255,255,255,0.16)',
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading applications...</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '18px',
            }}
          >
            {topApplications.map((application) => {
              const progress = getProgress(application.status);
              const stage = getStageLabel(application.status);

              return (
                <div
                  key={application.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
                    padding: '22px',
                    minHeight: '270px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        gap: '12px',
                        marginBottom: '18px',
                      }}
                    >
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          border: '1px solid rgba(255,255,255,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          color: '#ffffff',
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {(application.jobs?.company || 'C').charAt(0)}
                      </div>

                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                        }}
                      >
                        {new Date(application.applied_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: '28px',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        marginBottom: '6px',
                      }}
                    >
                      {application.jobs?.title || 'Application'}
                    </div>

                    <div
                      style={{
                        color: '#cbd5e1',
                        fontSize: '16px',
                        marginBottom: '12px',
                      }}
                    >
                      {application.jobs?.company || '-'}
                    </div>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        marginBottom: '18px',
                      }}
                    >
                      {application.jobs?.location || 'Location unavailable'} • Applied via {application.source || 'Direct'}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px',
                      }}
                    >
                      <span>{stage}</span>
                      <span>{progress}%</span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                        marginBottom: '18px',
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: '100%',
                          background: '#ffffff',
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <Link
                        href={`/applications/${application.id}`}
                        style={{
                          display: 'inline-block',
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          borderBottom: '1px solid rgba(255,255,255,0.22)',
                          paddingBottom: '4px',
                        }}
                      >
                        View Transparency Timeline
                      </Link>

                      {application.job_url && (
                        <a
                          href={application.job_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-block',
                            color: '#cbd5e1',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            borderBottom: '1px solid rgba(255,255,255,0.12)',
                            paddingBottom: '4px',
                          }}
                        >
                          Open Job Posting
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}


