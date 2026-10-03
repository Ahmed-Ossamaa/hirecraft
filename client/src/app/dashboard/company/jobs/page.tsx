import { Metadata } from "next";
import { fetchServer } from "@/shared/lib/ssr-fetch";
import { JobWithStatsDto } from "@/shared/api/generated/model";
import { EmployerJobsList } from "@/features/jobs/components/EmployerJobsList";
import { MdWork } from "react-icons/md";

export const metadata: Metadata = {
  title: "Company Jobs | Technically",
  description: "Manage your job postings and applicants.",
};

interface GetJobsResponse {
  data: JobWithStatsDto[];
  total: number;
  page: number;
  totalPages: number;
}

export default async function EmployerJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const status =
    typeof resolvedParams.status === "string" ? resolvedParams.status : "";
  const search =
    typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const page =
    typeof resolvedParams.page === "string" ? resolvedParams.page : "1";
  const sortBy =
    typeof resolvedParams.sortBy === "string" ? resolvedParams.sortBy : "";
  const sortOrder =
    typeof resolvedParams.order === "string" ? resolvedParams.order : "";

  const query = new URLSearchParams();
  query.append("limit", "10");
  query.append("page", page);
  if (status && status !== "ALL") query.append("status", status);
  if (search) query.append("search", search);
  if (sortBy) query.append("sortBy", sortBy);
  if (sortOrder) query.append("order", sortOrder);

  const jobsRes = await fetchServer<{ data: GetJobsResponse }>(
    `/api/v1/jobs/company?${query.toString()}`,
  );
  
  const jobs = jobsRes?.data?.data || [];
  const meta = { 
    total: jobsRes?.data?.total || 0, 
    page: jobsRes?.data?.page || 1, 
    lastPage: jobsRes?.data?.totalPages || 1 
  };

  return (
    <div className="flex-1 flex flex-col py-2 w-full max-w-5xl mx-auto space-y-6 mb-5">
      <div className="flex items-center gap-3 pb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <MdWork className="text-xl" />
        </div>
        <div>
          <h1 className="text-2xl font-headline font-semibold text-foreground tracking-tight">
            Job Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create, edit, and manage your job postings and applicants.
          </p>
        </div>
      </div>

      <EmployerJobsList initialJobs={jobs} meta={meta} />
    </div>
  );
}
