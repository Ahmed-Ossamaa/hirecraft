"use client";

import React, { useRef } from "react";
import { useCompanySubscription, useAvailablePlans } from "../api/useBilling";
import { CurrentPlanCard } from "./CurrentPlanCard";
import { PricingGrid } from "./PricingGrid";
import { useAuthStore } from "@/shared/stores/auth-store";
import { Skeleton } from "@/shared/components/ui";
import { MdWorkspacePremium, MdSecurity, MdHelpOutline } from "react-icons/md";

export const BillingDashboardClient: React.FC = () => {
  const { subscription, isLoading: isSubLoading } = useCompanySubscription();
  const { plans, isLoading: isPlansLoading } = useAvailablePlans();
  const companyRole = useAuthStore((s) => s.companyRole);
  const isAdmin = companyRole === "ADMIN";

  const pricingRef = useRef<HTMLDivElement>(null);

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const isLoading = isSubLoading || isPlansLoading;

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-6xl mx-auto space-y-8 mb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <MdWorkspacePremium className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
              Plans & Billing
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your company subscription, resource allowances, and billing preferences.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4">
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Current Plan Overview Card */}
          {subscription && (
            <CurrentPlanCard
              subscription={subscription}
              isAdmin={isAdmin}
              onUpgradeClick={scrollToPricing}
            />
          )}

          {/* Pricing & Upgrade Grid */}
          <div ref={pricingRef} className="pt-6">
            <PricingGrid
              plans={plans}
              currentPlan={subscription?.plan}
              currentPlanId={subscription?.planId}
              scheduledPlanId={subscription?.scheduledPlanId}
              currentPeriodEnd={subscription?.currentPeriodEnd}
              isAdmin={isAdmin}
            />
          </div>

          {/* FAQ Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card/40 border border-border/50">
              <MdSecurity className="text-xl text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">
                  Secure Payment Processing
                </span>
                All payments are processed securely through Stripe with 256-bit encryption. Technically never stores your credit card details.
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card/40 border border-border/50">
              <MdHelpOutline className="text-xl text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground block mb-0.5">
                  Need Help or Custom Invoicing?
                </span>
                Have questions about our limits, enterprise terms, or require wire transfer payment? Reach out to support@technically.com.
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
