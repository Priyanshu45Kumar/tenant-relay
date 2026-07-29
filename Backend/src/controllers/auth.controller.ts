import { randomInt } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { PendingRegistrationModel } from "../models/pending-registration.model.js";
import { UserModel } from "../models/user.model.js";
import { sendOtpEmail } from "../services/email.service.js";
import { requestRegistrationOtpSchema } from "../validators/auth.validator.js";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

export const requestRegistrationOtp = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validationResult = requestRegistrationOtpSchema.safeParse(
    request.body,
  );

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Invalid registration data",
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  const { name, email, password, tenantName } = validationResult.data;
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await UserModel.exists({
      email: normalizedEmail,
    });

    if (existingUser) {
      response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });

      return;
    }

    const existingPendingRegistration =
      await PendingRegistrationModel.findOne({
        email: normalizedEmail,
      });

    if (existingPendingRegistration) {
      const elapsedMilliseconds =
        Date.now() -
        existingPendingRegistration.lastOtpSentAt.getTime();

      const cooldownMilliseconds =
        OTP_RESEND_COOLDOWN_SECONDS * 1000;

      if (elapsedMilliseconds < cooldownMilliseconds) {
        const remainingSeconds = Math.ceil(
          (cooldownMilliseconds - elapsedMilliseconds) / 1000,
        );

        response.status(429).json({
          success: false,
          message: `Please wait ${remainingSeconds} seconds before requesting another OTP`,
        });

        return;
      }
    }

    const otp = randomInt(100000, 1000000).toString();

    const passwordHash = await bcrypt.hash(password, 12);
    const otpHash = await bcrypt.hash(otp, 10);

    const now = new Date();

    const otpExpiresAt = new Date(
      now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000,
    );

    await PendingRegistrationModel.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        $set: {
          name,
          email: normalizedEmail,
          passwordHash,
          tenantName,
          otpHash,
          otpExpiresAt,
          otpAttempts: 0,
          lastOtpSentAt: now,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendOtpEmail({
        to: normalizedEmail,
        otp,
        purpose: "signup",
      });
    } catch (emailError) {
      await PendingRegistrationModel.deleteOne({
        email: normalizedEmail,
        otpHash,
      });

      console.error("Failed to send signup OTP:", emailError);

      response.status(502).json({
        success: false,
        message: "Unable to send verification email",
      });

      return;
    }

    response.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
      data: {
        email: normalizedEmail,
        expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
        resendAvailableInSeconds: OTP_RESEND_COOLDOWN_SECONDS,
      },
    });
  } catch (error) {
    console.error("Registration OTP request failed:", error);

    response.status(500).json({
      success: false,
      message: "Unable to process registration request",
    });
  }
};