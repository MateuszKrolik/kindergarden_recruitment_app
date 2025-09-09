import { PropertyParentDocument } from "./model";
import { Pool } from "pg";
import {
  calculateOffset,
  executeQuery,
  invalidateCache,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "@/data-access-layer/shared/util/query";
import { RedisClientType } from "@/data-access-layer/db/redis-client";
import { newPagedResponse, PagedResponse } from "@/types/pagination";
import { catchError } from "@/data-access-layer/shared/util/error";

export interface IComplianceRepo {
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }>;
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }>;
}

export class ComplianceRepo implements IComplianceRepo {
  constructor(
    private pool: Pool,
    private redisClient: RedisClientType,
  ) { }
  async getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }> {
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
      if (error) return { data: undefined, error: error };
      return { data: data?.rows, error: undefined };
    });
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
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
      if (error) return { data: undefined, error: error };
      return { data: data?.rows[0], error: undefined };
    });
  }
  async sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
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
        if (error) return { data: undefined, error: error };
        return { data: data?.rows[0], error: undefined };
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
  ): Promise<{ data?: PagedResponse<PropertyParentDocument>; error?: Error }> {
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
        if (error) return { data: undefined, error: error };
        return { data: data, error: undefined };
      },
    );
    if (error) return { data: undefined, error: error };

    const pagedSetKey =
      this.getAllDocumentApprovalRequestsForGivenPropertyPagedSetKey(
        propertyId,
      );
    const { error: setAddError } = await catchError(
      this.redisClient.sAdd(pagedSetKey, cacheKey),
    );
    if (setAddError)
      console.error(
        `Error while adding key '${cacheKey}' to set '${pagedSetKey}': ${setAddError}`,
      );

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
}
