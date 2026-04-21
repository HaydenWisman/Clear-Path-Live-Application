'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { calculateMatch } from '@/lib/matching/score';
import { generateFitSummary } from '@/lib/matching/summary';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  skills_required: string[] | null;
  employment_type: string | null;
  experience_level: string | null;
  status: string;
};

type RankedJob = Job & {
  matchScore: number;
  explanation: string[];
  fitSummary: string;
};

export default function RecommendedJobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<RankedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyingId, setApplyingId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadRecommendations = async () => {
      setLoading(true);
      setError('');
      setMessage('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('headline, skills, preferred_location')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company, location, description, skills_required, employment_type, experience_level, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (jobsError) {
        setError(jobsError.message);
        setLoading(false);
        return;
      }

      const rankedJobs: RankedJob[] = (jobsData || []).map((job: any) => {
        const result = calculateMatch(profileData || {}, job);
        const fitSummary = generateFitSummary({
          score: result.score,
          explanation: result.explanation,
          candidateHeadline: profileData?.headline,
          candidateSkills: profileData?.skills,
          jobTitle: job.title,
          jobSkills: job.skills_required,
        });

        return {
          ...job,
          matchScore: result.score,
          explanation: result.explanation,
          fitSummary,
        };
      });

      rankedJobs.sort((a, b) => b.matchScore - a.matchScore);

      setJobs(rankedJobs);
      setLoading(false);
    };

    loadRecommendations();
  }, [supabase]);

  const applyToJob = async (jobId: string) => {
    setApplyingId(jobId);
    setError('');
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in to apply.');
      setApplyingId('');
      return;
    }

    const { data: existingApplication } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', user.id)
      .eq('job_id', jobId)
      .maybeSingle();

    if (existingApplication) {
      setMessage('You already applied to this job.');
      setApplyingId('');
      return;
    }

    const { error } = await supabase.from('applications').insert({
      candidate_id: user.id,
      job_id: jobId,
      status: 'submitted',
      source: 'ClearPath',
    });

    if (error) {
      setError(error.message);
      setApplyingId('');
      return;
    }

    setMessage('Application submitted successfully.');
    setApplyingId('');
  };

  const getProgress = (score: number) => Math.max(10, Math.min(100, score));

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
          padding: 'clamp(24px, 4vw, 52px) clamp(18px, 3vw, 32px) 70px',
        }}
      >
        <div style={{ marginBottom: '22px' }}>
          <Link
            href="/dashboard"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: '1px solid rgba(255,255,255,0.14)',
              paddingBottom: '4px',
            }}
          >
            Back to Dashboard
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '40px',
            alignItems: 'start',
            marginBottom: '34px',
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
              Candidate Matching Surface
            </div>

            <h1
              style={{
                fontSize: 'clamp(36px, 7vw, 72px)',
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                margin: '0 0 14px',
                fontWeight: 800,
              }}
            >
              Recommended
              <br />
              jobs
            </h1>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '22px',
                lineHeight: 1.45,
                maxWidth: '860px',
                margin: 0,
              }}
            >
              Ranked opportunities based on your profile, skills, and preference signals.
              Use this surface to prioritize the strongest-fit roles first.
            </p>
          </div>

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#05080d',
              padding: '22px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.32)',
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
                Live Match Snapshot
              </div>

              <div
                style={{
                  fontSize: 'clamp(28px, 5vw, 54px)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '12px',
                }}
              >
                {jobs.length} ranked
                <br />
                role matches
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Match scores, fit summaries, and role alignment factors are ready for review.
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
                    width: `${Math.min(100, Math.max(12, jobs.length * 8))}%`,
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
                <span>Recommendation Active</span>
                <span>Fit Ranking Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div style={{ color: '#86efac', fontSize: '14px', marginBottom: '16px' }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ color: '#fca5a5', fontSize: '14px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading recommendations...</p>
        ) : jobs.length === 0 ? (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
              padding: '28px',
              color: '#94a3b8',
            }}
          >
            No recommended jobs available yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '18px',
            }}
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
                  padding: '24px',
                  minHeight: '380px',
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
                      gap: '16px',
                      alignItems: 'start',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '58px',
                          height: '58px',
                          border: '1px solid rgba(255,255,255,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: 'clamp(18px, 2.8vw, 24px)',
                          color: '#ffffff',
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        {(job.company || 'C').charAt(0)}
                      </div>

                      <div>
                        <div
                          style={{
                            fontSize: 'clamp(22px, 3.8vw, 30px)',
                            fontWeight: 800,
                            lineHeight: 1.02,
                            letterSpacing: '-0.03em',
                            marginBottom: '6px',
                          }}
                        >
                          {job.title}
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '16px' }}>
                          {job.company}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: '96px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '12px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          marginBottom: '6px',
                        }}
                      >
                        Match
                      </div>
                      <div style={{ fontSize: 'clamp(20px, 3.4vw, 28px)', fontWeight: 800 }}>{job.matchScore}%</div>
                    </div>
                  </div>

                  <div
                    style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      lineHeight: 1.5,
                      marginBottom: '16px',
                    }}
                  >
                    {(job.location || 'Location unavailable')}
                    {job.employment_type ? ` • ${job.employment_type}` : ''}
                    {job.experience_level ? ` • ${job.experience_level}` : ''}
                  </div>

                  <div
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '16px',
                    }}
                  >
                    {job.description
                      ? job.description.slice(0, 180) + (job.description.length > 180 ? '...' : '')
                      : 'No description provided.'}
                  </div>

                  <div
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '8px',
                      }}
                    >
                      AI Fit Summary
                    </div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{job.fitSummary}</div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
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
                      <span>Fit Strength</span>
                      <span>{job.matchScore}%</span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${getProgress(job.matchScore)}%`,
                          height: '100%',
                          background: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '8px',
                      }}
                    >
                      Why This Matches
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {job.explanation.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {(job.skills_required || []).slice(0, 5).map((skill) => (
                      <div
                        key={skill}
                        style={{
                          padding: '8px 10px',
                          border: '1px solid rgba(255,255,255,0.10)',
                          color: '#cbd5e1',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          background: 'rgba(255,255,255,0.02)',
                        }}
                      >
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => applyToJob(job.id)}
                    disabled={applyingId === job.id}
                    style={{
                      background: '#ffffff',
                      color: '#020406',
                      padding: '14px 20px',
                      fontWeight: 800,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      border: 'none',
                      cursor: applyingId === job.id ? 'not-allowed' : 'pointer',
                      opacity: applyingId === job.id ? 0.7 : 1,
                    }}
                  >
                    {applyingId === job.id ? 'Applying...' : 'Apply'}
                  </button>

                  <Link
                    href="/jobs"
                    style={{
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
                    Browse All Jobs
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


