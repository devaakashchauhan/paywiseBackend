import { Request, Response } from "express";
import UserModel, { UserRoleEnum } from "../models/user.model";
import TransactionModel, { TransactionTypeEnum } from "../models/transaction.model";
import ReportModel from "../models/report.model";
import ReportSettingModel from "../models/report-setting.model";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { HTTPSTATUS } from "../config/http.config";
import { getAllUsersService } from "../services/user.service";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

// export const getAllUsers = async (req: Request, res: Response) => {
//   try {
//     const users = await UserModel.find().select("-password");
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch users", error });
//   }
// };

export const getAllUsers = asyncHandler(
  async (req: Request, res: Response) => {

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 20,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    const result = await getAllUsersService(pagination);

    return res.status(HTTPSTATUS.OK).json({
      message: "Users fetched successfully",
      ...result,
    });
  }
);

export const getAdminDashboard = async (req: Request, res: Response) => {
   try {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // ===== 1️ USER STATS =====
    const totalUsers: number = await UserModel.countDocuments();
    const currentMonthUsers = await UserModel.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });
    const previousMonthUsers = await UserModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const userChange: number = calculatePercentageChange(
      currentMonthUsers,
      previousMonthUsers
    );

    // ===== 2️ TRANSACTION STATS =====
    const totalTransactions: number = await TransactionModel.countDocuments();
    const currentMonthTransactions = await TransactionModel.countDocuments({
      createdAt: { $gte: startOfThisMonth },
    });
    const previousMonthTransactions = await TransactionModel.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
    });
    const transactionChange = calculatePercentageChange(
      currentMonthTransactions,
      previousMonthTransactions
    );

    // ===== 3️ INCOME STATS =====
      const totalIncomeCount: number = await TransactionModel.countDocuments({
      type: TransactionTypeEnum.INCOME,
    });
    // const totalIncome = incomeAgg[0]?.totalIncome || 0;

    const currentMonthIncomeAgg = await TransactionModel.aggregate([
      {
        $match: {
          type: TransactionTypeEnum.INCOME,
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousMonthIncomeAgg = await TransactionModel.aggregate([
      {
        $match: {
          type: TransactionTypeEnum.INCOME,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const currentMonthIncome = currentMonthIncomeAgg[0]?.total || 0;
    const previousMonthIncome = previousMonthIncomeAgg[0]?.total || 0;
    const incomeChange = calculatePercentageChange(
      currentMonthIncome,
      previousMonthIncome
    );

    // ===== 4️ EXPENSE STATS =====
    // const expenseAgg = await TransactionModel.aggregate([
    //   { $match: { type: TransactionTypeEnum.EXPENSE } },
    //   { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    // ]);
    // const totalExpense = expenseAgg[0]?.totalExpense || 0;
    const totalExpenseCount:number = await TransactionModel.countDocuments({
      type: TransactionTypeEnum.EXPENSE,
    });

    const currentMonthExpenseAgg = await TransactionModel.aggregate([
      {
        $match: {
          type: TransactionTypeEnum.EXPENSE,
          createdAt: { $gte: startOfThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const previousMonthExpenseAgg = await TransactionModel.aggregate([
      {
        $match: {
          type: TransactionTypeEnum.EXPENSE,
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const currentMonthExpense = currentMonthExpenseAgg[0]?.total || 0;
    const previousMonthExpense = previousMonthExpenseAgg[0]?.total || 0;
    const expenseChange = calculatePercentageChange(
      currentMonthExpense,
      previousMonthExpense
    );

    // ===== 5️ LAST 5 TRANSACTIONS =====
    const lastFiveTransactions = await TransactionModel.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "-password")
      .lean();

    // ===== 6️ TRANSACTION OVERVIEW BY MONTH =====
    const monthsToShow = 6; // you can change to 12 if you want yearly view
    const monthlyOverview: any[] = [];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthName = MONTH_NAMES[date.getMonth()];

      const usersCount = await UserModel.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const transactionsCount = await TransactionModel.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });

      const incomeAgg = await TransactionModel.aggregate([
        {
          $match: {
            type: TransactionTypeEnum.INCOME,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const expenseAgg = await TransactionModel.aggregate([
        {
          $match: {
            type: TransactionTypeEnum.EXPENSE,
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      monthlyOverview.push({
        month: monthName,
        users: usersCount,
        transactions: transactionsCount,
        income: incomeAgg[0]?.total || 0,
        expense: expenseAgg[0]?.total || 0,
      });
    }

    // =====  FINAL RESPONSE =====
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          percentageChange: Number(userChange.toFixed(2)),
          trend:
            userChange > 0
              ? "increase"
              : userChange < 0
              ? "decrease"
              : "no change",
        },
        transactions: {
          total: totalTransactions,
          percentageChange: Number(transactionChange.toFixed(2)),
          trend:
            transactionChange > 0
              ? "increase"
              : transactionChange < 0
              ? "decrease"
              : "no change",
        },
        income: {
          total: totalIncomeCount,
          percentageChange: Number(incomeChange.toFixed(2)),
          trend:
            incomeChange > 0
              ? "increase"
              : incomeChange < 0
              ? "decrease"
              : "no change",
        },
        expense: {
          total: totalExpenseCount,
          percentageChange: Number(expenseChange.toFixed(2)),
          trend:
            expenseChange > 0
              ? "increase"
              : expenseChange < 0
              ? "decrease"
              : "no change",
        },
        lastFiveTransactions,
        monthlyOverview, 
      },
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching admin overview",
    });
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
