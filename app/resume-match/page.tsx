'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { analyzeResumeAgainstJob } from '@/lib/matching/resumeAnalyzer';

type Job = {
  id: string;
  title: string;
  company: string;
  skills_required: string[] | null;
};

export default function ResumeMatchPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

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
        .select('resume_text')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setResumeText(profileData?.resume_text || '');

      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, company, skills_required')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (jobsError) {
        setError(jobsError.message);
        setLoading(false);
        return;
      }

      setJobs(jobsData || []);
      if (jobsData && jobsData.length > 0) {
        setSelectedJobId(jobsData[0].id);
      }

      setLoading(false);
    };

    loadData();
  }, [supabase]);

  const runAnalysis = () => {
    const selectedJob = jobs.find((job) => job.id === selectedJobId);
    if (!selectedJob) return;

    const result = analyzeResumeAgainstJob(
      resumeText || '',
      selectedJob.skills_required || [],
      selectedJob.title,
      selectedJob.company
    );

    setAnalysis(result);
  };

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    background: '#0b1118',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
    boxSizing: 'border-box',
  };

  const panelStyle: React.CSSProperties = {
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
    padding: '24px',
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
          paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', padding: 'clamp(24px, 4vw, 52px) clamp(18px, 3vw, 32px) 70px',
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
              Candidate Match Surface
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
              Resume
              <br />
              match
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
              Compare your resume text against job requirements and identify where stronger alignment could improve your match signal.
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
                Resume Signal Snapshot
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
                Align resume
                <br />
                to target role
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Compare keyword coverage, identify gaps, and surface stronger positioning language before you apply.
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
                    width: analysis ? `${Math.max(12, analysis.currentScore)}%` : '28%',
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
                <span>Resume Scan Ready</span>
                <span>Keyword Analysis Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading analyzer...</p>
        ) : error ? (
          <div style={{ color: '#fca5a5', fontSize: '14px', marginBottom: '16px' }}>{error}</div>
        ) : (
          <>
            <div style={{ ...panelStyle, marginBottom: '24px' }}>
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
                Resume Analysis Controls
              </div>

              <div style={{ display: 'grid', gap: '14px' }}>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  style={inputStyle}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} - {job.company}
                    </option>
                  ))}
                </select>

                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  style={{ ...inputStyle, minHeight: '240px', resize: 'vertical' }}
                />

                <button
                  onClick={runAnalysis}
                  style={{
                    background: '#ffffff',
                    color: '#020406',
                    padding: '16px 24px',
                    fontWeight: 800,
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    border: 'none',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  Analyze Resume Match
                </button>
              </div>
            </div>

            {analysis && selectedJob && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={panelStyle}>
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
                    Match Score Improvement
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                      gap: '16px',
                    }}
                  >
                    <div
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '18px',
                      }}
                    >
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                        Current Match
                      </div>
                      <div style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 800 }}>{analysis.currentScore}%</div>
                    </div>

                    <div
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '18px',
                      }}
                    >
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                        Projected Match
                      </div>
                      <div style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 800 }}>{analysis.projectedScore}%</div>
                    </div>

                    <div
                      style={{
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '18px',
                      }}
                    >
                      <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                        Potential Increase
                      </div>
                      <div style={{ fontSize: 'clamp(26px, 4.5vw, 40px)', fontWeight: 800 }}>+{analysis.scoreIncrease}%</div>
                    </div>
                  </div>
                </div>

                <div style={panelStyle}>
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
                    Keyword Analysis
                  </div>

                  <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginTop: 0 }}>
                    Job: <strong style={{ color: '#ffffff' }}>{selectedJob.title}</strong> at <strong style={{ color: '#ffffff' }}>{selectedJob.company}</strong>
                  </p>

                  <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                    Required Skills: {selectedJob.skills_required && selectedJob.skills_required.length > 0 ? selectedJob.skills_required.join(', ') : '-'}
                  </p>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                      Matched Keywords
                    </div>
                    <div style={{ color: '#ffffff', lineHeight: 1.6 }}>
                      {analysis.matchedSkills.length > 0 ? analysis.matchedSkills.join(', ') : 'None yet'}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                      Missing Keywords
                    </div>
                    <div style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                      {analysis.missingSkills.length > 0 ? analysis.missingSkills.join(', ') : 'No major gaps'}
                    </div>
                  </div>
                </div>

                <div style={panelStyle}>
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
                    AI Resume Improvement Summary
                  </div>
                  <p style={{ color: '#e2e8f0', lineHeight: 1.7, margin: 0 }}>{analysis.suggestedSummary}</p>
                </div>

                <div style={panelStyle}>
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
                    Suggested Professional Summary
                  </div>
                  <p style={{ color: '#e2e8f0', lineHeight: 1.7, margin: 0 }}>{analysis.improvedProfessionalSummary}</p>
                </div>

                <div style={panelStyle}>
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
                    Suggested Skills Section
                  </div>
                  <p style={{ color: '#e2e8f0', lineHeight: 1.7, margin: 0 }}>
                    {analysis.strengthenedSkillsSection || 'No structured skills were found yet.'}
                  </p>
                </div>

                <div style={panelStyle}>
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
                    Keyword Insertion Suggestions
                  </div>

                  {analysis.keywordInsertionSuggestions.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#e2e8f0', lineHeight: 1.7 }}>
                      {analysis.keywordInsertionSuggestions.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#e2e8f0', margin: 0 }}>Your resume already includes the core listed keywords.</p>
                  )}
                </div>

                <div style={panelStyle}>
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
                    Example Bullet Point Rewrites
                  </div>

                  {analysis.exampleBulletRewrites.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#e2e8f0', lineHeight: 1.7 }}>
                      {analysis.exampleBulletRewrites.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ color: '#e2e8f0', margin: 0 }}>No rewrite suggestions needed yet.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}



