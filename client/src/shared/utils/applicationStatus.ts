import type {
  EmployerApplicationResponseDtoStatus,
  CandidateApplicationResponseDtoStatus,
} from "@/shared/api/generated/model";

export type AnyApplicationStatus =
  | EmployerApplicationResponseDtoStatus
  | CandidateApplicationResponseDtoStatus
  | string;

export const EMPLOYER_APPLICATION_STATUS_OPTIONS: {
  value: EmployerApplicationResponseDtoStatus;
  label: string;
}[] = [
  { value: "PENDING", label: "Pending Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "OFFERED", label: "Offered" },
  { value: "OFFER_ACCEPTED", label: "Offer Accepted" },
  { value: "OFFER_DECLINED", label: "Offer Declined" },
  { value: "REJECTED", label: "Rejected" },
  { value: "WITHDRAWN", label: "Withdrawn" },
];

export const getApplicationStatusColor = (
  status?: AnyApplicationStatus | null,
): string => {
  switch (status) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "SHORTLISTED":
    case "REVIEWED":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "INTERVIEW_SCHEDULED":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "OFFERED":
    case "OFFER_ACCEPTED":
    case "ACCEPTED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "OFFER_DECLINED":
    case "REJECTED":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "WITHDRAWN":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const getApplicationStatusLabel = (
  status?: AnyApplicationStatus | null,
): string => {
  switch (status) {
    case "PENDING":
      return "Pending Review";
    case "SHORTLISTED":
      return "Shortlisted";
    case "REVIEWED":
      return "Reviewed";
    case "INTERVIEW_SCHEDULED":
      return "Interview Scheduled";
    case "OFFERED":
      return "Offered";
    case "OFFER_ACCEPTED":
      return "Offer Accepted";
    case "ACCEPTED":
      return "Accepted";
    case "OFFER_DECLINED":
      return "Offer Declined";
    case "REJECTED":
      return "Rejected";
    case "WITHDRAWN":
      return "Withdrawn";
    default:
      return status || "Unknown";
  }
};

