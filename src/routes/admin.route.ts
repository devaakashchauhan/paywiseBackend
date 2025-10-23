import { Router } from "express";
import { isAdmin } from "../middlewares/isAdmin";
import { getAllUsers } from "../controllers/admin.controller";

const adminRoutes = Router();

adminRoutes.get("/users", isAdmin, getAllUsers);

export default adminRoutes;
