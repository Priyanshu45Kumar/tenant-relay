import {
  buildOtpEmail,
  type OtpPurpose,
} from "../templates/otp-email.template.js";
import { buildTeamInvitationEmail } from "../templates/team-invitation-email.template.js";

const BREVO_EMAIL_URL = "https://api.brevo.com/v3/smtp/email";

interface SendOtpEmailInput {
  to: string;
  otp: string;
  purpose: OtpPurpose;
}
interface SendTeamInvitationEmailInput {
  to: string;
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationLink: string;
}

interface BrevoEmailResponse {
  messageId: string;
}

export const sendOtpEmail = async ({
  to,
  otp,
  purpose,
}: SendOtpEmailInput): Promise<string> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderName || !senderEmail) {
    throw new Error("Brevo email configuration is missing");
  }

  const emailContent = buildOtpEmail(otp, purpose);

  const response = await fetch(BREVO_EMAIL_URL, {
    method: "POST",

    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },

    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },

      to: [
        {
          email: to,
        },
      ],

      subject: emailContent.subject,
      textContent: emailContent.textContent,
      htmlContent: emailContent.htmlContent,

      tags: [`tenantrelay-${purpose}`],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Brevo email request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const result = (await response.json()) as BrevoEmailResponse;

  return result.messageId;
};

export const sendTeamInvitationEmail = async ({
  to,
  inviterName,
  workspaceName,
  role,
  invitationLink,
}: SendTeamInvitationEmailInput): Promise<string> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!apiKey || !senderName || !senderEmail) {
    throw new Error("Brevo email configuration is missing");
  }

  const emailContent = buildTeamInvitationEmail({
    inviterName,
    workspaceName,
    role,
    invitationLink,
  });

  const response = await fetch(BREVO_EMAIL_URL, {
    method: "POST",

    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },

    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail,
      },

      to: [
        {
          email: to,
        },
      ],

      subject: emailContent.subject,
      textContent: emailContent.textContent,
      htmlContent: emailContent.htmlContent,

      tags: ["tenantrelay-team-invitation"],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Brevo invitation email request failed with status ${response.status}: ${errorBody}`,
    );
  }

  const result = (await response.json()) as BrevoEmailResponse;

  return result.messageId;
};