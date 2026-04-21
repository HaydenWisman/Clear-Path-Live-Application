'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdatePassword = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setMessage('Password updated successfully.');

      setTimeout(() => {
        router.push('/auth/login');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '420px',
          background: '#121c33',
          padding: '32px',
          borderRadius: '18px',
          color: '#fff',
        }}
      >
        <h1>Set New Password</h1>
        <p style={{ color: '#b7c2d8', marginBottom: '20px' }}>
          Enter your new password below.
        </p>

        <input
          type='password'
          placeholder='New Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '12px',
            borderRadius: '10px',
            border: '1px solid #2c3b5c',
            background: '#0b1324',
            color: '#fff',
            boxSizing: 'border-box',
          }}
        />

        <input
          type='password'
          placeholder='Confirm New Password'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

        <button
          onClick={handleUpdatePassword}
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
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {message && <p style={{ color: '#4ade80', marginTop: '14px' }}>{message}</p>}
        {error && <p style={{ color: '#ff6b6b', marginTop: '14px' }}>{error}</p>}
      </div>
    </main>
  );
}

