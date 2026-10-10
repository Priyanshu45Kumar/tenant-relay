
import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";

import { redisConnection } from "../config/redis.js";
import { connectDatabase } from "../config/database.js";
import { EventModel } from "../models/event.model.js";
import { WebhookEndpointModel } from "../models/webhook-endpoint.model.js";
import { WebhookDeliveryModel } from "../models/webhook-delivery.model.js";
import { generateWebhookSignature } from "../utils/webhook-signature.js";

const startWorker = async () => {
  await connectDatabase();

  console.log("MongoDB connected for webhook worker");

  const webhookWorker = new Worker(
    "webhook-delivery",
    async (job) => {
      console.log("Processing job:", job.id);

      const { eventId, tenantId } = job.data;

      const event = await EventModel.findOne({
        _id: eventId,
        tenantId,
      });

      if (!event) {
        throw new Error("Event not found");
      }

      const webhooks = await WebhookEndpointModel.find({
        tenantId,
        active: true,
      });

      console.log("Active webhooks:", webhooks.length);

      let hasFailures = false;

      for (const webhook of webhooks) {
        // Get or create one delivery record per event and endpoint.
        const delivery = await WebhookDeliveryModel.findOneAndUpdate(
          {
            eventId: event._id,
            webhookEndpointId: webhook._id,
            tenantId,
          },
          {
            $setOnInsert: {
              eventId: event._id,
              webhookEndpointId: webhook._id,
              tenantId,
              status: "pending",
              attempts: 0,
            },
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        // A successful delivery must not be sent again on a job retry.
        if (delivery.status === "success") {
          console.log(
            `Already delivered; skipping ${webhook.url}`,
          );
          continue;
        }

        // Record this attempt before making the HTTP request.
        await WebhookDeliveryModel.updateOne(
          { _id: delivery._id, tenantId },
          {
            $set: { status: "pending" },
            $inc: { attempts: 1 },
            $unset: {
              lastError: "",
              responseStatus: "",
              deliveredAt: "",
            },
          },
        );

        try {
          const webhookPayload = {
            id: event._id.toString(),
            type: event.type,
            payload: event.payload,
            createdAt: event.createdAt,
          };

          const rawPayload = JSON.stringify(webhookPayload);

          const signature = generateWebhookSignature(
            rawPayload,
            webhook.secret,
          );

          const response = await axios.post(
            webhook.url,
            rawPayload,
            {
              headers: {
                "Content-Type": "application/json",
                "X-TenantRelay-Signature": signature,
              },
            },
          );

          await WebhookDeliveryModel.updateOne(
            { _id: delivery._id, tenantId },
            {
              $set: {
                status: "success",
                responseStatus: response.status,
                deliveredAt: new Date(),
              },
              $unset: { lastError: "" },
            },
          );

          console.log(
            `Webhook delivered successfully to ${webhook.url}`,
          );
        } catch (error: unknown) {
          hasFailures = true;

          const message =
            error instanceof Error
              ? error.message
              : "Unknown webhook delivery error";

          const responseStatus = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;

          await WebhookDeliveryModel.updateOne(
            { _id: delivery._id, tenantId },
            {
              $set: {
                status: "failed",
                lastError: message,
                ...(responseStatus !== undefined
                  ? { responseStatus }
                  : {}),
              },
            },
          );

          console.error(
            `Webhook delivery failed for ${webhook.url}:`,
            message,
          );

          // Continue so other endpoints are attempted too.
        }
      }

      // Let BullMQ retry the job if any endpoint failed.
      // Successful endpoints will be skipped on the next attempt.
      if (hasFailures) {
        throw new Error(
          "One or more webhook deliveries failed",
        );
      }
    },
    {
      connection: redisConnection,
    },
  );

  webhookWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
  });

  webhookWorker.on("failed", (job, error) => {
    console.error(
      `Job ${job?.id} failed:`,
      error.message,
    );
  });
};

startWorker().catch((error) => {
  console.error("Failed to start webhook worker:", error);
});