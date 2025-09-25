import { Pool } from "pg";
import type {
  DocumentType,
  ParentDocument,
} from "shared/types/modules/reporting.ts";
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
import { catchError } from "shared/utils/error.ts";
import type { ApiResponse } from "shared/types/response.ts";
import type { Logger } from "winston";

export interface IReportingRepo {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): ApiResponse<ParentDocument>;
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): ApiResponse<DocumentType>;
  saveParentDocument(
    userId: string,
    documentType: DocumentType,
    filePath: string,
  ): ApiResponse<ParentDocument>;
  getParentDocumentFilePathByDocumentID(docId: string): ApiResponse<string>;
}

export class ReportingRepo implements IReportingRepo {
  private pool: Pool;
  private redisClient: RedisClientType;
  private logger: Logger;
  constructor(pool: Pool, redisClient: RedisClientType, logger: Logger) {
    this.pool = pool;
    this.redisClient = redisClient;
    this.logger = logger.child({
      service: "reporting-repo",
    });
  }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): ApiResponse<ParentDocument> {
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
            message: `Document with type: ${documentType} does not exist for parent: ${userId}!`,
          },
        };
      return { data: data.rows[0], error: undefined };
    });
  }

  async getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): ApiResponse<DocumentType> {
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
            message: `Parent document with id: ${parentDocumentId} was not found!`,
          },
        };
      return { data: data.rows[0].document_type, error: undefined };
    });
  }

  async saveParentDocument(
    userId: string,
    documentType: DocumentType,
    filePath: string,
  ): ApiResponse<ParentDocument> {
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
              message: `Document: ${documentType} was not saved successfully for parent: ${userId}!`,
            },
          };
        return { data: data.rows[0], error: undefined };
      },
    );
  }

  async getParentDocumentFilePathByDocumentID(
    docId: string,
  ): ApiResponse<string> {
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
            message: `Parent document with id: ${docId} was not found!`,
          },
        };
      return { data: data.rows[0].file_path, error: undefined };
    });
  }
}

export interface IS3Repository {
  uploadFile(bucket: string, key: string, file: File): ApiResponse<string>;
  getDocumentURLByFilePath(
    key?: string,
    bucket?: string,
    expiresIn?: number,
  ): ApiResponse<string>;
}

export class S3Repository implements IS3Repository {
  private client: S3Client;
  private logger: Logger;

  constructor(logger: Logger) {
    this.client = new S3Client({
      region: "us-east-1", // dummy MinIO region
      endpoint: "http://localhost:9000",
      forcePathStyle: true, // required for MinIO
      credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
      },
    });
    this.logger = logger.child({
      service: "reporting-s3-repo",
    });
  }

  async uploadFile(
    bucket: string,
    key: string,
    file: File,
  ): ApiResponse<string> {
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

    return { data: `/${bucket}/${key}`, error: undefined };
  }

  async getDocumentURLByFilePath(
    key: string,
    bucket: string = "mybucket",
    expiresIn: number = 3600,
  ): ApiResponse<string> {
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
    return { data, error: undefined };
  }
}
