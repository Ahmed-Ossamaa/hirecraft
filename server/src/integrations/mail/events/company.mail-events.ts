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
