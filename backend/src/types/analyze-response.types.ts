import type {
  ResumeContact,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeSkillCategory,
  ResumeCertification,
} from './resume.types';

import type {
  ResumeSectionScores,
} from './resume-section-score.types';

import type {
  ResumeSuggestions,
} from './resume-suggestion.types';

import type {
  LanguageAnalysisResult,
} from './language-analysis.types';

import type {
  LanguageScoreResult,
} from '../services/language-scoring.service';

import type {
  CertificationAnalysisResult,
} from './certification.types';

import type {
  ExperienceSkillAnalysis,
} from '../services/experience-suggestion.service';

import type {
  ProjectSkillAlignmentResult,
} from '../services/project-skill-alignment.service';

// --------------------------------------------------
// Clean Analyze Response
// --------------------------------------------------

export interface AnalyzeResumeResponse {

  // ------------------------------------------------
  // Main ATS Score
  // ------------------------------------------------

  atsScore: number;

  // ------------------------------------------------
  // Individual Section Scores
  // ------------------------------------------------

  sectionScores: ResumeSectionScores;

  // ------------------------------------------------
  // Resume Content
  // ------------------------------------------------

  contact: ResumeContact;

  skills: ResumeSkillCategory[];

  projects: ResumeProject[];

  education: ResumeEducation[];

  experience: ResumeExperience[];

  certifications: ResumeCertification[];

  // ------------------------------------------------
  // Relationship Analysis
  // ------------------------------------------------

  projectSkillAlignment: ProjectSkillAlignmentResult;

  experienceSkillAlignment: ExperienceSkillAnalysis;

  certificationAnalysis: CertificationAnalysisResult;

  // ------------------------------------------------
  // Language Analysis
  // ------------------------------------------------

  languageAnalysis: LanguageAnalysisResult;

  languageScore: LanguageScoreResult;

  // ------------------------------------------------
  // Suggestions
  // ------------------------------------------------

  suggestions: ResumeSuggestions;
}