import { Schema, model, type Document, type Types } from "mongoose";

export type WebhookDeliveryStatus =
  | "pending"
  | "success"
  | "failed";

export interface IWebhookDelivery extends Document {
  tenantId: Types.ObjectId;
  eventId: Types.ObjectId;
  webhookEndpointId: Types.ObjectId;
  status: WebhookDeliveryStatus;
  attempts: number;
  responseStatus?: number;
  lastError?: string;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const webhookDeliverySchema = new Schema<IWebhookDelivery>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },

    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    webhookEndpointId: {
      type: Schema.Types.ObjectId,
      ref: "webhookendpoint",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    responseStatus: {
      type: Number,
    },

    lastError: {
      type: String,
    },

    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

webhookDeliverySchema.index({
  tenantId: 1,
  status: 1,
});

webhookDeliverySchema.index(
  { eventId: 1, webhookEndpointId: 1 },
  { unique: true },
);

export const WebhookDeliveryModel = model<IWebhookDelivery>(
  "WebhookDelivery",
  webhookDeliverySchema,
);