import React from "react";
import Image from "next/image";
import { WorkerProfile, WorkerMachineSkill } from "@/shared/api/generated/model";
import {
  MdLocationOn,
  MdSchool,
  MdWork,
  MdDateRange,
  MdPerson,
  MdEmail,
  MdPhone,
  MdStar,
} from "react-icons/md";

interface WorkerProfilePreviewProps {
  profile: WorkerProfile;
  hideTopMargin?: boolean;
}

const renderProficiencyDots = (level: string) => {
  const maxDots = 3;
  let activeDots = 1;
  const lvl = level.toUpperCase();
  if (lvl === "INTERMEDIATE") activeDots = 2;
  if (lvl === "ADVANCED" || lvl === "EXPERT") activeDots = 3;

  return (
    <div className="flex gap-1" title={level}>
      {Array.from({ length: maxDots }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < activeDots ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
};

export const WorkerProfilePreview: React.FC<WorkerProfilePreviewProps> = ({ profile, hideTopMargin = false }) => {
  const name = `${profile.firstName || "Unknown"} ${profile.lastName || "Candidate"}`;

  // Group skills by category
  const groupedSkills =
    profile.skills?.reduce(
      (acc, skill) => {
        const categoryName = skill.categoryNameEn || "Other";
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(skill);
        return acc;
      },
      {} as Record<string, WorkerMachineSkill[]>,
    ) || {};

  return (
    <div className={`bg-background pb-20 ${hideTopMargin ? '' : 'mt-28 min-h-screen'}`}>
      {/* Header Banner */}
      <div className="bg-primary/5 border-b border-border h-28 md:h-38 relative overflow-hidden">
        {/*  Overlay */}
        <div 
          className="absolute inset-0 opacity-20  pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-primary/20 via-primary/5 to-transparent"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-10">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-input border-4 border-card shrink-0 flex items-center justify-center overflow-hidden shadow-sm relative z-10">
                {profile.avatarURL ? (
                  <Image
                    src={profile.avatarURL}
                    alt={name}
                    className="w-full h-full object-cover"
                    width={128}
                    height={128}
                    priority
                    sizes="(max-width: 768px) 96px, 128px"
                  />
                ) : (
                  <MdPerson className="text-5xl text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-4 pt-2 md:pt-4">
                <div>
                  <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-2">
                    {name}
                  </h1>
                  <p className="text-lg text-primary font-medium mt-1">
                    {profile.title || "Technician"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-4">
                  {profile.country && (
                    <div className="flex items-center gap-1.5">
                      <MdLocationOn className="text-lg" />
                      <span>{profile.city || ""}</span>
                      <span>{profile.country || ""}</span>
                    </div>
                  )}
                  {profile.dob && (
                    <div className="flex items-center gap-1.5">
                      <MdDateRange className="text-lg" />
                      <span>{new Date(profile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  )}
                  {profile.educationLevel && (
                    <div className="flex items-center gap-1.5">
                      <MdSchool className="text-lg" />
                      <span className="capitalize">
                        {profile.educationLevel.toLowerCase()}
                      </span>
                      {profile.educationDetails && (
                        <span className="capitalize">
                          - {profile.educationDetails.toLowerCase()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto pt-2 md:pt-4">
              {profile.email && (
                <a 
                  href={`mailto:${profile.email}`} 
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                  <MdEmail className="text-lg" />
                  {profile.email}
                </a>
              )}
              {profile.phone && (
                <a 
                  href={`tel:${profile.phone}`} 
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-card text-foreground rounded-xl text-sm font-medium hover:bg-input border border-border transition-colors shadow-sm"
                >
                  <MdPhone className="text-lg" />
                  {profile.phone}
                </a>
              )}
            </div>

          </div>

          {profile.bio && (
            <div className="mt-8 pt-8 border-t border-border">
              <h3 className="font-semibold text-lg mb-4 text-foreground">Executive Summary</h3>
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-2xl p-5">
                <p className="text-muted-foreground whitespace-pre-line leading-relaxed text-sm md:text-base">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-6">
            Machine Experience
          </h2>

          {Object.keys(groupedSkills).length === 0 ? (
            <div className="bg-card rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              No machine skills listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div
                  key={category}
                  className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="bg-card-hover/50 px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">
                      {category}
                    </h3>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between gap-4 pb-4 border-b border-border/40 last:pb-0 last:border-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-foreground flex items-center gap-2">
                            <span className="truncate">{skill.machineNameEn || "Unknown Machine"}</span>
                            {skill.yearsOfExperience >= 4 && (
                              <span className="shrink-0 flex items-center gap-1 text-yellow-600 bg-yellow-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                <MdStar /> Expert
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3">
                            {renderProficiencyDots(skill.experienceLevel)}
                            <span className="capitalize text-foreground/80 font-medium">
                              {skill.experienceLevel.toLowerCase().replace("_", " ")}
                            </span>
                            {skill.yearsOfExperience && (
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-border"></span>
                                {skill.yearsOfExperience} yrs
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
