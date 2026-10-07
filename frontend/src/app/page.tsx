"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  TrendingUp,
  Cpu,
  BookOpen,
  Award,
  Layers,
  UploadCloud,
  FileCheck2,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const ctaHref = isAuthenticated ? "/dashboard/analyze" : "/register";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO SECTION */}
        {/* ========================================================= */}
        <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 bg-gradient-to-b from-blue-50/40 via-white to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 backdrop-blur-md shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Next-Gen Ollama & LanguageTool Resume Evaluation</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.12]">
                Build a Resume That <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Gets Noticed.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
                Analyze your resume with AI, discover hidden weaknesses, improve ATS compatibility, and get actionable recommendations before your next interview application.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <Link
                  href={ctaHref}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 transition"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#preview"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
                >
                  <span>See How It Works</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Deterministic ATS Scoring
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  LanguageTool Grammar Engine
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                  Zero Manual Guesswork
                </span>
              </div>
            </div>

            {/* Hero Interactive Dashboard Visual Preview */}
            <div id="preview" className="mt-14 sm:mt-18 mx-auto max-w-5xl">
              <div className="rounded-3xl border border-slate-200/90 bg-slate-900 p-2 sm:p-3 shadow-2xl shadow-blue-500/10 ring-1 ring-slate-900/5">
                <div className="rounded-2xl bg-white p-5 sm:p-8 space-y-6">
                  {/* Mock Dashboard Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Senior_FullStack_Engineer_Resume.pdf
                          </h3>
                          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            Analysis Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          Evaluated across 8 core dimensions with Ollama semantic alignment
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Engine:</span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Deterministic ATS v2
                      </span>
                    </div>
                  </div>

                  {/* Mock Score Grid (UI Preview Data only) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Resume Score
                      </span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">85</span>
                        <span className="text-xs text-slate-400">/ 100</span>
                      </div>
                      <p className="text-[11px] text-blue-700 font-medium mt-1">
                        Top 8% of applicants
                      </p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                        ATS Compatibility
                      </span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">92%</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium mt-1">
                        Passed standard parsers
                      </p>
                    </div>

                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        Content Quality
                      </span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">88%</span>
                      </div>
                      <p className="text-[11px] text-indigo-700 font-medium mt-1">
                        High action verb density
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                        Skill Alignment
                      </span>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">76%</span>
                      </div>
                      <p className="text-[11px] text-amber-700 font-medium mt-1">
                        3 project skills unlisted
                      </p>
                    </div>
                  </div>

                  {/* Mock Actionable Recommendation Pill */}
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-amber-950 block">
                          Recommended Action: Add Docker & PostgreSQL to Technical Skills
                        </span>
                        <span className="text-amber-800 text-[11px]">
                          These technologies are proven in your Project bullet points but omitted from your skills overview.
                        </span>
                      </div>
                    </div>
                    <Link
                      href={ctaHref}
                      className="shrink-0 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                    >
                      Try On Your Resume
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW IT WORKS SECTION */}
        {/* ========================================================= */}
        <section id="how-it-works" className="py-20 border-t border-slate-100 bg-slate-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Simple 4-Step Process
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How ResumeAI Works
              </h2>
              <p className="text-sm text-slate-500">
                From PDF upload to deep ATS optimization in seconds.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Upload Resume",
                  desc: "Drop your PDF file into the secure workspace. Supports multi-page documents up to 5MB.",
                  icon: UploadCloud,
                },
                {
                  step: "02",
                  title: "AI Analyzes It",
                  desc: "Deterministic parsers extract structure, while Ollama tests semantic skill alignment and LanguageTool checks grammar.",
                  icon: Cpu,
                },
                {
                  step: "03",
                  title: "Review Your Score",
                  desc: "Inspect your composite ATS score alongside section breakdown cards, matched technologies, and writing hygiene metrics.",
                  icon: TrendingUp,
                },
                {
                  step: "04",
                  title: "Improve Your Resume",
                  desc: "Follow prioritized recommendations to eliminate formatting pitfalls and add missing high-value keywords.",
                  icon: FileCheck2,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-2xl font-black text-slate-200">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FEATURES GRID SECTION */}
        {/* ========================================================= */}
        <section id="features" className="py-20 border-t border-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Core Capabilities
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Engineered for Modern Hiring Systems
              </h2>
              <p className="text-sm text-slate-500">
                Comprehensive evaluation built on real ATS parsing logic and semantic AI verification.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "AI Resume Analysis",
                  desc: "Deep semantic analysis detects whether listed capabilities are legitimately supported by real-world deliverables.",
                  icon: Cpu,
                },
                {
                  title: "ATS Compatibility",
                  desc: "Deterministic section parsing checks how applicant tracking systems read your structure, headings, and contacts.",
                  icon: ShieldCheck,
                },
                {
                  title: "Resume Score",
                  desc: "An objective 0-100 score weighted across document structure, technical skills, project relevance, and writing hygiene.",
                  icon: Award,
                },
                {
                  title: "Skill Alignment",
                  desc: "Compare project technologies against your Technical Skills section to catch forgotten tools and gaps.",
                  icon: Layers,
                },
                {
                  title: "Grammar & Writing Feedback",
                  desc: "Integrated LanguageTool engine uncovers grammatical errors, typographical slips, and passive phrasing penalties.",
                  icon: BookOpen,
                },
                {
                  title: "Actionable Suggestions",
                  desc: "Prioritized recommendations ranked by impact (Critical, High, Medium, Low) to directly boost callback rates.",
                  icon: Zap,
                },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs hover:border-slate-300 transition space-y-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">{feat.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL CALL TO ACTION */}
        {/* ========================================================= */}
        <section className="py-20 border-t border-slate-100 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to improve your resume?
            </h2>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Upload your resume now and get your objective score, detailed ATS breakdown, and prioritized improvement roadmap in less than 30 seconds.
            </p>
            <div className="pt-2">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-500 transition"
              >
                <span>Analyze My Resume</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
