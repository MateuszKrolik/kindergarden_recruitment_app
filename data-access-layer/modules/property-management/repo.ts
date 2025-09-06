import { newPagedResponse, PagedResponse } from "@/types/pagination";
import {
  Property,
  PropertyParentDocumentRequirement,
  PropertyUser,
} from "./model";
import { Pool } from "pg";
import { calculateOffset, executeQuery } from "@/data-access-layer/util/query";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<PropertyUser | Error>;
  getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<PropertyParentDocumentRequirement[] | Error>;
}

export class PropertyManagementRepo implements IPropertyManagementRepo {
  constructor(private pool: Pool) { }

  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error> {
    const sql = `
    SELECT 
      *,
      COUNT(*) OVER() as total_count
    FROM property_management.properties
    LIMIT $1
    OFFSET $2;
    `;
    const queryResult = await executeQuery<Property & { total_count: number }>(
      this.pool,
      sql,
      [pageSize, calculateOffset(pageSize, pageNumber)],
    );
    if (queryResult instanceof Error) return queryResult;
    const total_count = queryResult.rows[0].total_count;
    return newPagedResponse(
      queryResult.rows,
      total_count,
      pageNumber,
      pageSize,
    );
  }

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<PropertyUser | Error> {
    const sql = `
    SELECT *
    FROM property_management.property_users
    WHERE property_id = $1 AND user_id = $2;
    `;
    const result = await executeQuery<PropertyUser>(this.pool, sql, [
      propertyId,
      userId,
    ]);
    if (result instanceof Error) return result;
    return result.rows[0];
  }

  async getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<PropertyParentDocumentRequirement[] | Error> {
    const sql = `
    SELECT *
    FROM property_management.property_parent_document_requirements
    WHERE property_id = $1;
    `;
    const result = await executeQuery<PropertyParentDocumentRequirement>(
      this.pool,
      sql,
      [propertyId],
    );
    if (result instanceof Error) return result;
    return result.rows;
  }
}
