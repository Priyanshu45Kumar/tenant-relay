import { webhookDeliveryQueue } from "./queues/webhook.queue.js";

const job = await webhookDeliveryQueue.add("test-webhook", {
  message: "Hello from TenantRelay",
});

console.log("Job added:", job.id);

process.exit(0); 