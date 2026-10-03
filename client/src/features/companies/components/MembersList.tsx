"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyMember, CompanyMemberRole } from "@/shared/api/generated/model";
import { Button, Pagination } from "@/shared/components/ui";
import {
  MdPersonAdd,
  MdDeleteOutline,
  MdAdminPanelSettings,
  MdWorkOutline,
  MdPerson,
} from "react-icons/md";
import { formatTimeAgo } from "@/shared/lib/formatTimeAgo";
import {
  useRemoveMember,
  useUpdateMemberRole,
  useSuspendMember,
  useActivateMember,
} from "@/shared/api/generated/company-members/company-members";
import { toast } from "sonner";
import { InviteMemberModal } from "./InviteMemberModal";
import { useAuthStore } from "@/shared/stores/auth-store";
import { useConfirm } from "@/shared/providers/confirm-provider";

interface MembersListProps {
  initialMembers: CompanyMember[];
  currentPage?: number;
  totalPages?: number;
  currentStatus?: "ACTIVE" | "PENDING" | "SUSPENDED";
}

export const MembersList: React.FC<MembersListProps> = ({
  initialMembers,
  currentPage = 1,
  totalPages = 1,
  currentStatus = "ACTIVE",
}) => {
  const [members, setMembers] = useState<CompanyMember[]>(initialMembers);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const organizationId = useAuthStore((s) => s.organizationId);
  const companyRole = useAuthStore((s) => s.companyRole);

  const isCurrentUserAdmin = companyRole === "ADMIN";
  const canInviteMembers =
    isCurrentUserAdmin || companyRole === "HIRING_MANAGER";

  const router = useRouter();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();

  const removeMutation = useRemoveMember();
  const suspendMutation = useSuspendMember();
  const activateMutation = useActivateMember();
  const updateRoleMutation = useUpdateMemberRole();

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", status);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
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
      setMembers(members.filter((m) => m.userId !== memberId));
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
      setMembers(members.filter((m) => m.userId !== memberId));
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
      setMembers(members.filter((m) => m.userId !== memberId));
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
      setMembers(
        members.map((m) =>
          m.userId === memberId ? { ...m, role: newRole } : m,
        ),
      );
      toast.success("Role updated successfully");
    } catch (error) {
      toast.error("Failed to update role");
    }
  };

  const getRoleIcon = (role: CompanyMemberRole) => {
    switch (role) {
      case "ADMIN":
        return <MdAdminPanelSettings className="text-primary" />;
      case "HIRING_MANAGER":
        return <MdWorkOutline className="text-secondary" />;
      default:
        return <MdPerson className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-4 border-b border-border/40 w-full mb-2 h-10">
            {!canInviteMembers ? (
              <button className="pb-2 px-1 border-b-2 text-sm font-medium transition-colors border-primary text-foreground">
                Current Members
              </button>
            ) : (
              ["ACTIVE", "PENDING", "SUSPENDED"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`pb-2 px-1 border-b-2 text-sm font-medium transition-colors ${
                    currentStatus === tab
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "ACTIVE"
                    ? "Active"
                    : tab === "PENDING"
                      ? "Pending"
                      : "Suspended"}
                </button>
              ))
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

      <div className="bg-card rounded-xl border border-border/40 shadow-sm transition-opacity opacity-100">
        <div className="overflow-x-auto pb-24 lg:pb-0 lg:overflow-visible">
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
                <tr
                  key={member.id}
                  className="hover:bg-card-hover/20 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      {member.firstName} {member.lastName}
                      {member.userId === user?.id && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full uppercase tracking-wider">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {member.email}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                    {formatTimeAgo(member.joinedAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-xs">
                      {getRoleIcon(member.role)}
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(
                            member.userId,
                            e.target.value as CompanyMemberRole,
                          )
                        }
                        disabled={
                          member.userId === user?.id || !isCurrentUserAdmin
                        }
                        className="bg-transparent border-none outline-none cursor-pointer text-foreground font-medium disabled:cursor-not-allowed"
                      >
                        <option
                          value="ADMIN"
                          className="bg-card text-foreground "
                        >
                          Admin
                        </option>
                        <option
                          value="HIRING_MANAGER"
                          className="bg-card text-foreground"
                        >
                          Hiring Manager
                        </option>
                        <option
                          value="STAFF"
                          className="bg-card text-foreground"
                        >
                          Staff
                        </option>
                      </select>
                    </div>
                  </td>
                  {isCurrentUserAdmin && (
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        {member.userId !== user?.id &&
                          currentStatus === "ACTIVE" && (
                            <Button
                              variant="ghost"
                              onClick={() =>
                                handleSuspend(
                                  member.userId,
                                  `${member.firstName} ${member.lastName}`,
                                )
                              }
                              className="text-xs px-2 py-1 h-8 rounded-lg"
                            >
                              Suspend
                            </Button>
                          )}
                        {member.userId !== user?.id &&
                          currentStatus === "SUSPENDED" && (
                            <Button
                              variant="ghost"
                              onClick={() =>
                                handleActivate(
                                  member.userId,
                                  `${member.firstName} ${member.lastName}`,
                                )
                              }
                              className="text-xs px-2 py-1 h-8 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              Unsuspend
                            </Button>
                          )}
                        {member.userId !== user?.id && (
                          <Button
                            variant="ghost"
                            onClick={() =>
                              handleRemove(
                                member.userId,
                                `${member.firstName} ${member.lastName}`,
                              )
                            }
                            className="w-8 h-8 p-0 text-red-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg inline-flex items-center justify-center shrink-0"
                            title={
                              currentStatus === "PENDING"
                                ? "Cancel Invite"
                                : "Remove Permanently"
                            }
                          >
                            <MdDeleteOutline className="text-lg" />
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
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

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};
