import { Router } from "express";
import { isAdmin } from "../middlewares/isAdmin";
import { deleteUser, getAdminDashboard, getAllReports, getAllTransactions, getAllUsers, getReportSettings, toggleReportSetting } from "../controllers/admin.controller";
import { bulkDeleteTransactionController } from "../controllers/transaction.controller";
import { bulkDeleteUsersController, deleteUserController } from "../controllers/user.controller";

const adminRoutes = Router();

adminRoutes.get("/users/all", isAdmin,getAllUsers);
adminRoutes.get("/dashboard", isAdmin,getAdminDashboard);
adminRoutes.delete("/user/:id", isAdmin, deleteUserController);
adminRoutes.delete("/users/bulk-delete", isAdmin, bulkDeleteUsersController);

adminRoutes.get("/transactions", isAdmin, getAllTransactions);
adminRoutes.get("/reports", isAdmin, getAllReports);
adminRoutes.get("/report-settings", isAdmin, getReportSettings);
adminRoutes.patch("/report-settings/:userId/toggle", isAdmin, toggleReportSetting);

export default adminRoutes;
