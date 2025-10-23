import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { loginSchema, registerSchema } from "../validators/auth.validator";
import { adminLogin, loginService, registerService } from "../services/auth.service";

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
    console.log("body:", req);
    const body = loginSchema.parse({
      ...req.body,
    });
    console.log("Admin login attempt");
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
