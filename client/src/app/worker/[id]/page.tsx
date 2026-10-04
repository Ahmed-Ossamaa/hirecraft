import React from "react";
import { Metadata } from "next";
import { fetchServer } from "@/shared/lib/ssr-fetch";
import { WorkerProfile } from "@/shared/api/generated/model";
import { MdArrowBack } from "react-icons/md";
import Link from "next/link";
import { WorkerProfilePreview } from "@/features/worker-profiles/components/WorkerProfilePreview";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { id } = await props.params;
  const res = await fetchServer<{ data: WorkerProfile }>(
    `/api/v1/worker-profiles/${id}`,
  );
  const profile = res?.data;

  return {
    title: profile
      ? `${profile.firstName || "Candidate"} ${profile.lastName || ""} | Technically`
      : "Candidate Profile | Technically",
  };
}

export default async function WorkerPublicProfilePage(props: PageProps) {
  const { id } = await props.params;
  const res = await fetchServer<{ data: WorkerProfile }>(
    `/api/v1/worker-profiles/${id}`,
  );
  const profile = res?.data;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-headline text-red-500">
            Profile Not Found
          </h1>
          <p className="text-muted-foreground">
            The candidate profile you are looking for does not exist.
          </p>
          <Link
            href="/dashboard"
            className="text-primary hover:underline font-medium block"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Floating Back Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-background/80 hover:bg-background backdrop-blur-md text-foreground rounded-full border border-border shadow-sm transition-all"
          title="Dashboard"
        >
          <MdArrowBack className="text-xl" />
          <span className="font-medium text-sm hidden sm:inline">Dashboard</span>
        </Link>
      </div>
      <WorkerProfilePreview profile={profile} hideTopMargin={true} />
    </div>
  );
}
