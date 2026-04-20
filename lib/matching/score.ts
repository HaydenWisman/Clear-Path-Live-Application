export type CandidateProfile = {
  headline?: string | null;
  skills?: string[] | null;
  preferred_location?: string | null;
};

export type JobProfile = {
  title?: string | null;
  location?: string | null;
  skills_required?: string[] | null;
  employment_type?: string | null;
  experience_level?: string | null;
};

export type MatchResult = {
  score: number;
  explanation: string[];
};

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/[\s,\/\-]+/)
    .filter(Boolean);
}

export function calculateMatch(
  candidate: CandidateProfile,
  job: JobProfile
): MatchResult {
  let score = 0;
  const explanation: string[] = [];

  const candidateSkills = (candidate.skills || []).map(normalize);
  const requiredSkills = (job.skills_required || []).map(normalize);

  if (requiredSkills.length > 0 && candidateSkills.length > 0) {
    const overlap = requiredSkills.filter((skill) =>
      candidateSkills.includes(skill)
    );

    const skillsScore = Math.round((overlap.length / requiredSkills.length) * 50);
    score += skillsScore;

    if (overlap.length > 0) {
      explanation.push(`Matched ${overlap.length} of ${requiredSkills.length} required skills`);
    } else {
      explanation.push('No direct skill overlap yet');
    }
  }

  const preferredLocation = candidate.preferred_location
    ? normalize(candidate.preferred_location)
    : '';
  const jobLocation = job.location ? normalize(job.location) : '';

  if (preferredLocation && jobLocation) {
    if (preferredLocation === jobLocation) {
      score += 20;
      explanation.push('Preferred location matches the job location');
    } else if (
      preferredLocation.includes('remote') && jobLocation.includes('remote')
    ) {
      score += 20;
      explanation.push('Remote preference aligns with the job');
    }
  }

  const headlineTokens = candidate.headline ? tokenize(candidate.headline) : [];
  const titleTokens = job.title ? tokenize(job.title) : [];

  if (headlineTokens.length > 0 && titleTokens.length > 0) {
    const titleOverlap = titleTokens.filter((token) =>
      headlineTokens.includes(token)
    );

    if (titleOverlap.length > 0) {
      const titleScore = Math.min(20, titleOverlap.length * 5);
      score += titleScore;
      explanation.push('Headline aligns with the job title');
    }
  }

  score = Math.min(score, 100);

  if (explanation.length === 0) {
    explanation.push('Limited structured match data so far');
  }

  return { score, explanation };
}
