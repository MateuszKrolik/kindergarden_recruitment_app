import { type RedisClientType } from "../../db/redis-client.ts";
import {
  type PropertyParentDocument,
  REQUEST_STATUS,
  type RequestStatus,
} from "shared/types/modules/compliance.ts";
import { type IComplianceRepo } from "./repo.ts";
import type { PagedResponse } from "../../shared/types/pagination.ts";
import { COMPLIANCE_EVENTS } from "shared/events/modules/compliance.ts";
import { createEvent } from "../../shared/types/event.ts";
import type { Server as SocketServer } from "socket.io";
import type { AsyncResponseType } from "../../shared/types/response.ts";

export interface IComplianceSvc {
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<PropertyParentDocument>>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyParentDocument[]>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): AsyncResponseType<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<PropertyParentDocument>;
  setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): AsyncResponseType<PropertyParentDocument>;
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<boolean>;
}

export class ComplianceSvc implements IComplianceSvc {
  private redisClient: RedisClientType;
  private socketServer: SocketServer;
  private repo: IComplianceRepo;
  constructor(
    repo: IComplianceRepo,
    redisClient: RedisClientType,
    socketServer: SocketServer,
  ) {
    this.redisClient = redisClient;
    this.socketServer = socketServer;
    this.repo = repo;
  }

  async getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): AsyncResponseType<PropertyParentDocument[]> {
    return await this.repo.getAllDocumentApprovalRequestsForGivenPropertyParent(
      propertyId,
      userId,
    );
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): AsyncResponseType<PropertyParentDocument> {
    return await this.repo.getPropertyParentDocumentApprovalRequestByDocumentId(
      propertyId,
      userId,
      parentDocId,
    );
  }

  async sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<PropertyParentDocument> {
    const { data, error } =
      await this.repo.sendPropertyParentDocumentApprovalRequest(
        propertyId,
        userId,
        parentDocumentId,
      );
    if (error) return { data: undefined, error: error };

    this.socketServer.emit(
      COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_REQUESTED,
      data,
    );

    return { data, error: undefined };
  }

  async getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): AsyncResponseType<PagedResponse<PropertyParentDocument>> {
    return await this.repo.getAllDocumentApprovalRequestsForGivenProperty(
      propertyId,
      pageSize,
      pageNumber,
    );
  }

  async setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): AsyncResponseType<PropertyParentDocument> {
    const { data, error } =
      await this.repo.setPropertyParentDocumentRequestStatus(
        propertyId,
        userId,
        parentDocumentId,
        requestStatus,
        adminId,
      );
    if (error) return { data: undefined, error: error };
    switch (requestStatus) {
      case REQUEST_STATUS.APPROVED:
        console.log("Emitting event...");
        this.redisClient.publish(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          JSON.stringify(
            createEvent(
              COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
              "compliance",
              "1.0",
              data,
            ),
          ),
        );
      //TODO: Rejected
    }
    return { data: data, error: undefined };
  }

  async isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): AsyncResponseType<boolean> {
    return await this.repo.isPropertyParentDocumentRequestApproved(
      propertyId,
      userId,
      parentDocumentId,
    );
  }
}
