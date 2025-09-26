import { COMPLIANCE_EVENTS } from "shared/events/modules/compliance.ts";
import type { EventEnvelope } from "shared/types/event.ts";
import type { PropertyParentDocument } from "shared/types/modules/compliance.ts";
import type { Server as SocketServer } from "socket.io";
import type { IPropertyManagementSvc } from "./svc.ts";
import type { RedisClientType } from "../../db/redis-client.ts";
import { catchErrorSync, formatAggregateError } from "shared/utils/error.ts";
import type { IReportingClient } from "./client.ts";
import { PROPERTY_MANAGEMENT_EVENTS } from "shared/events/modules/property-management.ts";
import { type Logger } from "winston";

export interface IPropertyManagementEventHandler {
  handlePropertyParentDocumentRequestApprovedEvent(): Promise<void>;
}

export class PropertyManagementEventHandler
  implements IPropertyManagementEventHandler {
  private svc: IPropertyManagementSvc;
  private reportingClient: IReportingClient;
  private redisSubscriber: RedisClientType;
  private socketServer: SocketServer;
  private logger: Logger;
  constructor(
    svc: IPropertyManagementSvc,
    reportingClient: IReportingClient,
    redisSubscriber: RedisClientType,
    socketServer: SocketServer,
    logger: Logger,
  ) {
    this.svc = svc;
    this.reportingClient = reportingClient;
    this.redisSubscriber = redisSubscriber;
    this.socketServer = socketServer;
    this.handlePropertyParentDocumentRequestApprovedEvent();
    this.logger = logger.child({
      service: "property-management-event-handler",
    });
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
          this.logger.error(parseError);
          return;
        }
        const event: EventEnvelope<PropertyParentDocument> = data;
        this.logger.log(
          "info",
          `Received event:\n${JSON.stringify(event, null, 2)}`,
        );

        const { data: documentType, error: documentTypeError } =
          await this.reportingClient.getParentDocumentTypeByDocumentId(
            event.payload.parent_document_id,
          );
        if (documentTypeError) {
          this.logger.error(documentTypeError);
          return;
        }
        if (!documentType) {
          this.logger.error(
            new Error(
              `No document type found for: ${event.payload.parent_document_id}!`,
            ),
          );
          return;
        }

        const promiseResults = await Promise.all([
          this.svc.getPointValueForGivenPropertyParentDocumentByDocumentType(
            event.payload.property_id,
            documentType,
          ),
          this.svc.getAllPropertyChildrenForGivenParent(
            event.payload.property_id,
            event.payload.user_id,
          ),
        ]);

        const errors = promiseResults
          .map((result) => result.error?.message)
          .filter((error) => error !== undefined);
        if (errors.length > 0) {
          const errMsg = formatAggregateError(errors);
          this.logger.error(new Error(errMsg));
          return;
        }
        const [pointValueResult, propertyChildrenResult] = promiseResults;
        const pointValue = pointValueResult.data ?? 0;
        const propertyChildren = propertyChildrenResult.data ?? [];

        const childrenIds = propertyChildren?.map((x) => x.child_id);
        const { data: incrementData, error: incrementError } =
          await this.svc.incrementPropertyChildrenPointsForGivenParent(
            event.payload.property_id,
            event.payload.user_id,
            childrenIds ?? [],
            pointValue,
          );
        if (incrementError) {
          this.logger.error(incrementError);
          return;
        }
        // Emit to socket listeners only if all above pass
        this.socketServer?.emit(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          event,
        );
        this.socketServer.emit(
          PROPERTY_MANAGEMENT_EVENTS.PROPERTY_CHILDREN_UPDATED,
          incrementData,
        );
      },
    );
  }
}
