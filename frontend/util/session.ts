import { decodeJwt } from "jose";
import { cookies } from "next/headers";

export type JwtClaims = {
  email: string;
  userId: string;
  exp: number;
};

export async function getJwtTokenWithClaims(): Promise<{
  token?: string;
  claims?: JwtClaims;
}> {
  const token = await getSessionToken();
  if (!token) return {};

  try {
    const claims = decodeJwt<JwtClaims>(token);
    if (claims.exp && claims.exp < getNowSeconds()) {
      return {};
    }
    return { token: token, claims: claims };
  } catch {
    return {};
  }
}

async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get("session")?.value;
}

function getNowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
