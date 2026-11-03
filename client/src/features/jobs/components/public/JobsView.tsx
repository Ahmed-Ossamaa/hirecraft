"use client";

import React, { useMemo, useState, useEffect } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useFindAll } from '@/shared/api/generated/jobs/jobs';
import { FindAll200, FindAllParams, Job } from '@/shared/api/generated/model';
import { Pagination } from '@/shared/components/ui/Pagination';
import { SlideOver } from '@/shared/components/ui/SlideOver';
import { CompactJobCard } from './CompactJobCard';
import { JobDetail } from './JobDetail';
import { JobsFilter } from './JobsFilter';

interface JobsViewProps {
  initialData: FindAll200;
}

export const JobsView: React.FC<JobsViewProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get('jobId');

  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobIdParam);
  const [isMobileSlideOverOpen, setIsMobileSlideOverOpen] = useState(false);

  useEffect(() => {
    if (jobIdParam) {
      setSelectedJobId(jobIdParam);
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setIsMobileSlideOverOpen(true);
      }
    }
  }, [jobIdParam]);

  const apiParams = useMemo(() => {
    const allowedStringKeys = ['search', 'experienceLevel', 'jobType', 'country', 'city', 'companyId', 'order'] as const;
    const params: Record<string, any> = {};
    
    allowedStringKeys.forEach((key) => {
      const val = searchParams.get(key);
      if (val) params[key] = val;
    });
    
    const page = searchParams.get('page');
    if (page) params.page = Number(page);
    
    const limit = searchParams.get('limit');
    if (limit) params.limit = Number(limit);

    const yearsOfExperience = searchParams.get('yearsOfExperience');
    if (yearsOfExperience) params.yearsOfExperience = Number(yearsOfExperience);
    
    return params as FindAllParams;
  }, [searchParams]);

  //pass apiParams so React Query re-fetches when query params change
  const { data, isLoading } = useFindAll(
    apiParams,
    { query: { initialData } }
  );

  const res = data?.data;
  const jobs = res?.data || [];
  const currentPage = res?.page || 1;
  const totalPages = res?.totalPages || 1;
  const totalJobs = res?.total ?? jobs.length;
  
  // Find the currently selected job
  const selectedJob = useMemo(() => {
    if (selectedJobId) {
      const found = jobs.find((j: Job) => j.id === selectedJobId);
      if (found) return found;
    }
    // Default to the first job if none selected
    return jobs.length > 0 ? jobs[0] : null;
  }, [selectedJobId, jobs]);

  // Update URL and state when a job is clicked without triggering Next.js RSC re-fetch
  const handleJobSelect = (id: string) => {
    setSelectedJobId(id);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('jobId', id);
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);

      if (window.innerWidth < 1024) {
        setIsMobileSlideOverOpen(true);
      }
    }
  };

  const handleCloseSlideOver = () => {
    setIsMobileSlideOverOpen(false);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('jobId');
      const newQuery = params.toString();
      const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  if (isLoading && !jobs.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-120px-100px)] min-h-150 animate-pulse">
        <div className="col-span-12 lg:col-span-4 bg-card border border-border rounded-2xl h-[calc(100vh-280px)] min-h-125 lg:h-full"></div>
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl hidden lg:block"></div>
      </div>
    );
  }

  return (
    <>
      <JobsFilter />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-120px-100px)] min-h-150">
        
        {/* Left Pane: Job List */}
        <div className="col-span-12 lg:col-span-4 flex flex-col h-[calc(100vh-280px)] min-h-125 lg:h-full bg-background/50 rounded-2xl overflow-hidden border border-border">
          <div className="p-4 border-b border-border bg-card-hover shrink-0">
            <h1 className="font-headline text-xl text-foreground">Active Roles</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {totalJobs} open position{totalJobs === 1 ? '' : 's'}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {jobs.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground text-sm">
                No active jobs found.
              </div>
            ) : (
              jobs.map((job: Job) => (
                <CompactJobCard
                  key={job.id}
                  job={job}
                  isActive={selectedJob?.id === job.id}
                  onClick={() => handleJobSelect(job.id)}
                />
              ))
            )}
          </div>

          {totalPages > 0 && (
            <div className="p-3 border-t border-border bg-card-hover/50 shrink-0">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        {/* Right Pane: Job Detail (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-8 flex-col h-full overflow-hidden">
          <JobDetail job={selectedJob} />
        </div>
      </div>

      {/* Mobile/Tablet Drawer SlideOver */}
      <SlideOver
        isOpen={isMobileSlideOverOpen && !!selectedJob}
        onClose={handleCloseSlideOver}
        title={selectedJob?.title || "Job Details"}
        width="max-w-4xl"
      >
        <div className="h-full bg-card">
          <JobDetail job={selectedJob} isModal={true} />
        </div>
      </SlideOver>
    </>
  );
};
