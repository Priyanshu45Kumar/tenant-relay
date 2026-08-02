import { Schema, model, type Types } from "mongoose";
import {
  MEMBERSHIP_ROLES,
  type MembershipRole,
} from "../constants/membership-roles.js";




export interface IMembership {
  tenantId: Types.ObjectId;
  userId: Types.ObjectId;
  role: MembershipRole;
  createdAt?: Date;
  updatedAt?: Date;
}

const membershipSchema = new Schema<IMembership>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: MEMBERSHIP_ROLES,
      default: "viewer",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

membershipSchema.index(
  {
    tenantId: 1,
    userId: 1,
  },
  {
    unique: true,
  },
);

export const MembershipModel = model<IMembership>(
  "Membership",
  membershipSchema,
);