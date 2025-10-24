import { Configuration, ReportingApi } from "@/api-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const getReportingApi = (jwt: string): ReportingApi =>
  new ReportingApi(
    new Configuration({
      basePath: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }),
  );
