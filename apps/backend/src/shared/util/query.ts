import { Pool, type QueryResult, type QueryResultRow } from "pg";
import { catchError, catchErrorSync } from "shared/utils/error.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import type { AsyncResponseType } from "shared/types/response.ts";

export async function withCacheAsideRedis<T>(
  client: RedisClientType,
  cacheKey: string,
  fetchFn: () => AsyncResponseType<T>,
  ttlSeconds = 3600 * 24,
): AsyncResponseType<T> {
  const { data: cachedData, error } = await catchError(client.get(cacheKey));
  if (error) console.error(`Redis GET error: ${error}`);

  if (cachedData) {
    const { data: parsedJson, error: jsonParseErr } = catchErrorSync(() =>
      JSON.parse(cachedData),
    );
    if (!jsonParseErr) {
      return { data: parsedJson as T, error: undefined };
    }
    // Remove corrupted data from redis if json parsing fails
    console.error(`Redis GET parse error: ${jsonParseErr}`);
    const { error: deleteError } = await catchError(client.del(cacheKey));
    if (deleteError) console.error(`Redis DEL error: ${deleteError}`);
    // TODO: Consider "Thundering Herd" problem when load balancing at scale (not likely)
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
  fetchFn: () => AsyncResponseType<T>,
  ttlSeconds = 3600 * 24,
): AsyncResponseType<T> {
  const { data, error } = await fetchFn();
  if (error) return { data: undefined, error: error };
  if (data) {
    const { error: setErr } = await catchError(
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
): AsyncResponseType<QueryResult<R>> {
  return await catchError(pool.query<R>(sql, params));
}

export function calculateOffset(pageSize: number, pageNumber: number): number {
  return (pageNumber - 1) * pageSize;
}

export async function invalidateCache(
  client: RedisClientType,
  cacheKey: string,
): Promise<void> {
  const { error } = await catchError(client.del(cacheKey));
  if (error)
    console.error(
      `Error while invalidating cache with key '${cacheKey}': ${error}`,
    );
}
