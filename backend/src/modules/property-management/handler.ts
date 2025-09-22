import type { AsyncResponseType } from "../../shared/types/response.ts";
import type { PagedResponse } from "../../shared/types/pagination.ts";
import type {
  PropertyUser,
  PropertyParentDocumentRequirement,
  PropertyChild,
  PropertyChildDocumentRequirement,
} from "./model.ts";
import type { IPropertyManagementSvc } from "./svc.ts";
import type { Request, Response } from "express";

export class PropertyManagementHandler {
  private svc: IPropertyManagementSvc;
  constructor(svc: IPropertyManagementSvc) {
    this.svc = svc;
  }

  getAllProperties = async (req: Request, res: Response): Promise<void> => {
    const pageSize =
      typeof req.query.pageSize === "string" ? parseInt(req.query.pageSize) : 1;
    const pageNumber =
      typeof req.query.pageNumber === "string"
        ? parseInt(req.query.pageNumber)
        : 1;
    const result = await this.svc.getAllProperties(pageSize, pageNumber);
    console.log(result);
    res.json(result);
  };

  async getPropertyUser(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyUser> {
    return await this.svc.getPropertyUser(propertyId, userId);
  }

  async getPropertyParentDocumentRequirements(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyParentDocumentRequirement[]> {
    return await this.svc.getDocumentRequirementsForGivenPropertyParent(
      propertyId,
      userId,
    );
  }

  async getAllPropertyChildrenForGivenParent(
    propertyId: string,
    parentId: string,
  ): AsyncResponseType<PropertyChild[]> {
    return await this.svc.getAllPropertyChildrenForGivenParent(
      propertyId,
      parentId,
    );
  }

  async getDocumentRequirementsForGivenPropertyChild(
    propertyId: string,
    childId: string,
  ): AsyncResponseType<PropertyChildDocumentRequirement[]> {
    return await this.svc.getDocumentRequirementsForGivenPropertyChild(
      propertyId,
      childId,
    );
  }

  async getAllPropertyChildrenPaged(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<PropertyChild>> {
    return await this.svc.getAllPropertyChildrenPaged(
      propertyId,
      pageSize,
      pageNumber,
    );
  }
}
