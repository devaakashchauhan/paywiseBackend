import mongoose, { Document, Schema } from "mongoose";

export interface PasswordResetDocument extends Document {
  email: string;
  otp: string;
  otpExpiresAt: Date;
  token: string | null;
  tokenExpiresAt: Date | null;
}

const passwordResetSchema = new Schema<PasswordResetDocument>(
  {
    email: { type: String, required: true },
    otp: { type: String, required: true },
    otpExpiresAt: { type: Date, required: true },
    token: { type: String, default: null },
    tokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const PasswordResetModel = mongoose.model<PasswordResetDocument>(
  "PasswordReset",
  passwordResetSchema
);
export default PasswordResetModel;
