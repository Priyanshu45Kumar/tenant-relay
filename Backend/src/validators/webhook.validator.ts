import { z } from "zod";

export const createWebhookEndpointSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Webhook name must contain at least 2 characters")
      .max(100, "Webhook name cannot exceed 100 characters"),

    url: z
      .string()
      .trim()
      .url("Enter a valid webhook URL")
      .max(2048, "Webhook URL is too long"),
  })
  .strict();