
import { Router } from "express";

import { createEvent,getEvents } from "../controllers/event.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.post(
  "/",
  authenticate,
  requireTenantMembership,
  createEvent,
);

router.get(
  "/",
  authenticate,
  requireTenantMembership,
  getEvents,
);

export default router;
