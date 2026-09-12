import { randomUUID } from 'node:crypto';

import type { ResumeCertification } from '../types/resume.types';
import type { CertificationStatus } from '../types/certification.types';

/**
 * Deterministic certification parser.
 *
 * Responsibilities:
 * - Extract certifications from a certification section.
 * - Support multiple certification entries.
 * - Extract name, issuer, date, status and description when present.
 * - Avoid inventing missing information.
 * - Avoid treating pure achievements as certifications.
 *
 * Semantic interpretation of certification skills/relevance is handled later
 * by certification-analysis.service.ts.
 */

/**
 * Words/phrases that strongly suggest certification-related content.
 */
const CERTIFICATION_HINTS = [
  'certified',
  'certificate',
  'certification',
  'professional certificate',
  'professional certification',
  'associate',
  'practitioner',
  'specialist',
  'administrator',
  'foundation',
  'fundamentals',
  'license',
  'licensed',
  'accreditation',
];

/**
 * Words/phrases that commonly indicate achievements rather than certifications.
 *
 * These are only used to avoid obvious false positives.
 * They are NOT used to identify skills.
 */
const ACHIEVEMENT_HINTS = [
  'hacktoberfest',
  'hackathon',
  'codeathon',
  'winner',
  'winning',
  'award',
  'achievement',
  'rank',
  'ranked',
  'top ',
  'solved',
  'questions solved',
  'leetcode',
  'codechef',
  'volunteer',
  'participation',
  'participant',
  'contribution',
  'contributed',
];

/**
 * Status detection patterns.
 */
const STATUS_PATTERNS: Array<{
  pattern: RegExp;
  status: CertificationStatus;
}> = [
  {
    pattern:
      /\b(in[-\s]?progress|ongoing|currently\s+pursuing|pursuing)\b/i,
    status: 'in-progress',
  },
  {
    pattern: /\b(expired|lapsed)\b/i,
    status: 'expired',
  },
  {
    pattern:
      /\b(completed|awarded|earned|obtained|passed|issued)\b/i,
    status: 'completed',
  },
];

/**
 * Supported year / month-year patterns.
 *
 * Examples:
 * 2024
 * 2023 - 2024
 * 2023–2024
 * Jan 2024
 * January 2024
 */
const DATE_PATTERN =
  /\b((?:19|20)\d{2}(?:\s*[-–/]\s*(?:19|20)\d{2})?|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(?:19|20)\d{2})\b/i;

/**
 * Common labels found in certificate sections.
 */
const LABEL_PATTERNS = {
  issuer:
    /^(issuer|issued\s*by|provider|provided\s*by|organization|organisation|from)\s*[:-]\s*/i,

  date:
    /^(date|issued|issued\s*on|completion\s*date|completed\s*on)\s*[:-]\s*/i,

  status:
    /^(status)\s*[:-]\s*/i,

  description:
    /^(description|details|credential|credential\s*id)\s*[:-]\s*/i,
};

/**
 * Normalize whitespace without changing the actual content.
 */
function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Determine whether a piece of text contains certification language.
 */
function hasCertificationHint(text: string): boolean {
  const lower = text.toLowerCase();

  return CERTIFICATION_HINTS.some((hint) =>
    lower.includes(hint),
  );
}

/**
 * Determine whether text looks like a pure achievement.
 */
function hasAchievementHint(text: string): boolean {
  const lower = text.toLowerCase();

  return ACHIEVEMENT_HINTS.some((hint) =>
    lower.includes(hint),
  );
}

/**
 * Decide whether a candidate block is likely to represent a certification.
 *
 * Important:
 * We do not automatically classify every line as a certification.
 * Certification evidence is required for mixed sections.
 */
function looksLikeCertification(
  block: string,
  sectionHeading?: string,
): boolean {
  const normalized = normalizeWhitespace(block);

  if (normalized.length < 4) {
    return false;
  }

  const certificationEvidence =
    hasCertificationHint(normalized);

  const achievementEvidence =
    hasAchievementHint(normalized);

  /**
   * Achievement-only entries should be skipped.
   */
  if (achievementEvidence && !certificationEvidence) {
    return false;
  }

  /**
   * If the section itself is explicitly a certification section,
   * we can be more inclusive because the section context is strong.
   */
  const normalizedHeading =
    sectionHeading?.toLowerCase() ?? '';

  const explicitCertificationSection =
    normalizedHeading.includes('certification') ||
    normalizedHeading.includes('certificate') ||
    normalizedHeading.includes('license');

  if (explicitCertificationSection) {
    return true;
  }

  /**
   * For mixed sections, require actual certification evidence.
   */
  return certificationEvidence;
}

