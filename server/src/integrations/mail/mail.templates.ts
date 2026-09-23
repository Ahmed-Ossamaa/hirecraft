export const getInviteEmailHtml = (
  companyName: string,
  role: string,
  inviteLink: string,
) => `
  <h1>You've been invited!</h1>
  <p>You have been invited to join <strong>${companyName}</strong> on Technically as a <strong>${role}</strong>.</p>
  <p>Click the link below to accept the invitation and set up your account:</p>
  <a href="${inviteLink}">Accept Invitation</a>
`;

export const getAddedToCompanyHtml = (companyName: string, role: string) => `
  <h1>You've been added to a company!</h1>
  <p>You have been added to <strong>${companyName}</strong> on Technically as a <strong>${role}</strong>.</p>
  <p>You can now log in to your account and access the company dashboard.</p>
`;

export const getPasswordResetHtml = (firstName: string, resetLink: string) => `
  <h1>Password Reset Request</h1>
  <p>Hello ${firstName},</p>
  <p>You requested to reset your password. Click the link below to set a new password:</p>
  <a href="${resetLink}">Reset Password</a>
  <p>This link will expire in 1 hour.</p>
`;

export const getVerifyEmailHtml = (firstName: string, verifyLink: string) => `
  <h1>Email Verification</h1>
  <p>Hello ${firstName},</p>
  <p>Thank you for signing up for Technically! Please click the link below to verify your email address:</p>
  <a href="${verifyLink}">Verify Email</a>
  <p>This link will expire in 24 hours.</p>
`;
