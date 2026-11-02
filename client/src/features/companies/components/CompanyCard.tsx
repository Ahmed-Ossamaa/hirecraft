"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MdLocationOn, MdBusiness, MdArrowForward } from "react-icons/md";
import { CompanyListItemDto } from "@/shared/api/generated/model";
import { Button } from "@/shared/components/ui/Button";

interface CompanyCardProps {
  company: CompanyListItemDto;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company }) => {
  const locationText = [company.city, company.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group flex flex-col h-full bg-card rounded-2xl border border-border/70 hover:border-primary/50 shadow-sm hover:shadow-lg hover:shadow-black/20 transition-all duration-300 overflow-hidden">
      {/* Cover Image */}
      <div className="h-28 sm:h-32 w-full relative overflow-hidden bg-card-hover border-b border-border/40">
        {company.coverUrl ? (
          <Image
            src={company.coverUrl}
            alt={`${company.name} cover`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-company-cover opacity-80" />
        )}
      </div>

      {/* Logo & Info */}
      <div className="px-5 -mt-8 relative z-10 flex items-end justify-between gap-3">
        <div className="w-16 h-16 rounded-xl bg-card  shadow-md flex items-center justify-center overflow-hidden shrink-0">
          {company.logoUrl ? (
            <Image
              src={company.logoUrl}
              alt={`${company.name} logo`}
              width={64}
              height={64}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase font-mono">
              <MdBusiness className="text-xl" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Company Title */}
          <Link href={`/company/${company.id}`} className="block group/title">
            <h3 className="font-headline font-semibold text-base sm:text-lg text-foreground group-hover/title:text-primary transition-colors line-clamp-1">
              {company.name}
            </h3>
          </Link>

          {/* Industry */}
          <div className="min-h-6">
            {company.industry ? (
              <span className="text-[12px] text-muted-foreground">
                {company.industry}
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground italic">
                General Manufacturing
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
            <MdLocationOn className="text-primary/80 shrink-0 text-sm" />
            <span className="truncate">
              {locationText || "Location not specified"}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-5 pt-4 border-t border-border/50">
          <Link href={`/company/${company.id}`} className="block w-full">
            <Button
              variant="outline"
              size="sm"
              fullWidth
              rightIcon={<MdArrowForward className="text-sm transition-transform group-hover:translate-x-0.5" />}
              className="font-medium hover:bg-primary hover:text-background hover:border-primary transition-all duration-200"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
