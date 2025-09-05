import { executeQuery } from "@/data-access-layer/util/query";
import { Pool } from "pg";

export interface IIdentityRepo {
  doesAccountExist(accountId: string): Promise<boolean | Error>;
}

export class PgIdentityRepo implements IIdentityRepo {
  constructor(private pool: Pool) { }

  async doesAccountExist(accountId: string): Promise<boolean | Error> {
    const sql = `
    SELECT EXISTS(SELECT 1 FROM account WHERE id = $1) AS exists;
    `;
    const result = await executeQuery<{ exists: boolean }>(this.pool, sql, [
      accountId,
    ]);
    if (result instanceof Error) return result;
    return result.rows[0].exists;
  }
}
