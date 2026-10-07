"use client";

import type { ResumeSectionScores } from "@/types/analysis";
import {
  FileCode,
  Mail,
  Wrench,
  FolderGit2,
  GraduationCap,
  Briefcase,
  Award,
  BookOpen,
} from "lucide-react";

interface SectionScoresProps {
  sectionScores: ResumeSectionScores;
}

export default function SectionScores({ sectionScores }: SectionScoresProps) {
  const sections = [
    { key: "structure", label: "Document Structure", data: sectionScores.structure, icon: FileCode },
    { key: "contact", label: "Contact Information", data: sectionScores.contact, icon: Mail },
    { key: "skills", label: "Technical Skills", data: sectionScores.skills, icon: Wrench },
    { key: "projects", label: "Projects & Impact", data: sectionScores.projects, icon: FolderGit2 },
    { key: "education", label: "Education & Academics", data: sectionScores.education, icon: GraduationCap },
    { key: "experience", label: "Professional Experience", data: sectionScores.experience, icon: Briefcase },
    { key: "certifications", label: "Certifications", data: sectionScores.certifications, icon: Award },
    { key: "language", label: "Language & Grammar", data: sectionScores.language, icon: BookOpen },
  ];

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {sections.map(({ key, label, data, icon: Icon }) => {
        const isApplicable = data.applicable;
        const score = Math.round(data.score || 0);

        return (
          <div
            key={key}
            className={`rounded-2xl border p-4.5 transition ${
              isApplicable
                ? "border-slate-200/80 bg-white shadow-xs"
                : "border-slate-100 bg-slate-50/50 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
                <h4 className="text-xs font-bold text-slate-800">{label}</h4>
              </div>
              <span className="text-xs font-extrabold text-slate-900">
                {isApplicable ? `${score}%` : "N/A"}
              </span>
            </div>

            {/* Score Bar */}
            {isApplicable ? (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full ${getScoreBarColor(score)} transition-all duration-700`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                {data.reason && (
                  <p className="mt-2 text-[11px] text-slate-500 leading-snug line-clamp-2">
                    {data.reason}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400 italic">
                {data.reason || "Optional section not present in resume"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
