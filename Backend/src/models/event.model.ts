
import { Schema, model, type Document, type Types } from "mongoose";

export interface IEvent extends Document {
  tenantId: Types.ObjectId;
  type: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
      index: true,
    },

    type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    payload: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ tenantId: 1, createdAt: -1 });

export const EventModel = model<IEvent>("Event", eventSchema);

