
import { z } from "zod";

export const createEventSchema = z
  .object({
    type: z
      .string()
      .trim()
      .min(2, "Event type must contain at least 2 characters")
      .max(100, "Event type cannot exceed 100 characters"),

    payload: z
      .record(z.string(), z.unknown()),
  })
  .strict();

