"use client";

import { useState } from "react";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import { useGetSubscriptions } from "@/shared/api/generated/admin-billing/admin-billing";
import type {
  AdminSubscriptionResponseDto,
  AdminSubscriptionResponseDtoStatus,
} from "@/shared/api/generated/model";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Select } from "@/shared/components/ui/Select";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { AdminSubscriptionStatusBadge } from "./AdminSubscriptionStatusBadge";
import { AdminPlanBadge } from "./AdminPlanBadge";
import {
  MdWorkspacePremium,
  MdContentCopy,
  MdCheck,
  MdWarning,
  MdClear,
  MdSearch,
} from "react-icons/md";

export function AdminSubscriptionsTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [status, setStatus] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const statusParam =
    status !== "ALL"
      ? (status as AdminSubscriptionResponseDtoStatus)
      : undefined;

  const { data, isLoading, isError } = useGetSubscriptions(
    {
      page,
      limit: 10,
      status: statusParam,
      search: debouncedSearch || undefined,
    },
    {
      query: {
        staleTime: 30 * 1000,
      },
    }
  );

  const subscriptions =
    (data?.data?.data as AdminSubscriptionResponseDto[]) || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetFilters = () => {
    setStatus("ALL");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search by company name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base pointer-events-none" />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { label: "All Subscription Statuses", value: "ALL" },
              { label: "Active", value: "ACTIVE" },
              { label: "Cancelled", value: "CANCELLED" },
              { label: "Expired", value: "EXPIRED" },
            ]}
          />
        </div>

        {(status !== "ALL" || search) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 self-end sm:self-auto shrink-0"
          >
            <MdClear className="text-sm" />
            Clear Filters
          </Button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          Failed to load subscriptions list. Please refresh or try again.
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={<MdWorkspacePremium className="text-3xl text-muted-foreground" />}
          title="No subscriptions found"
          description="There are currently no subscriptions matching the selected criteria."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Provider</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Current Period Ends</th>
                  <th className="px-5 py-3.5">Started Date</th>
                  <th className="px-5 py-3.5 text-right">Subscription ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {subscriptions.map((sub) => {
                  const companyName = sub.companyName || "Unknown Company";

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0 overflow-hidden relative">
                            {sub.companyLogo ? (
                              <Image
                                src={sub.companyLogo}
                                alt={companyName}
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            ) : (
                              <MdWorkspacePremium className="text-base" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {companyName}
                            </div>
                            <div className="text-muted-foreground text-[10px] font-mono">
                              {sub.companyId.slice(0, 13)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <AdminPlanBadge plan={sub.planId} />
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground uppercase font-mono text-[11px]">
                        {sub.provider || "STRIPE"}
                      </td>

                      <td className="px-5 py-3.5">
                        <AdminSubscriptionStatusBadge status={sub.status} />
                      </td>

                      <td className="px-5 py-3.5 text-foreground text-[11px]">
                        <div className="space-y-0.5">
                          <div>{new Date(sub.currentPeriodEnd).toLocaleDateString()}</div>
                          {sub.cancelAtPeriodEnd && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium">
                              <MdWarning className="text-xs" /> Cancels at end
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                          <span>{sub.id.slice(0, 8)}...</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(sub.id)}
                            className="p-1 hover:text-foreground transition-colors"
                            title="Copy Subscription ID"
                          >
                            {copiedId === sub.id ? (
                              <MdCheck className="text-emerald-500" />
                            ) : (
                              <MdContentCopy />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {subscriptions.length} of {total} subscriptions
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

