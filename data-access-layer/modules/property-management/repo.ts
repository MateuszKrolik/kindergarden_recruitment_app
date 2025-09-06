import { newPagedResponse, PagedResponse } from "@/types/pagination";
import { Property, PropertyUser } from "./model";
import { Pool } from "pg";
import { executeQuery } from "@/data-access-layer/util/query";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<PropertyUser | Error>;
}

export class PropertyManagementRepo implements IPropertyManagementRepo {
  constructor(private pool: Pool) { }

  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error> {
    const offset = (pageNumber - 1) * pageSize;
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
      [pageSize, offset],
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
}
