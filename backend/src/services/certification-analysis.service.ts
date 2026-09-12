import type { ResumeCertification } from '../types/resume.types';
import type {
  CertificationAnalysisResult,
  AnalyzedCertification,
  CertificationImpact,
  OverallCertificationImpact,
} from '../types/certification.types';

export interface CertificationAnalysisInput {
  certifications: ResumeCertification[];
  detectedRole: string | null | undefined;
  resumeSkills: string[];
}

/**
 * Ollama configuration.
 *
 * This service intentionally calls Ollama directly so it does not depend
 * on a specific exported helper from ollama.service.ts.
 */
const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

/**
 * Call Ollama and return the generated response.
 */
async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',
      options: {
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed with status ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== 'object' ||
    !('response' in data) ||
    typeof data.response !== 'string'
  ) {
    throw new Error('Invalid response received from Ollama');
  }

  return data.response;
}

/**
 * Safe result when there are no certifications.
 *
 * Certifications are optional, so absence of certifications
 * should never negatively affect the resume.
 */
function emptyResult(reason: string): CertificationAnalysisResult {
  return {
    analyzed: false,
    certifications: [],
    overallImpact: 'not_applicable',
    skipReason: reason,
  };
}

/**
 * Build the prompt sent to Ollama.
 *
 * Ollama is used only for semantic interpretation.
 * It must not invent certification information.
 */
function buildPrompt(input: CertificationAnalysisInput): string {
  const certificationList = input.certifications.map((certification, index) => {
    const parts = [
      `id: ${certification.id}`,
      certification.name
        ? `name: ${certification.name}`
        : null,
      certification.issuer
        ? `issuer: ${certification.issuer}`
        : null,
      certification.date
        ? `date: ${certification.date}`
        : null,
      certification.status
        ? `status: ${certification.status}`
        : null,
      certification.description
        ? `description: ${certification.description}`
        : null,
      certification.rawText
        ? `rawText: ${certification.rawText}`
        : null,
    ].filter((value): value is string => value !== null);

    return `Certification ${index + 1}:\n${parts.join('\n')}`;
  });

  return `
You are a careful resume analysis assistant.

Analyze ONLY the certifications provided in the input.

IMPORTANT:
- Never invent certifications.
- Never invent certification names.
- Never invent issuers.
- Never invent dates.
- Never invent certification status.
- Never invent companies.
- Never invent technologies.
- Never invent skills that are not reasonably supported by the certification information.
- Do not use outside knowledge to create missing certification metadata.
- If information is missing, return null or an empty array.
- The detected role is only a context for relevance analysis.

Detected resume role:
${input.detectedRole ?? 'unknown'}

Resume technical skills:
${
  input.resumeSkills.length > 0
    ? input.resumeSkills.join(', ')
    : '(none listed)'
}

Parsed certifications:
${certificationList.join('\n\n')}

For every certification return:

{
  "id": "same id from input",
  "name": "name from input or null",
  "issuer": "issuer from input or null",
  "date": "date from input or null",
  "status": "status from input or null",
  "demonstratedSkills": [],
  "matchedResumeSkills": [],
  "additionalSkills": [],
  "roleRelevanceScore": 0,
  "impact": "high | medium | low | neutral",
  "explanation": "one short factual sentence"
}

Rules for demonstratedSkills:
- Only include skills that the certification name, description, or raw text reasonably supports.
- Do not infer unrelated technologies.
- Do not add skills simply because they are popular for the detected role.

Rules for matchedResumeSkills:
- Only use skills that already exist in the provided Resume technical skills list.
- Do not create new resume skills.

Rules for additionalSkills:
- These are demonstrated skills that are not present in the Resume technical skills list.
- Do not invent additional skills.

Rules for roleRelevanceScore:
- 0 means no meaningful relevance.
- 100 means extremely strong relevance.
- Base the score on semantic relevance to the detected role.
- Do not score based on certification popularity.

Rules for impact:
- high: strong evidence of relevant professional capability
- medium: useful relevant capability
- low: limited relevance
- neutral: little or no meaningful relevance

Return ONLY valid JSON:

{
  "certifications": [
    {
      "id": "...",
      "name": "...",
      "issuer": "...",
      "date": "...",
      "status": "...",
      "demonstratedSkills": [],
      "matchedResumeSkills": [],
      "additionalSkills": [],
      "roleRelevanceScore": 0,
      "impact": "neutral",
      "explanation": "..."
    }
  ]
}
`.trim();
}

