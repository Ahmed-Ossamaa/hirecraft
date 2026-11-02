"use client";

import  { useState } from "react";
import Image from "next/image";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import {
  MdContentCopy,
  MdCheck,
  MdVerified,
  MdDangerous,
  MdEmail,
  MdPhone,
  MdCalendarToday,
} from "react-icons/md";
import type { AdminUserResponseDto } from "@/shared/api/generated/model";

interface AdminUserDetailsModalProps {
  user: AdminUserResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBanClick: () => void;
  onViewWorkerProfile?: (workerProfileId: string) => void;
}

export function AdminUserDetailsModal({
  user,
  isOpen,
  onClose,
  onToggleBanClick,
  onViewWorkerProfile,
}: AdminUserDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Profile Details" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-muted/40 border border-border">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
            {user.avatarURL ? (
              <Image
                src={user.avatarURL}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-primary">
                {user.firstName[0]}
                {user.lastName[0]}
              </span>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-foreground">
                {user.firstName} {user.lastName}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                {user.userType}
              </span>
              {user.companyName && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-secondary text-secondary-foreground border border-border">
                  Company: {user.companyName}
                  {user.companyRole ? ` (${user.companyRole})` : ""}
                </span>
              )}
              {user.workerProfileId && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                  <MdVerified className="text-xs" /> Has Profile
                </span>
              )}
              {user.isEmailVerified ? (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <MdVerified className="text-xs" /> Verified
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Unverified
                </span>
              )}
              {user.isBanned && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                  <MdDangerous className="text-xs" /> Banned
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">{user.email}</p>

            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                {user.id}
              </span>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                title="Copy User ID"
              >
                {copied ? (
                  <MdCheck className="text-emerald-500" />
                ) : (
                  <MdContentCopy />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
              Contact Information
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-foreground">
                <MdEmail className="text-muted-foreground text-sm shrink-0" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MdPhone className="text-muted-foreground text-sm shrink-0" />
                <span>{user.phoneNumber || "No phone number registered"}</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
              Personal Details
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-foreground">
                <span className="text-muted-foreground">Gender:</span>
                <span className="font-medium">{user.gender || "Not specified"}</span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span className="text-muted-foreground">Date of Birth:</span>
                <span className="font-medium">
                  {user.dob ? new Date(user.dob).toLocaleDateString() : "Not specified"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 sm:col-span-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider block">
              Timestamps & Audit
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-foreground">
                <MdCalendarToday className="text-muted-foreground text-sm shrink-0" />
                <span>
                  Registered on:{" "}
                  <strong>{new Date(user.createdAt).toLocaleString()}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MdCalendarToday className="text-muted-foreground text-sm shrink-0" />
                <span>
                  Last Updated:{" "}
                  <strong>{new Date(user.updatedAt).toLocaleString()}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button
            variant={user.isBanned ? "outline" : "danger"}
            size="sm"
            onClick={onToggleBanClick}
            className="cursor-pointer"
          >
            {user.isBanned ? "Unban User" : "Ban User"}
          </Button>

          <div className="flex items-center gap-2">
            {user.workerProfileId && onViewWorkerProfile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onViewWorkerProfile(user.workerProfileId!);
                  onClose();
                }}
                className="cursor-pointer text-primary border-primary/30 hover:bg-primary/10"
              >
                View Candidate Profile
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

