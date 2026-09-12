// src/services/experience-parser.service.ts

import type { ResumeExperience } from '../types/resume.types';

/**
 * Patterns used to identify lines that are likely
 * to represent an experience entry.
 *
 * This parser intentionally supports different
 * kinds of professional experience:
 *
 * - Software Developer
 * - Backend Developer
 * - Frontend Developer
 * - Full Stack Developer
 * - Intern
 * - Software Engineer
 * - Trainee
 * - Associate
 * - Apprenticeship
 * - etc.
 *
 * It does NOT assume that every resume is a
 * developer resume.
 */

const EXPERIENCE_TITLE_PATTERNS: RegExp[] = [
  /\bdeveloper\b/i,
  /\bengineer\b/i,
  /\bdesigner\b/i,
  /\banalyst\b/i,
  /\bconsultant\b/i,
  /\bmanager\b/i,
  /\bassociate\b/i,
  /\bexecutive\b/i,
  /\bspecialist\b/i,
  /\badministrator\b/i,
  /\barchitect\b/i,
  /\bintern\b/i,
  /\btrainee\b/i,
  /\bapprentice\b/i,
  /\btechnician\b/i,
  /\bscientist\b/i,
  /\bcoordinator\b/i,
  /\btester\b/i,
  /\bqa\b/i,
  /\bquality assurance\b/i,
  /\bdevops\b/i,
  /\bsoftware\b/i,
];

/**
 * Words that strongly indicate an experience section
 * contains employment/professional experience.
 */
const EMPLOYMENT_CONTEXT_PATTERNS: RegExp[] = [
  /\bfull[-\s]?time\b/i,
  /\bpart[-\s]?time\b/i,
  /\binternship\b/i,
  /\bintern\b/i,
  /\bemployment\b/i,
  /\bprofessional experience\b/i,
  /\bwork experience\b/i,
  /\bworking experience\b/i,
  /\bapprenticeship\b/i,
  /\bcontract\b/i,
  /\bfreelance\b/i,
];

/**
 * Date patterns.
 *
 * Supports examples such as:
 *
 * 2024 - 2025
 * 2024 – 2025
 * Jan 2024 - Dec 2025
 * January 2024 - Present
 * 2024 - Present
 * 06/2024 - 08/2025
 */
const DATE_RANGE_PATTERN =
  /((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,]+\d{4}|\d{1,2}[/-]\d{4}|\d{4})\s*(?:-|–|—|to)\s*((?:Present|Current|Now)|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,]+\d{4}|\d{1,2}[/-]\d{4}|\d{4})/i;

/**
 * A single-year/date pattern.
 */
const SINGLE_DATE_PATTERN =
  /\b(?:19|20)\d{2}\b/;

/**
 * Determines whether a line looks like a bullet.
 */
const isBullet = (line: string): boolean => {
  return /^[-•●▪◦*]\s*/.test(line);
};

/**
 * Removes the bullet marker from a line.
 */
const cleanBullet = (line: string): string => {
  return line
    .replace(/^[-•●▪◦*]\s*/, '')
    .trim();
};

/**
 * Determines whether a line contains a date range.
 */
const hasDateRange = (line: string): boolean => {
  return DATE_RANGE_PATTERN.test(line);
};

/**
 * Extracts the date range from a line.
 */
const extractDateRange = (
  line: string,
): {
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
} => {
  const match = line.match(DATE_RANGE_PATTERN);

  if (!match) {
    return {};
  }

  const startDate = match[1]?.trim();
  const endDate = match[2]?.trim();

  if (!startDate || !endDate) {
    return {};
  }

  const current =
    /^(present|current|now)$/i.test(
      endDate,
    );

  return {
    startDate,
    endDate,
    isCurrent: current,
  };
};

/**
 * Determines whether a line looks like a professional
 * experience title.
 */
const looksLikeExperienceTitle = (
  line: string,
): boolean => {
  if (!line || isBullet(line)) {
    return false;
  }

  /**
   * Very long lines are usually descriptions,
   * not job titles.
   */
  if (line.length > 150) {
    return false;
  }

  return EXPERIENCE_TITLE_PATTERNS.some(
    (pattern) => pattern.test(line),
  );
};

