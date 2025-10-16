from pydantic import BaseModel
from typing import List, Generic, TypeVar

T = TypeVar("T")


class PagedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page_number: int
    page_size: int
    has_next_page: bool
    has_previous_page: bool
    total_pages: int
