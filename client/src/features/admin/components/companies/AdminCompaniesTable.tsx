"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import { useGetCompanies } from "@/shared/api/generated/admin-companies/admin-companies";
import type {
  AdminCompanyResponseDto,
  GetCompaniesOrder,
} from "@/shared/api/generated/model";
import { TableSkeleton } from "@/shared/components/ui/TableSkeleton";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Pagination } from "@/shared/components/ui/Pagination";
import { Button } from "@/shared/components/ui/Button";
import { AdminCompanyFilters } from "./AdminCompanyFilters";
import { AdminCompanyDetailsModal } from "./AdminCompanyDetailsModal";
import { AdminCompanyMembersModal } from "./AdminCompanyMembersModal";
import { AdminPlanBadge } from "../billing/AdminPlanBadge";
import {
  MdBusiness,
  MdVisibility,
  MdOpenInNew,
  MdArrowUpward,
  MdArrowDownward,
  MdGroup,
  MdWorkOutline,
} from "react-icons/md";

type SortDirection = "asc" | "desc";

export function AdminCompaniesTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [industry, setIndustry] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [selectedCompany, setSelectedCompany] =
    useState<AdminCompanyResponseDto | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedCompanyForMembers, setSelectedCompanyForMembers] =
    useState<AdminCompanyResponseDto | null>(null);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const { data, isLoading, isError } = useGetCompanies(
    {
      page,
      limit: 10,
      search: debouncedSearch || undefined,
      country: country || undefined,
      city: city || undefined,
      industry: industry || undefined,
      order: (sortDirection.toUpperCase() as GetCompaniesOrder) || undefined,
    },
    {
      query: {
        staleTime: 30 * 1000,
      },
    },
  );

  const companies = (data?.data?.data as AdminCompanyResponseDto[]) || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const toggleSortDate = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setCountry("");
    setCity("");
    setIndustry("");
    setSortDirection("desc");
    setPage(1);
  };

  const handleOpenDetails = (company: AdminCompanyResponseDto) => {
    setSelectedCompany(company);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-4">
      <AdminCompanyFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        country={country}
        onCountryChange={(v) => {
          setCountry(v);
          setPage(1);
        }}
        city={city}
        onCityChange={(v) => {
          setCity(v);
          setPage(1);
        }}
        industry={industry}
        onIndustryChange={(v) => {
          setIndustry(v);
          setPage(1);
        }}
        onReset={handleResetFilters}
      />

      {isLoading ? (
        <TableSkeleton rows={8} />
      ) : isError ? (
        <div className="p-8 text-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
          Failed to load companies list. Please refresh or try again.
        </div>
      ) : companies.length === 0 ? (
        <EmptyState
          icon={<MdBusiness className="text-3xl text-muted-foreground" />}
          title="No companies found"
          description="Try adjusting your search criteria or resetting location filters."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Company</th>
                  <th className="px-5 py-3.5">Location</th>
                  {/* <th className="px-5 py-3.5">Industry</th> */}
                  <th className="px-5 py-3.5">Current Plan</th>
                  <th className="px-5 py-3.5">Active Members</th>
                  <th className="px-5 py-3.5">Active Jobs</th>
                  <th
                    className="px-5 py-3.5 cursor-pointer select-none hover:text-foreground"
                    onClick={toggleSortDate}
                  >
                    <div className="flex items-center">
                      Created Date
                      {sortDirection === "asc" ? (
                        <MdArrowUpward className="text-primary text-xs ml-1" />
                      ) : (
                        <MdArrowDownward className="text-primary text-xs ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {companies.map((company) => {
                  const plan = company.subscriptionPlan ?? undefined;
                  const location = [company.city, company.country]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr
                      key={company.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden shrink-0 relative">
                            {company.logoUrl ? (
                              <Image
                                src={company.logoUrl}
                                alt={company.name}
                                fill
                                sizes="36px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <MdBusiness className="text-base text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {company.name}
                            </div>
                            <div className="text-muted-foreground text-[11px] truncate max-w-45">
                              {company.industry}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                        {location || "—"}
                      </td>

                      <td className="px-5 py-3.5">
                        <AdminPlanBadge plan={plan} />
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCompanyForMembers(company);
                            setIsMembersModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20 cursor-pointer"
                          title="View company team members"
                        >
                          <MdGroup className="text-sm" />
                          <span>{company.memberCount ?? 0}</span>
                        </button>
                      </td>

                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/admin/jobs?companyId=${company.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors border border-primary/20"
                          title="View jobs for this company"
                        >
                          <MdWorkOutline className="text-sm" />
                          <span>{company.jobCount ?? 0}</span>
                        </Link>
                      </td>

                      <td className="px-5 py-3.5 text-muted-foreground text-[11px]">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetails(company)}
                            className="h-8 px-2 text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
                            title="View Details"
                          >
                            <MdVisibility className="text-sm" />
                          </Button>
                          <Link
                            href={`/company/${company.id}`}
                            target="_blank"
                            className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            title="Public Profile"
                          >
                            <MdOpenInNew className="text-sm" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>
              Showing {companies.length} of {total} companies
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {/* Details Modal */}
      <AdminCompanyDetailsModal
        company={selectedCompany}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        subscriptionPlan={selectedCompany?.subscriptionPlan ?? undefined}
      />

      {/* Team Members Modal */}
      <AdminCompanyMembersModal
        company={selectedCompanyForMembers}
        isOpen={isMembersModalOpen}
        onClose={() => {
          setIsMembersModalOpen(false);
          setSelectedCompanyForMembers(null);
        }}
      />
    </div>
  );
}
