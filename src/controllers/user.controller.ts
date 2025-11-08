import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
  bulkDeleteUsersService,
  deleteUserService,
  findByIdUserService,
  updateUserService,
} from "../services/user.service";
import { HTTPSTATUS } from "../config/http.config";
import { bulkDeleteUserSchema, updateUserSchema, userIdSchema } from "../validators/user.validator";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const user = await findByIdUserService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "User fetched successfully",
      user,
    });
  }
);

export const updateUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = updateUserSchema.parse(req.body);
    const userId = req.user?._id;
    const profilePic = req.file;

    const user = await updateUserService(userId, body, profilePic);

    return res.status(HTTPSTATUS.OK).json({
      message: "User profile updated successfully",
      data: user,
    });
  }
);


export const deleteUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = userIdSchema.parse(req.params.id);

    await deleteUserService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User deleted successfully",
    });
  }
);

export const bulkDeleteUsersController = asyncHandler(
  async (req: Request, res: Response) => {

    const { userIds } = bulkDeleteUserSchema.parse(req.body);

    const result = await bulkDeleteUsersService(userIds);

    return res.status(HTTPSTATUS.OK).json({
      message: "Users deleted successfully",
      ...result,
    });
  }
);
