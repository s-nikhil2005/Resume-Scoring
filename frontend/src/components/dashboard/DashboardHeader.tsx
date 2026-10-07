"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Menu, Plus } from "lucide-react";

interface DashboardHeaderProps {
  onOpenMobileSidebar: () => void;
}

export default function DashboardHeader({ onOpenMobileSidebar }: DashboardHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Mobile Menu trigger & Welcome */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-slate-900">
            Welcome back, <span className="text-blue-600">{user?.email?.split("@")[0] || "there"}</span>
          </h2>
          <p className="text-xs text-slate-500">
            Ready to review and optimize your career assets
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/analyze"
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Analysis</span>
        </Link>

        {/* User Pill */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 sm:px-3 hover:bg-slate-100 transition"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
            {user?.email}
          </span>
        </Link>
      </div>
    </header>
  );
}
