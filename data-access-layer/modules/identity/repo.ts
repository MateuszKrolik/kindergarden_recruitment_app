import { executeQuery } from "@/data-access-layer/util/query";
import { Pool } from "pg";
import { ParentConditionKeys } from "../shared/types/property_management";

export interface IIdentityRepo {
  doesAccountExist(accountId: string): Promise<boolean | Error>;
  getParentConditionKeys(userId: string): Promise<ParentConditionKeys | Error>;
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

  async getParentConditionKeys(
    userId: string,
  ): Promise<ParentConditionKeys | Error> {
    const sql = `
    SELECT
      is_employed,
      is_self_employed,
      is_student,
      filed_tax_in_desired_location,
      resides_in_desired_location
    FROM identity.parent_user_details
    WHERE user_id = $1;
    `;
    const result = await executeQuery<ParentConditionKeys>(this.pool, sql, [
      userId,
    ]);
    if (result instanceof Error) return result;
    return result.rows[0];
  }
}
