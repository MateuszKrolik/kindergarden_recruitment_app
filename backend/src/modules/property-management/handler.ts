import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import type { IPropertyManagementSvc } from "./svc.ts";
import { type Request, type Response, Router } from "express";

export class PropertyManagementHandler {
  private svc: IPropertyManagementSvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  public router: Router;
  constructor(
    svc: IPropertyManagementSvc,
    authenticationMiddleware: AuthenticationMiddleware,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes = () => {
    this.getAllProperties();
    this.getPropertyUser();
    this.getPropertyParentDocumentRequirements();
    this.getAllPropertyChildrenForGivenParent();
    this.getDocumentRequirementsForGivenPropertyChild();
    this.getAllPropertyChildrenPaged();
  };

  private getAllProperties = () => {
    this.router.get(
      "/properties",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const pageSize =
          typeof req.query.pageSize === "string"
            ? parseInt(req.query.pageSize)
            : 1;
        const pageNumber =
          typeof req.query.pageNumber === "string"
            ? parseInt(req.query.pageNumber)
            : 1;
        const result = await this.svc.getAllProperties(pageSize, pageNumber);
        console.log(result);
        res.json(result);
      },
    );
  };

  private getPropertyUser = () => {
    this.router.get(
      "/properties/:propertyId/users/:userId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, userId } = req.params;
        const result = await this.svc.getPropertyUser(propertyId, userId);
        console.log(result);
        res.json(result);
      },
    );
  };

  private getPropertyParentDocumentRequirements = () => {
    this.router.get(
      "/properties/:propertyId/users/:userId/parent-document-requirements",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, userId } = req.params;
        const result =
          await this.svc.getDocumentRequirementsForGivenPropertyParent(
            propertyId,
            userId,
          );
        console.log(result);
        res.json(result);
      },
    );
  };

  private getAllPropertyChildrenForGivenParent = () => {
    this.router.get(
      "/properties/:propertyId/parents/:parentId/property-children",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, parentId } = req.params;
        const result = await this.svc.getAllPropertyChildrenForGivenParent(
          propertyId,
          parentId,
        );
        console.log(result);
        res.json(result);
      },
    );
  };

  private getDocumentRequirementsForGivenPropertyChild = () => {
    this.router.get(
      "/properties/:propertyId/children/:childId/document-requirements",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, childId } = req.params;
        const result =
          await this.svc.getDocumentRequirementsForGivenPropertyChild(
            propertyId,
            childId,
          );
        console.log(result);
        res.json(result);
      },
    );
  };

  private getAllPropertyChildrenPaged = () => {
    this.router.get(
      "/properties/:propertyId/property-children",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId } = req.params;
        const pageSize =
          typeof req.query.pageSize === "string"
            ? parseInt(req.query.pageSize)
            : 1;
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
      },
    );
  };
}
