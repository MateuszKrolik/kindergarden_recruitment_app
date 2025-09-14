import { Pool } from "pg";
import { DocumentType } from "../../shared/types/reporting.ts";
import { ParentDocument } from "./model.ts";
import { executeQuery } from "../../shared/util/query.ts";

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
