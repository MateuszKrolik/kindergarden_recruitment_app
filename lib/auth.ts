import { betterAuth } from "better-auth";
import { pool } from "./db";
import { authSchema } from "./auth-schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: pool,
  schema: authSchema,
  plugins: [nextCookies()],
});
