import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import {
  REQUEST_STATUS,
  type RequestStatus,
} from "shared/types/modules/compliance.ts";
import type { IComplianceSvc } from "./svc.ts";
import { type Request, type Response, Router } from "express";
import type { Logger } from "winston";

export class ComplianceHandler {
  private svc: IComplianceSvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  private logger: Logger;
  public router: Router;
  constructor(
    svc: IComplianceSvc,
    authenticationMiddleware: AuthenticationMiddleware,
    logger: Logger,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.logger = logger.child({
      service: "compliance-handler",
    });
    this.registerRoutes();
  }

  private registerRoutes = () => {
    this.router.get(
      "/properties/:propertyId/parents/:parentId/parent-document-requests",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, parentId } = req.params;
        const { data, error } =
          await this.svc.getAllDocumentApprovalRequestsForGivenPropertyParent(
            propertyId,
            parentId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );

    this.router.get(
      "/properties/:propertyId/parents/:parentId/parent-documents/:parentDocId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, parentId, parentDocId } = req.params;
        const { data, error } =
          await this.svc.getPropertyParentDocumentApprovalRequestByDocumentId(
            propertyId,
            parentId,
            parentDocId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );

    this.router.post(
      "/properties/:propertyId/parents/:parentId/parent-documents/:parentDocId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, parentId, parentDocId } = req.params;
        const { data, error } =
          await this.svc.sendPropertyParentDocumentApprovalRequest(
            propertyId,
            parentId,
            parentDocId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );

    this.router.get(
      "/properties/:propertyId/parent-document-requests",
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
        const { data, error } =
          await this.svc.getAllDocumentApprovalRequestsForGivenProperty(
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
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );

    this.router.patch(
      "/properties/:propertyId/parents/:parentId/parent-documents/:parentDocumentId/status/:requestStatus",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const adminId = req?.user?.id || "";

        const { propertyId, parentId, parentDocumentId, requestStatus } =
          req.params;
        const isValidStatus = (status: string): status is RequestStatus => {
          const set = new Set(Object.values(REQUEST_STATUS));
          return set.has(status as RequestStatus);
        };
        if (!isValidStatus(requestStatus)) {
          res
            .status(400)
            .json({ code: 400, message: "Invalid request status!" });
          return;
        }
        const { data, error } =
          await this.svc.setPropertyParentDocumentRequestStatus(
            propertyId,
            parentId,
            parentDocumentId,
            requestStatus,
            adminId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );

    this.router.get(
      "/properties/:propertyId/children/:childId/child-document-requests",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { propertyId, childId } = req.params;
        const { data, error } =
          await this.svc.getAllDocumentApprovalRequestsForGivenPropertyChild(
            propertyId,
            childId,
          );
        if (error) {
          this.logger.error(error.message, {
            route: req.route?.path,
            method: req.method,
            statusCode: error.code,
          });
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };
}
