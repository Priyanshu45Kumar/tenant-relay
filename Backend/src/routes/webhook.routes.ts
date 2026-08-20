
import { Router } from "express";

import { createWebhookEndpoint } from "../controllers/webhook.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireTenantMembership,
  createWebhookEndpoint,
);

export default router;

