import type {
  ResumeExperience,
} from '../types/resume.types';

import type {
  ResumeSuggestion,
} from '../types/resume-suggestion.types';

// --------------------------------------------------
// Experience Skill Analysis Types
// --------------------------------------------------

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
// Ollama Experience Skill Data
// --------------------------------------------------

export interface OllamaExperienceSkillData {

  id: string;

  demonstratedSkills: string[];
}

// --------------------------------------------------
// Get Demonstrated Skills From Ollama
// --------------------------------------------------

const getDemonstratedSkills = (
  experience: ResumeExperience,
  aiExperiences: OllamaExperienceSkillData[],
): string[] => {

  const aiExperience = aiExperiences.find(
    (item) => item.id === experience.id,
  );

  if (!aiExperience) {
    return [];
  }

  return aiExperience.demonstratedSkills.filter(
    (skill) =>
      typeof skill === 'string' &&
      skill.trim().length > 0,
  );
};

// --------------------------------------------------
// Analyze Experience ↔ Skills Alignment
// --------------------------------------------------

export const analyzeExperienceSkillAlignment = (
  experiences: ResumeExperience[],
  resumeSkills: string[],
  aiExperiences: OllamaExperienceSkillData[] = [],
): ExperienceSkillAnalysis => {

  // ------------------------------------------------
  // No experience
  // ------------------------------------------------

  if (experiences.length === 0) {

    return {

      experiences: [],

      overallAlignmentPercentage: 0,

      experienceOnlySkills: [],
    };
  }

  // ------------------------------------------------
  // Normalize resume skills
  // ------------------------------------------------

  const normalizedResumeSkills =
    new Map<string, string>();

  for (const skill of resumeSkills) {

    const normalized =
      normalizeSkill(skill);

    if (!normalized) {
      continue;
    }

    normalizedResumeSkills.set(
      normalized,
      skill.trim(),
    );
  }

  const analysis:
    ExperienceSkillAnalysisItem[] = [];

  const allExperienceOnlySkills =
    new Map<string, string>();

  // ------------------------------------------------
  // Analyze each experience
  // ------------------------------------------------

  for (const experience of experiences) {

    const experienceSkills =
      getDemonstratedSkills(
        experience,
        aiExperiences,
      );

    const matchedSkills: string[] = [];

    const experienceOnlySkills: string[] = [];

    for (const skill of experienceSkills) {

      const normalized =
        normalizeSkill(skill);

      if (!normalized) {
        continue;
      }

      const resumeSkill =
        normalizedResumeSkills.get(
          normalized,
        );

      if (resumeSkill !== undefined) {

        matchedSkills.push(
          resumeSkill,
        );

      } else {

        experienceOnlySkills.push(
          skill.trim(),
        );

        allExperienceOnlySkills.set(
          normalized,
          skill.trim(),
        );
      }
    }

    // ------------------------------------------------
    // Calculate experience alignment
    // ------------------------------------------------

    const totalSkills =
      experienceSkills.length;

    const alignmentPercentage =
      totalSkills === 0
        ? 0
        : Math.round(
            (matchedSkills.length /
              totalSkills) *
              100,
          );

    let alignmentStatus =
      'no_skills_detected';

    if (totalSkills > 0) {

      if (alignmentPercentage === 100) {

        alignmentStatus = 'strong';

      } else if (
        alignmentPercentage >= 70
      ) {

        alignmentStatus = 'good';

      } else if (
        alignmentPercentage >= 40
      ) {

        alignmentStatus = 'partial';

      } else {

        alignmentStatus = 'weak';
      }
    }

    analysis.push({

      experienceId:
        experience.id,

      experienceTitle:
        experience.title ??
        'Experience',

      matchedSkills,

      experienceOnlySkills,

      alignmentPercentage,

      alignmentStatus,
    });
  }

  // ------------------------------------------------
  // Calculate overall alignment
  // ------------------------------------------------

  const experiencesWithSkills =
    analysis.filter(
      (item) =>
        item.matchedSkills.length > 0 ||
        item.experienceOnlySkills.length >
          0,
    );

  const totalMatchedSkills =
    experiencesWithSkills.reduce(
      (total, experience) =>
        total +
        experience.matchedSkills.length,
      0,
    );

  const totalExperienceSkills =
    experiencesWithSkills.reduce(
      (total, experience) =>
        total +
        experience.matchedSkills.length +
        experience.experienceOnlySkills.length,
      0,
    );

  const overallAlignmentPercentage =
    totalExperienceSkills === 0
      ? 0
      : Math.round(
          (totalMatchedSkills /
            totalExperienceSkills) *
            100,
        );

  return {

    experiences: analysis,

    overallAlignmentPercentage,

    experienceOnlySkills: [
      ...allExperienceOnlySkills.values(),
    ],
  };
};

// --------------------------------------------------
// Generate Experience → Skills Suggestions
// --------------------------------------------------

export const generateExperienceSkillSuggestions = (
  analysis: ExperienceSkillAnalysis,
): ResumeSuggestion[] => {

  const suggestions:
    ResumeSuggestion[] = [];

  // ------------------------------------------------
  // No experience
  // ------------------------------------------------

  if (
    analysis.experiences.length === 0
  ) {

    return [];
  }

  // ------------------------------------------------
  // Generate suggestions for missing skills
  // ------------------------------------------------

  for (
    const experience of analysis.experiences
  ) {

    if (
      experience.experienceOnlySkills.length ===
      0
    ) {

      continue;
    }

    for (
      const skill of
        experience.experienceOnlySkills
    ) {

      suggestions.push({

        category: 'skills',

        priority: 'medium',

        title:
          'Add experience skill to Skills',

        message:
          `${skill} is demonstrated in your ` +
          `${experience.experienceTitle} experience but ` +
          `is not currently listed in your Technical Skills ` +
          `section. Add it if you are comfortable using this skill.`,
      });
    }
  }

  return suggestions;
};