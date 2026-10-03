"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobApplication } from '@/shared/api/generated/model';
import { useUpdateStatus } from '@/shared/api/generated/job-applications/job-applications';
import { toast } from 'sonner';
import { formatTimeAgo } from '@/shared/lib/formatTimeAgo';
import { MdLocationOn, MdPersonOutline } from 'react-icons/md';
import { Pagination } from '@/shared/components/ui';
import { WorkerProfileSlideOver } from './WorkerProfileSlideOver';

interface JobApplicantsViewProps {
  initialApplications: JobApplication[];
  jobId: string;
  currentPage?: number;
  totalPages?: number;
}

export const JobApplicantsView: React.FC<JobApplicantsViewProps> = ({ 
  initialApplications, 
  currentPage = 1,
  totalPages = 1
}) => {
  const [applications, setApplications] = useState<JobApplication[]>(initialApplications);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateStatusMutation = useUpdateStatus();

  // Sync state when initialApplications changes (e.g. from SSR pagination)
  useEffect(() => {
    setApplications(initialApplications);
  }, [initialApplications]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = async (applicationId: string, newStatus: any) => {
    const previousApplications = [...applications];
    setApplications(apps => apps.map(app => 
      app.id === applicationId ? { ...app, status: newStatus } : app
    ));

    try {
      await updateStatusMutation.mutateAsync({ 
        id: applicationId, 
        data: { status: newStatus } 
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      // Revert on error
      setApplications(previousApplications);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'bg-green-500/10 text-green-600 border-green-200';
      case 'REJECTED': return 'bg-red-500/10 text-red-600 border-red-200';
      case 'REVIEWING': return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default: return 'bg-yellow-500/10 text-yellow-600 border-yellow-200'; // PENDING
    }
  };

  return (
    <>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-card-hover/50 border-b border-border/60">
              <tr>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium max-w-xs">Cover Letter</th>
                <th className="pr-10 py-3 font-medium text-right ">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-card-hover/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <button 
                      onClick={() => setSelectedApplicantId(app.workerProfileId)}
                      className="font-medium text-foreground hover:text-primary transition-colors block text-left cursor-pointer"
                    >
                      {app.applicantName || 'Unknown Candidate'}
                    </button>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <MdLocationOn className="shrink-0" />
                      {app.workerTitle || 'Machinist'}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-muted-foreground">
                    {formatTimeAgo(app.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    {app.coverLetter ? (
                      <div className="text-xs text-muted-foreground line-clamp-2 italic" title={app.coverLetter}>
                        "{app.coverLetter}"
                      </div>
                    ) : (
                      <span className="text-muted-foreground/50 italic text-xs">No cover letter</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${getStatusColor(app.status)}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MdPersonOutline className="text-4xl mb-3 opacity-50" />
                      <p className="font-medium">No applicants yet</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 0 && (
          <div className="flex justify-center items-center mt-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

      <WorkerProfileSlideOver
        isOpen={!!selectedApplicantId}
        onClose={() => setSelectedApplicantId(null)}
        workerProfileId={selectedApplicantId}
      />
    </>
  );
};
