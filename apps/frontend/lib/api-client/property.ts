import { Configuration, PropertyApi } from "@/api-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const getPropertyApi = (jwt: string): PropertyApi =>
  new PropertyApi(
    new Configuration({
      basePath: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }),
  );
