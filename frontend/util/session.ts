import { decodeJwt } from "jose";
import { cookies } from "next/headers";

export type JwtClaims = {
  email: string;
  userId: string;
  exp: number;
};

export async function getJwtClaims(): Promise<JwtClaims | null> {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const claims = decodeJwt<JwtClaims>(token);
    if (claims.exp && claims.exp < getNowSeconds()) {
      return null;
    }
    return claims;
  } catch {
    return null;
  }
}

export async function getAuthHeaders(): Promise<{ Authorization?: string }> {
  const token = await getSessionToken();
  if (!token) return {};
  return (await getJwtClaims()) ? { Authorization: token } : {};
}

async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get("session")?.value;
}

function getNowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
