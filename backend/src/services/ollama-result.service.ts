// src/services/ollama-result.service.ts

import {
  ollamaAnalysisSchema,
  type OllamaAnalysis,
} from '../validations/ollama.validation';

/**
 * --------------------------------------------------
 * OLLAMA RESULT VALIDATION SERVICE
 * --------------------------------------------------
 *
 * Ollama returns the response as a JSON string.
 *
 * This service:
 *
 * 1. Parses the JSON string.
 * 2. Validates the complete AI analysis using Zod.
 * 3. Returns a safely typed OllamaAnalysis object.
 *
 * The AI analysis now represents the COMPLETE
 * resume analysis response instead of a single section.
 */

/**
 * Parses and validates one complete Ollama response.
 */
export const validateOllamaResult = (
  rawResult: string,
): OllamaAnalysis => {
  // --------------------------------------------------
  // STEP 1: Parse JSON
  // --------------------------------------------------

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawResult);
  } catch {
    throw new Error(
      'Ollama returned invalid JSON',
    );
  }

  // --------------------------------------------------
  // STEP 2: Validate with Zod
  // --------------------------------------------------

  const result =
    ollamaAnalysisSchema.safeParse(parsed);

  // --------------------------------------------------
  // STEP 3: Reject invalid structure
  // --------------------------------------------------

  if (!result.success) {
    console.error(
      'Invalid Ollama analysis result:',
      result.error.issues,
    );

    throw new Error(
      'Ollama returned invalid analysis structure',
    );
  }

  // --------------------------------------------------
  // STEP 4: Return validated result
  // --------------------------------------------------

  return result.data;
};