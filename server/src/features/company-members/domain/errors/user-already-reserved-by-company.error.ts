export class UserAlreadyReservedByCompanyError extends Error {
  constructor() {
    super('User already has a company membership.');
    this.name = UserAlreadyReservedByCompanyError.name;
  }
}
