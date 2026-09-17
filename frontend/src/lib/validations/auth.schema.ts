import { z } from "zod";

export const authSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(8, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must contain only numbers"),
});

export type AuthFormData = z.infer<typeof authSchema>;

export type ForgotPasswordFormData =
  z.infer<typeof forgotPasswordSchema>;

export type OtpFormData = z.infer<typeof otpSchema>;