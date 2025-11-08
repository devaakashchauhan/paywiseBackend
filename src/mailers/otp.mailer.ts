import { sendEmail } from "./mailer";
import { getOTPEmailTemplate } from "./templates/otp.template";

type ReportEmailParams = {
  email: string;
  otp: string;
};

export const sendOTPEmail = async (params: ReportEmailParams) => {
  const { email, otp } = params;
  const html = getOTPEmailTemplate(
    email,
    otp
  );

  const text = `
    Your OTP for password reset is: ${otp}
    If you did not request this, please ignore this email.
    This OTP is valid for 10 minutes.
`;


  return sendEmail({
    to: email,
    subject: `Password Reset OTP`,
    text,
    html,
  });
};
