"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { getGetSubscriptionQueryKey } from "@/shared/api/generated/billing/billing";
import { useConfirmCheckoutSession } from "@/features/billing/api/useBilling";
import { getApiError } from "@/shared/utils/error";
import { Button } from "@/shared/components/ui/Button";
import {
  MdCheckCircle,
  MdArrowForward,
  MdSync,
  MdErrorOutline,
  MdRefresh,
} from "react-icons/md";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const queryClient = useQueryClient();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activatedPlanName, setActivatedPlanName] = useState<string | null>(null);

  const confirmMutation = useConfirmCheckoutSession();
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (confirmedRef.current) return;

    if (sessionId) {
      confirmedRef.current = true;
      confirmMutation.mutate(
        { data: { sessionId } },
        {
          onSuccess: (res) => {
            queryClient.invalidateQueries({
              queryKey: getGetSubscriptionQueryKey(),
            });
            const planName = res.data?.plan?.name;
            if (planName) {
              setActivatedPlanName(planName);
            }
            setCountdown(5);
          },
          onError: (err) => {
            setErrorMessage(
              getApiError(err, "Could not verify your checkout session."),
            );
          },
        },
      );
    } else {
      // Direct visit without session_id
      queryClient.invalidateQueries({
        queryKey: getGetSubscriptionQueryKey(),
      });
      setCountdown(5);
    }
  }, [sessionId, confirmMutation, queryClient]);

  // Handle countdown redirection
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      router.replace("/dashboard/company/billing");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  // Loading / Verifying state
  if (confirmMutation.isPending) {
    return (
      <div className="max-w-md w-full bg-card rounded-3xl border border-border/80 shadow-lg p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto text-3xl animate-spin">
          <MdSync />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
            Activating Subscription...
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please wait while we confirm your payment with Stripe and provision your upgraded plan limits.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (errorMessage) {
    return (
      <div className="max-w-md w-full bg-card rounded-3xl border border-rose-500/30 shadow-lg p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto text-3xl">
          <MdErrorOutline />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
            Activation Notice
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {sessionId && (
            <Button
              variant="outline"
              className="w-full text-sm"
              onClick={() => {
                setErrorMessage(null);
                confirmedRef.current = false;
              }}
              leftIcon={<MdRefresh />}
            >
              Retry Sync
            </Button>
          )}
          <Button
            variant="primary"
            className="w-full text-sm"
            onClick={() => router.replace("/dashboard/company/billing")}
            rightIcon={<MdArrowForward />}
          >
            Go to Billing
          </Button>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="max-w-md w-full bg-card rounded-3xl border border-border/80 shadow-lg p-8 sm:p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto text-3xl">
        <MdCheckCircle />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-headline font-bold text-foreground tracking-tight">
          Subscription Activated!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {activatedPlanName ? (
            <>
              Your company is now subscribed to the{" "}
              <strong className="text-foreground font-semibold">
                {activatedPlanName}
              </strong>{" "}
              plan. Your team limits and features have been applied immediately.
            </>
          ) : (
            "Thank you! Your payment was processed successfully. Your plan allowances and features have been upgraded immediately."
          )}
        </p>
      </div>

      {countdown !== null && (
        <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground">
          Redirecting to your billing dashboard in{" "}
          <strong className="text-foreground font-mono">{countdown}s</strong>...
        </div>
      )}

      <Button
        variant="primary"
        className="w-full text-sm"
        onClick={() => router.replace("/dashboard/company/billing")}
        rightIcon={<MdArrowForward />}
      >
        Go to Billing Dashboard Now
      </Button>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-card rounded-3xl border border-border/80 p-8 text-center text-sm text-muted-foreground">
            Loading confirmation...
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
