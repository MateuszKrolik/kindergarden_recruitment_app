import { Pool, QueryResult, QueryResultRow } from "pg";
import { catchError } from "./error";

export async function executeQuery<R extends QueryResultRow>(
  pool: Pool,
  sql: string,
  params?: unknown[],
): Promise<QueryResult<R> | Error> {
  const [error, result] = await catchError(pool.query<R>(sql, params));
  return error || result;
}
