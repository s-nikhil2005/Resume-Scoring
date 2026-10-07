import api from "./axios";
import type { AnalyzeResumeResponse } from "@/types/analysis";

export async function analyzeResume(
  file: File,
  onUploadProgress?: (progressPercent: number) => void
): Promise<AnalyzeResumeResponse> {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await api.post<AnalyzeResumeResponse>("/analyze", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percent);
      }
    },
  });

  return response.data;
}