/**
 * Determines whether a line provides employment
 * context.
 */
const hasEmploymentContext = (
  line: string,
): boolean => {
  return EMPLOYMENT_CONTEXT_PATTERNS.some(
    (pattern) => pattern.test(line),
  );
};

/**
 * Extracts an organization from a common format:
 *
 * Software Developer | ABC Technologies
 *
 * or:
 *
 * Software Developer - ABC Technologies
 *
 * We keep this intentionally conservative.
 */
const extractOrganization = (
  line: string,
): string | undefined => {
  if (line.includes('|')) {
    const parts = line
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length >= 2) {
      const organization = parts[1];

      if (
        organization &&
        !DATE_RANGE_PATTERN.test(
          organization,
        )
      ) {
        return organization;
      }
    }
  }

  /**
   * Handle:
   *
   * Software Developer - ABC Technologies
   *
   * Avoid treating a date range as the organization.
   */
  const separatorMatch = line.match(
    /^(.+?)\s+(?:-|–|—)\s+(.+)$/,
  );

  if (separatorMatch) {
    const possibleOrganization =
      separatorMatch[2]?.trim();

    if (
      possibleOrganization &&
      !DATE_RANGE_PATTERN.test(
        possibleOrganization,
      ) &&
      !SINGLE_DATE_PATTERN.test(
        possibleOrganization,
      )
    ) {
      return possibleOrganization;
    }
  }

  return undefined;
};

/**
 * Removes the organization and date information
 * from a title line when possible.
 */
const extractTitle = (
  line: string,
): string => {
  let title = line.trim();

  /**
   * Remove date range.
   */
  title = title
    .replace(DATE_RANGE_PATTERN, '')
    .trim();

  /**
   * If pipe notation exists:
   *
   * Software Developer | ABC
   *
   * keep only the title.
   */
  if (title.includes('|')) {
    title =
      title.split('|')[0]?.trim() ??
      title;
  }

  /**
   * If the original line used a separator:
   *
   * Software Developer - ABC
   *
   * don't blindly remove every hyphen because
   * some legitimate titles contain hyphens.
   *
   * Only remove the separator when the remaining
   * left side looks like a job title.
   */
  const separatorMatch = title.match(
    /^(.+?)\s+(?:-|–|—)\s+(.+)$/,
  );

  if (
    separatorMatch &&
    looksLikeExperienceTitle(
      separatorMatch[1]?.trim() ?? '',
    )
  ) {
    title =
      separatorMatch[1]?.trim() ??
      title;
  }

  return title.trim();
};

/**
 * Attempts to extract a location from a line
 * containing common location separators.
 *
 * Example:
 *
 * Mumbai, India
 * Thane, Maharashtra
 */
const looksLikeLocation = (
  line: string,
): boolean => {
  if (!line || isBullet(line)) {
    return false;
  }

  if (line.length > 80) {
    return false;
  }

  return (
    /,\s*[A-Za-z]/.test(line) &&
    !hasDateRange(line) &&
    !looksLikeExperienceTitle(line)
  );
};

/**
 * Parses a complete experience section.
 *
 * IMPORTANT:
 *
 * If the section is absent or empty, this returns [].
 *
 * Activities are NOT parsed here.
 * They should remain separate from employment experience.
 */
