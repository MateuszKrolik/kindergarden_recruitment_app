import type { ParentDocument } from "./model.ts";
import { type IReportingRepo, type IS3Repository } from "./repo.ts";
import type { DocumentType } from "../../shared/types/reporting.ts";
import { extname } from "path";
import type { AsyncResponseType } from "../../shared/types/response.ts";

export interface IReportingSvc {
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
    file: File,
  ): AsyncResponseType<ParentDocument>;
  getDocumentURLByFilePath(
    bucket: string,
    key: string,
    expiresIn: number,
  ): AsyncResponseType<string>;
  getParentDocumentURLByDocumentID(docId: string): AsyncResponseType<string>;
}

export class ReportingSvc implements IReportingSvc {
  private repo: IReportingRepo;
  private s3Repo: IS3Repository;
  constructor(repo: IReportingRepo, s3Repo: IS3Repository) {
    this.repo = repo;
    this.s3Repo = s3Repo;
  }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): AsyncResponseType<ParentDocument> {
    return await this.repo.getParentDocumentByType(userId, documentType);
  }

  async getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): AsyncResponseType<DocumentType> {
    return await this.repo.getParentDocumentTypeByDocumentId(parentDocumentId);
  }

  async saveParentDocument(
    userId: string,
    documentType: DocumentType,
    file: File,
  ): AsyncResponseType<ParentDocument> {
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
    key: string,
    bucket: string = "mybucket",
    expiresIn: number = 3600,
  ): AsyncResponseType<string> {
    return await this.s3Repo.getDocumentURLByFilePath(key, bucket, expiresIn);
  }

  async getParentDocumentURLByDocumentID(
    docId: string,
  ): AsyncResponseType<string> {
    const { data, error } =
      await this.repo.getParentDocumentFilePathByDocumentID(docId);
    if (error) return { data: undefined, error };
    return await this.s3Repo.getDocumentURLByFilePath(data);
  }
}
