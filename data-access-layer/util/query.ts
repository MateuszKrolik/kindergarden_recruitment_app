import { Pool, QueryResult, QueryResultRow } from "pg";
import { catchError, catchSyncError } from "./error";
import { RedisClientType } from "../db/redis-client";

export async function withRedisCache<T>(
  client: RedisClientType,
  cacheKey: string,
  fetchFn: () => Promise<T | Error>,
  ttlSeconds = 3600 * 24,
): Promise<T | Error> {
  const [error, cachedData] = await catchError(client.get(cacheKey));
  if (error) console.error(`Redis GET error: ${error}`);

  if (cachedData) {
    console.log("Redis was hit!");
    const [jsonParseErr, parsedJson] = catchSyncError(() =>
      JSON.parse(cachedData),
    );
    if (!jsonParseErr) {
      return parsedJson as T;
    }
    console.error(jsonParseErr);
  }

  const result = await fetchFn();
  if (!(result instanceof Error) && result) {
    const [setErr] = await catchError(
      client.set(cacheKey, JSON.stringify(result), {
        expiration: { type: "EX", value: ttlSeconds },
      }),
    );
    if (setErr) console.error(`Redis SET error: ${setErr}`);
  }
  return result;
}

export async function executeQuery<R extends QueryResultRow>(
  pool: Pool,
  sql: string,
  params?: unknown[],
): Promise<QueryResult<R> | Error> {
  const [error, result] = await catchError(pool.query<R>(sql, params));
  return error || result;
}

export function calculateOffset(pageSize: number, pageNumber: number): number {
  return (pageNumber - 1) * pageSize;
}
