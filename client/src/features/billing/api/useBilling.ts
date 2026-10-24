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
import type { AxiosError } from "axios";
import type { Plan, PlanId, CreateCheckoutSessionDtoPlanId } from "@/shared/api/generated/model";

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

  const mutation = useOrvalCreateCheckoutSession({
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
      onError: (error: AxiosError<{ message?: string }>) => {
        // We preserve activeAttemptKeyRef.current so retrying the exact same
        // failed or timed-out action reuses the same idempotency key
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Could not start checkout session. Please try again.";
        toast.error(message);
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

  return useOrvalCancelSubscription({
    mutation: {
      onSuccess: () => {
        toast.success(
          "Your subscription has been scheduled for cancellation at the end of the billing period.",
        );
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });
      },
      onError: (error: AxiosError<{ message?: string }>) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to cancel subscription.";
        toast.error(message);
      },
    },
  });
};

export const useConfirmCheckoutSession = () => {
  const queryClient = useQueryClient();

  return useOrvalConfirmCheckout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getGetSubscriptionQueryKey(),
        });
      },
      onError: (error: AxiosError<{ message?: string }>) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to confirm subscription checkout.";
        toast.error(message);
      },
    },
  });
};

export const useChangeSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  const activeAttemptKeyRef = useRef<string | null>(null);

  const mutation = useOrvalChangePlan({
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
      onError: (error: AxiosError<{ message?: string }>) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to change subscription plan. Please try again.";
        toast.error(message);
      },
    },
  });

  const changePlan = async (
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

    return mutation.mutateAsync({
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


