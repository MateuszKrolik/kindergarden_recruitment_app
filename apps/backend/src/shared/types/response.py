from typing import Any, Dict, Generic, Optional, TypeVar, Union

from pydantic import BaseModel

T = TypeVar("T")


class HTTPError(BaseModel):
    code: int
    message: str


class ApiResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    error: Optional[HTTPError] = None


HTTPErrorResponse = Union[tuple[T, None], tuple[None, HTTPError]]

ErrorResponse = Union[tuple[T, None], tuple[None, Exception]]

AuthMiddlewareResponse = HTTPErrorResponse[Dict[str, Any]]
