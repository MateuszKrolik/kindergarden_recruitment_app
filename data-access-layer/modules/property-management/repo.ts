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
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }>;
  getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }>;
}

export class PropertyManagementRepo implements IPropertyManagementRepo {
  constructor(private pool: Pool) { }

  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<{ data?: PagedResponse<Property>; error?: Error }> {
    const sql = `
    SELECT 
      *,
      COUNT(*) OVER() as total_count
    FROM property_management.properties
    LIMIT $1
    OFFSET $2;
    `;
    const { data, error } = await executeQuery<
      Property & { total_count: number }
    >(this.pool, sql, [pageSize, calculateOffset(pageSize, pageNumber)]);
    if (error) return { data: undefined, error: error };
    const total_count = data?.rows[0].total_count;
    return {
      data: newPagedResponse(
        data?.rows || [],
        total_count || 0,
        pageNumber,
        pageSize,
      ),
      error: undefined,
    };
  }

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<{ data?: PropertyUser; error?: Error }> {
    const sql = `
    SELECT *
    FROM property_management.property_users
    WHERE property_id = $1 AND user_id = $2;
    `;
    const { data, error } = await executeQuery<PropertyUser>(this.pool, sql, [
      propertyId,
      userId,
    ]);
    if (error) return { data: undefined, error: error };
    return { data: data?.rows[0], error: undefined };
  }

  async getAllPropertyParentDocumentRequirements(
    propertyId: string,
  ): Promise<{ data?: PropertyParentDocumentRequirement[]; error?: Error }> {
    const sql = `
    SELECT *
    FROM property_management.property_parent_document_requirements
    WHERE property_id = $1;
    `;
    const { data, error } =
      await executeQuery<PropertyParentDocumentRequirement>(this.pool, sql, [
        propertyId,
      ]);
    if (error) return { data: undefined, error: error };
    return { data: data?.rows, error: undefined };
  }
}
