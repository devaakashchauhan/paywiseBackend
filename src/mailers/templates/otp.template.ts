
import { capitalizeFirstLetter } from "../../utils/helper";

export const getOTPEmailTemplate = (
    userEmail: string,
    otp: string
) => {
  

  const reportTitle = `Password Reset OTP`;
  const currentYear = new Date().getFullYear();
return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <title>${reportTitle}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
        </head>
        <body style="margin:0;padding:0;font-family:'Roboto',Arial,sans-serif;background:#f7f7f7;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f7f7;padding:24px;">
                <tr>
                    <td align="center">
                        <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                            <tr>
                                <td style="background:#00bc7d;padding:20px 24px;color:#fff;text-align:center;">
                                    <h1 style="margin:0;font-size:20px;font-weight:700;">${reportTitle}</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:24px;">
                                    <p style="margin:0 0 16px;font-size:16px;color:#333;">
                                        Hi <strong>${capitalizeFirstLetter(userEmail.split('@')[0])}</strong>,
                                    </p>

                                    <p style="margin:0 0 20px;color:#333;font-size:15px;line-height:1.4;">
                                        We received a request to reset the password for your account (${userEmail}). Use the One-Time Password (OTP) below to verify your identity and complete the password reset process.
                                    </p>

                                    <div style="margin:20px 0;text-align:center;">
                                        <div style="display:inline-block;padding:18px 26px;background:#f0f7f3;border-radius:8px;border:1px dashed #d6efe2;">
                                            <span style="font-size:28px;font-weight:700;letter-spacing:2px;color:#0a6f4a;">${otp}</span>
                                        </div>
                                    </div>

                                    <p style="margin:0 0 12px;color:#666;font-size:14px;">
                                        This OTP is valid for 10 minutes. For your security, do not share this code with anyone.
                                    </p>

                                    <p style="margin:0 0 20px;color:#666;font-size:14px;">
                                        If you did not request a password reset, you can safely ignore this email.
                                    </p>

                                    <p style="margin-top:12px;font-size:13px;color:#999;">
                                        Need help? Reply to this email or contact our support team.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f5f5f5;padding:14px 20px;text-align:center;color:#888;font-size:12px;">
                                    &copy; ${currentYear} Paywise. All rights reserved.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    </html>
`;
};
