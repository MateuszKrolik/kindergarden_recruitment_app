import { components } from "@/client/schema";

export type ApiResponse<T> =
  | { data: T; error: undefined }
  | { data: undefined; error: components["schemas"]["HTTPError"] };
