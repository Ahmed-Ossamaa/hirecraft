'use client'

import { useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSubscription,
  useCancelSubscription as useOrvalCancelSubscription,
  useCreateCheckoutSession as useOrvalCreateCheckoutSession,
  useConfirmCheckout as useOrvalConfirmCheckout,
  useChangePlan as useOrvalChangePlan,
  getGetSubscriptionQueryKey,
} from "@/shared/api/generated/billing/billing";
import {
  useGetPlans,
} from "@/shared/api/generated/plans/plans";
import { useAuthStore } from "@/shared/stores/auth-store";
import { toast } from "sonner";
import type { Plan, PlanId, CreateCheckoutSessionDtoPlanId } from "@/shared/api/generated/model";
import { getApiError } from "@/shared/utils/error";

export const useCompanySubscription = () => {
  const companyId = useAuthStore((s) => s.organizationId);

  const query = useGetSubscription({
    query: {
      enabled: !!companyId,
    },
  });

  return {
    ...query,
    subscription: query.data?.data,
    plan: query.data?.data?.plan,
    usage: query.data?.data?.usage,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
};

export const useAvailablePlans = () => {
  const query = useGetPlans();

  const plans: Plan[] = query.data?.data ?? [];

  const monthlyPlans = plans.filter((p) => p.interval === "month");
  const yearlyPlans = plans.filter((p) => p.interval === "year");

  return {
    ...query,
    plans,
    monthlyPlans,
    yearlyPlans,
  };
};

export const useCreateCheckout = () => {
  const companyId = useAuthStore((s) => s.organizationId);
  const activeAttemptKeyRef = useRef<string | null>(null);

  const mutation = useOrvalCreateCheckoutSession<unknown>({
    mutation: {
      onSuccess: (response) => {
        activeAttemptKeyRef.current = null;
        const checkoutUrl = response?.data?.url;
        if (checkoutUrl) {
          toast.info("Redirecting to secure payment checkout...");
          window.location.href = checkoutUrl;
        } else {
          toast.error("Failed to generate checkout session URL");
        }
      },
      onError: (error) => {
        // We preserve activeAttemptKeyRef.current so retrying the exact same
        // failed or timed-out action reuses the same idempotency key
        toast.error(
          getApiError(
            error,
            "Could not start checkout session. Please try again.",
          ),
        );
      },
    },
  });

  const initiateCheckout = async (
    planId: CreateCheckoutSessionDtoPlanId,
    customIdempotencyKey?: string,
  ) => {
    if (!companyId) {
      toast.error("Company information missing");
      return;
    }

    if (mutation.isPending) {
      return;
    }

    // Reuse existing key for this checkout session attempt or generate one
    if (!activeAttemptKeyRef.current) {
      activeAttemptKeyRef.current = customIdempotencyKey || crypto.randomUUID();
    }

    const idempotencyKey = customIdempotencyKey || activeAttemptKeyRef.current;

    return mutation.mutateAsync({
      companyId,
      data: {
        planId,
        idempotencyKey,
      },
    });
  };

  const resetCheckoutAttempt = () => {
    activeAttemptKeyRef.current = null;
  };

  return {
    ...mutation,
    initiateCheckout,
    resetCheckoutAttempt,
    isPending: mutation.isPending,
  };
};

export const useCancelCompanySubscription = () => {
  const queryClient = useQueryClient();

  return useOrvalCancelSubscription<unknown>({
    mutation: {
      onSuccess: () => {
        toast.success(
          "Your subscription has been scheduled for cancellation at the end of the billing period.",
        );
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });
      },
      onError: (error) => {
        toast.error(getApiError(error, "Failed to cancel subscription."));
      },
    },
  });
};

export const useConfirmCheckoutSession = () => {
  const queryClient = useQueryClient();

  return useOrvalConfirmCheckout<unknown>({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });
      },
      onError: (error) => {
        toast.error(
          getApiError(error, "Failed to confirm subscription checkout."),
        );
      },
    },
  });
};

export const useChangeSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const activeAttemptKeyRef = useRef<string | null>(null);

  const mutation = useOrvalChangePlan<unknown>({
    mutation: {
      onSuccess: (response) => {
        activeAttemptKeyRef.current = null;
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });

        const action = response?.data?.action;
        const checkoutUrl = response?.data?.url;

        if (action === "CHECKOUT" && checkoutUrl) {
          toast.info("Redirecting to secure payment checkout...");
          window.location.href = checkoutUrl;
        } else if (action === "UPGRADED") {
          toast.success(
            "Plan upgraded successfully! Your new quota and limits are active immediately.",
          );
        } else if (action === "DOWNGRADE_SCHEDULED") {
          toast.success(
            "Downgrade scheduled. Your current plan and limits remain active until the end of your billing cycle.",
          );
        }
      },
      onError: (error) => {
        toast.error(
          getApiError(
            error,
            "Failed to change subscription plan. Please try again.",
          ),
        );
      },
    },
  });

  const changePlan = (
    planId: PlanId,
    customIdempotencyKey?: string,
  ) => {
    if (mutation.isPending) {
      return;
    }

    if (!activeAttemptKeyRef.current) {
      activeAttemptKeyRef.current = customIdempotencyKey || crypto.randomUUID();
    }

    const idempotencyKey = customIdempotencyKey || activeAttemptKeyRef.current;

    mutation.mutate({
      data: {
        planId,
        idempotencyKey,
      },
    });
  };

  return {
    ...mutation,
    changePlan,
    isPending: mutation.isPending,
  };
};
