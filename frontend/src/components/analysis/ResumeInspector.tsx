"use client";

import { useState } from "react";
import type {
  ResumeContact,
  ResumeSkillCategory,
  ResumeProject,
  ResumeEducation,
  ResumeExperience,
  ResumeCertification,
} from "@/types/analysis";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Code,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
} from "lucide-react";

interface ResumeInspectorProps {
  contact?: ResumeContact;
  skills?: ResumeSkillCategory[];
  projects?: ResumeProject[];
  education?: ResumeEducation[];
  experience?: ResumeExperience[];
  certifications?: ResumeCertification[];
}

export default function ResumeInspector({
  contact,
  skills = [],
  projects = [],
  education = [],
  experience = [],
  certifications = [],
}: ResumeInspectorProps) {
  const [activeTab, setActiveTab] = useState<
    "skills" | "projects" | "experience" | "education" | "certifications"
  >("skills");

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-6">
      {/* Contact Summary Header */}
      {contact && (
        <div className="border-b border-slate-100 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {contact.name || "Extracted Candidate Profile"}
              </h3>
              {contact.title && (
                <p className="text-xs font-semibold text-blue-600 mt-0.5">
                  {contact.title}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              {contact.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {contact.email}
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {contact.phone}
                </span>
              )}
              {contact.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {contact.location}
                </span>
              )}
            </div>
          </div>

          {/* Links */}
          {contact.links && contact.links.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {contact.links.map((lnk, i) => (
                <a
                  key={i}
                  href={lnk.url.startsWith("http") ? lnk.url : `https://${lnk.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <span>{lnk.label || lnk.url}</span>
                  <ExternalLink className="h-3 w-3 text-slate-400" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "skills"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Code className="h-3.5 w-3.5" />
          <span>Skills ({skills.reduce((acc, c) => acc + c.items.length, 0)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "projects"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FolderGit2 className="h-3.5 w-3.5" />
          <span>Projects ({projects.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "experience"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Experience ({experience.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "education"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <GraduationCap className="h-3.5 w-3.5" />
          <span>Education ({education.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certifications")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
            activeTab === "certifications"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>Certifications ({certifications.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === "skills" && (
          <div className="space-y-4">
            {skills.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No skills section detected.</p>
            ) : (
              skills.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {cat.category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 border border-slate-200/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "projects" && (
          <div className="space-y-4">
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No projects detected.</p>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2"
                >
                  <h4 className="text-sm font-bold text-slate-900">{proj.name}</h4>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t, idx) => (
                        <span
                          key={idx}
                          className="rounded bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "experience" && (
          <div className="space-y-4">
            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No formal employment history detected.</p>
            ) : (
              experience.map((exp) => (
                <div
                  key={exp.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">
                      {exp.title || "Experience"} {exp.organization && `• ${exp.organization}`}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {exp.startDate} - {exp.endDate || (exp.isCurrent ? "Present" : "")}
                    </span>
                  </div>
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-slate-600 space-y-1">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "education" && (
          <div className="space-y-3">
            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No education entries found.</p>
            ) : (
              education.map((edu) => (
                <div
                  key={edu.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <h4 className="text-sm font-bold text-slate-900">
                    {edu.degree || "Degree"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {edu.institution} {edu.field && `• ${edu.field}`}
                  </p>
                  {(edu.startDate || edu.endDate) && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      {edu.startDate} - {edu.endDate}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "certifications" && (
          <div className="space-y-3">
            {certifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No certifications found.</p>
            ) : (
              certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
                >
                  <h4 className="text-sm font-bold text-slate-900">
                    {cert.name || "Certification"}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {cert.issuer} {cert.date && `• ${cert.date}`}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
