import {Router} from "express";

import {getCurrentWorkspace} from "../controllers/workspace.controller.js"
import {authenticate} from "../middlewares/auth.middleware.js"
import {requireTenantMembership} from "../middlewares/membership.middleware.js"
import {authorize} from "../middlewares/authorize.middleware.js"
import {updateWorkspace} from "../controllers/workspace.controller.js"
import {MEMBERSHIP_ROLES} from "../constants/membership-roles.js"
const workspaceRouter = Router();

workspaceRouter.get("/current",getCurrentWorkspace);
workspaceRouter.patch(
  "/current",
  authenticate,
  requireTenantMembership,
  authorize("owner"),
  updateWorkspace,
);

export default workspaceRouter;