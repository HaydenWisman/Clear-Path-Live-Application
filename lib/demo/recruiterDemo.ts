export type DemoJobRow = {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  status: string | null;
  experience_level: string | null;
  certifications_required?: string[] | null;
};

export type DemoApplicationRow = {
  id: string;
  status: string | null;
  applied_at: string | null;
  job_id: string;
};

export const demoRecruiterProfile = {
  fullName: 'Hayden Wisman',
  company: 'ClearPath Talent Systems',
};

export const demoRecruiterJobs: DemoJobRow[] = [
  {
    id: 'job-1',
    title: 'Security Operations Analyst',
    company: 'ClearPath Talent Systems',
    location: 'Seattle, WA',
    status: 'open',
    experience_level: 'entry',
    certifications_required: ['Security+'],
  },
  {
    id: 'job-2',
    title: 'Corporate Security Manager',
    company: 'ClearPath Talent Systems',
    location: 'Los Angeles, CA',
    status: 'open',
    experience_level: 'mid',
    certifications_required: [],
  },
  {
    id: 'job-3',
    title: 'AI Program Manager',
    company: 'ClearPath Talent Systems',
    location: 'Austin, TX',
    status: 'open',
    experience_level: 'senior',
    certifications_required: ['PMP'],
  },
  {
    id: 'job-4',
    title: 'Director of Security Technology',
    company: 'ClearPath Talent Systems',
    location: 'London, England',
    status: 'open',
    experience_level: 'executive',
    certifications_required: [],
  },
  {
    id: 'job-5',
    title: 'GSOC Specialist',
    company: 'ClearPath Talent Systems',
    location: 'Miami, FL',
    status: 'closed',
    experience_level: 'entry',
    certifications_required: ['Security+'],
  },
  {
    id: 'job-6',
    title: 'Regional Recruiting Lead',
    company: 'ClearPath Talent Systems',
    location: 'New York, NY',
    status: 'open',
    experience_level: 'senior',
    certifications_required: [],
  },
];

export const demoRecruiterApplications: DemoApplicationRow[] = [
  { id: 'app-1', status: 'submitted', applied_at: '2026-04-01T12:00:00.000Z', job_id: 'job-1' },
  { id: 'app-2', status: 'under_review', applied_at: '2026-04-02T12:00:00.000Z', job_id: 'job-1' },
  { id: 'app-3', status: 'interview', applied_at: '2026-04-03T12:00:00.000Z', job_id: 'job-1' },
  { id: 'app-4', status: 'submitted', applied_at: '2026-04-01T12:00:00.000Z', job_id: 'job-2' },
  { id: 'app-5', status: 'under_review', applied_at: '2026-04-03T12:00:00.000Z', job_id: 'job-2' },
  { id: 'app-6', status: 'submitted', applied_at: '2026-04-04T12:00:00.000Z', job_id: 'job-3' },
  { id: 'app-7', status: 'interview', applied_at: '2026-04-05T12:00:00.000Z', job_id: 'job-3' },
  { id: 'app-8', status: 'submitted', applied_at: '2026-04-05T12:00:00.000Z', job_id: 'job-3' },
  { id: 'app-9', status: 'submitted', applied_at: '2026-04-06T12:00:00.000Z', job_id: 'job-4' },
  { id: 'app-10', status: 'offer', applied_at: '2026-04-06T12:00:00.000Z', job_id: 'job-4' },
  { id: 'app-11', status: 'submitted', applied_at: '2026-04-07T12:00:00.000Z', job_id: 'job-6' },
  { id: 'app-12', status: 'under_review', applied_at: '2026-04-07T12:00:00.000Z', job_id: 'job-6' },
  { id: 'app-13', status: 'interview', applied_at: '2026-04-08T12:00:00.000Z', job_id: 'job-6' },
  { id: 'app-14', status: 'submitted', applied_at: '2026-04-08T12:00:00.000Z', job_id: 'job-6' },
  { id: 'app-15', status: 'submitted', applied_at: '2026-04-08T12:00:00.000Z', job_id: 'job-2' },
];

export const demoUnreadMessagesCount = 7;
