"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const tiers = [
    {
      name: "Starter",
      id: "tier-starter",
      price: "$0",
      description: "Ideal for fresh graduates and early career developers testing their first resume.",
      features: [
        "Up to 3 full resume analyses per month",
        "Deterministic ATS scoring breakdown",
        "Basic LanguageTool grammar evaluation",
        "Client-side history caching",
        "Standard suggestions list",
      ],
      cta: "Get Started Free",
      href: "/register",
      featured: false,
    },
    {
      name: "Professional",
      id: "tier-professional",
      price: "$19",
      period: "/month",
      description: "Everything you need to systematically optimize resumes for competitive tech roles.",
      features: [
        "Unlimited resume uploads & revisions",
        "Deep Ollama semantic skill verification",
        "Full LanguageTool writing hygiene diagnostics",
        "Project-to-skill alignment & gap analysis",
        "High-priority actionable recommendations",
        "PDF export & comparison history",
      ],
      cta: "Start 7-Day Free Trial",
      href: "/register",
      featured: true,
    },
    {
      name: "Career Coach & Teams",
      id: "tier-enterprise",
      price: "$79",
      period: "/month",
      description: "For career advisors, universities, and recruitment consultancies evaluating multiple candidates.",
      features: [
        "Everything in Professional",
        "Batch resume processing capabilities",
        "Candidate comparative scoreboards",
        "Custom ATS scoring weight profiles",
        "Dedicated API access & priority support",
      ],
      cta: "Contact Sales",
      href: "/register",
      featured: false,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Transparent Pricing
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Simple plans for serious candidates
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Choose the right tier to maximize your callback rates and prepare for your next big career step.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl p-8 transition ${
                  tier.featured
                    ? "border-2 border-blue-600 bg-white shadow-xl shadow-blue-500/10 ring-1 ring-blue-600"
                    : "border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 shadow-xs"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-slate-900">{tier.name}</h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed min-h-[36px]">
                    {tier.description}
                  </p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900">{tier.price}</span>
                    {tier.period && (
                      <span className="text-xs font-semibold text-slate-400">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  <ul className="mt-8 space-y-3 text-xs text-slate-600">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                  <Link
                    href={tier.href}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition ${
                      tier.featured
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
