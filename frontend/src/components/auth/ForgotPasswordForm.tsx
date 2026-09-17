"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  forgotPasswordSchema,
  otpSchema,
  type ForgotPasswordFormData,
  type OtpFormData,
} from "@/lib/validations/auth.schema";

export default function ForgotPasswordForm() {
  const [verificationSent, setVerificationSent] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [isVerified, setIsVerified] = useState(false);

  // ----------------------------------------
  // Email Form
  // ----------------------------------------

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    getValues,
    formState: {
      errors: emailErrors,
      isSubmitting: isSendingCode,
    },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // ----------------------------------------
  // OTP Form
  // ----------------------------------------

  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    reset: resetOtp,
    formState: {
      errors: otpErrors,
      isSubmitting: isVerifying,
    },
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
  });

  // ----------------------------------------
  // Countdown Timer
  // ----------------------------------------

  useEffect(() => {
    if (!verificationSent || isVerified || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previousTime) => previousTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [verificationSent, isVerified, timeLeft]);

  // ----------------------------------------
  // Send / Resend Verification Code
  // ----------------------------------------

  const onSendCode = async (data: ForgotPasswordFormData) => {
    console.log("Email:", data.email);

    // Backend API will be connected here later.
    //
    // Example:
    // await fetch("/api/forgot-password", {
    //   method: "POST",
    //   body: JSON.stringify(data),
    // });

    setVerificationSent(true);
    setIsVerified(false);
    setTimeLeft(120);

    // Clear previous OTP when a new code is sent.
    resetOtp();
  };

  // ----------------------------------------
  // Verify OTP
  // ----------------------------------------

  const onVerifyCode = async (data: OtpFormData) => {
    console.log("OTP:", data.otp);

    // Backend OTP verification will be connected here later.

    setIsVerified(true);
  };

  // ----------------------------------------
  // Resend Code
  // ----------------------------------------

  const handleResendCode = async () => {
    const email = getValues("email");

    if (!email) {
      return;
    }

    console.log("Resending OTP to:", email);

    // Backend resend OTP API will be connected here later.

    setTimeLeft(120);
    setIsVerified(false);
    resetOtp();
  };

  // ----------------------------------------
  // Timer Formatting
  // ----------------------------------------

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full bg-stone-100 px-4 pt-8 sm:px-6">
      <div className="mx-auto w-full max-w-md">

        {/* Main Card */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xl sm:p-8">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Forgot Password?
            </h1>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
              Enter your email address and we&apos;ll send you a
              verification code to reset your password.
            </p>
          </div>

          {/* -------------------------------- */}
          {/* Email Section */}
          {/* -------------------------------- */}

          <form
            onSubmit={handleEmailSubmit(onSendCode)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-stone-700"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                disabled={verificationSent}
                {...registerEmail("email")}
                className={`w-full rounded-lg border bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-500 ${
                  emailErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                }`}
              />

              {emailErrors.email && (
                <p className="text-sm text-red-600">
                  {emailErrors.email.message}
                </p>
              )}
            </div>

            {!verificationSent && (
              <button
                type="submit"
                disabled={isSendingCode}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingCode
                  ? "Sending..."
                  : "Send Verification Code"}
              </button>
            )}
          </form>

          {/* -------------------------------- */}
          {/* OTP Section */}
          {/* -------------------------------- */}

          {verificationSent && !isVerified && (
            <div className="mt-6 rounded-xl border border-stone-200 bg-stone-50 p-5">

              {/* OTP Header */}
              <div className="mb-5">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-semibold text-stone-900">
                    Verify your email
                  </h2>

                  <span
                    className={`shrink-0 text-sm font-semibold ${
                      timeLeft === 0
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {timeLeft > 0
                      ? formattedTime
                      : "Expired"}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-stone-500">
                  Enter the 6-digit code we sent to your email.
                </p>
              </div>

              {/* OTP Form */}
              <form
                onSubmit={handleOtpSubmit(onVerifyCode)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-stone-700"
                  >
                    Verification code
                  </label>

                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    autoComplete="one-time-code"
                    disabled={timeLeft === 0}
                    {...registerOtp("otp")}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-center text-lg font-semibold tracking-[0.35em] text-stone-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-400 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:opacity-60 ${
                      otpErrors.otp
                        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                        : "border-stone-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    }`}
                  />

                  {otpErrors.otp && (
                    <p className="text-sm text-red-600">
                      {otpErrors.otp.message}
                    </p>
                  )}
                </div>

                {/* Verify Button */}
                <button
                  type="submit"
                  disabled={isVerifying || timeLeft === 0}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isVerifying
                    ? "Verifying..."
                    : "Verify Code"}
                </button>
              </form>

              {/* -------------------------------- */}
              {/* Resend Section */}
              {/* -------------------------------- */}

              <div className="mt-5 border-t border-stone-200 pt-4 text-center">
                {timeLeft > 0 ? (
                  <div className="text-sm">
                    <span className="text-stone-500">
                      Didn&apos;t receive the code?
                    </span>

                    <span className="ml-1 font-medium text-stone-400">
                      Resend available in {formattedTime}
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2 text-sm text-stone-500">
                      Didn&apos;t receive the code?
                    </p>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      Resend Verification Code
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------- */}
          {/* Verification Success */}
          {/* -------------------------------- */}

          {isVerified && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <span className="text-lg text-emerald-600">
                  ✓
                </span>
              </div>

              <h2 className="text-sm font-semibold text-emerald-800">
                Email verified successfully
              </h2>

              <p className="mt-1 text-sm text-emerald-700">
                You can now reset your password.
              </p>
            </div>
          )}

          {/* -------------------------------- */}
          {/* Back to Login */}
          {/* -------------------------------- */}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              ← Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}