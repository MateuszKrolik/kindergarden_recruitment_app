import type { AuthenticationMiddleware } from "../../middleware/auth.ts";
import type { IIdentitySvc } from "./svc.ts";
import { type Request, type Response, Router } from "express";
import type { Logger } from "winston";

export class IdentityHandler {
  private svc: IIdentitySvc;
  private authenticationMiddleware: AuthenticationMiddleware;
  private logger: Logger;
  public router: Router;
  constructor(
    svc: IIdentitySvc,
    authenticationMiddleware: AuthenticationMiddleware,
    logger: Logger,
  ) {
    this.svc = svc;
    this.authenticationMiddleware = authenticationMiddleware;
    this.router = Router();
    this.logger = logger.child({
      service: "identity-handler",
    });
    this.registerRoutes();
  }

  private registerRoutes = () => {
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
          res.status(error.code).json({ error: error });
          return;
        }
        res.status(200).json({ data: data });
      },
    );
  };
}
