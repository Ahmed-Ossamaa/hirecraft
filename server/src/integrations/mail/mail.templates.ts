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

export const getSubscriptionConfirmationHtml = (
  companyName: string,
  planName: string,
  currentPeriodEnd: Date | null,
) => `
  <h1>Subscription Confirmed!</h1>
  <p>Congratulations!</p>
  <p><strong>${companyName}</strong> is now subscribed to the <strong>${planName}</strong> plan on Technically.</p>
  ${
    currentPeriodEnd
      ? `<p>Your current billing period will renew on <strong>${new Date(currentPeriodEnd).toLocaleDateString()}</strong>.</p>`
      : ''
  }
  <p>Thank you for choosing Technically!</p>
`;

export const getSubscriptionCancellationScheduledHtml = (
  companyName: string,
  planName: string,
  currentPeriodEnd: Date | null,
) => `
  <h1>Subscription Cancellation Scheduled</h1>
  <p>Hello,</p>
  <p>The subscription for <strong>${companyName}</strong> on the <strong>${planName}</strong> plan has been scheduled for cancellation.</p>
  ${
    currentPeriodEnd
      ? `<p>
          Your plan will remain active until <strong>${new Date(currentPeriodEnd).toLocaleDateString()}</strong>.
          After this date, your company will transition to the Free plan.
        </p>`
      : '<p>Your company will transition to the Free plan at the end of the current billing cycle.</p>'
  }
  <p>Thank you for using Technically!</p>
`;

export const getSubscriptionDowngradeScheduledHtml = (
  companyName: string,
  currentPlanName: string,
  targetPlanName: string,
  effectiveDate: Date | null,
) => `
  <h1>Subscription Downgrade Scheduled</h1>
  <p>Hello,</p>
  <p>A plan change for <strong>${companyName}</strong> from <strong>${currentPlanName}</strong> to <strong>${targetPlanName}</strong> has been scheduled.</p>
  ${
    effectiveDate
      ? `<p>You will retain all features and limits of your current plan until <strong>${new Date(effectiveDate).toLocaleDateString()}</strong>, at which point your new plan and limits will take effect.</p>`
      : '<p>Your new plan will take effect at the end of the current billing cycle.</p>'
  }
  <p>Thank you for using Technically!</p>
`;

export const getSubscriptionExpiredHtml = (
  companyName: string,
  planName: string,
) => `
  <h1>Subscription Expired</h1>
  <p>Hello,</p>
  <p>The <strong>${planName}</strong> subscription for <strong>${companyName}</strong> has ended and your account has transitioned to the Free plan.</p>
  <p>Your team members and job postings have been adjusted to Free plan limits. You can reactivate or upgrade your subscription at any time from your dashboard.</p>
  <p>Thank you for choosing Technically!</p>
`;
