import { z } from "zod";

export const requestRegistrationOtpSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(60, "Name cannot exceed 60 characters"),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(254, "Email address is too long"),

    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),

    tenantName: z
      .string()
      .trim()
      .min(2, "Workspace name must contain at least 2 characters")
      .max(100, "Workspace name cannot exceed 100 characters"),
  })
  .strict();

  export const verifyRegistrationOtpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Enter a valid email address")
      .max(254, "Email address is too long"),

    otp: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "OTP must contain exactly 6 digits"),
  })
  .strict();