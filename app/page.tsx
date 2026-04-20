'use client';

import Link from 'next/link';

const navItems = [
  'Candidate Experience',
  'Recruiter / HR Dashboard',
  'Executive Metrics',
];

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(8px)',
          background: 'rgba(2,4,6,0.78)',
        }}
      >
        <div
          style={{
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '18px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '3px',
                  background: '#ffffff',
                }}
              />
              <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.03em' }}>
                ClearPath
              </div>
            </div>

            <nav
              style={{
                display: 'flex',
                gap: '28px',
                flexWrap: 'wrap',
                color: '#cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              {navItems.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/auth/login"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                padding: '12px 18px',
                border: '1px solid rgba(255,255,255,0.14)',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '12px',
              }}
            >
              Log In
            </Link>

            <Link
              href="/auth/signup"
              style={{
                color: '#020406',
                background: '#ffffff',
                textDecoration: 'none',
                padding: '12px 18px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontSize: '12px',
              }}
            >
              Launch Demo
            </Link>
          </div>
        </div>
      </div>

      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '88px 32px 72px',
          display: 'grid',
          gridTemplateColumns: '1.15fr 0.85fr',
          gap: '48px',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-block',
              marginBottom: '22px',
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            Application Command Layer
          </div>

          <h1
            style={{
              fontSize: '100px',
              lineHeight: 0.9,
              letterSpacing: '-0.06em',
              margin: '0 0 28px',
              fontWeight: 800,
              maxWidth: '980px',
            }}
          >
            One system.
            <br />
            Total visibility.
            <br />
            Zero guesswork.
          </h1>

          <p
            style={{
              fontSize: '28px',
              lineHeight: 1.35,
              color: '#cbd5e1',
              maxWidth: '900px',
              margin: '0 0 34px',
            }}
          >
            Track every application, every status change, every recruiter touchpoint,
            and every match signal from a single operating surface.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '34px' }}>
            <Link
              href="/auth/signup"
              style={{
                background: '#ffffff',
                color: '#020406',
                textDecoration: 'none',
                padding: '18px 26px',
                fontWeight: 800,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Enter Candidate Demo
            </Link>

            <Link
              href="/auth/login"
              style={{
                background: 'transparent',
                color: '#f8fafc',
                textDecoration: 'none',
                padding: '18px 26px',
                fontWeight: 800,
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                border: '1px solid rgba(255,255,255,0.16)',
              }}
            >
              Open Login
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: '14px',
            }}
          >
            {[
              { label: 'Tracked Applications', value: '12' },
              { label: 'Advancing', value: '4' },
              { label: 'Unread Messages', value: '3' },
              { label: 'Match Signal', value: '82%' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.12em',
                    marginBottom: '10px',
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontSize: '34px', fontWeight: 800, letterSpacing: '-0.04em' }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#05080d',
              padding: '22px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
            }}
          >
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '28px',
                background: 'linear-gradient(180deg, #070b12 0%, #03060b 100%)',
              }}
            >
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: '18px',
                }}
              >
                Live Mission Snapshot
              </div>

              <div
                style={{
                  fontSize: '54px',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '12px',
                }}
              >
                12 active
                <br />
                tracked roles
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Last application recorded 41 minutes ago via LinkedIn.
              </div>

              <div
                style={{
                  height: '10px',
                  background: 'rgba(255,255,255,0.08)',
                  marginBottom: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: '78%',
                    height: '100%',
                    background: '#ffffff',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#94a3b8',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                <span>Applied</span>
                <span>Onboarding trajectory: 9 days</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
