"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Modal } from "@/shared/components/ui/Modal";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Button } from "@/shared/components/ui/Button";
import { useGetCompanyMembers } from "@/shared/api/generated/admin-companies/admin-companies";
import type {
  CompanyResponseDto,
  CompanyMemberResponseDto,
} from "@/shared/api/generated/model";
import { MdGroup, MdVerified, MdBusiness } from "react-icons/md";

interface AdminCompanyMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyResponseDto | null;
}

export function AdminCompanyMembersModal({
  isOpen,
  onClose,
  company,
}: AdminCompanyMembersModalProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetCompanyMembers(
    company?.id || "",
    {
      page,
      limit: 10,
    },
    {
      query: {
        enabled: isOpen && !!company?.id,
        staleTime: 30 * 1000,
      },
    }
  );

  if (!company) return null;

  const members = (data?.data?.data as CompanyMemberResponseDto[]) || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "HIRING_MANAGER":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "PENDING":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-destructive/10 text-destructive border-destructive/20";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Team Members — ${company.name}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={company.name}
                  fill
                  sizes="40px"
                  className="object-contain p-1"
                />
              ) : (
                <MdBusiness className="text-xl text-primary" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-sm text-foreground">
                {company.name}
              </h4>
              <p className="text-xs text-muted-foreground">
                Total Members: <strong className="text-foreground">{total}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<MdGroup className="text-3xl text-muted-foreground" />}
            title="No team members found"
            description="This company currently has no registered team members."
          />
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-foreground">
                            {m.firstName || m.lastName
                              ? `${m.firstName || ""} ${m.lastName || ""}`.trim()
                              : "User"}
                          </div>
                          <div className="text-muted-foreground text-[11px]">
                            {m.email || m.userId}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getRoleBadgeClass(
                            m.role
                          )}`}
                        >
                          {m.role}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadgeClass(
                            m.status
                          )}`}
                        >
                          {m.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {new Date(m.joinedAt || m.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-3 border-t border-border flex justify-end">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
