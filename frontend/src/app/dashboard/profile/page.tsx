"use client";

import { useAuth } from "@/hooks/useAuth";
import { Mail, Shield, KeyRound, LogOut, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Account Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your authenticated session and workspace preferences.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xl font-bold shadow-md shadow-blue-500/20">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.email}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3" />
                Active Authenticated Session
              </span>
              <span className="text-xs text-slate-400">User ID: #{user?.id}</span>
            </div>
          </div>
        </div>

        {/* Account Details Form (Read-only as per backend schema) */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              Registered Email Address
            </label>
            <input
              type="text"
              readOnly
              value={user?.email || ""}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none select-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-slate-400" />
              Security & Authentication Token
            </label>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
              <span>Managed via HTTP-only Cookie (`accessToken`)</span>
              <span className="text-xs font-semibold text-emerald-600">Secure (1h TTL)</span>
            </div>
          </div>
        </div>

        {/* Backend Note */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-blue-600" />
            Backend Synchronization
          </p>
          <p>
            Your account profile is synchronized directly with your PostgreSQL database record via `/api/v1/auth/me`.
          </p>
        </div>

        {/* Sign Out CTA */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>
    </div>
  );
}
