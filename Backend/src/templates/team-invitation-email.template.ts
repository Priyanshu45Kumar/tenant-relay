export interface TeamInvitationEmailInput {
  inviterName: string;
  workspaceName: string;
  role: string;
  invitationLink: string;
}

export const buildTeamInvitationEmail = ({
  inviterName,
  workspaceName,
  role,
  invitationLink,
}: TeamInvitationEmailInput) => {
  return {
    subject: `You're invited to join ${workspaceName} on TenantRelay`,

    textContent: `
Hi,

${inviterName} has invited you to join the ${workspaceName} workspace on TenantRelay.

Role: ${role}

Accept your invitation:
${invitationLink}

This invitation will expire in 24 hours.

If you were not expecting this invitation, you can safely ignore this email.

Thanks,
TenantRelay
`.trim(),

    htmlContent: `
<!DOCTYPE html>
<html>
  <body>
    <h2>You're invited to TenantRelay</h2>

    <p>
      <strong>${inviterName}</strong> has invited you to join
      <strong>${workspaceName}</strong>.
    </p>

    <p>
      Your role: <strong>${role}</strong>
    </p>

    <p>
      <a href="${invitationLink}">
        Accept invitation
      </a>
    </p>

    <p>
      This invitation will expire in 24 hours.
    </p>

    <p>
      If you were not expecting this invitation, you can safely ignore
      this email.
    </p>

    <p>
      Thanks,<br />
      TenantRelay
    </p>
  </body>
</html>
`.trim(),
  };
};