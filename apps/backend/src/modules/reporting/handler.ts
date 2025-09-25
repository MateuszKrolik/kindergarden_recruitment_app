import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import {
  DOCUMENT_TYPE,
  type DocumentType,
} from "shared/types/modules/reporting.ts";
import type { IReportingSvc } from "./svc.ts";
import { type Request, type Response, Router } from "express";
import multer from "multer";

export class ReportingHandler {
  private svc: IReportingSvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  public router: Router;
  constructor(
    svc: IReportingSvc,
    authenticationMiddleware: AuthenticationMiddleware,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.registerRoutes();
  }

  private registerRoutes = () => {
    this.getParentDocumentByType();
    this.saveParentDocument();
    this.getDocumentURLByFilePath();
    this.getParentDocumentURLByDocumentID();
  };

  private getParentDocumentByType = () => {
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
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private saveParentDocument = () => {
    const upload = multer({ storage: multer.memoryStorage() });
    this.router.post(
      "/parents/:parentId/documents/:documentType",
      this.authenticationMiddleware,
      upload.single("file"),
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
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getDocumentURLByFilePath = () => {
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
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };

  private getParentDocumentURLByDocumentID = () => {
    this.router.get(
      "/parent-documents/:documentId",
      this.authenticationMiddleware,
      async (req: Request, res: Response) => {
        const { documentId } = req.params;
        const { data, error } =
          await this.svc.getParentDocumentURLByDocumentID(documentId);
        if (error) {
          res.status(error.code).json(error);
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };
}
