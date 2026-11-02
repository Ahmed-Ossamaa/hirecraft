"use client";

import React from "react";
import { Input } from "@/shared/components/ui/Input";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";
import { MdSearch, MdClear } from "react-icons/md";
import { GetUsersUserType } from "@/shared/api/generated/model";

interface AdminUserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  banStatus: string;
  onBanStatusChange: (value: string) => void;
  emailVerified: string;
  onEmailVerifiedChange: (value: string) => void;
  onReset: () => void;
}

export function AdminUserFilters({
  search,
  onSearchChange,
  banStatus,
  onBanStatusChange,
  emailVerified,
  onEmailVerifiedChange,
  onReset,
}: AdminUserFiltersProps) {
  const hasActiveFilters =
    Boolean(search) ||
    banStatus !== "ALL" ||
    emailVerified !== "ALL";

  return (
    <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" />
        </div>

        {/* Ban Status */}
        <Select
          value={banStatus}
          onChange={(e) => onBanStatusChange(e.target.value)}
          options={[
            { label: "All Account Statuses", value: "ALL" },
            { label: "Active Only", value: "ACTIVE" },
            { label: "Banned Only", value: "BANNED" },
          ]}
        />

        {/* Email Verification */}
        <Select
          value={emailVerified}
          onChange={(e) => onEmailVerifiedChange(e.target.value)}
          options={[
            { label: "All Verification", value: "ALL" },
            { label: "Verified Only", value: "VERIFIED" },
            { label: "Unverified Only", value: "UNVERIFIED" },
          ]}
        />
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <MdClear className="text-sm" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}

