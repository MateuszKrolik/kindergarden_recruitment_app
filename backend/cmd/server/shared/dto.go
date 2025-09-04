package shared

type PagedResponse[T any] struct {
	Items           []T   `json:"items"`
	Total           int64 `json:"total"`
	PageNumber      int64 `json:"page_number"`
	PageSize        int64 `json:"page_size"`
	HasNextPage     bool  `json:"has_next_page"`
	HasPreviousPage bool  `json:"has_previous_page"`
	TotalPages      int64 `json:"total_pages"`
}

func NewPagedResponse[T any](items []T, total, pageNumber, pageSize int64) PagedResponse[T] {
	totalPages := int64(1)
	if total > 0 && pageSize > 0 {
		totalPages = (total + pageSize - 1) / pageSize // integer division trick
	}

	return PagedResponse[T]{
		Items:           items,
		Total:           total,
		PageNumber:      pageNumber,
		PageSize:        pageSize,
		HasNextPage:     (pageNumber * pageSize) < total,
		HasPreviousPage: pageNumber > 1,
		TotalPages:      totalPages,
	}
}
