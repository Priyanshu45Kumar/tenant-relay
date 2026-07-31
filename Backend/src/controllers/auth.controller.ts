import { randomBytes, randomInt } from "node:crypto";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { MembershipModel } from "../models/membership.model.js";
import { PendingRegistrationModel } from "../models/pending-registration.model.js";
import { TenantModel } from "../models/tenant.model.js";
import { UserModel } from "../models/user.model.js";
import { sendOtpEmail } from "../services/email.service.js";
import { createSlug } from "../utils/create-slug.js";
import {
  requestRegistrationOtpSchema,
  verifyRegistrationOtpSchema,
} from "../validators/auth.validator.js";
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

const MAX_OTP_ATTEMPTS = 5;
const ACCESS_TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

const generateUniqueTenantSlug = async (
  tenantName: string,
): Promise<string> => {
  const baseSlug = createSlug(tenantName);
  let slug = baseSlug;

  while (await TenantModel.exists({ slug })) {
    const suffix = randomBytes(3).toString("hex");
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
};

const createAccessToken = (
  userId: string,
  tenantId: string,
  role: string,
): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      tenantId,
      role,
    },
    jwtSecret,
    {
      subject: userId,
      expiresIn: ACCESS_TOKEN_EXPIRY_SECONDS,
      issuer: "tenantrelay",
      audience: "tenantrelay-web",
    },
  );
};

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

export const verifyRegistrationOtp = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validationResult = verifyRegistrationOtpSchema.safeParse(
    request.body,
  );

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Invalid verification data",
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  const { email, otp } = validationResult.data;
  const normalizedEmail = email.toLowerCase();

  let session: mongoose.ClientSession | null = null;

  try {
    const pendingRegistration =
      await PendingRegistrationModel.findOne({
        email: normalizedEmail,
      }).select("+passwordHash +otpHash");

    if (!pendingRegistration) {
      response.status(404).json({
        success: false,
        message: "Registration request not found. Request a new OTP",
      });

      return;
    }

    if (pendingRegistration.otpExpiresAt.getTime() <= Date.now()) {
      await PendingRegistrationModel.deleteOne({
        _id: pendingRegistration._id,
      });

      response.status(410).json({
        success: false,
        message: "OTP has expired. Request a new OTP",
      });

      return;
    }

    if (pendingRegistration.otpAttempts >= MAX_OTP_ATTEMPTS) {
      await PendingRegistrationModel.deleteOne({
        _id: pendingRegistration._id,
      });

      response.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Request a new OTP",
      });

      return;
    }

    const isOtpValid = await bcrypt.compare(
      otp,
      pendingRegistration.otpHash,
    );

    if (!isOtpValid) {
      const nextAttemptCount = pendingRegistration.otpAttempts + 1;
      const remainingAttempts = MAX_OTP_ATTEMPTS - nextAttemptCount;

      if (nextAttemptCount >= MAX_OTP_ATTEMPTS) {
        await PendingRegistrationModel.deleteOne({
          _id: pendingRegistration._id,
        });

        response.status(429).json({
          success: false,
          message: "Too many incorrect attempts. Request a new OTP",
        });

        return;
      }

      await PendingRegistrationModel.updateOne(
        {
          _id: pendingRegistration._id,
        },
        {
          $inc: {
            otpAttempts: 1,
          },
        },
      );

      response.status(400).json({
        success: false,
        message: "Incorrect OTP",
        data: {
          remainingAttempts,
        },
      });

      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const tenantSlug = await generateUniqueTenantSlug(
      pendingRegistration.tenantName,
    );

    const transactionSession = await mongoose.startSession();
    session = transactionSession;

    let createdUserId = "";
    let createdTenantId = "";

    await transactionSession.withTransaction(async () => {
      const existingUser = await UserModel.exists({
        email: normalizedEmail,
      }).session(transactionSession);

      if (existingUser) {
        throw new Error("ACCOUNT_ALREADY_EXISTS");
      }

      const user = new UserModel({
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        passwordHash: pendingRegistration.passwordHash,
      });

      await user.save({
        session: transactionSession,
      });

      const tenant = new TenantModel({
        name: pendingRegistration.tenantName,
        slug: tenantSlug,
        createdBy: user._id,
      });

      await tenant.save({
        session: transactionSession,
      });

      const membership = new MembershipModel({
        tenantId: tenant._id,
        userId: user._id,
        role: "owner",
      });

      await membership.save({
        session: transactionSession,
      });

      const deletionResult =
        await PendingRegistrationModel.deleteOne(
          {
            _id: pendingRegistration._id,
            otpHash: pendingRegistration.otpHash,
          },
          {
            session: transactionSession,
          },
        );

      if (deletionResult.deletedCount !== 1) {
        throw new Error("REGISTRATION_CHANGED");
      }

      createdUserId = user._id.toString();
      createdTenantId = tenant._id.toString();
    });

    if (!createdUserId || !createdTenantId) {
      throw new Error("Registration transaction failed");
    }

    const accessToken = createAccessToken(
      createdUserId,
      createdTenantId,
      "owner",
    );

    response.status(201).json({
      success: true,
      message: "Registration completed successfully",
      data: {
        accessToken,
        expiresInSeconds: ACCESS_TOKEN_EXPIRY_SECONDS,
        user: {
          id: createdUserId,
          name: pendingRegistration.name,
          email: pendingRegistration.email,
        },
        tenant: {
          id: createdTenantId,
          name: pendingRegistration.tenantName,
          slug: tenantSlug,
        },
        role: "owner",
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "ACCOUNT_ALREADY_EXISTS"
    ) {
      response.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });

      return;
    }

    if (
      error instanceof Error &&
      error.message === "REGISTRATION_CHANGED"
    ) {
      response.status(409).json({
        success: false,
        message: "Registration data changed. Request a new OTP",
      });

      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      response.status(409).json({
        success: false,
        message: "Registration conflict. Please try again",
      });

      return;
    }

    console.error("Registration OTP verification failed:", error);

    response.status(500).json({
      success: false,
      message: "Unable to complete registration",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};