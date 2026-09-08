// src/validations/ollama.validation.ts

import { z } from 'zod';

/**
 * --------------------------------------------------
 * SUMMARY
 * --------------------------------------------------
 */

const summaryResultSchema = z.object({
  type: z.literal('summary'),
  summary: z.string(),
});

/**
 * --------------------------------------------------
 * SKILLS
 * --------------------------------------------------
 */

const skillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

const skillsResultSchema = z.object({
  type: z.literal('skills'),
  skills: z.array(skillCategorySchema),
});

/**
 * --------------------------------------------------
 * EXPERIENCE
 * --------------------------------------------------
 */

const experienceSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  organization: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrent: z.boolean().optional(),
  employmentType: z
    .enum([
      'full-time',
      'internship',
      'contract',
      'freelance',
      'part-time',
    ])
    .optional(),
  bullets: z.array(z.string()),
});

const experienceResultSchema = z.object({
  type: z.literal('experience'),
  experience: z.array(experienceSchema),
});

/**
 * --------------------------------------------------
 * EDUCATION
 * --------------------------------------------------
 */

const educationSchema = z.object({
  id: z.string(),
  degree: z.string().optional(),
  institution: z.string().optional(),
  field: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
});

const educationResultSchema = z.object({
  type: z.literal('education'),
  education: z.array(educationSchema),
});

/**
 * --------------------------------------------------
 * PROJECTS
 * --------------------------------------------------
 */

const projectSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  bullets: z.array(z.string()),
  technologies: z.array(z.string()),
});

const projectsResultSchema = z.object({
  type: z.literal('projects'),
  projects: z.array(projectSchema),
});

/**
 * --------------------------------------------------
 * CERTIFICATIONS
 * --------------------------------------------------
 */

const certificationSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
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
  description: z.string().optional(),
});

const certificationsResultSchema = z.object({
  type: z.literal('certifications'),
  certifications: z.array(
    certificationSchema,
  ),
});

/**
 * --------------------------------------------------
 * CUSTOM SECTION
 * --------------------------------------------------
 */

const customSectionSchema = z.object({
  id: z.string(),
  heading: z.string(),
  normalizedType: z.string(),
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
});

const customResultSchema = z.object({
  type: z.literal('custom'),
  section: customSectionSchema,
});

/**
 * --------------------------------------------------
 * UNION
 * --------------------------------------------------
 *
 * Ollama can return exactly one of these
 * section result types.
 */

export const ollamaSectionResultSchema =
  z.discriminatedUnion('type', [
    summaryResultSchema,
    skillsResultSchema,
    experienceResultSchema,
    educationResultSchema,
    projectsResultSchema,
    certificationsResultSchema,
    customResultSchema,
  ]);

/**
 * TypeScript type generated automatically
 * from the Zod schema.
 */
export type OllamaSectionResult = z.infer<
  typeof ollamaSectionResultSchema
>;