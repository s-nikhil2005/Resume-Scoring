"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { X } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-slate-50/50">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Backdrop & Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <div className="absolute top-3 right-3 z-50">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-lg p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col md:pl-64">
          <DashboardHeader onOpenMobileSidebar={() => setMobileSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
