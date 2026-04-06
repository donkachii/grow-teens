import { Router } from "express";
import { loginUser, registerUser, resendVerification, verifyEmail } from "../controllers/auth.ts";

const authRoutes = Router();

authRoutes.post("/signup", registerUser);
authRoutes.post("/signin", loginUser);
authRoutes.get("/verify-email/:token", verifyEmail);
authRoutes.post("/resend-verification", resendVerification);

export default authRoutes;