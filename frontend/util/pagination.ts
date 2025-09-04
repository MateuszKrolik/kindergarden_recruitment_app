export const formTargetPageUrl = (
  pageNumber: number,
  pageSize: number,
): string => `?pageNumber=${pageNumber}&pageSize=${pageSize}`;

export const formPageResizeUrl = (pageSize: number) =>
  `?pageNumber=1&pageSize=${pageSize}`;
