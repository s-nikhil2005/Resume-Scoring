export type LanguageIssueType =
  | 'grammar'
  | 'spelling'
  | 'style'
  | 'typographical'
  | 'other';

export interface LanguageIssueReplacement {
  value: string;
}

export interface LanguageIssue {
  message: string;
  shortMessage: string;
  issueType: LanguageIssueType;
  offset: number;
  length: number;
  context: string;
  sentence: string;
  replacements: LanguageIssueReplacement[];
  ruleId?: string;
  ruleDescription?: string;
  category?: string;
}

export interface LanguageStatistics {
  characterCount: number;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
}

export interface LanguageAnalysisResult {
  analyzed: boolean;
  language: string;
  languageCode: string;
  confidence?: number;

  statistics: LanguageStatistics;

  issues: LanguageIssue[];

  grammarIssueCount: number;
  spellingIssueCount: number;
  styleIssueCount: number;
  otherIssueCount: number;
}