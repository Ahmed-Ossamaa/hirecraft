import { ApplicationStatus } from './application-status.enum';

export class JobApplication {
  id!: string;
  jobId!: string;
  workerProfileId!: string;
  status!: ApplicationStatus;
  coverLetter?: string;
  isArchived?: boolean;
  isStarred?: boolean;

  jobTitle?: string;
  workerTitle?: string;
  companyId?: string;
  companyName?: string;

  createdAt!: Date;
  updatedAt!: Date;

  applicantName?: string;
  applicantEmail?: string;
  applicantAvatar?: string | null;
}
