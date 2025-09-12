import { COMPLIANCE_EVENTS } from "@/data-access-layer/shared/events/compliance";
import { EventEnvelope } from "@/data-access-layer/shared/types/event";
import { EventEmitter } from "stream";
import { PropertyParentDocument } from "../compliance/model";
import eventEmitter from "@/data-access-layer/eventEmitter";
import { Server as SocketServer } from "socket.io";
import { getSocketServer } from "@/socketServer";

export interface IPropertyManagementEventHandler {
  handlePropertyParentDocumentRequestApprovedEvent(): Promise<void>;
}

class PropertyManagementEventHandler
  implements IPropertyManagementEventHandler {
  constructor(private eventEmitter: EventEmitter, private socketServer: SocketServer | null = null) {
    this.handlePropertyParentDocumentRequestApprovedEvent();
  }

  async handlePropertyParentDocumentRequestApprovedEvent(): Promise<void> {
    this.eventEmitter.on(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
      async (event: EventEnvelope<PropertyParentDocument>) => {
        console.log("Received event:", event);
        // 1. Run validations
        // 2. Perform DB operations
        // 3. Only if all succeed, emit to websocket clients
        if (!this.socketServer) this.initSocketServer()
        this.socketServer?.emit(COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED, event)
      },
    );
  }

  private initSocketServer() {
    const socketServer = getSocketServer();
    if (!socketServer) return
    this.socketServer = socketServer
  }
}

const propertyManagementEventHandler = new PropertyManagementEventHandler(eventEmitter);
export default propertyManagementEventHandler;
