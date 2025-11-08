import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { forgotPasswordSchema, loginSchema, registerSchema } from "../validators/auth.validator";
import { adminLogin, loginService, recreatePasswordService, registerService,  sendOTPService } from "../services/auth.service";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse(req.body);

    const result = await registerService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: result,
    });
  }
);

export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await loginService(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);

export const adminLoginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({
      ...req.body,
    });
    const { user, accessToken, expiresAt, reportSetting } =
      await adminLogin(body);

    return res.status(HTTPSTATUS.OK).json({
      message: "Admin logged in successfully",
      user,
      accessToken,
      expiresAt,
      reportSetting,
    });
  }
);


export const forgotPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = forgotPasswordSchema.parse(req.body);

    const emailSent = await sendOTPService(email);

    if (!emailSent) {
      return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message: "Failed to send OTP email",
      });
    }

    return res.status(HTTPSTATUS.OK).json({
      message: "OTP sent to email",
    });
  }
);

export const verifyOtpController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, otp,newPassword } = req.body;
    await recreatePasswordService(email, otp,newPassword);

    return res.status(HTTPSTATUS.OK).json({
      message: "Password recreated successfully",
    });
  }
);
