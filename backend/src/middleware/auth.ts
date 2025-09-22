import type { Request, Response, NextFunction } from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { catchError } from "../shared/util/error.ts";

const PORT = 3000;
const BASE_URL = "http://localhost";

const JWKS = createRemoteJWKSet(new URL(`${BASE_URL}:${PORT}/api/auth/jwks`));

export async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeaderToken = req.headers.authorization;
  if (!authHeaderToken) {
    return res.status(401).send("Unauthorized: Missing auth header!");
  }

  const { error } = await catchError(jwtVerify(authHeaderToken, JWKS));
  if (error) {
    console.error(error);
    return res.status(401).send("Unauthorized: Invalid token!");
  }
  next();
}
