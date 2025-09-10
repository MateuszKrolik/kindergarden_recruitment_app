import { COMPLIANCE_EVENTS } from "@/data-access-layer/shared/events/compliance";
import { EventEnvelope } from "@/data-access-layer/shared/types/event";
import { EventEmitter } from "stream";
import { PropertyParentDocument } from "../compliance/model";
import eventEmitter from "@/data-access-layer/eventEmitter";

export interface IPropertyManagementEventHandler {
  handlePropertyParentDocumentRequestApprovedEvent(): Promise<void>;
}

class PropertyManagementEventHandler
  implements IPropertyManagementEventHandler {
  constructor(private eventEmitter: EventEmitter) {
    this.handlePropertyParentDocumentRequestApprovedEvent();
  }

  async handlePropertyParentDocumentRequestApprovedEvent(): Promise<void> {
    this.eventEmitter.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
      async (event: EventEnvelope<PropertyParentDocument>) => {
        console.log("Received event:", event);
        //TODO: Check if child has points assigned due to this event and reject if not, else assign
      },
    );
  }
}

const propertyManagementEventHandler = new PropertyManagementEventHandler(
  eventEmitter,
);
export default propertyManagementEventHandler;
