'use client';

import ProfileMenu from '@/components/ProfileMenu';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type JobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  work_type: string | null;
  salary: string | null;
  experience_level: string | null;
  certifications_required: string[] | null;
  job_summary: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  status: string | null;
};

export default function RecommendedJobsPage() {
  const supabase = createClient();
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('id, title, company, location, work_type, salary, experience_level, certifications_required, job_summary, recruiter_name, recruiter_email, status')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setJobs((data as JobRow[]) || []);
      setLoading(false);
    };

    loadJobs();
  }, []);

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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <ProfileMenu />
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={eyebrow}>Recommended Jobs</div>
          <h1 style={titleStyle}>Recommended roles</h1>
          <p style={subStyle}>
            Review a curated set of live openings with recruiter-posted details and structured role information.
          </p>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading recommended jobs...</p>
        ) : error ? (
          <p style={{ color: '#fca5a5' }}>{error}</p>
        ) : jobs.length === 0 ? (
          <p style={{ color: '#94a3b8' }}>No recommended jobs available yet.</p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '18px',
            }}
          >
            {jobs.map((job) => (
              <div key={job.id} style={cardStyle}>
                <div style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>{job.title}</div>
                <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                  {job.company} • {job.location} • {job.work_type || 'N/A'}
                </div>
                <div style={{ color: '#94a3b8', marginBottom: '12px' }}>
                  {job.salary || 'Salary not listed'} • {job.experience_level || 'Unknown level'}
                </div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.7, marginBottom: '12px' }}>
                  {job.job_summary || 'No summary provided.'}
                </div>

                <div style={sectionLabel}>Certifications</div>
                <div style={{ color: '#cbd5e1', marginBottom: '12px' }}>
                  {job.certifications_required && job.certifications_required.length > 0
                    ? job.certifications_required.join(', ')
                    : 'None listed'}
                </div>

                <div style={sectionLabel}>Recruiter Contact</div>
                <div style={{ color: '#cbd5e1' }}>
                  {job.recruiter_name || 'Unknown recruiter'}{job.recruiter_email ? ` • ${job.recruiter_email}` : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

const eyebrow: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  marginBottom: '16px',
};

const titleStyle: React.CSSProperties = {
  fontSize: 'clamp(38px, 8vw, 78px)',
  lineHeight: 0.94,
  letterSpacing: '-0.05em',
  margin: '0 0 10px',
  fontWeight: 800,
};

const subStyle: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: 'clamp(18px, 2.8vw, 24px)',
  lineHeight: 1.4,
  maxWidth: '900px',
  margin: 0,
};

const cardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
  padding: '24px',
};

const sectionLabel: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '6px',
};
