import { Suspense } from "react";
import type { Metadata } from "next";
import { JobsView } from "@/features/jobs/components/public/JobsView";
import { getJobs } from "@/features/jobs/api/getJobs";
import { FindAllParams } from "@/shared/api/generated/model";

export const metadata: Metadata = {
  title: "Explore Jobs | Technically",
  description:
    "Discover manufacturing, machining, and technical jobs with industrial employers. Find opportunities that match your skills.",
};

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage(props: JobsPageProps) {
  const searchParams = await props.searchParams;
  const allowedStringKeys = [
    "search",
    "experienceLevel",
    "jobType",
    "country",
    "city",
    "companyId",
    "order",
  ] as const;
  const apiParams: FindAllParams = {};

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
  if (searchParams.yearsOfExperience) {
    const yearsOfExperienceNum = Number(searchParams.yearsOfExperience);
    if (!isNaN(yearsOfExperienceNum) && yearsOfExperienceNum >= 0) {
      apiParams.yearsOfExperience = yearsOfExperienceNum;
    }
  }

  const initialData = await getJobs(apiParams);

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 w-full max-w-360 mx-auto px-6 py-6 md:py-8">
        <Suspense
          fallback={
            <div className="animate-pulse h-150 bg-card rounded-2xl w-full"></div>
          }
        >
          <JobsView initialData={initialData} />
        </Suspense>
      </div>
    </main>
  );
}
