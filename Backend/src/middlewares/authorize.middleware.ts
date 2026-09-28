import type { NextFunction, Request, Response } from "express";

export const authorize = (...roles: string[]) => {
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

    if (request.auth.authType !== "jwt") {
      response.status(403).json({
        success: false,
        message: "Role-based authorization requires JWT authentication",
      });
      return;
    }


    if (!roles.includes(request.auth.role)) {
      response.status(403).json({
        success: false,
        message: "You do not have permission to perform this action",
      });
      return;
    }

    next();
  };
};