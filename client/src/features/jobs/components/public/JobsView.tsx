"use client";

import React, { useMemo } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useFindAll } from '@/shared/api/generated/jobs/jobs';
import { FindAll200, FindAllParams, Job } from '@/shared/api/generated/model';
import { Pagination } from '@/shared/components/ui';
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

  const res= data?.data
  const jobs = res?.data || [];
  const currentPage = res?.page || 1;
  const totalPages = res?.totalPages || 1;
  const totalJobs = res?.total ?? jobs.length;
  
  // Find the currently selected job
  const selectedJob = useMemo(() => {
    if (jobIdParam) {
      return jobs.find((j: Job) => j.id === jobIdParam) || null;
    }
    // Default to the first job if none selected
    return jobs.length > 0 ? jobs[0] : null;
  }, [jobIdParam, jobs]);

  // Update URL when a job is clicked
  const handleJobSelect = (id: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('jobId', id);
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  };

  if (isLoading && !jobs.length) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-120px)] min-h-150 animate-pulse">
        <div className="lg:col-span-4 lg:col-start-1 bg-card border border-border rounded-2xl"></div>
        <div className="lg:col-span-8 bg-card border border-border rounded-2xl hidden lg:block"></div>
      </div>
    );
  }

  return (
    <>
      <JobsFilter />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-120px-100px)] min-h-150">
        
        {/* Left Pane: Job List */}
      <div className="lg:col-span-4 flex flex-col h-125 lg:h-full bg-background/50 rounded-2xl overflow-hidden border border-border">
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


      {/* Right Pane: Job Detail (Sticky on Desktop) */}
      <div className="lg:col-span-8 flex flex-col h-150 lg:h-full overflow-hidden">
        <JobDetail job={selectedJob} />
      </div>
    </div>
    </>
  );
};
