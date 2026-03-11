export type JobFunction = 'commercial' | 'supply-chain' | 'marketing' | 'finance' | 'operations' | 'hr' | 'other';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type InterestArea = 'visualization' | 'statistics' | 'ml' | 'data-engineering' | 'generative-agentic-ai';

export interface UserProfile {
  jobFunction: JobFunction | null;
  experienceLevel: ExperienceLevel | null;
  interests: InterestArea[];
  goals: string[];
  responses: string[];
  timeCommitment: number; // hours over 3 months
}

export interface SavedLearningPath {
  id: string;
  name: string;
  createdAt: Date;
  profile: UserProfile;
  recommendedPath: string;
}
