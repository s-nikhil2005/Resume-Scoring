// src/validations/ollama.validation.ts

import { z } from 'zod';

/**
 * --------------------------------------------------
 * PROJECT ANALYSIS
 * --------------------------------------------------
 */

const projectAnalysisSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()),
  demonstratedSkills: z.array(z.string()),
  relevanceToDevelopment: z.string(),
});

/**
 * --------------------------------------------------
 * CERTIFICATION ANALYSIS
 * --------------------------------------------------
 */

const certificationAnalysisSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string().optional(),
  status: z
    .enum([
      'completed',
      'in-progress',
      'expired',
      'unknown',
    ])
    .optional(),
  date: z.string().optional(),
  domain: z.string(),
  supportedSkills: z.array(z.string()),
});

/**
 * --------------------------------------------------
 * EXPERIENCE ANALYSIS
 * --------------------------------------------------
 */

const experienceAnalysisSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string().optional(),

  // Employment type can vary between resumes.
  // Ollama may return values such as:
  // full-time, internship, freelance, etc.
  // We will normalize this later in TypeScript.
  employmentType: z.string().optional(),

  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),

  domain: z.string(),

  demonstratedSkills: z.array(z.string()),
});

/**
 * --------------------------------------------------
 * PROFILE ANALYSIS
 * --------------------------------------------------
 */

const profileAnalysisSchema = z.object({
  summary: z.string(),
  mentionedRoles: z.array(z.string()),
  mentionedSkills: z.array(z.string()),
  strengths: z.array(z.string()),
  issues: z.array(z.string()),
});

/**
 * --------------------------------------------------
 * COMPLETE OLLAMA ANALYSIS
 * --------------------------------------------------
 */

export const ollamaAnalysisSchema = z.object({
  projects: z.array(projectAnalysisSchema),

  certifications: z.array(
    certificationAnalysisSchema,
  ),

  experience: z.array(
    experienceAnalysisSchema,
  ),

  profile: profileAnalysisSchema,
});

/**
 * --------------------------------------------------
 * TYPES
 * --------------------------------------------------
 */

export type OllamaAnalysis = z.infer<
  typeof ollamaAnalysisSchema
>;