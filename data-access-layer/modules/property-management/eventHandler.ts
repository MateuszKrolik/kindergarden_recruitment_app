import { COMPLIANCE_EVENTS } from "../../shared/events/compliance.ts";
import type { EventEnvelope } from "../../shared/types/event.ts";
import type { PropertyParentDocument } from "../compliance/model.ts";
import type { Server as SocketServer } from "socket.io";
import type { IPropertyManagementSvc } from "./svc.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import { catchErrorSync } from "../../shared/util/error.ts";

export interface IPropertyManagementEventHandler {
  handlePropertyParentDocumentRequestApprovedEvent(): Promise<void>;
}

export class PropertyManagementEventHandler
  implements IPropertyManagementEventHandler {
  private svc: IPropertyManagementSvc;
  private redisSubscriber: RedisClientType;
  private socketServer: SocketServer;
  constructor(
    svc: IPropertyManagementSvc,
    redisSubscriber: RedisClientType,
    socketServer: SocketServer,
  ) {
    this.svc = svc;
    this.redisSubscriber = redisSubscriber;
    this.socketServer = socketServer;
    this.handlePropertyParentDocumentRequestApprovedEvent();
  }

  async handlePropertyParentDocumentRequestApprovedEvent(): Promise<void> {
    this.redisSubscriber.subscribe(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
      async (message: string) => {
        //TODO: idempotent consumer outbox table
        const { data, error: parseError } = catchErrorSync(() =>
          JSON.parse(message),
        );
        if (parseError) {
          console.error(parseError);
          return;
        }
        const event: EventEnvelope<PropertyParentDocument> = data;
        console.log("Received event:", event);
        const { data: propertyChildren, error: error } =
          await this.svc.getAllPropertyChildrenForGivenParent(
            event.payload.property_id,
            event.payload.user_id,
          );
        if (error) {
          console.error(error);
          return;
        }
        const childrenIds = propertyChildren?.map((x) => x.child_id);
        const { error: incrementError } =
          await this.svc.incrementPropertyChildrenPointsForGivenParent(
            event.payload.property_id,
            event.payload.user_id,
            childrenIds ?? [],
            5, // DUMMY HARDCODE (TODO: Get point value for given property document)
          );
        if (incrementError) {
          console.error(incrementError);
          return;
        }
        // Emit to socket listeners only if all above pass
        this.socketServer?.emit(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          event,
        );
      },
    );
  }
}
