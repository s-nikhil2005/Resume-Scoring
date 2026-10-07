"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  FileUp,
  History,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Analyze Resume",
      href: "/dashboard/analyze",
      icon: FileUp,
      current: pathname === "/dashboard/analyze",
    },
    {
      name: "Analysis History",
      href: "/dashboard/history",
      icon: History,
      current: pathname.startsWith("/dashboard/history") || pathname.startsWith("/dashboard/results"),
    },
    {
      name: "Account Profile",
      href: "/dashboard/profile",
      icon: User,
      current: pathname === "/dashboard/profile",
    },
  ];

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    await logout();
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-slate-200/80 px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900"
          onClick={onCloseMobile}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Resume<span className="text-blue-600">AI</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-4 py-6">
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  item.current
                    ? "bg-blue-50 text-blue-700 font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition ${
                      item.current ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.current && (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          {/* Quick Engine Status */}
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>AI Engine Connected</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Ollama + LanguageTool Active
            </p>
          </div>

          {/* User Email Pill */}
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {user?.email || "User"}
              </p>
              <p className="text-[10px] text-slate-400">Pro Plan</p>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
