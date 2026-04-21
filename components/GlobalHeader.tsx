'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlobalHeader() {
  const pathname = usePathname();

  return (
    <header
      style={{
        width: '100%',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: '#020406',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '14px clamp(18px, 3vw, 32px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span
            style={{
              fontSize: '14px',
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#ffffff',
            }}
          >
            Clear Path
          </span>

          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#64748b',
              marginTop: '2px',
            }}
          >
            Visibility Platform
          </span>
        </Link>

        {/* NAV */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <NavLink href="/dashboard" label="Candidate" active={pathname === '/dashboard'} />
          <NavLink href="/recruiter/dashboard" label="Recruiter" active={pathname?.includes('/recruiter')} />
          <NavLink href="/messages" label="Messages" active={pathname === '/messages'} />
          <NavLink href="/profile" label="Profile" active={pathname === '/profile'} />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        padding: '10px 14px',
        fontSize: '11px',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        border: active
          ? '1px solid #ffffff'
          : '1px solid rgba(255,255,255,0.16)',
        background: active ? '#ffffff' : 'transparent',
        color: active ? '#020406' : '#f8fafc',
        transition: 'all 160ms ease',
      }}
    >
      {label}
    </Link>
  );
}
