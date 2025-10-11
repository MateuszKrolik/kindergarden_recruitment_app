import os
from httpx import AsyncClient
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PublicKey
import jwt

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


class JWKSClient:
    def __init__(self):
        self._cache = None

    async def fetch_jwks(self):
        async with AsyncClient() as client:
            response = await client.get(f"{FRONTEND_URL}/api/auth/jwks")
            response.raise_for_status()
            return response.json()

    async def get_jwks(self):
        if self._cache is None:
            self._cache = await self.fetch_jwks()
        return self._cache

    @staticmethod
    def eddsa_public_key_from_jwk(jwk):
        x_bytes = jwt.utils.base64url_decode(jwk["x"].encode())
        return Ed25519PublicKey.from_public_bytes(x_bytes)
