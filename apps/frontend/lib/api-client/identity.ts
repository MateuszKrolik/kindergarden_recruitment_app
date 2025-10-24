import { Configuration, IdentityApi } from "@/api-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const getIdentityApi = (jwt: string): IdentityApi =>
  new IdentityApi(
    new Configuration({
      basePath: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }),
  );
