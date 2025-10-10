from pydantic import BaseModel
from uuid import UUID


class Property(BaseModel):
    id: UUID
    name: str
    slug: str
