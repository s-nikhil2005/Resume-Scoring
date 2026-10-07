import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight">
                Resume<span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
              Commercial-grade resume scoring platform powered by Ollama semantic analysis, deterministic section scoring, and LanguageTool writing diagnostics.
            </p>
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} ResumeAI SaaS. All rights reserved.
            </div>
          </div>

          {/* Links Col 1 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/analyze" className="hover:text-blue-600 transition">
                  Upload & Analyze
                </Link>
              </li>
              <li>
                <Link href="#features" className="hover:text-blue-600 transition">
                  ATS Scoring Engine
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-blue-600 transition">
                  Ollama Pipeline
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-600 transition">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-blue-600 transition">
                  Register Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition">
                  Workspace
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
