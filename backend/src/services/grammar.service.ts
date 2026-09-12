import type {
  LanguageIssue,
  LanguageIssueReplacement,
  LanguageIssueType,
} from '../types/language-analysis.types';

const LANGUAGE_TOOL_URL =
  process.env.LANGUAGE_TOOL_URL ?? 'http://localhost:8081';

interface LanguageToolMatch {
  message: string;
  shortMessage: string;
  offset: number;
  length: number;
  replacements?: Array<{
    value: string;
  }>;
  context?: {
    text: string;
  };
  sentence?: string;
  type?: {
    typeName?: string;
  };
  rule?: {
    id?: string;
    description?: string;
    issueType?: string;
    category?: {
      name?: string;
    };
  };
}

interface LanguageToolResponse {
  language?: {
    name?: string;
    code?: string;
    confidence?: number;
    detectedLanguage?: {
      name?: string;
      code?: string;
      confidence?: number;
    };
  };
  matches?: LanguageToolMatch[];
}

export interface GrammarCheckResult {
  language: string;
  languageCode: string;
  confidence?: number;
  issues: LanguageIssue[];
}

const mapIssueType = (issueType?: string): LanguageIssueType => {
  switch (issueType?.toLowerCase()) {
    case 'grammar':
      return 'grammar';

    case 'misspelling':
      return 'spelling';

    case 'typographical':
      return 'typographical';

    case 'style':
      return 'style';

    default:
      return 'other';
  }
};

const mapReplacement = (
  replacements: LanguageToolMatch['replacements'],
): LanguageIssueReplacement[] => {
  return (replacements ?? []).map((replacement) => ({
    value: replacement.value,
  }));
};

export const checkGrammar = async (
  text: string,
): Promise<GrammarCheckResult> => {
  if (!text.trim()) {
    return {
      language: 'Unknown',
      languageCode: 'unknown',
      issues: [],
    };
  }

  const body = new URLSearchParams({
    language: 'en-US',
    text,
  });

  const response = await fetch(`${LANGUAGE_TOOL_URL}/v2/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  if (!response.ok) {
    throw new Error(
      `LanguageTool request failed with status ${response.status}`,
    );
  }

  const data = (await response.json()) as LanguageToolResponse;

  const detectedLanguage = data.language?.detectedLanguage;
  const language = detectedLanguage ?? data.language;

  const issues: LanguageIssue[] = (data.matches ?? []).map((match) => {
    const issue: LanguageIssue = {
      message: match.message,
      shortMessage: match.shortMessage,
      issueType: mapIssueType(match.rule?.issueType),
      offset: match.offset,
      length: match.length,
      context: match.context?.text ?? '',
      sentence: match.sentence ?? '',
      replacements: mapReplacement(match.replacements),
    };

    if (match.rule?.id !== undefined) {
      issue.ruleId = match.rule.id;
    }

    if (match.rule?.description !== undefined) {
      issue.ruleDescription = match.rule.description;
    }

    if (match.rule?.category?.name !== undefined) {
      issue.category = match.rule.category.name;
    }

    return issue;
  });

  const result: GrammarCheckResult = {
    language: language?.name ?? 'Unknown',
    languageCode: language?.code ?? 'unknown',
    issues,
  };

  const confidence = detectedLanguage?.confidence ?? data.language?.confidence;

  if (confidence !== undefined) {
    result.confidence = confidence;
  }

  return result;
};