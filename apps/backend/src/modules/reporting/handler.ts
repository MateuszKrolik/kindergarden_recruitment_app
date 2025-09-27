import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import {
  DOCUMENT_TYPE,
  type DocumentType,
} from "shared/types/modules/reporting.ts";
import type { IReportingSvc } from "./svc.ts";
import {
  type Request,
  type RequestHandler,
  type Response,
  Router,
} from "express";
import { type Multer } from "multer";
import type { Logger } from "winston";

export class ReportingHandler {
  private svc: IReportingSvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  private logger: Logger;
  private uploadMiddleware: RequestHandler;
  public router: Router;
  constructor(
    svc: IReportingSvc,
    authenticationMiddleware: AuthenticationMiddleware,
    logger: Logger,
    multer: Multer,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.logger = logger.child({
      service: "reporting-handler",
    });
    this.uploadMiddleware = multer.single("file");
    this.registerRoutes();
  }

  private registerRoutes = () => {
    this.router.get(
      "/parents/:parentId/documents/:documentType",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { parentId, documentType } = req.params;
        const isValidDocumentType = (
          documentType: string,
        ): documentType is DocumentType => {
          const set = new Set(Object.values(DOCUMENT_TYPE));
          return set.has(documentType as DocumentType);
        };
        if (!isValidDocumentType(documentType)) {
          res
            .status(400)
            .json({ code: 400, messsage: "Invalid document type!" });
          return;
        }
        const { data, error } = await this.svc.getParentDocumentByType(
          parentId,
          documentType,
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
      "/parents/:parentId/documents/:documentType",
      this.authenticationMiddleware,
      this.uploadMiddleware,
      async (req: Request, res: Response) => {
        const { parentId, documentType } = req.params;
        const isValidDocumentType = (
          documentType: string,
        ): documentType is DocumentType => {
          const set = new Set(Object.values(DOCUMENT_TYPE));
          return set.has(documentType as DocumentType);
        };
        if (!isValidDocumentType(documentType)) {
          res
            .status(400)
            .json({ code: 400, message: "Invalid document type!" });
          return;
        }
        const file = req?.file;
        if (!file) {
          res.status(400).json({ code: 400, message: "File is required!" });
          return;
        }
        const browserFile = new File(
          [new Uint8Array(file.buffer)],
          file.originalname,
          {
            type: file.mimetype,
            lastModified: Date.now(),
          },
        );
        const { data, error } = await this.svc.saveParentDocument(
          parentId,
          documentType,
          browserFile,
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
      "/documents/*filePath",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const filePath = Array.isArray(req.params.filePath)
          ? req.params.filePath.join("/")
          : req.params.filePath;
        const { data, error } = await this.svc.getDocumentURLByFilePath(
          filePath,
          "mybucket",
          3600,
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
      "/parent-documents/:documentId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { documentId } = req.params;
        const { data, error } =
          await this.svc.getParentDocumentURLByDocumentID(documentId);
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
