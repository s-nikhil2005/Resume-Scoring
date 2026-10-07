"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { historyService } from "@/lib/services/history";
import type { StoredAnalysis } from "@/types/history";
import ScoreGauge from "@/components/analysis/ScoreGauge";
import SectionScores from "@/components/analysis/SectionScores";
import Recommendations from "@/components/analysis/Recommendations";
import ProjectAlignment from "@/components/analysis/ProjectAlignment";
import LanguageReport from "@/components/analysis/LanguageReport";
import ResumeInspector from "@/components/analysis/ResumeInspector";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Printer,
  Upload,
  Sparkles,
  Layers,
  SpellCheck,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [analysis] = useState<StoredAnalysis | null>(() => {
    if (!id) return null;
    return historyService.getAnalysisById(id);
  });
  const [activeView, setActiveView] = useState<"overview" | "alignment" | "language" | "parsed">("overview");

  if (!analysis) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Analysis Report Not Found</h2>
        <p className="text-sm text-slate-500">
          The requested analysis session was not found in your local browser history. It may have been cleared or analyzed in a different browser.
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/analyze"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Upload & Run New Analysis</span>
          </Link>
        </div>
      </div>
    );
  }

  const { data } = analysis;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/history"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to History</span>
            </Link>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(analysis.uploadedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2.5 pt-0.5">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              {analysis.fileName}
            </h1>
            {analysis.candidateName && (
              <span className="hidden sm:inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                {analysis.candidateName}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Report</span>
          </button>
          <Link
            href="/dashboard/analyze"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition"
          >
            <Upload className="h-4 w-4" />
            <span>Re-Analyze Resume</span>
          </Link>
        </div>
      </div>

      {/* Hero ATS Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col items-center justify-center md:border-r md:border-slate-100 md:pr-6">
          <ScoreGauge score={data.atsScore} size={190} />
        </div>

        <div className="md:col-span-2 flex flex-col justify-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full self-start">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic ATS Scoring Formula</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Overall ATS Compatibility: {Math.round(data.atsScore)}%
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your ATS compatibility is calculated directly across Structure, Contact completeness, validated Skills, Project deliverables, and LanguageTool grammar hygiene.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Language Score</span>
              <span className="text-sm font-extrabold text-slate-800">
                {data.languageScore?.score ?? 100}/100
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Project Alignment</span>
              <span className="text-sm font-extrabold text-slate-800">
                {data.projectSkillAlignment?.overallAlignmentPercentage ?? 0}%
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-[11px] text-slate-400 block font-medium">Recommendations</span>
              <span className="text-sm font-extrabold text-slate-800">
                {data.suggestions?.suggestions?.length ?? 0} items
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveView("overview")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeView === "overview"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Scores & Recommendations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("alignment")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeView === "alignment"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Skill Alignment</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("language")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeView === "language"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <SpellCheck className="h-4 w-4" />
          <span>Language & Writing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView("parsed")}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
            activeView === "parsed"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCheck className="h-4 w-4" />
          <span>Extracted Resume Data</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeView === "overview" && (
        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">
              Section-by-Section Scoring Breakdown
            </h3>
            <SectionScores sectionScores={data.sectionScores} />
          </div>

          <Recommendations suggestionsData={data.suggestions} />
        </div>
      )}

      {activeView === "alignment" && (
        <ProjectAlignment
          projectAlignment={data.projectSkillAlignment}
          experienceAlignment={data.experienceSkillAlignment}
        />
      )}

      {activeView === "language" && (
        <LanguageReport
          languageAnalysis={data.languageAnalysis}
          languageScore={data.languageScore}
        />
      )}

      {activeView === "parsed" && (
        <ResumeInspector
          contact={data.contact}
          skills={data.skills}
          projects={data.projects}
          education={data.education}
          experience={data.experience}
          certifications={data.certifications}
        />
      )}
    </div>
  );
}
