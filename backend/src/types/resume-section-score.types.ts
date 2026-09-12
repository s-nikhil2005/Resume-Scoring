export interface ResumeSectionScore {
  score: number;
  applicable: boolean;
  reason?: string;
}

export interface ResumeSectionScores {
  structure: ResumeSectionScore;
  contact: ResumeSectionScore;
  skills: ResumeSectionScore;
  projects: ResumeSectionScore;
  education: ResumeSectionScore;
  experience: ResumeSectionScore;
  certifications: ResumeSectionScore;
  language: ResumeSectionScore;
}

export interface ResumeScoreSummary {
  sectionScores: ResumeSectionScores;
  averageScore: number;
  scoredSectionCount: number;
}