'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CompanyMember, CompanyMemberRole } from '@/shared/api/generated/model';
import { Button } from '@/shared/components/ui/Button';
import { Pagination } from '@/shared/components/ui/Pagination';
import { Tabs } from '@/shared/components/ui/Tabs';
import { TableSkeleton } from '@/shared/components/ui/TableSkeleton';
import { MdGroup, MdPersonAdd } from 'react-icons/md';
import {
  useGetMembers,
  getGetMembersQueryKey,
} from '@/shared/api/generated/company-members/company-members';
import {
  useRemoveMember,
  useUpdateMemberRole,
  useSuspendMember,
  useActivateMember,
} from '@/features/companies/api/useMemberMutations';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiError } from '@/shared/utils/error';
import { InviteMemberModal } from './InviteMemberModal';
import { useAuthStore } from '@/shared/stores/auth-store';
import { useConfirm } from '@/shared/providers/confirm-provider';
import { MemberTableRow } from './MemberTableRow';

const memberStatusTabs = [
  { id: 'ALL', label: 'All' },
  { id: 'ACTIVE', label: 'Active' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'SUSPENDED', label: 'Suspended' },
  { id: 'DEACTIVATED', label: 'Deactivated' },
] as const;

type MemberStatusTab = (typeof memberStatusTabs)[number]['id'];

export const MembersList: React.FC = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const companyRole = useAuthStore((s) => s.companyRole);

  const isCurrentUserAdmin = companyRole === 'ADMIN';
  const canInviteMembers =
    isCurrentUserAdmin || companyRole === 'HIRING_MANAGER';

  const router = useRouter();
  const searchParams = useSearchParams();
  const pageParam = Number(searchParams.get('page')) || 1;
  const requestedStatus = searchParams.get('status');
  const currentStatus: MemberStatusTab =
    memberStatusTabs.find(({ id }) => id === requestedStatus)?.id ?? 'ALL';
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  const membersQueryParams =
    currentStatus === 'ALL'
      ? { page: pageParam, limit: 10 }
      : { page: pageParam, limit: 10, status: currentStatus };
  
  const { data: membersRes, isLoading } = useGetMembers(membersQueryParams);

  const members = (membersRes?.data?.data || []) as CompanyMember[];
  const currentPage = membersRes?.data?.page || 1;
  const totalPages = membersRes?.data?.totalPages || 1;
  const total = membersRes?.data?.total || 0;

  const removeMutation = useRemoveMember();
  const suspendMutation = useSuspendMember();
  const activateMutation = useActivateMember();
  const updateRoleMutation = useUpdateMemberRole();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleTabChange = (status: string) => {
    const selectedStatus = memberStatusTabs.find(({ id }) => id === status)?.id;
    if (!selectedStatus) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('status', selectedStatus);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleRemove = async (memberId: string, memberName?: string) => {
    const isConfirmed = await confirm({
      title: 'Remove Member',
      message: `Are you sure you want to permanently remove ${memberName || 'this member'}?`,
      confirmText: 'Remove',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await removeMutation.mutateAsync({ userId: memberId });
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to remove member'));
    }
  };

  const handleSuspend = async (memberId: string, memberName?: string) => {
    const isConfirmed = await confirm({
      title: 'Suspend Member',
      message: `Are you sure you want to suspend ${memberName || 'this member'}? They will temporarily lose access.`,
      confirmText: 'Suspend',
      variant: 'danger',
    });
    if (!isConfirmed) return;
    try {
      await suspendMutation.mutateAsync({ userId: memberId });
      toast.success('Member suspended successfully');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to suspend member'));
    }
  };

  const handleActivate = async (
    memberId: string,
    memberName: string,
    status: CompanyMember['status'],
  ) => {
    const action = status === 'DEACTIVATED' ? 'reactivate' : 'unsuspend';
    const actionLabel = action === 'reactivate' ? 'Reactivate' : 'Unsuspend';
    const isConfirmed = await confirm({
      title: `${actionLabel} Member`,
      message: `Are you sure you want to ${action} ${memberName}? They will regain access if your company has an available member seat.`,
      confirmText: actionLabel,
      variant: 'primary',
    });
    if (!isConfirmed) return;
    try {
      await activateMutation.mutateAsync({ userId: memberId });
      toast.success(
        action === 'reactivate'
          ? 'Member reactivated successfully'
          : 'Member unsuspended successfully',
      );
    } catch (error) {
      toast.error(
        getApiError(
          error,
          action === 'reactivate'
            ? 'Failed to reactivate member'
            : 'Failed to unsuspend member',
        ),
      );
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
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error(getApiError(error, 'Failed to update role'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdGroup className="text-xl" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
              Team Members
            </h1>
            {isLoading ? (
              <span className="w-14 h-5 bg-muted/60 animate-pulse rounded-full inline-block align-middle" />
            ) : (
              <span className="text-xs text-muted-foreground font-medium">
                ({total} {total === 1 ? 'member' : 'members'})
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage who has access to your company dashboard.
          </p>
        </div>
      </div>

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
                tabs={[...memberStatusTabs]}
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
          <div className="overflow-x-auto pb-2">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest [&>tr>th:first-child]:rounded-tl-xl [&>tr>th:last-child]:rounded-tr-xl">
                <tr>
                  <th className="px-5 py-3 font-medium">Member</th>
                  <th className="px-5 py-3 font-medium">
                    {currentStatus === 'ALL'
                      ? 'Added'
                      : currentStatus === 'PENDING'
                        ? 'Invited'
                        : 'Joined'}
                  </th>
                  {requestedStatus === 'DEACTIVATED' && (
                    <th className="px-5 py-3 font-medium">Deactivated</th>
                  )}
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  {isCurrentUserAdmin && (
                    <th className="px-5 py-3 font-medium text-right">
                      Actions
                    </th>
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
                    showDeactivated={requestedStatus === 'DEACTIVATED'}
                    onRoleChange={handleRoleChange}
                    onSuspend={handleSuspend}
                    onActivate={handleActivate}
                    onRemove={handleRemove}
                  />
                ))}
                {members.length === 0 && (
                  <tr>
                    <td
                      colSpan={isCurrentUserAdmin ? 5 : 4}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      No members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages >= 1 && (
        <div className="flex justify-center items-center pt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: getGetMembersQueryKey() })
        }
      />
    </div>
  );
};
