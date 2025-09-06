import { newPagedResponse, PagedResponse } from "@/types/pagination";
import { Property } from "./model";
import { Pool } from "pg";
import { executeQuery } from "@/data-access-layer/util/query";

export interface IPropertyManagementRepo {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error>;
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
}
