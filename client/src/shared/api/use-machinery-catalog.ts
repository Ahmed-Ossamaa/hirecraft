"use client";

import { useQuery } from "@tanstack/react-query";
import type { Machine, MachineCategory } from "@/shared/api/generated/model";
import { getMachineCategories } from "@/shared/api/generated/machine-categories/machine-categories";
import { getMachines } from "@/shared/api/generated/machines/machines";

interface PaginatedData<T> {
  data: T[];
  totalPages: number;
}

interface PaginatedResponse<T> {
  data: PaginatedData<T>;
}

async function fetchAllPages<T>(
  fetchPage: (
    page: number,
    signal: AbortSignal,
  ) => Promise<PaginatedResponse<T>>,
  signal: AbortSignal,
): Promise<T[]> {
  const firstPage = await fetchPage(1, signal);
  const results = [...firstPage.data.data];

  for (let page = 2; page <= firstPage.data.totalPages; page += 1) {
    const result = await fetchPage(page, signal);
    results.push(...result.data.data);
  }

  return results;
}

export function useMachineryCatalog(enabled = true) {
  return useQuery({
    queryKey: ["machinery-analytics", "catalog"],
    queryFn: async ({ signal }) => {
      const [machines, categories] = await Promise.all([
        fetchAllPages<Machine>(
          (page, requestSignal) =>
            getMachines({ page, limit: 100 }, undefined, requestSignal),
          signal,
        ),
        fetchAllPages<MachineCategory>(
          (page, requestSignal) =>
            getMachineCategories(
              { page, limit: 100 },
              undefined,
              requestSignal,
            ),
          signal,
        ),
      ]);

      return { machines, categories };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}
