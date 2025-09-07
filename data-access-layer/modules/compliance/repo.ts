import { PropertyParentDocument } from "./model";
import { Pool } from "pg";
import { executeQuery } from "@/data-access-layer/util/query";

export interface IComplianceRepo {
  getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocument[] | Error>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<PropertyParentDocument | Error>;
}

export class ComplianceRepo implements IComplianceRepo {
  constructor(private pool: Pool) { }
  async getPropertyParentDocumentApprovalRequests(
    propertyId: string,
    userId: string,
  ): Promise<PropertyParentDocument[] | Error> {
    const sql = `
    SELECT *
    FROM compliance.property_parent_documents
    WHERE property_id = $1 AND user_id = $2;
    `;
    const result = await executeQuery<PropertyParentDocument>(this.pool, sql, [
      propertyId,
      userId,
    ]);
    if (result instanceof Error) return result;
    return result.rows;
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): Promise<PropertyParentDocument | Error> {
    const sql = `
    SELECT *
    FROM compliance.property_parent_documents
    WHERE property_id = $1 AND user_id = $2 AND parent_document_id = $3;
    `;
    const result = await executeQuery<PropertyParentDocument>(this.pool, sql, [
      propertyId,
      userId,
      parentDocId,
    ]);
    if (result instanceof Error) return result;
    return result.rows[0];
  }
  async sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): Promise<PropertyParentDocument | Error> {
    const sql = `
    INSERT INTO compliance.property_parent_documents(
      property_id,
      user_id,
      parent_document_id
    ) VALUES (
      $1,
      $2,
      $3
    ) RETURNING *;
    `;
    const result = await executeQuery<PropertyParentDocument>(this.pool, sql, [
      propertyId,
      userId,
      parentDocumentId,
    ]);
    return result instanceof Error ? result : result.rows[0];
  }
}
