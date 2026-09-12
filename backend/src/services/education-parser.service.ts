// src/services/education-parser.service.ts

import type { ResumeEducation } from '../types/resume.types';

const EDUCATION_PATTERNS: RegExp[] = [
  /\bBachelor\b/i,
  /\bMaster\b/i,
  /\bB\.?S\.?c\b/i,
  /\bB\.?Tech\b/i,
  /\bB\.?E\b/i,
  /\bM\.?S\.?c\b/i,
  /\bM\.?Tech\b/i,
  /\bM\.?E\b/i,
  /\bMCA\b/i,
  /\bBCA\b/i,
  /\bMBA\b/i,
  /\bBBA\b/i,
  /\bDiploma\b/i,
  /\bPh\.?D\b/i,
  /\bHigher Secondary Certificate\b/i,
  /\bHSC\b/i,
  /\bSecondary School Certificate\b/i,
  /\bSSC\b/i,
];

const isEducationEntry = (
  line: string,
): boolean => {
  return EDUCATION_PATTERNS.some((pattern) =>
    pattern.test(line),
  );
};

const extractYears = (
  line: string,
): string[] => {
  return (
    line.match(
      /\b(?:19|20)\d{2}\b/g,
    ) ?? []
  );
};

const extractGrade = (
  line: string,
): string | undefined => {
  const match = line.match(
    /(?:CGPA|GPA|Percentage|Percent|Score|Grade)\s*[:-]?\s*([A-Za-z0-9.%]+)/i,
  );

  return match?.[1];
};

const extractDegree = (
  line: string,
): string => {
  const pipeIndex = line.indexOf('|');

  const degreePart =
    pipeIndex >= 0
      ? line.slice(0, pipeIndex).trim()
      : line.trim();

  return degreePart
    .replace(
      /\s+(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:19|20)\d{2}\s*$/i,
      '',
    )
    .trim();
};

const extractField = (
  degree: string,
): string | undefined => {
  const match = degree.match(
    /\bin\s+(.+)$/i,
  );

  return match?.[1]?.trim();
};

const extractInstitution = (
  line: string,
): string | undefined => {
  const pipeIndex = line.indexOf('|');

  if (pipeIndex < 0) {
    return undefined;
  }

  const institutionPart = line
    .slice(pipeIndex + 1)
    .trim();

  const institution = institutionPart
    .replace(
      /\b(?:19|20)\d{2}\s*(?:-|–|—|to)\s*(?:19|20)\d{2}\b/i,
      '',
    )
    .trim();

  return institution || undefined;
};

export const parseEducationSection = (
  content: string,
): ResumeEducation[] => {
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return [];
  }

  const education: ResumeEducation[] = [];

  let currentEducation:
    | ResumeEducation
    | null = null;

  const saveCurrentEducation = () => {
    if (!currentEducation) {
      return;
    }

    education.push(currentEducation);
    currentEducation = null;
  };

  for (const line of lines) {
    /*
     * --------------------------------------------------
     * Detect a new education entry
     * --------------------------------------------------
     *
     * Examples:
     *
     * Bachelor of Science (B.Sc.) in Information Technology
     * Higher Secondary Certificate (HSC)
     * B.Tech Computer Science
     * M.Sc. Computer Science
     */

    if (isEducationEntry(line)) {
      saveCurrentEducation();

      const degree = extractDegree(line);
      const field = extractField(degree);
      const institution =
        extractInstitution(line);

      const years = extractYears(line);

      const startDate = years[0];
      const endDate = years[1];

      currentEducation = {
        id: `education-${education.length + 1}`,
        degree,
        ...(field ? { field } : {}),
        ...(institution
          ? { institution }
          : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
        rawText: line,
      };

      continue;
    }

    /*
     * --------------------------------------------------
     * Ignore anything before the first education entry
     * --------------------------------------------------
     */

    if (!currentEducation) {
      continue;
    }

    /*
     * --------------------------------------------------
     * Detect CGPA / GPA / Percentage / Grade
     * --------------------------------------------------
     */

    const grade = extractGrade(line);

    if (grade) {
      currentEducation.grade = grade;

      currentEducation.rawText +=
        `\n${line}`;

      continue;
    }

    /*
     * --------------------------------------------------
     * Detect dates on a separate line
     * --------------------------------------------------
     *
     * Example:
     * 2023 - 2026
     */

    const years = extractYears(line);

    if (years.length >= 2) {
      const startDate = years[0];
      const endDate = years[1];

      if (startDate && endDate) {
        currentEducation.startDate =
          startDate;

        currentEducation.endDate =
          endDate;
      }

      currentEducation.rawText +=
        `\n${line}`;

      continue;
    }

    /*
     * --------------------------------------------------
     * Detect a single year
     * --------------------------------------------------
     */

    const singleYear = years[0];

    if (singleYear) {
      currentEducation.endDate =
        singleYear;

      currentEducation.rawText +=
        `\n${line}`;

      continue;
    }

    /*
     * --------------------------------------------------
     * Supporting information
     * --------------------------------------------------
     *
     * If the institution wasn't found from "|",
     * use the first unknown line as institution.
     *
     * If institution already exists, don't overwrite it.
     */

    if (!currentEducation.institution) {
      currentEducation.institution =
        line;
    }

    currentEducation.rawText +=
      `\n${line}`;
  }

  saveCurrentEducation();

  return education;
};