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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border transition-colors"
        >
          <MdArrowBack /> Back
        </Link>
      </div>
      <WorkerProfilePreview profile={profile} hideTopMargin={true} />
    </div>
  );
}
