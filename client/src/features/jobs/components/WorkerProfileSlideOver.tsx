import React from "react";
import { SlideOver } from "@/shared/components/ui/SlideOver";
import { useQuery } from "@tanstack/react-query";
import { getGetProfileByIdQueryOptions } from "@/shared/api/generated/worker-profiles/worker-profiles";
import { WorkerProfilePreview } from "@/features/worker-profiles/components/WorkerProfilePreview";
import { MdRefresh } from "react-icons/md";

interface WorkerProfileSlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  workerProfileId: string | null;
}

export const WorkerProfileSlideOver: React.FC<WorkerProfileSlideOverProps> = ({
  isOpen,
  onClose,
  workerProfileId,
}) => {
  const { data, isLoading, isError, refetch } = useQuery({
    ...getGetProfileByIdQueryOptions(workerProfileId!),
    enabled: !!workerProfileId && isOpen,
  });

  const profile = data?.data;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Profile"
      width="max-w-4xl"
    >
      <div className="h-full bg-background relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {isError && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
            <p className="text-red-500 mb-4">Failed to load profile.</p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <MdRefresh /> Try again
            </button>
          </div>
        )}

        {profile && <WorkerProfilePreview profile={profile} hideTopMargin={true} />}
      </div>
    </SlideOver>
  );
};
