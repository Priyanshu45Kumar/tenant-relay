import { Router } from "express";
import {getCurrentUser,login, requestRegistrationOtp,
         verifyRegistrationOtp } from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
const authRouter = Router();

authRouter.post("/register/request-otp", requestRegistrationOtp);
authRouter.post("/register/verify-otp", verifyRegistrationOtp);
authRouter.post("/login",login);
authRouter.get("/me", authenticate, getCurrentUser);


export default authRouter;