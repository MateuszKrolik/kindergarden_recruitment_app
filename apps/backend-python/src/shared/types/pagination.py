from dataclasses import dataclass
from typing import List, TypeVar, Generic

T = TypeVar("T")


@dataclass
class PagedResponse(Generic[T]):
    items: List[T]
    total: int
    page_number: int
    page_size: int
    has_next_page: bool
    has_previous_page: bool
    total_pages: int
