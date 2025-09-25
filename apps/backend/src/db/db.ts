import { Pool } from "pg";

export function initDB(): Pool {
  return new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
}
