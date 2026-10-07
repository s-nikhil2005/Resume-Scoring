"use client";

import type {
  ProjectSkillAlignmentResult,
  ExperienceSkillAnalysis,
} from "@/types/analysis";
import { Check, AlertCircle, Layers, Briefcase } from "lucide-react";

interface ProjectAlignmentProps {
  projectAlignment: ProjectSkillAlignmentResult;
  experienceAlignment?: ExperienceSkillAnalysis;
}

export default function ProjectAlignment({
  projectAlignment,
  experienceAlignment,
}: ProjectAlignmentProps) {
  const projects = projectAlignment?.projects || [];
  const experiences = experienceAlignment?.experiences || [];

  return (
    <div className="space-y-6">
      {/* Project Alignment Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Project ↔ Technical Skill Alignment
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Determines whether technologies demonstrated in your projects are backed by your Skills section
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 self-start sm:self-auto">
            <span className="text-xs text-blue-700 font-medium">Overall Alignment:</span>
            <span className="text-sm font-black text-blue-700">
              {projectAlignment?.overallAlignmentPercentage ?? 0}%
            </span>
          </div>
        </div>

        {/* Global Missing Skills Alert */}
        {projectAlignment?.projectOnlySkills && projectAlignment.projectOnlySkills.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs">
            <p className="font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Skills demonstrated in projects but missing from Technical Skills section:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {projectAlignment.projectOnlySkills.map((sk) => (
                <span
                  key={sk}
                  className="rounded-md bg-amber-100/90 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-900"
                >
                  +{sk}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            No projects detected in this resume to evaluate alignment.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.projectId}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {proj.projectName}
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      proj.alignmentStatus === "strong"
                        ? "bg-emerald-100 text-emerald-800"
                        : proj.alignmentStatus === "moderate"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {proj.alignmentPercentage}% aligned ({proj.alignmentStatus})
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs pt-1">
                  {/* Matched Skills */}
                  {proj.matchedSkills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Validated Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {proj.matchedSkills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-medium text-emerald-700"
                          >
                            <Check className="h-3 w-3" />
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Only Skills */}
                  {proj.projectOnlySkills.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Unlisted in Skills:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {proj.projectOnlySkills.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-medium text-amber-700"
                          >
                            +{s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Alignment Section (if applicable) */}
      {experiences.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-4">
            <Briefcase className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Employment Experience ↔ Skill Validation
            </h3>
          </div>

          <div className="space-y-3">
            {experiences.map((exp) => (
              <div
                key={exp.experienceId}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {exp.experienceTitle}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-500">
                    Alignment: {exp.alignmentPercentage}%
                  </span>
                </div>
                {exp.matchedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {exp.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
