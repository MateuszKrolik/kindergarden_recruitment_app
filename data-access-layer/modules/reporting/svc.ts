import { pool } from "../../db/db.ts";
import type { ParentDocument } from "./model.ts";
import { type IReportingRepo, ReportingRepo } from "./repo.ts";
import type { DocumentType } from "../../shared/types/reporting.ts";
import { redisClient } from "../../db/redis-client.ts";

export interface IReportingSvc {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
  getParentDocumentTypeByDocumentId(
    parentDocumentId: string,
  ): Promise<{ data?: DocumentType; error?: Error }>;
}

class ReportingSvc implements IReportingSvc {
  private repo: IReportingRepo;
  constructor(repo?: IReportingRepo) {
    this.repo = repo ?? new ReportingRepo(pool, redisClient);
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
}

const reportingSvc = new ReportingSvc();
export default reportingSvc;
