import { Router } from "express";
import { authorize } from "../middlewares/authorize.middleware.js";

import {
  getTeamMembers,
  createTeamInvitation,
  acceptTeamInvitation,
} from "../controllers/team.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { requireTenantMembership } from "../middlewares/membership.middleware.js";

const router = Router();

router.post(
  "/invitations/accept",
  authenticate,
  acceptTeamInvitation,
);
router.post(
  "/invite",
  authenticate,
  requireTenantMembership,
  createTeamInvitation,
);
router.get(
  "/",
  authenticate,
  authorize("owner", "admin","developer"),
  requireTenantMembership,
  getTeamMembers,
);

export default router;