import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthHeader() {
  return (
    <header className="w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 transition hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Resume<span className="text-blue-600">AI</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          ← Back to home
        </Link>
      </div>
    </header>
  );
}