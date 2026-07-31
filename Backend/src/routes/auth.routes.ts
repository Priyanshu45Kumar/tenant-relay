import { Router } from "express";
import { requestRegistrationOtp,
         verifyRegistrationOtp } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register/request-otp", requestRegistrationOtp);
authRouter.post("/register/verify-otp", verifyRegistrationOtp);


export default authRouter;