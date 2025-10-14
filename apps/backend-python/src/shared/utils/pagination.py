import math
from typing import List, TypeVar

from src.shared.types.pagination import PagedResponse

T = TypeVar("T")


def calculate_offset(page_size: int, page_number: int) -> int:
    return (page_number - 1) * page_size


def new_paged_response(
    items: List[T],
    total: int,
    page_number: int,
    page_size: int,
) -> PagedResponse[T]:
    total_pages = 0
    if total > 0 and page_size > 0:
        total_pages = math.ceil(total / page_size)

    return PagedResponse(
        items=items,
        total=total,
        page_number=page_number,
        page_size=page_size,
        has_next_page=page_number < total_pages,
        has_previous_page=page_number > 1,
        total_pages=total_pages,
    )
