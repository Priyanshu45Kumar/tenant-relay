import { Schema, model, type Types } from "mongoose";

import {
  MEMBERSHIP_ROLES,
  type MembershipRole,
} from "../constants/membership-roles.js";

export interface ITeamInvitation {
  tenantId: Types.ObjectId;
  email: string;
  role: MembershipRole;
  tokenHash: string;
  expiresAt: Date;
  acceptedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const teamInvitationSchema = new Schema<ITeamInvitation>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      required: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    acceptedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const TeamInvitationModel = model<ITeamInvitation>(
  "TeamInvitation",
  teamInvitationSchema,
);