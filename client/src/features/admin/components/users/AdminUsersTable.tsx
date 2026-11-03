"use client";

import { useState } from "react";
import Image from "next/image";
import { useDebounce } from "use-debounce";
import { useGetUsers } from "@/shared/api/generated/admin-manage-users/admin-manage-users";
import {
  AdminUserResponseDto,
  GetUsersUserType,
} from "@/shared/api/generated/model";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Button } from "@/shared/components/ui/Button";
import { Tabs } from "@/shared/components/ui/Tabs";
import { AdminUserFilters } from "./AdminUserFilters";
import { AdminBanUserModal } from "./AdminBanUserModal";
import { AdminUserDetailsModal } from "./AdminUserDetailsModal";
import { WorkerProfileSlideOver } from "@/features/jobs/components/applicants/WorkerProfileSlideOver";
import { useAdminMutations } from "../../hooks/useAdminMutations";
import {
  MdLock,
  MdLockOpen,
  MdVisibility,
  MdVerified,
  MdDangerous,
  MdGroup,
} from "react-icons/md";

export function AdminUsersTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [userType, setUserType] = useState("ALL");
  const [banStatus, setBanStatus] = useState("ALL");
  const [emailVerified, setEmailVerified] = useState("ALL");

  const [selectedUser, setSelectedUser] = useState<AdminUserResponseDto | null>(null);
  const [selectedWorkerProfileId, setSelectedWorkerProfileId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);

  const { banUser, isBanningUser } = useAdminMutations();

  const isBannedParam =
    banStatus === "BANNED" ? true : banStatus === "ACTIVE" ? false : undefined;
  const isEmailVerifiedParam =
    emailVerified === "VERIFIED"
      ? true
      : emailVerified === "UNVERIFIED"
      ? false
      : undefined;
  const userTypeParam =
    userType !== "ALL" ? (userType as GetUsersUserType) : undefined;
  const isEmployerTab = userType === GetUsersUserType.EMPLOYER;

  const { data, isLoading, isError } = useGetUsers(
    {
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      userType: userTypeParam,
      isBanned: isBannedParam,
      isEmailVerified: isEmailVerifiedParam,
    },
    {
      query: {
        staleTime: 60 * 1000,
      },
    }
  );

  const users = (data?.data?.data as AdminUserResponseDto[]) || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleResetFilters = () => {
    setSearch("");
    setBanStatus("ALL");
    setEmailVerified("ALL");
    setPage(1);
  };

  const handleOpenDetails = (user: AdminUserResponseDto) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const handleOpenBanModal = (user: AdminUserResponseDto) => {
    setSelectedUser(user);
    setIsBanModalOpen(true);
  };

  const handleConfirmBan = async (willBan: boolean) => {
    if (!selectedUser) return;
    await banUser(selectedUser.id, { isBanned: willBan });
    setSelectedUser((prev) => (prev ? { ...prev, isBanned: willBan } : null));
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { id: "ALL", label: "All Users" },
          { id: GetUsersUserType.EMPLOYER, label: "Employers" },
          { id: GetUsersUserType.CANDIDATE, label: "Candidates" },
          { id: GetUsersUserType.PLATFORM_ADMIN, label: "Admins" },
        ]}
        activeTab={userType}
        onTabChange={(id) => {
          setUserType(id);
          setPage(1);
        }}
      />

      <AdminUserFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        banStatus={banStatus}
        onBanStatusChange={(v) => {
          setBanStatus(v);
          setPage(1);
        }}
        emailVerified={emailVerified}
        onEmailVerifiedChange={(v) => {
          setEmailVerified(v);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          Failed to load users list. Please refresh or try again.
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<MdGroup className="text-3xl text-muted-foreground" />}
          title="No users found"
          description="Try adjusting your search criteria or resetting filters."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  {isEmployerTab && <th className="px-5 py-3.5">Company</th>}
                  <th className="px-5 py-3.5">Email Status</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                          {user.avatarURL ? (
                            <Image
                              src={user.avatarURL}
                              alt={`${user.firstName} ${user.lastName}`}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <span className="font-bold text-primary text-xs">
                              {user.firstName?.[0]}
                              {user.lastName?.[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          {user.workerProfileId ? (
                            <button
                              type="button"
                              onClick={() => setSelectedWorkerProfileId(user.workerProfileId ?? null)}
                              className="font-semibold text-foreground hover:text-primary hover:underline text-left cursor-pointer inline-flex items-center gap-1.5 group"
                              title="View Public Worker Profile"
                            >
                              <span>
                                {user.firstName} {user.lastName}
                              </span>
                              <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                Profile
                              </span>
                            </button>
                          ) : (
                            <div className="font-semibold text-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                          )}
                          <div className="text-muted-foreground text-[11px]">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                        {user.userType}
                      </span>
                    </td>

                    {isEmployerTab && (
                      <td className="px-5 py-3.5">
                        {user.companyName ? (
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {user.companyName}
                            </span>
                            {user.companyRole && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {user.companyRole}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-5 py-3.5">
                      {user.isEmailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <MdVerified className="text-xs" /> Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-500 font-medium">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      {user.isBanned ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                          <MdDangerous className="text-xs" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                          Active
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetails(user)}
                          className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                          title="View Details"
                        >
                          <MdVisibility className="text-sm" />
                        </Button>
                        <Button
                          variant='ghost'
                          size="icon"
                          onClick={() => handleOpenBanModal(user)}
                          className="px-2 text-xs flex items-center"
                          title={user.isBanned ? "Unban User" : "Ban User"}
                        >
                          {user.isBanned ? (
                            <>
                              <MdLockOpen className="text-sm" /> 
                            </>
                          ) : (
                            <>
                              <MdLock className="text-sm text-red-500" />
                            </>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {users.length} of {total} registered users
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Modals */}
      <AdminBanUserModal
        user={selectedUser}
        isOpen={isBanModalOpen}
        onClose={() => setIsBanModalOpen(false)}
        onConfirm={handleConfirmBan}
        isPending={isBanningUser}
      />

      <AdminUserDetailsModal
        user={selectedUser}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onToggleBanClick={() => {
          setIsDetailsOpen(false);
          setIsBanModalOpen(true);
        }}
        onViewWorkerProfile={(profileId) => setSelectedWorkerProfileId(profileId)}
      />

      <WorkerProfileSlideOver
        isOpen={!!selectedWorkerProfileId}
        onClose={() => setSelectedWorkerProfileId(null)}
        workerProfileId={selectedWorkerProfileId}
      />
    </div>
  );
}

