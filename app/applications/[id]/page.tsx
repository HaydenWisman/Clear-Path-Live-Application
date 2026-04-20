'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type TimelineEntry = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

type ApplicationDetail = {
  id: string;
  status: string;
  applied_at: string;
  source: string | null;
  jobs: {
    id: string;
    company: string;
    title: string;
    location: string | null;
    description: string | null;
    recruiter_id: string;
  } | null;
};

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const applicationId = params.id;

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [conversationId, setConversationId] = useState('');
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadApplication = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('You must be logged in.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          source,
          jobs:job_id (
            id,
            company,
            title,
            location,
            description,
            recruiter_id
          )
        `)
        .eq('id', applicationId)
        .eq('candidate_id', user.id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setApplication((data as any) || null);

      const { data: timelineData } = await supabase
        .from('application_timeline')
        .select('id, status, note, created_at')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: true });

      setTimeline((timelineData as any) || []);

      const recruiterId = (data as any)?.jobs?.recruiter_id;
      if (recruiterId) {
        const { data: existingParticipantRows } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .in('user_id', [user.id, recruiterId]);

        const counts: Record<string, number> = {};
        (existingParticipantRows || []).forEach((row: any) => {
          counts[row.conversation_id] = (counts[row.conversation_id] || 0) + 1;
        });

        const existingConversationId = Object.keys(counts).find((id) => counts[id] >= 2);
        if (existingConversationId) {
          setConversationId(existingConversationId);
        }
      }

      setLoading(false);
    };

    loadApplication();
  }, [applicationId, supabase]);

  const statusMeaning: Record<string, string> = {
    submitted: 'Your application has been submitted.',
    under_review: 'A recruiter is reviewing your application.',
    interview: 'You have moved forward to an interview stage.',
    offer: 'You have received or are in line for an offer.',
    rejected: 'This application was not selected.',
    withdrawn: 'This application has been withdrawn.',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#081225', color: '#fff', fontFamily: 'Arial, sans-serif', padding: '32px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <Link href='/dashboard' style={{ color: '#7ea8ff', textDecoration: 'none' }}>
          ← Back to Dashboard
        </Link>

        {loading ? (
          <p style={{ marginTop: '20px' }}>Loading application...</p>
        ) : error ? (
          <p style={{ marginTop: '20px', color: '#ff6b6b' }}>{error}</p>
        ) : !application ? (
          <p style={{ marginTop: '20px', color: '#9fb0ce' }}>Application not found.</p>
        ) : (
          <>
            <div style={{ background: '#121c33', borderRadius: '18px', padding: '24px', marginTop: '20px' }}>
              <h1 style={{ marginTop: 0 }}>{application.jobs?.title || 'Application'}</h1>
              <p style={{ color: '#b7c2d8' }}>
                {application.jobs?.company || '-'}{application.jobs?.location ? ' · ' + application.jobs.location : ''}
              </p>

              <div style={{ marginTop: '18px', display: 'grid', gap: '12px' }}>
                <div>
                  <strong>Status:</strong> {application.status}
                </div>
                <div>
                  <strong>Applied:</strong> {new Date(application.applied_at).toLocaleDateString()}
                </div>
                <div>
                  <strong>Source:</strong> {application.source || '-'}
                </div>
              </div>

              <div style={{ marginTop: '18px', background: '#0b1324', border: '1px solid #223150', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#9fb0ce', marginBottom: '8px' }}>Current Status</div>
                <div style={{ color: '#dbe6ff', lineHeight: 1.7 }}>
                  {statusMeaning[application.status] || 'Current status available.'}
                </div>
              </div>

              <div style={{ marginTop: '18px' }}>
                <strong>Job Description</strong>
                <p style={{ color: '#b7c2d8', lineHeight: 1.7 }}>
                  {application.jobs?.description || 'No description available.'}
                </p>
              </div>

              <div style={{ marginTop: '24px' }}>
                <h2 style={{ marginBottom: '12px' }}>Application Timeline</h2>

                {timeline.length === 0 ? (
                  <div style={{ background: '#0b1324', border: '1px solid #223150', borderRadius: '12px', padding: '16px', color: '#9fb0ce' }}>
                    No timeline events yet.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {timeline.map((entry) => (
                      <div key={entry.id} style={{ background: '#0b1324', border: '1px solid #223150', borderRadius: '12px', padding: '16px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>{entry.status}</div>
                        <div style={{ color: '#b7c2d8', marginBottom: '6px' }}>
                          {entry.note || 'Status updated'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9fb0ce' }}>
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
                <Link
                  href='/jobs'
                  style={{ padding: '12px 16px', borderRadius: '10px', background: '#4f7cff', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Browse More Jobs
                </Link>

                {conversationId && (
                  <Link
                    href={`/messages?conversation=${conversationId}`}
                    style={{ padding: '12px 16px', borderRadius: '10px', background: '#1d4ed8', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    Message Recruiter
                  </Link>
                )}

                <Link
                  href='/messages'
                  style={{ padding: '12px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  Open Messages
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
