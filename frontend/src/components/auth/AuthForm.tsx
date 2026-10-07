"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { extractErrorMessage } from "@/lib/api/axios";
import {
  loginSchema,
  registerSchema,
  type LoginFormData,
  type RegisterFormData,
} from "@/lib/validations/auth.schema";
import PasswordRequirements from "@/components/auth/PasswordRequirements";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { login, register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    mode: "onTouched",
  });

  const passwordValue = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordRequirements = [
    {
      label: "At least 6 characters",
      valid: (passwordValue || "").length >= 6,
    },
    {
      label: "One uppercase letter (A-Z)",
      valid: /[A-Z]/.test(passwordValue || ""),
    },
    {
      label: "One lowercase letter (a-z)",
      valid: /[a-z]/.test(passwordValue || ""),
    },
    {
      label: "One number (0-9)",
      valid: /[0-9]/.test(passwordValue || ""),
    },
    {
      label: "One special character (@$!%*?&)",
      valid: /[@$!%*?&]/.test(passwordValue || ""),
    },
  ];

  const onSubmit = async (data: LoginFormData | RegisterFormData) => {
    setServerError("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password });
        setSuccessMessage("Authentication successful. Redirecting to dashboard...");
        router.push(redirectTarget);
      } else {
        await authRegister({ email: data.email, password: data.password });
        setSuccessMessage("Account created successfully! Redirecting...");
        router.push("/dashboard");
      }
    } catch (err) {
      const msg = extractErrorMessage(
        err,
        isLogin ? "Failed to log in. Please check your credentials." : "Failed to create account. Please try again."
      );
      setServerError(msg);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] w-full items-center justify-center bg-slate-50 px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-lg shadow-slate-200/50 sm:p-9">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <span className="font-bold text-lg">R</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {isLogin ? "Welcome Back" : "Create SaaS Account"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isLogin
                ? "Enter your credentials to access your resume analysis dashboard"
                : "Analyze your resume with AI and boost your interview calls"}
            </p>
          </div>

          {/* Feedback alerts */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-sm text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 font-medium">{serverError}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-sm text-emerald-800">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700"
              >
                Work or Personal Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
                className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                  errors.email
                    ? "border-rose-400 ring-2 ring-rose-500/10 focus:border-rose-500"
                    : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                }`}
              />
              {errors.email && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                {isLogin && (
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "••••••••" : "Create a strong password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  {...register("password")}
                  className={`w-full rounded-xl border bg-slate-50/50 px-4 py-2.5 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white ${
                    errors.password
                      ? "border-rose-400 ring-2 ring-rose-500/10 focus:border-rose-500"
                    : "border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-xs font-medium text-rose-600">
                  {errors.password.message}
                </p>
              )}

              {/* Password Requirements Checklist (Register only) */}
              {!isLogin && (passwordValue || "").length > 0 && (
                <div className="mt-2 rounded-lg bg-slate-50 p-3 border border-slate-200/60">
                  <p className="text-xs font-semibold text-slate-600 mb-1">
                    Password requirements:
                  </p>
                  <PasswordRequirements requirements={passwordRequirements} />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <span>{isLogin ? "Sign In to Dashboard" : "Create Free Account"}</span>
              )}
            </button>
          </form>

          {/* Bottom Switch */}
          <div className="mt-7 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            {isLogin ? (
              <>
                <span>New to Resume Analyzer? </span>
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Create an account
                </Link>
              </>
            ) : (
              <>
                <span>Already have an account? </span>
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}