type SummaryInput = {
  score: number;
  explanation: string[];
  candidateHeadline?: string | null;
  candidateSkills?: string[] | null;
  jobTitle?: string | null;
  jobSkills?: string[] | null;
};

export function generateFitSummary(input: SummaryInput): string {
  const {
    score,
    explanation,
    candidateHeadline,
    candidateSkills,
    jobTitle,
    jobSkills,
  } = input;

  const skillsCount = candidateSkills?.length || 0;
  const requiredSkillsCount = jobSkills?.length || 0;

  let tone = '';

  if (score >= 80) {
    tone = 'Strong fit overall.';
  } else if (score >= 60) {
    tone = 'Promising fit overall.';
  } else if (score >= 40) {
    tone = 'Moderate fit with some alignment.';
  } else {
    tone = 'Limited fit based on current structured data.';
  }

  let skillSummary = '';
  if (skillsCount > 0 && requiredSkillsCount > 0) {
    skillSummary = ` The profile includes ${skillsCount} listed skills, compared against ${requiredSkillsCount} required job skills.`;
  }

  let titleSummary = '';
  if (candidateHeadline && jobTitle) {
    titleSummary = ` The candidate headline was compared against the job title "${jobTitle}".`;
  }

  let explanationSummary = '';
  if (explanation.length > 0) {
    explanationSummary = ' Key factors: ' + explanation.join('; ') + '.';
  }

  return `${tone}${skillSummary}${titleSummary}${explanationSummary}`.trim();
}
