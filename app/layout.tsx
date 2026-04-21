import './globals.css';
import GlobalHeader from '@/components/GlobalHeader';

export const metadata = {
  title: 'ClearPath',
  description: 'Candidate and Recruiter Visibility Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: '#020406',
        }}
      >
        <GlobalHeader />
        {children}
      </body>
    </html>
  );
}
