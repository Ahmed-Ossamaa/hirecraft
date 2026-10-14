import { Suspense } from "react";
import type { Metadata } from "next";
import { CompaniesView } from "@/features/companies/components/CompaniesView";
import { getCompanies } from "@/features/companies/api/getCompanies";
import { FindAllCompaniesParams } from "@/shared/api/generated/model";

export const metadata: Metadata = {
  title: "Explore Companies | Technically",
  description:
    "Browse Companies and manufacturing employers .",
};

interface CompaniesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CompaniesPage(props: CompaniesPageProps) {
  const searchParams = await props.searchParams;
  const allowedStringKeys = ["search", "industry", "country", "city", "order"] as const;
  const apiParams: FindAllCompaniesParams = {};

  allowedStringKeys.forEach((key) => {
    const val = searchParams[key];
    if (typeof val === "string" && val.trim() !== "") {
      apiParams[key] = val.trim() as any;
    }
  });

  if (searchParams.page) {
    const pageNum = Number(searchParams.page);
    if (!isNaN(pageNum) && pageNum > 0) {
      apiParams.page = pageNum;
    }
  }

  if (searchParams.limit) {
    const limitNum = Number(searchParams.limit);
    if (!isNaN(limitNum) && limitNum > 0) {
      apiParams.limit = limitNum;
    }
  }

  const initialData = await getCompanies(apiParams);

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 w-full max-w-360 mx-auto px-6 py-6 md:py-8">
        <Suspense
          fallback={
            <div className="animate-pulse h-150 bg-card rounded-2xl w-full" />
          }
        >
          <CompaniesView initialData={initialData} />
        </Suspense>
      </div>
    </main>
  );
}
