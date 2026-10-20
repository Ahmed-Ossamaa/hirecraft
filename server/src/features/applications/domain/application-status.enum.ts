export enum ApplicationStatus {
  PENDING = 'PENDING', // Just applied
  SHORTLISTED = 'SHORTLISTED', //Employer shortlisted for interview
  INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED', //Interview scheduled
  OFFERED = 'OFFERED', //Offer letter sent to candidate
  OFFER_ACCEPTED = 'OFFER_ACCEPTED', //offer accepted by candidate
  OFFER_DECLINED = 'OFFER_DECLINED', //Offer letter declined by candidate
  REJECTED = 'REJECTED', // Not a fit
  WITHDRAWN = 'WITHDRAWN', //candidate withdrawn
}

export enum CandidateApplicationStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}
