import createClient, { type Client } from "openapi-fetch";
import type { paths } from "./schema";

export const getApiClient = (jwt: string): Client<paths> =>
  createClient<paths>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
