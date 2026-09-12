/**
 * Certification-related types for the resume analysis pipeline.
 * Kept minimal and compatible with the existing ResumeCertification shape.
 */

export type CertificationStatus =
  | "completed"
  | "in-progress"
  | "expired"
  | "unknown";

export type CertificationImpact = "high" | "medium" | "low" | "neutral";

export type OverallCertificationImpact =
  | "positive"
  | "neutral"
  | "not_applicable";

/**
 * Existing ResumeCertification shape (kept stable).
 * Only small optional fields that analysis needs are documented here.
 */
export interface ResumeCertification {
  id: string;
  name?: string;
  issuer?: string;
  status?: CertificationStatus;
  date?: string;
  description?: string;
  rawText?: string;
}

/**
 * Per-certification semantic analysis result produced by Ollama.
 */
export interface AnalyzedCertification {
  id: string;
  name?: string;
  issuer?: string;
  date?: string;
  status?: CertificationStatus;
  demonstratedSkills: string[];
  matchedResumeSkills: string[];
  additionalSkills: string[];
  roleRelevanceScore: number; // 0–100
  impact: CertificationImpact;
  explanation: string;
}

/**
 * Top-level certification analysis result returned to the controller / API.
 */
export interface CertificationAnalysisResult {
  analyzed: boolean;
  certifications: AnalyzedCertification[];
  overallImpact: OverallCertificationImpact;
  /** Present only when analysis was skipped (no cert section / empty). */
  skipReason?: string;
}