export const parseExperienceSection = (
  content: string,
): ResumeExperience[] => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  /**
   * No Experience section content.
   *
   * This is a valid result for a fresher.
   */
  if (lines.length === 0) {
    return [];
  }

  const experiences: ResumeExperience[] = [];

  let currentExperience:
    | ResumeExperience
    | null = null;

  /**
   * Saves the current experience entry.
   */
  const saveCurrentExperience = () => {
    if (!currentExperience) {
      return;
    }

    /**
     * Remove duplicate bullets.
     */
    currentExperience.bullets = [
      ...new Set(
        currentExperience.bullets
          .map((bullet) => bullet.trim())
          .filter(Boolean),
      ),
    ];

    experiences.push(currentExperience);

    currentExperience = null;
  };

  for (const line of lines) {
    /**
     * --------------------------------------------------
     * Case 1: A line looks like a job title.
     * --------------------------------------------------
     */
    if (
      looksLikeExperienceTitle(line)
    ) {
      saveCurrentExperience();

      const dates =
        extractDateRange(line);

      const organization =
        extractOrganization(line);

      const title =
        extractTitle(line);

      currentExperience = {
        id: `experience-${
          experiences.length + 1
        }`,

        ...(title ? { title } : {}),

        ...(organization
          ? { organization }
          : {}),

        ...(dates.startDate
          ? {
              startDate:
                dates.startDate,
            }
          : {}),

        ...(dates.endDate
          ? {
              endDate:
                dates.endDate,
            }
          : {}),

        ...(dates.isCurrent !== undefined
          ? {
              isCurrent:
                dates.isCurrent,
            }
          : {}),

        bullets: [],

        rawText: line,
      };

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 2: A line contains employment context.
     * --------------------------------------------------
     *
     * Example:
     *
     * Internship | ABC Technologies | 2025
     *
     * If we don't already have an experience entry,
     * create one.
     */
    if (
      hasEmploymentContext(line) &&
      !currentExperience
    ) {
      const dates =
        extractDateRange(line);

      const organization =
        extractOrganization(line);

      const title =
        extractTitle(line);

      currentExperience = {
        id: `experience-${
          experiences.length + 1
        }`,

        ...(title ? { title } : {}),

        ...(organization
          ? { organization }
          : {}),

        ...(dates.startDate
          ? {
              startDate:
                dates.startDate,
            }
          : {}),

        ...(dates.endDate
          ? {
              endDate:
                dates.endDate,
            }
          : {}),

        ...(dates.isCurrent !== undefined
          ? {
              isCurrent:
                dates.isCurrent,
            }
          : {}),

        bullets: [],

        rawText: line,
      };

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 3: Bullet belonging to current experience.
     * --------------------------------------------------
     */
    if (
      isBullet(line) &&
      currentExperience
    ) {
      const bullet = cleanBullet(line);

      if (bullet) {
        currentExperience.bullets.push(
          bullet,
        );

        currentExperience.rawText +=
          `\n${bullet}`;
      }

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 4: Date range belonging to current
     * experience.
     * --------------------------------------------------
     */
    if (
      currentExperience &&
      hasDateRange(line)
    ) {
      const dates =
        extractDateRange(line);

      if (dates.startDate) {
        currentExperience.startDate =
          dates.startDate;
      }

      if (dates.endDate) {
        currentExperience.endDate =
          dates.endDate;
      }

      if (dates.isCurrent !== undefined) {
        currentExperience.isCurrent =
          dates.isCurrent;
      }

      currentExperience.rawText +=
        `\n${line}`;

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 5: Possible location.
     * --------------------------------------------------
     */
    if (
      currentExperience &&
      !currentExperience.location &&
      looksLikeLocation(line)
    ) {
      currentExperience.location =
        line;

      currentExperience.rawText +=
        `\n${line}`;

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 6: Additional organization information.
     * --------------------------------------------------
     *
     * If the organization hasn't been detected yet,
     * use a short non-bullet line.
     */
    if (
      currentExperience &&
      !currentExperience.organization &&
      !isBullet(line) &&
      !hasDateRange(line) &&
      line.length <= 100
    ) {
      currentExperience.organization =
        line;

      currentExperience.rawText +=
        `\n${line}`;

      continue;
    }

    /**
     * --------------------------------------------------
     * Case 7: Continuation of experience content.
     * --------------------------------------------------
     *
     * Some PDFs lose bullet markers during extraction.
     *
     * We keep the text instead of throwing it away.
     */
    if (currentExperience) {
      currentExperience.bullets.push(
        line,
      );

      currentExperience.rawText +=
        `\n${line}`;
    }
  }

  /**
   * Save final experience.
   */
  saveCurrentExperience();

  return experiences;
};