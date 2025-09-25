import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { catchError } from "shared/utils/error.ts";

const PORT = 3000;
const BASE_URL = "http://localhost";

const JWKS = createRemoteJWKSet(new URL(`${BASE_URL}:${PORT}/api/auth/jwks`));

export type AuthenticationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<Response<any, Record<string, any>> | undefined>;

declare module "express-serve-static-core" {
  interface Request {
    user?: JWTPayload & {
      id?: string;
      name?: string;
      email?: string;
      emailVerified?: boolean;
      image?: string | null;
      createdAt?: string;
      updatedAt?: string;
    };
  }
}

export const authN: AuthenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeaderToken = req.headers.authorization;
  if (!authHeaderToken) {
    return res.status(401).send({
      code: 401,
      message: "Unauthorized: Missing auth header!",
    });
  }

  const { data, error } = await catchError(jwtVerify(authHeaderToken, JWKS));

  if (error) {
    return res
      .status(401)
      .send({ code: 401, message: "Unauthorized: Invalid token!" });
  }

  const { payload } = data;
  req.user = payload as Request["user"];

  next();
};
