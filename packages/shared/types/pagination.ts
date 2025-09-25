export type PagedResponse<T> = {
  items: T[];
  total: number;
  page_number: number;
  page_size: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  total_pages: number;
};
