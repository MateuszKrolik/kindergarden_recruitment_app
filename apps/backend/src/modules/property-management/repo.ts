import { type PagedResponse } from "shared/types/pagination.ts";
import { newPagedResponse } from "shared/utils/pagination.ts";
import type {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyChildDocumentRequirement,
  PropertyUser,
} from "shared/types/modules/property-management.ts";
import { Pool } from "pg";
import {
  calculateOffset,
  executeQuery,
  invalidateCache,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "../../shared/util/query.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import type { DocumentType } from "shared/types/modules/reporting.ts";
import type { AsyncResponseType } from "shared/types/response.ts";
import { NOT_FOUND_ERROR } from "shared/errors.ts";
import { catchError } from "shared/utils/error.ts";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<Property>>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyUser>;
  getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): AsyncResponseType<PropertyParentDocumentRequirement[]>;
  getAllPropertyChildrenDocumentRequirements(
    propertyId: string,
  ): AsyncResponseType<PropertyChildDocumentRequirement[]>;
  getAllPropertyChildren(
    propertyId: string,
  ): AsyncResponseType<PropertyChild[]>;
  incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): AsyncResponseType<PropertyChild[]>;
  getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): AsyncResponseType<number>;
  getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<PropertyChild>>;
}

export class PropertyManagementRepo implements IPropertyManagementRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  constructor(pool: Pool, redisClient: RedisClientType) {
    this.pool = pool;
    this.redisClient = redisClient;
  }

  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<Property>> {
    const sql = `
    SELECT 
      *,
      COUNT(*) OVER() as total_count
    FROM property_management.properties
    LIMIT $1
    OFFSET $2;
    `;
    const { data, error } = await executeQuery<
      Property & { total_count: number }
    >(this.pool, sql, [pageSize, calculateOffset(pageSize, pageNumber)]);
    if (error) return { data: undefined, error: error };
    if (data.rows.length === 0)
      return {
        data: newPagedResponse([], 0, pageNumber, pageSize),
        error: undefined,
      };
    const total_count = data.rows[0].total_count;
    return {
      data: newPagedResponse(data.rows, total_count, pageNumber, pageSize),
      error: undefined,
    };
  }

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyUser> {
    const sql = `
    SELECT *
    FROM property_management.property_users
    WHERE property_id = $1 AND user_id = $2;
    `;
    const { data, error } = await executeQuery<PropertyUser>(this.pool, sql, [
      propertyId,
      userId,
    ]);
    if (error) return { data: undefined, error: error };
    if (data.rows.length === 0)
      return { data: undefined, error: NOT_FOUND_ERROR };
    return { data: data.rows[0], error: undefined };
  }

  async getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): AsyncResponseType<PropertyParentDocumentRequirement[]> {
    const cacheKey = `properties:${propertyId}:parent_requirements`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM property_management.property_parent_document_requirements
      WHERE property_id = $1;
      `;
      const { data, error } =
        await executeQuery<PropertyParentDocumentRequirement>(this.pool, sql, [
          propertyId,
        ]);
      if (error) return { data: undefined, error: error };
      return { data: data.rows, error: undefined };
    });
  }

  async getAllPropertyChildren(
    propertyId: string,
  ): AsyncResponseType<PropertyChild[]> {
    const cacheKey = this.getAllPropertyChildrenCacheKey(propertyId);
    const result = await withCacheAsideRedis(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
        SELECT *
        FROM property_management.property_children
        WHERE property_id = $1;
        `;
        const { data, error } = await executeQuery<PropertyChild>(
          this.pool,
          sql,
          [propertyId],
        );
        if (error) return { data: undefined, error: error };
        return { data: data.rows, error: undefined };
      },
    );
    if (result.error) return result;
    await this.invalidateGetAllPropertyChildrenPagedSetKey(propertyId);
    return result;
  }

  async incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): AsyncResponseType<PropertyChild[]> {
    const cacheKey = `properties:${propertyId}:parents:${parentId}:children`;
    const { data, error } = await withWriteThroughRedisCache(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
          UPDATE property_management.property_children
          SET points = points + $1
          WHERE property_id = $2
          AND child_id = ANY($3::uuid[])
          RETURNING *;
        `;
        const { data, error } = await executeQuery<PropertyChild>(
          this.pool,
          sql,
          [pointValue, propertyId, childrenIds],
        );
        if (error) return { data: undefined, error };
        return { data: data.rows, error: undefined };
      },
    );
    if (error) return { data: undefined, error };
    await invalidateCache(
      this.redisClient,
      this.getAllPropertyChildrenCacheKey(propertyId),
    );
    await this.invalidateGetAllPropertyChildrenPagedSetKey(propertyId);
    return { data: data, error: undefined };
  }

  async getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): AsyncResponseType<number> {
    //TODO: invalidate (if necessary)
    const cacheKey = `properties:${propertyId}:parents:documents:${documentType}:points`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
        SELECT point_value
        FROM property_management.property_parent_document_requirements
        WHERE property_id = $1 AND document_type = $2;
        `;
      const { data, error } = await executeQuery<{ point_value: number }>(
        this.pool,
        sql,
        [propertyId, documentType], // TODO: SQL index on document_type
      );
      if (error) return { data: undefined, error };
      if (data.rows.length === 0)
        return { data: undefined, error: NOT_FOUND_ERROR };
      return { data: data.rows[0].point_value, error: undefined };
    });
  }

  async getAllPropertyChildrenDocumentRequirements(
    propertyId: string,
  ): AsyncResponseType<PropertyChildDocumentRequirement[]> {
    const cacheKey = `properties:${propertyId}:child_requirements`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM property_management.property_children_document_requirements
      WHERE property_id = $1;
      `;
      const { data, error } =
        await executeQuery<PropertyChildDocumentRequirement>(this.pool, sql, [
          propertyId,
        ]);
      if (error) return { data: undefined, error: error };
      return { data: data.rows, error: undefined };
    });
  }

  async getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<PropertyChild>> {
    const cacheKey = this.getAllPropertyChildrenPagedCacheKey(
      propertyId,
      pageSize,
      pageNumber,
    );
    const { data, error } = await withCacheAsideRedis(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
        SELECT 
          *,
          COUNT(*) OVER() as total_count
        FROM property_management.property_children
        WHERE property_id = $1
        LIMIT $2
        OFFSET $3;
        `;
        const { data, error } = await executeQuery<
          PropertyChild & { total_count: number }
        >(this.pool, sql, [
          propertyId,
          pageSize,
          calculateOffset(pageSize, pageNumber),
        ]);
        if (error) return { data: undefined, error: error };
        return { data: data.rows, error: undefined };
      },
    );
    if (error) return { data: undefined, error: error };

    const pagedSetKey = this.getAllPropertyChildrenPagedSetKey(propertyId);
    const { error: setAddError } = await catchError(
      this.redisClient.sAdd(pagedSetKey, cacheKey),
    );
    if (setAddError)
      console.error(
        `Error while adding key '${cacheKey}' to set '${pagedSetKey}': ${setAddError}`,
      );

    if (data.length === 0)
      return {
        data: newPagedResponse([], 0, pageNumber, pageSize),
        error: undefined,
      };
    return {
      data: newPagedResponse(data, data[0].total_count, pageNumber, pageSize),
      error: undefined,
    };
  }

  private getAllPropertyChildrenCacheKey(propertyId: string): string {
    return `properties:${propertyId}:children`;
  }

  private async invalidateGetAllPropertyChildrenPagedSetKey(
    propertyId: string,
  ) {
    const setKey = this.getAllPropertyChildrenPagedSetKey(propertyId);
    const { data: sMembers, error } = await catchError(
      this.redisClient.sMembers(setKey),
    );
    if (error)
      console.error(`Redis GET error for key set '${setKey}': ${error}`);
    if (sMembers && sMembers.length > 0) {
      const { error: setDelError } = await catchError(
        this.redisClient.del(sMembers),
      );
      if (setDelError)
        console.error(
          `Redis DEL error for set members '${setKey}': ${setDelError}`,
        );
    }
    const { error: delError } = await catchError(this.redisClient.del(setKey));
    if (delError) {
      console.error(`Redis DEL error for set '${setKey}': ${delError}`);
    }
  }

  private getAllPropertyChildrenPagedSetKey(propertyId: string) {
    return `properties:${propertyId}:property_children:pages`;
  }

  private getAllPropertyChildrenPagedCacheKey(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): string {
    return `properties:${propertyId}:property_children:page_size:${pageSize}:page_number${pageNumber}`;
  }
}
