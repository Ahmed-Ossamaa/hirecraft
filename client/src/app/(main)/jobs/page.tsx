import React, { Suspense } from "react";
import { JobsView } from "@/features/jobs/components/JobsView";
import { getJobs } from "@/features/jobs/api/getJobs";

import { FindAllParams } from "@/shared/api/generated/model";

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage(props: JobsPageProps) {
  const searchParams = await props.searchParams;
  const allowedStringKeys = ['search', 'experienceLevel', 'jobType', 'country', 'city', 'companyId', 'order'] as const;
  const apiParams: FindAllParams = {};
  
  allowedStringKeys.forEach((key) => {
    if (searchParams[key]) apiParams[key] = searchParams[key] as any;
  });
  if (searchParams.page) apiParams.page = Number(searchParams.page);
  if (searchParams.limit) apiParams.limit = Number(searchParams.limit);
  if (searchParams.yearsOfExperience) apiParams.yearsOfExperience = Number(searchParams.yearsOfExperience);

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
