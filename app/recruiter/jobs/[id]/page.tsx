'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { calculateMatch } from '@/lib/matching/score';
import { generateFitSummary } from '@/lib/matching/summary';

type Applicant = {
  id: string;
  status: string;
  applied_at: string;
  source: string | null;
  candidate_id: string;
  profiles: {
    full_name: string | null;
    email: string | null;
    role: string | null;
    company: string | null;
    avatar_url: string | null;
    phone: string | null;
    linkedin_url: string | null;
    github_url: string | null;
    resume_url: string | null;
    headline: string | null;
    skills: string[] | null;
    preferred_location: string | null;
  } | null;
};

type RankedApplicant = Applicant & {
  matchScore: number;
  explanation: string[];
  fitSummary: string;
};

export default function RecruiterJobApplicantsPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const router = useRouter();
  const jobId = params.id;

  const [jobTitle, setJobTitle] = useState('');
  const [applicants, setApplicants] = useState<RankedApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [messagingId, setMessagingId] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadApplicants = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const { data: currentJob, error: jobError } = await supabase
      .from('jobs')
      .select('title, location, skills_required, employment_type, experience_level')
      .eq('id', jobId)
      .single();

    if (jobError) {
      setError(jobError.message);
      setLoading(false);
      return;
    }

    setJobTitle(currentJob?.title || 'Job');

    const { data, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        source,
        candidate_id,
        profiles:candidate_id (
          full_name,
          email,
          role,
          company,
          avatar_url,
          phone,
          linkedin_url,
          github_url,
          resume_url,
          headline,
          skills,
          preferred_location
        )
      `)
      .eq('job_id', jobId)
      .order('applied_at', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    const rankedApplicants: RankedApplicant[] = ((data as any) || []).map((applicant: any) => {
      const result = calculateMatch(applicant.profiles || {}, currentJob || {});
      const fitSummary = generateFitSummary({
        score: result.score,
        explanation: result.explanation,
        candidateHeadline: applicant.profiles?.headline,
        candidateSkills: applicant.profiles?.skills,
        jobTitle: currentJob?.title,
        jobSkills: currentJob?.skills_required,
      });

      return {
        ...applicant,
        matchScore: result.score,
        explanation: result.explanation,
        fitSummary,
      };
    });

    rankedApplicants.sort((a, b) => b.matchScore - a.matchScore);
    setApplicants(rankedApplicants);
    setLoading(false);
  };

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  const updateStatus = async (applicationId: string, status: string) => {
    setSavingId(applicationId);
    setError('');
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) {
      setError(error.message);
      setSavingId('');
      return;
    }

    if (user) {
      await supabase.from('application_timeline').insert({
        application_id: applicationId,
        status,
        note: `Application moved to ${status}`,
        created_by: user.id,
      });

      const targetCandidateId = applicants.find((app) => app.id === applicationId)?.candidate_id;

      if (targetCandidateId) {
        await supabase.from('notifications').insert({
          user_id: targetCandidateId,
          type: 'application_updated',
          title: 'Application Updated',
          body: `Your application for ${jobTitle} was updated to ${status}.`,
          link: `/applications/${applicationId}`,
          is_read: false,
        });

        if (status === 'interview') {
          await supabase.from('notifications').insert({
            user_id: targetCandidateId,
            type: 'interview_scheduled',
            title: 'Interview Scheduled',
            body: `Good news — you have moved to the interview stage for ${jobTitle}.`,
            link: `/applications/${applicationId}`,
            is_read: false,
          });
        }
      }
    }

    setApplicants((prev) =>
      prev.map((app) =>
        app.id === applicationId ? { ...app, status } : app
      )
    );

    setMessage('Application status updated.');
    setSavingId('');
  };

  const messageCandidate = async (candidateId: string) => {
    setMessagingId(candidateId);
    setError('');
    setMessage('');

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError('You must be logged in.');
      setMessagingId('');
      return;
    }

    const recruiterId = user.id;

    const { data: existingParticipantRows, error: existingError } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .in('user_id', [recruiterId, candidateId]);

    if (existingError) {
      setError(existingError.message);
      setMessagingId('');
      return;
    }

    const counts: Record<string, number> = {};
    (existingParticipantRows || []).forEach((row: any) => {
      counts[row.conversation_id] = (counts[row.conversation_id] || 0) + 1;
    });

    const existingConversationId = Object.keys(counts).find((id) => counts[id] >= 2);

    if (existingConversationId) {
      router.push('/messages?conversation=' + existingConversationId);
      return;
    }

    const { data: conversationData, error: conversationError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (conversationError) {
      setError(conversationError.message);
      setMessagingId('');
      return;
    }

    const conversationId = conversationData.id;

    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversationId, user_id: recruiterId },
        { conversation_id: conversationId, user_id: candidateId },
      ]);

    if (participantError) {
      setError(participantError.message);
      setMessagingId('');
      return;
    }

    router.push('/messages?conversation=' + conversationId);
  };

  const getProgress = (score: number) => Math.max(12, Math.min(100, score));

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020406 0%, #05080d 30%, #0a1017 100%)',
        color: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <section
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '52px 32px 70px',
        }}
      >
        <div style={{ marginBottom: '22px' }}>
          <Link
            href="/recruiter/jobs"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderBottom: '1px solid rgba(255,255,255,0.14)',
              paddingBottom: '4px',
            }}
          >
            Back to Recruiter Jobs
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: '40px',
            alignItems: 'start',
            marginBottom: '36px',
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
              Applicant Review Surface
            </div>

            <h1
              style={{
                fontSize: '68px',
                lineHeight: 0.95,
                letterSpacing: '-0.05em',
                margin: '0 0 14px',
                fontWeight: 800,
              }}
            >
              Applicant
              <br />
              review queue
            </h1>

            <p
              style={{
                color: '#cbd5e1',
                fontSize: '22px',
                lineHeight: 1.45,
                maxWidth: '860px',
                margin: '0 0 18px',
              }}
            >
              Ranked view for <span style={{ color: '#ffffff', fontWeight: 800 }}>{jobTitle}</span>.
              Review fit, update statuses, and move directly into candidate messaging.
            </p>

            {message && <div style={{ color: '#86efac', fontSize: '14px', marginTop: '10px' }}>{message}</div>}
            {error && <div style={{ color: '#fca5a5', fontSize: '14px', marginTop: '10px' }}>{error}</div>}
          </div>

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
                Live Ranking Snapshot
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
                {applicants.length} ranked
                <br />
                candidates
              </div>

              <div
                style={{
                  color: '#cbd5e1',
                  fontSize: '18px',
                  marginBottom: '24px',
                }}
              >
                Match ranking, recruiter messaging, and timeline actions are active for this role.
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
                    width: `${Math.min(100, Math.max(10, applicants.length * 12))}%`,
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
                <span>Review Active</span>
                <span>Messaging Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading applicants...</p>
        ) : applicants.length === 0 ? (
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
              padding: '28px',
              color: '#94a3b8',
            }}
          >
            No applicants yet.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '18px',
            }}
          >
            {applicants.map((applicant) => {
              const profile = applicant.profiles;
              const initials = profile?.full_name
                ? profile.full_name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                : 'U';

              return (
                <div
                  key={applicant.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'linear-gradient(180deg, rgba(9,12,18,0.98), rgba(5,8,13,0.98))',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '16px',
                      alignItems: 'start',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt="Applicant"
                          style={{
                            width: '64px',
                            height: '64px',
                            objectFit: 'cover',
                            border: '1px solid rgba(255,255,255,0.12)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '64px',
                            height: '64px',
                            border: '1px solid rgba(255,255,255,0.12)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '22px',
                            background: 'rgba(255,255,255,0.03)',
                          }}
                        >
                          {initials}
                        </div>
                      )}

                      <div>
                        <div
                          style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            lineHeight: 1.05,
                            letterSpacing: '-0.03em',
                            marginBottom: '6px',
                          }}
                        >
                          {profile?.full_name || 'Unnamed Candidate'}
                        </div>
                        <div style={{ color: '#cbd5e1', fontSize: '15px' }}>
                          Applied {new Date(applicant.applied_at).toLocaleDateString()} • {applicant.source || '-'}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        minWidth: '96px',
                        border: '1px solid rgba(255,255,255,0.12)',
                        padding: '12px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <div
                        style={{
                          color: '#94a3b8',
                          fontSize: '10px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.12em',
                          marginBottom: '6px',
                        }}
                      >
                        Match
                      </div>
                      <div style={{ fontSize: '28px', fontWeight: 800 }}>{applicant.matchScore}%</div>
                    </div>
                  </div>

                  <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>
                    <div>Phone: {profile?.phone || '-'}</div>
                    <div>Headline: {profile?.headline || '-'}</div>
                    <div>
                      Skills: {profile?.skills && profile.skills.length > 0 ? profile.skills.join(', ') : '-'}
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.02)',
                      padding: '16px',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '8px',
                      }}
                    >
                      AI Fit Summary
                    </div>
                    <div style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{applicant.fitSummary}</div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '8px',
                      }}
                    >
                      <span>Fit Strength</span>
                      <span>{applicant.matchScore}%</span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${getProgress(applicant.matchScore)}%`,
                          height: '100%',
                          background: '#ffffff',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        marginBottom: '8px',
                      }}
                    >
                      Why This Matches
                    </div>

                    <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {applicant.explanation.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {profile?.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          borderBottom: '1px solid rgba(255,255,255,0.22)',
                          paddingBottom: '4px',
                        }}
                      >
                        LinkedIn
                      </a>
                    )}

                    {profile?.github_url && (
                      <a
                        href={profile.github_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          borderBottom: '1px solid rgba(255,255,255,0.22)',
                          paddingBottom: '4px',
                        }}
                      >
                        GitHub
                      </a>
                    )}

                    {profile?.resume_url && (
                      <a
                        href={profile.resume_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#ffffff',
                          textDecoration: 'none',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          borderBottom: '1px solid rgba(255,255,255,0.22)',
                          paddingBottom: '4px',
                        }}
                      >
                        Resume
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <select
                      value={applicant.status}
                      onChange={(e) => updateStatus(applicant.id, e.target.value)}
                      disabled={savingId === applicant.id}
                      style={{
                        padding: '14px',
                        background: '#0b1118',
                        color: '#ffffff',
                        border: '1px solid rgba(255,255,255,0.12)',
                        minWidth: '220px',
                      }}
                    >
                      <option value="submitted">submitted</option>
                      <option value="under_review">under_review</option>
                      <option value="interview">interview</option>
                      <option value="offer">offer</option>
                      <option value="rejected">rejected</option>
                      <option value="withdrawn">withdrawn</option>
                    </select>

                    <button
                      onClick={() => messageCandidate(applicant.candidate_id)}
                      disabled={messagingId === applicant.candidate_id}
                      style={{
                        background: '#ffffff',
                        color: '#020406',
                        padding: '14px 20px',
                        fontWeight: 800,
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        border: 'none',
                        cursor: messagingId === applicant.candidate_id ? 'not-allowed' : 'pointer',
                        opacity: messagingId === applicant.candidate_id ? 0.7 : 1,
                      }}
                    >
                      {messagingId === applicant.candidate_id ? 'Opening...' : 'Message Candidate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
