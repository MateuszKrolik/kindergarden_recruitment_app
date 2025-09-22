export type PagedResponse<T> = {
  items: T[];
  total: number;
  page_number: number;
  page_size: number;
  has_next_page: boolean;
  has_previous_page: boolean;
  total_pages: number;
};

export function newPagedResponse<T>(
  items: T[],
  total: number,
  pageNumber: number,
  pageSize: number,
): PagedResponse<T> {
  let totalPages = 0;
  if (total > 0 && pageSize > 0) {
    totalPages = Math.ceil(total / pageSize);
  }

  return {
    items: items,
    total: total,
    page_number: pageNumber,
    page_size: pageSize,
    has_next_page: pageNumber < totalPages,
    has_previous_page: pageNumber > 1,
    total_pages: totalPages,
  };
}
