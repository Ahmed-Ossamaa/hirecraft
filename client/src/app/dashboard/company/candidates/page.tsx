import type { Metadata } from "next";
import { CandidateSearchView } from "@/features/companies/components/candidates/CandidateSearchView";

export const metadata: Metadata = {
  title: "Find Candidates | Technically",
  description: "Search worker profiles by machine experience and location.",
};

export default function CompanyCandidatesPage() {
  return <CandidateSearchView />;
}
