import { type RedisClientType } from "../../db/redis-client.ts";
import {
  type PropertyParentDocument,
  REQUEST_STATUS,
  type RequestStatus,
} from "shared/types/modules/compliance.ts";
import { type IComplianceRepo } from "./repo.ts";
import type { PagedResponse } from "shared/types/pagination.ts";
import { COMPLIANCE_EVENTS } from "shared/events/modules/compliance.ts";
import { createEvent } from "shared/utils/event.ts";
import type { Server as SocketServer } from "socket.io";
import type { ApiResponse } from "shared/types/response.ts";
import { Logger } from "winston";
import type { IIdentityClient } from "./client.ts";

export interface IComplianceSvc {
  getAllDocumentApprovalRequestsForGivenProperty(
    propertyId: string,
    pageSize: number,
    pageNumber: number,
  ): ApiResponse<PagedResponse<PropertyParentDocument>>;
  getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]>;
  getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument>;
  sendPropertyParentDocumentApprovalRequest(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<PropertyParentDocument>;
  setPropertyParentDocumentRequestStatus(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
    requestStatus: RequestStatus,
    adminId: string,
  ): ApiResponse<PropertyParentDocument>;
  isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<boolean>;
}

export class ComplianceSvc implements IComplianceSvc {
  private redisClient: RedisClientType;
  private socketServer: SocketServer;
  private repo: IComplianceRepo;
  private logger: Logger;
  private identityClient: IIdentityClient;
  constructor(
    repo: IComplianceRepo,
    redisClient: RedisClientType,
    socketServer: SocketServer,
    logger: Logger,
    identityClient: IIdentityClient,
  ) {
    this.redisClient = redisClient;
    this.socketServer = socketServer;
    this.repo = repo;
    this.logger = logger.child({
      service: "compliance-svc",
    });
    this.identityClient = identityClient;
  }

  async getAllDocumentApprovalRequestsForGivenPropertyParent(
    propertyId: string,
    userId: string,
  ): ApiResponse<PropertyParentDocument[]> {
    return await this.repo.getAllDocumentApprovalRequestsForGivenPropertyParent(
      propertyId,
      userId,
    );
  }

  async getPropertyParentDocumentApprovalRequestByDocumentId(
    propertyId: string,
    userId: string,
    parentDocId: string,
  ): ApiResponse<PropertyParentDocument> {
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
  ): ApiResponse<PropertyParentDocument> {
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
  ): ApiResponse<PagedResponse<PropertyParentDocument>> {
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
  ): ApiResponse<PropertyParentDocument> {
    const { data: isAdmin, error: isAdminError } =
      await this.identityClient.isPropertyAdmin(propertyId, adminId);
    if (isAdminError) {
      this.logger.error(new Error(isAdminError.message));
      return { data: undefined, error: isAdminError };
    }
    if (!isAdmin)
      return {
        data: undefined,
        error: {
          code: 403,
          message: "Insufficient permissions - required role: 'admin'!",
        },
      };
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
        const eventBody = JSON.stringify(
          createEvent(
            COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
            "compliance",
            "1.0",
            data,
          ),
          null,
          2,
        );
        this.logger.log(
          "info",
          `Emitting event: ${COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED}\nEvent Body: ${eventBody}`,
        );
        this.redisClient.publish(
          COMPLIANCE_EVENTS.PROPERTY_PARENT_DOCUMENT_APPROVED,
          eventBody,
        );
      //TODO: Rejected
    }
    return { data: data, error: undefined };
  }

  async isPropertyParentDocumentRequestApproved(
    propertyId: string,
    userId: string,
    parentDocumentId: string,
  ): ApiResponse<boolean> {
    return await this.repo.isPropertyParentDocumentRequestApproved(
      propertyId,
      userId,
      parentDocumentId,
    );
  }
}
