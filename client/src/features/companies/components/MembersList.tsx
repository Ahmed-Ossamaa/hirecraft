"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyMember, CompanyMemberRole } from "@/shared/api/generated/model";
import { Button, Pagination, Tabs, TableSkeleton } from "@/shared/components/ui";
import {
  MdPersonAdd,
} from "react-icons/md";
import {
  useGetMembers,
  getGetMembersQueryKey,
} from "@/shared/api/generated/company-members/company-members";
import { 
  useRemoveMember, 
  useUpdateMemberRole, 
  useSuspendMember, 
  useActivateMember 
} from "@/features/companies/api/useMemberMutations";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { InviteMemberModal } from "./InviteMemberModal";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useConfirm } from "@/shared/providers/confirm-provider";
import { MemberTableRow } from "./MemberTableRow";

export const MembersList: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const organizationId = useAuthStore((s) => s.organizationId);
  const companyRole = useAuthStore((s) => s.companyRole);

  const isCurrentUserAdmin = companyRole === "ADMIN";
  const canInviteMembers =
    isCurrentUserAdmin || companyRole === "HIRING_MANAGER";

  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get("page")) || 1;
  const currentStatus = searchParams.get("status") || "ACTIVE";
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const { data: membersRes, isLoading } = useGetMembers({
    page: pageParam,
    limit: 10,
    status: currentStatus as any,
  });
  
  const members = (membersRes?.data?.data || []) as CompanyMember[];
  const currentPage = membersRes?.data?.page || 1;
  const totalPages = membersRes?.data?.totalPages || 1;

  const removeMutation = useRemoveMember();
  const suspendMutation = useSuspendMember();
  const activateMutation = useActivateMember();
  const updateRoleMutation = useUpdateMemberRole();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleRemove = async (memberId: string, memberName?: string) => {
    const isConfirmed = await confirm({
      title: "Remove Member",
      message: `Are you sure you want to permanently remove ${memberName || "this member"}?`,
      confirmText: "Remove",
      variant: "danger",
    });
    if (!isConfirmed) return;
    try {
      await removeMutation.mutateAsync({ userId: memberId });
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const handleSuspend = async (memberId: string, memberName?: string) => {
    const isConfirmed = await confirm({
      title: "Suspend Member",
      message: `Are you sure you want to suspend ${memberName || "this member"}? They will temporarily lose access.`,
      confirmText: "Suspend",
      variant: "danger",
    });
    if (!isConfirmed) return;
    try {
      await suspendMutation.mutateAsync({ userId: memberId });
      toast.success("Member suspended successfully");
    } catch (error) {
      toast.error("Failed to suspend member");
    }
  };

  const handleActivate = async (memberId: string, memberName?: string) => {
    const isConfirmed = await confirm({
      title: "Unsuspend Member",
      message: `Are you sure you want to unsuspend ${memberName || "this member"} and restore their access?`,
      confirmText: "Unsuspend",
      variant: "primary",
    });
    if (!isConfirmed) return;
    try {
      await activateMutation.mutateAsync({ userId: memberId });
      toast.success("Member unsuspended successfully");
    } catch (error) {
      toast.error("Failed to unsuspend member");
    }
  };

  const handleRoleChange = async (
    memberId: string,
    newRole: CompanyMemberRole,
  ) => {
    try {
      await updateRoleMutation.mutateAsync({
        userId: memberId,
        data: { role: newRole },
      });
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex w-full">
            {!canInviteMembers ? (
              <div className="flex gap-4 border-b border-border/40 w-full mb-2 h-10">
                <button className="pb-2 px-1 border-b-2 text-sm font-medium transition-colors border-primary text-foreground">
                  Current Members
                </button>
              </div>
            ) : (
              <Tabs
                tabs={[
                  { id: "ACTIVE", label: "Active" },
                  { id: "PENDING", label: "Pending" },
                  { id: "SUSPENDED", label: "Suspended" },
                ]}
                activeTab={currentStatus}
                onTabChange={handleTabChange}
              />
            )}
          </div>
          {canInviteMembers && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              size="sm"
              leftIcon={<MdPersonAdd className="text-lg" />}
              className="shrink-0 mb-2 ml-4"
            >
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : (
        <div className="bg-card rounded-xl border border-border/40 shadow-sm transition-opacity opacity-100">
          <div className="overflow-x-auto pb-24">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
              <tr>
                <th className="px-5 py-3 font-medium">Member</th>
                <th className="px-5 py-3 font-medium">
                  {currentStatus === "PENDING" ? "Invited" : "Joined"}
                </th>
                <th className="px-5 py-3 font-medium">Role</th>
                {isCurrentUserAdmin && (
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {members.map((member) => (
                <MemberTableRow
                  key={member.id}
                  member={member}
                  currentUserId={user?.id}
                  isCurrentUserAdmin={isCurrentUserAdmin}
                  currentStatus={currentStatus as "ACTIVE" | "PENDING" | "SUSPENDED"}
                  onRoleChange={handleRoleChange}
                  onSuspend={handleSuspend}
                  onActivate={handleActivate}
                  onRemove={handleRemove}
                />
              ))}
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={isCurrentUserAdmin ? 4 : 3}
                    className="px-5 py-8 text-center text-muted-foreground"
                  >
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="px-5 py-4 border-t border-border/40 flex justify-center items-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
      )}

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() })}
      />
    </div>
  );
};
