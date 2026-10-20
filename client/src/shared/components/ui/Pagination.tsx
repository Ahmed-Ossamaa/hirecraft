import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { cn } from "@/shared/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages < 1) return null;

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5 py-2", className)}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Previous Page"
        title="prev"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-medium transition cursor-pointer",
          "border-border bg-card text-foreground hover:bg-card-hover",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
        )}
      >
        <FiChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Items */}
      {pages.map((page, idx) => {
        if (typeof page === "string") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-8 flex items-center justify-center text-xs text-muted-foreground select-none"
            >
              …
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "w-8 h-8 rounded-lg text-xs font-mono font-medium transition flex items-center justify-center border cursor-pointer",
              isCurrent
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card text-foreground border-border hover:bg-card-hover"
            )}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        aria-label="Next Page"
        title="next"
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-medium transition  cursor-pointer",
          "border-border bg-card text-foreground hover:bg-card-hover",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-card"
        )}
      >
        <FiChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
