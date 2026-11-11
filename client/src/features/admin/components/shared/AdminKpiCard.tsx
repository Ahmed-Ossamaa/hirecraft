import Link from "next/link";
import { DeltaBadge } from "./DeltaBadge";
import { MdArrowForward } from "react-icons/md";

interface AdminKpiCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconClassName: string;
  delta?: number | null;
  footer: React.ReactNode;
  href?: string;
}

export function AdminKpiCard({
  title,
  value,
  icon,
  iconClassName,
  delta,
  footer,
  href,
}: AdminKpiCardProps) {
  return (
    <div className="p-5 rounded-2xl border border-border bg-card  hover:border-primary/40 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </span>

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${iconClassName}`}
          >
            {icon}
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {value}
          </span>

          <DeltaBadge delta={delta} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs">
        {footer}

        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline shrink-0"
          >
            View
            <MdArrowForward className="text-xs" />
          </Link>
        )}
      </div>
    </div>
  );
}
