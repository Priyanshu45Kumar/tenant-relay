import "dotenv/config";

import { sendOtpEmail } from "../services/email.service.js";

const testEmailService = async (): Promise<void> => {
  const recipientEmail = process.argv[2];

  if (!recipientEmail) {
    console.error(
      "Usage: npx tsx src/scripts/test-email.ts py297065@gmail.com",
    );

    process.exitCode = 1;
    return;
  }

  try {
    const messageId = await sendOtpEmail({
      to: recipientEmail,
      otp: "123456",
      purpose: "signup",
    });

    console.log(`Brevo accepted the email. Message ID: ${messageId}`);
  } catch (error) {
    console.error("Email test failed:", error);
    process.exitCode = 1;
  }
};

testEmailService();