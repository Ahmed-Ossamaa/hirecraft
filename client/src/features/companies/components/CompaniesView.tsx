"use client";

import React, { useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useFindAllCompanies } from "@/shared/api/generated/companies/companies";
import {
  FindAllCompanies200,
  FindAllCompaniesParams,
  CompanyListItemDto,
} from "@/shared/api/generated/model";
import { Pagination, EmptyState } from "@/shared/components/ui";
import { CompaniesFilter } from "./CompaniesFilter";
import { CompanyCard } from "./CompanyCard";
import { CompanyCardSkeleton } from "./CompanyCardSkeleton";
import { MdBusiness } from "react-icons/md";

interface CompaniesViewProps {
  initialData: FindAllCompanies200;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({ initialData }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const apiParams = useMemo(() => {
    const allowedKeys = ["search", "industry", "country", "city", "order"] as const;
    const params: Record<string, any> = {};

    allowedKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });

    const page = searchParams.get("page");
    if (page) params.page = Number(page);

    const limit = searchParams.get("limit");
    if (limit) params.limit = Number(limit);

    return params as FindAllCompaniesParams;
  }, [searchParams]);

  const { data, isLoading } = useFindAllCompanies(apiParams, {
    query: { initialData },
  });

  const res = data?.data;
  const companies: CompanyListItemDto[] = res?.data || [];
  const currentPage = res?.page || 1;
  const totalPages = res?.totalPages || 1;
  const total = res?.total ?? companies.length;

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  const handleResetFilters = () => {
    router.push(pathname, { scroll: false });
  };

  return (
    <div className="w-full">

      {/* Filter*/}
      <CompaniesFilter />

      {/* Results Count bar */}
      <div className="flex items-center justify-between mb-6 text-xs sm:text-sm text-muted-foreground">
        <span>
          Showing{" "}
          <strong className="text-foreground font-semibold">
            {isLoading ? "..." : total}
          </strong>{" "}
          {total === 1 ? "company" : "companies"}
        </span>
      </div>

      {/* companies List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MdBusiness className="text-3xl text-muted-foreground" />}
          title="No companies found"
          description="We couldn't find any companies matching your search criteria. Try clearing or relaxing your filters."
          actionText="Clear Filters"
          onAction={handleResetFilters}
          className="my-8"
        />
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
