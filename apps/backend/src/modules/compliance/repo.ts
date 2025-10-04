import type {
  PropertyParentDocument,
  RequestStatus,
  PropertyChildDocument,
} from "shared/types/modules/compliance.ts";
import { Pool } from "pg";
import {
  calculateOffset,
  executeQuery,
  invalidateCache,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "../../shared/util/query.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import { type PagedResponse } from "shared/types/pagination.ts";
import { newPagedResponse } from "shared/utils/pagination.ts";
import { catchError } from "shared/utils/error.ts";
import type { ApiResponse } from "shared/types/response.ts";
import type { Logger } from "winston";

export interface IComplianceRepo {
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]>;
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyParentDocument>>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
  setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): ApiResponse<PropertyParentDocument>;
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<boolean>;
  getAllDocumentApprovalRequestsForGivenPropertyChild(
    propertyId: string,
    childId: string,
  ): ApiResponse<PropertyChildDocument[]>;
}

export class ComplianceRepo implements IComplianceRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  private logger: Logger;
  constructor(pool: Pool, redisClient: RedisClientType, logger: Logger) {
    this.pool = pool;
    this.redisClient = redisClient;
    this.logger = logger.child({
      service: "compliance-repo",
    });
  }
  async getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]> {
    const cacheKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyParentCacheKey(
        propertyId,
        userId,
      );
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM compliance.property_parent_documents
      WHERE property_id = $1 AND user_id = $2;
      `;
      const { data, error } = await executeQuery<PropertyParentDocument>(
        this.pool,
        sql,
        [propertyId, userId],
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
    });
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument> {
    const cacheKey = this.getPropertyParentDocumentApprovalRequestCacheKey(
      propertyId,
      userId,
      parentDocId,
    );
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM compliance.property_parent_documents
      WHERE property_id = $1 AND user_id = $2 AND parent_document_id = $3;
      `;
      const { data, error } = await executeQuery<PropertyParentDocument>(
        this.pool,
        sql,
        [propertyId, userId, parentDocId],
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
      if (data.rows.length === 0)
        return {
          data: undefined,
          error: {
            code: 404,
            message: `Parent document request with id: ${parentDocId} was not found!`,
          },
        };
      return { data: data.rows[0], error: undefined };
    });
  }

  async sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument> {
    const cacheKey = this.getPropertyParentDocumentApprovalRequestCacheKey(
      propertyId,
      userId,
      parentDocumentId,
    );
    const result = await withWriteThroughRedisCache(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
      INSERT INTO compliance.property_parent_documents(
        property_id,
        user_id,
        parent_document_id
      ) VALUES (
        $1,
        $2,
        $3
      ) RETURNING *;
      `;
        const { data, error } = await executeQuery<PropertyParentDocument>(
          this.pool,
          sql,
          [propertyId, userId, parentDocumentId],
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
        if (data.rows.length === 0)
          return {
            data: undefined,
            error: {
              code: 404,
              message: `Approval request: ${parentDocumentId} was not saved successfully!`,
            },
          };
        return { data: data.rows[0], error: undefined };
      },
    );

    // TODO: append to list instead of deleting its entirety for boost in performance
    await invalidateCache(
      this.redisClient,
      this.getAllDocumentApprovalRequestsForGivenPropertyParentCacheKey(
        propertyId,
        userId,
      ),
    );

    await this.invalidatePagedPropertyParentDocRequestsForGivenPropertyCache(
      propertyId,
    );

    return result;
  }

  async getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyParentDocument>> {
    const cacheKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyCacheKey(
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
          COUNT(*) OVER() AS total_count
        FROM compliance.property_parent_documents
        WHERE property_id = $1
        LIMIT $2
        OFFSET $3;
        `;
        const { data, error } = await executeQuery<
          PropertyParentDocument & { total_count: number }
        >(this.pool, sql, [
          propertyId,
          pageSize,
          calculateOffset(pageSize, pageNumber),
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
        return { data: data, error: undefined };
      },
    );
    if (error) {
      this.logger.error(error);
      return { data: undefined, error: error };
    }

    const pagedSetKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyPagedSetKey(
        propertyId,
      );
    const { error: setAddError } = await catchError(
      this.redisClient.sAdd(pagedSetKey, cacheKey),
    );
    if (setAddError)
      this.logger.error(
        new Error(
          `Error while adding key '${cacheKey}' to set '${pagedSetKey}': ${setAddError}`,
        ),
      );

    if (data.rows.length === 0) {
      return {
        data: newPagedResponse([], 0, pageNumber, pageSize),
        error: undefined,
      };
    }

    const total_count = data?.rows[0].total_count;
    return {
      data: newPagedResponse(data.rows, total_count, pageNumber, pageSize),
      error: undefined,
    };
  }

  async isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<boolean> {
    const cacheKey = this.getIsPropertyParentDocumentRequestApprovedCacheKey(
      propertyId,
      userId,
      parentDocumentId,
    );
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
        SELECT request_status = 'approved' AS is_approved
        FROM compliance.property_parent_documents
        WHERE property_id = $1 AND user_id = $2 AND parent_document_id = $3;
        `;
      const { data, error } = await executeQuery<{ is_approved: boolean }>(
        this.pool,
        sql,
        [propertyId, userId, parentDocumentId],
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
      if (data.rows.length === 0)
        return {
          data: undefined,
          error: {
            code: 404,
            message: `Request with id ${parentDocumentId} was not found!`,
          },
        };
      return { data: data.rows[0].is_approved, error: undefined };
    });
  }

  async setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): ApiResponse<PropertyParentDocument> {
    const cacheKey = this.getPropertyParentDocumentApprovalRequestCacheKey(
      propertyId,
      userId,
      parentDocumentId,
    );
    const result = await withWriteThroughRedisCache(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
        UPDATE compliance.property_parent_documents
        SET request_status = $1, approved_by = $2
        WHERE property_id = $3 AND user_id = $4 AND parent_document_id = $5
        RETURNING *;
        `;
        const { data, error } = await executeQuery<PropertyParentDocument>(
          this.pool,
          sql,
          [requestStatus, adminId, propertyId, userId, parentDocumentId],
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
        if (data.rows.length === 0)
          return {
            data: undefined,
            error: {
              code: 404,
              message: `Parent document request: ${parentDocumentId} was not found!`,
            },
          };
        return { data: data.rows[0], error: undefined };
      },
    );

    // TODO: append to list instead of deleting its entirety for boost in performance
    await invalidateCache(
      this.redisClient,
      this.getAllDocumentApprovalRequestsForGivenPropertyParentCacheKey(
        propertyId,
        userId,
      ),
    );

    await this.invalidatePagedPropertyParentDocRequestsForGivenPropertyCache(
      propertyId,
    );

    await invalidateCache(
      this.redisClient,
      this.getIsPropertyParentDocumentRequestApprovedCacheKey(
        propertyId,
        userId,
        parentDocumentId,
      ),
    );

    return result;
  }

  async getAllDocumentApprovalRequestsForGivenPropertyChild(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyChildDocument[]> {
    const cacheKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyChildCacheKey(
        propertyId,
        userId,
      );
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM compliance.property_children_documents
      WHERE property_id = $1 AND child_id = $2;
      `;
      const { data, error } = await executeQuery<PropertyChildDocument>(
        this.pool,
        sql,
        [propertyId, userId],
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
    });
  }

  private async invalidatePagedPropertyParentDocRequestsForGivenPropertyCache(
    propertyId: string,
  ) {
    const setKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyPagedSetKey(
        propertyId,
      );
    const { data: sMembers, error } = await catchError(
      this.redisClient.sMembers(setKey),
    );
    if (error)
      this.logger.error(
        new Error(`Redis GET error for key set '${setKey}': ${error}`),
      );
    if (sMembers && sMembers.length > 0) {
      const { error: setDelError } = await catchError(
        this.redisClient.del(sMembers),
      );
      if (setDelError)
        this.logger.error(
          new Error(
            `Redis DEL error for set members '${setKey}': ${setDelError}`,
          ),
        );
    }
    const { error: delError } = await catchError(this.redisClient.del(setKey));
    if (delError) {
      this.logger.error(
        new Error(`Redis DEL error for set '${setKey}': ${delError}`),
      );
    }
  }

  private getAllDocumentApprovalRequestsForGivenPropertyPagedSetKey(
    propertyId: string,
  ) {
    return `properties:${propertyId}:parents:requests:pages`;
  }

  private getAllDocumentApprovalRequestsForGivenPropertyCacheKey(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ) {
    return `properties:${propertyId}:parents:requests:page_size:${pageSize}:page_number:${pageNumber}`;
  }

  private getAllDocumentApprovalRequestsForGivenPropertyParentCacheKey(
    propertyId: string,
    userId: string,
  ): string {
    return `properties:${propertyId}:parents:${userId}:requests`;
  }

  private getPropertyParentDocumentApprovalRequestCacheKey(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): string {
    return `properties:${propertyId}:parents:${userId}:requests:${parentDocumentId}`;
  }

  private getIsPropertyParentDocumentRequestApprovedCacheKey(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): string {
    return `properties:${propertyId}:parents:${userId}:reqeusts${parentDocumentId}:approved`;
  }

  private getAllDocumentApprovalRequestsForGivenPropertyChildCacheKey(
    propertyId: string,
    childId: string,
  ): string {
    return `properties:${propertyId}:children:${childId}:requests`;
  }
}
