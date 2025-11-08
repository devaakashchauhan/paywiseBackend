import mongoose, { Document, Schema } from "mongoose";
import { compareValue, hashValue } from "../utils/bcrypt";

export enum UserRoleEnum {
  USER = "USER",
  ADMIN = "ADMIN",
}

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  profilePicture: string | null;
  role: keyof typeof UserRoleEnum;
  otp?: string;
  otpExpiresAt?: Date;
  resetPasswordJti?: string;
  resetPasswordJtiExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (password: string) => Promise<boolean>;
  omitPassword: () => Omit<UserDocument, "password">;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    profilePicture: { type: String, default: null },
    password: { type: String, select: true, required: true },
    role: { type: String, enum: Object.values(UserRoleEnum), default: UserRoleEnum.USER },
    otp: { type: String, select: false },
    otpExpiresAt: { type: Date, select: false },
    resetPasswordJti: { type: String, select: false },
    resetPasswordJtiExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return compareValue(password, this.password);
};

userSchema.methods.omitPassword = function (): Omit<UserDocument, "password"> {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

const UserModel = mongoose.model<UserDocument>("User", userSchema);
export default UserModel;
