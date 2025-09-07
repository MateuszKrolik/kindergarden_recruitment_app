import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

await redisClient.connect();

export type RedisClientType = typeof redisClient;
