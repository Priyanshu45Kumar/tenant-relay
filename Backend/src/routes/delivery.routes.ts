
import { Router } from "express";

import {
  getDeliveryStats,
  replayFailedDelivery,
  getDeliveries
} from "../controllers/delivery.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.get(
  "/stats",
  authenticate,
  requireTenantMembership,
  getDeliveryStats,
);


router.get(
  "/",
  authenticate,
  requireTenantMembership,
  getDeliveries,
);


router.post(
  "/:deliveryId/replay",
  authenticate,
  requireTenantMembership,
  replayFailedDelivery,
);

export default router;

