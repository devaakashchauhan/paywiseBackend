import mongoose from "mongoose";
import UserModel, { UserRoleEnum } from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import {
  LoginSchemaType,
  RegisterSchemaType,
} from "../validators/auth.validator";
import ReportSettingModel, {
  ReportFrequencyEnum,
} from "../models/report-setting.model";
import { calulateNextReportDate } from "../utils/helper";
import { signJwtToken } from "../utils/jwt";
import { sendOTPEmail } from "../mailers/otp.mailer";
import PasswordResetModel from "../models/passwordReset.model";

export const registerService = async (body: RegisterSchemaType) => {
  const { email } = body;

  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const existingUser = await UserModel.findOne({ email }).session(session);
      if (existingUser) throw new UnauthorizedException("User already exists");

      const newUser = new UserModel({
        ...body,
      });

      await newUser.save({ session });

      const reportSetting = new ReportSettingModel({
        userId: newUser._id,
        frequency: ReportFrequencyEnum.MONTHLY,
        isEnabled: true,
        nextReportDate: calulateNextReportDate(),
        lastSentDate: null,
      });
      await reportSetting.save({ session });

      return { user: newUser.omitPassword() };
    });
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
};

export const loginService = async (body: LoginSchemaType) => {
  const { email, password } = body;
  const user = await UserModel.findOne({ email });
  if (!user) throw new NotFoundException("Email/password not found");
  if(user.role === UserRoleEnum.ADMIN) 
    throw new UnauthorizedException("Invalid email/password");

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid)
    throw new UnauthorizedException("Invalid email/password");

  const { token, expiresAt } = signJwtToken({ userId: user.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: user.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: user.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};

export const adminLogin = async (body: LoginSchemaType) => {
  const { email, password } = body;

  const admin = await UserModel.findOne({ email }).select("+password");
  if (!admin || admin.role !== UserRoleEnum.ADMIN)
    throw new NotFoundException("Email/password not found");

  const isPasswordValid = await admin.comparePassword(password);
  console.log("Admin login attempt", admin, isPasswordValid);

  if (!isPasswordValid)
    throw new UnauthorizedException("Invalid email/password");

  const { token, expiresAt } = signJwtToken({ userId: admin.id });

  const reportSetting = await ReportSettingModel.findOne(
    {
      userId: admin.id,
    },
    { _id: 1, frequency: 1, isEnabled: 1 }
  ).lean();

  return {
    user: admin.omitPassword(),
    accessToken: token,
    expiresAt,
    reportSetting,
  };
};

// 1️⃣ SEND OTP
export const sendOTPService = async (email: string) => {
  const user = await UserModel.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  // remove old OTP entries for this email
  await PasswordResetModel.deleteMany({ email });

  await PasswordResetModel.create({ email, otp, otpExpiresAt });

  const emailSent = await sendOTPEmail({ email, otp });

  return emailSent;
};

// 2️⃣ VERIFY OTP & GENERATE RESET TOKEN
export const recreatePasswordService = async (email: string, otp: string,newPassword: string) => {
  const record = await PasswordResetModel.findOne({ email, otp });
  if (!record) throw new Error("Invalid OTP or email");
  if (record.otpExpiresAt < new Date()) throw new Error("OTP expired");


  const user = await UserModel.findOne({ email });
  console.log("User found for password reset:", user);
  if (!user) throw new Error("User not found");

  user.password = newPassword;
  await user.save();

  // clear password reset record
  await PasswordResetModel.deleteMany({ email });

  return { message: "Password updated successfully" };
};
