from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel


T = TypeVar("T")


class EventEnvelope(BaseModel, Generic[T]):
    id: UUID
    type: str
    timestamp: datetime
    payload: T
    source: str
    version: str
