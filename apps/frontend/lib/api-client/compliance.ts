import { Configuration, ComplianceApi } from "@/api-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";

export const getComplianceApi = (jwt: string): ComplianceApi =>
  new ComplianceApi(
    new Configuration({
      basePath: BACKEND_URL,
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }),
  );
