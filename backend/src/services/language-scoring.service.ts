import type { LanguageAnalysisResult } from '../types/language-analysis.types';

export interface LanguageScoreResult {
  score: number;
  grammarPenalty: number;
  spellingPenalty: number;
  stylePenalty: number;
  otherPenalty: number;
}

const calculateIssueDensity = (
  issueCount: number,
  wordCount: number,
): number => {
  if (wordCount === 0) {
    return 0;
  }

  return (issueCount / wordCount) * 100;
};

const calculatePenalty = (
  issueDensity: number,
  penaltyPerIssue: number,
  maximumPenalty: number,
): number => {
  return Math.min(issueDensity * penaltyPerIssue, maximumPenalty);
};

export const calculateLanguageScore = (
  analysis: LanguageAnalysisResult,
): LanguageScoreResult => {
  const { statistics } = analysis;

  const grammarDensity = calculateIssueDensity(
    analysis.grammarIssueCount,
    statistics.wordCount,
  );

  const spellingDensity = calculateIssueDensity(
    analysis.spellingIssueCount,
    statistics.wordCount,
  );

  const styleDensity = calculateIssueDensity(
    analysis.styleIssueCount,
    statistics.wordCount,
  );

  const otherDensity = calculateIssueDensity(
    analysis.otherIssueCount,
    statistics.wordCount,
  );

  const grammarPenalty = calculatePenalty(
    grammarDensity,
    2,
    20,
  );

  const spellingPenalty = calculatePenalty(
    spellingDensity,
    2.5,
    20,
  );

  const stylePenalty = calculatePenalty(
    styleDensity,
    1,
    10,
  );

  const otherPenalty = calculatePenalty(
    otherDensity,
    0.5,
    5,
  );

  const totalPenalty =
    grammarPenalty +
    spellingPenalty +
    stylePenalty +
    otherPenalty;

  const score = Math.max(
    0,
    Math.min(100, Math.round(100 - totalPenalty)),
  );

  return {
    score,
    grammarPenalty: Number(grammarPenalty.toFixed(2)),
    spellingPenalty: Number(spellingPenalty.toFixed(2)),
    stylePenalty: Number(stylePenalty.toFixed(2)),
    otherPenalty: Number(otherPenalty.toFixed(2)),
  };
};