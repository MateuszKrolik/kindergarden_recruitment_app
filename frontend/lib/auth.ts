import { betterAuth } from "better-auth";
import { pool } from "@/data-access-layer/db/db";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import bcrypt from "bcryptjs";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      hash: (password: string) => bcrypt.hash(password, 14),
      verify: async ({ hash, password }: { hash: string; password: string }) =>
        bcrypt.compare(password, hash),
    },
  },
  database: pool,
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [nextCookies(), jwt()],
  // TODO: FIGURE OUT HOW TO BYPASS BETTERAUTH CATCH ALL ROUTE ERROR WHEN BUILDING WITH DOCKER
  // secondaryStorage: {
  //   get: async (key) => {
  //     return await redisClient.get(key);
  //   },
  //   set: async (key, value, ttl) => {
  //     if (ttl) await redisClient.set(key, value, { EX: ttl });
  //     // or for ioredis:
  //     // if (ttl) await redis.set(key, value, 'EX', ttl)
  //     else await redisClient.set(key, value);
  //   },
  //   delete: async (key) => {
  //     await redisClient.del(key);
  //   },
  // },
});
