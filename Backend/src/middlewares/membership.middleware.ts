import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { MembershipModel } from "../models/membership.model.js";

export const requireTenantMembership = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const { userId, tenantId } = request.auth;

  if (
    !mongoose.isObjectIdOrHexString(userId) ||
    !mongoose.isObjectIdOrHexString(tenantId)
  ) {
    response.status(401).json({
      success: false,
      message: "Invalid access token",
    });

    return;
  }

  try {
    const membership = await MembershipModel.findOne({
      userId,
      tenantId,
    }).select("role");

    if (!membership) {
      response.status(403).json({
        success: false,
        message: "You no longer have access to this workspace",
      });

      return;
    }

    // Replace the potentially stale JWT role with the current database role.
    request.auth.role = membership.role;

    next();
  } catch (error) {
    console.error("Membership verification failed:", error);

    response.status(500).json({
      success: false,
      message: "Unable to verify workspace access",
    });
  }
};