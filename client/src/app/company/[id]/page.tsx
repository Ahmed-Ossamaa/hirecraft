import { Metadata } from "next";
import { fetchServer } from "@/shared/lib/ssr-fetch";
import { Company, Job } from "@/shared/api/generated/model";
import Link from "next/link";
import { CompanyProfilePreview } from "@/features/companies/components/CompanyProfilePreview";
import { FloatingBackButton } from "@/shared/components/ui";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const res = await fetchServer<{ data: Company }>(`/api/v1/companies/${id}`);
  const company = res?.data;

  return {
    title: company
      ? `${company.name}'s Profile | Technically`
      : "Company Profile | Technically",
    description: company?.description
      ? `${company?.description?.slice(0, 160)}...`
      : `Explore ${company?.name ?? "Company's profile"},
       a company in ${company?.industry ?? "manufacturing"}.
        Discover its profile and available job opportunities on Technically.`,
  };
}

export default async function CompanyPublicProfilePage(props: PageProps) {
  const { id } = await props.params;

  // Fetch company details and their public jobs
  const [companyRes, jobsRes] = await Promise.all([
    fetchServer<{ data: Company }>(`/api/v1/companies/${id}`),
    fetchServer<{ data: { data: Job[]; total: number } }>(
      `/api/v1/jobs?companyId=${id}&limit=5`,
    ),
  ]);

  const company = companyRes?.data;
  const jobs = jobsRes?.data?.data || [];
  const totalJobs = jobsRes?.data?.total ?? jobs.length;

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-headline text-red-500">
            Company Not Found
          </h1>
          <p className="text-muted-foreground">
            The company profile you are looking for does not exist.
          </p>
          <Link
            href="/jobs"
            className="text-primary hover:underline font-medium block"
          >
            Return to Job Board
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Back Button */}
      <FloatingBackButton />

      <CompanyProfilePreview
        company={company}
        jobs={jobs}
        totalJobs={totalJobs}
        hideTopMargin={true}
      />
    </div>
  );
}
