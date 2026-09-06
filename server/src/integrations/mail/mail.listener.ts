import { Injectable, Inject, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MAIL_SERVICE, type MailService } from './mail.interface';
import {
  UserInvitedEvent,
  UserAddedToCompanyEvent,
  PasswordResetRequestedEvent,
  UserVerificationRequestedEvent,
  SubscriptionCreatedEvent,
} from './mail.events';
import {
  getInviteEmailHtml,
  getAddedToCompanyHtml,
  getPasswordResetHtml,
  getVerifyEmailHtml,
  getSubscriptionConfirmationHtml,
} from './mail.templates';

@Injectable()
export class MailListener {
  private readonly logger = new Logger(MailListener.name);

  constructor(
    @Inject(MAIL_SERVICE) private readonly mailService: MailService,
  ) {}

  @OnEvent('user.invited', { async: true })
  async handleUserInvitedEvent(payload: UserInvitedEvent) {
    this.logger.log(`Handling user.invited event for ${payload.email}`);
    const html = getInviteEmailHtml(
      payload.companyName,
      payload.role,
      payload.inviteLink,
    );
    await this.mailService.sendEmail(
      payload.email,
      'New Member',
      'Company Invitation - Technically',
      html,
    );
  }

  @OnEvent('user.added_to_company', { async: true })
  async handleUserAddedToCompanyEvent(payload: UserAddedToCompanyEvent) {
    this.logger.log(
      `Handling user.added_to_company event for ${payload.email}`,
    );
    const html = getAddedToCompanyHtml(payload.companyName, payload.role);
    await this.mailService.sendEmail(
      payload.email,
      'Member',
      'Added to Company - Technically',
      html,
    );
  }

  @OnEvent('password.reset.requested', { async: true })
  async handlePasswordResetRequestedEvent(
    payload: PasswordResetRequestedEvent,
  ) {
    this.logger.log(
      `Handling password.reset.requested event for ${payload.email}`,
    );
    const html = getPasswordResetHtml(payload.firstName, payload.resetLink);
    await this.mailService.sendEmail(
      payload.email,
      `${payload.firstName} ${payload.lastName}`,
      'Password Reset Request',
      html,
    );
  }

  @OnEvent('user.verification.requested', { async: true })
  async handleUserVerificationRequestedEvent(
    payload: UserVerificationRequestedEvent,
  ) {
    this.logger.log(
      `Handling user.verification.requested event for ${payload.email}`,
    );
    const html = getVerifyEmailHtml(payload.firstName, payload.verifyLink);
    await this.mailService.sendEmail(
      payload.email,
      `${payload.firstName} ${payload.lastName}`,
      'Verify Email Address - Technically',
      html,
    );
  }

  @OnEvent('subscription.created', { async: true })
  async handleSubscriptionCreatedEvent(payload: SubscriptionCreatedEvent) {
    this.logger.log(`Handling subscription.created event for ${payload.email}`);
    const html = getSubscriptionConfirmationHtml(
      payload.companyName,
      payload.planName,
      payload.currentPeriodEnd,
    );
    await this.mailService.sendEmail(
      payload.email,
      payload.recipientName || payload.companyName,
      `Subscription Confirmed: Welcome to ${payload.planName}!`,
      html,
    );
  }
}
