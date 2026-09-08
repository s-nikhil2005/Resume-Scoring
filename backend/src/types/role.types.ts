// src/types/role.types.ts

export type ExperienceLevel =
  | 'fresher'
  | 'junior'
  | 'mid'
  | 'senior';

export interface RoleProjectExpectation {
  recommended: boolean;
  minimum?: number;
  maximum?: number;
}

export interface RoleExperienceExpectation {
  required: boolean;
  minimumYears?: number;
}

export interface RoleFormattingExpectation {
  recommendedPages?: {
    min?: number;
    max?: number;
  };

  singleColumnRecommended?: boolean;

  clearSectionHeadings?: boolean;

  consistentFormatting?: boolean;

  readableText?: boolean;
}

export interface RoleProfile {
  roleTitle: string;

  experienceLevel: ExperienceLevel;

  recommendedSkills: string[];

  importantSections: string[];

  recommendedSections: string[];

  optionalSections: string[];

  projectExpectation: RoleProjectExpectation;

  experienceExpectation: RoleExperienceExpectation;

  formattingExpectations: RoleFormattingExpectation;
}