'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const supabase = createClient();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('candidate');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role === 'candidate') {
        router.push('/dashboard');
        return;
      }

      if (profile?.role === 'recruiter') {
        router.push('/recruiter/dashboard');
        return;
      }

      setChecking(false);
    };

    checkUserAndProfile();
  }, [router, supabase]);

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

      if (!fullName.trim()) {
        setError('Full name is required.');
        setLoading(false);
        return;
      }

      if (role === 'recruiter' && !company.trim()) {
        setError('Company is required for recruiters.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: fullName,
        role,
        company: role === 'recruiter' ? company : null,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to save profile.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#081225', color: '#fff', fontFamily: 'Arial, sans-serif' }}>
        <p>Loading onboarding...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#081225',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#121c33',
          padding: '32px',
          borderRadius: '18px',
          color: '#fff',
        }}
      >
        <h1 style={{ marginBottom: '8px' }}>Complete Your Profile</h1>
        <p style={{ color: '#b7c2d8', marginBottom: '20px' }}>
          Tell us whether you are a candidate or recruiter.
        </p>

        <input
          type='text'
          placeholder='Full Name'
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '14px',
            borderRadius: '10px',
            border: '1px solid #2c3b5c',
            background: '#0b1324',
            color: '#fff',
            boxSizing: 'border-box',
          }}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '14px',
            borderRadius: '10px',
            border: '1px solid #2c3b5c',
            background: '#0b1324',
            color: '#fff',
            boxSizing: 'border-box',
          }}
        >
          <option value='candidate'>Candidate</option>
          <option value='recruiter'>Recruiter</option>
        </select>

        {role === 'recruiter' && (
          <input
            type='text'
            placeholder='Company Name'
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '14px',
              borderRadius: '10px',
              border: '1px solid #2c3b5c',
              background: '#0b1324',
              color: '#fff',
              boxSizing: 'border-box',
            }}
          />
        )}

        <button
          onClick={handleSaveProfile}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: loading ? '#4e5d7a' : '#4f7cff',
            color: '#fff',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>

        {error && (
          <p style={{ color: '#ff6b6b', marginTop: '14px' }}>
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

