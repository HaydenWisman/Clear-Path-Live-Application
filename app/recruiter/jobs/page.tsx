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
  company_history: string | null;
  core_values: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  status: string | null;
};

export default function RecruiterJobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [workType, setWorkType] = useState('On-site');
  const [salary, setSalary] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [certificationsRequired, setCertificationsRequired] = useState('');
  const [jobSummary, setJobSummary] = useState('');
  const [companyHistory, setCompanyHistory] = useState('');
  const [coreValues, setCoreValues] = useState('');
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');

  const loadJobs = async () => {
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

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email, company')
      .eq('id', user.id)
      .maybeSingle();

    if (!recruiterName) {
      setRecruiterName(profileData?.full_name || '');
    }

    if (!recruiterEmail) {
      setRecruiterEmail(profileData?.email || user.email || '');
    }

    if (!company) {
      setCompany(profileData?.company || '');
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, location, work_type, salary, experience_level, certifications_required, job_summary, company_history, core_values, recruiter_name, recruiter_email, status')
      .eq('recruiter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setJobs((data as JobRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const resetForm = () => {
    setTitle('');
    setLocation('');
    setWorkType('On-site');
    setSalary('');
    setExperienceLevel('Entry');
    setCertificationsRequired('');
    setJobSummary('');
    setCompanyHistory('');
    setCoreValues('');
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in.');
      setSaving(false);
      return;
    }

    if (!title.trim() || !company.trim() || !location.trim() || !jobSummary.trim()) {
      setError('Please complete the required fields.');
      setSaving(false);
      return;
    }

    const certificationsArray = certificationsRequired
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from('jobs').insert({
      recruiter_id: user.id,
      title,
      company,
      location,
      work_type: workType,
      salary,
      experience_level: experienceLevel,
      certifications_required: certificationsArray,
      job_summary: jobSummary,
      company_history: companyHistory,
      core_values: coreValues,
      recruiter_name: recruiterName,
      recruiter_email: recruiterEmail,
      description: jobSummary,
      status: 'open',
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage('Job posted successfully.');
    resetForm();
    setSaving(false);
    await loadJobs();
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

        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '16px',
            }}
          >
            Recruiter Job Management
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
            Post
            <br />
            new jobs
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: 'clamp(18px, 2.8vw, 24px)',
              lineHeight: 1.4,
              maxWidth: '900px',
              margin: 0,
            }}
          >
            Create recruiter job postings with company context, role details, work type, salary,
            qualifications, and recruiter contact information.
          </p>
        </div>

        <form
          onSubmit={handleCreateJob}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px',
              marginBottom: '14px',
            }}
          >
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title*" style={inputStyle} />
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name*" style={inputStyle} />
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location*" style={inputStyle} />
            <select value={workType} onChange={(e) => setWorkType(e.target.value)} style={inputStyle}>
              <option>On-site</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
            <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Salary range" style={inputStyle} />
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} style={inputStyle}>
              <option>Entry</option>
              <option>Mid</option>
              <option>Senior</option>
              <option>Executive</option>
            </select>
            <input value={recruiterName} onChange={(e) => setRecruiterName(e.target.value)} placeholder="Recruiter name" style={inputStyle} />
            <input value={recruiterEmail} onChange={(e) => setRecruiterEmail(e.target.value)} placeholder="Recruiter email" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <input
              value={certificationsRequired}
              onChange={(e) => setCertificationsRequired(e.target.value)}
              placeholder="Certifications required (comma separated)"
              style={inputStyle}
            />

            <textarea value={jobSummary} onChange={(e) => setJobSummary(e.target.value)} placeholder="Job summary*" style={textareaStyle} />
            <textarea value={companyHistory} onChange={(e) => setCompanyHistory(e.target.value)} placeholder="History about the company" style={textareaStyle} />
            <textarea value={coreValues} onChange={(e) => setCoreValues(e.target.value)} placeholder="Core values" style={textareaStyle} />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <button type="submit" disabled={saving} style={primaryButton}>
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </div>

          {message && <div style={{ color: '#86efac', marginTop: '14px' }}>{message}</div>}
          {error && <div style={{ color: '#fca5a5', marginTop: '14px' }}>{error}</div>}
        </form>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            padding: '24px',
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
            Your Posted Jobs
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No jobs posted yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {jobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '18px',
                  }}
                >
                  <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '6px' }}>{job.title}</div>
                  <div style={{ color: '#cbd5e1', marginBottom: '8px' }}>
                    {job.company} • {job.location} • {job.work_type || 'N/A'}
                  </div>
                  <div style={{ color: '#94a3b8', marginBottom: '8px' }}>
                    {job.salary || 'Salary not listed'} • {job.experience_level || 'Unknown level'}
                  </div>
                  <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{job.job_summary || 'No summary'}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px',
  background: '#0b1118',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '120px',
  padding: '14px',
  background: '#0b1118',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  boxSizing: 'border-box',
  resize: 'vertical',
};

const primaryButton: React.CSSProperties = {
  background: '#ffffff',
  color: '#020406',
  padding: '14px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
  cursor: 'pointer',
};
