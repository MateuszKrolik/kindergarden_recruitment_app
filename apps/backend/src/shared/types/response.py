from typing import Any, Callable, Dict, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class HTTPError(BaseModel):
    code: int
    message: str


AuthMiddlewareResponse = Dict[str, Any]

AuthMiddlewareSignature = Callable[..., AuthMiddlewareResponse]
