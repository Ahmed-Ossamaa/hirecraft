"use client";

import React from "react";
import clsx from "clsx";

interface BillingIntervalToggleProps {
  interval: "month" | "year";
  onChange: (interval: "month" | "year") => void;
  maxDiscount?: number;
  subtext?: string | boolean;
  className?: string;
}

/**
 * Toggle control for switching between monthly and annual billing intervals.
 * Displays dynamic discount badge and optional subtext.
 */
export const BillingIntervalToggle: React.FC<BillingIntervalToggleProps> = ({
  interval,
  onChange,
  maxDiscount = 0,
  subtext = false,
  className,
}) => {
  return (
    <div className={clsx("flex flex-col items-center justify-center gap-3", className)}>
      <div
        role="tablist"
        aria-label="Billing interval selection"
        className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border/80 shadow-inner"
      >
        <button
          type="button"
          role="tab"
          aria-selected={interval === "month"}
          onClick={() => onChange("month")}
          className={clsx(
            "px-5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer",
            interval === "month"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Monthly Billing
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={interval === "year"}
          onClick={() => onChange("year")}
          className={clsx(
            "px-5 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer",
            interval === "year"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <span>Annual Billing</span>
          {maxDiscount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Save up to {maxDiscount}%
            </span>
          )}
        </button>
      </div>

      {subtext && (
        <p className="text-xs text-muted-foreground font-mono">
          {typeof subtext === "string"
            ? subtext
            : "Annual plans billed yearly. Cancel or change at any time."}
        </p>
      )}
    </div>
  );
};
