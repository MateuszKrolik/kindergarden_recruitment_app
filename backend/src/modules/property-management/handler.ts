import type { IPropertyManagementSvc } from "./svc.ts";
import type { Request, Response } from "express";

export class PropertyManagementHandler {
  private svc: IPropertyManagementSvc;
  constructor(svc: IPropertyManagementSvc) {
    this.svc = svc;
  }

  getAllProperties = async (req: Request, res: Response) => {
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

  getPropertyUser = async (req: Request, res: Response) => {
    const { propertyId, userId } = req.params;
    const result = await this.svc.getPropertyUser(propertyId, userId);
    console.log(result);
    res.json(result);
  };

  getPropertyParentDocumentRequirements = async (
    req: Request,
    res: Response,
  ) => {
    // "/properties/:propertyId/users/:userId/parent-document-requirements"
    const { propertyId, userId } = req.params;
    const result = await this.svc.getDocumentRequirementsForGivenPropertyParent(
      propertyId,
      userId,
    );
    console.log(result);
    res.json(result);
  };

  getAllPropertyChildrenForGivenParent = async (
    req: Request,
    res: Response,
  ) => {
    // /properties/:propertyId/parents/:parentId/property-children
    const { propertyId, parentId } = req.params;
    const result = await this.svc.getAllPropertyChildrenForGivenParent(
      propertyId,
      parentId,
    );
    console.log(result);
    res.json(result);
  };

  getDocumentRequirementsForGivenPropertyChild = async (
    req: Request,
    res: Response,
  ) => {
    // /properties/:propertyId/children/:childId/document-requirements
    const { propertyId, childId } = req.params;
    const result = await this.svc.getDocumentRequirementsForGivenPropertyChild(
      propertyId,
      childId,
    );
    console.log(result);
    res.json(result);
  };

  getAllPropertyChildrenPaged = async (req: Request, res: Response) => {
    // /properties/:propertyId/property-children
    const { propertyId } = req.params;
    const pageSize =
      typeof req.query.pageSize === "string" ? parseInt(req.query.pageSize) : 1;
    const pageNumber =
      typeof req.query.pageNumber === "string"
        ? parseInt(req.query.pageNumber)
        : 1;
    const result = await this.svc.getAllPropertyChildrenPaged(
      propertyId,
      pageSize,
      pageNumber,
    );
    console.log(result);
    res.json(result);
  };
}
