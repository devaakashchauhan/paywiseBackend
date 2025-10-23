import { Request, Response } from "express";
import UserModel, { UserRoleEnum } from "../models/user.model";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

