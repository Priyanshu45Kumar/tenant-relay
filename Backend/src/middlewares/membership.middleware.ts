import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { MembershipModel } from "../models/membership.model.js";
import type { MembershipRole } from "../constants/membership-roles.js";

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
  if (request.auth.authType !== "jwt") {
      response.status(403).json({
        success: false,
        message: "Role-based authorization requires JWT authentication",
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

export const requireRole = (...allowedRoles: MembershipRole[]) => {
  return (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    if (!request.auth) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (
      request.auth.authType !== "jwt" ||
      !request.auth.userId
    ) {
      response.status(403).json({
        success: false,
        message: "JWT authentication is required",
      });
      return;
    }

    const role = request.auth.role;

if (
  !role ||
  !allowedRoles.some((allowedRole) => allowedRole === role)
) {
  response.status(403).json({
    success: false,
    message: "You do not have permission to perform this action",
  });
  return;
}

    next();
  };
};