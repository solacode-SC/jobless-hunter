export type RemoteStatus = 'remote' | 'hybrid' | 'onsite' | 'unknown';
export type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';
export type JobSource = 'linkedin' | 'indeed' | 'google_jobs' | 'facebook' | 'company_page' | 'remote_board' | 'other';
export type JobStatus = 'discovered' | 'evaluating' | 'qualified' | 'disqualified' | 'applied' | 'expired';

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string | null;
  location: string | null;
  remote_status: RemoteStatus;
  employment_type: EmploymentType | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  required_skills: string[] | null;
  experience_years_min: number | null;
  experience_years_max: number | null;
  source: JobSource;
  source_url: string | null;
  source_job_id: string | null;
  published_at: string | null;
  discovered_at: string;
  application_deadline: string | null;
  fingerprint: string;
  match_score: number | null;
  match_explanation: string | null;
  status: JobStatus;
  raw_data?: any;
}

export type ApplicationStatus =
  | 'discovered'
  | 'evaluating'
  | 'qualified'
  | 'awaiting_approval'
  | 'documents_ready'
  | 'applied'
  | 'interview'
  | 'assessment'
  | 'rejected'
  | 'offer'
  | 'withdrawn';

export interface Application {
  id: string;
  job_id: string;
  candidate_id: string;
  status: ApplicationStatus;
  cv_document_id: string | null;
  cover_letter_id: string | null;
  submitted_at: string | null;
  submission_method: string | null;
  application_url: string | null;
  recruiter_name: string | null;
  recruiter_email: string | null;
  follow_up_date: string | null;
  notes: string | null;
  history: Array<{ status?: string; from?: string; to?: string; timestamp: string; notes?: string }> | null;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  professional_title: string | null;
  phone: string | null;
  education: Array<{ institution: string; degree: string; year: string; highlights?: string }> | null;
  experience: Array<{ company: string; role: string; duration: string; description: string }> | null;
  skills: string[] | null;
  portfolio_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  original_cv_path: string | null;
  cv_data: any | null;
  preferences: any | null;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  type: 'cv' | 'cover_letter';
  language: 'en' | 'fr';
  job_id: string | null;
  candidate_id: string | null;
  content: string | null;
  file_path: string | null;
  version: number;
  is_approved: boolean;
  metadata_: any | null;
  created_at: string;
}

export interface OverviewMetrics {
  total_jobs: number;
  qualified_jobs: number;
  applications_submitted: number;
  pending_approvals: number;
  interview_invitations: number;
  average_match_score: number;
  conversion_rate: number;
}

export interface TrendPoint {
  date: string;
  jobs_discovered: number;
}

export interface SourceCount {
  source: string;
  count: number;
}

