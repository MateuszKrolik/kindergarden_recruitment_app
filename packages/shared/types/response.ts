export type HTTPError = {
  code: number;
  message: string;
};

export type ApiResponse<T> = Promise<
  { data: T; error: undefined } | { data: undefined; error: HTTPError }
>;

// Direct DB operations only
export type AsyncResponseType<T> = Promise<
  { data: T; error: undefined } | { data: undefined; error: Error }
>;

export type SyncResponseType<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: Error };
