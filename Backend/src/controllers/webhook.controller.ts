import { randomBytes } from "node:crypto";
import type { Request, Response } from "express";

import { WebhookEndpointModel } from "../models/webhook-endpoint.model.js";
import { createWebhookEndpointSchema } from "../validators/webhook.validator.js";

export const createWebhookEndpoint = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validationResult = createWebhookEndpointSchema.safeParse(
    request.body,
  );

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Invalid webhook endpoint data",
      errors: validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const { name, url } = validationResult.data;
  const { tenantId } = request.auth;

  try {
    const secret = randomBytes(32).toString("hex");

    const webhookEndpoint = await WebhookEndpointModel.create({
      tenantId,
      name,
      url,
      secret,
    });

    response.status(201).json({
      success: true,
      message: "Webhook endpoint created successfully",
      data: {
        id: webhookEndpoint._id.toString(),
        name: webhookEndpoint.name,
        url: webhookEndpoint.url,
        secret: webhookEndpoint.secret,
        active: webhookEndpoint.active,
        createdAt: webhookEndpoint.createdAt,
        updatedAt: webhookEndpoint.updatedAt,
      },
    });
  } catch (error) {
    console.error("Failed to create webhook endpoint:", error);

    response.status(500).json({
      success: false,
      message: "Unable to create webhook endpoint",
    });
  }
};