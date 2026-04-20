function normalize(value: string) {
  return value.trim().toLowerCase();
}

function tokenizeText(text: string) {
  return normalize(text)
    .replace(/[^a-z0-9\s\-\/]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function toTitleCase(value: string) {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function analyzeResumeAgainstJob(
  resumeText: string,
  requiredSkills: string[] = [],
  jobTitle: string = '',
  company: string = ''
) {
  const tokens = tokenizeText(resumeText);
  const uniqueTokens = new Set(tokens);

  const normalizedSkills = requiredSkills.map(normalize);
  const matchedSkills = normalizedSkills.filter((skill) => uniqueTokens.has(skill));
  const missingSkills = normalizedSkills.filter((skill) => !uniqueTokens.has(skill));

  const currentScore =
    normalizedSkills.length > 0
      ? Math.round((matchedSkills.length / normalizedSkills.length) * 100)
      : 0;

  const projectedScore = normalizedSkills.length > 0 ? 100 : currentScore;
  const scoreIncrease = projectedScore - currentScore;

  const suggestedSummary =
    missingSkills.length > 0
      ? `Consider adding or strengthening experience around: ${missingSkills.join(', ')}. This could improve your keyword alignment for the role.`
      : 'Your resume already reflects the listed job keywords strongly. Focus on clearer impact statements and measurable outcomes.';

  const improvedProfessionalSummary = [
    `Results-driven candidate targeting the ${jobTitle || 'role'} opportunity${company ? ` at ${company}` : ''}.`,
    matchedSkills.length > 0
      ? `Current strengths already align with key areas such as ${matchedSkills.slice(0, 4).join(', ')}.`
      : `The current resume has some transferable value, but the role would benefit from stronger direct keyword alignment.`,
    missingSkills.length > 0
      ? `To improve fit, emphasize experience tied to ${missingSkills.slice(0, 4).join(', ')} in a measurable and role-specific way.`
      : `The strongest next step is refining impact-based language and making accomplishments more specific.`
  ].join(' ');

  const keywordInsertionSuggestions = missingSkills.map((skill) => {
    return `Add a concrete example showing your experience with ${skill}.`;
  });

  const exampleBulletRewrites = missingSkills.slice(0, 3).map((skill) => {
    return `Enhanced operational results by applying ${skill} in a fast-paced environment, improving workflow visibility, coordination, and execution quality.`;
  });

  const strengthenedSkillsSection =
    normalizedSkills.length > 0
      ? normalizedSkills.map(toTitleCase).join(' | ')
      : '';

  return {
    currentScore,
    projectedScore,
    scoreIncrease,
    matchedSkills,
    missingSkills,
    suggestedSummary,
    improvedProfessionalSummary,
    keywordInsertionSuggestions,
    exampleBulletRewrites,
    strengthenedSkillsSection,
  };
}
