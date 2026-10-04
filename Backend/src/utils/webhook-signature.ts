import { createHmac } from "node:crypto";

export const generateWebhookSignature = (
  payload: string,
  secret: string,
): string => {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
};