export enum ApplicationStatus {
  PENDING = 'PENDING', // Just applied
  REVIEWING = 'REVIEWING', // Employer is looking at it
  ACCEPTED = 'ACCEPTED', // Employer wants to interview/hire
  REJECTED = 'REJECTED', // Not a fit
  ARCHIVED = 'ARCHIVED',
}
