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

export const deactivateWebhookEndpoint = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const { tenantId } = request.auth;
  const { id } = request.params;

  try {
    const webhookEndpoint =
      await WebhookEndpointModel.findOneAndUpdate(
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

    if (!webhookEndpoint) {
      response.status(404).json({
        success: false,
        message: "Active webhook endpoint not found",
      });

      return;
    }

    response.status(200).json({
      success: true,
      message: "Webhook endpoint deactivated successfully",
      data: {
        id: webhookEndpoint._id.toString(),
        name: webhookEndpoint.name,
        url: webhookEndpoint.url,
        active: webhookEndpoint.active,
      },
    });
  } catch (error) {
    console.error(
      "Failed to deactivate webhook endpoint:",
      error,
    );

    response.status(500).json({
      success: false,
      message: "Unable to deactivate webhook endpoint",
    });
  }
};

export const getWebhookEndpoints = async (
  request: Request,
  response: Response,
): Promise<void> => {
  if (!request.auth) {
    response.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return;
  }

  const { tenantId } = request.auth;

  try {
    const webhooks = await WebhookEndpointModel.find({
      tenantId,
    }).sort({
      createdAt: -1,
    });

    response.status(200).json({
      success: true,
      data: webhooks.map((webhook) => ({
        id: webhook._id.toString(),
        name: webhook.name,
        url: webhook.url,
        active: webhook.active,
        createdAt: webhook.createdAt,
        updatedAt: webhook.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Failed to fetch webhook endpoints:", error);

    response.status(500).json({
      success: false,
      message: "Unable to fetch webhook endpoints",
    });
  }
};