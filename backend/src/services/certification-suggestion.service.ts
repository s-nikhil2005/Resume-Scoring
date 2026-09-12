import type {
  ResumeCertification,
} from '../types/resume.types';

import type {
  CertificationAnalysisResult,
} from '../types/certification.types';

import type {
  ResumeSuggestion,
} from '../types/resume-suggestion.types';

// --------------------------------------------------
// Normalize Skill
// --------------------------------------------------

const normalizeSkill = (
  skill: string,
): string => {
  return skill
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
};

// --------------------------------------------------
// Certification Suggestion Analysis
// --------------------------------------------------

export const generateCertificationSuggestions = (
  certifications: ResumeCertification[],
  certificationAnalysis: CertificationAnalysisResult,
  resumeSkills: string[],
): ResumeSuggestion[] => {
  // ------------------------------------------------
  // No certifications
  // ------------------------------------------------

  if (certifications.length === 0) {
    return [];
  }

  // ------------------------------------------------
  // Create normalized resume skill set
  // ------------------------------------------------

  const normalizedResumeSkills =
    new Set(
      resumeSkills
        .filter(
          (skill) =>
            skill.trim().length > 0,
        )
        .map(normalizeSkill),
    );

  const suggestions: ResumeSuggestion[] =
    [];

  // ------------------------------------------------
  // Compare certification demonstrated skills
  // with Technical Skills
  // ------------------------------------------------

  for (const certification of
    certificationAnalysis.certifications) {
    for (const skill of
      certification.demonstratedSkills) {
      const normalizedSkill =
        normalizeSkill(skill);

      if (
        normalizedSkill.length === 0
      ) {
        continue;
      }

      if (
        normalizedResumeSkills.has(
          normalizedSkill,
        )
      ) {
        continue;
      }

      suggestions.push({
        category: 'skills',
        priority: 'medium',
        title:
          'Add certification skill to Skills',
        message:
          `${skill} is demonstrated by your ${certification.name} certification but is not currently listed in your Technical Skills section. Add it if you are comfortable using this skill.`,
      });
    }
  }

  return suggestions;
};