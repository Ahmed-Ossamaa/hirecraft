"use client";

import React from "react";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import { EmployerApplicationResponseDto } from "@/shared/api/generated/model";
import { formatDate } from "@/shared/utils/date-utils";
import { FiFileText } from "react-icons/fi";
import { MdPersonOutline } from "react-icons/md";
import Image from "next/image";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: EmployerApplicationResponseDto | null;
  onViewProfile?: (workerProfileId: string) => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  isOpen,
  onClose,
  application,
  onViewProfile,
}) => {
  if (!application) return null;

  const initials = application.applicantName
    ? application.applicantName
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application Cover Letter"
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          {onViewProfile && application.workerProfileId && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<MdPersonOutline className="text-base" />}
              onClick={() => {
                onClose();
                onViewProfile(application.workerProfileId);
              }}
            >
              View Full Profile
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Applicant Header summary */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-card-hover border border-border/60">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-xs shrink-0 overflow-hidden">
            {application.applicantAvatar ? (
              <Image
                src={application.applicantAvatar}
                alt={application.applicantName || "Candidate"}
                className="object-cover"
                width={40}
                height={40}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-foreground text-sm truncate">
              {application.applicantName || "Unknown Candidate"}
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate">{application.workerTitle || "Candidate"}</span>
              {application.createdAt && (
                <>
                  <span>•</span>
                  <span>Applied {formatDate(application.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Cover Letter Content */}
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3 text-xs font-mono uppercase tracking-wider text-primary font-semibold">
            <FiFileText className="text-sm" />
            Candidate Message
          </div>
          <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto custom-scrollbar">
            {application.coverLetter || "No cover letter provided."}
          </div>
        </div>
      </div>
    </Modal>
  );
};
