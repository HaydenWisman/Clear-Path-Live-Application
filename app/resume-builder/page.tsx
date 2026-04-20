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

export default function ResumeBuilderPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [builtResumeBlock, setBuiltResumeBlock] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [copied, setCopied] = useState(false);
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

  const buildResume = () => {
    const selectedJob = jobs.find((job) => job.id === selectedJobId);
    if (!selectedJob) return;

    const result = analyzeResumeAgainstJob(
      resumeText || '',
      selectedJob.skills_required || [],
      selectedJob.title,
      selectedJob.company
    );

    setAnalysis(result);

    const summary = result.improvedProfessionalSummary || '';
    const skillsSection = result.strengthenedSkillsSection || '';
    const bullets = result.exampleBulletRewrites || [];
    const focusAreas = result.missingSkills || [];

    const assembled = [
      'TAILORED PROFESSIONAL SUMMARY',
      summary,
      '',
      'TAILORED SKILLS',
      skillsSection || 'Add relevant targeted skills here.',
      '',
      'FOCUS KEYWORDS TO STRENGTHEN',
      focusAreas.length > 0 ? focusAreas.join(', ') : 'No major keyword gaps identified.',
      '',
      'TAILORED EXPERIENCE BULLETS',
      ...(bullets.length > 0
        ? bullets.map((bullet: string) => `- ${bullet}`)
        : ['- Add more measurable experience aligned to the job posting.']),
    ].join('\n');

    setBuiltResumeBlock(assembled);
    setCopied(false);
  };

  const copyToClipboard = async () => {
    if (!builtResumeBlock) return;
    await navigator.clipboard.writeText(builtResumeBlock);
    setCopied(true);
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
          padding: '52px 32px 70px',
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
            gridTemplateColumns: '1.05fr 0.95fr',
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
              Candidate Builder Surface
            </div>

            <h1
              style={{
                fontSize: '72px',
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                margin: '0 0 14px',
                fontWeight: 800,
              }}
            >
              Resume
              <br />
              builder
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
              Generate a copy-ready targeted resume section based on your saved resume text and selected role.
            </p>
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
                Resume Build Snapshot
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
                Targeted
                <br />
                role output
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Build a focused summary, stronger skills section, and targeted bullet language for your next application.
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
                    width: analysis ? `${Math.max(16, analysis.projectedScore)}%` : '34%',
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
                <span>Builder Active</span>
                <span>Copy Output Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading builder...</p>
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
                Resume Builder Controls
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
                  onClick={buildResume}
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
                  Build Tailored Resume Section
                </button>
              </div>
            </div>

            {analysis && selectedJob && (
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
                    Optimization Snapshot
                  </div>

                  <p style={{ color: '#cbd5e1', marginTop: 0, lineHeight: 1.6 }}>
                    Target Role: <strong style={{ color: '#ffffff' }}>{selectedJob.title}</strong> at <strong style={{ color: '#ffffff' }}>{selectedJob.company}</strong>
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: '16px',
                      marginTop: '16px',
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
                      <div style={{ fontSize: '40px', fontWeight: 800 }}>{analysis.currentScore}%</div>
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
                      <div style={{ fontSize: '40px', fontWeight: 800 }}>{analysis.projectedScore}%</div>
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
                      <div style={{ fontSize: '40px', fontWeight: 800 }}>+{analysis.scoreIncrease}%</div>
                    </div>
                  </div>
                </div>

                <div style={{ ...panelStyle, marginBottom: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '14px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                      }}
                    >
                      Copy-Ready Resume Block
                    </div>

                    <button
                      onClick={copyToClipboard}
                      style={{
                        background: copied ? '#ffffff' : 'transparent',
                        color: copied ? '#020406' : '#f8fafc',
                        padding: '12px 18px',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: copied ? 'none' : '1px solid rgba(255,255,255,0.16)',
                        cursor: 'pointer',
                      }}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <textarea
                    value={builtResumeBlock}
                    readOnly
                    style={{
                      ...inputStyle,
                      minHeight: '360px',
                      lineHeight: 1.7,
                      resize: 'vertical',
                    }}
                  />
                </div>
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}
