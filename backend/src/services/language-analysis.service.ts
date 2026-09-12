import { checkGrammar } from './grammar.service';
import type {
  LanguageAnalysisResult,
  LanguageStatistics,
} from '../types/language-analysis.types';

const calculateStatistics = (text: string): LanguageStatistics => {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return {
      characterCount: 0,
      wordCount: 0,
      sentenceCount: 0,
      averageWordsPerSentence: 0,
    };
  }

  const words = trimmedText.match(/\b[\w'-]+\b/g) ?? [];

  const sentences = trimmedText
    .split(/[.!?]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const wordCount = words.length;
  const sentenceCount = sentences.length;

  return {
    characterCount: trimmedText.length,
    wordCount,
    sentenceCount,
    averageWordsPerSentence:
      sentenceCount > 0
        ? Number((wordCount / sentenceCount).toFixed(2))
        : 0,
  };
};

export const analyzeLanguage = async (
  text: string,
): Promise<LanguageAnalysisResult> => {
  const statistics = calculateStatistics(text);

  if (!text.trim()) {
    return {
      analyzed: false,
      language: 'Unknown',
      languageCode: 'unknown',
      statistics,
      issues: [],
      grammarIssueCount: 0,
      spellingIssueCount: 0,
      styleIssueCount: 0,
      otherIssueCount: 0,
    };
  }

  const grammarResult = await checkGrammar(text);

  const grammarIssueCount = grammarResult.issues.filter(
    (issue) => issue.issueType === 'grammar',
  ).length;

  const spellingIssueCount = grammarResult.issues.filter(
    (issue) => issue.issueType === 'spelling',
  ).length;

  const styleIssueCount = grammarResult.issues.filter(
    (issue) =>
      issue.issueType === 'style' ||
      issue.issueType === 'typographical',
  ).length;

  const otherIssueCount = grammarResult.issues.filter(
    (issue) => issue.issueType === 'other',
  ).length;

  const result: LanguageAnalysisResult = {
    analyzed: true,
    language: grammarResult.language,
    languageCode: grammarResult.languageCode,
    statistics,
    issues: grammarResult.issues,
    grammarIssueCount,
    spellingIssueCount,
    styleIssueCount,
    otherIssueCount,
  };

  if (grammarResult.confidence !== undefined) {
    result.confidence = grammarResult.confidence;
  }

  return result;
};