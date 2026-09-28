import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const webhookDeliveryQueue = new Queue(
  "webhook-delivery",
  {
    connection: redisConnection,
  },
);

await webhookDeliveryQueue.add("test-webhook", {
  message: "Hello from TenantRelay",
});