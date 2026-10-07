"use client";

import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function ForgotPasswordForm() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-slate-200/50 sm:p-9 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Password Recovery
          </h1>

          <div className="mt-4 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 text-left text-xs text-amber-900 space-y-2">
            <p className="font-semibold text-amber-950">Notice regarding password recovery:</p>
            <p>
              Automated self-service password reset is currently not exposed by the authentication backend service.
            </p>
            <p>
              If you have forgotten your password, please contact your workspace administrator or register a new test account.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Login
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition py-1"
            >
              Create a new account instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}