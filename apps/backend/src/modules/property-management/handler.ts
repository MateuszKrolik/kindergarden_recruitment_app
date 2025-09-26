import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import type { IPropertyManagementSvc } from "./svc.ts";
import { type Request, type Response, Router } from "express";
import type { Logger } from "winston";

export class PropertyManagementHandler {
  private svc: IPropertyManagementSvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  private logger: Logger;
  public router: Router;
  constructor(
    svc: IPropertyManagementSvc,
    authenticationMiddleware: AuthenticationMiddleware,
    logger: Logger,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.logger = logger.child({
      service: "property-management-handler",
    });
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
        const { data, error } = await this.svc.getAllProperties(
          pageSize,
          pageNumber,
        );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getPropertyUser = () => {
    this.router.get(
      "/properties/:propertyId/users/:userId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, userId } = req.params;
        const { data, error } = await this.svc.getPropertyUser(
          propertyId,
          userId,
        );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getPropertyParentDocumentRequirements = () => {
    this.router.get(
      "/properties/:propertyId/users/:userId/parent-document-requirements",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, userId } = req.params;
        const { data, error } =
          await this.svc.getDocumentRequirementsForGivenPropertyParent(
            propertyId,
            userId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getAllPropertyChildrenForGivenParent = () => {
    this.router.get(
      "/properties/:propertyId/parents/:parentId/property-children",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, parentId } = req.params;
        const { data, error } =
          await this.svc.getAllPropertyChildrenForGivenParent(
            propertyId,
            parentId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getDocumentRequirementsForGivenPropertyChild = () => {
    this.router.get(
      "/properties/:propertyId/children/:childId/document-requirements",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, childId } = req.params;
        const { data, error } =
          await this.svc.getDocumentRequirementsForGivenPropertyChild(
            propertyId,
            childId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
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
        const { data, error } = await this.svc.getAllPropertyChildrenPaged(
          propertyId,
          pageSize,
          pageNumber,
        );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };
}
