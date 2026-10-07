import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 120000, // 2 minutes to allow deep OCR / Ollama analysis
});

export function extractErrorMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: { formErrors?: string[]; fieldErrors?: Record<string, string[]> } } | undefined;
    if (data?.message) {
      if (data.errors?.fieldErrors) {
        const firstField = Object.values(data.errors.fieldErrors)[0];
        if (firstField && firstField[0]) {
          return `${data.message}: ${firstField[0]}`;
        }
      }
      return data.message;
    }
    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again with a lighter document.";
    }
    if (!error.response) {
      return "Cannot connect to the server. Please verify the backend is running.";
    }
    return `Server responded with status ${error.response.status}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export default api;