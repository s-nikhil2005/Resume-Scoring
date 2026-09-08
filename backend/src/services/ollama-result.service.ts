// src/services/ollama-result.service.ts

import {
  ollamaSectionResultSchema,
  type OllamaSectionResult,
} from '../validations/ollama.validation';

/**
 * Parses and validates one Ollama response.
 *
 * Ollama returns the response as a JSON string.
 *
 * This function:
 * 1. Parses the JSON string.
 * 2. Validates the parsed data using Zod.
 * 3. Returns a safely typed OllamaSectionResult.
 */
export const validateOllamaResult = (
  rawResult: string,
): OllamaSectionResult => {
  let parsed: unknown;

  // --------------------------------------------------
  // STEP 1: Parse JSON
  // --------------------------------------------------

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
    ollamaSectionResultSchema.safeParse(parsed);

  // --------------------------------------------------
  // STEP 3: Reject invalid structure
  // --------------------------------------------------

  if (!result.success) {
    console.error(
      'Invalid Ollama result:',
      result.error.issues,
    );

    throw new Error(
      'Ollama returned invalid resume structure',
    );
  }

  // --------------------------------------------------
  // STEP 4: Return validated result
  // --------------------------------------------------

  return result.data;
};