export interface ResumeLink {
  label: string;
  url: string;
}

export interface ResumeContact {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  links: ResumeLink[];
}

export interface ResumeSkillCategory {
  category: string;
  items: string[];
}

export interface ResumeExperience {
  id: string;
  title?: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  employmentType?: string;
  bullets: string[];
  rawText?: string;
}

export interface ResumeEducation {
  id: string;
  degree?: string;
  institution?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  rawText?: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description?: string;
  bullets: string[];
  technologies: string[];
  url?: string;
  context?: 'academic' | 'personal' | 'professional' | 'hackathon';
  rawText?: string;
}

export interface ResumeCertification {
  id: string;
  name?: string;
  issuer?: string;
  status?: 'completed' | 'in-progress' | 'expired' | 'unknown';
  date?: string;
  description?: string;
  rawText?: string;
}

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

export interface ProjectSkillAlignment {
  projectId: string;
  projectName: string;
  matchedSkills: string[];
  projectOnlySkills: string[];
  alignmentPercentage: number;
  alignmentStatus: 'strong' | 'moderate' | 'weak' | 'none';
}

export interface ProjectSkillAlignmentResult {
  projects: ProjectSkillAlignment[];
  overallAlignmentPercentage: number;
  projectOnlySkills: string[];
}

export interface ExperienceSkillAnalysisItem {
  experienceId: string;
  experienceTitle: string;
  matchedSkills: string[];
  experienceOnlySkills: string[];
  alignmentPercentage: number;
  alignmentStatus: string;
}

export interface ExperienceSkillAnalysis {
  experiences: ExperienceSkillAnalysisItem[];
  overallAlignmentPercentage: number;
  experienceOnlySkills: string[];
}

export interface AnalyzedCertification {
  id: string;
  name?: string;
  issuer?: string;
  date?: string;
  status?: 'completed' | 'in-progress' | 'expired' | 'unknown';
  demonstratedSkills: string[];
  matchedResumeSkills: string[];
  additionalSkills: string[];
  roleRelevanceScore: number;
  impact: 'high' | 'medium' | 'low' | 'neutral';
  explanation: string;
}

export interface CertificationAnalysisResult {
  analyzed: boolean;
  certifications: AnalyzedCertification[];
  overallImpact: 'positive' | 'neutral' | 'not_applicable';
  skipReason?: string;
}

export interface LanguageIssueReplacement {
  value: string;
}

export type LanguageIssueType =
  | 'grammar'
  | 'spelling'
  | 'style'
  | 'typographical'
  | 'other';

export interface LanguageIssue {
  message: string;
  shortMessage: string;
  issueType: LanguageIssueType;
  offset: number;
  length: number;
  context: string;
  sentence: string;
  replacements: LanguageIssueReplacement[];
  ruleId?: string;
  ruleDescription?: string;
  category?: string;
}

export interface LanguageStatistics {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
}

export interface LanguageAnalysisResult {
  analyzed: boolean;
  language: string;
  languageCode: string;
  confidence?: number;
  statistics: LanguageStatistics;
  issues: LanguageIssue[];
  grammarIssueCount: number;
  spellingIssueCount: number;
  styleIssueCount: number;
  otherIssueCount: number;
}

export interface LanguageScoreResult {
  score: number;
  grammarPenalty: number;
  spellingPenalty: number;
  stylePenalty: number;
  otherPenalty: number;
}

export type ResumeSuggestionCategory =
  | 'structure'
  | 'contact'
  | 'skills'
  | 'projects'
  | 'language'
  | 'education'
  | 'experience'
  | 'certifications';

export type ResumeSuggestionPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low';

export interface ResumeSuggestion {
  category: ResumeSuggestionCategory;
  priority: ResumeSuggestionPriority;
  title: string;
  message: string;
}

export interface ResumeSuggestions {
  suggestions: ResumeSuggestion[];
}

export interface AnalyzeResumeResponse {
  atsScore: number;
  sectionScores: ResumeSectionScores;
  contact: ResumeContact;
  skills: ResumeSkillCategory[];
  projects: ResumeProject[];
  education: ResumeEducation[];
  experience: ResumeExperience[];
  certifications: ResumeCertification[];
  projectSkillAlignment: ProjectSkillAlignmentResult;
  experienceSkillAlignment: ExperienceSkillAnalysis;
  certificationAnalysis: CertificationAnalysisResult;
  languageAnalysis: LanguageAnalysisResult;
  languageScore: LanguageScoreResult;
  suggestions: ResumeSuggestions;
}
