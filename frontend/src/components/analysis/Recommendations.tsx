"use client";

import { useState } from "react";
import type { ResumeSuggestions, ResumeSuggestionPriority } from "@/types/analysis";
import { AlertTriangle, AlertCircle, Info, CheckCircle, Sparkles } from "lucide-react";

interface RecommendationsProps {
  suggestionsData: ResumeSuggestions;
}

export default function Recommendations({ suggestionsData }: RecommendationsProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const suggestions = suggestionsData?.suggestions || [];

  const filtered = selectedPriority === "all"
    ? suggestions
    : suggestions.filter((s) => s.priority === selectedPriority);

  const getPriorityBadge = (priority: ResumeSuggestionPriority) => {
    switch (priority) {
      case "critical":
        return {
          icon: AlertCircle,
          label: "Critical Fix",
          classes: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "high":
        return {
          icon: AlertTriangle,
          label: "High Priority",
          classes: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "medium":
        return {
          icon: Info,
          label: "Recommended",
          classes: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "low":
      default:
        return {
          icon: CheckCircle,
          label: "Optimization",
          classes: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Actionable Optimization Recommendations ({suggestions.length})
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {["all", "critical", "high", "medium", "low"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedPriority(p)}
              className={`rounded-lg px-2.5 py-1 font-semibold capitalize transition cursor-pointer ${
                selectedPriority === p
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
          No suggestions found for this priority level.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((item, index) => {
            const badge = getPriorityBadge(item.priority);
            const Icon = badge.icon;

            return (
              <div
                key={`${item.title}-${index}`}
                className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold ${badge.classes}`}
                    >
                      <Icon className="h-3 w-3" />
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
