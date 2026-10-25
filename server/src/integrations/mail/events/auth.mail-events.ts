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
