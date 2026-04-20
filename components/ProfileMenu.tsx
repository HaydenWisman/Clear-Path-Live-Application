'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ProfileRow = {
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
};

export default function ProfileMenu() {
  const supabase = createClient();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('User');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      const profile = data as ProfileRow | null;

      setFullName(
        profile?.full_name?.trim() ||
        user.email?.split('@')[0] ||
        'User'
      );

      setEmail(profile?.email || user.email || '');
      setAvatarUrl(profile?.avatar_url || null);
    };

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = fullName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '999px',
          border: '1px solid rgba(255,255,255,0.16)',
          background: 'rgba(255,255,255,0.04)',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          fontWeight: 800,
          fontSize: '14px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
        aria-label="Open profile menu"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          initials
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '58px',
            right: 0,
            minWidth: '260px',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
            padding: '14px',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              paddingBottom: '12px',
              marginBottom: '12px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div
              style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                marginBottom: '4px',
              }}
            >
              {fullName}
            </div>
            <div
              style={{
                color: '#94a3b8',
                fontSize: '12px',
                overflowWrap: 'anywhere',
              }}
            >
              {email}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <Link href="/profile" style={linkStyle}>Profile</Link>
            <Link href="/dashboard" style={linkStyle}>Candidate Dashboard</Link>
            <Link href="/recruiter/dashboard" style={linkStyle}>Recruiter Dashboard</Link>
            <Link href="/messages" style={linkStyle}>Messages</Link>
            <button onClick={handleLogout} style={logoutStyle}>Logout</button>
          </div>
        </div>
      )}
    </div>
  );
}

const linkStyle: React.CSSProperties = {
  display: 'block',
  textDecoration: 'none',
  color: '#f8fafc',
  padding: '12px 14px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.02)',
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

const logoutStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  color: '#f8fafc',
  padding: '12px 14px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.02)',
  fontWeight: 700,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  cursor: 'pointer',
};
