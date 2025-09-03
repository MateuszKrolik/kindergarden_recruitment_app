export type PagedResponse<T> = {
  items: T[];
  total: number;
  pageNumber: number;
  pageSize: number;
  more: boolean;
};
