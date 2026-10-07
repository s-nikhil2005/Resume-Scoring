"use client";

import { useState } from "react";
import Link from "next/link";
import { historyService } from "@/lib/services/history";
import type { StoredAnalysis } from "@/types/history";
import {
  FileText,
  Search,
  Trash2,
  Upload,
  Calendar,
  ChevronRight,
} from "lucide-react";

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>(() =>
    historyService.getAnalyses()
  );
  const [searchQuery, setSearchQuery] = useState("");

  const refreshList = () => {
    setAnalyses(historyService.getAnalyses());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (confirm("Are you sure you want to remove this analysis from history?")) {
      historyService.deleteAnalysis(id);
      refreshList();
    }
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire analysis history?")) {
      historyService.clearHistory();
      refreshList();
    }
  };

  const filtered = analyses.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.fileName.toLowerCase().includes(q) ||
      (item.candidateName && item.candidateName.toLowerCase().includes(q))
    );
  });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-200";
    if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Analysis History
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View, review, and compare previously analyzed resumes.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {analyses.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              Clear History
            </button>
          )}
          <Link
            href="/dashboard/analyze"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by file name or candidate name..."
          className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 shadow-xs"
        />
      </div>

      {/* Main List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {analyses.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No resume analyses found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t analyzed any resumes yet. Upload your first PDF to generate an in-depth ATS breakdown.
            </p>
            <div className="pt-2">
              <Link
                href="/dashboard/analyze"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Resume</span>
              </Link>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No matching records for &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/results/${item.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 hover:bg-slate-50/70 transition gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {item.fileName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.uploadedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {item.candidateName && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600 font-medium">
                            {item.candidateName}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span>{(item.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold ${getScoreBadge(
                      item.atsScore
                    )}`}
                  >
                    ATS: {item.atsScore}/100
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
