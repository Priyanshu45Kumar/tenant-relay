
import { Router } from "express";

import { createWebhookEndpoint,
         deactivateWebhookEndpoint,
         getWebhookEndpoints
 } from "../controllers/webhook.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireTenantMembership,
  createWebhookEndpoint,
);

router.patch(
  "/:id/deactivate",
  authenticate,
  requireTenantMembership,
  deactivateWebhookEndpoint,
);

router.get(
  "/",
  authenticate,
  requireTenantMembership,
  getWebhookEndpoints,
);

export default router;

