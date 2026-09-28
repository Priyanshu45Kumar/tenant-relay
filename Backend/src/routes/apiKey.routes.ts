import { Router } from "express";
import {
  createApiKey,
  getApiKeys,
  revokeApiKey
} from "../controllers/api-key.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requireTenantMembership,
  authorize("owner", "admin"),
  getApiKeys,
);

router.post(
  "/",
  authenticate,
  requireTenantMembership,
  authorize("owner", "admin"),
  createApiKey,
);

router.patch(
  "/:id/revoke",
  authenticate,
  requireTenantMembership,
  authorize("owner", "admin"),
  revokeApiKey,
);

export default router;