import { Router } from "express";
import { isAdmin } from "../middlewares/isAdmin";
import { deleteUser, getAdminDashboard, getAllReports, getAllTransactions, getAllUsers, getReportSettings, toggleReportSetting } from "../controllers/admin.controller";

const adminRoutes = Router();

adminRoutes.get("/users", isAdmin, getAllUsers);
adminRoutes.get("/dashboard", isAdmin, getAdminDashboard);
adminRoutes.delete("/users/:id", isAdmin, deleteUser);
adminRoutes.get("/transactions", isAdmin, getAllTransactions);
adminRoutes.get("/reports", isAdmin, getAllReports);
adminRoutes.get("/report-settings", isAdmin, getReportSettings);
adminRoutes.patch("/report-settings/:userId/toggle", isAdmin, toggleReportSetting);

export default adminRoutes;
