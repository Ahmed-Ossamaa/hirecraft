import Image from "next/image";
import { MdLocationOn } from "react-icons/md";
import type { WorkerProfileSearchResultDto } from "@/shared/api/generated/model";

interface CandidateCardProps {
  candidate: WorkerProfileSearchResultDto;
  onSelect: (candidateId: string) => void;
}

const getInitials = (firstName: string, lastName: string) =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "?";

export function CandidateCard({ candidate, onSelect }: CandidateCardProps) {
  const name = `${candidate.firstName} ${candidate.lastName}`.trim();
  const location = [candidate.city, candidate.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="group flex w-full items-center gap-4 rounded-xl border border-border/60 bg-card p-4 text-left shadow-sm transition hover:border-primary/40 hover:bg-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`View ${name || "candidate"}'s profile`}
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
        {candidate.avatarURL ? (
          <Image
            src={candidate.avatarURL}
            alt={name || "Candidate"}
            width={56}
            height={56}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(candidate.firstName, candidate.lastName)}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2
          onClick={() => onSelect(candidate.id)}
          className="truncate font-semibold text-foreground transition-colors group-hover:text-primary cursor-pointer"
        >
          {name || "Candidate"}
        </h2>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {candidate.title}
        </p>
        {location && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MdLocationOn className="shrink-0 text-base" />
            <span className="truncate">{location}</span>
          </p>
        )}
      </div>

      <button
        onClick={() => onSelect(candidate.id)}
        className="hidden shrink-0 text-sm font-medium text-primary sm:inline cursor-pointer"
      >
        View profile
      </button>
    </div>
  );
}
