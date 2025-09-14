import { pool } from "../../db/db.ts";
import type { ParentDocument } from "./model.ts";
import { type IReportingRepo, ReportingRepo } from "./repo.ts";
import type { DocumentType } from "../../shared/types/reporting.ts";

export interface IReportingSvc {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
}

class ReportingSvc implements IReportingSvc {
  private repo: IReportingRepo;
  constructor(repo?: IReportingRepo) {
    this.repo = repo ?? new ReportingRepo(pool);
  }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }> {
    return await this.repo.getParentDocumentByType(userId, documentType);
  }
}

const reportingSvc = new ReportingSvc();
export default reportingSvc;
