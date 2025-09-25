import { executeQuery, withCacheAsideRedis } from "../../shared/util/query.ts";
import { Pool } from "pg";
import type {
  ParentChild,
  ParentConditionKeys,
  ChildConditionKeys,
} from "shared/types/modules/identity.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import type { AsyncResponseType } from "shared/types/response.ts";
import { NOT_FOUND_ERROR } from "shared/errors.ts";

export interface IIdentityRepo {
  doesAccountExist(accountId: string): AsyncResponseType<boolean>;
  getParentConditionKeys(
    userId: string,
  ): AsyncResponseType<ParentConditionKeys>;
  getChildConditionKeys(childId: string): AsyncResponseType<ChildConditionKeys>;
  getAllParentChildren(parentId: string): AsyncResponseType<ParentChild[]>;
}

export class IdentityRepo implements IIdentityRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  constructor(pool: Pool, redisClient: RedisClientType) {
    this.pool = pool;
    this.redisClient = redisClient;
  }

  async doesAccountExist(accountId: string): AsyncResponseType<boolean> {
    const sql = `
    SELECT EXISTS(SELECT 1 FROM account WHERE id = $1) AS exists;
    `;
    const { data, error } = await executeQuery<{ exists: boolean }>(
      this.pool,
      sql,
      [accountId],
    );
    if (error) return { data: undefined, error: error };
    if (data.rows.length === 0)
      return { data: undefined, error: NOT_FOUND_ERROR };
    return { data: data.rows[0].exists, error: undefined };
  }

  async getParentConditionKeys(
    userId: string,
  ): AsyncResponseType<ParentConditionKeys> {
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
    if (data.rows.length === 0)
      return { data: undefined, error: NOT_FOUND_ERROR };
    return { data: data.rows[0], error: undefined };
  }

  async getAllParentChildren(
    parentId: string,
  ): AsyncResponseType<ParentChild[]> {
    //TODO: invalidations on registration
    const cacheKey = `parents:${parentId}:children`;
    const { data, error } = await withCacheAsideRedis(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
        SELECT *
        FROM identity.parent_children
        WHERE parent_id = $1;
        `;
        const { data, error } = await executeQuery<ParentChild>(
          this.pool,
          sql,
          [parentId],
        );
        if (error) return { data: undefined, error };
        return { data: data.rows, error: undefined };
      },
    );
    if (error) return { data: undefined, error };
    return { data, error: undefined };
  }

  async getChildConditionKeys(
    childId: string,
  ): AsyncResponseType<ChildConditionKeys> {
    const cacheKey = `children:${childId}:condition_keys`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
    SELECT
      has_disability
      -- TODO
    FROM identity.children
    WHERE id = $1;
    `;
      const { data, error } = await executeQuery<ChildConditionKeys>(
        this.pool,
        sql,
        [childId],
      );
      if (error) return { data: undefined, error: error };
      if (data.rows.length === 0)
        return { data: undefined, error: NOT_FOUND_ERROR };
      return { data: data.rows[0], error: undefined };
    });
  }
}
