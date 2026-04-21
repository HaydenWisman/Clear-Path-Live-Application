'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)', color: '#f8fafc', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '520px', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))', padding: '32px' }}>
        <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '16px' }}>
          Authentication
        </div>

        <h1 style={{ fontSize: '54px', lineHeight: 0.95, letterSpacing: '-0.05em', margin: '0 0 14px', fontWeight: 800 }}>
          Log in
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '18px', lineHeight: 1.5, margin: '0 0 24px' }}>
          Access your candidate or recruiter command center.
        </p>

        <div style={{ display: 'grid', gap: '14px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '16px', background: '#0b1118', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', boxSizing: 'border-box' }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '16px', background: '#0b1118', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', boxSizing: 'border-box' }}
          />

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ background: '#ffffff', color: '#020406', padding: '16px 24px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Signing In...' : 'Log In'}
          </button>

          <Link
            href="/auth/forgot-password"
            style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.14)', paddingBottom: '4px', width: 'fit-content' }}
          >
            Forgot Password
          </Link>

          <Link
            href="/auth/signup"
            style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.14)', paddingBottom: '4px', width: 'fit-content' }}
          >
            Create Account
          </Link>

          {error && <div style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</div>}
        </div>
      </div>
    </main>
  );
}

