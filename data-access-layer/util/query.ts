import { Pool, QueryResult, QueryResultRow } from "pg";
import { catchError, catchErrorSync } from "./error";
import { RedisClientType } from "../db/redis-client";

export async function withCacheAsideRedis<T>(
  client: RedisClientType,
  cacheKey: string,
  fetchFn: () => Promise<{ data?: T; error?: Error }>,
  ttlSeconds = 3600 * 24,
): Promise<{ data?: T; error?: Error }> {
  const [error, cachedData] = await catchError(client.get(cacheKey));
  if (error) console.error(`Redis GET error: ${error}`);

  if (cachedData) {
    console.log("Redis was hit!");
    const [jsonParseErr, parsedJson] = catchErrorSync(() =>
      JSON.parse(cachedData),
    );
    if (!jsonParseErr) {
      return { data: parsedJson as T, error: undefined };
    }
    console.error(`Redis GET parse error: ${jsonParseErr}`);
  }

  return await withWriteThroughRedisCache(
    client,
    cacheKey,
    fetchFn,
    ttlSeconds,
  );
}

export async function withWriteThroughRedisCache<T>(
  client: RedisClientType,
  cacheKey: string,
  fetchFn: () => Promise<{ data?: T; error?: Error }>,
  ttlSeconds = 3600 * 24,
): Promise<{ data?: T; error?: Error }> {
  const { data, error } = await fetchFn();
  if (data && !error) {
    const [setErr] = await catchError(
      client.set(cacheKey, JSON.stringify(data), {
        expiration: { type: "EX", value: ttlSeconds },
      }),
    );
    if (setErr) console.error(`Redis SET error: ${setErr}`);
  }
  return { data: data, error: undefined };
}

export async function executeQuery<R extends QueryResultRow>(
  pool: Pool,
  sql: string,
  params?: unknown[],
): Promise<{ data?: QueryResult<R>; error?: Error }> {
  const [error, result] = await catchError(pool.query<R>(sql, params));
  return { data: result, error: error };
}

export function calculateOffset(pageSize: number, pageNumber: number): number {
  return (pageNumber - 1) * pageSize;
}
