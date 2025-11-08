import { Request, Response, NextFunction } from "express";
import UserModel, { UserRoleEnum } from "../models/user.model";
import { UnauthorizedAdminException } from "../utils/app-error";

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?._id; // assuming you attach user info from JWT
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await UserModel.findById(userId);
    if (!user || user.role !== UserRoleEnum.ADMIN) {
      console.log("Unauthorized admin access attempt by user:", userId);
       throw new UnauthorizedAdminException("Invalid admin credentials");
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
