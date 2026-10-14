import { Router } from "express";
import {getCurrentUser,login, requestRegistrationOtp,
         verifyRegistrationOtp } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { updatePassword } from "../controllers/auth.controller.js";
const authRouter = Router();

authRouter.post("/register/request-otp", requestRegistrationOtp);
authRouter.post("/register/verify-otp", verifyRegistrationOtp);
authRouter.post("/login",login);
authRouter.get("/me", authenticate, getCurrentUser);
authRouter.patch(
  "/change-password",
  authenticate,
  updatePassword,
);


export default authRouter;