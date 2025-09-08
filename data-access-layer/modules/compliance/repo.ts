import { PropertyParentDocument } from "./model";
import { Pool } from "pg";
import {
  executeQuery,
  withCacheAsideRedis,
} from "@/data-access-layer/util/query";
import { RedisClientType } from "@/data-access-layer/db/redis-client";

export interface IComplianceRepo {
  getPropertyParentDocumentApprovalRequests(
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
  async getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyParentDocument[]; error?: Error }> {
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
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<{ data?: PropertyParentDocument; error?: Error }> {
    // TODO: Decorator
    const cacheKey = this.getPropertyParentDocumentApprovalRequestCacheKey(
      propertyId,
      userId,
      parentDocId,
    );
    return withCacheAsideRedis(this.redisClient, cacheKey, async () => {
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
  }

  private getPropertyParentDocumentApprovalRequestCacheKey(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): string {
    return `properties:${propertyId}:users:${userId}:property_parent_documents:${parentDocumentId}`;
  }
}
