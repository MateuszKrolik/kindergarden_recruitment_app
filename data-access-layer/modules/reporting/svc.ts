import { pool } from "@/data-access-layer/db/db";
import { ParentDocument } from "./model";
import { IReportingRepo, ReportingRepo } from "./repo";
import { DocumentType } from "../../shared/types/reporting";

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
