export type UserType = "CANDIDATE" | "EMPLOYER" | "PLATFORM_ADMIN";

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
