import { Pool } from "pg";
import { DocumentType } from "../../shared/types/reporting";
import { ParentDocument } from "./model";
import { executeQuery } from "@/data-access-layer/shared/util/query";

export interface IReportingRepo {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<{ data?: ParentDocument; error?: Error }>;
}

export class ReportingRepo implements IReportingRepo {
  constructor(private pool: Pool) { }

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
}
