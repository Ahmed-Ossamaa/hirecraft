import { ApplicationStatus } from './application-status.enum';

export class JobApplication {
  id!: string;
  jobId!: string;
  workerProfileId!: string;
  status!: ApplicationStatus;
  coverLetter?: string;

  // populated by the Mapper later
  jobTitle?: string;
  workerTitle?: string;

  createdAt!: Date;
  updatedAt!: Date;

  applicantName?: string;
  applicantEmail?: string;
}
