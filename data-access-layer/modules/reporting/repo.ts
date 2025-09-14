import { Pool } from "pg";
import type { DocumentType } from "../../shared/types/reporting.ts";
import type { ParentDocument } from "./model.ts";
import { executeQuery, withCacheAsideRedis } from "../../shared/util/query.ts";
import type { RedisClientType } from "../../db/redis-client.ts";

export interface IReportingRepo {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }>;
}

export class ReportingRepo implements IReportingRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  constructor(pool: Pool, redisClient: RedisClientType) {
    this.pool = pool;
    this.redisClient = redisClient;
  }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }> {
    const sql = `
    SELECT *
    FROM reporting.parent_documents
    WHERE user_id = $1 AND document_type = $2;
    `;
    const { data, error } = await executeQuery<ParentDocument>(this.pool, sql, [
      userId,
      documentType,
    ]);
    if (error) return { data: undefined, error: error };
    return { data: data?.rows[0], error: undefined };
  }

  async getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }> {
    //TODO: invalidate if necessary
    const cacheKey = `parent_documents:${parentDocumentId}:type`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
        SELECT document_type
        FROM reporting.parent_documents
        WHERE id = $1; 
        `;
      const { data, error } = await executeQuery<{
        document_type: DocumentType;
      }>(this.pool, sql, [parentDocumentId]);
      if (error) return { data: undefined, error: error };
      return { data: data?.rows[0].document_type, error: undefined };
    });
  }
}
