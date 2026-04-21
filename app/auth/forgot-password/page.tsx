'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const redirectTo = `${window.location.origin}/auth/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage('Password reset email sent. Check your inbox.');
    setLoading(false);
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)', color: '#f8fafc', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
      <div style={{ width: '100%', maxWidth: '520px', border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))', padding: '32px' }}>
        <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '16px' }}>
          Authentication
        </div>

        <h1 style={{ fontSize: '54px', lineHeight: 0.95, letterSpacing: '-0.05em', margin: '0 0 14px', fontWeight: 800 }}>
          Reset password
        </h1>

        <p style={{ color: '#cbd5e1', fontSize: '18px', lineHeight: 1.5, margin: '0 0 24px' }}>
          Enter your email and weâ€™ll send you a secure reset link.
        </p>

        <div style={{ display: 'grid', gap: '14px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '16px', background: '#0b1118', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)', boxSizing: 'border-box' }}
          />

          <button
            onClick={handleReset}
            disabled={loading}
            style={{ background: '#ffffff', color: '#020406', padding: '16px 24px', fontWeight: 800, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <Link
            href="/auth/login"
            style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', borderBottom: '1px solid rgba(255,255,255,0.14)', paddingBottom: '4px', width: 'fit-content' }}
          >
            Back to Login
          </Link>

          {message && <div style={{ color: '#86efac', fontSize: '14px' }}>{message}</div>}
          {error && <div style={{ color: '#fca5a5', fontSize: '14px' }}>{error}</div>}
        </div>
      </div>
    </main>
  );
}

