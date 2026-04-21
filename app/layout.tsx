import './globals.css';
import GlobalHeader from '@/components/GlobalHeader';

export const metadata = {
  title: 'ClearPath',
  description: 'Candidate and Recruiter Visibility Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#020406',
          color: '#f8fafc',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <GlobalHeader />
        <div style={{ paddingTop: '8px' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
