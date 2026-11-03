"use client";

import { Company, Job } from "@/shared/api/generated/model";
import {
  MdLocationOn,
  MdBusiness,
  MdPeople,
  MdEmail,
  MdPhone,
  MdLanguage,
  MdDateRange,
  MdStars,
  MdArrowForward,
} from "react-icons/md";
import { CollapsibleText } from "@/shared/components/ui/CollapsibleText";
import { Button } from "@/shared/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { PublicJobCard } from "@/features/jobs/components/public/PublicJobCard";

interface CompanyProfilePreviewProps {
  company: Company;
  jobs?: Job[];
  totalJobs?: number;
  hideTopMargin?: boolean;
}

export const CompanyProfilePreview = ({
  company,
  jobs = [],
  totalJobs,
  hideTopMargin = false,
}: CompanyProfilePreviewProps) => {
  const displayTotal = totalJobs ?? jobs.length;
  return (
    <div
      className={`bg-background pb-20 ${hideTopMargin ? "" : "min-h-screen"}`}
    >
      {/* Cover Image */}
      <div className="bg-primary/5 border-b border-border h-56 md:h-72 lg:h-80 relative overflow-hidden flex items-center justify-center">
        {company.coverUrl ? (
          <Image
            src={company.coverUrl}
            alt={`${company.name} Cover`}
            className="w-full h-full object-cover"
            width={1600}
            height={500}
            priority
            sizes="100vw"
          />
        ) : (
          <div className="w-full h-full bg-company-cover opacity-80" />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-24 relative z-10">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-card border-4 border-card shrink-0 flex items-center justify-center overflow-hidden shadow-sm">
              {company.logoUrl ? (
                <Image
                  src={company.logoUrl}
                  alt={`${company.name} Logo`}
                  className="w-full h-full object-contain p-2"
                  width={200}
                  height={200}
                  priority
                  sizes="(max-width: 768px) 96px, 128px"
                />
              ) : (
                <MdBusiness className="text-5xl text-muted-foreground" />
              )}
            </div>

            <div className="flex-1 space-y-4 pt-2 md:pt-4">
              <div>
                <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-2">
                  {company.name}
                </h1>
                {company.industry && (
                  <p className="text-lg text-primary font-medium mt-1">
                    {company.industry}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {(company.city || company.country) && (
                  <div className="flex items-center gap-1.5">
                    <MdLocationOn className="text-lg" />
                    <span>
                      {[company.city, company.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center gap-1.5">
                    <MdPeople className="text-lg" />
                    <span>{company.size}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {company.description && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg mb-2">About Us</h3>
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-5">
                <CollapsibleText text={company.description} />
              </div>
            </div>
          )}

          {/* Details & Contact */}
          {(company.email ||
            company.phone ||
            company.website ||
            company.address ||
            company.foundedYear ||
            (company.specialties && company.specialties.length > 0)) && (
            <div className="mt-8 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info */}
              {(company.email ||
                company.phone ||
                company.website ||
                company.address) && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Contact & Location
                  </h3>
                  <div className="space-y-3 text-muted-foreground text-sm">
                    {company.address && (
                      <div className="flex items-start gap-3">
                        <MdLocationOn className="text-xl shrink-0 mt-0.5 text-primary/70" />
                        <span>{company.address}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center gap-3">
                        <MdEmail className="text-xl shrink-0 text-primary/70" />
                        <a
                          href={`mailto:${company.email}`}
                          className="hover:text-primary transition-colors"
                        >
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.phone && (
                      <div className="flex items-center gap-3">
                        <MdPhone className="text-xl shrink-0 text-primary/70" />
                        <a
                          href={`tel:${company.phone}`}
                          className="hover:text-primary transition-colors"
                        >
                          {company.phone}
                        </a>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center gap-3">
                        <MdLanguage className="text-xl shrink-0 text-primary/70" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors"
                        >
                          {company.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(company.foundedYear ||
                (company.specialties && company.specialties.length > 0)) && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Company Details
                  </h3>
                  <div className="space-y-4 text-muted-foreground text-sm">
                    {company.foundedYear && (
                      <div className="flex items-center gap-3">
                        <MdDateRange className="text-xl shrink-0 text-primary/70" />
                        <span>Founded in {company.foundedYear}</span>
                      </div>
                    )}
                    {company.specialties && company.specialties.length > 0 && (
                      <div>
                        <div className="flex items-center gap-3 mb-2.5">
                          <MdStars className="text-xl shrink-0 text-primary/70" />
                          <span>Specialties</span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-8">
                          {company.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="bg-secondary/30 text-secondary-foreground border border-border px-2.5 py-1 rounded-md text-xs font-medium"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Open Positions */}
        {jobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-headline font-semibold text-foreground">
                  Recent Open Positions
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Showing {jobs.length} of {displayTotal}{" "}
                  {displayTotal === 1 ? "opening" : "openings"}
                </p>
              </div>

              {displayTotal > jobs.length && (
                <Link href={`/jobs?companyId=${company.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<MdArrowForward className="text-xs" />}
                  >
                    View All ({displayTotal})
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <PublicJobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
