'use client';

import Link from 'next/link';

export default function HomePage() {
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
          paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', paddingTop: '80px', padding: 'clamp(22px, 4vw, 40px) clamp(18px, 3vw, 32px) 80px',
        }}
      >
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '56px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              ClearPath
            </div>
            <div
              style={{
                marginTop: '6px',
                color: '#94a3b8',
                fontSize: '12px',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}
            >
              Candidate + Recruiter Visibility Platform
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/auth/login" style={navLinkStyle}>
              Log In
            </Link>
            <Link href="/auth/signup" style={primaryNavLinkStyle}>
              Create Account
            </Link>
          </div>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '44px',
            alignItems: 'start',
            marginBottom: '44px',
          }}
        >
          <div>
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
              Portfolio Build â€¢ Live Product Demo
            </div>

            <h1
              style={{
                fontSize: 'clamp(44px, 9vw, 92px)',
                lineHeight: 0.92,
                letterSpacing: '-0.06em',
                margin: '0 0 18px',
                fontWeight: 800,
                maxWidth: '920px',
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
                color: '#cbd5e1',
                fontSize: 'clamp(18px, 2.8vw, 24px)',
                lineHeight: 1.45,
                maxWidth: '840px',
                margin: '0 0 26px',
              }}
            >
              ClearPath is a full-stack hiring visibility platform designed for both
              candidates and recruiters. Candidates gain real-time transparency into
              their pipeline. Recruiters gain structured analytics across roles,
              applicants, locations, and hiring momentum.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <Link href="/auth/signup" style={heroPrimaryButton}>
                Launch Platform
              </Link>
              <Link href="/recruiter/dashboard?demo=1" style={heroSecondaryButton}>
                View Recruiter Demo
              </Link>
              <Link href="/dashboard" style={heroSecondaryButton}>
                Candidate Dashboard
              </Link>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                'Next.js',
                'Supabase',
                'Railway',
                'Analytics Dashboards',
                'Candidate Transparency',
                'Recruiter Demo Mode',
              ].map((item) => (
                <div key={item} style={chipStyle}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.10)',
              background: '#05080d',
              padding: '22px',
              boxShadow: '0 24px 80px rgba(0,0,0,0.38)',
            }}
          >
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, #070b12 0%, #03060b 100%)',
                padding: '28px',
              }}
            >
              <div style={eyebrowStyle}>Platform Snapshot</div>

              <div
                style={{
                  fontSize: 'clamp(30px, 5vw, 56px)',
                  fontWeight: 800,
                  letterSpacing: '-0.05em',
                  lineHeight: 0.95,
                  marginBottom: '14px',
                }}
              >
                Built to feel
                <br />
                like a real SaaS
              </div>

              <p
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  lineHeight: 1.6,
                  margin: '0 0 24px',
                }}
              >
                ClearPath combines live authentication, recruiter analytics,
                candidate job tracking, messaging, resume tooling, and a polished
                command-center UI into a production-ready portfolio project.
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                <div style={snapshotRowStyle}>
                  <span>Candidate Analytics Dashboard</span>
                  <strong>Live</strong>
                </div>
                <div style={snapshotRowStyle}>
                  <span>Recruiter Analytics + Demo Mode</span>
                  <strong>Live</strong>
                </div>
                <div style={snapshotRowStyle}>
                  <span>Messaging + Resume Tools</span>
                  <strong>Live</strong>
                </div>
                <div style={snapshotRowStyle}>
                  <span>Cloud Deployment</span>
                  <strong>Railway</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '18px',
            marginBottom: '18px',
          }}
        >
          <div style={featureCardStyle}>
            <div style={eyebrowStyle}>Candidate Experience</div>
            <h2 style={featureTitleStyle}>Application transparency</h2>
            <p style={featureBodyStyle}>
              Track total applications, companies applied to, locations targeted,
              status changes, job sources, and recent activity from one analytics dashboard.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={eyebrowStyle}>Recruiter Experience</div>
            <h2 style={featureTitleStyle}>Hiring analytics</h2>
            <p style={featureBodyStyle}>
              Monitor total openings, applicant volume, most applied roles, location demand,
              experience-level breakdowns, and certification-driven hiring signals.
            </p>
          </div>

          <div style={featureCardStyle}>
            <div style={eyebrowStyle}>Product Positioning</div>
            <h2 style={featureTitleStyle}>Portfolio-ready system</h2>
            <p style={featureBodyStyle}>
              Designed to demonstrate product thinking, full-stack implementation,
              cloud deployment, UI polish, analytics design, and platform storytelling.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
            marginBottom: '18px',
          }}
        >
          <div style={panelStyle}>
            <div style={eyebrowStyle}>Why it matters</div>
            <h2 style={sectionTitleStyle}>Candidates need clarity. Recruiters need signal.</h2>
            <p style={sectionBodyStyle}>
              Most hiring systems prioritize workflow management but leave candidates
              in the dark and make recruiter performance hard to visualize. ClearPath
              reframes the experience around visibility, progress, and operational insight.
            </p>
          </div>

          <div style={panelStyle}>
            <div style={eyebrowStyle}>Tech + Product Story</div>
            <h2 style={sectionTitleStyle}>A real system, not just mock screens.</h2>
            <p style={sectionBodyStyle}>
              This project brings together authentication, database-backed workflows,
              recruiter analytics, candidate tracking, structured UI systems, and a
              live deployment that can be shown in interviews or demos.
            </p>
          </div>
        </div>

        <div style={ctaPanelStyle}>
          <div>
            <div style={eyebrowStyle}>Ready to explore</div>
            <h2 style={ctaTitleStyle}>Choose your path into the platform.</h2>
            <p style={ctaBodyStyle}>
              Jump into candidate tools, review the recruiter demo, or create an account
              to explore the full product experience.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/auth/signup" style={heroPrimaryButton}>
              Create Account
            </Link>
            <Link href="/auth/login" style={heroSecondaryButton}>
              Log In
            </Link>
            <Link href="/recruiter/dashboard?demo=1" style={heroSecondaryButton}>
              Recruiter Demo
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

const navLinkStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#f8fafc',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
  transition: 'transform 160ms ease, opacity 160ms ease, border-color 160ms ease',
};

const primaryNavLinkStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#020406',
  textDecoration: 'none',
  padding: '12px 16px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
  transition: 'transform 160ms ease, opacity 160ms ease, background 160ms ease',
};

const heroPrimaryButton: React.CSSProperties = {
  background: '#ffffff',
  color: '#020406',
  textDecoration: 'none',
  padding: '15px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
  transition: 'transform 160ms ease, opacity 160ms ease, background 160ms ease',
};

const heroSecondaryButton: React.CSSProperties = {
  background: 'transparent',
  color: '#f8fafc',
  textDecoration: 'none',
  padding: '15px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
  transition: 'transform 160ms ease, opacity 160ms ease, border-color 160ms ease',
};

const chipStyle: React.CSSProperties = {
  padding: '10px 14px',
  border: '1px solid rgba(255,255,255,0.12)',
  color: '#cbd5e1',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  background: 'rgba(255,255,255,0.02)',
};

const featureCardStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
  padding: '24px',
};

const panelStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
  padding: '24px',
};

const ctaPanelStyle: React.CSSProperties = {
  border: '1px solid rgba(255,255,255,0.10)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
  padding: '28px',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  alignItems: 'center',
  flexWrap: 'wrap',
};

const eyebrowStyle: React.CSSProperties = {
  color: '#94a3b8',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  marginBottom: '14px',
};

const featureTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(24px, 4vw, 32px)',
  lineHeight: 1.05,
  letterSpacing: '-0.03em',
  margin: '0 0 12px',
  fontWeight: 800,
};

const featureBodyStyle: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '17px',
  lineHeight: 1.7,
  margin: 0,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(26px, 4.5vw, 40px)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  margin: '0 0 12px',
  fontWeight: 800,
};

const sectionBodyStyle: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '18px',
  lineHeight: 1.75,
  margin: 0,
};

const ctaTitleStyle: React.CSSProperties = {
  fontSize: 'clamp(28px, 4.8vw, 42px)',
  lineHeight: 1.02,
  letterSpacing: '-0.04em',
  margin: '0 0 10px',
  fontWeight: 800,
};

const ctaBodyStyle: React.CSSProperties = {
  color: '#cbd5e1',
  fontSize: '18px',
  lineHeight: 1.7,
  margin: 0,
  maxWidth: '760px',
};

const snapshotRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 0',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  color: '#e2e8f0',
};



