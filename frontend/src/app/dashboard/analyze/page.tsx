"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { analyzeResume } from "@/lib/api/resume";
import { historyService } from "@/lib/services/history";
import { extractErrorMessage } from "@/lib/api/axios";
import {
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Shield,
  FileCheck,
  Cpu,
  SpellCheck,
} from "lucide-react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB (backend limit)

interface ProcessingStep {
  id: string;
  label: string;
  detail: string;
}

const PIPELINE_STEPS: ProcessingStep[] = [
  {
    id: "upload",
    label: "Uploading document",
    detail: "Transferring PDF buffer securely to Express backend",
  },
  {
    id: "extract",
    label: "Extracting text & OCR",
    detail: "Normalizing text and applying OCR fallback if scanned",
  },
  {
    id: "sections",
    label: "Parsing resume structure",
    detail: "Segmenting contact, skills, projects, and employment history",
  },
  {
    id: "ai",
    label: "Running Ollama semantic analysis",
    detail: "Evaluating project relevance and matching demonstrated skills",
  },
  {
    id: "language",
    label: "LanguageTool grammar diagnostics",
    detail: "Scoring vocabulary, spelling, and style issue density",
  },
  {
    id: "scoring",
    label: "Calculating ATS score & suggestions",
    detail: "Aggregating weighted section scores and recommendations",
  },
];

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadPercent, setUploadPercent] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateAndSelectFile = (file: File) => {
    setErrorMessage("");
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setErrorMessage("Only PDF resumes are supported by the analysis engine.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File exceeds 5MB limit. Please upload a smaller PDF file.");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMessage("");
    setCurrentStepIndex(0);
    setUploadPercent(0);

    // Simulated step advancement timer while backend processes pipeline
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < PIPELINE_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    try {
      const result = await analyzeResume(selectedFile, (pct) => {
        setUploadPercent(pct);
        if (pct >= 100) {
          setCurrentStepIndex((prev) => Math.max(prev, 1));
        }
      });

      clearInterval(stepInterval);
      setCurrentStepIndex(PIPELINE_STEPS.length - 1);

      // Save to local history service
      const saved = historyService.saveAnalysis(selectedFile, result);

      // Short delay so user perceives completion
      setTimeout(() => {
        router.push(`/dashboard/results/${saved.id}`);
      }, 700);
    } catch (err) {
      clearInterval(stepInterval);
      setIsProcessing(false);
      setErrorMessage(
        extractErrorMessage(
          err,
          "Failed to analyze resume. Please ensure your PDF contains readable text and try again."
        )
      );
    }
  };

  const resetSelection = () => {
    setSelectedFile(null);
    setIsProcessing(false);
    setErrorMessage("");
    setUploadPercent(0);
    setCurrentStepIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Analyze Resume
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Upload your resume in PDF format to run our full multi-stage AI inspection pipeline.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        {errorMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-0.5 text-xs text-rose-700">{errorMessage}</p>
            </div>
          </div>
        )}

        {!isProcessing ? (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
                dragActive
                  ? "border-blue-600 bg-blue-50/50"
                  : selectedFile
                  ? "border-emerald-400 bg-emerald-50/20"
                  : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mb-3 shadow-xs">
                    <FileCheck className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedFile.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis
                  </p>
                  <p className="mt-3 text-xs font-semibold text-blue-600 hover:underline">
                    Click to choose a different PDF
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4 shadow-xs">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Drag and drop your resume here
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
                    Or browse from your computer. Only standard PDF format is supported (maximum 5MB).
                  </p>
                  <button
                    type="button"
                    className="mt-4 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition pointer-events-none"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedFile && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetSelection}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Remove File
                </button>
                <button
                  type="button"
                  onClick={startAnalysis}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
                >
                  <span>Start AI Resume Analysis</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Multi-Stage Processing Visualizer */
          <div className="py-6 space-y-8">
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
                <Loader2 className="h-7 w-7 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Analyzing your resume...
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Running deterministic section detectors, Ollama semantic parsing, and LanguageTool grammar verification.
              </p>
            </div>

            {/* Pipeline Step Checklist */}
            <div className="max-w-md mx-auto space-y-3">
              {PIPELINE_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-3.5 p-3 rounded-xl border transition ${
                      isCurrent
                        ? "border-blue-200 bg-blue-50/60 shadow-xs"
                        : isDone
                        ? "border-emerald-100 bg-emerald-50/30"
                        : "border-slate-100 bg-slate-50/40 opacity-50"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : isCurrent ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-xs font-bold ${
                            isCurrent
                              ? "text-blue-900"
                              : isDone
                              ? "text-emerald-900"
                              : "text-slate-600"
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && idx === 0 && uploadPercent > 0 && (
                          <span className="text-[10px] font-bold text-blue-600">
                            {uploadPercent}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Trust & Guarantees Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/60 shadow-xs">
          <Shield className="h-5 w-5 text-blue-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-slate-800">Strict Privacy</span>
            Resumes are analyzed directly in memory without public disclosure.
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/60 shadow-xs">
          <Cpu className="h-5 w-5 text-indigo-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-slate-800">Ollama Semantic Engine</span>
            True semantic skill demonstration, not simple keyword stuffing.
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-white p-4 border border-slate-200/60 shadow-xs">
          <SpellCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold block text-slate-800">Language Diagnostics</span>
            Grammar, style, and typographical issue detection.
          </div>
        </div>
      </div>
    </div>
  );
}
