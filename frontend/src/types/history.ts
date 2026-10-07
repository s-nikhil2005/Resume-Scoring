import type { AnalyzeResumeResponse } from './analysis';

export interface StoredAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  atsScore: number;
  candidateName?: string;
  candidateRole?: string;
  data: AnalyzeResumeResponse;
}

export interface DashboardMetrics {
  totalAnalyses: number;
  latestScore: number | null;
  bestScore: number | null;
  averageScore: number | null;
  latestAnalysisId: string | null;
}
