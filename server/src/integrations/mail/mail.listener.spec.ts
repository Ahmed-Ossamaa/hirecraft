/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { MailListener } from './mail.listener';
import {
  SubscriptionCreatedEvent,
  SubscriptionCancellationScheduledEvent,
  SubscriptionDowngradeScheduledEvent,
  SubscriptionExpiredEvent,
  UserInvitedEvent,
  UserAddedToCompanyEvent,
  PasswordResetRequestedEvent,
  UserVerificationRequestedEvent,
} from './mail.events';

describe('MailListener', () => {
  let listener: MailListener;
  let mailService: any;

  beforeEach(() => {
    mailService = {
      sendEmail: jest.fn().mockResolvedValue(true),
    };
    listener = new MailListener(mailService);
  });

  it('handles user.invited event', async () => {
    const event = new UserInvitedEvent(
      'jane@company.com',
      'Acme Corp',
      'STAFF',
      'http://app.com/invite?token=123',
    );
    await listener.handleUserInvitedEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'jane@company.com',
      'New Member',
      expect.stringContaining('Invitation'),
      expect.any(String),
    );
  });

  it('handles user.added_to_company event', async () => {
    const event = new UserAddedToCompanyEvent(
      'jane@company.com',
      'Acme Corp',
      'STAFF',
    );
    await listener.handleUserAddedToCompanyEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'jane@company.com',
      'Member',
      expect.stringContaining('Added to Company'),
      expect.any(String),
    );
  });

  it('handles password.reset.requested event', async () => {
    const event = new PasswordResetRequestedEvent(
      'jane@company.com',
      'Jane',
      'Doe',
      'http://app.com/reset',
    );
    await listener.handlePasswordResetRequestedEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'jane@company.com',
      'Jane Doe',
      'Password Reset Request',
      expect.any(String),
    );
  });

  it('handles user.verification.requested event', async () => {
    const event = new UserVerificationRequestedEvent(
      'jane@company.com',
      'Jane',
      'Doe',
      'http://app.com/verify',
    );
    await listener.handleUserVerificationRequestedEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'jane@company.com',
      'Jane Doe',
      expect.stringContaining('Verify Email Address'),
      expect.any(String),
    );
  });

  it('handles subscription.created event', async () => {
    const event = new SubscriptionCreatedEvent(
      'admin@acme.com',
      'Acme Corp',
      'Pro Monthly',
      new Date('2026-11-25'),
      'Jane Doe',
    );
    await listener.handleSubscriptionCreatedEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'admin@acme.com',
      'Jane Doe',
      'Subscription Confirmed: Welcome to Pro Monthly!',
      expect.stringContaining('Acme Corp'),
    );
  });

  it('handles subscription.cancellation_scheduled event', async () => {
    const event = new SubscriptionCancellationScheduledEvent(
      'admin@acme.com',
      'Acme Corp',
      'Pro Monthly',
      new Date('2026-11-25'),
      'Acme Corp',
    );
    await listener.handleSubscriptionCancellationScheduledEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'admin@acme.com',
      'Acme Corp',
      'Subscription Cancellation Scheduled - Technically',
      expect.stringContaining('Free plan'),
    );
  });

  it('handles subscription.downgrade_scheduled event', async () => {
    const event = new SubscriptionDowngradeScheduledEvent(
      'admin@acme.com',
      'Acme Corp',
      'Pro Monthly',
      'Starter Monthly',
      new Date('2026-11-25'),
      'Acme Corp',
    );
    await listener.handleSubscriptionDowngradeScheduledEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'admin@acme.com',
      'Acme Corp',
      'Subscription Plan Change Scheduled - Technically',
      expect.stringContaining('Starter Monthly'),
    );
  });

  it('handles subscription.expired event', async () => {
    const event = new SubscriptionExpiredEvent(
      'admin@acme.com',
      'Acme Corp',
      'Pro Monthly',
      'Acme Corp',
    );
    await listener.handleSubscriptionExpiredEvent(event);
    expect(mailService.sendEmail).toHaveBeenCalledWith(
      'admin@acme.com',
      'Acme Corp',
      'Subscription Expired - Technically',
      expect.stringContaining('Free plan'),
    );
  });
});
