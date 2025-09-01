package shared

type RequestStatus string

var (
	PendingStatus  RequestStatus = "pending"
	ApprovedStatus RequestStatus = "approved"
	RejectedStatus RequestStatus = "rejected"
)