/**
 * Convert unknown AI value into a clean string array.
 */
function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Normalize a string for deterministic comparison.
 *
 * No developer-specific alias dictionary is used here.
 */
function normalizeSkill(value: string): string {
  return value
    .toLowerCase()
    .replace(/[._/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Deterministically find which AI-demonstrated skills
 * actually exist in the resume skills.
 *
 * Ollama is NOT trusted for this relationship.
 */
function deriveSkillRelationship(
  demonstratedSkills: string[],
  resumeSkills: string[],
): {
  matchedResumeSkills: string[];
  additionalSkills: string[];
} {
  const normalizedResumeSkills = resumeSkills.map((skill) => ({
    original: skill,
    normalized: normalizeSkill(skill),
  }));

  const matchedResumeSkills: string[] = [];
  const additionalSkills: string[] = [];

  for (const demonstratedSkill of demonstratedSkills) {
    const normalizedDemonstratedSkill =
      normalizeSkill(demonstratedSkill);

    if (!normalizedDemonstratedSkill) {
      continue;
    }

    const matchingResumeSkill = normalizedResumeSkills.find(
      (resumeSkill) =>
        resumeSkill.normalized === normalizedDemonstratedSkill,
    );

    if (matchingResumeSkill) {
      if (!matchedResumeSkills.includes(matchingResumeSkill.original)) {
        matchedResumeSkills.push(matchingResumeSkill.original);
      }
    } else {
      if (!additionalSkills.includes(demonstratedSkill)) {
        additionalSkills.push(demonstratedSkill);
      }
    }
  }

  return {
    matchedResumeSkills,
    additionalSkills,
  };
}

/**
 * Safely convert the AI score into an integer between 0 and 100.
 */
function normalizeScore(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Safely read certification impact.
 */
function normalizeImpact(value: unknown): CertificationImpact {
  if (
    value === 'high' ||
    value === 'medium' ||
    value === 'low' ||
    value === 'neutral'
  ) {
    return value;
  }

  return 'neutral';
}

/**
 * Parse and validate Ollama's JSON response.
 *
 * The original parser data remains the source of truth for
 * certification metadata.
 */
function parseOllamaResponse(
  raw: string,
  original: ResumeCertification[],
  resumeSkills: string[],
): AnalyzedCertification[] {
  let parsed: unknown;

  try {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('No JSON object found in Ollama response');
    }

    parsed = JSON.parse(raw.slice(start, end + 1));
  } catch (error) {
    console.error('Failed to parse certification analysis JSON:', error);

    return original.map((certification) => ({
      id: certification.id,

      // AnalyzedCertification expects name as string.
      // Empty string means the parser did not find a name.
      name: certification.name ?? '',

      demonstratedSkills: [],
      matchedResumeSkills: [],
      additionalSkills: [],
      roleRelevanceScore: 0,
      impact: 'neutral' as const,
      explanation: 'Semantic analysis failed; no skills inferred.',
      ...(certification.issuer !== undefined
        ? { issuer: certification.issuer }
        : {}),
      ...(certification.date !== undefined
        ? { date: certification.date }
        : {}),
      ...(certification.status !== undefined
        ? { status: certification.status }
        : {}),
    }));
  }

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('certifications' in parsed) ||
    !Array.isArray(parsed.certifications)
  ) {
    return original.map((certification) => ({
      id: certification.id,
      name: certification.name ?? '',
      demonstratedSkills: [],
      matchedResumeSkills: [],
      additionalSkills: [],
      roleRelevanceScore: 0,
      impact: 'neutral' as const,
      explanation: 'Semantic analysis returned an invalid structure.',
      ...(certification.issuer !== undefined
        ? { issuer: certification.issuer }
        : {}),
      ...(certification.date !== undefined
        ? { date: certification.date }
        : {}),
      ...(certification.status !== undefined
        ? { status: certification.status }
        : {}),
    }));
  }

  const results: AnalyzedCertification[] = [];

  for (const item of parsed.certifications) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const record = item as Record<string, unknown>;

    if (typeof record.id !== 'string') {
      continue;
    }

    const originalCertification = original.find(
      (certification) => certification.id === record.id,
    );

    /**
     * Ignore certifications invented by Ollama.
     *
     * Every returned ID must belong to the parser output.
     */
    if (!originalCertification) {
      continue;
    }

    const demonstratedSkills = readStringArray(
      record.demonstratedSkills,
    );

    /**
     * Do NOT trust Ollama's matchedResumeSkills/additionalSkills.
     *
     * Derive them ourselves from the actual resume skills.
     */
    const {
      matchedResumeSkills,
      additionalSkills,
    } = deriveSkillRelationship(
      demonstratedSkills,
      resumeSkills,
    );

    const roleRelevanceScore = normalizeScore(
      record.roleRelevanceScore,
    );

    const impact = normalizeImpact(record.impact);

    const explanation =
      typeof record.explanation === 'string' &&
      record.explanation.trim().length > 0
        ? record.explanation.trim()
        : 'No explanation provided.';

    /**
     * Metadata comes from the parser, not Ollama.
     */
    results.push({
      id: originalCertification.id,
      name: originalCertification.name ?? '',
      demonstratedSkills,
      matchedResumeSkills,
      additionalSkills,
      roleRelevanceScore,
      impact,
      explanation,
      ...(originalCertification.issuer !== undefined
        ? { issuer: originalCertification.issuer }
        : {}),
      ...(originalCertification.date !== undefined
        ? { date: originalCertification.date }
        : {}),
      ...(originalCertification.status !== undefined
        ? { status: originalCertification.status }
        : {}),
    });
  }

  /**
   * If Ollama omitted some original certifications,
   * preserve them with a safe neutral result.
   */
  for (const certification of original) {
    const alreadyAnalyzed = results.some(
      (result) => result.id === certification.id,
    );

    if (alreadyAnalyzed) {
      continue;
    }

    results.push({
      id: certification.id,
      name: certification.name ?? '',
      demonstratedSkills: [],
      matchedResumeSkills: [],
      additionalSkills: [],
      roleRelevanceScore: 0,
      impact: 'neutral',
      explanation: 'No semantic analysis was returned for this certification.',
      ...(certification.issuer !== undefined
        ? { issuer: certification.issuer }
        : {}),
      ...(certification.date !== undefined
        ? { date: certification.date }
        : {}),
      ...(certification.status !== undefined
        ? { status: certification.status }
        : {}),
    });
  }

  return results;
}

/**
 * Derive overall certification impact deterministically.
 *
 * Certifications are optional, so this only runs when certifications exist.
 */
function deriveOverallImpact(
  items: AnalyzedCertification[],
): OverallCertificationImpact {
  if (items.length === 0) {
    return 'not_applicable';
  }

  const hasMeaningfulCertification = items.some(
    (certification) =>
      certification.roleRelevanceScore >= 40 ||
      certification.impact === 'high' ||
      certification.impact === 'medium',
  );

  return hasMeaningfulCertification ? 'positive' : 'neutral';
}

/**
 * Main public API.
 */
export async function analyzeCertifications(
  input: CertificationAnalysisInput,
): Promise<CertificationAnalysisResult> {
  /**
   * Certifications are optional.
   *
   * No certifications = skip this analysis.
   * There is NO penalty.
   */
  if (
    !input.certifications ||
    input.certifications.length === 0
  ) {
    return emptyResult('No certifications found in the resume');
  }

  const prompt = buildPrompt(input);

  let rawResponse: string;

  try {
    rawResponse = await callOllama(prompt);
  } catch (error) {
    console.error(
      'Certification analysis Ollama call failed:',
      error,
    );

    /**
     * Soft failure.
     *
     * We still return the certifications detected by the parser,
     * but we do not pretend that semantic analysis succeeded.
     */
    const fallbackResults: AnalyzedCertification[] =
      input.certifications.map((certification) => ({
        id: certification.id,
        name: certification.name ?? '',
        demonstratedSkills: [],
        matchedResumeSkills: [],
        additionalSkills: [],
        roleRelevanceScore: 0,
        impact: 'neutral',
        explanation: 'Semantic analysis unavailable.',
        ...(certification.issuer !== undefined
          ? { issuer: certification.issuer }
          : {}),
        ...(certification.date !== undefined
          ? { date: certification.date }
          : {}),
        ...(certification.status !== undefined
          ? { status: certification.status }
          : {}),
      }));

    return {
      analyzed: true,
      certifications: fallbackResults,
      overallImpact: 'neutral',
    };
  }

  const analyzed = parseOllamaResponse(
    rawResponse,
    input.certifications,
    input.resumeSkills,
  );

  const overallImpact = deriveOverallImpact(analyzed);

  return {
    analyzed: true,
    certifications: analyzed,
    overallImpact,
  };
}