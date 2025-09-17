import { pool } from "../../db/db.ts";
import type { ParentDocument } from "./model.ts";
import {
  type IReportingRepo,
  type IS3Repository,
  ReportingRepo,
  S3Repository,
} from "./repo.ts";
import type { DocumentType } from "../../shared/types/reporting.ts";
import { redisClient } from "../../db/redis-client.ts";
import { extname } from "path";

export interface IReportingSvc {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }>;
  saveParentDocument(
    userId: string,
    documentType: DocumentType,
    file: File,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getDocumentURLByFilePath(
    bucket: string,
    key: string,
    expiresIn: number,
  ): Promise<{ data?: string; error?: Error }>;
  getParentDocumentURLByDocumentID(
    docId: string,
  ): Promise<{ data?: string; error?: Error }>;
}

class ReportingSvc implements IReportingSvc {
  private repo: IReportingRepo;
  private s3Repo: IS3Repository;
  constructor(repo?: IReportingRepo, s3Repo?: IS3Repository) {
    this.repo = repo ?? new ReportingRepo(pool, redisClient);
    this.s3Repo = s3Repo ?? new S3Repository();
  }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }> {
    return await this.repo.getParentDocumentByType(userId, documentType);
  }

  async getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }> {
    return await this.repo.getParentDocumentTypeByDocumentId(parentDocumentId);
  }

  async saveParentDocument(
    userId: string,
    documentType: DocumentType,
    file: File,
  ): Promise<{ data?: ParentDocument; error?: Error }> {
    const filePath = `parents/${userId}/documents/${documentType}${extname(file.name)}`;
    const { error } = await this.s3Repo.uploadFile("mybucket", filePath, file);
    if (error) return { data: undefined, error };
    const result = await this.repo.saveParentDocument(
      userId,
      documentType,
      filePath,
    );
    if (result.error) return { data: undefined, error: result.error };
    return result;
  }

  async getDocumentURLByFilePath(
    bucket: string,
    key: string,
    expiresIn: number = 3600,
  ): Promise<{ data?: string; error?: Error }> {
    return await this.s3Repo.getDocumentURLByFilePath(bucket, key, expiresIn);
  }

  async getParentDocumentURLByDocumentID(
    docId: string,
  ): Promise<{ data?: string; error?: Error }> {
    const { data, error } =
      await this.repo.getParentDocumentFilePathByDocumentID(docId);
    if (error) return { data: undefined, error };
    return await this.s3Repo.getDocumentURLByFilePath(data);
  }
}

const reportingSvc = new ReportingSvc();
export default reportingSvc;
