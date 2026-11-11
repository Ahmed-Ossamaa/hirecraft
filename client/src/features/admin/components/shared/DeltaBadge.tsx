import { MdTrendingDown, MdTrendingFlat, MdTrendingUp } from "react-icons/md";

interface DeltaBadgeProps {
  delta?: number | null;
  emptyLabel?: string;
}

export function DeltaBadge({ delta, emptyLabel }: DeltaBadgeProps) {
  if (delta == null) {
    return emptyLabel ? (
      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
        {emptyLabel}
      </span>
    ) : null;
  }

  const isPositive = delta > 0;
  const isNegative = delta < 0;

  const colorClass = isPositive
    ? " text-emerald-600 dark:text-emerald-400 "
    : isNegative
      ? " text-rose-600 dark:text-rose-400 "
      : " text-muted-foreground ";

  const Icon = isPositive
    ? MdTrendingUp
    : isNegative
      ? MdTrendingDown
      : MdTrendingFlat;

  return (
    <span
      className={`inline-flex items-center gap-1 mx-1  text-xs font-semibold  ${colorClass}`}
    >
      <Icon className="text-sm shrink-0" />
      {delta > 0 ? "+" : ""}
      {delta}%
    </span>
  );
}
