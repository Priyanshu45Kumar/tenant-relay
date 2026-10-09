
import type { NextFunction, Request, Response } from "express";
import type { MembershipRole } from "../constants/membership-roles.js";

export const authorize = (...roles: MembershipRole[]) => {
  return (
    request: Request,
    response: Response,
    next: NextFunction,
  ): void => {
    // 1. Check authentication
    if (!request.auth) {
      response.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // 2. Role-based authorization requires JWT authentication
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

    // 3. Check the user's current workspace role
    const userRole = request.auth.role;

    if (
      !userRole ||
      !roles.some((role) => role === userRole)
    ) {
      response.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    // 4. Permission granted
    next();
  };
};