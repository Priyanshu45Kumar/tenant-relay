import { Router } from "express";
import { requestRegistrationOtp } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register/request-otp", requestRegistrationOtp);

export default authRouter;