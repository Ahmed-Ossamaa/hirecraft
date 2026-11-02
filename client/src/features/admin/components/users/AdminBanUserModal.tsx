"use client";

import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { MdWarning, MdLock, MdLockOpen } from "react-icons/md";
import type { AdminUserResponseDto } from "@/shared/api/generated/model";

interface AdminBanUserModalProps {
  user: AdminUserResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (isBanned: boolean) => Promise<void>;
  isPending: boolean;
}

export function AdminBanUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: AdminBanUserModalProps) {
  if (!user) return null;

  const willBan = !user.isBanned;

  const handleAction = async () => {
    await onConfirm(willBan);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={willBan ? "Ban User Account" : "Unban User Account"}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            willBan
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          }`}
         >
          {willBan ? (
            <MdWarning className="text-2xl shrink-0 mt-0.5" />
          ) : (
            <MdLockOpen className="text-2xl shrink-0 mt-0.5" />
          )}
          <div className="text-sm">
            <p className="font-semibold">
              {willBan
                ? "Are you sure you want to ban this user?"
                : "Restore account access for this user?"}
            </p>
            <p className="mt-1 opacity-90 text-xs">
              {willBan
                ? "Banning this user will immediately revoke active sessions and prevent them from logging in or using the platform."
                : "Unbanning this user will allow them to log in and resume using their account normally."}
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs space-y-1">
          <div>
            <span className="text-muted-foreground">User: </span>
            <span className="font-semibold text-foreground">
              {user.firstName} {user.lastName}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Email: </span>
            <span className="font-semibold text-foreground">{user.email}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Role: </span>
            <span className="font-semibold text-foreground">{user.userType}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant={willBan ? "danger" : "primary"}
            size="sm"
            onClick={handleAction}
            disabled={isPending}
            className="flex items-center gap-1.5"
          >
            {willBan ? (
              <>
                <MdLock />
                {isPending ? "Banning..." : "Confirm Ban"}
              </>
            ) : (
              <>
                <MdLockOpen />
                {isPending ? "Unbanning..." : "Confirm Unban"}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

