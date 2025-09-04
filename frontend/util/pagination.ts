export const formTargetPageUrl = (
  currentPage: number,
  totalPages: number,
  pageSize: number,
): string =>
  `?currentPage=${Math.max(1, Math.min(currentPage, totalPages))}&pageSize=${pageSize}`;
