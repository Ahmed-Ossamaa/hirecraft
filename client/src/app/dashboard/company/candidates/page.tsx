import type { Metadata } from "next";
import { CandidateSearchView } from "@/features/companies/components/candidates/CandidateSearchView";

export const metadata: Metadata = {
  title: "Find Candidates | Technically",
  description: "Search worker profiles by machine, experience and location.",
};

interface CompanyCandidatesPageProps {
  searchParams: Promise<{ jobId?: string | string[] }>;
}

export default async function CompanyCandidatesPage({
  searchParams,
}: CompanyCandidatesPageProps) {
  const { jobId } = await searchParams;
  const selectedJobId = Array.isArray(jobId) ? jobId[0] : jobId;

  return <CandidateSearchView jobId={selectedJobId} />;
}
