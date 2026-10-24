/**
 * Converts a date string or Date object into a short relative time string.
 * Examples: "just now", "1m ago", "5h ago", "2d ago", "3w ago", "4mo ago", "1y ago".
 */
export function formatTimeAgo(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return "";

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 10) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 4.35) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30.44);
  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365.25);
  return `${years}y ago`;
}


  export function formatDate (dateStr?: string | null) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };