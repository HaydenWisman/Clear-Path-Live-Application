'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RecruiterDashboardPage() {
  const supabase = createClient();

  const [fullName, setFullName] = useState('Recruiter');
  const [company, setCompany] = useState('');
  const [jobsCount, setJobsCount] = useState(0);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [openJobsCount, setOpenJobsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  useEffect(() => {
    const loadRecruiterData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

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
        .select('id, status')
        .eq('recruiter_id', user.id);

      const recruiterJobs = jobsData || [];
      setJobsCount(recruiterJobs.length);
      setOpenJobsCount(recruiterJobs.filter((job: any) => job.status === 'open').length);

      const jobIds = recruiterJobs.map((job: any) => job.id);

      if (jobIds.length > 0) {
        const { data: applicationsData } = await supabase
          .from('applications')
          .select('id, job_id')
          .in('job_id', jobIds);

        setApplicantsCount((applicationsData || []).length);
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
      }
    };

    loadRecruiterData();
  }, [supabase]);

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
              Recruiter Surface
            </div>

            <h1
              style={{
                fontSize: '78px',
                lineHeight: 0.94,
                letterSpacing: '-0.05em',
                margin: '0 0 18px',
                fontWeight: 800,
              }}
            >
              Recruiter
              <br />
              command center
            </h1>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '24px',
                lineHeight: 1.4,
                maxWidth: '860px',
                margin: '0 0 24px',
              }}
            >
              Manage openings, review applicants, update statuses, and communicate
              with talent from a single operational surface.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {[
                company || 'Company',
                'Applicant Review',
                'Messaging',
                'Hiring Workflow',
              ].map((chip) => (
                <div
                  key={chip}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#cbd5e1',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '14px',
              }}
            >
              {[
                { label: 'Total Job Postings', value: jobsCount },
                { label: 'Open Jobs', value: openJobsCount },
                { label: 'Applicants', value: applicantsCount },
                { label: 'Unread Messages', value: unreadMessagesCount },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                    padding: '18px',
                  }}
                >
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
                Live Recruiter Snapshot
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
                Review candidate movement, unread recruiter messages, and open role volume in real time.
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
                    width: `${Math.min(100, Math.max(10, applicantsCount * 6))}%`,
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
                <span>Pipeline Active</span>
                <span>Recruiter Visibility Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <Link
            href="/recruiter/jobs"
            style={{
              background: '#ffffff',
              color: '#020406',
              textDecoration: 'none',
              padding: '16px 22px',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Manage Job Postings
          </Link>

          <Link
            href="/messages"
            style={{
              background: 'transparent',
              color: '#f8fafc',
              textDecoration: 'none',
              padding: '16px 22px',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Messages
          </Link>

          <Link
            href="/profile"
            style={{
              background: 'transparent',
              color: '#f8fafc',
              textDecoration: 'none',
              padding: '16px 22px',
              fontWeight: 800,
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Profile
          </Link>
        </div>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            padding: '28px',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '12px',
            }}
          >
            Recruiter Workspace
          </div>

          <div
            style={{
              fontSize: '34px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '10px',
            }}
          >
            {fullName}{company ? ` · ${company}` : ''}
          </div>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '18px',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '980px',
            }}
          >
            Use this workspace to create roles, review candidate fit, update statuses,
            message applicants, and monitor the hiring pipeline without leaving the dashboard.
          </p>
        </div>
      </section>
    </main>
  );
}
