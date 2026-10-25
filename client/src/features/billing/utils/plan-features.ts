import type { Plan } from "@/shared/api/generated/model";

/**
 * Returns tier rank number for plan hierarchy comparison.
 * 0: Free, 1: Starter, 2: Pro/Professional, 3: Enterprise
 */
export const getTierLevel = (plan?: Plan | null): number => {
  if (!plan) return 0;
  const name = plan.name.toLowerCase();
  if (name === "starter") return 1;
  if (name === "pro" || name === "professional") return 2;
  if (name === "enterprise") return 3;
  return 0; // free
};

/**
 * Returns descriptive marketing summary for a plan tier.
 */
export const getPlanDescription = (plan: Plan): string => {
  if (plan.price === 0) {
    return "Essential tools for small businesses exploring recruitment.";
  }
  const nameLower = plan.name.toLowerCase();
  if (nameLower === "starter") {
    return "Designed for growing teams hiring consistently.";
  }
  if (nameLower === "pro" || nameLower === "professional") {
    return "High-volume recruitment with advanced team capacity.";
  }
  return "Unlimited capacity & dedicated support.";
};

/**
 * Generates the feature bullet list based on plan limits and billing interval.
 */
export const getPlanFeatures = (
  plan: Plan,
  billingInterval: "month" | "year",
): string[] => {
  const { limits } = plan;
  const isFree = plan.price === 0;
  const nameLower = plan.name.toLowerCase();
  const isStarter = nameLower === "starter";
  const isPro = nameLower === "pro" || nameLower === "professional";
  const intervalLabel = billingInterval === "year" ? "per year" : "per month";

  if (isFree) {
    return [
      `${limits.maxActiveJobs} simultaneous active job`,
      `${limits.maxJobPostings} job posting credit per month`,
      `${limits.maxUsers} team member seat`,
      "Standard applicant screening",
    ];
  }

  if (isStarter) {
    return [
      `${limits.maxActiveJobs} simultaneous active jobs`,
      `${limits.maxJobPostings} posting credits ${intervalLabel}`,
      `${limits.maxUsers} team member seats`,
      "Applicant status management",
      "Team email notifications",
    ];
  }

  if (isPro) {
    return [
      `${limits.maxActiveJobs} simultaneous active jobs`,
      `${limits.maxJobPostings} posting credits ${intervalLabel}`,
      `${limits.maxUsers} team member seats`,
      "Applicant sorting & talent starring",
      "Priority candidate visibility",
      "Multi-member hiring workflows",
    ];
  }

  return [
    "Unlimited simultaneous active jobs",
    "Unlimited job posting credits",
    "Unlimited team member seats",
    "Dedicated account manager",
    "Custom SLA & onboarding",
  ];
};
