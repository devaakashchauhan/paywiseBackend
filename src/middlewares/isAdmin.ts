import { Request, Response, NextFunction } from "express";
import UserModel, { UserRoleEnum } from "../models/user.model";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id; // assuming you attach user info from JWT
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== UserRoleEnum.ADMIN) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
