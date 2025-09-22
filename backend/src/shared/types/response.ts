export type AsyncResponseType<T> = Promise<
  { data: T; error: undefined } | { data: undefined; error: Error }
>;

export type SyncResponseType<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: Error };
