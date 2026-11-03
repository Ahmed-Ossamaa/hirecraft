"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Modal } from "@/shared/components/ui/Modal";
import { Button } from "@/shared/components/ui/Button";
import {
  MdContentCopy,
  MdCheck,
  MdBusiness,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdLanguage,
  MdCalendarToday,
  MdGroup,
  MdOpenInNew,
} from "react-icons/md";
import type { AdminCompanyResponseDto } from "@/shared/api/generated/model";
import { useAdminGetCompanyById } from "@/shared/api/generated/admin-companies/admin-companies";
import { CollapsibleText } from "@/shared/components/ui/CollapsibleText";
import { AdminPlanBadge } from "../billing/AdminPlanBadge";
import { formatDate } from "@/shared/utils/date-utils";

interface AdminCompanyDetailsModalProps {
  company: AdminCompanyResponseDto | null;
  isOpen: boolean;
  onClose: () => void;
  subscriptionPlan?: string;
  jobCount?: number;
}

export function AdminCompanyDetailsModal({
  company,
  isOpen,
  onClose,
  subscriptionPlan,
  jobCount: initialJobCount,
}: AdminCompanyDetailsModalProps) {
  const [copied, setCopied] = useState(false);

  const { data: detailsData } = useAdminGetCompanyById(company?.id || "", {
    query: {
      enabled: isOpen && Boolean(company?.id),
      staleTime: 30 * 1000,
    },
  });

  if (!company) return null;

  const fullCompany = (detailsData?.data as AdminCompanyResponseDto) || company;

  const handleCopyId = () => {
    navigator.clipboard.writeText(company.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const memberCount = fullCompany.memberCount ?? 0;
  const totalJobs = fullCompany.jobCount ?? initialJobCount ?? 0;
  const currentPlan = subscriptionPlan || fullCompany.subscriptionPlan || undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Profile Details"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header summary */}
        <div className="relative rounded-xl overflow-hidden border border-border">
          {fullCompany.coverUrl ? (
            <div className="h-24 w-full relative bg-muted">
              <Image
                src={fullCompany.coverUrl}
                alt={fullCompany.name}
                fill
                sizes="(max-width: 672px) 100vw, 672px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-full bg-linear-to-r from-primary/10 via-primary/5 to-transparent" />
          )}

          <div className="p-4 bg-muted/40 flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-card border border-border flex items-center justify-center overflow-hidden shrink-0 relative shadow-sm">
              {fullCompany.logoUrl ? (
                <Image
                  src={fullCompany.logoUrl}
                  alt={fullCompany.name}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : (
                <MdBusiness className="text-2xl text-primary" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-foreground">
                  {fullCompany.name}
                </h3>
                {fullCompany.industry && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-primary/10 text-primary border border-primary/20">
                    {fullCompany.industry}
                  </span>
                )}
                {currentPlan && (
                  <span>
                    <AdminPlanBadge plan={currentPlan} />
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-muted-foreground">
                {(fullCompany.city || fullCompany.country) && (
                  <span className="flex items-center gap-1">
                    <MdLocationOn />
                    {[fullCompany.city, fullCompany.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                )}
                {fullCompany.size && (
                  <span>Size: {fullCompany.size} employees</span>
                )}
                {fullCompany.foundedYear && (
                  <span>Est. {fullCompany.foundedYear}</span>
                )}
              </div>

              <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
                  {fullCompany.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  title="Copy Company ID"
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
        </div>

        {/* Description */}
        {fullCompany.description && (
          <div className="p-3.5 rounded-xl border border-border bg-card">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] block mb-1">
              About
            </span>
            <CollapsibleText
              text={fullCompany.description}
              className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line"
            />
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] block">
              Contact & Web
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-foreground">
                <MdEmail className="text-muted-foreground text-sm shrink-0" />
                <span>
                  {fullCompany.email || company.email || "No email provided"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MdPhone className="text-muted-foreground text-sm shrink-0" />
                <span>
                  {fullCompany.phone || company.phone || "No phone provided"}
                </span>
              </div>
              {fullCompany.website && (
                <div className="flex items-center gap-2 text-foreground">
                  <MdLanguage className="text-muted-foreground text-sm shrink-0" />
                  <a
                    href={fullCompany.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {fullCompany.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] block">
              Activity & Counts
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-foreground">
                <span className="text-muted-foreground flex items-center gap-1">
                  <MdGroup /> Team Members:
                </span>
                <span className="font-semibold">{memberCount}</span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span className="text-muted-foreground">Total Jobs:</span>
                <span className="font-semibold">{totalJobs}</span>
              </div>
              <div className="flex items-center justify-between text-foreground">
                <span className="text-muted-foreground">Subscription:</span>
                <span className="font-semibold">
                  {currentPlan ?? "None"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 sm:col-span-2">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px] block">
              Timestamps
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-foreground">
                <MdCalendarToday className="text-muted-foreground text-sm shrink-0" />
                <span>
                  Registered on:{" "}
                  <strong>{formatDate(fullCompany.createdAt)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <MdCalendarToday className="text-muted-foreground text-sm shrink-0" />
                <span>
                  Last Updated:{" "}
                  <strong>{formatDate(fullCompany.updatedAt)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Link
            href={`/company/${fullCompany.id}`}
            target="_blank"
            className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-medium"
          >
            Open Public Company Profile
            <MdOpenInNew className="text-xs" />
          </Link>

          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
