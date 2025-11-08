import UserModel from "../models/user.model";
import { NotFoundException } from "../utils/app-error";
import { UpdateUserType } from "../validators/user.validator";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    name: body.name,
  });

  await user.save();

  return user.omitPassword();
};


export const getAllUsersService = async (
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {


  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  const [users, totalCount] = await Promise.all([
    UserModel.find()
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }),
    UserModel.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    users,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};


export const deleteUserService = async (
  userId: string,
) => {
  const deleted = await UserModel.findByIdAndDelete({
    _id: userId,
  });
  if (!deleted) throw new NotFoundException("User not found");

  return;
};

export const bulkDeleteUsersService = async (
  transactionIds: string[]
) => {
  const result = await UserModel.deleteMany({
    _id: { $in: transactionIds },
  });

  if (result.deletedCount === 0)
    throw new NotFoundException("No users found");

  return {
    success: true,
    deletedCount: result.deletedCount,
  };
};
