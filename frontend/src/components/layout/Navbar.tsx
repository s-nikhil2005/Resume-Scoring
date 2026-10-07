"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, ArrowRight, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Resume<span className="text-blue-600">AI</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="#features" className="hover:text-slate-900 transition">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-slate-900 transition">
            How It Works
          </Link>
          <Link href="#preview" className="hover:text-slate-900 transition">
            Preview Results
          </Link>
          <Link href="/pricing" className="hover:text-slate-900 transition">
            Pricing
          </Link>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <span>Analyze Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
