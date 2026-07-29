export type OtpPurpose = "signup" | "password-reset";

interface OtpEmailContent {
  subject: string;
  textContent: string;
  htmlContent: string;
}

export const buildOtpEmail = (
  otp: string,
  purpose: OtpPurpose,
): OtpEmailContent => {
  const isSignup = purpose === "signup";

  const title = isSignup
    ? "Verify your TenantRelay account"
    : "Reset your TenantRelay password";

  const message = isSignup
    ? "Use the following verification code to complete your registration."
    : "Use the following verification code to reset your password.";

  return {
    subject: title,

    textContent: `${message}\n\nYour OTP is: ${otp}\n\nThis OTP expires in 10 minutes.`,

    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
        <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;padding:32px;">
            <h1 style="color:#111827;margin-top:0;">
              TenantRelay
            </h1>

            <h2 style="color:#1f2937;">
              ${title}
            </h2>

            <p style="color:#4b5563;font-size:16px;line-height:1.6;">
              ${message}
            </p>

            <div style="margin:30px 0;text-align:center;">
              <span style="
                display:inline-block;
                background:#eef2ff;
                color:#4f46e5;
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
                padding:18px 24px;
                border-radius:12px;
              ">
                ${otp}
              </span>
            </div>

            <p style="color:#6b7280;font-size:14px;">
              This code expires in 10 minutes. Do not share it with anyone.
            </p>

            <p style="color:#9ca3af;font-size:12px;margin-top:32px;">
              If you did not request this code, you can safely ignore this email.
            </p>
          </div>
        </body>
      </html>
    `,
  };
};