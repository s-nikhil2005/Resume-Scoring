"use client";

import type { LanguageAnalysisResult, LanguageScoreResult } from "@/types/analysis";
import { BookOpen, CheckCircle } from "lucide-react";

interface LanguageReportProps {
  languageAnalysis: LanguageAnalysisResult;
  languageScore: LanguageScoreResult;
}

export default function LanguageReport({
  languageAnalysis,
  languageScore,
}: LanguageReportProps) {
  const issues = languageAnalysis?.issues || [];
  const stats = languageAnalysis?.statistics;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                LanguageTool Writing & Grammar Score
              </h3>
              <p className="text-xs text-slate-500">
                Evaluates grammatical accuracy, spelling errors, and writing tone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">
              {languageScore?.score ?? 100}
            </span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Penalties Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Grammar Issues
            </span>
            <span className="text-lg font-bold text-slate-900">
              {languageAnalysis?.grammarIssueCount ?? 0}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">
              -{languageScore?.grammarPenalty ?? 0} pts
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Spelling Mistakes
            </span>
            <span className="text-lg font-bold text-slate-900">
              {languageAnalysis?.spellingIssueCount ?? 0}
            </span>
            <span className="text-[10px] text-rose-600 block mt-0.5">
              -{languageScore?.spellingPenalty ?? 0} pts
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Style & Phrasing
            </span>
            <span className="text-lg font-bold text-slate-900">
              {languageAnalysis?.styleIssueCount ?? 0}
            </span>
            <span className="text-[10px] text-amber-600 block mt-0.5">
              -{languageScore?.stylePenalty ?? 0} pts
            </span>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block">
              Typographical
            </span>
            <span className="text-lg font-bold text-slate-900">
              {languageAnalysis?.otherIssueCount ?? 0}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              -{languageScore?.otherPenalty ?? 0} pts
            </span>
          </div>
        </div>

        {/* Text Statistics Bar */}
        {stats && (
          <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50/70 px-4 py-2.5 text-xs text-slate-600 border border-slate-100">
            <div>
              <span className="font-semibold text-slate-900">{stats.wordCount}</span> words
            </div>
            <div>
              <span className="font-semibold text-slate-900">{stats.sentenceCount}</span> sentences
            </div>
            <div>
              <span className="font-semibold text-slate-900">{stats.averageWordsPerSentence}</span> avg words/sentence
            </div>
          </div>
        )}
      </div>

      {/* Issues Breakdown List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-4">
          Identified Issues & Replacements ({issues.length})
        </h4>

        {issues.length === 0 ? (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50/50 border border-emerald-100 p-5 text-emerald-800 text-xs">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Exceptional Writing Hygiene!</p>
              <p className="text-emerald-700 mt-0.5">
                No significant grammatical, spelling, or typographical issues detected.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.slice(0, 15).map((issue, idx) => (
              <div
                key={`${issue.message}-${idx}`}
                className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded bg-rose-100 text-rose-800 font-semibold uppercase text-[10px] px-2 py-0.5">
                    {issue.issueType}
                  </span>
                  {issue.category && (
                    <span className="text-[10px] text-slate-400">
                      {issue.category}
                    </span>
                  )}
                </div>

                <p className="font-semibold text-slate-900">{issue.message}</p>

                {issue.context && (
                  <div className="rounded bg-white p-2 border border-slate-200/60 font-mono text-[11px] text-slate-600">
                    &quot;{issue.context}&quot;
                  </div>
                )}

                {issue.replacements && issue.replacements.length > 0 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-500">Suggested:</span>
                    <div className="flex flex-wrap gap-1">
                      {issue.replacements.slice(0, 3).map((r, rIdx) => (
                        <span
                          key={rIdx}
                          className="rounded bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5"
                        >
                          {r.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
