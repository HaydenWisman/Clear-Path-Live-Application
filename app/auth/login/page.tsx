'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    window.location.href = '/dashboard';
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
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '780px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            padding: '48px',
            marginTop: '80px',
          }}
        >
          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '18px',
            }}
          >
            Authentication
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 82px)',
              lineHeight: 0.95,
              letterSpacing: '-0.05em',
              margin: '0 0 16px',
              fontWeight: 800,
            }}
          >
            Log in
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '18px',
              lineHeight: 1.6,
              margin: '0 0 28px',
            }}
          >
            Access your candidate or recruiter command center.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={inputStyle}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={inputStyle}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#ffffff',
                  color: '#020406',
                  padding: '16px 20px',
                  fontWeight: 800,
                  fontSize: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.10em',
                  border: '1px solid #ffffff',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '6px',
                }}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>
            </div>
          </form>

          {errorMessage && (
            <div
              style={{
                marginTop: '16px',
                color: '#fca5a5',
                fontSize: '14px',
              }}
            >
              {errorMessage}
            </div>
          )}

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/auth/forgot-password" style={textLinkStyle}>
              Forgot Password
            </Link>

            <Link href="/auth/signup" style={textLinkStyle}>
              Create Account
            </Link>
          </div>

          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <a href="/dashboard?demo=1" style={demoButtonStyle}>
              Candidate Demo
            </a>

            <a href="/recruiter/dashboard?demo=1" style={demoButtonStyle}>
              Recruiter Demo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '18px 16px',
  background: '#071018',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.12)',
  fontSize: '16px',
  boxSizing: 'border-box',
};

const textLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  color: '#cbd5e1',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
  borderBottom: '1px solid rgba(255,255,255,0.20)',
  paddingBottom: '2px',
};

const demoButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  textDecoration: 'none',
  textAlign: 'center',
  background: 'transparent',
  color: '#f8fafc',
  padding: '14px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
};
