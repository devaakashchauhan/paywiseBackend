import { Request, Response } from "express";
import UserModel, { UserRoleEnum } from "../models/user.model";
import TransactionModel from "../models/transaction.model";
import ReportModel from "../models/report.model";
import ReportSettingModel from "../models/report-setting.model";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalTransactions = await TransactionModel.countDocuments();
    const totalReports = await ReportModel.countDocuments();
    const recentUsers = await UserModel.find().sort({ createdAt: -1 }).limit(5);
    const recentTransactions = await TransactionModel.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      stats: {
        totalUsers,
        totalTransactions,
        totalReports,
      },
      recentUsers,
      recentTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load dashboard", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  await UserModel.findByIdAndDelete(id);
  res.json({ message: "User deleted successfully" });
};

export const getAllTransactions = async (req: Request, res: Response) => {
  const transactions = await TransactionModel.find().populate("userId", "name email");
  res.json(transactions);
};

export const getAllReports = async (req: Request, res: Response) => {
  const reports = await ReportModel.find().populate("userId", "name email");
  res.json(reports);
};

export const getReportSettings = async (req: Request, res: Response) => {
  const settings = await ReportSettingModel.find().populate("userId", "name email");
  res.json(settings);
};

export const toggleReportSetting = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const setting = await ReportSettingModel.findOne({ userId });

  if (!setting) return res.status(404).json({ message: "Setting not found" });

  setting.isEnabled = !setting.isEnabled;
  await setting.save();

  res.json({ message: `Report setting ${setting.isEnabled ? "enabled" : "disabled"}` });
};
