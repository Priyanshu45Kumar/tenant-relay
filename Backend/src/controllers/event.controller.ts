
import type { Request, Response } from "express";

import { EventModel } from "../models/event.model.js";
import { createEventSchema } from "../validators/event.validator.js";
import {webhookDeliveryQueue} from "../queues/webhook.queue.js"

export const createEvent = async (
  request: Request,
  response: Response,
): Promise<void> => {
  const validationResult = createEventSchema.safeParse(
    request.body,
  );

  if (!validationResult.success) {
    response.status(400).json({
      success: false,
      message: "Invalid event data",
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

  const { tenantId } = request.auth;
  const { type, payload } = validationResult.data;

  try {
        console.log("Creating Event...")
    const event = await EventModel.create({
      tenantId,
      type,
      payload,
    });

    console.log("Event created in MongoDB:", event._id.toString());
    await webhookDeliveryQueue.add("deliver-webhook", {
    eventId: event._id.toString(),
    tenantId: tenantId.toString(),
  });
  console.log("Job added to webhook queue");
    response.status(201).json({
      success: true,
      message: "Event created successfully",
      data: {
        id: event._id.toString(),
        type: event.type,
        payload: event.payload,
        createdAt: event.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create event:", error);

    response.status(500).json({
      success: false,
      message: "Unable to create event",
    });
  }
};

export const getEvents = async (
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
    const events = await EventModel.find({
      tenantId,
    }).sort({
      createdAt: -1,
    });

    response.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Failed to fetch events:", error);

    response.status(500).json({
      success: false,
      message: "Unable to fetch events",
    });
  }
};
