import {
  newPagedResponse,
  type PagedResponse,
} from "../../../types/pagination.ts";
import type {
  Property,
  PropertyChild,
  PropertyParentDocumentRequirement,
  PropertyUser,
} from "./model.ts";
import { Pool } from "pg";
import {
  calculateOffset,
  executeQuery,
  invalidateCache,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "../../shared/util/query.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import type { DocumentType } from "../../shared/types/reporting.ts";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }>;
  getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }>;
  getAllPropertyChildren(
    propertyId: string,
  ): Promise<{ data?: PropertyChild[]; error?: Error }>;
  incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): Promise<{ data?: PropertyChild[]; error?: Error }>;
  getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): Promise<{ data?: number; error?: Error }>;
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
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }> {
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
    const total_count = data?.rows[0].total_count;
    return {
      data: newPagedResponse(
        data?.rows || [],
        total_count || 0,
        pageNumber,
        pageSize,
      ),
      error: undefined,
    };
  }

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }> {
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
    return { data: data?.rows[0], error: undefined };
  }

  async getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }> {
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
    return { data: data?.rows, error: undefined };
  }

  async getAllPropertyChildren(
    propertyId: string,
  ): Promise<{ data?: PropertyChild[]; error?: Error }> {
    const cacheKey = this.getAllPropertyChildrenCacheKey(propertyId);
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
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
      return { data: data?.rows, error: undefined };
    });
  }

  async incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): Promise<{ data?: PropertyChild[]; error?: Error }> {
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
        return { data: data?.rows, error: undefined };
      },
    );
    if (error) return { data: undefined, error };
    await invalidateCache(
      this.redisClient,
      this.getAllPropertyChildrenCacheKey(propertyId),
    );
    return { data: data, error: undefined };
  }

  async getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): Promise<{ data?: number; error?: Error }> {
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
      return { data: data?.rows[0].point_value, error: undefined };
    });
  }

  private getAllPropertyChildrenCacheKey(propertyId: string): string {
    return `properties:${propertyId}:children`;
  }
}
