import type { Plan } from "@/shared/api/generated/model";

export interface PlanPriceDisplay {
  formattedPrice: string;
  period?: string;
  subtext?: string;
}

/**
 * Calculates annual savings percentage compared to paying monthly for 12 months.
 */
export const calculateAnnualSavingsPercent = (
  monthlyPrice?: number,
  yearlyPrice?: number,
): number => {
  if (!monthlyPrice || monthlyPrice <= 0 || !yearlyPrice || yearlyPrice <= 0) {
    return 0;
  }
  const annualizedMonthly = monthlyPrice * 12;
  if (annualizedMonthly <= yearlyPrice) return 0;
  return Math.round(((annualizedMonthly - yearlyPrice) / annualizedMonthly) * 100);
};

/**
 * Calculates maximum annual discount percentage across all yearly plans in the list.
 */
export const calculateMaxAnnualDiscount = (plans: Plan[]): number => {
  const yearlyPlans = plans.filter((p) => p.interval === "year" && p.price > 0);
  const discounts = yearlyPlans.map((yrPlan) => {
    const moPlan = plans.find(
      (p) => p.name.toLowerCase() === yrPlan.name.toLowerCase() && p.interval === "month",
    );
    return calculateAnnualSavingsPercent(moPlan?.price, yrPlan.price);
  });
  return discounts.length > 0 ? Math.max(0, ...discounts) : 0;
};

/**
 * Formats price display, billing period label, and savings subtext.
 */
export const formatPlanPriceDisplay = (
  plan: Plan,
  billingInterval: "month" | "year",
  discountPercent = 0,
): PlanPriceDisplay => {
  if (plan.price === 0) {
    return {
      formattedPrice: "Free",
      period: "/ forever",
      subtext: undefined,
    };
  }

  const formattedPrice = `${plan.price.toLocaleString()} ${plan.currency}`;
  const period = billingInterval === "year" ? "/ year" : "/ month";

  let subtext: string | undefined;
  if (billingInterval === "year") {
    const monthlyEquivalent = Math.round(plan.price / 12).toLocaleString();
    subtext =
      discountPercent > 0
        ? `${monthlyEquivalent} ${plan.currency} / mo (Save ${discountPercent}%)`
        : `${monthlyEquivalent} ${plan.currency} / mo`;
  }

  return { formattedPrice, period, subtext };
};
