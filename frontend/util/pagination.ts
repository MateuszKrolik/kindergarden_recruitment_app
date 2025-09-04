export const formTargetPageUrl = (
  currentPage: number,
  totalPages: number,
  pageSize: number,
): string =>
  `?currentPage=${Math.max(1, Math.min(currentPage, totalPages))}&pageSize=${pageSize}`;

export const formPageResizeUrl = (pageSize: number) =>
  `?currentPage=1&pageSize=${pageSize}`;
