"use client";

import { registerUser, loginUser } from "@/lib/api/auth";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import {
  authSchema,
  type AuthFormData,
} from "@/lib/validations/auth.schema";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const isLogin = mode === "login";

  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const password = useWatch({
    control,
    name: "password",
    defaultValue: "",
  });

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
    {
      label: "One lowercase letter",
      valid: /[a-z]/.test(password),
    },
    {
      label: "One uppercase letter",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "One number",
      valid: /[0-9]/.test(password),
    },
    {
      label: "One special character",
      valid: /[@$!%*?&]/.test(password),
    },
  ];

  const onSubmit = async (data: AuthFormData) => {
    if (mode === "register") {
      try {
        const result = await registerUser(data);

        console.log("Registration successful:", result);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log("Registration failed:", error.response?.data);
        } else {
          console.log("Registration failed:", error);
        }
      }
    }

    if (mode === "login") {
      setLoginError("");

      try {
        const result = await loginUser(data);

        console.log("Login successful:", result);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          setLoginError(
            error.response?.data?.message || "Invalid credentials"
          );
        } else {
          setLoginError("Invalid credentials");
        }
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-stone-100 px-4 pt-8 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h1>

              <p className="mt-2 text-sm text-stone-500">
                {isLogin
                  ? "Login to continue to your account"
                  : "Create your account to get started"}
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  {...register("email")}
                  className={`w-full rounded-lg border bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      : "border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                  }`}
                />

                {errors.email && (
                  <p className="text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-stone-700"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    autoComplete={
                      isLogin ? "current-password" : "new-password"
                    }
                    {...register("password")}
                    className={`w-full rounded-lg border bg-stone-50 px-4 py-3 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 ${
                      errors.password
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 transition hover:text-stone-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 3l18 18"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.58 10.58a2 2 0 102.83 2.83"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9.88 4.24A10.4 10.4 0 0112 4c5 0 8.27 4.5 9 6a13.2 13.2 0 01-3.02 3.78"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.61 6.61C4.49 8.07 3.33 10.08 3 10.5c.73 1.5 4 6 9 6 1.02 0 1.97-.18 2.83-.49"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6z"
                        />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Requirements */}
                {isLogin && password.length > 0 && (
                  <PasswordRequirements
                    requirements={passwordRequirements}
                  />
                )}

                {errors.password && (
                  <p className="text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}

                {/* Login Error */}
                {isLogin && loginError && (
                  <p className="text-sm text-red-600">
                    {loginError}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              {isLogin && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting
                  ? "Please wait..."
                  : isLogin
                    ? "Login"
                    : "Register"}
              </button>
            </form>

            {/* Bottom Navigation */}
            <div className="mt-6 flex items-center justify-center gap-1 text-sm text-stone-500">
              {isLogin ? (
                <>
                  <span>Don&apos;t have an account?</span>

                  <Link
                    href="/register"
                    className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>

                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}