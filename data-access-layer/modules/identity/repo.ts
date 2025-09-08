import { executeQuery } from "@/data-access-layer/shared/util/query";
import { Pool } from "pg";
import { ParentConditionKeys } from "../../shared/types/property_management";

export interface IIdentityRepo {
  doesAccountExist(
    accountId: string,
  ): Promise<{ data?: boolean; error?: Error }>;
  getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }>;
}

export class PgIdentityRepo implements IIdentityRepo {
  constructor(private pool: Pool) { }

  async doesAccountExist(
    accountId: string,
  ): Promise<{ data?: boolean; error?: Error }> {
    const sql = `
    SELECT EXISTS(SELECT 1 FROM account WHERE id = $1) AS exists;
    `;
    const { data, error } = await executeQuery<{ exists: boolean }>(
      this.pool,
      sql,
      [accountId],
    );
    if (error) return { data: undefined, error: error };
    return { data: data?.rows[0].exists, error: undefined };
  }

  async getParentConditionKeys(
    userId: string,
  ): Promise<{ data?: ParentConditionKeys; error?: Error }> {
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
    const { data, error } = await executeQuery<ParentConditionKeys>(
      this.pool,
      sql,
      [userId],
    );
    if (error) return { data: undefined, error: error };
    return { data: data?.rows[0], error: undefined };
  }
}
