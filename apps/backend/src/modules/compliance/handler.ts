import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import { REQUEST_STATUS } from "shared/types/modules/compliance.ts";
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
    this.getAllDocumentApprovalRequestsForGivenPropertyParent();
    this.getPropertyParentDocumentApprovalRequestByDocumentId();
    this.sendPropertyParentDocumentApprovalRequest();
    this.getAllDocumentApprovalRequestsForGivenProperty();
    this.setPropertyParentDocumentApprovalRequestStatus();
  };

  private getAllDocumentApprovalRequestsForGivenPropertyParent = () => {
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
            route: req.route,
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

  private getPropertyParentDocumentApprovalRequestByDocumentId = () => {
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
            route: req.route,
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

  private sendPropertyParentDocumentApprovalRequest = () => {
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
            route: req.route,
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

  private getAllDocumentApprovalRequestsForGivenProperty = () => {
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
            route: req.route,
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

  private setPropertyParentDocumentApprovalRequestStatus = () => {
    this.router.patch(
      "/properties/:propertyId/parents/:parentId/parent-documents/:parentDocumentId/status/:requestStatus",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const adminId = req?.user?.id || ""; // TODO: authorization check (via authZ middleware)

        const { propertyId, parentId, parentDocumentId, requestStatus } =
          req.params;
        const isValidStatus = (status: string) =>
          status === REQUEST_STATUS.PENDING ||
          status === REQUEST_STATUS.APPROVED ||
          status === REQUEST_STATUS.REJECTED;
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
            route: req.route,
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
