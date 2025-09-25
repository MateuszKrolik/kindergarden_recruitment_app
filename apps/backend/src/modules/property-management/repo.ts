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
import type { ApiResponse } from "shared/types/response.ts";
import { catchError } from "shared/utils/error.ts";
import type { Logger } from "winston";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<Property>>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyUser>;
  getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]>;
  getAllPropertyChildrenDocumentRequirements(
    propertyId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]>;
  getAllPropertyChildren(propertyId: string): ApiResponse<PropertyChild[]>;
  incrementPropertyChildrenPointsForGivenParent(
    propertyId: string,
    parentId: string,
    childrenIds: string[],
    pointValue: number,
  ): ApiResponse<PropertyChild[]>;
  getPointValueForGivenPropertyParentDocumentByDocumentType(
    propertyId: string,
    documentType: DocumentType,
  ): ApiResponse<number>;
  getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyChild>>;
}

export class PropertyManagementRepo implements IPropertyManagementRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  private logger: Logger;
  constructor(pool: Pool, redisClient: RedisClientType, logger: Logger) {
    this.pool = pool;
    this.redisClient = redisClient;
    this.logger = logger.child({
      service: "property-management-repo",
    });
  }

  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<Property>> {
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
    if (error) {
      this.logger.error(error);
      return {
        data: undefined,
        error: {
          code: 500,
          message: error.message,
        },
      };
    }
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
  ): ApiResponse<PropertyUser> {
    const sql = `
    SELECT *
    FROM property_management.property_users
    WHERE property_id = $1 AND user_id = $2;
    `;
    const { data, error } = await executeQuery<PropertyUser>(this.pool, sql, [
      propertyId,
      userId,
    ]);
    if (error) {
      this.logger.error(error);
      return {
        data: undefined,
        error: {
          code: 500,
          message: error.message,
        },
      };
    }
    if (data.rows.length === 0)
      return {
        data: undefined,
        error: {
          code: 404,
          message: `User: ${userId} is not registered to property: ${propertyId}!`,
        },
      };
    return { data: data.rows[0], error: undefined };
  }

  async getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): ApiResponse<PropertyParentDocumentRequirement[]> {
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
      if (error) {
        this.logger.error(error);
        return {
          data: undefined,
          error: {
            code: 500,
            message: error.message,
          },
        };
      }
      return { data: data.rows, error: undefined };
    });
  }

  async getAllPropertyChildren(
    propertyId: string,
  ): ApiResponse<PropertyChild[]> {
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
        if (error) {
          this.logger.error(error);
          return {
            data: undefined,
            error: {
              code: 500,
              message: error.message,
            },
          };
        }
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
  ): ApiResponse<PropertyChild[]> {
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
        if (error) {
          this.logger.error(error);
          return {
            data: undefined,
            error: {
              code: 500,
              message: error.message,
            },
          };
        }
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
  ): ApiResponse<number> {
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
      if (error)
        return {
          data: undefined,
          error: {
            code: 500,
            message: error.message,
          },
        };
      if (data.rows.length === 0)
        return {
          data: undefined,
          error: {
            code: 404,
            message: `Document type: ${documentType} not found in property: ${propertyId}!`,
          },
        };
      return { data: data.rows[0].point_value, error: undefined };
    });
  }

  async getAllPropertyChildrenDocumentRequirements(
    propertyId: string,
  ): ApiResponse<PropertyChildDocumentRequirement[]> {
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
      if (error)
        return {
          data: undefined,
          error: {
            code: 500,
            message: error.message,
          },
        };
      return { data: data.rows, error: undefined };
    });
  }

  async getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyChild>> {
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
        if (error)
          return {
            data: undefined,
            error: {
              code: 500,
              message: error.message,
            },
          };
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
