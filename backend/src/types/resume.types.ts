// src/types/resume.types.ts

export interface ParsedResumeMeta {
  schemaVersion: string;
  parsedAt: string;
  parserWarnings: string[];
}

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
  context?:
    | 'academic'
    | 'personal'
    | 'professional'
    | 'hackathon';
  rawText?: string;
}

export interface ResumeCertification {
  id: string;
  name?: string;
  issuer?: string;
  status?:
    | 'completed'
    | 'in-progress'
    | 'expired'
    | 'unknown';
  date?: string;
  description?: string;
  rawText?: string;
}

/**
 * Generic resume section.
 *
 * This allows us to preserve sections that are not part
 * of our standard resume structure.
 *
 * Examples:
 * - Awards
 * - Publications
 * - Volunteer Experience
 * - Research
 * - Languages
 * - Conferences
 * - Achievements
 */
export interface ResumeSection {
  id: string;

  /**
   * Original heading from the resume.
   *
   * Example:
   * "TECHNICAL SKILLS"
   * "CORE COMPETENCIES"
   * "AWARDS"
   */
  heading: string;

  /**
   * Optional normalized meaning.
   *
   * Example:
   * "Technical Skills" → "skills"
   * "Core Competencies" → "skills"
   * "Awards & Honors" → "awards"
   */
  normalizedType?: string;

  /**
   * Optional subheadings/categories.
   *
   * Example:
   * Frontend:
   *   React
   *   Redux
   *
   * Backend:
   *   Node.js
   *   Express
   */
  subsections?: ResumeSubsection[];

  content?: string;
  items?: string[];
  rawText?: string;
}

export interface ResumeSubsection {
  heading: string;
  items: string[];
  rawText?: string;
}

export interface FormatSignals {
  pageCount?: number;
  wordCount?: number;
  columnCount?: number;
  hasTables?: boolean;
  hasImages?: boolean;
  hasIcons?: boolean;
  hasHeaders?: boolean;
  hasFooters?: boolean;
  fontConsistency?: boolean;
  headingConsistency?: boolean;
  sectionOrder: string[];
}

export interface ResumeContent {
  contact: ResumeContact;
  summary?: string;
  skills: ResumeSkillCategory[];
  experience: ResumeExperience[];
  education: ResumeEducation[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];

  /**
   * Keeps sections that don't fit into the standard
   * resume structure.
   *
   * Examples:
   * - Awards
   * - Activities
   * - Publications
   * - Volunteer Experience
   * - Achievements
   */
  sections: ResumeSection[];
}

export interface ParsedResume {
  meta: ParsedResumeMeta;

  /**
   * Original extracted text from the PDF.
   */
  rawText: string;

  /**
   * Structured resume information.
   */
  content: ResumeContent;

  /**
   * Formatting and document-level signals.
   */
  formatting: FormatSignals;
}