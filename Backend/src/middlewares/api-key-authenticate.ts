
import { Request, Response, NextFunction } from "express";
import { hashApiKey } from "../utils/api-key.js";
import { ApiKeyModel } from "../models/apiKey.model.js";

export const authenticateApiKey = async (
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      response.status(401).json({
        error: "API key is required",
      });
      return;
    }

    const [scheme, apiKey] = authorization.split(" ");

    if (scheme !== "Bearer" || !apiKey) {
      response.status(401).json({
        error: "Invalid authorization format",
      });
      return;
    }

    const keyHash = hashApiKey(apiKey);

    const apiKeyRecord = await ApiKeyModel.findOne({
      keyHash,
      active: true,
    }).select("tenantId");

    if (!apiKeyRecord) {
      response.status(401).json({
        error: "Invalid or inactive API key",
      });
      return;
    }

    request.auth = {
        authType:"api-key",
      tenantId: apiKeyRecord.tenantId.toString(),
    };

    next();
  } catch (error) {
    console.error("API key authentication error:", error);

    response.status(500).json({
      error: "Internal server error",
    });
  }
};

