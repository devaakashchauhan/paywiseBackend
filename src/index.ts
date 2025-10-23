import cors from "cors";
import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import connctDatabase from "./config/database.config";
import { Env } from "./config/env.config";
import { HTTPSTATUS } from "./config/http.config";
import "./config/passport.config";
import { passportAuthenticateJwt } from "./config/passport.config";
import { initializeCrons } from "./cron";
import { asyncHandler } from "./middlewares/asyncHandler.middlerware";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import analyticsRoutes from "./routes/analytics.route";
import authRoutes from "./routes/auth.route";
import reportRoutes from "./routes/report.route";
import transactionRoutes from "./routes/transaction.route";
import userRoutes from "./routes/user.route";
import { BadRequestException } from "./utils/app-error";
import adminRoutes from "./routes/admin.route";

const app = express();
const BASE_PATH = Env.BASE_PATH;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
    credentials: true,
  })
);

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("This is a test error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, passportAuthenticateJwt, userRoutes);
app.use(`${BASE_PATH}/transaction`, passportAuthenticateJwt, transactionRoutes);
app.use(`${BASE_PATH}/report`, passportAuthenticateJwt, reportRoutes);
app.use(`${BASE_PATH}/analytics`, passportAuthenticateJwt, analyticsRoutes);
app.use(`${BASE_PATH}/admin`, passportAuthenticateJwt, adminRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  await connctDatabase();

  if (Env.NODE_ENV === "development") {
    console.log("Initializing cron jobs...");
    await initializeCrons();
  }

  console.log(`Server is running on port ${Env.PORT} in ${Env.NODE_ENV} mode`);
});
