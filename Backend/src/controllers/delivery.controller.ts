
import type { Request, Response, NextFunction } from "express";
import { WebhookDeliveryModel } from "../models/webhook-delivery.model.js";

export const getDeliveryStats = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const auth = request.auth;

    if (!auth) {
      response.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const [successful, failed, pending] = await Promise.all([
      WebhookDeliveryModel.countDocuments({
        tenantId: auth.tenantId,
        status: "success",
      }),
      WebhookDeliveryModel.countDocuments({
        tenantId: auth.tenantId,
        status: "failed",
      }),
      WebhookDeliveryModel.countDocuments({
        tenantId: auth.tenantId,
        status: "pending",
      }),
    ]);

    response.status(200).json({
      success: true,
      data: {
        successful,
        failed,
        pending,
        total: successful + failed + pending,
      },
    });
  } catch (error) {
    next(error);
  }
};