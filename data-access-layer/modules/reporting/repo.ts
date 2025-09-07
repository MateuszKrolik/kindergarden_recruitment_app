import { Pool } from "pg";
import { DocumentType } from "../shared/types/reporting";
import { ParentDocument } from "./model";
import { executeQuery } from "@/data-access-layer/util/query";

export interface IReportingRepo {
  getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<ParentDocument | Error>;
}

export class ReportingRepo implements IReportingRepo {
  constructor(private pool: Pool) { }

  async getParentDocumentByType(
    userId: string,
    documentType: DocumentType,
  ): Promise<ParentDocument | Error> {
    const sql = `
    SELECT *
    FROM reporting.parent_documents
    WHERE user_id = $1 AND document_type = $2;
    `;
    const result = await executeQuery<ParentDocument>(this.pool, sql, [
      userId,
      documentType,
    ]);
    if (result instanceof Error) return result;
    return result.rows[0];
  }
}
