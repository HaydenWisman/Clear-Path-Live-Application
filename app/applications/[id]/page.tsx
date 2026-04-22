'use client';

import Link from 'next/link';

export default function ApplicationDetailPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020406 0%, #05080d 35%, #0a1017 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          paddingTop: '80px',
          padding: 'clamp(24px, 4vw, 56px) clamp(18px, 3vw, 32px) 70px',
        }}
      >
        <header style={{ marginBottom: '24px' }}>
          <div
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '12px',
            }}
          >
            Application Detail
          </div>

          <h1
            style={{
              fontSize: 'clamp(34px, 6vw, 64px)',
              lineHeight: 0.96,
              letterSpacing: '-0.05em',
              margin: '0 0 12px',
              fontWeight: 800,
            }}
          >
            Application record
          </h1>

          <p
            style={{
              color: '#cbd5e1',
              fontSize: '18px',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '760px',
            }}
          >
            Review the selected application and return to your dashboard to continue exploring the platform.
          </p>
        </header>

        <div
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
            padding: '24px',
            marginBottom: '20px',
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
            Demo-safe placeholder
          </div>

          <p
            style={{
              color: '#e2e8f0',
              fontSize: '16px',
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            This page is ready for deeper application detail content. For tomorrow’s class demo, the key priority is keeping navigation stable and demo routes available.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/dashboard" style={primaryLink}>
            Candidate Dashboard
          </Link>
          <Link href="/dashboard?demo=1" style={secondaryLink}>
            Candidate Demo
          </Link>
          <Link href="/recruiter/dashboard?demo=1" style={secondaryLink}>
            Recruiter Demo
          </Link>
        </div>
      </section>
    </main>
  );
}

const primaryLink: React.CSSProperties = {
  background: '#ffffff',
  color: '#020406',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
};

const secondaryLink: React.CSSProperties = {
  background: 'transparent',
  color: '#f8fafc',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
};
