export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PageResultWithHasNext<T> {
  data: T[];
  page: number;
  limit: number;
  hasNext: boolean;
}
