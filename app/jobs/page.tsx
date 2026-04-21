'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  employment_type: string | null;
  experience_level: string | null;
  skills_required: string[] | null;
  status: string;
  created_at?: string | null;
};

export default function JobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [applyingId, setApplyingId] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError('');

      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, description, employment_type, experience_level, skills_required, status, created_at')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setJobs((data as any) || []);
      setLoading(false);
    };

    loadJobs();
  }, [supabase]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !searchTerm.trim() ||
        [job.title, job.company, job.description || '', ...(job.skills_required || [])]
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationFilter.trim() ||
        (job.location || '').toLowerCase().includes(locationFilter.toLowerCase());

      const matchesType =
        !typeFilter ||
        (job.employment_type || '').toLowerCase() === typeFilter.toLowerCase();

      const matchesLevel =
        !levelFilter ||
        (job.experience_level || '').toLowerCase() === levelFilter.toLowerCase();

      return matchesSearch && matchesLocation && matchesType && matchesLevel;
    });
  }, [jobs, searchTerm, locationFilter, typeFilter, levelFilter]);

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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    background: '#0b1118',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
    boxSizing: 'border-box',
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
              Candidate Job Feed
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
              Browse
              <br />
              open roles
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
              Search live opportunities, review role requirements, and push qualified applications into your tracking system.
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
                Live Role Snapshot
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
                {filteredJobs.length} open
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
                Filter by title, company, location, and skill alignment from one search surface.
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
                    width: `${Math.min(100, Math.max(12, filteredJobs.length * 8))}%`,
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
                <span>Discovery Active</span>
                <span>Application Route Enabled</span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            padding: '18px',
            marginBottom: '24px',
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
            Search Filters
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
            }}
          >
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, company, description, or skills"
              style={inputStyle}
            />

            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              style={inputStyle}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Types</option>
              <option value="full-time">full-time</option>
              <option value="part-time">part-time</option>
              <option value="contract">contract</option>
              <option value="internship">internship</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Levels</option>
              <option value="entry">entry</option>
              <option value="mid">mid</option>
              <option value="senior">senior</option>
              <option value="lead">lead</option>
            </select>
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
          <p style={{ color: '#94a3b8' }}>Loading jobs...</p>
        ) : filteredJobs.length === 0 ? (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
              padding: '28px',
              color: '#94a3b8',
            }}
          >
            No jobs matched your filters.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
            }}
          >
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
                  padding: '22px',
                  minHeight: '330px',
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
                      {(job.company || 'C').charAt(0)}
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
                      {job.employment_type || 'Open'}
                    </div>
                  </div>

                  <div
                    style={{
                      fontSize: 'clamp(20px, 3.4vw, 28px)',
                      fontWeight: 800,
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      marginBottom: '6px',
                    }}
                  >
                    {job.title}
                  </div>

                  <div
                    style={{
                      color: '#cbd5e1',
                      fontSize: '16px',
                      marginBottom: '12px',
                    }}
                  >
                    {job.company}
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
                    {job.experience_level ? ` â€¢ ${job.experience_level}` : ''}
                  </div>

                  <div
                    style={{
                      color: '#cbd5e1',
                      fontSize: '14px',
                      lineHeight: 1.6,
                      marginBottom: '18px',
                    }}
                  >
                    {job.description
                      ? job.description.slice(0, 180) + (job.description.length > 180 ? '...' : '')
                      : 'No description provided.'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '18px' }}>
                    {(job.skills_required || []).slice(0, 4).map((skill) => (
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
                    href="/recommended-jobs"
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
                    Compare Fit
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



