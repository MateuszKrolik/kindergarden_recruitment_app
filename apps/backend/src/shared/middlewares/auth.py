from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

from src.shared.exceptions.unauthorized import UnauthorizedException
from src.shared.middlewares.jwks import JWKSClient
from src.shared.types.response import (
    AuthMiddlewareResponse,
)

jwks_client = JWKSClient()


async def auth_middleware(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
) -> AuthMiddlewareResponse:
    if not credentials:
        raise UnauthorizedException(message="Unauthorized: Missing auth header!")

    try:
        header = jwt.get_unverified_header(credentials.credentials)
        kid = header.get("kid")
        jwks = await jwks_client.get_jwks()
        jwk = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not jwk:
            raise UnauthorizedException(message="Unauthorized: Unknown key ID (kid)")
        public_key = jwks_client.eddsa_public_key_from_jwk(jwk)

        payload = jwt.decode(
            credentials.credentials,
            key=public_key,
            algorithms=["EdDSA"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.InvalidTokenError:
        raise UnauthorizedException(message="Unauthorized: Invalid token!")
