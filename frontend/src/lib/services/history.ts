import type { AnalyzeResumeResponse } from "@/types/analysis";
import type { StoredAnalysis, DashboardMetrics } from "@/types/history";

const STORAGE_KEY = "resume_analysis_history";

/**
 * Service to store and retrieve resume analyses.
 * Currently uses client-side persistence (localStorage) because the backend database
 * schema currently does not have a persistent Resume/Analysis model.
 * Cleanly abstracted so it can be swapped with backend APIs when available.
 */
export const historyService = {
  getAnalyses(): StoredAnalysis[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as StoredAnalysis[];
    } catch (err) {
      console.error("Failed to read analysis history from localStorage:", err);
      return [];
    }
  },

  getAnalysisById(id: string): StoredAnalysis | null {
    const list = this.getAnalyses();
    return list.find((item) => item.id === id) || null;
  },

  saveAnalysis(file: File, result: AnalyzeResumeResponse): StoredAnalysis {
    const id = `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Extract candidate info safely from response
    const candidateName = result.contact?.name || undefined;
    const candidateRole = result.contact?.title || undefined;

    const record: StoredAnalysis = {
      id,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      atsScore: Math.round(result.atsScore),
      candidateName,
      candidateRole,
      data: result,
    };

    const currentList = this.getAnalyses();
    const updatedList = [record, ...currentList];

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
      } catch (err) {
        console.warn("Could not save full history to localStorage (possibly quota exceeded):", err);
        // Fallback: keep only the 10 most recent
        const truncated = updatedList.slice(0, 10);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(truncated));
        } catch {}
      }
    }

    return record;
  },

  deleteAnalysis(id: string): boolean {
    const currentList = this.getAnalyses();
    const filtered = currentList.filter((item) => item.id !== id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
      } catch (err) {
        console.error("Failed to delete analysis item:", err);
        return false;
      }
    }
    return false;
  },

  clearHistory(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  getMetrics(): DashboardMetrics {
    const analyses = this.getAnalyses();
    if (analyses.length === 0) {
      return {
        totalAnalyses: 0,
        latestScore: null,
        bestScore: null,
        averageScore: null,
        latestAnalysisId: null,
      };
    }

    const scores = analyses.map((a) => a.atsScore);
    const totalAnalyses = analyses.length;
    const latestScore = scores[0];
    const bestScore = Math.max(...scores);
    const averageScore = Math.round(
      scores.reduce((sum, s) => sum + s, 0) / scores.length
    );
    const latestAnalysisId = analyses[0].id;

    return {
      totalAnalyses,
      latestScore,
      bestScore,
      averageScore,
      latestAnalysisId,
    };
  },
};
