import {
  createClient,
  type RedisClientType as RedisClientTypeGeneric,
  type RedisDefaultModules,
  type RedisFunctions,
  type RedisScripts,
} from "redis";

export type RedisClientType = RedisClientTypeGeneric<
  RedisDefaultModules,
  RedisFunctions,
  RedisScripts,
  2 // RESP2
>;

interface RedisClients {
  redisClient: RedisClientType;
  redisSubscriber: RedisClientType;
}

export async function createRedisClients(): Promise<RedisClients> {
  const redisURL = process.env.REDIS_URL;

  const redisClient: RedisClientType = createClient({
    url: redisURL,
    RESP: 2, // always returns arrays for sMembers
  });
  await redisClient.connect();

  const redisSubscriber: RedisClientType = redisClient.duplicate();
  await redisSubscriber.connect();

  return {
    redisClient,
    redisSubscriber,
  };
}
