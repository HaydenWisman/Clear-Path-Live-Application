'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  status: string;
  created_at: string;
  skills_required: string[] | null;
  employment_type: string | null;
  experience_level: string | null;
};

export default function RecruiterJobsPage() {
  const supabase = createClient();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [skillsRequiredInput, setSkillsRequiredInput] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

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

    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, company, location, description, status, created_at, skills_required, employment_type, experience_level')
      .eq('recruiter_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const createJob = async () => {
    setSaving(true);
    setError('');
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in.');
      setSaving(false);
      return;
    }

    const skillsRequired = skillsRequiredInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const { error } = await supabase.from('jobs').insert({
      recruiter_id: user.id,
      title,
      company,
      location,
      description,
      status: 'open',
      skills_required: skillsRequired,
      employment_type: employmentType,
      experience_level: experienceLevel,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setTitle('');
    setCompany('');
    setLocation('');
    setDescription('');
    setSkillsRequiredInput('');
    setEmploymentType('');
    setExperienceLevel('');
    setMessage('Job created successfully.');
    setSaving(false);
    loadJobs();
  };

  return (
    <main style={{ minHeight: '100vh', background: '#081225', color: '#fff', fontFamily: 'Arial, sans-serif', padding: '32px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Recruiter Jobs</h1>

        <div style={{ background: '#121c33', borderRadius: '18px', padding: '24px', marginBottom: '24px' }}>
          <h2>Create Job Posting</h2>

          <input
            placeholder='Job Title'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <input
            placeholder='Company'
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <input
            placeholder='Location'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <input
            placeholder='Required Skills (comma separated)'
            value={skillsRequiredInput}
            onChange={(e) => setSkillsRequiredInput(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <input
            placeholder='Employment Type (e.g. Full-time, Contract, Hybrid)'
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <input
            placeholder='Experience Level (e.g. Entry, Mid, Senior)'
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <textarea
            placeholder='Job Description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', minHeight: '120px', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #2c3b5c', background: '#0b1324', color: '#fff', boxSizing: 'border-box' }}
          />

          <button
            onClick={createJob}
            disabled={saving}
            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: saving ? '#4e5d7a' : '#4f7cff', color: '#fff', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Creating...' : 'Create Job'}
          </button>

          {message && <p style={{ color: '#4ade80', marginTop: '12px' }}>{message}</p>}
          {error && <p style={{ color: '#ff6b6b', marginTop: '12px' }}>{error}</p>}
        </div>

        <div style={{ background: '#121c33', borderRadius: '18px', padding: '24px' }}>
          <h2>My Job Postings</h2>

          {loading ? (
            <p>Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p style={{ color: '#9fb0ce' }}>No job postings yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {jobs.map((job) => (
                <div key={job.id} style={{ background: '#0b1324', border: '1px solid #223150', borderRadius: '14px', padding: '16px' }}>
                  <h3 style={{ marginTop: 0 }}>{job.title}</h3>
                  <p style={{ margin: '4px 0', color: '#b7c2d8' }}>{job.company}{job.location ? ' · ' + job.location : ''}</p>
                  <p style={{ margin: '8px 0', color: '#9fb0ce' }}>{job.description}</p>
                  <p style={{ margin: '8px 0', color: '#b7c2d8' }}>
                    Skills: {job.skills_required && job.skills_required.length > 0 ? job.skills_required.join(', ') : '-'}
                  </p>
                  <p style={{ margin: '8px 0', color: '#b7c2d8' }}>
                    Type: {job.employment_type || '-'} · Level: {job.experience_level || '-'}
                  </p>
                  <p style={{ margin: '8px 0', fontSize: '12px', color: '#9fb0ce' }}>
                    Status: {job.status} · Created: {new Date(job.created_at).toLocaleDateString()}
                  </p>

                  <Link
                    href={`/recruiter/jobs/${job.id}`}
                    style={{
                      display: 'inline-block',
                      marginTop: '10px',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: '#4f7cff',
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 'bold',
                    }}
                  >
                    View Applicants
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
