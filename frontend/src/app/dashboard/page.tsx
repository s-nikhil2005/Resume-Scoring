"use client";

import { useState } from "react";
import Link from "next/link";
import { historyService } from "@/lib/services/history";
import type { DashboardMetrics, StoredAnalysis } from "@/types/history";
import {
  FileUp,
  FileText,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const [metrics] = useState<DashboardMetrics>(() => historyService.getMetrics());
  const [recentAnalyses] = useState<StoredAnalysis[]>(() =>
    historyService.getAnalyses().slice(0, 5)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Action */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Resume Optimization Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Optimize your resume for modern ATS algorithms.
          </h1>
          <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
            Upload your PDF to get instant ATS scores, semantic project-to-skill alignment, LanguageTool grammar diagnostics, and high-impact action recommendations.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/dashboard/analyze"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-600 shadow-sm hover:bg-blue-50 transition"
            >
              <FileUp className="h-4 w-4" />
              <span>Analyze New Resume</span>
            </Link>
            {metrics.latestAnalysisId && (
              <Link
                href={`/dashboard/results/${metrics.latestAnalysisId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-500/30 border border-white/20 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500/40 transition"
              >
                <span>View Latest Results</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Analyses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Analyses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.totalAnalyses}
            </span>
            <span className="text-xs text-slate-400">resumes</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Uploaded and evaluated</p>
        </div>

        {/* Card 2: Latest ATS Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Last ATS Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.latestScore !== null ? `${metrics.latestScore}` : "—"}
            </span>
            {metrics.latestScore !== null && (
              <span className="text-xs text-slate-400">/ 100</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">From most recent upload</p>
        </div>

        {/* Card 3: Best Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Best Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.bestScore !== null ? `${metrics.bestScore}` : "—"}
            </span>
            {metrics.bestScore !== null && (
              <span className="text-xs text-slate-400">/ 100</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Peak profile performance</p>
        </div>

        {/* Card 4: Average Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Score
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {metrics.averageScore !== null ? `${metrics.averageScore}` : "—"}
            </span>
            {metrics.averageScore !== null && (
              <span className="text-xs text-slate-400">/ 100</span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">Across all uploaded revisions</p>
        </div>
      </div>

      {/* Recent Analyses Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Analyses</h2>
            <p className="text-xs text-slate-500">
              Review your previous resume breakdown reports
            </p>
          </div>
          {recentAnalyses.length > 0 && (
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View all ({metrics.totalAnalyses})</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No resumes analyzed yet</h3>
            <p className="mt-1 max-w-sm mx-auto text-xs text-slate-500">
              Upload your first resume in PDF format to receive instant AI scoring and deep ATS breakdown.
            </p>
            <div className="mt-5">
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <FileUp className="h-4 w-4" />
                <span>Upload First Resume</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentAnalyses.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 hover:bg-slate-50/60 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.fileName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.uploadedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {item.candidateName && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{item.candidateName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getScoreColor(
                      item.atsScore
                    )}`}
                  >
                    ATS: {item.atsScore}/100
                  </div>
                  <Link
                    href={`/dashboard/results/${item.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 px-3 py-1.5 rounded-lg transition"
                  >
                    <span>View Report</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