/**
 * Detect certification status.
 */
function detectStatus(text: string): CertificationStatus {
  for (const { pattern, status } of STATUS_PATTERNS) {
    if (pattern.test(text)) {
      return status;
    }
  }

  return 'unknown';
}

/**
 * Extract a date from text.
 */
function extractDate(text: string): string | undefined {
  const match = text.match(DATE_PATTERN);

  return match?.[1]?.trim();
}

/**
 * Remove a detected date from a line.
 */
function removeDate(text: string): string {
  return text.replace(DATE_PATTERN, '').trim();
}

/**
 * Split a first-line certification entry.
 *
 * Supports:
 *
 * Certification Name — Issuer
 * Certification Name – Issuer
 * Certification Name | Issuer
 * Certification Name • Issuer
 *
 * No hard-coded company/issuer dictionary is used.
 */
function splitNameAndIssuer(line: string): {
  name: string;
  issuer?: string;
} {
  const normalizedLine = normalizeWhitespace(line);

  const separators = [
    ' — ',
    ' – ',
    ' | ',
    ' • ',
  ];

  for (const separator of separators) {
    const index = normalizedLine.indexOf(separator);

    if (index <= 0) {
      continue;
    }

    const left = normalizeWhitespace(
      normalizedLine.slice(0, index),
    );

    const right = normalizeWhitespace(
      normalizedLine.slice(index + separator.length),
    );

    if (!left || !right) {
      continue;
    }

    /**
     * Do not treat a date range after the separator as an issuer.
     */
    if (DATE_PATTERN.test(right)) {
      const withoutDate = removeDate(right);

      if (!withoutDate) {
        return {
          name: left,
        };
      }
    }

    return {
      name: left,
      issuer: right,
    };
  }

  return {
    name: normalizedLine,
  };
}

/**
 * Extract a labeled value from a line.
 */
function extractLabeledValue(
  line: string,
  pattern: RegExp,
): string | undefined {
  if (!pattern.test(line)) {
    return undefined;
  }

  const value = line.replace(pattern, '').trim();

  return value || undefined;
}

/**
 * Determine whether a line is probably a standalone date.
 */
function isDateOnlyLine(line: string): boolean {
  const match = line.match(DATE_PATTERN);

  if (!match) {
    return false;
  }

  const remaining = line
    .replace(DATE_PATTERN, '')
    .replace(/[-–|•:,]/g, '')
    .trim();

  return remaining.length === 0;
}

/**
 * Determine whether a line looks like a bullet.
 */
function isBulletLine(line: string): boolean {
  return /^[-•●▪◦*]\s*/.test(line);
}

/**
 * Remove a leading bullet marker.
 */
function removeBullet(line: string): string {
  return line
    .replace(/^[-•●▪◦*]\s*/, '')
    .trim();
}

/**
 * Determine whether a line looks like a new certification title.
 *
 * This is intentionally conservative.
 */
function looksLikeNewCertificationTitle(
  line: string,
): boolean {
  const normalized = normalizeWhitespace(line);

  if (!normalized) {
    return false;
  }

  /**
   * Explicit certification words are strong evidence.
   */
  if (hasCertificationHint(normalized)) {
    return true;
  }

  /**
   * Strong separators can indicate:
   *
   * Certification Name | Issuer
   */
  if (
    normalized.includes(' | ') ||
    normalized.includes(' — ') ||
    normalized.includes(' – ') ||
    normalized.includes(' • ')
  ) {
    return true;
  }

  return false;
}

/**
 * Group lines into candidate certification blocks.
 *
 * A normal capitalized sentence does NOT automatically
 * start a new certification.
 */
