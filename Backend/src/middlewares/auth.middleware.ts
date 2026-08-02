import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isMembershipRole } from "../constants/membership-roles.js";

export const authenticate = (
  request: Request,
  response: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = request.headers.authorization;

  if (
    !authorizationHeader ||
    !authorizationHeader.startsWith("Bearer ")
  ) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const accessToken = authorizationHeader.slice(7).trim();

  if (!accessToken) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    console.error("JWT_SECRET is not configured");

    response.status(500).json({
      success: false,
      message: "Authentication service is unavailable",
    });

    return;
  }

  try {
    const decodedToken = jwt.verify(accessToken, jwtSecret, {
      algorithms: ["HS256"],
      issuer: "tenantrelay",
      audience: "tenantrelay-web",
    });

    if (
      typeof decodedToken === "string" ||
      typeof decodedToken.sub !== "string" ||
      typeof decodedToken.tenantId !== "string" ||
      !isMembershipRole(decodedToken.role)
    ) {
      response.status(401).json({
        success: false,
        message: "Invalid access token",
      });

      return;
    }

    request.auth = {
      userId: decodedToken.sub,
      tenantId: decodedToken.tenantId,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      response.status(401).json({
        success: false,
        message: "Access token has expired",
      });

      return;
    }

    response.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};