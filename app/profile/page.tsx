'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ProfilePage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');

  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeText, setResumeText] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No user is signed in.');
        setLoading(false);
        return;
      }

      setEmail(user.email || '');

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, github_url, linkedin_url, role, company, avatar_url, headline, bio, skills, preferred_location, resume_url, resume_text')
        .eq('id', user.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setFullName(data?.full_name || '');
      setPhone(data?.phone || '');
      setGithubUrl(data?.github_url || '');
      setLinkedinUrl(data?.linkedin_url || '');
      setRole(data?.role || '');
      setCompany(data?.company || '');
      setAvatarUrl(data?.avatar_url || '');
      setHeadline(data?.headline || '');
      setBio(data?.bio || '');
      setSkillsInput(Array.isArray(data?.skills) ? data.skills.join(', ') : '');
      setPreferredLocation(data?.preferred_location || '');
      setResumeUrl(data?.resume_url || '');
      setResumeText(data?.resume_text || '');
      setLoading(false);
    };

    loadProfile();
  }, [supabase]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      setError('');
      setMessage('');

      const file = event.target.files?.[0];
      if (!file) {
        setUploadingAvatar(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No user is signed in.');
        setUploadingAvatar(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = user.id + '/avatar-' + Date.now() + '.' + fileExt;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setUploadingAvatar(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setUploadingAvatar(false);
        return;
      }

      setAvatarUrl(publicUrl);
      setMessage('Profile picture uploaded successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingResume(true);
      setError('');
      setMessage('');

      const file = event.target.files?.[0];
      if (!file) {
        setUploadingResume(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('No user is signed in.');
        setUploadingResume(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const filePath = user.id + '/resume-' + Date.now() + '.' + fileExt;

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        setError(uploadError.message);
        setUploadingResume(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ resume_url: publicUrl })
        .eq('id', user.id);

      if (updateError) {
        setError(updateError.message);
        setUploadingResume(false);
        return;
      }

      setResumeUrl(publicUrl);
      setMessage('Resume uploaded successfully.');
    } catch (err: any) {
      setError(err?.message || 'Failed to upload resume.');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setError('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('No user is signed in.');
      setSaving(false);
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      phone,
      github_url: githubUrl,
      linkedin_url: linkedinUrl,
      role,
      company: role === 'recruiter' ? company : null,
      avatar_url: avatarUrl,
      headline,
      bio,
      skills,
      preferred_location: preferredLocation,
      resume_url: resumeUrl,
      resume_text: resumeText,
    });

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage('Profile updated successfully.');
    setSaving(false);
  };

  const initials = fullName
    ? fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px',
    background: '#0b1118',
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.12)',
    boxSizing: 'border-box',
    fontSize: '15px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '10px',
    color: '#e2e8f0',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
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
          maxWidth: '1100px',
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
            display: 'inline-block',
            marginBottom: '18px',
            color: '#94a3b8',
            fontSize: '12px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.14em',
          }}
        >
          Candidate Profile
        </div>

        <h1
          style={{
            fontSize: '68px',
            lineHeight: 0.95,
            letterSpacing: '-0.05em',
            margin: '0 0 14px',
            fontWeight: 800,
          }}
        >
          Profile Settings
        </h1>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '22px',
            lineHeight: 1.45,
            maxWidth: '860px',
            margin: '0 0 28px',
          }}
        >
          Manage your identity, resume, links, skills, and matching profile from a single operational surface.
        </p>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading profile...</p>
        ) : (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
              padding: '28px',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '280px 1fr',
                gap: '28px',
                alignItems: 'start',
              }}
            >
              <div>
                <div style={labelStyle}>Identity</div>

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{
                      width: '112px',
                      height: '112px',
                      objectFit: 'cover',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'block',
                      marginBottom: '16px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '112px',
                      height: '112px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '36px',
                      fontWeight: 800,
                      marginBottom: '16px',
                    }}
                  >
                    {initials}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Profile Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    style={{ color: '#cbd5e1', width: '100%' }}
                  />
                  {uploadingAvatar && (
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                      Uploading profile picture...
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Resume Upload</label>
                  {resumeUrl && (
                    <div style={{ marginBottom: '10px' }}>
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          borderBottom: '1px solid rgba(255,255,255,0.16)',
                          paddingBottom: '4px',
                        }}
                      >
                        View Current Resume
                      </a>
                    </div>
                  )}

                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    style={{ color: '#cbd5e1', width: '100%' }}
                  />
                  {uploadingResume && (
                    <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px' }}>
                      Uploading resume...
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '18px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>Preferred Location</label>
                    <input
                      value={preferredLocation}
                      onChange={(e) => setPreferredLocation(e.target.value)}
                      placeholder="Seattle, WA or Remote"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Headline</label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Security Operations Specialist with GSOC and IT experience"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief summary about your background and goals"
                    style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Skills</label>
                  <input
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="security, gsoc, access control, python"
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label style={labelStyle}>Resume Text for Matching Analysis</label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here so ClearPath can analyze keywords and fit against jobs."
                    style={{ ...inputStyle, minHeight: '180px', resize: 'vertical' }}
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '18px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input value={email} disabled style={{ ...inputStyle, color: '#94a3b8' }} />
                  </div>

                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '18px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>GitHub URL</label>
                    <input value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} style={inputStyle} />
                  </div>

                  <div>
                    <label style={labelStyle}>LinkedIn URL</label>
                    <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} style={inputStyle} />
                  </div>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: role === 'recruiter' ? '1fr 1fr' : '1fr',
                    gap: '18px',
                    marginBottom: '22px',
                  }}
                >
                  <div>
                    <label style={labelStyle}>Role</label>
                    <input value={role} disabled style={{ ...inputStyle, color: '#94a3b8' }} />
                  </div>

                  {role === 'recruiter' && (
                    <div>
                      <label style={labelStyle}>Company</label>
                      <input value={company} onChange={(e) => setCompany(e.target.value)} style={inputStyle} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      background: '#ffffff',
                      color: '#020406',
                      padding: '16px 24px',
                      fontWeight: 800,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      border: 'none',
                      cursor: saving ? 'not-allowed' : 'pointer',
                      opacity: saving ? 0.7 : 1,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>

                  <Link
                    href="/dashboard"
                    style={{
                      color: '#f8fafc',
                      textDecoration: 'none',
                      padding: '16px 24px',
                      fontWeight: 800,
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      border: '1px solid rgba(255,255,255,0.16)',
                    }}
                  >
                    Return to Dashboard
                  </Link>
                </div>

                {message && (
                  <div style={{ color: '#86efac', fontSize: '14px', marginTop: '16px' }}>
                    {message}
                  </div>
                )}

                {error && (
                  <div style={{ color: '#fca5a5', fontSize: '14px', marginTop: '16px' }}>
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
