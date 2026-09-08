// src/services/section-detector.service.ts

export type ResumeSectionType =
  | 'summary'
  | 'skills'
  | 'experience'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'custom';

export interface DetectedResumeSection {
  heading: string;
  normalizedType: ResumeSectionType;
  content: string;
  detectionMethod: 'known-heading' | 'unknown';
}

/**
 * Normalize a heading so that small formatting
 * differences do not affect section detection.
 *
 * Example:
 *
 * "Technical Skills:" -> "technical skills"
 * "Professional-Summary" -> "professional summary"
 */
const normalizeHeading = (
  heading: string,
): string => {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Known resume section names.
 *
 * The original heading is preserved.
 * This map only gives our application a
 * standard internal meaning.
 */
const sectionHeadingMap: Record<
  string,
  ResumeSectionType
> = {
  // --------------------------------
  // Summary
  // --------------------------------

  summary: 'summary',
  profile: 'summary',
  'professional summary': 'summary',
  objective: 'summary',
  'career objective': 'summary',
  'about me': 'summary',

  // --------------------------------
  // Skills
  // --------------------------------

  skills: 'skills',
  'technical skills': 'skills',
  'core skills': 'skills',
  'key skills': 'skills',
  'technical competencies': 'skills',
  competencies: 'skills',

  // --------------------------------
  // Experience
  // --------------------------------

  experience: 'experience',
  'work experience': 'experience',
  'professional experience': 'experience',
  employment: 'experience',
  'work history': 'experience',
  'career history': 'experience',

  // --------------------------------
  // Education
  // --------------------------------

  education: 'education',
  'educational background': 'education',
  'academic background': 'education',
  academics: 'education',

  // --------------------------------
  // Projects
  // --------------------------------

  projects: 'projects',
  'personal projects': 'projects',
  'academic projects': 'projects',
  'key projects': 'projects',
  'selected projects': 'projects',

  // --------------------------------
  // Certifications
  // --------------------------------

  certification: 'certifications',
  certifications: 'certifications',
  'professional certifications':
    'certifications',
};

/**
 * Determine the normalized type of a section.
 *
 * Known heading:
 *
 * PROJECTS -> projects
 *
 * Unknown heading:
 *
 * MY JOURNEY -> custom
 *
 * Unknown sections are preserved instead
 * of being discarded.
 */
const getSectionType = (
  heading: string,
): {
  type: ResumeSectionType;
  detectionMethod: 'known-heading' | 'unknown';
} => {
  const normalizedHeading =
    normalizeHeading(heading);

  const knownType =
    sectionHeadingMap[normalizedHeading];

  if (knownType) {
    return {
      type: knownType,
      detectionMethod: 'known-heading',
    };
  }

  return {
    type: 'custom',
    detectionMethod: 'unknown',
  };
};

/**
 * Checks whether a line looks like a
 * key-value/data line rather than a section heading.
 *
 * Examples:
 *
 * CGPA: 8.70
 * Languages: JavaScript, Python
 * Frontend: React.js
 * Location: Mumbai, India
 *
 * These should NOT become sections.
 */
const looksLikeKeyValueLine = (
  line: string,
): boolean => {
  const trimmed = line.trim();

  const colonIndex = trimmed.indexOf(':');

  if (colonIndex === -1) {
    return false;
  }

  /**
   * If there is content after the colon,
   * this is most likely a key-value line.
   */
  const valueAfterColon =
    trimmed.slice(colonIndex + 1).trim();

  return valueAfterColon.length > 0;
};

/**
 * Checks whether a line is likely to be
 * a resume section heading.
 *
 * The detector uses:
 *
 * 1. Known section headings
 * 2. Uppercase formatting
 * 3. Protection against key-value lines
 */
const isLikelySectionHeading = (
  line: string,
): boolean => {
  const trimmed = line.trim();

  // Empty line cannot be a heading.
  if (!trimmed) {
    return false;
  }

  // Very long lines are unlikely to be headings.
  if (trimmed.length > 60) {
    return false;
  }

  const normalizedHeading =
    normalizeHeading(trimmed);

  /**
   * Known headings have priority.
   *
   * This means if we explicitly know a heading,
   * we recognize it even if formatting is unusual.
   */
  if (sectionHeadingMap[normalizedHeading]) {
    return true;
  }

  /**
   * Do not treat key-value lines as headings.
   *
   * Examples:
   *
   * CGPA: 8.70
   * Languages: JavaScript
   * Frontend: React.js
   */
  if (looksLikeKeyValueLine(trimmed)) {
    return false;
  }

  /**
   * Detect uppercase custom headings.
   *
   * Examples:
   *
   * ACTIVITIES
   * RESEARCH
   * PUBLICATIONS
   * AWARDS
   *
   * These will become "custom" if they are
   * not present in our known heading map.
   */
  if (
    trimmed.length >= 3 &&
    trimmed === trimmed.toUpperCase()
  ) {
    return true;
  }

  return false;
};

/**
 * Detect major sections in a cleaned resume.
 *
 * The detector's primary responsibility is
 * finding section boundaries.
 *
 * It does NOT try to understand the semantic
 * meaning of every possible heading.
 *
 * Unknown sections are preserved as "custom".
 */
export const detectResumeSections = (
  cleanText: string,
): DetectedResumeSection[] => {
  const lines = cleanText.split('\n');

  const sections: DetectedResumeSection[] =
    [];

  let currentSection:
    | DetectedResumeSection
    | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Ignore empty lines.
    if (!trimmedLine) {
      continue;
    }

    /**
     * Check whether this line starts
     * a new section.
     */
    if (
      isLikelySectionHeading(trimmedLine)
    ) {
      /**
       * Save the previous section before
       * starting the new section.
       */
      if (currentSection) {
        currentSection.content =
          currentSection.content.trim();

        sections.push(currentSection);
      }

      /**
       * Determine whether the heading is
       * known or unknown.
       */
      const sectionInfo =
        getSectionType(trimmedLine);

      /**
       * Start the new section.
       */
      currentSection = {
        heading: trimmedLine,
        normalizedType: sectionInfo.type,
        content: '',
        detectionMethod:
          sectionInfo.detectionMethod,
      };

      continue;
    }

    /**
     * Normal resume content belongs
     * to the current section.
     */
    if (currentSection) {
      currentSection.content +=
        `${trimmedLine}\n`;
    }
  }

  /**
   * Save the final section.
   */
  if (currentSection) {
    currentSection.content =
      currentSection.content.trim();

    sections.push(currentSection);
  }

  return sections;
};