
import { Router } from "express";

import { getDeliveryStats } from "../controllers/delivery.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  requireTenantMembership,
  getDeliveryStats,
);

export default router;