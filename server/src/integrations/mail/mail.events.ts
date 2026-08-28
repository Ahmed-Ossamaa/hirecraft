export class UserInvitedEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly role: string,
    public readonly inviteLink: string,
  ) {}
}

export class UserAddedToCompanyEvent {
  constructor(
    public readonly email: string,
    public readonly companyName: string,
    public readonly role: string,
  ) {}
}

export class PasswordResetRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly resetLink: string,
  ) {}
}

export class UserVerificationRequestedEvent {
  constructor(
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly verifyLink: string,
  ) {}
}
