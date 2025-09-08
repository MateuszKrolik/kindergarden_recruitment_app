import { PropertyParentDocument } from "./model";
import { Pool } from "pg";
import {
  executeQuery,
  invalidateCache,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "@/data-access-layer/shared/util/query";
import { RedisClientType } from "@/data-access-layer/db/redis-client";

export interface IComplianceRepo {
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }>;
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
    const cacheKey = this.getAllPropertyParentDocumentApprovalRequestsCacheKey(
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
      this.getAllPropertyParentDocumentApprovalRequestsCacheKey(
        propertyId,
        userId,
      ),
    );

    return result;
  }

  private getAllPropertyParentDocumentApprovalRequestsCacheKey(
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
