import { Pool } from "pg";
import type { DocumentType } from "../../shared/types/reporting.ts";
import type { ParentDocument } from "./model.ts";
import {
  executeQuery,
  withCacheAsideRedis,
  withWriteThroughRedisCache,
} from "../../shared/util/query.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { catchError } from "../../shared/util/error.ts";
import type { AsyncResponseType } from "../../shared/types/response.ts";
import { NOT_FOUND_ERROR } from "../../shared/errors.ts";

export interface IReportingRepo {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): AsyncResponseType<ParentDocument>;
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): AsyncResponseType<DocumentType>;
  saveParentDocument(
    userId: string,
    documentType: DocumentType,
    filePath: string,
  ): AsyncResponseType<ParentDocument>;
  getParentDocumentFilePathByDocumentID(
    docId: string,
  ): AsyncResponseType<string>;
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
  ): AsyncResponseType<ParentDocument> {
    //TODO: invalidate if necessary
    const cacheKey = `parents:${userId}:documents:${documentType}`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
      SELECT *
      FROM reporting.parent_documents
      WHERE user_id = $1 AND document_type = $2;
      `;
      const { data, error } = await executeQuery<ParentDocument>(
        this.pool,
        sql,
        [userId, documentType],
      );
      if (error) return { data: undefined, error: error };
      if (data.rows.length === 0)
        return { data: undefined, error: NOT_FOUND_ERROR };
      return { data: data.rows[0], error: undefined };
    });
  }

  async getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): AsyncResponseType<DocumentType> {
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

  async saveParentDocument(
    userId: string,
    documentType: DocumentType,
    filePath: string,
  ): AsyncResponseType<ParentDocument> {
    const cacheKey = `parents:${userId}:parent_documents:${documentType}`;
    return await withWriteThroughRedisCache(
      this.redisClient,
      cacheKey,
      async () => {
        const sql = `
        INSERT INTO reporting.parent_documents(
          user_id,
          document_type,
          file_path)
        VALUES ($1, $2, $3)
        RETURNING *;
        `;
        const { data, error } = await executeQuery<ParentDocument>(
          this.pool,
          sql,
          [userId, documentType, filePath],
        );
        if (error) return { data: undefined, error };
        if (data.rows.length === 0)
          return { data: undefined, error: NOT_FOUND_ERROR };
        return { data: data.rows[0], error: undefined };
      },
    );
  }

  async getParentDocumentFilePathByDocumentID(
    docId: string,
  ): AsyncResponseType<string> {
    //TODO:invalidate on mutations
    const cacheKey = `parent_documents:${docId}`;
    return await withCacheAsideRedis(this.redisClient, cacheKey, async () => {
      const sql = `
        SELECT file_path
        FROM reporting.parent_documents
        WHERE id = $1;
        `;
      const { data, error } = await executeQuery<{ file_path: string }>(
        this.pool,
        sql,
        [docId],
      );
      if (error) return { data: undefined, error };
      if (data.rows.length === 0)
        return { data: undefined, error: NOT_FOUND_ERROR };
      return { data: data.rows[0].file_path, error: undefined };
    });
  }
}

export interface IS3Repository {
  uploadFile(
    bucket: string,
    key: string,
    file: File,
  ): AsyncResponseType<string>;
  getDocumentURLByFilePath(
    key?: string,
    bucket?: string,
    expiresIn?: number,
  ): AsyncResponseType<string>;
}

export class S3Repository implements IS3Repository {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "us-east-1", // dummy MinIO region
      endpoint: "http://localhost:9000",
      forcePathStyle: true, // required for MinIO
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
    });
  }

  async uploadFile(
    bucket: string,
    key: string,
    file: File,
  ): AsyncResponseType<string> {
    const arrayBuffer = await file.arrayBuffer();

    const { error } = await catchError(
      this.client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: Buffer.from(arrayBuffer),
          ContentType: file.type,
        }),
      ),
    );
    if (error) return { data: undefined, error };

    return { data: `/${bucket}/${key}`, error: undefined };
  }

  async getDocumentURLByFilePath(
    key: string,
    bucket: string = "mybucket",
    expiresIn: number = 3600,
  ): AsyncResponseType<string> {
    const { data, error } = await catchError(
      getSignedUrl(
        this.client,
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
        {
          expiresIn,
        },
      ),
    );
    if (error) return { data: undefined, error };
    return { data, error: undefined };
  }
}
