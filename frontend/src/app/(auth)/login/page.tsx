import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}