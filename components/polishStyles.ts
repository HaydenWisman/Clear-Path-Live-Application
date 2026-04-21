export const polishedPrimaryButton = {
  background: '#ffffff',
  color: '#020406',
  textDecoration: 'none',
  padding: '14px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid #ffffff',
  transition: 'transform 160ms ease, opacity 160ms ease, background 160ms ease',
} as const;

export const polishedSecondaryButton = {
  background: 'transparent',
  color: '#f8fafc',
  textDecoration: 'none',
  padding: '14px 20px',
  fontWeight: 800,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  border: '1px solid rgba(255,255,255,0.16)',
  transition: 'transform 160ms ease, opacity 160ms ease, border-color 160ms ease',
} as const;

export const polishedCard = {
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
  boxShadow: '0 16px 40px rgba(0,0,0,0.20)',
} as const;
