import { Request, Response } from "express";
import { generateApiKey } from "../utils/api-key.js";
import { ApiKeyModel } from "../models/apiKey.model.js";
// Extend the Express Request type so TypeScript recognizes request.auth


export const createApiKey = async (
  request: Request,
  response: Response
): Promise<void> => {
  try {
    // 1. Validate Authentication & Tenant Context
    const tenantId = request.auth?.tenantId;
    if (!tenantId) {
      response.status(401).json({ error: "Unauthorized: Missing tenant context" });
      return;
    }

    // 2. Validate Request Body
    const { name } = request.body;
    if (!name || typeof name !== "string") {
      response.status(400).json({ error: "A valid 'name' for the API key is required" });
      return;
    }

    // 3. Generate Key Data (Using our updated utility)
    const { apiKey, keyHash, prefix } = generateApiKey("live");

    // 4. Save to Database
    const newKeyRecord = await ApiKeyModel.create({
      tenantId,
      name,
      keyHash,
      prefix,
      active: true,
    });

    console.log("Api Key Saved", newKeyRecord);

    // 5. Return the raw key to the client (Show Once!)
    response.status(201).json({
      message: "API key generated successfully. Please copy it now, it will not be shown again.",
      apiKey, // This is the ONLY time the raw key is sent back
      data: {
        id: newKeyRecord._id,
        name: newKeyRecord.name,
        prefix: newKeyRecord.prefix,
        createdAt: newKeyRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    response.status(500).json({ error: "Internal server error while generating API key" });
  }
};

export const getApiKeys = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const tenantId = request.auth?.tenantId;

    if (!tenantId) {
      response.status(401).json({
        success: false,
        message: "Unauthorized: Missing tenant context",
      });
      return;
    }

    const apiKeys = await ApiKeyModel.find({
      tenantId,
    })
      .select("name prefix active createdAt")
      .sort({ createdAt: -1 });

    response.status(200).json({
      success: true,
      data: apiKeys.map((key) => ({
        id: key._id,
        name: key.name,
        prefix: key.prefix,
        active: key.active,
        createdAt: key.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching API keys:", error);

    response.status(500).json({
      success: false,
      message: "Internal server error while fetching API keys",
    });
  }
};

export const revokeApiKey = async (
  request: Request,
  response: Response,
): Promise<void> => {
  try {
    const tenantId = request.auth?.tenantId;

    if (!tenantId) {
      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const { id } = request.params;

    const apiKey = await ApiKeyModel.findOneAndUpdate(
      {
        _id: id,
        tenantId,
        active: true,
      },
      {
        $set: {
          active: false,
        },
      },
      {
        new: true,
      },
    );

    if (!apiKey) {
      response.status(404).json({
        success: false,
        message: "API key not found",
      });
      return;
    }

    response.status(200).json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("Error revoking API key:", error);

    response.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};