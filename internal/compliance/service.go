package compliance

import "context"

type IComplianceService interface {
	SavePropertyParentDocApprovalRequest(c context.Context, doc *PropertyParentDocument) error
}

type complianceService struct {
	repo IComplianceRepository
}

func NewComplianceService(
	repo IComplianceRepository,
) IComplianceService {
	return &complianceService{
		repo: repo,
	}
}

func (s *complianceService) SavePropertyParentDocApprovalRequest(
	c context.Context,
	doc *PropertyParentDocument,
) error {
	if err := s.repo.SavePropertyParentDocApprovalRequest(c, doc); err != nil {
		return err
	}
	return nil
}
