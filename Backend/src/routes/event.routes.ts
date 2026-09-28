
import { Router } from "express";

import { createEvent,getEvents } from "../controllers/event.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";
import {authenticateApiKey  } from "../middlewares/api-key-authenticate.js";

const router = Router();

router.post(
  "/",
  authenticateApiKey,
  createEvent,
);

router.get(
  "/",
  authenticate,
  requireTenantMembership,
  getEvents,
);

export default router;
