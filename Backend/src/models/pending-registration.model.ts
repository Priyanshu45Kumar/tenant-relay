import { Schema, model } from "mongoose";

export interface IPendingRegistration {
  name: string;
  email: string;
  passwordHash: string;
  tenantName: string;
  otpHash: string;
  otpExpiresAt: Date;
  otpAttempts: number;
  lastOtpSentAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const pendingRegistrationSchema = new Schema<IPendingRegistration>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    tenantName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    otpHash: {
      type: String,
      required: true,
      select: false,
    },

    otpExpiresAt: {
      type: Date,
      required: true,
    },

    otpAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastOtpSentAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB automatically removes expired pending registrations.
pendingRegistrationSchema.index(
  {
    otpExpiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  },
);

export const PendingRegistrationModel = model<IPendingRegistration>(
  "PendingRegistration",
  pendingRegistrationSchema,
);