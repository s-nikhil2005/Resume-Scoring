import type {
  ResumeContact,
  ResumeEducation,
  ResumeExperience,
  ResumeProject,
  ResumeSkillCategory,
  ResumeCertification,
} from '../types/resume.types';

import type {
  ResumeSectionScores,
} from '../types/resume-section-score.types';

import type {
  ResumeSuggestions,
} from '../types/resume-suggestion.types';

import type {
  LanguageAnalysisResult,
} from '../types/language-analysis.types';

import type {
  LanguageScoreResult,
} from './language-scoring.service';

import type {
  CertificationAnalysisResult,
} from '../types/certification.types';

import type {
  ExperienceSkillAnalysis,
} from './experience-suggestion.service';

import type {
  ProjectSkillAlignmentResult,
} from './project-skill-alignment.service';

import type {
  AnalyzeResumeResponse,
} from '../types/analyze-response.types';

// --------------------------------------------------
// Build Clean Analyze Response Input
// --------------------------------------------------

export interface BuildAnalyzeResumeResponseInput {

  // ------------------------------------------------
  // Main ATS Score
  // ------------------------------------------------

  atsScore: number;

  // ------------------------------------------------
  // Section Scores
  // ------------------------------------------------

  resumeSectionScores: ResumeSectionScores;

  // ------------------------------------------------
  // Resume Content
  // ------------------------------------------------

  parsedContact: ResumeContact;

  parsedSkills: ResumeSkillCategory[];

  parsedProjects: ResumeProject[];

  parsedEducation: ResumeEducation[];

  parsedExperience: ResumeExperience[];

  parsedCertifications: ResumeCertification[];

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

  resumeSuggestions: ResumeSuggestions;
}

// --------------------------------------------------
// Create Clean API Response
// --------------------------------------------------

export const buildAnalyzeResumeResponse = (
  data: BuildAnalyzeResumeResponseInput,
): AnalyzeResumeResponse => {

  return {

    // ------------------------------------------------
    // Main ATS Score
    // ------------------------------------------------

    atsScore:
      data.atsScore,

    // ------------------------------------------------
    // Individual Section Scores
    // ------------------------------------------------

    sectionScores:
      data.resumeSectionScores,

    // ------------------------------------------------
    // Resume Content
    // ------------------------------------------------

    contact:
      data.parsedContact,

    skills:
      data.parsedSkills,

    projects:
      data.parsedProjects,

    education:
      data.parsedEducation,

    experience:
      data.parsedExperience,

    certifications:
      data.parsedCertifications,

    // ------------------------------------------------
    // Relationship Analysis
    // ------------------------------------------------

    projectSkillAlignment:
      data.projectSkillAlignment,

    experienceSkillAlignment:
      data.experienceSkillAlignment,

    certificationAnalysis:
      data.certificationAnalysis,

    // ------------------------------------------------
    // Language Analysis
    // ------------------------------------------------

    languageAnalysis:
      data.languageAnalysis,

    languageScore:
      data.languageScore,

    // ------------------------------------------------
    // Suggestions
    // ------------------------------------------------

    suggestions:
      data.resumeSuggestions,
  };
};