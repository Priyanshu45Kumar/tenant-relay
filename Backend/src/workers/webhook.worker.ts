import "dotenv/config";
import { Worker } from "bullmq";
import axios from "axios";

import { redisConnection } from "../config/redis.js";
import { connectDatabase } from "../config/database.js";
import { EventModel } from "../models/event.model.js";
import { WebhookEndpointModel } from "../models/webhook-endpoint.model.js";
import { generateWebhookSignature } from "../utils/webhook-signature.js";

const startWorker = async () => {
  await connectDatabase();

  console.log("MongoDB connected for webhook worker");

  const webhookWorker = new Worker(
    "webhook-delivery",
    async (job) => {
      console.log("Processing job:", job.id);
      console.log("Job name:", job.name);
      console.log("Job data:", job.data);

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

      for (const webhook of webhooks) {
        console.log(
          `Sending event ${event._id} to ${webhook.url}`,
        );

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

        await axios.post(webhook.url, rawPayload, {
          headers: {
            "Content-Type": "application/json",
            "X-TenantRelay-Signature": signature,
          },
        });

        console.log(
          `Webhook delivered successfully to ${webhook.url}`,
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
  console.error(
    "Failed to start webhook worker:",
    error,
  );
});