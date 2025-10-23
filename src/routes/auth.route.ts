import { Router } from "express";
import {
  adminLoginController,
  loginController,
  registerController,
} from "../controllers/auth.controller";

const authRoutes = Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.post("/admin/login", adminLoginController);

export default authRoutes;
