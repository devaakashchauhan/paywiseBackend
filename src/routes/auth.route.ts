import { Router } from "express";
import {
  adminLoginController,
  forgotPasswordController,
  loginController,
  registerController,
  verifyOtpController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/admin/login", adminLoginController);
authRoutes.post("/forgot-password", forgotPasswordController);
authRoutes.post("/verify-otp", verifyOtpController);

export default authRoutes;
