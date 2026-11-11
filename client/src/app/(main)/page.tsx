import { Metadata } from "next";
import { HeroSection } from "@/features/landing/components/HeroSection";
import { JobFeedSection } from "@/features/landing/components/JobFeedSection";
import { DualCTASection } from "@/features/landing/components/DualCTASection";
import { Job } from "@/shared/api/generated/model/job";

export const metadata: Metadata = {
  title: "Technically | The Premier Job Board for Factory Operators",
  description: "Connect with local manufacturing plants and production lines. Direct placement for CNC operators, maintenance technicians, and precision machinists.",
  openGraph: {
    images: [{ url: "/og-placeholder.jpg" }],
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let initialJobs: Job[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/jobs?limit=9`, {
      cache: "no-store",
    });
    const result = await res.json();
    if (result?.data?.data && Array.isArray(result.data.data)) {
      initialJobs = result.data.data;
    }
  } catch (error) {
    console.error(
      "[Home Page] Failed to fetch initial jobs",
      error instanceof Error ? error.name : "Unknown error",
    );
  }

  return (
    <div className="flex flex-col w-full bg-background text-foreground selection:bg-primary selection:text-white">
      <HeroSection />
      <JobFeedSection initialJobs={initialJobs} />
      <DualCTASection />
    </div>
  );
}
