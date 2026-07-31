import { Router } from "express";
import {login, requestRegistrationOtp,
         verifyRegistrationOtp } from "../controllers/auth.controller.js";


const authRouter = Router();

authRouter.post("/register/request-otp", requestRegistrationOtp);
authRouter.post("/register/verify-otp", verifyRegistrationOtp);
authRouter.post("/login",login);


export default authRouter;