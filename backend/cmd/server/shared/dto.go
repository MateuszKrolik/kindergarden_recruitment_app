package shared

type PagedResponse[T any] struct {
	Items      []T   `json:"items"`
	Total      int64 `json:"total"`
	PageNumber int64 `json:"page_number"`
	PageSize   int64 `json:"pageSize"`
	More       bool  `json:"more"`
}

func NewPagedResponse[T any](items []T, total, pageNumber, pageSize int64) PagedResponse[T] {
	return PagedResponse[T]{
		Items:      items,
		Total:      total,
		PageNumber: pageNumber,
		PageSize:   pageSize,
		More:       (pageNumber * pageSize) < total,
	}
}
