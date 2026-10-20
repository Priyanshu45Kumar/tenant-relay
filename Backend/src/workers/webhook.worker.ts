

import { Worker } from "bullmq";
import axios from "axios";

import { redisConnection } from "../config/redis.js";
import { EventModel } from "../models/event.model.js";
import { WebhookEndpointModel } from "../models/webhook-endpoint.model.js";
import {
  WebhookDeliveryModel,
  type IWebhookDelivery,
} from "../models/webhook-delivery.model.js";
import { generateWebhookSignature } from "../utils/webhook-signature.js";

type WebhookJobData = {
  eventId: string;
  tenantId: string;
  deliveryId?: string;
};

export const startWebhookWorker = async () => {
  const webhookWorker = new Worker<WebhookJobData>(
    "webhook-delivery",
    async (job) => {
      console.log("Processing job:", job.id);

      const { eventId, tenantId, deliveryId } = job.data;

      const event = await EventModel.findOne({
        _id: eventId,
        tenantId,
      });

      if (!event) {
        throw new Error("Event not found");
      }

      let replayDelivery: IWebhookDelivery | null = null;
      let webhooks;

      if (deliveryId) {
        replayDelivery = await WebhookDeliveryModel.findOne({
          _id: deliveryId,
          eventId,
          tenantId,
          status: "failed",
        });

        if (!replayDelivery) {
          throw new Error(
            "Failed delivery not found or no longer eligible for replay",
          );
        }

        const webhook = await WebhookEndpointModel.findOne({
          _id: replayDelivery.webhookEndpointId,
          tenantId,
          active: true,
        });

        if (!webhook) {
          throw new Error("Webhook endpoint not found or inactive");
        }

        webhooks = [webhook];
      } else {
        webhooks = await WebhookEndpointModel.find({
          tenantId,
          active: true,
        });
      }

      console.log("Webhooks to process:", webhooks.length);

      let hasFailures = false;

      for (const webhook of webhooks) {
        let delivery: IWebhookDelivery | null;

        if (deliveryId) {
          delivery = replayDelivery;
        } else {
          delivery = await WebhookDeliveryModel.findOneAndUpdate(
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
              returnDocument: "after",
              setDefaultsOnInsert: true,
            },
          );
        }

        if (!delivery) {
          throw new Error("Unable to create or load delivery record");
        }

        if (delivery.status === "success") {
          console.log(`Already delivered; skipping ${webhook.url}`);
          continue;
        }

        await WebhookDeliveryModel.updateOne(
          {
            _id: delivery._id,
            tenantId,
          },
          {
            $set: {
              status: "pending",
            },
            $inc: {
              attempts: 1,
            },
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

          const result = await axios.post(
            webhook.url,
            rawPayload,
            {
              timeout: 10000,
              headers: {
                "Content-Type": "application/json",
                "X-TenantRelay-Signature": signature,
              },
            },
          );

          await WebhookDeliveryModel.updateOne(
            {
              _id: delivery._id,
              tenantId,
            },
            {
              $set: {
                status: "success",
                responseStatus: result.status,
                deliveredAt: new Date(),
              },
              $unset: {
                lastError: "",
              },
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
            {
              _id: delivery._id,
              tenantId,
            },
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
        }
      }

      if (hasFailures) {
        throw new Error("One or more webhook deliveries failed");
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
    console.error(`Job ${job?.id} failed:`, error.message);
  });

  webhookWorker.on("error", (error) => {
    console.error("Webhook worker error:", error);
  });

  await webhookWorker.waitUntilReady();

  console.log("Webhook worker started successfully");

  return webhookWorker;
};