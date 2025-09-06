import { PagedResponse } from "@/types/pagination";
import { Property, PropertyUser } from "./model";
import { IPropertyManagementRepo, PropertyManagementRepo } from "./repo";
import { pool } from "@/data-access-layer/db/db";

export interface IPropertyManagementSvc {
  getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error>;
  getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<PropertyUser | Error>;
}

export class PropertyManagementSvc implements IPropertyManagementSvc {
  private repo: IPropertyManagementRepo;
  constructor(repo?: IPropertyManagementRepo) {
    this.repo = repo ?? new PropertyManagementRepo(pool);
  }
  async getAllProperties(
    pageSize: number,
    pageNumber: number,
  ): Promise<PagedResponse<Property> | Error> {
    return this.repo.getAllProperties(pageSize, pageNumber);
  }
  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): Promise<PropertyUser | Error> {
    return this.repo.getPropertyUser(propertyId, userId);
  }
}
