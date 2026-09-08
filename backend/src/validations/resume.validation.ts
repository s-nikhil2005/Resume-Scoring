// src/validations/resume.validation.ts

import { z } from 'zod';

const resumeLinkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const resumeContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  title: z.string().optional(),

  links: z.array(resumeLinkSchema),
});

const resumeSkillCategorySchema = z.object({
  category: z.string(),
  items: z.array(z.string()),
});

const resumeExperienceSchema = z.object({
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

  rawText: z.string().optional(),
});

const resumeEducationSchema = z.object({
  id: z.string(),

  degree: z.string().optional(),

  institution: z.string().optional(),

  field: z.string().optional(),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  grade: z.string().optional(),

  rawText: z.string().optional(),
});

const resumeProjectSchema = z.object({
  id: z.string(),

  name: z.string().optional(),

  description: z.string().optional(),

  bullets: z.array(z.string()),

  technologies: z.array(z.string()),

  url: z.string().optional(),

  context: z
    .enum([
      'academic',
      'personal',
      'professional',
      'hackathon',
    ])
    .optional(),

  rawText: z.string().optional(),
});

const resumeCertificationSchema = z.object({
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

  rawText: z.string().optional(),
});

const resumeSubsectionSchema = z.object({
  heading: z.string(),

  items: z.array(z.string()),

  rawText: z.string().optional(),
});

const resumeSectionSchema = z.object({
  id: z.string(),

  heading: z.string(),

  normalizedType: z.string().optional(),

  subsections: z
    .array(resumeSubsectionSchema)
    .optional(),

  content: z.string().optional(),

  items: z.array(z.string()).optional(),

  rawText: z.string().optional(),
});

const formatSignalsSchema = z.object({
  pageCount: z.number().optional(),

  wordCount: z.number().optional(),

  columnCount: z.number().optional(),

  hasTables: z.boolean().optional(),

  hasImages: z.boolean().optional(),

  hasIcons: z.boolean().optional(),

  hasHeaders: z.boolean().optional(),

  hasFooters: z.boolean().optional(),

  fontConsistency: z.boolean().optional(),

  headingConsistency: z.boolean().optional(),

  sectionOrder: z.array(z.string()),
});

export const parsedResumeSchema = z.object({
  meta: z.object({
    schemaVersion: z.string(),

    parsedAt: z.string(),

    parserWarnings: z.array(z.string()),
  }),

  rawText: z.string(),

  content: z.object({
    contact: resumeContactSchema,

    summary: z.string().optional(),

    skills: z.array(resumeSkillCategorySchema),

    experience: z.array(resumeExperienceSchema),

    education: z.array(resumeEducationSchema),

    projects: z.array(resumeProjectSchema),

    certifications: z.array(
      resumeCertificationSchema,
    ),

    sections: z.array(resumeSectionSchema),
  }),

  formatting: formatSignalsSchema,
});

export type ParsedResumeInput = z.infer<
  typeof parsedResumeSchema
>;