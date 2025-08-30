package compliance

type RequestStatus string

var (
	PendingStatus  RequestStatus = "pending"
	ApprovedStatus RequestStatus = "approved"
	RejectedStatus RequestStatus = "rejected"
)

func (s RequestStatus) IsValid() bool {
	switch s {
	case PendingStatus, ApprovedStatus, RejectedStatus:
		return true
	}
	return false
}