function groupIntoBlocks(lines: string[]): string[][] {
  const blocks: string[][] = [];

  let current: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }

      continue;
    }

    const startsNew =
      current.length > 0 &&
      !isBulletLine(line) &&
      looksLikeNewCertificationTitle(line);

    if (startsNew) {
      blocks.push(current);
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

/**
 * Parse one certification block.
 */
function parseBlock(
  blockLines: string[],
  index: number,
  sectionHeading?: string,
): ResumeCertification | null {
  const cleanedLines = blockLines
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (cleanedLines.length === 0) {
    return null;
  }

  const rawText = cleanedLines.join('\n').trim();

  if (
    !looksLikeCertification(
      rawText,
      sectionHeading,
    )
  ) {
    return null;
  }

  const firstLine = cleanedLines[0];

  if (!firstLine) {
    return null;
  }

  const {
    name: parsedName,
    issuer: issuerFromFirstLine,
  } = splitNameAndIssuer(firstLine);

  let name = parsedName;
  let issuer = issuerFromFirstLine;

  let date: string | undefined;
  let status = detectStatus(rawText);

  const descriptionParts: string[] = [];

  /**
   * If the first line contains a date, extract it.
   */
  const firstLineDate = extractDate(firstLine);

  if (firstLineDate) {
    date = firstLineDate;

    if (name) {
      const cleanedName = normalizeWhitespace(
        removeDate(name),
      );

      if (cleanedName) {
        name = cleanedName;
      }
    }
  }

  /**
   * Process remaining lines.
   */
  for (let i = 1; i < cleanedLines.length; i += 1) {
    const line = cleanedLines[i];

    if (!line) {
      continue;
    }

    /**
     * Explicit issuer label.
     */
    const labeledIssuer = extractLabeledValue(
      line,
      LABEL_PATTERNS.issuer,
    );

    if (labeledIssuer) {
      issuer = labeledIssuer;
      continue;
    }

    /**
     * Explicit date label.
     */
    const labeledDate = extractLabeledValue(
      line,
      LABEL_PATTERNS.date,
    );

    if (labeledDate) {
      const extracted = extractDate(labeledDate);

      if (extracted) {
        date = extracted;
      }

      continue;
    }

    /**
     * Explicit status label.
     */
    const labeledStatus = extractLabeledValue(
      line,
      LABEL_PATTERNS.status,
    );

    if (labeledStatus) {
      status = detectStatus(labeledStatus);
      continue;
    }

    /**
     * Standalone date.
     */
    if (!date && isDateOnlyLine(line)) {
      date = extractDate(line);
      continue;
    }

    /**
     * Detect date embedded in a secondary line.
     */
    if (!date) {
      const extractedDate = extractDate(line);

      if (extractedDate) {
        date = extractedDate;
      }
    }

    /**
     * If issuer is not known, a short secondary line
     * can sometimes represent the issuer.
     */
    if (
      !issuer &&
      !isBulletLine(line) &&
      line.length <= 80 &&
      !LABEL_PATTERNS.description.test(line) &&
      !hasAchievementHint(line)
    ) {
      const lineWithoutDate = removeDate(line);

      if (
        lineWithoutDate.length > 0 &&
        !hasCertificationHint(lineWithoutDate)
      ) {
        issuer = lineWithoutDate;
        continue;
      }
    }

    /**
     * Everything else is descriptive content.
     */
    const description = removeBullet(line);

    if (description) {
      descriptionParts.push(description);
    }
  }

  /**
   * If the name still contains a date, clean it.
   */
  if (name) {
    name = normalizeWhitespace(removeDate(name));
  }

  /**
   * Never create an empty certification.
   */
  if (!name) {
    return null;
  }

  /**
   * Final safety check against achievement-only blocks.
   */
  if (
    hasAchievementHint(rawText) &&
    !hasCertificationHint(rawText) &&
    !(
      sectionHeading &&
      /certifications?|certificates?|licenses?/i.test(
        sectionHeading,
      )
    )
  ) {
    return null;
  }

  const certification: ResumeCertification = {
    id: `certification-${index + 1}-${randomUUID().slice(0, 8)}`,
    name,
    rawText,
  };

  if (issuer) {
    certification.issuer = issuer;
  }

  if (date) {
    certification.date = date;
  }

  certification.status = status;

  if (descriptionParts.length > 0) {
    certification.description =
      descriptionParts.join(' ').trim();
  }

  return certification;
}

/**
 * Main entry point.
 *
 * @param sectionContent
 * Raw text belonging to the certification section.
 *
 * @param sectionHeading
 * Original section heading, when available.
 */
export function parseCertificationSection(
  sectionContent: string,
  sectionHeading?: string,
): ResumeCertification[] {
  if (!sectionContent || !sectionContent.trim()) {
    return [];
  }

  /**
   * Normalize line endings.
   */
  const lines = sectionContent
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim());

  /**
   * Remove obvious section-heading lines.
   */
  const contentLines = lines.filter((line) => {
    if (!line) {
      return false;
    }

    return !/^(certifications?|certificates?|licenses?\s*&\s*certifications?|certifications?\s*&\s*achievements?|certificates?\s*\/\s*achievements?)\s*$/i.test(
      line,
    );
  });

  if (contentLines.length === 0) {
    return [];
  }

  const blocks = groupIntoBlocks(contentLines);

  const results: ResumeCertification[] = [];

  blocks.forEach((block, index) => {
    const certification = parseBlock(
      block,
      index,
      sectionHeading,
    );

    if (certification) {
      results.push(certification);
    }
  });

  return results;
}