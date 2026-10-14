
import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { WebhookDeliveryModel } from "../models/webhook-delivery.model.js";
import { EventModel } from "../models/event.model.js";
import { WebhookEndpointModel } from "../models/webhook-endpoint.model.js";
import { webhookDeliveryQueue } from "../queues/webhook.queue.js";


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

export const replayFailedDelivery = async (
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

    const deliveryId = request.params.deliveryId;

if (
  typeof deliveryId !== "string" ||
  !Types.ObjectId.isValid(deliveryId)
) {
  response.status(400).json({
    success: false,
    message: "Invalid delivery ID",
  });
  return;
}

    if (!Types.ObjectId.isValid(deliveryId)) {
      response.status(400).json({
        success: false,
        message: "Invalid delivery ID",
      });
      return;
    }

    const delivery = await WebhookDeliveryModel.findOne({
      _id: deliveryId,
      tenantId: auth.tenantId,
      status: "failed",
    });

    if (!delivery) {
      response.status(404).json({
        success: false,
        message: "Failed delivery not found",
      });
      return;
    }

    const [event, webhook] = await Promise.all([
      EventModel.findOne({
        _id: delivery.eventId,
        tenantId: auth.tenantId,
      }),
      WebhookEndpointModel.findOne({
        _id: delivery.webhookEndpointId,
        tenantId: auth.tenantId,
      }),
    ]);

    if (!event || !webhook) {
      response.status(409).json({
        success: false,
        message: "Event or webhook endpoint no longer exists",
      });
      return;
    }

    if (!webhook.active) {
      response.status(409).json({
        success: false,
        message: "Activate the webhook before replaying",
      });
      return;
    }

    await webhookDeliveryQueue.add(
      "replay-delivery",
      {
        eventId: delivery.eventId.toString(),
        tenantId: auth.tenantId.toString(),
        deliveryId: delivery._id.toString(),
      },
      {
        attempts: 1,
        jobId: `replay-${delivery._id.toString()}-${Date.now()}`,
      },
    );

    response.status(202).json({
      success: true,
      message: "Delivery replay queued",
    });
  } catch (error) {
    next(error);
  }
};


export const getDeliveries = async (
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

    const rawStatus = request.query.status;

    if (rawStatus !== "success" && rawStatus !== "failed") {
      response.status(400).json({
        success: false,
        message: "Status must be success or failed",
      });
      return;
    }

    const status: "success" | "failed" = rawStatus;

    const page = Math.max(
      1,
      Number.parseInt(String(request.query.page ?? "1"), 10) || 1,
    );

    const limit = Math.min(
      50,
      Math.max(
        1,
        Number.parseInt(String(request.query.limit ?? "10"), 10) || 10,
      ),
    );

    const filter = {
      tenantId: auth.tenantId,
      status,
    };

    const [deliveries, total] = await Promise.all([
      WebhookDeliveryModel.find(filter)
        .populate("eventId", "type createdAt")
        .populate("webhookEndpointId", "name url")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      WebhookDeliveryModel.countDocuments(filter),
    ]);

    response.status(200).json({
      success: true,
      data: deliveries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

