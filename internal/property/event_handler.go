package property

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"sync"

	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/bus"
	"github.com/MateuszKrolik/kindergarden_recruitment_app_v3/cmd/server/shared"
)

type IPropertyParentDocumentStatusUpdatedEventHandler interface {
	Handle(e bus.Event) error
	Name() string
	EventName() string
}

type propertyParentDocumentStatusUpdatedEventHandler struct {
	bus         bus.IEventBus
	propertySvc IPropertyService
	docClient   IDocumentClient
	logger      *slog.Logger
	ctx         context.Context
}

func NewPropertyParentDocumentStatusUpdatedEventHandler(
	bus bus.IEventBus,
	propertySvc IPropertyService,
	docClient IDocumentClient,
	logger *slog.Logger,
) IPropertyParentDocumentStatusUpdatedEventHandler {
	return &propertyParentDocumentStatusUpdatedEventHandler{
		bus:         bus,
		propertySvc: propertySvc,
		docClient:   docClient,
		logger:      logger,
		ctx:         context.Background(),
	}
}

func (h *propertyParentDocumentStatusUpdatedEventHandler) Name() string {
	return "property_parent_document_status_updated_event_handler"
}

func (h *propertyParentDocumentStatusUpdatedEventHandler) EventName() string {
	return shared.PropertyParentDocumentStatusUpdated{}.Name()
}

func (h *propertyParentDocumentStatusUpdatedEventHandler) Handle(event bus.Event) error {
	e, ok := event.Data.(shared.PropertyParentDocumentStatusUpdated)
	if !ok {
		h.logger.Log(h.ctx, slog.LevelDebug, "Invalid event type, returning early...")
		return nil
	}

	if e.Status != shared.ApprovedStatus {
		h.logger.Log(
			h.ctx,
			slog.LevelInfo,
			"Request not in approved status, no need to assign points.",
		)
		return nil
	}

	propertyChildren, err := h.propertySvc.GetPropertyChildrenByParentID(
		h.ctx,
		e.PropertyID,
		e.ParentID,
	)
	if err != nil {
		h.logger.Log(
			h.ctx,
			slog.LevelError,
			fmt.Sprintf("Error while retrieving property children: %s", err.Error()),
		)
		return err
	}

	// 1. Check document type

	docTypePtr, err := h.docClient.GetParentDocumentTypeByID(
		h.ctx,
		e.ParentDocumentID,
	)
	if err != nil {
		h.logger.Log(
			h.ctx,
			slog.LevelError,
			fmt.Sprintf("Error while retrieving parent document type: %s", err.Error()),
		)
		return err
	}
	if docTypePtr == nil {
		err = errors.New("Document type cannot be null!")
		h.logger.Log(
			h.ctx,
			slog.LevelError,
			fmt.Sprintf("Error while retrieving parent document type: %s", err.Error()),
		)
		return err
	}

	// 2. Get point value from requirements by document type and increment

	docType := *docTypePtr

	pointValuePtr, err := h.propertySvc.GetPropertyParentDocRequirementPointValueByDocType(
		h.ctx,
		propertyID,
		string(docType),
	)
	if err != nil {
		h.logger.Log(
			h.ctx,
			slog.LevelError,
			fmt.Sprintf(
				"Error while retrieving point value for required document type: %s",
				err.Error(),
			),
		)
		return err
	}

	pointValue := *pointValuePtr

	// TODO: BATCH UPDATE TO SAVE ON DB ROUNDTRIPS
	var (
		wg      sync.WaitGroup
		mu      sync.Mutex
		allErrs []error
	)
	for _, pC := range *propertyChildren {
		wg.Add(1)
		go func(pC PropertyChild) {
			defer wg.Done()
			if err := h.propertySvc.IncrementPropertyChildPoints(context.Background(), propertyID, pC.ChildID, pointValue); err != nil {
				h.logger.Log(
					h.ctx,
					slog.LevelError,
					fmt.Sprintf(
						"Error while incrementing property %v child %v points: %s",
						pC.PropertyID,
						pC.ChildID,
						err.Error()),
				)
				mu.Lock()
				allErrs = append(allErrs, err)
				mu.Unlock()
			}
		}(pC)
	}
	wg.Wait()
	if len(allErrs) != 0 {
		return errors.Join(allErrs...)
	}

	h.logger.Log(h.ctx, slog.LevelInfo, "Event processed successfully!")
	return nil
}
